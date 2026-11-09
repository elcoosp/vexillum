/**
 * @vexillum/sdk — typed client for the Vexillum API.
 */

export interface BadgeUrlOptions {
  format?: "svg" | "png" | "webp" | "gif" | "apng" | "jpg";
  scale?: 1 | 2 | 3;
  theme?: string;
  font?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: number;
  pad?: number;
  key?: string;
  /** Third-segment text (suffix / tri-segment badges) — overrides the design default. */
  extra?: string;
  /** Fourth-segment text (quad badges like c17-08) — overrides the design default. */
  extra2?: string;
  /** Custom semantic seed (hex, `#` optional) — drives the full OKLCH ramp; overrides `theme`. */
  seed?: string;
  /** Surface mode for the semantic ramp (dark flips the surface/border/text tokens). */
  mode?: "light" | "dark";
}

export interface VariantMeta {
  id: string;
  collection: string;
  title: string;
  hasIcon: boolean;
  hasLabel: boolean;
  hasValue: boolean;
  hasExtra: boolean;
  hasExtra2?: boolean;
  defaultIcon: string | null;
  defaultLabel: string;
  defaultValue: string;
  defaultExtra: string | null;
  defaultExtra2?: string | null;
  animations: Array<{ name: string; durationMs: number; timing: string; iteration: string }>;
}

export interface RegistryManifest {
  collections: Array<{ id: string; slug: string; title: string; description: string }>;
  variants: VariantMeta[];
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: { type: string; title: string; status: number; detail: string },
  ) {
    super(problem.detail);
    this.name = "ApiError";
  }
}

export class BadgeCloudClient {
  constructor(
    private readonly baseUrl: string = "",
    private readonly fetchImpl: typeof fetch = globalThis.fetch,
  ) {}

  /** Builds a badge URL (the SDK's core value: type-safe URL grammar). */
  badgeUrl(
    collection: string,
    variant: string,
    label: string,
    value: string,
    options: BadgeUrlOptions = {},
  ): string {
    const path = `${this.baseUrl}/badge/${encodeURIComponent(collection)}/${encodeURIComponent(variant)}/${encodeURIComponent(label)}/${encodeURIComponent(value)}`;
    const params = new URLSearchParams();
    if (options.format) params.set("format", options.format);
    if (options.scale && options.scale !== 1) params.set("scale", String(options.scale));
    if (options.theme) params.set("theme", options.theme);
    if (options.seed) params.set("seed", options.seed);
    if (options.mode && options.mode !== "light") params.set("mode", options.mode);
    if (options.font) params.set("font", options.font);
    if (options.icon) params.set("icon", options.icon);
    if (options.iconColor) params.set("icon.color", options.iconColor);
    if (options.iconSize) params.set("icon.size", String(options.iconSize));
    if (options.pad !== undefined) params.set("pad", String(options.pad));
    if (options.key) params.set("key", options.key);
    if (options.extra) params.set("extra", options.extra);
    if (options.extra2) params.set("extra2", options.extra2);
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
  }

  private async problem(res: Response): Promise<never> {
    let detail = { title: "Request failed", status: res.status, type: "unknown", detail: res.statusText };
    try {
      detail = (await res.json()) as typeof detail;
    } catch {
      // non-JSON error body
    }
    throw new ApiError(res.status, detail);
  }

  async variants(): Promise<RegistryManifest> {
    const res = await this.fetchImpl(`${this.baseUrl}/v1/variants`);
    if (!res.ok) await this.problem(res);
    return (await res.json()) as RegistryManifest;
  }

  async themes(): Promise<{ presets: Array<{ name: string; tokens: Record<string, string> }> }> {
    const res = await this.fetchImpl(`${this.baseUrl}/v1/themes`);
    if (!res.ok) await this.problem(res);
    return (await res.json());
  }

  async usage(key?: string): Promise<{ requestsThisWindow: number; rpm: number }> {
    const res = await this.fetchImpl(`${this.baseUrl}/v1/usage`, {
      headers: key ? { Authorization: `Bearer ${key}` } : undefined,
    });
    if (!res.ok) await this.problem(res);
    return (await res.json());
  }

  async createTheme(brand: string, key: string): Promise<{ colorCorrected: boolean; colors: Record<string, string> }> {
    const res = await this.fetchImpl(`${this.baseUrl}/v1/themes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ brand }),
    });
    if (!res.ok) await this.problem(res);
    return (await res.json());
  }

  /** Fetches a rendered badge as bytes. */
  async render(url: string): Promise<ArrayBuffer> {
    const res = await this.fetchImpl(url);
    if (!res.ok) await this.problem(res);
    return res.arrayBuffer();
  }
}
