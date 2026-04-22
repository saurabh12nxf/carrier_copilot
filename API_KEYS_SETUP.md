# 🔑 API Keys Setup Guide

Your Career Copilot now supports **Multi-LLM** with automatic fallback!

## How It Works

The system tries LLMs in this order:
1. **Gemini** (Primary - Free, Fast) ✅
2. **OpenAI** (Secondary - Paid, High Quality) 💰
3. **Groq** (Tertiary - Free, Very Fast) ⚡
4. **Rule-based Fallback** (Always works) 🛡️

If one fails, it automatically tries the next!

---

## 1. Gemini API Key (FREE - Recommended)

### Get Your Key:
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Add to .env:
```env
GEMINI_API_KEY=AIzaSyBb_kZqI2N2kdF4g9wh7Lm4fkkw2PBdE-Y
```

### Limits:
- ✅ FREE forever
- ✅ 60 requests/minute
- ✅ Good quality
- ⚠️ Can hit quota limits

---

## 2. OpenAI API Key (PAID - Optional)

### Get Your Key:
1. Go to: https://platform.openai.com/api-keys
2. Create account (requires credit card)
3. Click "Create new secret key"
4. Copy the key

### Add to .env:
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

### Pricing:
- GPT-4o-mini: $0.15 per 1M input tokens
- GPT-4o: $2.50 per 1M input tokens
- Very affordable for this use case (~$0.01 per analysis)

### Why Use It:
- ✅ Very high quality
- ✅ Reliable
- ✅ Fast
- 💰 Costs money (but cheap)

---

## 3. Groq API Key (FREE - Recommended)

### Get Your Key:
1. Go to: https://console.groq.com/keys
2. Sign up (free)
3. Click "Create API Key"
4. Copy the key

### Add to .env:
```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
```

### Why Use It:
- ✅ FREE
- ✅ VERY FAST (fastest LLM API)
- ✅ Good quality (Llama 3.3 70B)
- ✅ High rate limits

---

## Quick Setup (Recommended)

### Option 1: Gemini Only (Free)
```env
GEMINI_API_KEY=your_key_here
# Leave others empty
```

### Option 2: Gemini + Groq (Both Free!)
```env
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
# Best free setup!
```

### Option 3: All Three (Maximum Reliability)
```env
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
# Never fails!
```

---

## Installation Steps

1. **Copy .env.example to .env**
```bash
cd backend
copy .env.example .env
```

2. **Add your API keys to .env**
```env
GEMINI_API_KEY=AIzaSyBb_kZqI2N2kdF4g9wh7Lm4fkkw2PBdE-Y
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
# OPENAI_API_KEY=sk-proj-xxxxx (optional)
```

3. **Install required packages**
```bash
pip install google-generativeai openai groq
```

4. **Restart backend**
```bash
python main.py
```

5. **Check logs**
You should see:
```
[RAG] ✨ Enhanced RAG service initialized
[RAG] 🤖 Available LLMs: gemini, groq, fallback
```

---

## Testing

### Test Gemini:
```python
import google.generativeai as genai
genai.configure(api_key="YOUR_KEY")
model = genai.GenerativeModel('gemini-flash-latest')
response = model.generate_content("Hello!")
print(response.text)
```

### Test OpenAI:
```python
from openai import OpenAI
client = OpenAI(api_key="YOUR_KEY")
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

### Test Groq:
```python
from groq import Groq
client = Groq(api_key="YOUR_KEY")
response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

---

## Troubleshooting

### "Gemini quota exceeded"
- ✅ System automatically switches to OpenAI or Groq
- ✅ Or uses rule-based fallback
- Wait 1 minute and try again

### "OpenAI API key invalid"
- Check if key starts with `sk-proj-` or `sk-`
- Make sure you added credits to your account
- System will use Groq or fallback

### "All LLMs failed"
- ✅ System uses rule-based fallback
- ✅ Still works perfectly!
- ✅ Just uses pre-programmed role data

---

## Cost Comparison

| Provider | Cost | Speed | Quality | Limits |
|----------|------|-------|---------|--------|
| Gemini | FREE | Fast | Good | 60/min |
| OpenAI | ~$0.01/analysis | Fast | Excellent | High |
| Groq | FREE | Very Fast | Good | High |
| Fallback | FREE | Instant | Good | Unlimited |

---

## Recommended Setup for Students

**Best Free Setup:**
```env
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
```

This gives you:
- ✅ Two free LLM providers
- ✅ Automatic fallback
- ✅ High quality results
- ✅ No costs!

---

## Current Status

Your system currently has:
- ✅ Gemini API key configured
- ⚠️ OpenAI not configured (optional)
- ⚠️ Groq not configured (recommended)

**Recommendation:** Add Groq API key for free backup!

---

## Support

- Gemini: https://ai.google.dev/docs
- OpenAI: https://platform.openai.com/docs
- Groq: https://console.groq.com/docs

---

**Status**: Multi-LLM system ready!
**Date**: April 22, 2026
**Fallback Levels**: 4 (Gemini → OpenAI → Groq → Rule-based)
