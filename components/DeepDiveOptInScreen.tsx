import React from 'react';
import { Search, FastForward } from 'lucide-react';

interface DeepDiveOptInScreenProps {
  onChoice: (optIn: boolean) => void;
}

const DeepDiveOptInScreen: React.FC<DeepDiveOptInScreenProps> = ({ onChoice }) => {
  return (
    <div className="flex flex-col h-full justify-center space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">
          詳細分析を行いますか？
        </h2>
        <p className="text-slate-600">
          今の状態の原因（トップ3）を特定し、<br/>
          より具体的な対策を提案できます。
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => onChoice(true)}
          className="w-full bg-white border-2 border-teal-500 p-6 rounded-xl shadow-sm hover:bg-teal-50 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-teal-700 text-lg">原因までしっかり分析</span>
            <Search className="w-6 h-6 text-teal-600" />
          </div>
          <p className="text-sm text-slate-500 group-hover:text-slate-600">
            追加で約3〜5分かかります。<br/>
            仕事の負担・裁量・人間関係などを詳しく見ます。
          </p>
        </button>

        <button
          onClick={() => onChoice(false)}
          className="w-full bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:bg-slate-50 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-700 text-lg">今は結果だけ見る</span>
            <FastForward className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-400 group-hover:text-slate-500">
            ここまでの回答で簡易診断結果を表示します。
          </p>
        </button>
      </div>
    </div>
  );
};

export default DeepDiveOptInScreen;
