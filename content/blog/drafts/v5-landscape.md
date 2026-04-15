---
title: "The Mac dictation app landscape in 2026"
date: "2026-04-15"
summary: "I just wanted a button that turns my voice into text. But the market is full of options, so I tested them. Here is what I learned."
tags: ["ai", "whisper", "apple-silicon", "comparison"]
---

My use case is simple. I think most people's are.

**Press a button. Talk. See the text.** That is all I want. I am not building a meeting transcription tool or a podcast pipeline. Button. Talk. Text.

And yet — there are dozens of apps for this. Subscriptions. One-time purchases. Open source. It feels too complicated for a simple problem. So I tested the ones I cared about, and I am writing this post (by dictation, with my final setup) to save you some time.

---

## My story

I started with **Wispr Flow**'s free tier. It worked great. Then I hit the limit: 2,000 words per week on Mac. The paid plan is $15/month ($12 if you pay for the year). I was not ready to pay $144–180 a year for a button.

I started dictating more — short prompts to Claude Code like "fix it," "read the file," "commit this" — and I hit the weekly limit faster.

So I looked at **one-time purchase** apps (Sotto, VoiceInk, MacWhisper). They are cheaper over time. But this market moves fast. I did not want to buy something and then see a better free app a month later.

So I tried the **open source** apps.

And here is the thing I did not understand at first: all of them use the same two options under the hood. They run a local model (Whisper, Parakeet) on your Mac, or they call a cloud API — usually Groq, because Groq is the fastest.

Groq is really fast. But you still send your voice to a server. For a two-word prompt like "fix it," that felt like too much.

So I tested the **local** path. And it works.

---

## What I was afraid of, and what actually happened

I was worried that running a speech model on my Mac would make it hot and slow. It did not. The models are small enough (~1.5 GB for Whisper large-v3-turbo), and Apple Silicon handles them well. My Mac Mini M4 does not even notice.

Quick numbers from my test on 42 seconds of Czech + English mixed audio:

| Approach | Time | Real-time factor | Quality |
|----------|------|------------------|---------|
| **Groq API** (cloud) | 1.0s | 42× | Perfect |
| **whisper-cpp + Metal** | 3.0s | 14× | Perfect |
| Whisper sherpa-onnx (CPU) | 5.7s | 9× | Good |
| Parakeet (CoreML) | 7.8s | 6× | Minor errors |

Groq is 3× faster than local. But in practice, I cannot tell the difference. Three seconds for a 42-second clip is fine for me.

### My real numbers

To check this, I looked at my own Handy usage. On average, one of my dictations is:

| | |
|-|-|
| Words | ~30 |
| Audio length | ~15 seconds |
| Local transcription (whisper.cpp + Metal) | ~1.1 seconds |
| Groq transcription | ~0.4 seconds |

So Groq would save me about **0.7 seconds per dictation**. I have dictated about 260 times in two weeks. That is roughly **three minutes of waiting saved across two weeks** — in exchange for sending every voice clip to a server. Not worth it for me.

The bigger surprise: **quality.** My native language is Czech, and I often mix English words into Czech sentences. Most speech models struggle with this. Local Whisper handled it well.

---

## The apps I actually tried

- **[Handy](https://github.com/cjpais/Handy)** ✅ This is my daily driver. It is free, open source, and has the most GitHub stars and the most active development of the ones I checked. It wraps whisper.cpp under the hood. You pick a model, set a hotkey, and that is it.
- **[VoiceInk](https://github.com/Beingpax/VoiceInk)** ❌ Did not stick with it. The source is GPL v3 (so technically free), but the developer sells the compiled app for $25–49. You can build it yourself with Xcode, but if you want the easy path, you pay. I did not love that.
- **[FreeFlow](https://github.com/zachlatta/freeflow)** ⚠️ Tried it, but it is smaller and less active than Handy.

I looked at several others from the web — Sotto, Superwhisper, MacWhisper, FluidVoice, OpenWhispr, VoiceTypr, TypeWhisper, Open-Wispr, Whisper-Writer — but I did not install them. Handy was already good enough.

---

## The full landscape, by price

If you want to see the whole market before you pick one:

### Subscription

**[Wispr Flow](https://wisprflow.ai/)** — $15/mo or $12/mo annual. Free tier 2,000 words/week. Mac, Windows, iPhone, Android. Cloud-based. Polished.

### One-time purchase

**[Sotto](https://sotto.to/)** — $49, 3 devices. Mac only. Local WhisperKit + Parakeet. Optional cloud via your own OpenAI / Groq key.

**[VoiceInk](https://tryvoiceink.com/)** — $25 / $39 / $49 for 1 / 2 / 3 Macs. Source is free on GitHub (GPL v3), binary is paid.

### Free and open source

- **[Handy](https://github.com/cjpais/Handy)** — most active project. Mac + Windows + Linux.
- **[OpenWhispr](https://github.com/OpenWhispr/openwhispr)** — cross-platform.
- **[FluidVoice](https://github.com/altic-dev/FluidVoice)** — GPL v3, Mac only. Many models.
- **[VoiceTypr](https://github.com/moinulmoin/voicetypr)** — Mac + Windows.
- **[FreeFlow](https://github.com/zachlatta/freeflow)** — directly named against Wispr Flow.
- **[TypeWhisper](https://github.com/TypeWhisper/typewhisper-mac)** — has streaming preview (see text while you speak).
- **[Open-Wispr](https://github.com/human37/open-wispr)** — popular with Claude Code users.
- **[Whisper-Writer](https://github.com/savbell/whisper-writer)** — older, Python, cross-platform.

### No GUI

If you are happy with a terminal, you can skip the apps and use **whisper.cpp** directly — it is what many of these apps wrap:

```bash
brew install whisper-cpp
curl -LO https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin
whisper-cli -m ggml-large-v3-turbo.bin audio.wav
```

On a Mac Mini M4 this runs at 14× real-time. No app, no subscription.

---

## What I wish Handy had

One thing Wispr Flow does well and Handy does not: **streaming preview.** When you speak, you see the text appearing live. In Handy, you talk, stop, and then the text arrives. It works, but live preview feels nicer.

Someone tried to add it — [PR #864](https://github.com/cjpais/Handy/pull/864) "feat: add streaming transcription preview to recording overlay" — but the pull request was closed and not merged (February 2026). So it is on the community's mind, just not shipped yet.

**[TypeWhisper](https://github.com/TypeWhisper/typewhisper-mac)** already has streaming preview, so that is on my list to try.

## One small pain (not Handy's fault)

Sometimes I dictate for a full minute and the audio does not come through. I lose the whole thing. It is rare. And I had the same problem on Wispr Flow too, so it is not a local-vs-cloud issue. Probably a microphone or OS issue I have not debugged.

---

## What none of these apps will change

All the apps in the free and one-time tier run the same engines — Whisper, Parakeet, sometimes Apple Speech. **The quality ceiling is the model, not the app.** If Whisper large-v3-turbo is good enough in Handy, it will be good enough in Sotto or VoiceInk too.

What you pay for in the paid apps is **polish**: hotkey reliability, custom vocabulary, nicer UI, support. That is a real product. Just know you are not buying better transcription.

---

## My setup today

```
GUI:       Handy (daily driver, for anything)
CLI:       whisper.cpp + Metal (when I need speed or scripting)
Fallback:  Groq API ($0.006/min, almost never used)
```

Ongoing cost: $0.

If your use case is "press button, talk, see text" — which I think is most people's — you do not need a subscription. Install Handy, pick Whisper turbo, go back to your life.

I wrote this whole post by dictation. It worked.

---

## One last thing

I would like to try TypeWhisper for the streaming preview. But honestly, I have tool fatigue from testing all of these. The only thing I am missing is live preview, and I can live without it for now. So I am staying on Handy.

If you use something different and you like it, tell me. I am curious what works for other people — especially anything I did not cover here.

---

*Mac Mini M4, 16 GB RAM, macOS, whisper-cpp 1.8.3. April 2026. Not affiliated with any product named.*
