// API 配置文件
export const API_CONFIG = {
  // OpenAI API 配置
  OPENAI: {
    API_KEY: import.meta.env.VITE_API_KEY,
    API_URL: import.meta.env.VITE_API_URL,
    MODEL: 'gpt-4o-all',
    MAX_TOKENS: 1688,
    TEMPERATURE: 0.1,
  },
  
  // 文件上传配置
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['.txt', '.doc', '.docx', '.pdf', '.json'],
    TIMEOUT: 30000, // 30秒
  },
  
  // AI 解析配置
  AI_PARSING: {
    ENABLED: true,
    FALLBACK_TO_MOCK: true,
    SAVE_RESULTS: true,
  }
}

// 检查 API 配置是否有效
export function isAPIConfigValid() {
  return API_CONFIG.OPENAI.API_KEY && API_CONFIG.OPENAI.API_KEY !== 'your-api-key-here'
}

// 获取环境信息
export function getEnvironmentInfo() {
  return {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    apiKeyConfigured: isAPIConfigValid(),
  }
} 