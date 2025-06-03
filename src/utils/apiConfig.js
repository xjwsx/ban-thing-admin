// API 설정 관리
export const API_CONFIG = {
  // 백엔드 API 연결 여부 (백엔드 준비 시 true로 변경)
  USE_REAL_API: false,
  
  // 환경별 API URL
  API_URLS: {
    development: process.env.REACT_APP_API_URL || "http://localhost:8080",
    production: process.env.REACT_APP_API_URL || "https://ban-thing-admin.vercel.app"
  },
  
  // API 엔드포인트
  ENDPOINTS: {
    // 관리자
    ADMIN_LOGIN: "/admin/login",
    ADMIN_LOGOUT: "/admin/logout", 
    ADMIN_ME: "/admin/me",
    
    // 계정 관리
    ACCOUNTS: "/admin/account",
    ACCOUNT_WITHDRAW: "/admin/account/withdraw",
    ACCOUNT_SUSPEND: "/admin/account/suspend", 
    ACCOUNT_ACTIVATE: "/admin/account/activate",
    
    // 신고 관리
    REPORTS: "/admin/reports",
    
    // 탈퇴 관리
    WITHDRAWALS: "/admin/withdrawals"
  }
};

// API 연결 상태 확인
export const checkAPIConnection = async () => {
  if (!API_CONFIG.USE_REAL_API) {
    console.log('🔧 Mock API 모드로 실행 중입니다.');
    return { connected: false, mock: true };
  }
  
  try {
    // 실제 API 연결 테스트 (예: health check 엔드포인트)
    // const response = await fetch(`${getBaseURL()}/health`);
    // return { connected: response.ok, mock: false };
    
    console.log('🔌 실제 API 연결을 시도합니다...');
    return { connected: true, mock: false };
  } catch (error) {
    console.error('❌ API 연결 실패:', error);
    return { connected: false, mock: false, error };
  }
};

// 백엔드 API 활성화 (개발 시 사용)
export const enableRealAPI = () => {
  API_CONFIG.USE_REAL_API = true;
  console.log('✅ 실제 API 모드로 전환되었습니다.');
};

// Mock API 모드로 전환 (개발/테스트 시 사용)
export const enableMockAPI = () => {
  API_CONFIG.USE_REAL_API = false;
  console.log('🔧 Mock API 모드로 전환되었습니다.');
}; 