declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AI_ML_API_KEY: string;
      NODE_ENV: 'development' | 'production' | 'test';
      LAMBDA_URL: string;
    }
  }
}
