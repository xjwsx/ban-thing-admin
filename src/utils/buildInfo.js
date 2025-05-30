// 빌드 정보 확인용 유틸리티
export const BUILD_INFO = {
  VERSION: "1.0.0",
  BUILD_TIME: new Date().toISOString(),
  COMMIT_HASH: process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA || "local",
  ENVIRONMENT: process.env.NODE_ENV,
  API_URL: process.env.REACT_APP_API_URL || "default"
};

// 콘솔에 빌드 정보 출력
export const logBuildInfo = () => {
  console.group("🚀 Banthing Admin Build Info");
  console.log("📦 Version:", BUILD_INFO.VERSION);
  console.log("🕒 Build Time:", BUILD_INFO.BUILD_TIME);
  console.log("📝 Commit:", BUILD_INFO.COMMIT_HASH);
  console.log("🌍 Environment:", BUILD_INFO.ENVIRONMENT);
  console.log("🔗 API URL:", BUILD_INFO.API_URL);
  console.groupEnd();
  
  // Vercel 환경변수들도 출력
  if (process.env.REACT_APP_VERCEL_ENV) {
    console.group("🔧 Vercel Environment");
    console.log("Environment:", process.env.REACT_APP_VERCEL_ENV);
    console.log("URL:", process.env.REACT_APP_VERCEL_URL);
    console.log("Branch:", process.env.REACT_APP_VERCEL_GIT_COMMIT_REF);
    console.groupEnd();
  }
}; 