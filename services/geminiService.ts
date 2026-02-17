import { GoogleGenAI, Type, Schema } from '@google/genai';
import { AnalysisResult, Answers } from '../types';
import { calculateScores } from '../utils/scoring';
import { MAIN_CHECK_DOMAINS } from '../constants';

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    headline: { type: Type.STRING },
    judgement: { type: Type.STRING, enum: ['red', 'yellow', 'green'] },
    state_score: { type: Type.INTEGER },
    top_causes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          key: { type: Type.STRING },
          label_ja: { type: Type.STRING },
          score: { type: Type.NUMBER },
        },
        required: ['key', 'label_ja', 'score'],
      },
    },
    summary: { type: Type.STRING },
    next_steps: {
      type: Type.OBJECT,
      properties: {
        short_term: { type: Type.ARRAY, items: { type: Type.STRING } },
        mid_term: { type: Type.ARRAY, items: { type: Type.STRING } },
        long_term: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['short_term', 'mid_term', 'long_term'],
    },
    cta: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING, description: "Persuasive copy for career consultation." },
        button_text: { type: Type.STRING, description: "Action verb. No 'Submit'." },
        url: { type: Type.STRING },
        sub_text: { type: Type.STRING, description: "Micro-copy like 'Free', '1 min'." },
      },
      required: ['text', 'button_text', 'url', 'sub_text'],
    },
    disclaimer: { type: Type.STRING },
  },
  required: ['headline', 'judgement', 'summary', 'next_steps', 'cta', 'disclaimer'],
};

export const generateAnalysis = async (answers: Answers): Promise<AnalysisResult> => {
  // Defensive check for API key
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing. Returning mock data for development/preview.");
    // Fallback or error - for now, throw error to be handled by UI
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const scores = calculateScores(answers);
  
  // Format domain scores for prompt
  const domainScoresString = Object.entries(scores.domainScores)
    .map(([key, val]) => `${key} (${MAIN_CHECK_DOMAINS.find(d => d.key === key)?.label_ja}): ${val.toFixed(2)}`)
    .join(', ');

  const prompt = `
    Role: 職場ストレスの状況整理支援アシスタント
    Task: Analyze the user's stress check inputs and provide a structured response.
    
    User Data:
    - Quick Check (Yes Count): ${scores.quickYesCount} / 8
    - Deep Dive Completed: ${answers.deepDiveOptIn ? 'Yes' : 'No'}
    - Calculated Level: ${scores.level}
    - Domain Risk Scores (1-5, 5 is high risk): ${domainScoresString || 'N/A'}
    - Free Text Note: "${answers.freeText || 'None'}"

    Instructions:
    1. Tone: やさしいが現実的。言語化が鋭い。責めない。
    2. Length: Summary should be 120-180 characters.
    3. Determine "Top Causes" if Deep Dive was completed.
    4. Provide 3 next steps (Short-term, Mid-term, Long-term).
    
    5. CTA Strategy (Critical):
       - Destination: The link is for a "Job Change/Career Support Service" (転職支援サービス).
       - Goal: Encourage the user to consult a professional for free.
       - Text: Emphasize that there are options outside the current workplace. e.g., "辛い環境で耐え続ける必要はありません。プロに相談して、自分の市場価値や他の選択肢を確認してみませんか？"
       - Button Text: Use specific, high-conversion action verbs. **NEVER use "送信" or "登録".** Use phrases like "無料でキャリア相談を予約する" (Book free career consultation) or "非公開求人をチェックする" (Check private job listings).
       - Sub Text (Micro-copy): Add reassuring text to reduce friction. e.g., "入力は最短1分・秘密厳守" or "無理な勧誘はありません".
    
    6. Safety Override:
       - If free text contains suicidal ideation (希死念慮, 自傷), CHANGE the CTA to suggest immediate medical help or consultation (いのちの電話 etc.), but keep the original URL as a secondary "Future Career" option if appropriate, or replace it with a medical resource URL if you judge it critical.
    
    Output JSON strictly matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText) as AnalysisResult;
    
    // Fallback if model doesn't return scores correctly or if we didn't do deep dive
    if (!result.state_score) result.state_score = scores.stateScore;
    
    return result;
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
};