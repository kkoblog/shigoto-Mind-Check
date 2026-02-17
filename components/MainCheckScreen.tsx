import React, { useState, useRef, useEffect } from 'react';
import { MAIN_CHECK_ITEMS, SCALE_LABELS } from '../constants';
import { ArrowRight } from 'lucide-react';

interface MainCheckScreenProps {
  onComplete: (answers: Record<string, number>, freeText: string) => void;
}

const MainCheckScreen: React.FC<MainCheckScreenProps> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [freeText, setFreeText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  
  const itemsPerPage = 5;
  const totalPages = Math.ceil(MAIN_CHECK_ITEMS.length / itemsPerPage);
  
  const currentItems = MAIN_CHECK_ITEMS.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentPage]);

  const handleSelect = (id: string, value: number) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const isPageComplete = currentItems.every(item => answers[item.id] !== undefined);
  const isLastPage = currentPage === totalPages - 1;

  const handleNext = () => {
    if (isLastPage) {
      // Just confirm ready to submit
      // The submit button is rendered separately for the last page with free text
    } else {
      setCurrentPage(prev => prev + 1);
    }
  };

  const progress = Math.round(((Object.keys(answers).length) / MAIN_CHECK_ITEMS.length) * 100);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div ref={topRef} />
      
      {/* Progress Bar */}
      <div className="sticky top-14 bg-slate-50 pt-2 pb-4 z-10">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>進捗</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-teal-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-8">
        {currentItems.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <p className="font-medium text-slate-800 mb-4 leading-relaxed">
              {item.text}
            </p>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <label 
                  key={val} 
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    answers[item.id] === val 
                      ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={item.id}
                    value={val}
                    checked={answers[item.id] === val}
                    onChange={() => handleSelect(item.id, val)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className={`ml-3 text-sm ${answers[item.id] === val ? 'text-indigo-900 font-semibold' : 'text-slate-600'}`}>
                    {SCALE_LABELS[val as keyof typeof SCALE_LABELS]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isLastPage && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mt-8">
          <label className="block text-slate-700 font-bold mb-2">
            任意：いま一番しんどいことを一言（匿名OK）
          </label>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
            rows={4}
            maxLength={300}
            placeholder="例：上司の指示が毎回変わって振り回されるのが辛い..."
          />
          <p className="text-right text-xs text-slate-400 mt-1">{freeText.length}/300</p>
        </div>
      )}

      <div className="sticky bottom-4 pt-4">
        {isLastPage ? (
          <button
            onClick={() => isPageComplete && onComplete(answers, freeText)}
            disabled={!isPageComplete}
            className={`w-full py-4 px-6 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
              isPageComplete
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            診断結果を見る
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!isPageComplete}
            className={`w-full py-4 px-6 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
              isPageComplete
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            次へ
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MainCheckScreen;
