import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Answers, AnalysisResult } from '../types';
import { generateAnalysis } from '../services/geminiService';
import { sendLog } from '../services/loggingService';
import { calculateScores } from '../utils/scoring';
import { MAIN_CHECK_DOMAINS, CTA_URL } from '../constants';
import { AlertTriangle, CheckCircle, AlertCircle, ArrowRight, BarChart2, MessageCircleHeart, Brain, Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ResultScreenProps {
  answers: Answers;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ answers }) => {
  const [aiResult, setAiResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMinWaitOver, setIsMinWaitOver] = useState(false);
  const logSent = useRef(false);

  // 1. Calculate Local Scores Immediately
  const localScores = useMemo(() => calculateScores(answers), [answers]);

  // 2. Start 3-second timer & AI Fetch
  useEffect(() => {
    // Timer for the animation (3 seconds)
    const timer = setTimeout(() => {
      setIsMinWaitOver(true);
    }, 3000);

    // Fetch AI Analysis
    const fetchResult = async () => {
      try {
        const data = await generateAnalysis(answers);
        setAiResult(data);
      } catch (err) {
        console.error(err);
        setError('分析に失敗しました。');
      }
    };

    fetchResult();

    return () => clearTimeout(timer);
  }, [answers]);

  // 3. Send Log when BOTH animation is done AND AI result is ready (or error)
  useEffect(() => {
    if (isMinWaitOver && aiResult && !logSent.current) {
      logSent.current = true;
      sendLog(answers, aiResult, 'view_result');
    }
  }, [isMinWaitOver, aiResult, answers]);

  const handleCtaClick = () => {
    if (aiResult || localScores) {
      const logResult = aiResult || {
        headline: "N/A", judgement: localScores.level, state_score: localScores.stateScore,
        top_causes: [], summary: "", next_steps: { short_term:[], mid_term:[], long_term:[] },
        cta: { text:"", button_text:"", url: CTA_URL, sub_text:"" }, disclaimer: ""
      };
      sendLog(answers, logResult, 'click_cta');
    }
  };

  // --- Derived Data for UI ---
  const chartData = useMemo(() => {
    if (aiResult) {
      return aiResult.top_causes.map(cause => ({
        subject: cause.label_ja,
        A: cause.score,
        fullMark: 5,
      }));
    }
    if (answers.deepDiveOptIn) {
      return Object.entries(localScores.domainScores)
  .map(([key, score]) => ({
    subject: MAIN_CHECK_DOMAINS.find(d => d.key === key)?.label_ja || key,
    A: Number(score ?? 0),
    fullMark: 5,
  }))
  .sort((a, b) => b.A - a.A)
  .slice(0, 3);
    }
    return [];
  }, [aiResult, localScores, answers.deepDiveOptIn]);

  const currentJudgement = aiResult?.judgement || localScores.level;
  const currentScore = aiResult?.state_score ?? localScores.stateScore;

  const defaultHeadlines = {
    red: "心身の疲労が蓄積しています",
    yellow: "注意が必要なサインが出ています",
    green: "現在のメンタルヘルスは良好です"
  };
  const headline = aiResult?.headline || defaultHeadlines[localScores.level];

  const levelColor = {
    red: 'bg-rose-100 text-rose-800 border-rose-200',
    yellow: 'bg-amber-100 text-amber-800 border-amber-200',
    green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };
  
  const iconMap = {
    red: <AlertCircle className="w-8 h-8 text-rose-600" />,
    yellow: <AlertTriangle className="w-8 h-8 text-amber-600" />,
    green: <CheckCircle className="w-8 h-8 text-emerald-600" />,
  };

  // --- Loading Screen (Fixed 3s Animation) ---
  if (!isMinWaitOver) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-8 animate-fade-in">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-8 h-8 text-teal-600 animate-pulse" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-slate-700">診断結果を作成中...</h3>
          <p className="text-sm text-slate-400">傾向を分析しています</p>
        </div>

        <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full animate-[progress_3s_ease-in-out_forwards]" style={{ width: '0%' }}></div>
        </div>
        <style>{`
          @keyframes progress {
            0% { width: 0%; }
            10% { width: 20%; }
            50% { width: 60%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // --- Main Result Screen ---
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Judgement Banner */}
      <div className={`p-6 rounded-2xl border-2 ${levelColor[currentJudgement]} flex flex-col items-center text-center space-y-3 shadow-sm`}>
        {iconMap[currentJudgement]}
        <h2 className="text-xl font-bold">{headline}</h2>
        
        <div className="w-full bg-white/50 rounded-full h-4 mt-2 overflow-hidden border border-black/5 relative">
             <div 
               className={`h-full absolute left-0 top-0 transition-all duration-1000 ${
                 currentJudgement === 'red' ? 'bg-rose-500' : 
                 currentJudgement === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'
               }`}
               style={{ width: `${currentScore}%` }}
             />
        </div>
        <p className="text-sm font-semibold opacity-90">消耗度スコア: {currentScore}/100</p>
      </div>

      {/* 2. Top Causes Chart */}
      {answers.deepDiveOptIn && chartData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-800">主なストレス要因</h3>
          </div>
          <div className="h-48 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                <Radar
                  name="Risk"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2 mt-4">
            {chartData.map((cause, idx) => (
               <li key={idx} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                 <span className="text-slate-600">{cause.subject}</span>
                 <span className="font-bold text-indigo-600">Lv.{cause.A.toFixed(1)}</span>
               </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. AI Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-3 min-h-[160px]">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Sparkles className="w-4 h-4 text-teal-500" />
          <h3 className="font-bold text-slate-800">状況の整理</h3>
        </div>
        
        {aiResult ? (
          <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap animate-fade-in">
            {aiResult.summary}
          </p>
        ) : error ? (
           <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-pulse">
            <div className="flex items-center gap-2 text-teal-600">
              <Brain className="w-5 h-5 animate-bounce" />
              <span className="text-sm font-bold">状況を言語化しています...</span>
            </div>
            <div className="space-y-2 w-full max-w-xs opacity-50">
               <div className="h-2 bg-slate-200 rounded-full w-full"></div>
               <div className="h-2 bg-slate-200 rounded-full w-5/6"></div>
               <div className="h-2 bg-slate-200 rounded-full w-4/6"></div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Next Steps */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4 min-h-[200px]">
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">次の一手（提案）</h3>
        
        {aiResult ? (
          <div className="space-y-4 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-2 py-1 rounded">Short Term</span>
              <ul className="list-disc pl-5 mt-2 text-sm text-slate-700 space-y-1">
                {aiResult.next_steps.short_term.map((step, i) => <li key={i}>{step}</li>)}
              </ul>
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">Mid Term</span>
              <ul className="list-disc pl-5 mt-2 text-sm text-slate-700 space-y-1">
                 {aiResult.next_steps.mid_term.map((step, i) => <li key={i}>{step}</li>)}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-pulse">
            <div className="flex items-center gap-2 text-indigo-500">
              <Lightbulb className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-bold">次の一手を考案中...</span>
            </div>
            <div className="w-full space-y-4 opacity-50">
              <div className="flex gap-3">
                 <div className="w-16 h-4 bg-slate-200 rounded"></div>
                 <div className="flex-1 h-4 bg-slate-200 rounded"></div>
              </div>
              <div className="flex gap-3">
                 <div className="w-16 h-4 bg-slate-200 rounded"></div>
                 <div className="flex-1 h-4 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. CTA */}
      <div className="relative min-h-[250px]">
        {aiResult ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-2xl transform rotate-1 opacity-10"></div>
            <div className="relative bg-white border-2 border-teal-100 p-6 rounded-2xl shadow-xl text-center space-y-5 overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                無料診断
              </div>

              <div className="space-y-2">
                <div className="flex justify-center mb-2">
                   <div className="bg-teal-50 p-3 rounded-full">
                     <MessageCircleHeart className="w-8 h-8 text-teal-600" />
                   </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  今の職場以外にも、<br/>選択肢はあります
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed px-2">
                  {aiResult.cta.text}
                </p>
              </div>

              <div className="pt-2 pb-1">
                <a 
                  href={CTA_URL}
                  onClick={handleCtaClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-4 px-4 rounded-xl shadow-lg transform transition-all hover:-translate-y-0.5 active:scale-95 active:translate-y-0 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <span>{aiResult.cta.button_text}</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                
                <p className="mt-3 text-xs text-slate-500 font-medium">
                  <span className="inline-block bg-slate-100 px-2 py-1 rounded mr-1">
                    安心
                  </span>
                  {aiResult.cta.sub_text}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                 <p className="text-[10px] text-slate-400 leading-tight">
                  {aiResult.disclaimer}
                 </p>
              </div>
            </div>
          </>
        ) : (
          <div className="relative bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center space-y-4 animate-pulse h-[250px]">
             <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
             </div>
             <p className="text-sm font-medium text-slate-500">
               あなたの市場価値や、<br/>
               今の職場以外の選択肢を探しています...
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultScreen;