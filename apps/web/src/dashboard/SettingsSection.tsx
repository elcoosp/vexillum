import { useState } from "react";
import { Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/select";
import { useSession } from "@/lib/session";
import { PLANS, planAllowsFormat, type Format, type Plan } from "@/lib/plans";
import { SEMANTIC_PRESETS } from "@/lib/theme";
import { formatDate } from "@/dashboard/format";

const FORMAT_OPTIONS: Format[] = ["svg", "png", "jpg", "webp", "gif", "apng"];

const PREFS_KEY = "vexillum.prefs.v1";

interface Prefs {
  defaultTheme: string;
  defaultFormat: Format;
}

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { defaultTheme: "blue", defaultFormat: "svg", ...JSON.parse(raw) };
  } catch {
    // fresh prefs below
  }
  return { defaultTheme: "blue", defaultFormat: "svg" };
}

/**
 * Settings — the real profile (GitHub identity, member since, session state)
 * plus URL-builder preferences that are explicitly browser-local (there is no
 * server settings endpoint yet, and the UI says so).
 */
export function SettingsSection({ plan }: { plan: Plan }) {
  const session = useSession();
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const user = session.user;

  return (
    <div className="max-w-xl space-y-5">
      <div className="rounded-lg border border-border bg-white p-4">
        <h3 className="text-sm font-semibold">Profile</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Your GitHub identity, verified server-side on every request.
        </p>
        <dl className="mt-3 space-y-2 text-xs" data-testid="profile-rows">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Handle</dt>
            <dd className="font-mono font-medium">@{user?.login}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Name</dt>
            <dd>{user?.name ?? "—"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Public email</dt>
            <dd className="font-mono">{user?.email ?? "not public on GitHub"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="font-mono">{PLANS[plan].name}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Member since</dt>
            <dd>{formatDate(user?.createdAt ?? 0)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-white p-4">
        <h3 className="text-sm font-semibold">Badge defaults (this browser)</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Applied to generated URLs in the playground. Stored locally — the API keeps no profile
          settings today, and pretending otherwise would be a demo in disguise.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="default-theme">Default theme</Label>
            <Select
              id="default-theme"
              value={prefs.defaultTheme}
              onChange={(e) => setPrefs((p) => ({ ...p, defaultTheme: e.target.value }))}
            >
              {SEMANTIC_PRESETS.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} — seed {t.seed}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Themes are free on every plan — the seed drives the whole OKLCH ramp.
            </p>
          </div>
          <div>
            <Label htmlFor="default-format">Default format</Label>
            <Select
              id="default-format"
              value={planAllowsFormat(plan, prefs.defaultFormat) ? prefs.defaultFormat : "svg"}
              onChange={(e) => setPrefs((p) => ({ ...p, defaultFormat: e.target.value as Format }))}
            >
              {FORMAT_OPTIONS.filter((f) => planAllowsFormat(plan, f)).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {PLANS[plan].formats.join(" · ")} on {PLANS[plan].name}.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} data-testid="save-settings">
          <Save className="h-4 w-4" aria-hidden /> Save settings
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success" role="status">
            <Check className="h-3.5 w-3.5" aria-hidden /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
