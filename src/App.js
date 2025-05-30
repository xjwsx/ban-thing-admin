import React from "react";
import Router from "./routes/router";
import ErrorBoundary from "./components/ErrorBoundary";
import { logBuildInfo } from "./utils/buildInfo";

// 빌드 정보 로깅
if (process.env.NODE_ENV === 'production') {
  logBuildInfo();
}

const App = () => {
  return (
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  );
};

export default App;
