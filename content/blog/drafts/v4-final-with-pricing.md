---
title: "The real cost of dictation apps, and the free thing that beats them"
date: "2026-04-15"
summary: "I started with Wispr Flow, moved to the Groq API, and ended up running Whisper locally on my Mac. Each step got cheaper and, somehow, not slower."
tags: ["ai", "whisper", "apple-silicon", "local-first"]
---

I kept paying less for dictation at every step. And at every step, I expected it to get worse. It didn't.

This is the path, with real numbers.

---

## Step 0: Paying Wispr Flow

I was on **Wispr Flow Pro**. $15/month monthly, $12/month if you pay annually — so $144 to $180 a year. It's a polished app. Push a hotkey, talk, get text. The free tier caps you at 2,000 words per week on Mac, which is enough to try it and not enough to live on.

Two things started to bother me:

1. The annual bill, obviously.
2. The app was sitting in the background eating **~12% CPU and ~400 MB of RAM**, always on, waiting for my hotkey. On a laptop that's battery you're paying for twice.

Also: a quick warning. Do not confuse **wisprflow.ai** (the real Wispr Flow, the product I'm talking about) with **whisperflow.app**, which is a different product with pricing that looks like a typo — $89 to $249 per month, or $99 to $299 "one-time." I'm not linking to it. Just know it exists and it is not the same thing.

---

## Step 1: Swap the app for an API

My first move was smaller than it should have been. Instead of cancelling dictation entirely, I switched to the **Groq API** — their hosted Whisper-large-v3-turbo, priced at ~$0.006/minute. I wired it into a small push-to-talk script.

For the amount I dictate, that came out to pennies a month. Way cheaper than $15. And **Groq is genuinely the fastest thing out there** — it runs Whisper on custom LPU chips, and a 42-second clip comes back in about one second. Nothing on my Mac, then or now, matches that.

But I was still sending my voice to somebody else's servers. And I still didn't know what my own hardware could actually do.

---

## Step 2: Try the open-source dictation apps

If you want to stop paying monthly but keep a nice GUI, the obvious next step is one of the open-source Mac dictation apps. Here's the honest pricing landscape:

| App | License | What you actually pay |
|-----|---------|-----------------------|
| [**Handy**](https://github.com/cjpais/Handy) | Open source | $0. Download and run. |
| [**OpenWhispr**](https://github.com/OpenWhispr/openwhispr) | Open source | $0. Mac + Win + Linux. |
| [**FluidVoice**](https://github.com/altic-dev/FluidVoice) | GPL v3 | $0. Parakeet + Whisper + Apple Speech. |
| [**VoiceTypr**](https://github.com/moinulmoin/voicetypr) | Open source | $0. Mac + Windows. |
| [**TypeWhisper**](https://github.com/TypeWhisper/typewhisper-mac) | Open source | $0. Streaming preview. |
| [**FreeFlow**](https://github.com/zachlatta/freeflow) | Open source | $0. Literally named as the Wispr Flow alternative. |
| [**Open-Wispr**](https://github.com/human37/open-wispr) | Open source | $0. Popular with Claude Code users. |
| [**VoiceInk**](https://github.com/Beingpax/VoiceInk) | GPL v3 (!) | $25 / $39 / $49 for the prebuilt binary (1 / 2 / 3 Macs). **Or $0** if you clone the repo and build it yourself. |
| [**Sotto**](https://sotto.to/) | Proprietary | $49 one-time, 3 devices. Polished, not open source. |

VoiceInk is the interesting one. The source is on GitHub under GPL v3 — fully open. The license lets you build and use it for free. But the developer sells the compiled binary on the website, and that's how they fund the project. It's a completely legitimate model, and "open source" does not automatically mean "free binary." Worth naming, because people ask.

Sotto is the other side of the coin — not open source, but a one-time $49 price for a genuinely polished Mac-native app (WhisperKit + Parakeet + optional cloud). If you want a paid product without a subscription, it's a reasonable answer.

I tried **Handy**. It's free, uses whisper.cpp under the hood, and lets you pick between Whisper, Parakeet v2/v3, and Canary 1B v2. I benchmarked the three model families on my typical Czech+English mixed audio:

- **Whisper (large-v3-turbo)** — handles the code-switching. Best quality.
- **Parakeet v3** — fast, but mangles Czech and non-English proper nouns. Turned "Cloud Code CLI" into "kotko CLI".
- **Canary 1B v2** — fine, not better than Whisper for my use.

If you want to quit a paid subscription and you want a GUI, **install Handy, pick Whisper turbo, you're done.** That's the short recommendation.

---

## Step 3: Skip the app, run whisper.cpp directly

Handy is a wrapper around whisper.cpp. I got curious what happens if I drop the wrapper.

```bash
brew install whisper-cpp
curl -LO https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin
whisper-cli -m ggml-large-v3-turbo.bin audio.wav
```

**3 seconds to transcribe 42 seconds of audio. Perfect output.**

That's 14× real-time. Bigger than I expected. I didn't trust the number, so I benchmarked every other Whisper path I could find on macOS.

| Backend | Time for 42s audio | Real-time factor | Quality |
|---------|--------------------|------------------|---------|
| **Groq API** (cloud) | 1.0s | 42× | Perfect |
| **whisper-cpp + Metal** | 3.0s | 14× | Perfect |
| Whisper sherpa-onnx (CPU) | 5.7s | 9× | Good |
| Parakeet (CoreML) | 7.8s | 6× | Minor errors |

Three things stood out.

**Python-based Whisper is 10–15× slower than whisper.cpp** on the same hardware. Same model weights, same machine, but Python doesn't use Metal. If you're tempted to `pip install openai-whisper`, don't — it will work and it will be too slow to use.

**Whisper through CoreML (via ONNX Runtime) is broken today.** Slower than real-time *and* hallucinates — mine looped "Titulky vytvořil Jirka…" hundreds of times on a 42-second clip. Same CoreML provider works fine for Parakeet; there's something specific to Whisper's decoder that breaks here. Don't waste an afternoon.

**Groq is still untouchable on speed.** If you need absolute lowest latency, Groq wins. But for everyday dictation on my machine, 3 seconds locally is more than fast enough — and I stopped needing the API.

---

## What I'm running now

```
Primary:   whisper-cpp + Metal, large-v3-turbo (1.5 GB model)
Fallback:  Groq API ($0.006/min, rarely used)
GUI:       Handy, when I want push-to-talk in arbitrary apps
```

Ongoing cost: $0. Background CPU from the dictation stack: roughly nothing when I'm not using it.

---

## The full cost comparison

If you want to send text with your voice on a Mac, here's what the year actually costs you:

| Option | Year 1 | Year 2+ | Notes |
|--------|--------|---------|-------|
| Wispr Flow Pro | $144–180 | $144–180 | Polished, cloud |
| Sotto | $49 | $0 | One-time, polished, 3 devices |
| VoiceInk (binary) | $25–49 | $0 | One-time, local |
| VoiceInk / FluidVoice (built from source) | $0 | $0 | If you run Xcode |
| Handy / OpenWhispr / VoiceTypr / FreeFlow | $0 | $0 | Free OSS, pick one |
| whisper.cpp CLI | $0 | $0 | No GUI, fastest |
| Groq API (dictation) | ~$1–5 | ~$1–5 | Pennies if personal use |

The spread between the cheapest and the most expensive option isn't about quality — above a certain bar, they all transcribe well. It's about where the money flows: a subscription, a one-time purchase, an API bill, or nothing.

---

## What I haven't tested

To stay honest: I tried Handy and the command line. I did **not** personally test VoiceInk, MacWhisper, Superwhisper, Aiko, or BetterDictation. The pricing and feature claims above come from their sites and GitHub READMEs. If any of them have specific UX that makes a paid tier worth it to you, that's a fair trade. My only claim is that the bottom of the market — $0, local, open source — is much better than the price suggests.

---

## TL;DR

- **Stop paying monthly.** Wispr Flow is good but $144–180/year isn't the floor.
- **If you want free + GUI:** Handy.
- **If you want fastest local:** whisper.cpp + Metal, `large-v3-turbo`.
- **If you want fastest, period:** Groq API, pennies per dictation, but cloud.
- **Avoid:** Python Whisper on Mac. Whisper through ONNX+CoreML.
- **Remember:** "open source" ≠ "free binary." VoiceInk's source is free; the compiled app costs money. That's fine, just know before you click buy.

---

*Mac Mini M4, 16 GB RAM, macOS, whisper-cpp 1.8.3. Benchmarks on Czech+English mixed audio. Pricing as of April 2026. Not affiliated with any of the products named.*
