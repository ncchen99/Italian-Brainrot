const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.validateGorillaPose = onCall({
  secrets: ["OPENAI_API_KEY", "OPENAI_MODEL"],
  maxInstances: 10
}, async (request) => {
  // Check if authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { imageBase64 } = request.data;
  if (!imageBase64) {
    throw new HttpsError('invalid-argument', 'Missing imageBase64 parameter.');
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    logger.error('OPENAI_API_KEY secret is not set.');
    throw new HttpsError('failed-precondition', 'OpenAI API key is not configured on the server.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: `You are an expert game master judge for a campus team challenge. 
Your task is to analyze the user-submitted photo and determine if the students are striking a gorilla-like pose.
Gorilla poses usually involve: thumping their chests, flexing their arms like apes, making fierce or funny shouting faces, or bending slightly forward like a gorilla.
Be fun and relatively generous to keep the game engaging, but make sure they are actually trying to pose or make a gesture rather than just standing still.

Respond ONLY with a JSON object in this format:
{
  "passed": true/false,
  "reason": "A brief, encouraging explanation in Traditional Chinese (zh-TW) of your judgment."
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this photo and tell me if they are posing like gorillas.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error('OpenAI API returned error:', response.status, errText);
      throw new HttpsError('internal', `OpenAI API returned error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new HttpsError('internal', 'OpenAI API returned empty response');
    }

    if (content.startsWith("```")) {
      content = content.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const result = JSON.parse(content);
    return {
      passed: !!result.passed,
      reason: result.reason || (result.passed ? '恭喜通過大猩猩認證！' : '動作動作不太像大猩猩，再試一次吧！')
    };

  } catch (error) {
    logger.error('AI validation failed:', error);
    throw new HttpsError('internal', `AI 認證失敗：${error.message}`);
  }
});
