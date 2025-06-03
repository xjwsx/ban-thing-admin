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
export const getReports = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: (params.page || 0).toString(),
      size: (params.size || 10).toString(),
    });

    // 시작일이 있으면 추가
    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }

    // 종료일이 있으면 추가  
    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }

    // 최소 신고 건수가 있으면 추가
    if (params.minReports && params.minReports !== "" && params.minReports !== "0") {
      queryParams.append('minReports', params.minReports);
    }

    console.log('🔍 신고 내역 API 호출:', `/admin/reports?${queryParams.toString()}`);
    return api.get(`/admin/reports?${queryParams.toString()}`);

    // Mock 데이터 (API 실패 시 백업용 - 필요시 주석 해제)
    /*
    const mockReports = Array.from({ length: 30 }, (_, i) => ({
      id: (i + 1).toString(),
      reportId: `RPT${1000 + i}`,
      reportDate: "2024.12.15",
      reportedUser: `신고받은사용자${i + 1}`,
      reportingUser: `신고한사용자${i + 1}`,
      reportReason: i % 4 === 0 ? "스팸/광고" : i % 3 === 0 ? "욕설/비방" : i % 2 === 0 ? "부적절한 콘텐츠" : "기타",
      reportCount: Math.floor(Math.random() * 10) + 1,
      status: i % 5 === 0 ? "처리완료" : i % 3 === 0 ? "검토중" : "대기중",
      description: `신고 상세 내용 ${i + 1}`
    }));

    // 페이지네이션 시뮬레이션
    const page = params.page || 0;
    const size = params.size || 10;
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedData = mockReports.slice(startIndex, endIndex);

    return Promise.resolve({
      data: {
        content: paginatedData,
        totalElements: mockReports.length,
        totalPages: Math.ceil(mockReports.length / size),
        number: page,
        size: size
      }
    });
    */

  } catch (error) {
    console.error('신고 내역 조회 실패:', error);
    
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

// 탈퇴 내역 가져오기
export const getWithdrawals = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: (params.page || 0).toString(),
      size: (params.size || 10).toString(),
    });

    // 시작일이 있으면 추가
    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }

    // 종료일이 있으면 추가  
    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }

    // 탈퇴 사유가 있으면 추가
    if (params.reason && params.reason !== "" && params.reason !== "all") {
      queryParams.append('reason', params.reason);
    }

    console.log('🔍 탈퇴 내역 API 호출:', `/admin/reports/users?${queryParams.toString()}`);
    return api.get(`/admin/reports/users?${queryParams.toString()}`);

    // Mock 데이터 (API 실패 시 백업용 - 필요시 주석 해제)
    /*
    const mockWithdrawals = Array.from({ length: 25 }, (_, i) => ({
      id: (i + 1).toString(),
      withdrawalId: `WD${1000 + i}`,
      withdrawalDate: "2024.12.15",
      memberId: `USER${2000 + i}`,
      nickname: `탈퇴회원${i + 1}`,
      joinDate: "2024.01.15",
      reason: i % 4 === 0 ? "서비스 불만족" : i % 3 === 0 ? "개인정보 우려" : i % 2 === 0 ? "사용 빈도 낮음" : "기타",
      withdrawalType: i % 3 === 0 ? "자진탈퇴" : i % 2 === 0 ? "관리자처리" : "자동탈퇴",
      finalActivity: "2024.12.10"
    }));

    // 페이지네이션 시뮬레이션
    const page = params.page || 0;
    const size = params.size || 10;
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedData = mockWithdrawals.slice(startIndex, endIndex);

    return Promise.resolve({
      data: {
        content: paginatedData,
        totalElements: mockWithdrawals.length,
        totalPages: Math.ceil(mockWithdrawals.length / size),
        number: page,
        size: size
      }
    });
    */

  } catch (error) {
    console.error('탈퇴 내역 조회 실패:', error);
    
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