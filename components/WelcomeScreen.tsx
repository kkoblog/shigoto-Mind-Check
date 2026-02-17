import React from 'react';
import { Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6 pt-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800 leading-tight">
            職場しんどさ診断
            <br />
            <span className="text-teal-600 text-xl">（60秒 〜 5分）</span>
          </h2>
          <p className="text-slate-600">
            今の「しんどさ」の原因、ひとりで抱えていませんか？
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-teal-50 p-2 rounded-full">
              <Clock className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">まずは60秒でチェック</h3>
              <p className="text-sm text-slate-500">
                8つの質問で、今の危険度を可視化します。
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-teal-50 p-2 rounded-full">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">安全なセルフチェック</h3>
              <p className="text-sm text-slate-500">
                医療診断ではありません。現状を整理するためのツールです。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg text-xs text-amber-800 border border-amber-100">
          <strong>免責事項：</strong>
          このアプリは医療診断や法律判断を行いません。結果はあくまで目安としてご利用ください。
        </div>
      </div>

      <div className="mt-8 sticky bottom-4">
        <button
          onClick={onStart}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
        >
          チェックを始める
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
