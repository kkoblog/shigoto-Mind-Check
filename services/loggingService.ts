import { Answers, AnalysisResult } from '../types';

/**
 * 診断結果と回答データを外部のログ収集エンドポイントへ送信します。
 * Google Apps Script (Web App) などをバックエンドとして想定しています。
 * 
 * @param eventType 'view_result' (結果表示) | 'click_cta' (CTAクリック)
 */
export const sendLog = async (answers: Answers, result: AnalysisResult, eventType: string = 'view_result') => {
  // 環境変数からAPIのエンドポイントURLを取得
  // 開発環境等で設定されていない場合はコンソール出力のみ行います
  const API_URL = "https://script.google.com/macros/s/AKfycbx9Xg71Vwd5iSKELJIjJ0QXre7vgZxNUYYKZloDnOvg-CwPbLChEoOFKbbjrx-earMu/exec";
  if (!API_URL) {
    console.log("[Dev] LOG_API_URL not set. Logging to console:", { 
      timestamp: new Date().toISOString(),
      eventType,
      answers, 
      result 
    });
    return;
  }

  try {
    // CORS Preflightを避けるため、Content-Typeをtext/plainとして送信します（Simple Request）
    // GAS側では e.postData.contents でJSON文字列を受け取れます
    await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      // ページ遷移（タブ閉じなど）でもリクエストがキャンセルされないよう keepalive を有効化
      keepalive: true,
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        eventType, // イベントの種類を追加
        answers,
        analysis: result,
      }),
    });
    console.debug(`Log sent successfully (${eventType})`);
  } catch (error) {
    // ユーザー体験を阻害しないよう、ログ送信エラーはコンソール表示のみにとどめます
    console.error("Failed to send log:", error);
  }
};