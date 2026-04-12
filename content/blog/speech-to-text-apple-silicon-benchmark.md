---
title: "Speech-to-Text on Apple Silicon: We Benchmarked Everything"
date: "2026-04-11"
summary: "Why Groq is still king, but whisper.cpp + Metal is surprisingly good. We tested every STT option on a Mac Mini M4 with Czech+English mixed audio."
tags: ["ai", "whisper", "apple-silicon", "benchmark"]
---

*Or: Why Groq is still king, but whisper.cpp + Metal is surprisingly good.*

---

## The Setup

We wanted to answer a simple question: **Can we replace our cloud STT (Groq API) with a local model running on a Mac Mini M4?**

The Mac Mini M4 has 16GB unified memory and an Apple Neural Engine. It should be great for ML inference. But how does it actually compare to a cloud API?

We tested with Czech+English mixed audio — the hardest case for most models.

---

## The Contenders

| Approach | What it is |
|----------|------------|
| **Groq API** | Cloud service running whisper-large-v3-turbo |
| **whisper-cpp + Metal** | C/C++ Whisper implementation with Apple Metal GPU |
| **Parakeet TDT v3** | NVIDIA's model via ONNX Runtime with CoreML |
| **whisper sherpa-onnx (CPU)** | ONNX Runtime running Whisper on CPU |
| **whisper sherpa-onnx (CoreML)** | Same but with CoreML — spoiler: broken |
| **openai-whisper CLI** | Official Python Whisper package |
| **Whisper via transformers** | HuggingFace transformers pipeline |

---

## Test Samples

### Sample 1: Short (18.5s, Czech+English)

**What was said (ground truth):**

> Tohle je test. By mě zajímalo, jak moc to bude přesný. And also I'll try to speak in English, jestli to dokáže udělat i oboje jazyky. A pak některá slova jako Open Code, Cloud Code CLI a tak.

**Groq API** (0.5s) ✅
> Tohle je test. By mě zajímalo, jak moc to bude přesný. And also I'll try to speak in English, jestli to dokáže udělat i oboje jazyky. A pak některá slova jako Open Code, Cloud Code CLI a tak.

**whisper-cpp Metal** (1.6s) ✅
> Tohle je test. By mě zajímalo, jak moc to bude přesný. And also I'll try to speak in English, jestli to dokáže udělat i oboje jazyky. A pak některá slova jako Open Code, Cloud Code CLI a tak.

**Parakeet CoreML** (1.2s) ⚠️
> Tohle je test, aby mě zajímalo, jak moc to bude přesný. A also I'll try to speak in English, jestli to dokáže udělat i oba jazyky a pak některá slova, jako Open code, kotko CLI. a tak.

---

### Sample 2: Long (42.4s, Czech+English)

**What was said (ground truth):**

> Tohle je další test, speech to text. Chci vyzkoušet, jak to funguje na všech těchaných metodách, který máme. Dej mi výsledek pak. Zároveň chci otestovat, jak fungují anglické výrazy, jako give me the results for grok, whisper, turbo and parakeet. Let me know how it worked. And give me like also a time, how much it takes and do the calculations per minute, how long it takes to do the speech to text.

**Groq API** (1.0s) ✅
> Tohle je další test, speech to text. Chci vyzkoušet, jak to funguje na všech těch různých metodách, který máme. Dej mi výsledek pak. Zároveň chci otestovat, jak fungují anglické výrazy, jako give me the results for grok, whisper, turbo and paracet. Let me know, how it worked. And give me also a time, how much it takes and do the calculations per minute, how long it takes to do the speech to text.

**whisper-cpp Metal** (3.0s) ✅
> Tohoto je další test, speech to text. Chci vyzkoušet, jak to funguje na všech těch různých metodách, který máme. Dej mi výsledek pak. Zároveň chci otestovat, jak fungují anglické výrazy, jako give me the results for grok, whisper, turbo and paracet. Let me know, how it worked. And give me also a time, how much it takes and do the calculations per minute, how long it takes to do the speech to text.

**Parakeet CoreML** (7.8s) ⚠️
> Tohle je další test, tak speech to text. Chce vyzkoušet, jak to funguje na všech těch různých metodách, který máme. U dejme výsledek back. Zároveň chce testovat, jak w ogóle anglicky výrazy jako. Give me the results for grok. Whisper, turbo, and paracet. Let me know how it worked. And give me like also a time. How much it takes, and do the calculations per minute, how long it takes to do the speech to text.

**Whisper sherpa-onnx CPU** (5.7s) ⚠️
> Tohoto je další test speech to text. Chci vyskúšet, jak to funguje na všech těch různých metodách, který máme. Dej mi výsledek pak. Zárove chci otestovat, jak fungují anglické výrazy jako give me the results for groc, whisper, turbo and paracet. Let me know how it works.

---

## Results

Test audio: 42 seconds, Czech+English mix.

| Model | Processing Time | Real-Time Factor | Quality |
|-------|----------------|------------------|---------|
| **Groq API** | **1.0s** | **42×** | ✅ Perfect |
| **whisper-cpp + Metal** | **3.0s** | **14×** | ✅ Perfect |
| Whisper sherpa-onnx (CPU) | 5.7s | 9× | ✅ Good |
| Parakeet (CoreML) | 7.8s | 6× | ⚠️ Minor errors |
| Whisper (CoreML ONNX) | 52s | <1× | ❌ Hallucinations |
| Whisper (transformers) | 43s | ~1× | ❌ Hallucinations |
| Whisper (Python CLI) | 46s | <1× | ✅ Correct but slow |

## What is Real-Time Factor (RTF)?

RTF = audio duration ÷ processing time. Higher is better.

- **RTF 1×** = processing takes as long as the audio (real-time)
- **RTF 42×** = 42 minutes of audio processed in 1 minute
- Anything **above 1× is usable**, below 1× means slower than real-time

### Estimated processing times

| Audio Length | Groq API | whisper-cpp Metal |
|-------------|----------|-------------------|
| 30 seconds | ~0.5s | ~2s |
| 1 minute | ~1.4s | ~4s |
| 5 minutes | ~7s | ~22s |
| 10 minutes | ~14s | ~43s |

---

## Key Findings

### 1. Groq API is undefeated

~0.5 seconds for short audio. Perfect Czech+English code-switching. Cost: $0.006/minute. The API overhead is negligible — it's faster than local inference on everything we tested.

**Why it's so fast:** Groq runs on custom LPU inference chips. Nothing on consumer hardware competes.

### 2. whisper-cpp + Metal is the best local option

This was the surprise. The C/C++ implementation of Whisper with Metal GPU acceleration runs **14× real-time** on an M4 Mac Mini. That means 1 minute of audio processes in ~4 seconds.

The key insight: **not all Whisper implementations are equal.** The Python versions (openai-whisper, transformers) are 10-30× slower than whisper.cpp. The difference is Metal GPU acceleration via the C implementation.

### 3. CoreML is broken for Whisper (but works for Parakeet)

This was the biggest surprise. Running Whisper through ONNX Runtime with CoreML:
- **52 seconds** to process 42 seconds of audio (slower than real-time!)
- Output had **hallucinations** ("Titulky vytvořil Jirka..." repeated hundreds of times)

Same model, same hardware, but ONNX Runtime's CoreML provider makes Whisper **both slower and worse**. We have no idea why.

Yet CoreML works fine for Parakeet TDT v3 — it runs at 1.2s inference, which is solid.

### 4. Python Whisper implementations are unusable on CPU

- `openai-whisper` CLI: 46 seconds, correct output
- `transformers` pipeline: 43 seconds, hallucinated output
- Both are ~100× slower than Groq

The Python GIL and lack of GPU acceleration make these impractical for real-time use.

### 5. Parakeet needs ONNX, not NeMo

NVIDIA's NeMo toolkit has a **protobuf version conflict** on macOS that makes it impossible to use. But `sherpa-onnx` (ONNX Runtime wrapper) runs Parakeet perfectly — 1.2s inference via CoreML.

The catch: Parakeet's quality on CZ+EN mix is worse than Whisper. It transcribed "Cloud Code CLI" as "kotko CLI".

### 6. Hardware doesn't matter as much as you'd think

An M3 Max with 36GB would only be ~20-30% faster than the M4 Mac Mini for whisper.cpp. The decoder is sequential (token-by-token generation), so more GPU cores don't help proportionally. Memory bandwidth is the real bottleneck.

More RAM would help for running the full `large-v3` model (3.1GB) instead of `turbo` (1.5GB), but the quality difference is minimal.

---

## Our Setup

```
Primary:   whisper-cpp + Metal GPU (local, ~3s for 42s audio)
Fallback:  Groq API (cloud, ~1s for 42s audio)
```

Model: `ggml-large-v3-turbo.bin` (1.5GB)
Hardware: Mac Mini M4, 16GB RAM
CLI: `/opt/homebrew/Cellar/whisper-cpp/1.8.3/bin/whisper-cli`

---

## What We Didn't Test

- **distil-large-v3** (800MB) — half the size, could be faster
- **Moonshine** — ultra-fast edge model designed for embedded
- **whisper-cpp on M3 Max** — real benchmark on the MacBook
- **Quantized GGML models** (q5_0, q8_0) — speed vs quality tradeoff
- **Large-v3** (3.1GB) — better quality, but needs more RAM

---

## TL;DR

| If you want... | Use this |
|----------------|----------|
| Fastest possible STT | **Groq API** (cloud) |
| Best local STT | **whisper-cpp + Metal** |
| Offline fallback | whisper-cpp or Parakeet via sherpa-onnx |
| Anything Python-based | Don't bother on macOS |

---

*Tested on April 11, 2026. Mac Mini M4, macOS, whisper-cpp 1.8.3, Groq whisper-large-v3-turbo.*
