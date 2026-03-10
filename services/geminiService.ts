import { GoogleGenAI, Type, Schema } from '@google/genai';
import { AnalysisResult, Answers } from '../types';
import { calculateScores } from '../utils/scoring';
import { MAIN_CHECK_DOMAINS, CTA_URL } from '../constants';

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
        short_term: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        mid_term: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        long_term: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['short_term', 'mid_term', 'long_term'],
    },
    cta: {
      type: Type.OBJECT,
      properties: {
        text: {
          type: Type.STRING,
          description: 'Persuasive copy for career consultation.',
        },
        button_text: {
          type: Type.STRING,
          description: "Action verb. No 'Submit'.",
        },
        url: { type: Type.STRING },
        sub_text: {
          type: Type.STRING,
          description: "Micro-copy like 'Free', '1 min'.",
        },
      },
      required: ['text', 'button_text', 'url', 'sub_text'],
    },
    disclaimer: { type: Type.STRING },
  },
  required: [
    'headline',
    'judgement',
    'state_score',
    'top_causes',
    'summary',
    'next_steps',
    'cta',
    'disclaimer',
  ],
};

type Judgement = 'red' | 'yellow' | 'green';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const defaultHeadlineMap: Record<Judgement, string> = {
  red: '心身の疲労が蓄積しています',
  yellow: '注意が必要なサインが出ています',
  green: '現在のメンタルヘルスは比較的安定しています',
};

const sanitizeScore = (value: unknown, min: number, max: number, fallback: number): number => {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
};

const sanitizeCauseScore = (value: unknown, fallback = 0): number => {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(5, Math.max(0, Number(num.toFixed(1))));
};

const normalizeJudgement = (value: unknown, fallback: Judgement): Judgement => {
  if (value === 'red' || value === 'yellow' || value === 'green') return value;
  return fallback;
};

const fallbackAnalysis = (answers: Answers): AnalysisResult => {
  const scores = calculateScores(answers);
  const judgement = scores.level as Judgement;

  const fallbackTopCauses = answers.deepDiveOptIn
    ? Object.entries(scores.domainScores)
        .map(([key, score]) => ({
          key,
          label_ja: MAIN_CHECK_DOMAINS.find((d) => d.key === key)?.label_ja || key,
          score: sanitizeCauseScore(score),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    : [];

  const summaryMap: Record<Judgement, string> = {
    red: 'かなり消耗が蓄積している可能性があります。気合いで乗り切る段階を超えているかもしれません。まずは負荷を減らし、安心して相談できる相手や環境を確保することが大切です。',
    yellow: '無理を続けると負担が強まりやすい状態です。今つらさを明確にして、負荷の大きい要因を切り分けることで、早めに立て直しやすくなります。',
    green: '現時点では大きく崩れていない可能性があります。ただし我慢が続いている場合は見えにくい疲れもあるため、定期的に状態を振り返ることが役立ちます。',
  };

  return {
    headline: defaultHeadlineMap[judgement],
    judgement,
    state_score: scores.stateScore,
    top_causes: fallbackTopCauses,
    summary: summaryMap[judgement],
    next_steps: {
      short_term: [
        '今日は負荷の高いことを一つ減らし、休息時間を確保する',
        '今つらい要因を「人・仕事量・裁量・評価」などで書き出す',
        '睡眠や食事の乱れが強い場合は早めに受診を検討する',
      ],
      mid_term: [
        '信頼できる相手に現状を共有し、一人で抱え込まない',
        '業務量・役割・人間関係のどこが負担かを整理する',
        '異動・働き方変更・転職も含めて選択肢を比較する',
      ],
      long_term: [
        '自分が消耗しやすい職場条件を言語化しておく',
        '今後避けたい働き方と望む環境の条件を整理する',
        '必要に応じてキャリア相談で外部の視点を入れる',
      ],
    },
    cta: {
      text: '今の職場で耐え続ける以外にも道はあります。無料のキャリア相談で、あなたに合う働き方や別の選択肢を確認してみませんか。',
      button_text: '無料でキャリア相談を予約する',
      url: CTA_URL,
      sub_text: '入力は最短1分・秘密厳守',
    },
    disclaimer:
      '本結果はセルフチェックに基づく参考情報です。強い不調や危険を感じる場合は医療機関や公的相談窓口に相談してください。',
  };
};

const buildPrompt = (answers: Answers) => {
  const scores = calculateScores(answers);

  const domainScoresString = Object.entries(scores.domainScores)
    .map(([key, val]) => {
      const label = MAIN_CHECK_DOMAINS.find((d) => d.key === key)?.label_ja || key;
      return `${key} (${label}): ${Number(val).toFixed(2)}`;
    })
    .join(', ');

  return `
Role: 職場ストレスの状況整理支援アシスタント
Task: Analyze the user's stress check inputs and provide a structured JSON response.

User Data:
- Quick Check (Yes Count): ${scores.quickYesCount} / 8
- Deep Dive Completed: ${answers.deepDiveOptIn ? 'Yes' : 'No'}
- Calculated Level: ${scores.level}
- State Score: ${scores.stateScore} / 100
- Domain Risk Scores (1-5, 5 is high risk): ${domainScoresString || 'N/A'}
- Free Text Note: "${answers.freeText?.trim() || 'None'}"

Instructions:
1. Tone: やさしいが現実的。言語化が鋭い。責めない。
2. Language: 日本語。
3. Summary: 120-180 characters.
4. Headline: 16-28 characters程度で簡潔に。
5. judgement must be one of: red / yellow / green
6. state_score must be an integer from 0 to 100.
7. If Deep Dive was not completed, top_causes should be [].
8. If Deep Dive was completed, top_causes must include the top 3 causes sorted by score desc.
9. next_steps:
   - short_term: exactly 3 items
   - mid_term: exactly 3 items
   - long_term: exactly 3 items
10. CTA Strategy:
   - Destination is a job change / career support service.
   - Encourage free consultation naturally.
   - button_text must NEVER be "送信" or "登録".
   - sub_text should reduce friction.
   - url should be "${CTA_URL}"
11. Safety Override:
   - If free text suggests self-harm, suicide, or immediate crisis, prioritize urgent support in summary and CTA.
   - In that case, button_text should guide to immediate相談/支援.
   - Keep output within schema.
12. disclaimer should remind this is not a medical diagnosis.

Output:
Return JSON only. No markdown. No code fence.
`;
};

const normalizeResult = (raw: Partial<AnalysisResult> | null | undefined, answers: Answers): AnalysisResult => {
  const fallback = fallbackAnalysis(answers);
  const scores = calculateScores(answers);

  const judgement = normalizeJudgement(raw?.judgement, fallback.judgement);

  const topCauses = Array.isArray(raw?.top_causes)
    ? raw!.top_causes
        .map((cause) => ({
          key: typeof cause?.key === 'string' ? cause.key : 'unknown',
          label_ja: typeof cause?.label_ja === 'string' ? cause.label_ja : '要因',
          score: sanitizeCauseScore(cause?.score, 0),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    : fallback.top_causes;

  return {
    headline:
      typeof raw?.headline === 'string' && raw.headline.trim()
        ? raw.headline.trim()
        : defaultHeadlineMap[judgement] || fallback.headline,
    judgement,
    state_score: sanitizeScore(raw?.state_score, 0, 100, scores.stateScore),
    top_causes: answers.deepDiveOptIn ? topCauses : [],
    summary:
      typeof raw?.summary === 'string' && raw.summary.trim()
        ? raw.summary.trim()
        : fallback.summary,
    next_steps: {
      short_term:
        Array.isArray(raw?.next_steps?.short_term) && raw!.next_steps!.short_term.length > 0
          ? raw!.next_steps!.short_term.filter(Boolean).slice(0, 3)
          : fallback.next_steps.short_term,
      mid_term:
        Array.isArray(raw?.next_steps?.mid_term) && raw!.next_steps!.mid_term.length > 0
          ? raw!.next_steps!.mid_term.filter(Boolean).slice(0, 3)
          : fallback.next_steps.mid_term,
      long_term:
        Array.isArray(raw?.next_steps?.long_term) && raw!.next_steps!.long_term.length > 0
          ? raw!.next_steps!.long_term.filter(Boolean).slice(0, 3)
          : fallback.next_steps.long_term,
    },
    cta: {
      text:
        typeof raw?.cta?.text === 'string' && raw.cta.text.trim()
          ? raw.cta.text.trim()
          : fallback.cta.text,
      button_text:
        typeof raw?.cta?.button_text === 'string' && raw.cta.button_text.trim()
          ? raw.cta.button_text.trim()
          : fallback.cta.button_text,
      url:
        typeof raw?.cta?.url === 'string' && raw.cta.url.trim()
          ? raw.cta.url.trim()
          : CTA_URL,
      sub_text:
        typeof raw?.cta?.sub_text === 'string' && raw.cta.sub_text.trim()
          ? raw.cta.sub_text.trim()
          : fallback.cta.sub_text,
    },
    disclaimer:
      typeof raw?.disclaimer === 'string' && raw.disclaimer.trim()
        ? raw.disclaimer.trim()
        : fallback.disclaimer,
  };
};

const parseJsonSafely = (text: string): Partial<AnalysisResult> | null => {
  try {
    return JSON.parse(text) as Partial<AnalysisResult>;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]) as Partial<AnalysisResult>;
    } catch {
      return null;
    }
  }
};

export const generateAnalysis = async (answers: Answers): Promise<AnalysisResult> => {
  if (!API_KEY) {
    console.error('VITE_GEMINI_API_KEY is missing. Check your .env file.');
    throw new Error('APIキーが設定されていません。.env の VITE_GEMINI_API_KEY を確認してください。');
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = buildPrompt(answers);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text?.trim() || '';
    const parsed = parseJsonSafely(jsonText);

    if (!parsed) {
      console.warn('Gemini returned invalid JSON. Falling back.', jsonText);
      return fallbackAnalysis(answers);
    }

    return normalizeResult(parsed, answers);
  } catch (error) {
    console.error('Gemini generation error:', error);
    return fallbackAnalysis(answers);
  }
};