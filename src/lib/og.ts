import satori, { init as initSatori } from "satori/standalone";
import { Resvg, initWasm as initResvg } from "@resvg/resvg-wasm";
// @ts-expect-error — WASM binary imports, resolved by Cloudflare Workers runtime
import satoriWasm from "satori/yoga.wasm";
// @ts-expect-error — WASM binary imports, resolved by Cloudflare Workers runtime
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";

// ── WASM init (once per Worker isolate) ─────────────────────────

let wasmReady = false;

async function ensureWasm(): Promise<void> {
  if (wasmReady) return;
  try {
    await Promise.all([initSatori(satoriWasm), initResvg(resvgWasm)]);
  } catch (e) {
    if (e instanceof Error && /already/i.test(e.message)) {
      wasmReady = true;
      return;
    }
    throw e;
  }
  wasmReady = true;
}

// ── Font loading (cached in isolate memory) ─────────────────────

let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

async function loadFonts(): Promise<{
  regular: ArrayBuffer;
  bold: ArrayBuffer;
}> {
  if (fontCache) return fontCache;
  const [regular, bold] = await Promise.all([
    fetchGoogleFont(400),
    fetchGoogleFont(700),
  ]);
  fontCache = { regular, bold };
  return fontCache;
}

async function fetchGoogleFont(weight: number): Promise<ArrayBuffer> {
  // Omit User-Agent so Google Fonts returns truetype (satori needs OTF/TTF)
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=DM+Sans:wght@${weight}`,
  ).then((r) => r.text());

  const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!url) throw new Error(`Font URL not found for weight ${weight}`);

  return fetch(url).then((r) => r.arrayBuffer());
}

// ── Public API ──────────────────────────────────────────────────

export interface OgImageOptions {
  title: string;
  description?: string;
  date?: string | null;
  readingTime?: number;
  tags?: string[];
  siteUrl: string;
}

export async function generateOgImage(
  options: OgImageOptions,
): Promise<Uint8Array> {
  const [fonts] = await Promise.all([loadFonts(), ensureWasm()]);

  const svg = await satori(buildElement(options), {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "DM Sans",
        data: fonts.regular,
        weight: 400,
        style: "normal" as const,
      },
      {
        name: "DM Sans",
        data: fonts.bold,
        weight: 700,
        style: "normal" as const,
      },
    ],
  });

  const resvg = new Resvg(svg);
  return resvg.render().asPng();
}

// ── Template ────────────────────────────────────────────────────

type SatoriNode =
  | string
  | { type: string; props: { style?: Record<string, unknown>; children?: SatoriNode | SatoriNode[]; [k: string]: unknown } };

function buildElement(options: OgImageOptions): SatoriNode {
  const content: SatoriNode[] = [];
  const titleLen = options.title.length;
  const titleSize = titleLen > 50 ? 44 : titleLen > 30 ? 50 : 58;

  // Accent bar — warm amber gradient
  content.push({
    type: "div",
    props: {
      style: {
        width: 56,
        height: 4,
        borderRadius: 2,
        background: "linear-gradient(90deg, #f59e0b, #f97316)",
        marginBottom: 28,
      },
      children: "",
    },
  });

  // Title
  content.push({
    type: "div",
    props: {
      style: {
        fontSize: titleSize,
        fontWeight: 700,
        color: "#ededec",
        lineHeight: 1.15,
        letterSpacing: -0.5,
        fontFamily: "DM Sans",
      },
      children: options.title,
    },
  });

  // Description (homepage)
  if (options.description) {
    content.push({
      type: "div",
      props: {
        style: {
          fontSize: 22,
          color: "#8a8a8a",
          marginTop: 20,
          lineHeight: 1.5,
          fontFamily: "DM Sans",
        },
        children: options.description,
      },
    });
  }

  // Meta: date + reading time
  const metaParts: string[] = [];
  if (options.date) metaParts.push(options.date);
  if (options.readingTime) metaParts.push(`${options.readingTime} min read`);
  if (metaParts.length > 0) {
    content.push({
      type: "div",
      props: {
        style: {
          fontSize: 18,
          color: "#666666",
          marginTop: 24,
          fontFamily: "DM Sans",
        },
        children: metaParts.join("  ·  "),
      },
    });
  }

  // Tags as outlined pills
  if (options.tags && options.tags.length > 0) {
    content.push({
      type: "div",
      props: {
        style: {
          display: "flex",
          flexWrap: "wrap" as const,
          gap: 8,
          marginTop: 16,
        },
        children: options.tags.map((tag) => ({
          type: "span",
          props: {
            style: {
              fontSize: 14,
              color: "#a0a0a0",
              fontFamily: "DM Sans",
              border: "1px solid #333333",
              borderRadius: 999,
              paddingTop: 4,
              paddingBottom: 4,
              paddingLeft: 14,
              paddingRight: 14,
            },
            children: tag,
          },
        })),
      },
    });
  }

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        position: "relative" as const,
        width: "100%",
        height: "100%",
        background: "#09090b",
        overflow: "hidden",
        fontFamily: "DM Sans",
      },
      children: [
        // ── Atmospheric glow: warm amber orb (top-right) ──
        {
          type: "div",
          props: {
            style: {
              position: "absolute" as const,
              top: -120,
              right: -80,
              width: 480,
              height: 480,
              borderRadius: 9999,
              background:
                "radial-gradient(circle, rgba(245,158,11,0.12) 0%, rgba(249,115,22,0.04) 50%, transparent 70%)",
            },
            children: "",
          },
        },
        // ── Atmospheric glow: cool blue orb (bottom-left) ──
        {
          type: "div",
          props: {
            style: {
              position: "absolute" as const,
              bottom: -180,
              left: -60,
              width: 420,
              height: 420,
              borderRadius: 9999,
              background:
                "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 60%)",
            },
            children: "",
          },
        },
        // ── Content layer ──
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column" as const,
              position: "relative" as const,
              width: "100%",
              height: "100%",
              padding: 64,
            },
            children: [
              // Main content — pushed to bottom for visual weight
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column" as const,
                    flex: 1,
                    justifyContent: "flex-end",
                  },
                  children: content,
                },
              },
              // Footer — site URL in tracked uppercase
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    marginTop: 40,
                    paddingTop: 20,
                    borderTop: "1px solid #1a1a1f",
                  },
                  children: {
                    type: "div",
                    props: {
                      style: {
                        fontSize: 14,
                        color: "#4a4a4a",
                        fontFamily: "DM Sans",
                        letterSpacing: 3,
                        textTransform: "uppercase" as const,
                      },
                      children: options.siteUrl.replace(/^https?:\/\//, ""),
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };
}
