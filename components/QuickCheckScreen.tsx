import React, { useState } from 'react';
import { QUICK_CHECK_ITEMS } from '../constants';
import { ArrowRight } from 'lucide-react';

interface QuickCheckScreenProps {
  onComplete: (answers: Record<string, boolean>) => void;
}

const QuickCheckScreen: React.FC<QuickCheckScreenProps> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  const handleToggle = (id: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const isComplete = QUICK_CHECK_ITEMS.every(item => answers[item.id] !== undefined);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800">クイックチェック</h2>
        <p className="text-sm text-slate-500">最近1か月の状態について教えてください</p>
      </div>

      <div className="space-y-3">
        {QUICK_CHECK_ITEMS.map((item) => {
          const answer = answers[item.id];
          return (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
              <p className="font-medium text-slate-700 mb-3">{item.text}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggle(item.id, true)}
                  className={`flex-1 py-2 px-4 rounded-lg border text-sm font-semibold transition-colors ${
                    answer === true
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  はい
                </button>
                <button
                  onClick={() => handleToggle(item.id, false)}
                  className={`flex-1 py-2 px-4 rounded-lg border text-sm font-semibold transition-colors ${
                    answer === false
                      ? 'bg-teal-500 border-teal-500 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  いいえ
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-4 pt-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
        <button
          onClick={() => isComplete && onComplete(answers)}
          disabled={!isComplete}
          className={`w-full py-4 px-6 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
            isComplete
              ? 'bg-teal-600 hover:bg-teal-700 text-white'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          次へ
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default QuickCheckScreen;
