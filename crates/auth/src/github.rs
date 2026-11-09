//! GitHub OAuth (authorization-code flow) for the dashboard login wall.
//!
//! `authorize_url` builds the redirect target, `exchange` swaps the callback
//! `code` for an access token, `fetch_user` resolves the profile. All HTTP
//! goes through reqwest with the workspace TLS stack; no secrets are logged.

use vexillum_core::Error;

const AUTHORIZE_URL: &str = "https://github.com/login/oauth/authorize";
const TOKEN_URL: &str = "https://github.com/login/oauth/access_token";
const USER_URL: &str = "https://api.github.com/user";

/// The GitHub profile fields vexillum keeps.
#[derive(Debug, Clone, serde::Deserialize)]
pub struct GithubProfile {
    pub id: i64,
    pub login: String,
    pub name: Option<String>,
    pub email: Option<String>,
    pub avatar_url: Option<String>,
}

/// Configured OAuth app + HTTP client. `None` in state = OAuth disabled and
/// the login route reports 503 instead of pointing users at GitHub.
#[derive(Clone)]
pub struct GithubOAuth {
    pub client_id: String,
    client_secret: String,
    /// Exact callback URL registered with the OAuth app
    /// (`https://api.vexillum.dev/v1/auth/github/callback`).
    pub redirect_uri: String,
    /// Frontend origin the callback bounces back to (`https://vexillum.dev`).
    pub frontend_url: String,
    client: reqwest::Client,
}

impl std::fmt::Debug for GithubOAuth {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("GithubOAuth")
            .field("client_id", &self.client_id)
            .field("redirect_uri", &self.redirect_uri)
            .field("frontend_url", &self.frontend_url)
            .finish_non_exhaustive()
    }
}

impl GithubOAuth {
    pub fn new(
        client_id: String,
        client_secret: String,
        redirect_uri: String,
        frontend_url: String,
    ) -> Self {
        Self {
            client_id,
            client_secret,
            redirect_uri,
            frontend_url,
            client: reqwest::Client::builder()
                .user_agent("vexillum")
                .build()
                .expect("reqwest client"),
        }
    }

    /// `https://github.com/login/oauth/authorize?...` — `state` is the
    /// caller-generated CSRF value; `login` scopes only `read:user`
    /// (emails come along on the profile, no extra scope needed).
    pub fn authorize_url(&self, state: &str) -> String {
        let query = [
            ("client_id", self.client_id.as_str()),
            ("redirect_uri", self.redirect_uri.as_str()),
            ("scope", "read:user"),
            ("state", state),
        ];
        let qs: Vec<String> = query
            .iter()
            .map(|(k, v)| format!("{k}={}", urlencode(v)))
            .collect();
        format!("{AUTHORIZE_URL}?{}", qs.join("&"))
    }

    /// Swaps the callback code for an access token.
    pub async fn exchange(&self, code: &str) -> Result<String, Error> {
        #[derive(serde::Deserialize)]
        struct TokenResponse {
            access_token: Option<String>,
            error: Option<String>,
            error_description: Option<String>,
        }
        let resp = self
            .client
            .post(TOKEN_URL)
            .header("Accept", "application/json")
            .json(&serde_json::json!({
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "code": code,
                "redirect_uri": self.redirect_uri,
            }))
            .send()
            .await
            .map_err(|e| Error::Upstream(format!("github token exchange failed: {e}")))?;
        if !resp.status().is_success() {
            return Err(Error::Upstream(format!(
                "github token exchange returned {}",
                resp.status()
            )));
        }
        let body: TokenResponse = resp
            .json()
            .await
            .map_err(|e| Error::Upstream(format!("github token response unreadable: {e}")))?;
        if let Some(err) = body.error {
            return Err(Error::Unauthorized(format!(
                "github rejected the login: {} {}",
                err,
                body.error_description.unwrap_or_default()
            )));
        }
        body.access_token
            .ok_or_else(|| Error::Upstream("github token response carried no access_token".into()))
    }

    /// Resolves the authenticated profile with an access token.
    pub async fn fetch_user(&self, access_token: &str) -> Result<GithubProfile, Error> {
        let resp = self
            .client
            .get(USER_URL)
            .header("Authorization", format!("Bearer {access_token}"))
            .header("Accept", "application/vnd.github+json")
            .send()
            .await
            .map_err(|e| Error::Upstream(format!("github profile fetch failed: {e}")))?;
        if resp.status() == reqwest::StatusCode::UNAUTHORIZED {
            return Err(Error::Unauthorized("github access token rejected".into()));
        }
        if !resp.status().is_success() {
            return Err(Error::Upstream(format!(
                "github profile fetch returned {}",
                resp.status()
            )));
        }
        resp.json()
            .await
            .map_err(|e| Error::Upstream(format!("github profile unreadable: {e}")))
    }
}

/// Minimal percent-encoding for the authorize query string.
fn urlencode(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    for b in value.bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'.' | b'_' | b'~' | b':' => {
                out.push(b as char)
            }
            _ => out.push_str(&format!("%{b:02X}")),
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn oauth() -> GithubOAuth {
        GithubOAuth::new(
            "Iv1.test".into(),
            "secret".into(),
            "https://api.vexillum.dev/v1/auth/github/callback".into(),
            "https://vexillum.dev".into(),
        )
    }

    #[test]
    fn authorize_url_carries_client_and_state() {
        let url = oauth().authorize_url("abc123");
        assert!(url.starts_with("https://github.com/login/oauth/authorize?"));
        assert!(url.contains("client_id=Iv1.test"));
        assert!(url.contains("scope=read:user"));
        assert!(url.contains("state=abc123"));
        assert!(url.contains(&format!(
            "redirect_uri={}",
            urlencode("https://api.vexillum.dev/v1/auth/github/callback")
        )));
    }

    #[test]
    fn urlencode_encodes_separators_only() {
        assert_eq!(urlencode("abc-DEF_1.2~3"), "abc-DEF_1.2~3");
        assert_eq!(urlencode("a b&c=d/e"), "a%20b%26c%3Dd%2Fe");
    }
}
