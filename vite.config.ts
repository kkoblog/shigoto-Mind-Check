import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // カレントディレクトリから環境変数をロードします
  // 第3引数を '' にすることで、VITE_ プレフィックスがない変数もロード対象にします
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // コード内の 'process.env.API_KEY' という文字列を、ビルド時に実際のキーの値に置換します
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  }
})