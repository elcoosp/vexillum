//! Local dev utility: provisions an API key directly into the auth store.
//!
//! The HTTP surface intentionally has no key-creation route (keys are minted
//! by billing out-of-band), so local testing needs this escape hatch:
//!
//! `cargo run -p vexillum-auth --bin create-key -- [--data-dir <dir>]
//!     [--tier free|pro] [--label <label>] [--origin <host>]…`
//!
//! Prints the plaintext key (shown once; only its SHA-256 is stored).

use std::path::PathBuf;

#[tokio::main]
async fn main() -> Result<(), String> {
    let mut data_dir = PathBuf::from("data");
    let mut tier = vexillum_auth::Tier::Pro;
    let mut label = "local-dev".to_string();
    let mut origins: Vec<String> = Vec::new();

    let mut args = std::env::args().skip(1);
    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--data-dir" => data_dir = args.next().ok_or("missing value for --data-dir")?.into(),
            "--tier" => {
                tier = match args.next().ok_or("missing value for --tier")?.as_str() {
                    "free" => vexillum_auth::Tier::Free,
                    "pro" => vexillum_auth::Tier::Pro,
                    other => return Err(format!("unknown tier '{other}' (free|pro)")),
                }
            }
            "--label" => label = args.next().ok_or("missing value for --label")?,
            "--origin" => {
                origins.push(args.next().ok_or("missing value for --origin")?);
            }
            other => return Err(format!("unknown arg '{other}'")),
        }
    }

    std::fs::create_dir_all(&data_dir).map_err(|e| format!("create data dir: {e}"))?;
    let store = vexillum_auth::AuthStore::open(&data_dir.join("vexillum.db"))
        .await
        .map_err(|e| format!("open auth store: {e}"))?;
    let plaintext = vexillum_auth::generate_key("live");
    store
        .put_record(&vexillum_auth::ApiKey {
            key_hash: vexillum_auth::key_hash(&plaintext),
            label,
            tier,
            customer_id: None,
            allowed_origins: origins,
            created_ms: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64,
            env: "live".into(),
            owner_id: None,
        })
        .await
        .map_err(|e| format!("store key: {e}"))?;
    println!("{plaintext}");
    Ok(())
}
