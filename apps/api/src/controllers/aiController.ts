import { Request, Response } from 'express';
import { env } from '../config/env.js';

export async function handleAiAssistantQuery(req: Request, res: Response) {
  try {
    const { prompt, history } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, message: 'A prompt string is required.' });
    }

    if (!env.OPENAI_API_KEY) {
      const responseText = generateSmartAssistantFallback(prompt);
      return res.json({
        success: true,
        data: {
          reply: responseText,
          provider: 'local_fallback'
        }
      });
    }

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are the BusPass Pro AI Assistant. Help passengers with bus pass renewal, fares, routes, schedule queries, and booking guidance concisely and helpfully.'
          },
          ...(Array.isArray(history) ? history : []),
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!openAiResponse.ok) {
      const errText = await openAiResponse.text();
      console.warn('OpenAI API returned non-200:', errText);
      const fallbackMsg = generateSmartAssistantFallback(prompt);
      return res.json({
        success: true,
        data: {
          reply: fallbackMsg,
          provider: 'fallback_due_to_openai_error'
        }
      });
    }

    const data = await openAiResponse.json();
    const reply = data.choices?.[0]?.message?.content || 'I am sorry, I could not process your query.';

    return res.json({
      success: true,
      data: {
        reply,
        provider: 'openai'
      }
    });
  } catch (error: any) {
    console.error('AI Controller error:', error);
    const userPrompt = req.body?.prompt || '';
    const fallbackMsg = generateSmartAssistantFallback(typeof userPrompt === 'string' ? userPrompt : '');
    return res.json({
      success: true,
      data: {
        reply: fallbackMsg,
        provider: 'fallback_due_to_error'
      }
    });
  }
}

function generateSmartAssistantFallback(prompt: string): string {
  const query = prompt.toLowerCase();
  if (query.includes('fare') || query.includes('price') || query.includes('cost')) {
    return 'BusPass Pro offers Monthly (base rate), Quarterly (10% off), Half-Yearly (15% off), and Yearly (20% off) passes. Student & Senior Citizen discounts are automatically applied upon ID verification.';
  }
  if (query.includes('renew') || query.includes('expiry')) {
    return 'Passes can be renewed 7 days prior to expiration. Go to your Dashboard → My Passes → Renew Pass to select duration and pay online.';
  }
  if (query.includes('refund') || query.includes('cancel')) {
    return 'Cancellations before the pass start date receive a 90% refund processed back to your original payment method within 3-5 business days.';
  }
  if (query.includes('route') || query.includes('stop') || query.includes('schedule')) {
    return 'You can check active routes and via stops by clicking on "Routes & Fares" on the navigation bar.';
  }
  return 'Thank you for contacting BusPass Pro Assistant. How can I assist you with your pass booking, routes, or account verification today?';
}
