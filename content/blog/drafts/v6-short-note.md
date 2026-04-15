---
title: "Stop paying $15/month for WhisperFlow. Your Mac can do it for free."
date: "2026-04-15"
summary: "You do not need to pay for a dictation app on a Mac. Let me save you $180 a year. Your computer can do it for free, locally, and it is fast enough."
tags: ["ai", "whisper", "apple-silicon"]
---

**You do not need to pay for a dictation app on a Mac.** Let me save you $180 a year.

Your computer can do it for free, locally, and it is fast enough.

---

## TL;DR

- **WhisperFlow costs $12–15/month.** Your Mac can do the same thing locally, for free.
- Install **[Handy](https://github.com/cjpais/Handy)** (`brew install --cask handy`), pick the **Whisper large-v3-turbo** model, set a hotkey.
- **3 seconds locally vs. 1 second on the cloud** for 42s of audio. Yes, technically 3× slower — but for dictation, it is more than enough.
- Quality is excellent, including **Czech + English mixed speech**.
- Your voice never leaves your Mac. No subscription, no vendor risk.

---

## My story, short version

I was on **Wispr Flow's free tier**. Good product. But I was hitting the **2,000 words/week** limit almost every day. The paid plan is **$12–15/month** — and I just did not want to pay that for something my Mac should be able to do on its own.

I looked at one-time purchase apps (Sotto, VoiceInk, MacWhisper). But this market moves fast — I did not want to buy something and then see a better free app next month.

So I tried open source. And I realized something:

**Open source dictation apps still need a model.** They either run a local one (Whisper, Parakeet) on your Mac, or they call a cloud API — usually **[Groq](https://groq.com/)** because it is the fastest. Groq is great, but you still send your voice to a server.

**And here is something to keep in mind:** Groq is currently **free for personal use** (with generous rate limits). That is why everyone recommends it right now. But companies usually do this to get users in the door — free tokens today, paid plans tomorrow. The moment Groq tightens the free tier, everyone using an app that depends on Groq will be looking for a new solution again. Running locally means you do not care when that happens.

So I tested **local**. And it works.

---

## What I was afraid of, and what actually happened

I was worried that running a speech model on my Mac would make it hot and slow. It did not. The models are small enough (**~1.5 GB** for Whisper large-v3-turbo), and Apple Silicon handles them well. My **Mac Mini M4** does not even notice.

Quick numbers from my test on 42 seconds of Czech + English mixed audio:

| Approach                        | Time | vs Groq            | Quality      |
| ------------------------------- | ---- | ------------------ | ------------ |
| **Groq API** (cloud)            | 1.0s | baseline (fastest) | Perfect      |
| **whisper-cpp + Metal** (local) | 3.0s | 3× slower          | Perfect      |
| Whisper sherpa-onnx (CPU)       | 5.7s | ~6× slower         | Good         |
| Parakeet (CoreML)               | 7.8s | ~8× slower         | Minor errors |

Groq is the fastest, but **3× slower locally still means 3 seconds for 42 seconds of audio**. In practice, I cannot tell the difference.

### What this means for longer recordings

If you record something longer — like a meeting, a voice memo, or a long thought — here is what you would wait for (projected from the 42-second benchmark):

| Audio length | Groq (cloud) | whisper-cpp + Metal (local) |
| ------------ | ------------ | --------------------------- |
| 1 minute     | ~1 second    | ~4 seconds                  |
| 5 minutes    | ~7 seconds   | ~22 seconds                 |
| 10 minutes   | ~14 seconds  | ~43 seconds                 |
| 60 minutes   | ~1.4 minutes | ~4.3 minutes                |

*These are linear projections from the 42-second benchmark. Actual times on your machine can vary — model load time, chunking overhead, and your specific build of whisper.cpp all matter.*

For **short dictation — 30 seconds to 2 minutes** — local is more than enough. This is my use case. I am writing this blog post by dictating short thoughts one at a time, and the 3–4 second delay does not bother me.

For **long recordings — 30+ minute meetings, long transcriptions** — I would probably use **Groq API** instead. If local takes a few minutes for a 1-hour meeting, Groq does it in about a minute and costs pennies. Right tool for the job.

And the quality surprised me. My native language is **Czech**, and I often mix English into Czech sentences. Most speech models struggle with this. Local Whisper handled it well.

### Real example

Here is a short clip I recorded (18.5 seconds, Czech + English):

> _Tohle je test. By mě zajímalo, jak moc to bude přesný. And also I'll try to speak in English, jestli to dokáže udělat i oboje jazyky. A pak některá slova jako Open Code, Cloud Code CLI a tak._

**Groq API (0.5s)** — perfect, identical to what I said.

**whisper-cpp + Metal, local (1.6s)** — also perfect, identical.

**Parakeet (CoreML) (1.2s)** — small mistakes. "By mě zajímalo" became "aby mě zajímalo." "And also" became "A also." "Cloud Code CLI" became "kotko CLI."

So Whisper (local or Groq) handles Czech + English mixing perfectly. Parakeet is fast but struggles with Czech.

---

## My real numbers

I use **Handy** every day. It saves the last few dictations, so I looked at mine:

|                                        |                 |
| -------------------------------------- | --------------- |
| Average dictation                      | **~30 words**   |
| Audio length                           | **~15 seconds** |
| Local processing (whisper.cpp + Metal) | **~1.1 s**      |
| Groq processing                        | **~0.4 s**      |

I have dictated **~260 times in the first two weeks** with Handy. Over all those dictations, Groq would save me **~3 minutes of waiting** — in exchange for sending every clip to a server.

Not worth it. Local wins.

---

## The apps I tried

- **[Handy](https://github.com/cjpais/Handy)** ✅ Daily driver. Free, open source, most GitHub stars and most active. Wraps whisper.cpp. Set a hotkey, done.
- **[VoiceInk](https://github.com/Beingpax/VoiceInk)** ❌ Source is GPL v3 (so technically free), but the developer sells the binary for **$25–49**. You can build it yourself with Xcode, but if you want the easy path, you pay. I did not love that.
- **[FreeFlow](https://github.com/zachlatta/freeflow)** ⚠️ Tried it. Smaller and less active than Handy.

Others I did not install but exist: **[Sotto](https://sotto.to/)** ($49 one-time, polished), **[FluidVoice](https://github.com/altic-dev/FluidVoice)**, **[OpenWhispr](https://github.com/OpenWhispr/openwhispr)**, **[VoiceTypr](https://github.com/moinulmoin/voicetypr)**, **[TypeWhisper](https://github.com/TypeWhisper/typewhisper-mac)**, **[Open-Wispr](https://github.com/human37/open-wispr)**.

---

## The models I tried locally

Handy downloaded four models on my Mac. Here is what I have:

| Model | Size | What it is |
|-------|------|------------|
| **[Whisper large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo)** ✅ | 1.5 GB | My primary model. Fast and accurate. |
| [Whisper large-v3 (q5_0)](https://huggingface.co/ggerganov/whisper.cpp) | 1.0 GB | Smaller quantized Whisper. A good backup. |
| [NVIDIA Canary 1B v2](https://huggingface.co/nvidia/canary-1b-v2) | 982 MB | Multilingual model. Did not test much. |
| [NVIDIA Parakeet TDT v3 (int8)](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3) ⚠️ | 640 MB | Fastest. But weaker on mixed languages. |

I use **Whisper large-v3-turbo** every day. It handles my Czech + English mixing well.

I also tried **Parakeet**. It is fast and lightweight, but I found it **weaker when I mix Czech with English in the same sentence**. For pure English it is probably great. For how I actually talk — switching between two languages mid-sentence — Whisper wins clearly.

Total disk space for all four models: **~4 GB**. If you only keep Whisper turbo, it is 1.5 GB.

---

## What Handy is missing

**Streaming preview.** When you speak, Wispr Flow shows the text appearing live. Handy waits until you stop, then pastes. It works, but live preview is a nicer feel.

Someone tried to add it — [PR #864](https://github.com/cjpais/Handy/pull/864) — but the pull request was closed without being merged (February 2026). **[TypeWhisper](https://github.com/TypeWhisper/typewhisper-mac)** already has streaming preview, so that is on my list to try.

---

## One small pain

Sometimes I talk for a full minute and the audio is lost. It happens rarely. And it happened on Wispr Flow too — so it is not a local problem, just a general dictation problem.

---

## How to stop paying

1. **Install [Handy](https://github.com/cjpais/Handy).** `brew install --cask handy` or download from GitHub.
2. Pick the **Whisper large-v3-turbo** model.
3. Set a hotkey.
4. **Cancel your subscription.**

That is it. Under 15 minutes.

If you prefer the terminal, skip the app and use whisper.cpp directly:

```bash
brew install whisper-cpp
curl -LO https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin
whisper-cli -m ggml-large-v3-turbo.bin audio.wav
```

---

## One last thing

I would like to try **TypeWhisper** for the streaming preview. But honestly, I have tool fatigue from testing all of these. The only thing I am missing is live preview, and I can live without it for now. So I am staying on Handy.

If you use something different and you like it, **tell me**. I am curious what works for other people.

---

_I wrote this whole post by dictation. It worked. Mac Mini M4, 16 GB RAM, macOS, whisper-cpp 1.8.3, April 2026._
