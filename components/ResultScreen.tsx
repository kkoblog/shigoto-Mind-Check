import React, { useEffect, useState, useRef } from 'react';
import { Answers, AnalysisResult } from '../types';
import { generateAnalysis } from '../services/geminiService';
import { sendLog } from '../services/loggingService';
import { CTA_URL } from '../constants';
import { AlertTriangle, CheckCircle, AlertCircle, Loader2, ArrowRight, BarChart2, MessageCircleHeart } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ResultScreenProps {
  answers: Answers;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ answers }) => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logSent = useRef(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await generateAnalysis(answers);
        setResult(data);
        setLoading(false);
      } catch (err) {
        setError('結果の生成中にエラーが発生しました。しばらくしてから再試行してください。');
        setLoading(false);
      }
    };

    fetchResult();
  }, [answers]);

  // 結果が表示されたらログを送信（1回のみ）: イベントタイプ 'view_result'
  useEffect(() => {
    if (result && !logSent.current) {
      logSent.current = true;
      sendLog(answers, result, 'view_result');
    }
  }, [result, answers]);

  // CTAクリック時のハンドラ
  const handleCtaClick = () => {
    if (result) {
      sendLog(answers, result, 'click_cta');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
        <p className="text-slate-600 font-medium animate-pulse">
          AIが状況を分析・整理しています...
        </p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 text-center">
        <p>{error || "不明なエラー"}</p>
      </div>
    );
  }

  // --- Visualization Data Preparation ---
  const chartData = result.top_causes.map(cause => ({
    subject: cause.label_ja,
    A: cause.score, // 1-5
    fullMark: 5,
  }));

  // Color mapping
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

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Judgement Banner */}
      <div className={`p-6 rounded-2xl border-2 ${levelColor[result.judgement as keyof typeof levelColor]} flex flex-col items-center text-center space-y-3`}>
        {iconMap[result.judgement as keyof typeof iconMap]}
        <h2 className="text-xl font-bold">{result.headline}</h2>
        <div className="w-full bg-white/50 rounded-full h-4 mt-2 overflow-hidden border border-black/5 relative">
             <div 
               className={`h-full absolute left-0 top-0 ${
                 result.judgement === 'red' ? 'bg-rose-500' : 
                 result.judgement === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'
               }`}
               style={{ width: `${result.state_score}%` }}
             />
        </div>
        <p className="text-sm font-semibold opacity-90">消耗度スコア: {result.state_score}/100</p>
      </div>

      {/* 2. Top Causes Chart (If Deep Dive) */}
      {answers.deepDiveOptIn && chartData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-800">主なストレス要因（Top 3）</h3>
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
            {result.top_causes.map((cause, idx) => (
               <li key={idx} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                 <span className="text-slate-600">{cause.label_ja}</span>
                 <span className="font-bold text-indigo-600">Lv.{cause.score.toFixed(1)}</span>
               </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. AI Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-3">
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">状況の整理（AI分析）</h3>
        <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
          {result.summary}
        </p>
      </div>

      {/* 4. Next Steps */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">次の一手（提案）</h3>
        
        <div className="space-y-4">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-2 py-1 rounded">Short Term</span>
            <ul className="list-disc pl-5 mt-2 text-sm text-slate-700 space-y-1">
              {result.next_steps.short_term.map((step, i) => <li key={i}>{step}</li>)}
            </ul>
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">Mid Term</span>
            <ul className="list-disc pl-5 mt-2 text-sm text-slate-700 space-y-1">
               {result.next_steps.mid_term.map((step, i) => <li key={i}>{step}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* 5. CTA - High CVR Design */}
      <div className="relative">
        {/* Decorative background element */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-2xl transform rotate-1 opacity-10"></div>
        
        <div className="relative bg-white border-2 border-teal-100 p-6 rounded-2xl shadow-xl text-center space-y-5 overflow-hidden">
          {/* Badge */}
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
              {result.cta.text}
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
                <span>{result.cta.button_text}</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
              {/* Shine effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            
            {/* Micro-copy */}
            <p className="mt-3 text-xs text-slate-500 font-medium">
              <span className="inline-block bg-slate-100 px-2 py-1 rounded mr-1">
                安心
              </span>
              {result.cta.sub_text}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4">
             <p className="text-[10px] text-slate-400 leading-tight">
              {result.disclaimer}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;