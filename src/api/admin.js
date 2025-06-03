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

    // 신고 이력이 있으면 추가 (reportRecord → minReports로 변경)
    if (params.reportHistory && params.reportHistory !== "" && params.reportHistory !== "0") {
      queryParams.append('minReports', params.reportHistory);
    }

    console.log('🔍 API 호출:', `/admin/account?${queryParams.toString()}`);
    return api.get(`/admin/account?${queryParams.toString()}`);

    // Mock 데이터 (API 실패 시 백업용 - 필요시 주석 해제)
    /*
    const mockAccounts = Array.from({ length: 25 }, (_, i) => ({
      id: (i + 1).toString(),
      memberId: `USER${1000 + i}`,
      joinDate: "2024.01.15",
      nickname: `사용자${i + 1}`,
      status: i % 4 === 0 ? "정지" : i % 3 === 0 ? "휴면" : "정상",
      reportHistory: i % 5 === 0 ? "3건" : i % 3 === 0 ? "1건" : "없음",
      restricted: i % 7 === 0 ? "제한" : "없음"
    }));

    // 페이지네이션 시뮬레이션
    const page = params.page || 0;
    const size = params.size || 10;
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedData = mockAccounts.slice(startIndex, endIndex);

    return Promise.resolve({
      data: {
        content: paginatedData,
        totalElements: mockAccounts.length,
        totalPages: Math.ceil(mockAccounts.length / size),
        number: page,
        size: size
      }
    });
    */

  } catch (error) {
    console.error('계정 목록 조회 실패:', error);
    
    // API 실패 시 사용자에게 친화적인 에러 메시지
    if (error.code === 'ECONNREFUSED') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } else if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    } else if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    
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
    // 실제 API 호출 (백엔드 준비 시 주석 해제)
    // return api.post('/admin/account/withdraw', { memberIds });
    
    // Mock 응답
    console.log('Mock: 회원 탈퇴 처리', memberIds);
    return Promise.resolve({
      data: {
        success: true,
        message: `${memberIds.length}명의 회원이 탈퇴 처리되었습니다.`
      }
    });
  } catch (error) {
    console.error('회원 탈퇴 처리 실패:', error);
    throw error;
  }
};

// 계정 정지 처리
export const suspendMembers = async (memberIds) => {
  try {
    // 실제 API 호출 (백엔드 준비 시 주석 해제)
    // return api.post('/admin/account/suspend', { memberIds });
    
    // Mock 응답
    console.log('Mock: 계정 정지 처리', memberIds);
    return Promise.resolve({
      data: {
        success: true,
        message: `${memberIds.length}명의 회원이 정지 처리되었습니다.`
      }
    });
  } catch (error) {
    console.error('계정 정지 처리 실패:', error);
    throw error;
  }
};

// 계정 활성화 처리
export const activateMembers = async (memberIds) => {
  try {
    // 실제 API 호출 (백엔드 준비 시 주석 해제)
    // return api.post('/admin/account/activate', { memberIds });
    
    // Mock 응답
    console.log('Mock: 계정 활성화 처리', memberIds);
    return Promise.resolve({
      data: {
        success: true,
        message: `${memberIds.length}명의 회원이 활성화 처리되었습니다.`
      }
    });
  } catch (error) {
    console.error('계정 활성화 처리 실패:', error);
    throw error;
  }
}; 