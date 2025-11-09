/**
 * Gemini AI Content Validation Utility
 * Uses Google's Gemini API to validate service content for appropriateness
 */

interface ValidationResult {
  isAppropriate: boolean;
  reason?: string;
}

/**
 * Validates service title and description using Gemini API
 * @param title - Service title to validate
 * @param description - Service description to validate
 * @returns ValidationResult indicating if content is appropriate
 */
export async function validateServiceContent(
  title: string,
  description: string
): Promise<ValidationResult> {
  console.log('🔍 Starting content validation for:', { title, description: description.substring(0, 50) + '...' });
  
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is not configured');
    // Fail open - allow content if API key is not configured
    return { isAppropriate: true };
  }

  console.log('✅ API key found, calling Gemini API...');

  try {
    const prompt = `You are a content moderation system for a skill-sharing platform. Analyze the following service title and description for inappropriate content.

Check for:
- Explicit sexual content
- Violence or harm
- Illegal activities
- Hate speech or discrimination
- Scams or fraud
- Spam or misleading information

Service Title: "${title}"
Service Description: "${description}"

Respond with ONLY a JSON object in this exact format:
{
  "isAppropriate": true or false,
  "reason": "brief explanation if inappropriate, otherwise empty string"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
            topP: 0.95,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, response.statusText);
      console.error('Error details:', errorText);
      // Fail open - allow content if API fails
      return { isAppropriate: true };
    }

    const data = await response.json();
    
    // Log the raw response for debugging
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('No text returned from Gemini API');
      console.error('Finish reason:', data.candidates?.[0]?.finishReason);
      // Fail closed - block content if we can't validate it properly
      return { 
        isAppropriate: false, 
        reason: 'Content could not be validated. Please try again or rephrase your service description.' 
      };
    }

    // Extract JSON from the response (it might be wrapped in markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/```\n?$/, '');
    }

    const result: ValidationResult = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error('Error validating content with Gemini:', error);
    // Fail open - allow content if validation fails
    return { isAppropriate: true };
  }
}
