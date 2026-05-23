/**
 * Service for AI-powered validation using OpenAI Multimodal API.
 */
import { httpsCallable } from 'firebase/functions';
import { functions, isFirebaseEnabled } from '../lib/firebase';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

/**
 * Converts a File object to a base64 data URL.
 * @param {File} file 
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Validates whether the uploaded photo shows students striking a gorilla pose.
 * @param {File} file The image file uploaded by the user
 * @returns {Promise<{ passed: boolean, reason: string }>}
 */
export async function validateGorillaPose(file) {
  const base64Image = await fileToBase64(file);

  // If Firebase is enabled and initialized, securely call the Firebase Cloud Function!
  if (isFirebaseEnabled && functions) {
    try {
      const validatePoseCallable = httpsCallable(functions, 'validateGorillaPose');
      const response = await validatePoseCallable({ imageBase64: base64Image });
      
      const { passed, reason } = response.data;
      return {
        passed: !!passed,
        reason: reason || (passed ? '恭喜通過大猩猩認證！' : '動作不太像大猩猩，再試一次吧！')
      };
    } catch (error) {
      console.error('Secure Firebase Cloud Function validation failed:', error);
      throw new Error(`AI 認證服務異常（雲端）：${error.message}`);
    }
  }

  // Fallback to calling OpenAI directly from client for local development / prototyping
  console.warn('Firebase is not enabled or Functions is missing. Falling back to local direct OpenAI API call.');

  if (!OPENAI_API_KEY) {
    console.warn('VITE_OPENAI_API_KEY is not defined. Skipping AI validation and auto-passing.');
    return { passed: true, reason: '未設定 OpenAI API 金鑰，系統自動判定通過！' };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
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
                  url: base64Image
                }
              }
            ]
          }
        ],
        max_completion_tokens: 300
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API returned error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('OpenAI API returned empty response');
    }

    // Sanitize markdown formatting if any
    if (content.startsWith("```")) {
      content = content.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const result = JSON.parse(content);
    return {
      passed: !!result.passed,
      reason: result.reason || (result.passed ? '恭喜通過大猩猩認證！' : '動作不太像大猩猩，再試一次吧！')
    };

  } catch (error) {
    console.error('Local direct AI validation failed:', error);
    throw new Error(`AI 認證服務異常（本機）：${error.message}`);
  }
}
