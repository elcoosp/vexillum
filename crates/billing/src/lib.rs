//! Stripe billing (spec §11.3): webhook signature verification, idempotent
//! event handling, and subscription state transitions that drive auth tiers.
//!
//! The store is a thin SeaORM layer over the same SQLite database the auth
//! store uses — every query goes through the entity API; no raw SQL.

pub mod webhook;

use std::path::Path;

use sea_orm::ActiveValue::Set;
use sea_orm::{ConnectionTrait, DbBackend, EntityTrait, Schema};
use sha2::{Digest, Sha256};
use vexillum_auth::{ApiKey, Tier};
use vexillum_core::Error;

/// Current subscription state for a Stripe customer.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Subscription {
    pub customer_id: String,
    /// Stripe subscription id (active subscription only).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub subscription_id: Option<String>,
    pub tier: Tier,
    /// ms timestamp of the last state change.
    pub updated_ms: u64,
}

/// SeaORM entity: the `subscriptions` table.
pub mod subscriptions {
    use sea_orm::entity::prelude::*;

    #[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
    #[sea_orm(table_name = "subscriptions")]
    pub struct Model {
        #[sea_orm(primary_key, auto_increment = false, column_name = "customer_id")]
        pub customer_id: String,
        pub subscription_id: Option<String>,
        /// "free" | "pro" (Tier::as_str).
        pub tier: String,
        pub updated_ms: i64,
    }

    #[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
    pub enum Relation {}

    impl ActiveModelBehavior for ActiveModel {}
}

/// SeaORM entity: the `webhook_events` table (idempotency ledger).
pub mod webhook_events {
    use sea_orm::entity::prelude::*;

    #[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
    #[sea_orm(table_name = "webhook_events")]
    pub struct Model {
        #[sea_orm(primary_key, auto_increment = false, column_name = "event_id")]
        pub event_id: String,
        pub processed_ms: i64,
    }

    #[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
    pub enum Relation {}

    impl ActiveModelBehavior for ActiveModel {}
}

/// Subscription store over SQLite (SeaORM), keyed by customer id.
#[derive(Clone)]
pub struct BillingStore {
    db: sea_orm::DatabaseConnection,
}

fn db_err<E: std::fmt::Display>(e: E) -> Error {
    Error::Render(format!("billing db: {e}"))
}

impl BillingStore {
    /// Opens (and bootstraps) the billing store on the shared SQLite file.
    /// Tables derive from the entity definitions — schema-as-code, no raw SQL.
    pub async fn open(path: &Path) -> Result<Self, Error> {
        if let Some(dir) = path.parent() {
            std::fs::create_dir_all(dir).map_err(|e| Error::Render(format!("billing dir: {e}")))?;
        }
        let url = format!("sqlite://{}?mode=rwc", path.display());
        let db = sea_orm::Database::connect(&url).await.map_err(db_err)?;
        let schema = Schema::new(DbBackend::Sqlite);
        for stmt in [
            schema
                .create_table_from_entity(subscriptions::Entity)
                .if_not_exists()
                .to_owned(),
            schema
                .create_table_from_entity(webhook_events::Entity)
                .if_not_exists()
                .to_owned(),
        ] {
            db.execute(&stmt).await.map_err(db_err)?;
        }
        Ok(Self { db })
    }

    /// Idempotency: true when the event id has NOT been seen before.
    pub async fn seen_event(&self, event_id: &str) -> Result<bool, Error> {
        let hit = webhook_events::Entity::find_by_id(event_id)
            .one(&self.db)
            .await
            .map_err(db_err)?;
        Ok(hit.is_none())
    }

    fn mark_event_sql(&self, event_id: &str) -> webhook_events::ActiveModel {
        webhook_events::ActiveModel {
            event_id: Set(event_id.to_string()),
            processed_ms: Set(now_ms() as i64),
        }
    }

    /// Applies a webhook event idempotently; returns false when the event
    /// was already processed.
    pub async fn apply_event(&self, event_id: &str, event: &Event) -> Result<bool, Error> {
        if !self.seen_event(event_id).await? {
            return Ok(false);
        }
        match event {
            Event::CheckoutCompleted { customer_id, tier } => {
                self.set_subscription(Subscription {
                    customer_id: customer_id.clone(),
                    subscription_id: None,
                    tier: *tier,
                    updated_ms: now_ms(),
                })
                .await?;
            }
            Event::SubscriptionUpdated {
                customer_id,
                subscription_id,
                tier,
            } => {
                self.set_subscription(Subscription {
                    customer_id: customer_id.clone(),
                    subscription_id: Some(subscription_id.clone()),
                    tier: *tier,
                    updated_ms: now_ms(),
                })
                .await?;
            }
            Event::SubscriptionDeleted { customer_id } => {
                self.remove_subscription(customer_id).await?;
            }
        }
        webhook_events::Entity::insert(self.mark_event_sql(event_id))
            .exec(&self.db)
            .await
            .map_err(db_err)?;
        Ok(true)
    }

    pub async fn set_subscription(&self, sub: Subscription) -> Result<(), Error> {
        let row = subscriptions::ActiveModel {
            customer_id: Set(sub.customer_id),
            subscription_id: Set(sub.subscription_id),
            tier: Set(sub.tier.as_str().to_string()),
            updated_ms: Set(sub.updated_ms as i64),
        };
        subscriptions::Entity::insert(row)
            .on_conflict(
                sea_orm::sea_query::OnConflict::column(subscriptions::Column::CustomerId)
                    .update_columns([
                        subscriptions::Column::SubscriptionId,
                        subscriptions::Column::Tier,
                        subscriptions::Column::UpdatedMs,
                    ])
                    .to_owned(),
            )
            .exec(&self.db)
            .await
            .map_err(db_err)?;
        Ok(())
    }

    pub async fn remove_subscription(&self, customer_id: &str) -> Result<bool, Error> {
        let res = subscriptions::Entity::delete_by_id(customer_id)
            .exec(&self.db)
            .await
            .map_err(db_err)?;
        Ok(res.rows_affected > 0)
    }

    pub async fn subscription(&self, customer_id: &str) -> Result<Option<Subscription>, Error> {
        let row = subscriptions::Entity::find_by_id(customer_id)
            .one(&self.db)
            .await
            .map_err(db_err)?;
        Ok(row.map(|m| Subscription {
            customer_id: m.customer_id,
            subscription_id: m.subscription_id,
            tier: Tier::parse(&m.tier).unwrap_or(Tier::Free),
            updated_ms: m.updated_ms.max(0) as u64,
        }))
    }

    /// Upgrades an existing API key record to the tier the customer pays for.
    pub async fn sync_key_tier(
        &self,
        key: &mut ApiKey,
        store: &vexillum_auth::AuthStore,
    ) -> Result<(), Error> {
        let tier = self
            .subscription(key.customer_id.as_deref().unwrap_or(""))
            .await?
            .map(|s| s.tier)
            .unwrap_or(Tier::Free);
        key.tier = tier;
        store.put_record(key).await
    }
}

/// The webhook events the product consumes.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Event {
    CheckoutCompleted {
        customer_id: String,
        tier: Tier,
    },
    SubscriptionUpdated {
        customer_id: String,
        subscription_id: String,
        tier: Tier,
    },
    SubscriptionDeleted {
        customer_id: String,
    },
}

fn now_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

/// Deduplication identity for a checkout session (defense in depth).
pub fn session_fingerprint(session_id: &str) -> String {
    hex::encode(Sha256::digest(session_id.as_bytes()))
}

/// Extracts `(event_id, Event)` from a raw Stripe webhook payload.
///
/// Only the event types the product consumes are mapped; anything else
/// returns `None` (the route ACKs those so Stripe stops retrying). Tier
/// resolution: `metadata.tier` when present, else `pro` for checkout
/// completion and subscription updates — a deliberate default because
/// vexillum currently sells exactly one paid plan.
pub fn parse_webhook_event(payload: &serde_json::Value) -> Option<(String, Event)> {
    let event_type = payload.get("type")?.as_str()?;
    let event_id = payload
        .get("id")
        .and_then(|v| v.as_str())
        .unwrap_or("evt_unlabeled")
        .to_string();
    let object = payload.pointer("/data/object")?;
    let customer_id = object
        .get("customer")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();
    let metadata_tier = object
        .pointer("/metadata/tier")
        .and_then(|v| v.as_str())
        .map(str::to_string);
    let event = match event_type {
        "checkout.session.completed" => {
            if customer_id.is_empty() {
                return None;
            }
            Event::CheckoutCompleted {
                customer_id,
                tier: Tier::parse(metadata_tier.as_deref().unwrap_or("pro"))
                    .unwrap_or(Tier::Pro),
            }
        }
        "customer.subscription.updated" => {
            if customer_id.is_empty() {
                return None;
            }
            Event::SubscriptionUpdated {
                customer_id,
                subscription_id: object
                    .get("id")
                    .and_then(|v| v.as_str())
                    .unwrap_or("sub_unknown")
                    .to_string(),
                tier: Tier::parse(metadata_tier.as_deref().unwrap_or("pro"))
                    .unwrap_or(Tier::Pro),
            }
        }
        "customer.subscription.deleted" => {
            if customer_id.is_empty() {
                return None;
            }
            Event::SubscriptionDeleted { customer_id }
        }
        _ => return None,
    };
    Some((event_id, event))
}

#[cfg(test)]
mod tests {
    use super::*;

    async fn store() -> BillingStore {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("vexillum.db");
        std::mem::forget(dir);
        BillingStore::open(&path).await.unwrap()
    }

    #[tokio::test]
    async fn checkout_creates_subscription() {
        let s = store().await;
        assert!(s.subscription("cus_1").await.unwrap().is_none());
        let applied = s
            .apply_event(
                "evt_1",
                &Event::CheckoutCompleted {
                    customer_id: "cus_1".into(),
                    tier: Tier::Pro,
                },
            )
            .await
            .unwrap();
        assert!(applied);
        let sub = s.subscription("cus_1").await.unwrap().unwrap();
        assert_eq!(sub.tier, Tier::Pro);
    }

    #[test]
    fn parse_webhook_event_maps_stripe_payloads() {
        let checkout = serde_json::json!({
            "id": "evt_1",
            "type": "checkout.session.completed",
            "data": { "object": { "customer": "cus_9", "metadata": { "tier": "pro" } } }
        });
        let (id, ev) = parse_webhook_event(&checkout).unwrap();
        assert_eq!(id, "evt_1");
        assert_eq!(
            ev,
            Event::CheckoutCompleted { customer_id: "cus_9".into(), tier: Tier::Pro }
        );

        // tier defaults to pro when metadata is absent
        let plain = serde_json::json!({
            "id": "evt_2",
            "type": "checkout.session.completed",
            "data": { "object": { "customer": "cus_9" } }
        });
        assert_eq!(
            parse_webhook_event(&plain).unwrap().1,
            Event::CheckoutCompleted { customer_id: "cus_9".into(), tier: Tier::Pro }
        );

        let updated = serde_json::json!({
            "id": "evt_3",
            "type": "customer.subscription.updated",
            "data": { "object": { "customer": "cus_9", "id": "sub_1" } }
        });
        assert_eq!(
            parse_webhook_event(&updated).unwrap().1,
            Event::SubscriptionUpdated {
                customer_id: "cus_9".into(),
                subscription_id: "sub_1".into(),
                tier: Tier::Pro,
            }
        );

        let deleted = serde_json::json!({
            "id": "evt_4",
            "type": "customer.subscription.deleted",
            "data": { "object": { "customer": "cus_9" } }
        });
        assert_eq!(
            parse_webhook_event(&deleted).unwrap().1,
            Event::SubscriptionDeleted { customer_id: "cus_9".into() }
        );

        // unhandled types + missing customer → None (route ACKs them)
        assert!(parse_webhook_event(&serde_json::json!({
            "id": "evt_5", "type": "invoice.paid",
            "data": { "object": { "customer": "cus_9" } }
        }))
        .is_none());
        assert!(parse_webhook_event(&serde_json::json!({
            "id": "evt_6", "type": "checkout.session.completed",
            "data": { "object": {} }
        }))
        .is_none());
        assert!(parse_webhook_event(&serde_json::json!({ "id": "evt_7" })).is_none());
    }

    #[tokio::test]
    async fn events_are_idempotent() {
        let s = store().await;
        let event = Event::SubscriptionUpdated {
            customer_id: "cus_2".into(),
            subscription_id: "sub_1".into(),
            tier: Tier::Pro,
        };
        assert!(s.apply_event("evt_2", &event).await.unwrap());
        assert!(
            !s.apply_event("evt_2", &event).await.unwrap(),
            "replay must be a no-op"
        );
        // same payload, different id → applied
        assert!(s.apply_event("evt_3", &event).await.unwrap());
    }

    #[tokio::test]
    async fn deletion_downgrades_to_absence() {
        let s = store().await;
        s.apply_event(
            "evt_10",
            &Event::CheckoutCompleted {
                customer_id: "cus_3".into(),
                tier: Tier::Pro,
            },
        )
        .await
        .unwrap();
        assert!(
            s.apply_event(
                "evt_11",
                &Event::SubscriptionDeleted {
                    customer_id: "cus_3".into()
                }
            )
            .await
            .unwrap()
        );
        assert!(s.subscription("cus_3").await.unwrap().is_none());
        // replaying deletion is idempotent too
        assert!(
            !s.apply_event(
                "evt_11",
                &Event::SubscriptionDeleted {
                    customer_id: "cus_3".into()
                }
            )
            .await
            .unwrap()
        );
    }

    #[tokio::test]
    async fn upgrade_then_downgrade_flow() {
        let s = store().await;
        s.apply_event(
            "evt_20",
            &Event::SubscriptionUpdated {
                customer_id: "cus_4".into(),
                subscription_id: "sub_20".into(),
                tier: Tier::Pro,
            },
        )
        .await
        .unwrap();
        assert_eq!(
            s.subscription("cus_4").await.unwrap().unwrap().tier,
            Tier::Pro
        );
        s.apply_event(
            "evt_21",
            &Event::SubscriptionUpdated {
                customer_id: "cus_4".into(),
                subscription_id: "sub_20".into(),
                tier: Tier::Free,
            },
        )
        .await
        .unwrap();
        assert_eq!(
            s.subscription("cus_4").await.unwrap().unwrap().tier,
            Tier::Free
        );
    }

    #[tokio::test]
    async fn sync_key_tier_follows_subscription() {
        let s = store().await;
        let auth_dir = tempfile::tempdir().unwrap();
        let auth = vexillum_auth::AuthStore::open(&auth_dir.path().join("vexillum.db"))
            .await
            .unwrap();
        s.apply_event(
            "evt_30",
            &Event::CheckoutCompleted {
                customer_id: "cus_9".into(),
                tier: Tier::Pro,
            },
        )
        .await
        .unwrap();
        let mut key = ApiKey {
            key_hash: "h".into(),
            label: "k".into(),
            tier: Tier::Free,
            customer_id: Some("cus_9".into()),
            allowed_origins: vec![],
            created_ms: 0,
            env: "live".into(),
            owner_id: None,
        };
        s.sync_key_tier(&mut key, &auth).await.unwrap();
        assert_eq!(key.tier, Tier::Pro);
        // customer without subscription → Free
        key.customer_id = Some("cus_none".into());
        s.sync_key_tier(&mut key, &auth).await.unwrap();
        assert_eq!(key.tier, Tier::Free);
    }
}
