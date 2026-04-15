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

- Just use [**Handy.computer**](https://handy.computer/) with the **Whisper large-v3-turbo** model if you are on an Apple Silicon Mac.
- **WhisperFlow costs $12–15/month.** Your Mac can do the same thing locally, for free.
- **3 seconds locally vs. 1 second on the cloud** for 42s of audio. 3× slower, but for dictation more than enough.
- Quality is excellent, including **Czech + English mixed speech**.
- Your voice never leaves your Mac. No subscription, no vendor risk.

---

## My story, short version

I was on [**Wispr Flow**](https://wisprflow.ai/)'s free tier. Good product. But I was hitting the 2,000 words/week limit almost every day. The paid plan is $12–15/month, and I just did not want to pay that for something my Mac should be able to do on its own.

I looked at one-time purchase apps ([**Sotto**](https://sotto.to/), [**VoiceInk**](https://github.com/Beingpax/VoiceInk), [**MacWhisper**](https://goodsnooze.gumroad.com/l/macwhisper)). But this market moves fast. I did not want to buy something and then see a better free app next month.

So I tried open source. And I realized the apps all still need a model. They either run a local one ([**Whisper**](https://github.com/openai/whisper), [**Parakeet**](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)) on your Mac, or they call a cloud API, usually [**Groq**](https://groq.com/) because it is the fastest. Groq is great, but you still send your voice to a server.

So I tested local. And it works.

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

### When to use local vs Groq API

**Use local** for short dictation — under 2 minutes. Quick thoughts, Claude Code prompts, messages, short notes. This is my daily use case. I am writing this blog post that way, one thought at a time. Local takes a few seconds and is more than enough.

**Use Groq API** for long recordings — 30+ minute meetings, long transcriptions, voice memos. Groq does an hour in about a minute and costs pennies. Worth it when you do not want to wait.

---

## My real numbers with Handy

I use **Handy** every day. It saves the last few dictations, so I looked at mine:

|                                        |                 |
| -------------------------------------- | --------------- |
| Average dictation                      | **~30 words**   |
| Audio length                           | **~15 seconds** |
| Local processing (whisper.cpp + Metal) | **~1.1 s**      |
| Groq processing                        | **~0.4 s**      |

I have dictated ~260 times in the first two weeks with Handy. Over all those dictations, Groq would save me about 3 minutes of waiting, in exchange for sending every clip to a server. Not worth it.

### Real example

The quality surprised me. My native language is Czech, and I often mix English into Czech sentences. Most speech models struggle with this. Here is a short clip I recorded (18.5 seconds, Czech + English):

> _Tohle je test. By mě zajímalo, jak moc to bude přesný. And also I'll try to speak in English, jestli to dokáže udělat i oboje jazyky. A pak některá slova jako Open Code, Cloud Code CLI a tak._

**Groq API (0.5s)** — perfect, identical to what I said.

**whisper-cpp + Metal, local (1.6s)** — also perfect, identical.

**Parakeet (CoreML) (1.2s)** — small mistakes. "By mě zajímalo" became "aby mě zajímalo." "And also" became "A also." "Cloud Code CLI" became "kotko CLI."

So Whisper (local or Groq) handles Czech + English mixing perfectly. Parakeet is fast but struggles with Czech.

---

## The alternatives

If you are deciding what to switch to, here is what the market actually looks like, sorted by how much money leaves your wallet.

### Subscription

| App                                          | Cost                         | Notes                                                     |
| -------------------------------------------- | ---------------------------- | --------------------------------------------------------- |
| [**Wispr Flow**](https://wisprflow.ai/) Pro  | $12–15/month ($144–180/year) | Cloud-based, polished. Free tier: 2,000 words/week        |
| [**Whisper Flow**](https://whisperflow.app/) | $99–299/month                | Different product, confusingly similar name. No free tier |

### One-time purchase

| App                                                  | License     | Cost                         | Notes                                       |
| ---------------------------------------------------- | ----------- | ---------------------------- | ------------------------------------------- |
| [**Sotto**](https://sotto.to/)                       | Proprietary | $49 (3 devices)              | Polished, Mac-native. WhisperKit + Parakeet |
| [**VoiceInk**](https://github.com/Beingpax/VoiceInk) | GPL v3      | $25 / $39 / $49 (1/2/3 Macs) | Or $0 if you build from source              |

### Open source (free)

| App                                                               | ⭐ Stars | License  | Notes                                           |
| ----------------------------------------------------------------- | -------- | -------- | ----------------------------------------------- |
| [**Handy**](https://github.com/cjpais/Handy) ✅                   | 20.0k    | MIT      | My daily driver. Most active, wraps whisper.cpp |
| [**VoiceInk**](https://github.com/Beingpax/VoiceInk)              | 4.6k     | GPL-3.0  | Build with Xcode                                |
| [**OpenWhispr**](https://github.com/OpenWhispr/openwhispr)        | 2.4k     | MIT      | Mac + Windows + Linux                           |
| [**FluidVoice**](https://github.com/altic-dev/FluidVoice)         | 1.8k     | GPL-3.0  | Parakeet + Whisper + Apple Speech               |
| [**FreeFlow**](https://github.com/zachlatta/freeflow)             | 1.3k     | MIT      | Named as the Wispr Flow alternative             |
| [**TypeWhisper**](https://github.com/TypeWhisper/typewhisper-mac) | 754      | GPL-3.0  | Has streaming preview                           |
| [**VoiceTypr**](https://github.com/moinulmoin/voicetypr)          | 361      | AGPL-3.0 | Mac + Windows                                   |
| [**Open-Wispr**](https://github.com/human37/open-wispr)           | 99       | MIT      | Popular with Claude Code users                  |
| [**whisper.cpp CLI**](https://github.com/ggml-org/whisper.cpp)    | 48.6k    | MIT      | No GUI, the engine most apps wrap               |

_Not an app, but worth mentioning: [**Groq API**](https://groq.com/) — cloud transcription, pennies per hour, free personal tier right now._

---

## The models I tried locally

Handy downloaded four models on my Mac. Here is what I have:

| Model                                                                                      | Size   | What it is                                |
| ------------------------------------------------------------------------------------------ | ------ | ----------------------------------------- |
| [**Whisper large-v3-turbo**](https://huggingface.co/openai/whisper-large-v3-turbo) ✅      | 1.5 GB | My primary model. Fast and accurate.      |
| [**Whisper large-v3 (q5_0)**](https://huggingface.co/ggerganov/whisper.cpp)                | 1.0 GB | Smaller quantized Whisper. A good backup. |
| [**NVIDIA Canary 1B v2**](https://huggingface.co/nvidia/canary-1b-v2)                      | 982 MB | Multilingual model. Did not test much.    |
| [**NVIDIA Parakeet TDT v3 (int8)**](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3) ⚠️ | 640 MB | Fastest. But weaker on mixed languages.   |

I stick with **Whisper large-v3-turbo**. Parakeet is the smallest and fastest, but as the earlier example showed, it trips on Czech + English mixing. For pure English it is probably great.

Total disk space for all four models: **~4 GB**. If you only keep Whisper turbo, it is 1.5 GB.

---

## How to install Handy

1. Install [**Handy**](https://github.com/cjpais/Handy) — `brew install --cask handy`
2. Pick the **Whisper large-v3-turbo** model.
3. Set a hotkey.
4. **Cancel your subscription.**

Under 15 minutes. Or just tell an AI agent (Claude Code, Cursor, Codex) to read this article and set it up for you.

## One thing I'm missing from Handy

**Streaming preview.** When you speak, Wispr Flow shows the text appearing live. Handy waits until you stop, then pastes. It works, but live preview is a nicer feel.

Someone tried to add it ([**PR #864**](https://github.com/cjpais/Handy/pull/864)), but it was closed without being merged in February 2026. [**TypeWhisper**](https://github.com/TypeWhisper/typewhisper-mac) already has streaming preview, so that is on my list to try.

Also sometimes I talk for a full minute and the audio is lost. It happens rarely. And it happened on Wispr Flow too. Not a local problem, just a general dictation problem.

---

There are now so many open-source tools built on top of Whisper that honestly, I am a bit tired of trying them all. So tell me — **what do you use, and what works for you?** I am curious.

---

_I wrote this post mostly by dictation and then edit by hand. It worked. Mac Mini M4, 16 GB RAM, macOS, whisper-cpp 1.8.3, April 2026._
