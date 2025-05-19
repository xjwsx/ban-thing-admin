import api from "./index";

// 관리자 정보 가져오기
export const getAdminMe = () => {
  // return api.get("/admin/me");
  // API 연동 코드는 주석 처리하고 mock 데이터 반환
  return Promise.resolve({
    data: {
      id: 1,
      username: "admin",
      role: "admin",
      permissions: [],
    }
  });
};

// 계정 목록 가져오기
export const getAccounts = () => {
  // return api.get("/admin/accounts");
  // API 연동 코드는 주석 처리하고 mock 데이터 반환
  return Promise.resolve({
    data: []
  });
};

// 신고 내역 가져오기
export const getReports = () => {
  // return api.get("/admin/reports");
  // API 연동 코드는 주석 처리하고 mock 데이터 반환
  return Promise.resolve({
    data: []
  });
};

// 탈퇴 내역 가져오기
export const getWithdrawals = () => {
  // return api.get("/admin/withdrawals");
  // API 연동 코드는 주석 처리하고 mock 데이터 반환
  return Promise.resolve({
    data: []
  });
};

// 관리자 로그인
export const adminLogin = (data) => {
  // return api.post("/admin/login", data);
  // API 연동 코드는 주석 처리하고 mock 데이터 반환
  return Promise.resolve({
    data: {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    }
  });
};

// 관리자 로그아웃
export const adminLogout = (refreshToken) => {
  // return api.post("/admin/logout", { refreshToken });
  // API 연동 코드는 주석 처리하고 mock 데이터 반환
  return Promise.resolve({
    data: {
      success: true,
    }
  });
}; 