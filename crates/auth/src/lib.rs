//! API keys, users and tiers (spec §11): `vx_live_*`/`vx_test_*` keys and
//! GitHub-OAuth user accounts stored as rows in SQLite via SeaORM, tier
//! lookup, per-key origin allowlists, browser sessions, and usage metering.
//!
//! The store is a thin SeaORM layer over one SQLite database — every query
//! goes through the entity API (ActiveModel/find/insert/update); no raw SQL
//! anywhere. Schema is derived from the entity on open, so a fresh data
//! directory bootstraps itself, and columns added later are best-effort
//! `ALTER TABLE`s (sea_query AST, still no raw SQL) for pre-existing files.

use std::path::Path;
use std::sync::Mutex;

use sea_orm::ActiveValue::Set;
use sea_orm::{ColumnTrait, ConnectionTrait, DatabaseConnection, EntityTrait, QueryFilter, Schema};
use sha2::{Digest, Sha256};
use vexillum_core::Error;

pub mod github;

pub use github::{GithubOAuth, GithubProfile};

/// Browser session lifetime: 30 days.
pub const SESSION_TTL_MS: u64 = 30 * 24 * 60 * 60 * 1000;
/// Cookie name the API sets for dashboard sessions.
pub const SESSION_COOKIE: &str = "vx_session";

/// Subscription tiers (spec §11.2). Two plans, no enterprise theater.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Tier {
    Free,
    Pro,
}

impl Tier {
    /// Requests per minute by tier.
    pub const fn rpm(self) -> u32 {
        match self {
            Self::Free => 60,
            Self::Pro => 600,
        }
    }

    /// Concurrent renders by tier.
    pub const fn render_concurrency(self) -> u32 {
        match self {
            Self::Free => 1,
            Self::Pro => 2,
        }
    }

    /// Cache TTL floor in seconds (spec §11.2).
    pub const fn cache_floor_secs(self) -> u64 {
        match self {
            Self::Free => 3600,
            Self::Pro => 60,
        }
    }

    /// Allowed formats per tier (animated GIF/WebP/APNG are Pro).
    pub fn allows(&self, format: vexillum_core::Format) -> bool {
        match (self, format) {
            (_, vexillum_core::Format::Svg)
            | (_, vexillum_core::Format::Png)
            | (_, vexillum_core::Format::Jpeg) => true,
            (Tier::Free, _) => false,
            _ => true,
        }
    }

    pub fn as_str(self) -> &'static str {
        match self {
            Self::Free => "free",
            Self::Pro => "pro",
        }
    }

    pub fn parse(s: &str) -> Result<Self, Error> {
        match s {
            "free" => Ok(Self::Free),
            "pro" => Ok(Self::Pro),
            other => Err(Error::BadRequest(format!("unknown tier '{other}'"))),
        }
    }
}

/// An API key record.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiKey {
    /// SHA-256 of the plaintext key (hex) — the record's identity.
    pub key_hash: String,
    /// Human label ("acme-ci").
    pub label: String,
    pub tier: Tier,
    /// Stripe customer id when the key is paid.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub customer_id: Option<String>,
    /// Hosts (`host[:port]`, lowercase) this key may render from. Browsers
    /// send Origin/Referer on cross-site image loads; keyed requests carrying
    /// a host outside this list are rejected with 403 so a leaked key cannot
    /// be spent from someone else's site. Empty = allowed from anywhere.
    #[serde(default)]
    pub allowed_origins: Vec<String>,
    #[serde(default)]
    pub created_ms: u64,
    /// Key family shown in the dashboard ("live" | "test").
    #[serde(default)]
    pub env: String,
    /// Owning dashboard user (`users.id`) when the key was created through
    /// the session-authenticated account routes; None for CLI-provisioned keys.
    #[serde(default)]
    pub owner_id: Option<String>,
}

impl ApiKey {
    pub fn env(&self) -> &str {
        if self.env == "test" { "test" } else { "live" }
    }

    /// Short display identity (first 12 hash chars) — what the dashboard shows.
    pub fn id(&self) -> String {
        self.key_hash[..12].to_string()
    }
}

/// SeaORM entity: the `api_keys` table.
pub mod api_keys {
    use sea_orm::entity::prelude::*;

    #[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
    #[sea_orm(table_name = "api_keys")]
    pub struct Model {
        #[sea_orm(primary_key, auto_increment = false, column_name = "key_hash")]
        pub key_hash: String,
        pub label: String,
        /// "free" | "pro" (Tier::as_str).
        pub tier: String,
        pub customer_id: Option<String>,
        /// JSON array of allowed hosts — serde owns the encoding, SeaORM owns
        /// the query (no raw SQL on either side).
        pub allowed_origins: String,
        pub created_ms: i64,
        /// "live" | "test"; legacy rows carry NULL → treated as "live".
        pub env: Option<String>,
        pub owner_id: Option<String>,
    }

    #[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
    pub enum Relation {}

    impl ActiveModelBehavior for ActiveModel {}
}

/// A dashboard user, provisioned by the GitHub OAuth callback.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    /// Stable id — the GitHub account id as a string.
    pub id: String,
    /// GitHub handle (`@octocat`), unique.
    pub login: String,
    pub name: Option<String>,
    pub email: Option<String>,
    pub avatar_url: Option<String>,
    pub tier: Tier,
    #[serde(default)]
    pub created_ms: u64,
}

/// SeaORM entity: the `users` table.
pub mod users {
    use sea_orm::entity::prelude::*;

    #[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
    #[sea_orm(table_name = "users")]
    pub struct Model {
        #[sea_orm(primary_key, auto_increment = false, column_name = "id")]
        pub id: String,
        pub login: String,
        pub name: Option<String>,
        pub email: Option<String>,
        pub avatar_url: Option<String>,
        /// "free" | "pro".
        pub tier: String,
        pub created_ms: i64,
    }

    #[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
    pub enum Relation {}

    impl ActiveModelBehavior for ActiveModel {}
}

/// A browser session — the server-side half of the `vx_session` cookie.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Session {
    /// SHA-256 of the cookie token (hex) — the record's identity.
    pub token_hash: String,
    pub user_id: String,
    pub created_ms: u64,
    pub expires_ms: u64,
}

/// SeaORM entity: the `sessions` table.
pub mod sessions {
    use sea_orm::entity::prelude::*;

    #[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
    #[sea_orm(table_name = "sessions")]
    pub struct Model {
        #[sea_orm(primary_key, auto_increment = false, column_name = "token_hash")]
        pub token_hash: String,
        pub user_id: String,
        pub created_ms: i64,
        pub expires_ms: i64,
    }

    #[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
    pub enum Relation {}

    impl ActiveModelBehavior for ActiveModel {}
}

/// SHA-256 of a session token (hex).
pub fn session_token_hash(token: &str) -> String {
    hex::encode(Sha256::digest(token.as_bytes()))
}

/// Generates a new plaintext key with the given prefix.
pub fn generate_key(kind: &str) -> String {
    let mut bytes = [0u8; 24];
    fill_random(&mut bytes);
    let mut text = String::with_capacity(48);
    for b in bytes {
        text.push(BASE62[b as usize % 62] as char);
    }
    format!("vx_{kind}_{text}")
}

/// Generates a random opaque session token (48 base62 chars).
pub fn generate_session_token() -> String {
    let mut bytes = [0u8; 48];
    fill_random(&mut bytes);
    let mut text = String::with_capacity(48);
    for b in bytes {
        text.push(BASE62[b as usize % 62] as char);
    }
    text
}

const BASE62: &[u8; 62] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

fn fill_random(buf: &mut [u8]) {
    // getrandom is pulled in transitively via sqlx; use /dev/urandom directly
    use std::io::Read;
    let mut f = std::fs::File::open("/dev/urandom").expect("urandom");
    f.read_exact(buf).expect("urandom read");
}

/// SHA-256 of a plaintext key (hex), the storage/lookup identity.
pub fn key_hash(plaintext: &str) -> String {
    hex::encode(Sha256::digest(plaintext.as_bytes()))
}

/// Key store over SQLite (SeaORM). Cheap to clone — the connection is an Arc.
#[derive(Clone)]
pub struct AuthStore {
    db: DatabaseConnection,
}

fn origins_to_json(origins: &[String]) -> String {
    serde_json::to_string(origins).unwrap_or_else(|_| "[]".into())
}

fn origins_from_json(json: &str) -> Vec<String> {
    serde_json::from_str(json).unwrap_or_default()
}

fn db_err<E: std::fmt::Display>(e: E) -> Error {
    Error::Render(format!("auth db: {e}"))
}

impl AuthStore {
    /// Opens (and bootstraps) the key store. All tables derive from the
    /// entity definitions — schema-as-code, no migrations, no raw SQL.
    /// Columns added to the entities after a database file exists are picked
    /// up by a best-effort sea_query `ALTER TABLE` (errors ignored: the
    /// common case is the column already being there).
    pub async fn open(path: &Path) -> Result<Self, Error> {
        if let Some(dir) = path.parent() {
            std::fs::create_dir_all(dir).map_err(|e| Error::Render(format!("auth dir: {e}")))?;
        }
        let url = format!("sqlite://{}?mode=rwc", path.display());
        let db = sea_orm::Database::connect(&url).await.map_err(db_err)?;
        let schema = Schema::new(sea_orm::DbBackend::Sqlite);
        for mut create in [
            schema.create_table_from_entity(api_keys::Entity),
            schema.create_table_from_entity(users::Entity),
            schema.create_table_from_entity(sessions::Entity),
        ] {
            let create = create.if_not_exists().to_owned();
            db.execute(&create).await.map_err(db_err)?;
        }
        let store = Self { db };
        store.backfill_column(&api_keys::Entity, "owner_id").await;
        store.backfill_column(&api_keys::Entity, "env").await;
        Ok(store)
    }

    /// Adds `column` to `table` when a database created by an older build is
    /// missing it. Built as a sea_query alter (no raw SQL); "already exists"
    /// and similar SQLite refusals are silently accepted.
    async fn backfill_column<E: EntityTrait>(&self, _entity: &E, column: &str) {
        let table = E::default().table_name().to_string();
        let alter = sea_orm::sea_query::Table::alter()
            .table(sea_orm::sea_query::Alias::new(&table))
            .add_column(
                sea_orm::sea_query::ColumnDef::new(sea_orm::sea_query::Alias::new(column))
                    .text()
                    .null(),
            )
            .to_owned();
        let _ = self.db.execute(&alter).await;
    }

    /// Creates a key and returns the plaintext (shown once).
    pub async fn create_key(
        &self,
        label: &str,
        tier: Tier,
        customer_id: Option<String>,
        allowed_origins: Vec<String>,
        owner_id: Option<String>,
    ) -> Result<ApiKey, Error> {
        let kind = if customer_id.is_some() || owner_id.is_some() {
            "live"
        } else {
            "test"
        };
        let plaintext = generate_key(kind);
        let record = ApiKey {
            key_hash: key_hash(&plaintext),
            label: label.to_string(),
            tier,
            customer_id,
            allowed_origins,
            created_ms: now_ms(),
            env: kind.to_string(),
            owner_id,
        };
        self.put_record(&record).await?;
        Ok(record)
    }

    /// Stores (upserts) a key record — used by billing to upgrade tiers and
    /// by the origin editor.
    pub async fn put_record(&self, record: &ApiKey) -> Result<(), Error> {
        let row = api_keys::ActiveModel {
            key_hash: Set(record.key_hash.clone()),
            label: Set(record.label.clone()),
            tier: Set(record.tier.as_str().to_string()),
            customer_id: Set(record.customer_id.clone()),
            allowed_origins: Set(origins_to_json(&record.allowed_origins)),
            created_ms: Set(record.created_ms as i64),
            env: Set(Some(record.env().to_string())),
            owner_id: Set(record.owner_id.clone()),
        };
        api_keys::Entity::insert(row)
            .on_conflict(
                sea_orm::sea_query::OnConflict::column(api_keys::Column::KeyHash)
                    .update_columns([
                        api_keys::Column::Label,
                        api_keys::Column::Tier,
                        api_keys::Column::CustomerId,
                        api_keys::Column::AllowedOrigins,
                        api_keys::Column::CreatedMs,
                    ])
                    .to_owned(),
            )
            .exec(&self.db)
            .await
            .map_err(db_err)?;
        Ok(())
    }

    /// Resolves a plaintext bearer key to its record.
    pub async fn verify(&self, plaintext: &str) -> Result<Option<ApiKey>, Error> {
        let hash = key_hash(plaintext);
        Ok(self.by_hash(&hash).await?)
    }

    /// Resolves a key hash to its record.
    pub async fn by_hash(&self, key_hash_hex: &str) -> Result<Option<ApiKey>, Error> {
        let row = api_keys::Entity::find_by_id(key_hash_hex)
            .one(&self.db)
            .await
            .map_err(db_err)?;
        Ok(row.map(|m| ApiKey {
            key_hash: m.key_hash,
            label: m.label,
            tier: Tier::parse(&m.tier).unwrap_or(Tier::Free),
            customer_id: m.customer_id,
            allowed_origins: origins_from_json(&m.allowed_origins),
            created_ms: m.created_ms.max(0) as u64,
            env: m.env.unwrap_or_else(|| "live".into()),
            owner_id: m.owner_id,
        }))
    }

    /// Replaces a key's origin allowlist; returns the updated record.
    pub async fn set_allowed_origins(
        &self,
        key_hash_hex: &str,
        origins: Vec<String>,
    ) -> Result<Option<ApiKey>, Error> {
        let mut record = match self.by_hash(key_hash_hex).await? {
            Some(r) => r,
            None => return Ok(None),
        };
        record.allowed_origins = origins;
        self.put_record(&record).await?;
        Ok(Some(record))
    }

    /// Deletes a key.
    pub async fn revoke(&self, key_hash_hex: &str) -> Result<bool, Error> {
        let res = api_keys::Entity::delete_by_id(key_hash_hex)
            .exec(&self.db)
            .await
            .map_err(db_err)?;
        Ok(res.rows_affected > 0)
    }

    /// Deletes a key only when it belongs to `user_id` (owner-checked revoke).
    pub async fn revoke_owned(&self, user_id: &str, key_hash_hex: &str) -> Result<bool, Error> {
        let Some(record) = self.by_hash(key_hash_hex).await? else {
            return Ok(false);
        };
        if record.owner_id.as_deref() != Some(user_id) {
            return Ok(false);
        }
        self.revoke(key_hash_hex).await
    }

    // ---------------- users ----------------

    /// Inserts or refreshes a user row (login/profile/tier change on re-login).
    pub async fn upsert_user(&self, user: &User) -> Result<(), Error> {
        let row = users::ActiveModel {
            id: Set(user.id.clone()),
            login: Set(user.login.clone()),
            name: Set(user.name.clone()),
            email: Set(user.email.clone()),
            avatar_url: Set(user.avatar_url.clone()),
            tier: Set(user.tier.as_str().to_string()),
            created_ms: Set(user.created_ms as i64),
        };
        users::Entity::insert(row)
            .on_conflict(
                sea_orm::sea_query::OnConflict::column(users::Column::Id)
                    .update_columns([
                        users::Column::Login,
                        users::Column::Name,
                        users::Column::Email,
                        users::Column::AvatarUrl,
                        users::Column::Tier,
                    ])
                    .to_owned(),
            )
            .exec(&self.db)
            .await
            .map_err(db_err)?;
        Ok(())
    }

    /// Resolves a user row into the typed record.
    fn user_from(m: users::Model) -> User {
        User {
            id: m.id,
            login: m.login,
            name: m.name,
            email: m.email,
            avatar_url: m.avatar_url,
            tier: Tier::parse(&m.tier).unwrap_or(Tier::Free),
            created_ms: m.created_ms.max(0) as u64,
        }
    }

    pub async fn user_by_id(&self, id: &str) -> Result<Option<User>, Error> {
        let row = users::Entity::find_by_id(id)
            .one(&self.db)
            .await
            .map_err(db_err)?;
        Ok(row.map(Self::user_from))
    }

    /// Updates a user's plan tier (billing hook).
    pub async fn set_user_tier(&self, user_id: &str, tier: Tier) -> Result<bool, Error> {
        let m = match users::Entity::find_by_id(user_id)
            .one(&self.db)
            .await
            .map_err(db_err)?
        {
            Some(m) => m,
            None => return Ok(false),
        };
        let row = users::ActiveModel {
            id: Set(m.id),
            login: Set(m.login),
            name: Set(m.name),
            email: Set(m.email),
            avatar_url: Set(m.avatar_url),
            tier: Set(tier.as_str().to_string()),
            created_ms: Set(m.created_ms),
        };
        users::Entity::update(row)
            .exec(&self.db)
            .await
            .map_err(db_err)?;
        Ok(true)
    }

    // ---------------- sessions ----------------

    /// Creates a session for `user_id`; returns the cookie plaintext (stored
    /// server-side as a SHA-256 hash only).
    pub async fn create_session(&self, user_id: &str) -> Result<String, Error> {
        let token = generate_session_token();
        let now = now_ms();
        let row = sessions::ActiveModel {
            token_hash: Set(session_token_hash(&token)),
            user_id: Set(user_id.to_string()),
            created_ms: Set(now as i64),
            expires_ms: Set((now + SESSION_TTL_MS) as i64),
        };
        sessions::Entity::insert(row)
            .exec(&self.db)
            .await
            .map_err(db_err)?;
        Ok(token)
    }

    /// Resolves a cookie token to its user, deleting the row when expired.
    pub async fn session_user(&self, token: &str) -> Result<Option<User>, Error> {
        let hash = session_token_hash(token);
        let row = sessions::Entity::find_by_id(&hash)
            .one(&self.db)
            .await
            .map_err(db_err)?;
        let Some(s) = row else { return Ok(None) };
        if (s.expires_ms as u64) <= now_ms() {
            let _ = sessions::Entity::delete_by_id(&hash).exec(&self.db).await;
            return Ok(None);
        }
        self.user_by_id(&s.user_id).await
    }

    /// Deletes a session (logout). Returns true when a row was removed.
    pub async fn delete_session(&self, token: &str) -> Result<bool, Error> {
        let res = sessions::Entity::delete_by_id(session_token_hash(token))
            .exec(&self.db)
            .await
            .map_err(db_err)?;
        Ok(res.rows_affected > 0)
    }

    // ---------------- per-user keys ----------------

    /// All keys owned by `user_id`, newest first.
    pub async fn keys_for_user(&self, user_id: &str) -> Result<Vec<ApiKey>, Error> {
        let rows = api_keys::Entity::find()
            .filter(api_keys::Column::OwnerId.eq(user_id))
            .all(&self.db)
            .await
            .map_err(db_err)?;
        let mut records: Vec<ApiKey> = rows
            .into_iter()
            .map(|m| ApiKey {
                key_hash: m.key_hash,
                label: m.label,
                tier: Tier::parse(&m.tier).unwrap_or(Tier::Free),
                customer_id: m.customer_id,
                allowed_origins: origins_from_json(&m.allowed_origins),
                created_ms: m.created_ms.max(0) as u64,
                env: m.env.unwrap_or_else(|| "live".into()),
                owner_id: m.owner_id,
            })
            .collect();
        records.sort_by(|a, b| b.created_ms.cmp(&a.created_ms));
        Ok(records)
    }

    /// Creates a key owned by a dashboard user, at the user's tier.
    pub async fn create_key_for_user(
        &self,
        user: &User,
        label: &str,
        env: &str,
    ) -> Result<(ApiKey, String), Error> {
        let kind = if env == "live" { "live" } else { "test" };
        let plaintext = generate_key(kind);
        let record = ApiKey {
            key_hash: key_hash(&plaintext),
            label: label.to_string(),
            tier: user.tier,
            customer_id: None,
            allowed_origins: vec![],
            created_ms: now_ms(),
            env: kind.to_string(),
            owner_id: Some(user.id.clone()),
        };
        self.put_record(&record).await?;
        Ok((record, plaintext))
    }
}

/// Fixed-window usage meter per key (in-memory; durable aggregation later).
/// Alongside the 60s rate window it keeps a UTC-day counter so the dashboard
/// can show real "requests today" numbers.
#[derive(Default)]
pub struct Meter {
    counts: Mutex<std::collections::HashMap<String, (u64, u64)>>, // key → (window_ms, count)
    daily: Mutex<std::collections::HashMap<String, (u64, u64)>>,  // key → (utc_day, count)
    last_seen: Mutex<std::collections::HashMap<String, u64>>,     // key → last hit ms
}

/// UTC day index for a millisecond timestamp (days since epoch).
fn utc_day(now_ms: u64) -> u64 {
    now_ms / 86_400_000
}

impl Meter {
    pub fn new() -> Self {
        Self::default()
    }

    /// Records a hit; returns true when within the window's allowance.
    /// Every hit also bumps the day counter for the key.
    pub fn hit(&self, key: &str, limit_per_minute: u32, now_ms: u64) -> bool {
        {
            let mut counts = self.counts.lock().unwrap_or_else(|e| e.into_inner());
            let entry = counts.entry(key.to_string()).or_insert((now_ms, 0));
            // 60s fixed window
            if now_ms.saturating_sub(entry.0) >= 60_000 {
                *entry = (now_ms, 0);
            }
            entry.1 += 1;
            if entry.1 > limit_per_minute as u64 {
                return false;
            }
        }
        self.bump_daily(key, now_ms);
        self.last_seen
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .insert(key.to_string(), now_ms);
        true
    }

    /// Bumps the UTC-day counter for a key (also used by routes that count
    /// usage without rate-limiting).
    pub fn bump_daily(&self, key: &str, now_ms: u64) -> u64 {
        let day = utc_day(now_ms);
        let mut daily = self.daily.lock().unwrap_or_else(|e| e.into_inner());
        let entry = daily.entry(key.to_string()).or_insert((day, 0));
        if entry.0 != day {
            *entry = (day, 0);
        }
        entry.1 += 1;
        entry.1
    }

    pub fn count(&self, key: &str) -> u64 {
        self.counts
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get(key)
            .map(|(_, c)| *c)
            .unwrap_or(0)
    }

    /// Requests recorded today (UTC day) for a key. Usage that predates the
    /// current day rolls off automatically.
    pub fn daily_count(&self, key: &str, now_ms: u64) -> u64 {
        let day = utc_day(now_ms);
        self.daily
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get(key)
            .filter(|(d, _)| *d == day)
            .map(|(_, c)| *c)
            .unwrap_or(0)
    }

    /// Epoch ms of the key's most recent successful hit, if any.
    pub fn last_used(&self, key: &str) -> Option<u64> {
        self.last_seen
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get(key)
            .copied()
    }
}

fn now_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    async fn store() -> AuthStore {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("vexillum.db");
        // leak the tempdir for the lifetime of the store (test scope)
        std::mem::forget(dir);
        AuthStore::open(&path).await.unwrap()
    }

    #[tokio::test]
    async fn key_format_and_hashing() {
        let key = generate_key("live");
        assert!(key.starts_with("vx_live_"));
        assert_eq!(key.len(), "vx_live_".len() + 24);
        let test_key = generate_key("test");
        assert!(test_key.starts_with("vx_test_"));
        let h = key_hash(&key);
        assert_eq!(h.len(), 64);
        assert_eq!(h, key_hash(&key));
        assert_ne!(h, key_hash(&test_key));
    }

    #[tokio::test]
    async fn create_and_verify_roundtrip() {
        let s = store().await;
        let created = s
            .create_key("acme", Tier::Pro, None, vec!["github.com".into()], None)
            .await
            .unwrap();
        assert_eq!(created.tier, Tier::Pro);
        // a random key must not resolve
        assert!(s.verify(&generate_key("live")).await.unwrap().is_none());
        // the stored record resolves by hash with origins intact
        let verified = s.by_hash(&created.key_hash).await.unwrap().unwrap();
        assert_eq!(verified.label, "acme");
        assert_eq!(verified.allowed_origins, vec!["github.com".to_string()]);
        assert!(s.verify("vx_test_wrong").await.unwrap().is_none());
    }

    #[tokio::test]
    async fn origins_roundtrip_and_update() {
        let s = store().await;
        let k = generate_key("live");
        s.put_record(&ApiKey {
            key_hash: key_hash(&k),
            label: "orig".into(),
            tier: Tier::Free,
            customer_id: None,
            allowed_origins: vec![],
            created_ms: 0,
            env: "live".into(),
            owner_id: None,
        })
        .await
        .unwrap();
        let hash = key_hash(&k);
        let updated = s
            .set_allowed_origins(&hash, vec!["gitlab.com".into(), "app.acme.dev:8080".into()])
            .await
            .unwrap()
            .unwrap();
        assert_eq!(updated.allowed_origins.len(), 2);
        assert_eq!(
            s.by_hash(&hash).await.unwrap().unwrap().allowed_origins,
            updated.allowed_origins
        );
        assert!(
            s.set_allowed_origins("nope", vec![])
                .await
                .unwrap()
                .is_none()
        );
    }

    #[tokio::test]
    async fn revoke_removes_key() {
        let s = store().await;
        let k = generate_key("test");
        s.put_record(&ApiKey {
            key_hash: key_hash(&k),
            label: "rev".into(),
            tier: Tier::Free,
            customer_id: None,
            allowed_origins: vec![],
            created_ms: 0,
            env: "live".into(),
            owner_id: None,
        })
        .await
        .unwrap();
        assert!(s.verify(&k).await.unwrap().is_some());
        assert!(s.revoke(&key_hash(&k)).await.unwrap());
        assert!(s.verify(&k).await.unwrap().is_none());
        assert!(!s.revoke(&key_hash(&k)).await.unwrap());
    }

    #[test]
    fn tier_matrix() {
        assert_eq!(Tier::Free.rpm(), 60);
        assert_eq!(Tier::Pro.cache_floor_secs(), 60);
        assert!(Tier::Free.allows(vexillum_core::Format::Svg));
        assert!(!Tier::Free.allows(vexillum_core::Format::Gif));
        assert!(Tier::Pro.allows(vexillum_core::Format::Gif));
        assert!(Tier::Pro.allows(vexillum_core::Format::WebP));
        assert!(Tier::Pro.allows(vexillum_core::Format::Apng));
        assert!(Tier::parse("pro").unwrap() == Tier::Pro);
        assert!(Tier::parse("vip").is_err());
        assert!(Tier::parse("team").is_err(), "team tier is gone");
    }

    #[test]
    fn meter_fixed_window() {
        let m = Meter::new();
        for _ in 0..5 {
            assert!(m.hit("k", 5, 1000));
        }
        assert!(!m.hit("k", 5, 2000));
        // window resets
        assert!(m.hit("k", 5, 61_000));
        assert_eq!(m.count("k"), 1);
    }

    #[test]
    fn meter_counts_today_and_rolls_off() {
        let m = Meter::new();
        for _ in 0..3 {
            assert!(m.hit("k", 60, 5_000_000));
        }
        assert_eq!(m.daily_count("k", 5_100_000), 3);
        // the next UTC day rolls the counter over
        assert_eq!(m.daily_count("k", 5_000_000 + 86_400_000), 0);
        // and a hit on the new day starts counting afresh
        assert!(m.hit("k", 60, 5_000_000 + 86_400_000 + 1));
        assert_eq!(m.daily_count("k", 5_000_000 + 86_400_000 + 2), 1);
    }

    #[tokio::test]
    async fn user_session_and_owned_keys() {
        let s = store().await;
        let user = User {
            id: "17583541".into(),
            login: "octocat".into(),
            name: Some("The Octocat".into()),
            email: Some("octo@example.dev".into()),
            avatar_url: Some("https://avatars.githubusercontent.com/u/17583541".into()),
            tier: Tier::Free,
            created_ms: now_ms(),
        };
        s.upsert_user(&user).await.unwrap();
        // upsert is idempotent and refreshes profile fields
        let mut renamed = user.clone();
        renamed.name = Some("Renamed".into());
        s.upsert_user(&renamed).await.unwrap();
        let fetched = s.user_by_id("17583541").await.unwrap().unwrap();
        assert_eq!(fetched.login, "octocat");
        assert_eq!(fetched.name.as_deref(), Some("Renamed"));
        assert!(s.user_by_id("missing").await.unwrap().is_none());

        // session roundtrip
        let token = s.create_session("17583541").await.unwrap();
        assert_eq!(token.len(), 48);
        assert_eq!(
            s.session_user(&token).await.unwrap().unwrap().id,
            "17583541"
        );
        assert!(s.session_user("bogus").await.unwrap().is_none());
        assert!(s.delete_session(&token).await.unwrap());
        assert!(s.session_user(&token).await.unwrap().is_none());
        assert!(!s.delete_session(&token).await.unwrap());

        // per-user keys: created at the user's tier, listed, owner-checked
        let (live, plaintext) = s
            .create_key_for_user(&fetched, "prod", "live")
            .await
            .unwrap();
        assert!(plaintext.starts_with("vx_live_"));
        assert_eq!(live.owner_id.as_deref(), Some("17583541"));
        assert_eq!(live.tier, Tier::Free);
        let (_test, test_plaintext) = s.create_key_for_user(&fetched, "ci", "test").await.unwrap();
        assert!(test_plaintext.starts_with("vx_test_"));
        let keys = s.keys_for_user("17583541").await.unwrap();
        assert_eq!(keys.len(), 2);
        let mut labels: Vec<&str> = keys.iter().map(|k| k.label.as_str()).collect();
        labels.sort_unstable();
        assert_eq!(labels, ["ci", "prod"]);
        assert!(keys.windows(2).all(|w| w[0].created_ms >= w[1].created_ms));
        // another user's key is invisible and cannot be revoked cross-user
        assert!(s.keys_for_user("999").await.unwrap().is_empty());
        assert!(!s.revoke_owned("999", &live.key_hash).await.unwrap());
        assert!(s.revoke_owned("17583541", &live.key_hash).await.unwrap());
        assert_eq!(s.keys_for_user("17583541").await.unwrap().len(), 1);
        // tier hook
        assert!(s.set_user_tier("17583541", Tier::Pro).await.unwrap());
        assert_eq!(
            s.user_by_id("17583541").await.unwrap().unwrap().tier,
            Tier::Pro
        );
        assert!(!s.set_user_tier("ghost", Tier::Pro).await.unwrap());
    }

    #[tokio::test]
    async fn legacy_db_gains_owner_id_column() {
        // a database created by the previous schema (no owner_id) still opens
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("legacy.db");
        std::fs::create_dir_all(dir.path().join("x")).unwrap();
        {
            let db = sea_orm::Database::connect(format!("sqlite://{}?mode=rwc", path.display()))
                .await
                .unwrap();
            // legacy table shape via sea_query AST (no raw SQL)
            let create = sea_orm::sea_query::Table::create()
                .table(sea_orm::sea_query::Alias::new("api_keys"))
                .col(
                    sea_orm::sea_query::ColumnDef::new(sea_orm::sea_query::Alias::new("key_hash"))
                        .text()
                        .primary_key(),
                )
                .col(
                    sea_orm::sea_query::ColumnDef::new(sea_orm::sea_query::Alias::new("label"))
                        .text(),
                )
                .col(
                    sea_orm::sea_query::ColumnDef::new(sea_orm::sea_query::Alias::new("tier"))
                        .text(),
                )
                .col(
                    sea_orm::sea_query::ColumnDef::new(sea_orm::sea_query::Alias::new(
                        "customer_id",
                    ))
                    .text()
                    .null(),
                )
                .col(
                    sea_orm::sea_query::ColumnDef::new(sea_orm::sea_query::Alias::new(
                        "allowed_origins",
                    ))
                    .text(),
                )
                .col(
                    sea_orm::sea_query::ColumnDef::new(sea_orm::sea_query::Alias::new(
                        "created_ms",
                    ))
                    .big_integer(),
                )
                .to_owned();
            db.execute(&create).await.unwrap();
        }
        std::mem::forget(dir);
        let s = AuthStore::open(&path).await.unwrap();
        let created = s
            .create_key("post-migrate", Tier::Free, None, vec![], Some("u1".into()))
            .await
            .unwrap();
        assert_eq!(created.owner_id.as_deref(), Some("u1"));
        assert_eq!(s.keys_for_user("u1").await.unwrap().len(), 1);
    }
}
