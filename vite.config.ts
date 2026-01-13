import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
    server: {
      host: true, // 이걸 켜야 같은 와이파이의 다른 기기(핸드폰 등)에서 접속 가능
      port: 3000, // 3000번 포트로 고정
    }
  };
});