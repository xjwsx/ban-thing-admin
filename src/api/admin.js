import api from "./index";
import { format } from "date-fns";

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

// 계정 목록 가져오기 (실제 API 연결)
export const getAccounts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: (params.page || 0).toString(),
      size: (params.size || 10).toString(),
    });

    // 시작일이 있으면 추가
    if (params.startDate) {
      queryParams.append('startDate', format(params.startDate, 'yyyy-MM-dd'));
    }

    // 종료일이 있으면 추가  
    if (params.endDate) {
      queryParams.append('endDate', format(params.endDate, 'yyyy-MM-dd'));
    }

    // 계정 상태가 있으면 추가
    if (params.accountStatus) {
      queryParams.append('accountStatus', params.accountStatus);
    }

    // 신고 이력이 있으면 추가 (reportRecord로 매핑)
    if (params.reportHistory) {
      queryParams.append('reportRecord', params.reportHistory);
    }

    return api.get(`/admin/account?${queryParams.toString()}`);
  } catch (error) {
    console.error('계정 목록 조회 실패:', error);
    throw error;
  }
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

// 회원 탈퇴 처리
export const withdrawMembers = async (memberIds) => {
  try {
    return api.post('/admin/account/withdraw', { memberIds });
  } catch (error) {
    console.error('회원 탈퇴 처리 실패:', error);
    throw error;
  }
};

// 계정 정지 처리
export const suspendMembers = async (memberIds) => {
  try {
    return api.post('/admin/account/suspend', { memberIds });
  } catch (error) {
    console.error('계정 정지 처리 실패:', error);
    throw error;
  }
};

// 계정 활성화 처리
export const activateMembers = async (memberIds) => {
  try {
    return api.post('/admin/account/activate', { memberIds });
  } catch (error) {
    console.error('계정 활성화 처리 실패:', error);
    throw error;
  }
}; 