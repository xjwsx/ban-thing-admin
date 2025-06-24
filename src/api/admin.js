import api from "./index";

// 관리자 정보 가져오기
export const getAdminMe = async () => {
  try {
    console.log('🔍 관리자 정보 API 호출:', '/admin/me');
    const response = await api.get("/admin/me");
    console.log('📥 관리자 정보 응답:', response.data);
    return response;
  } catch (error) {
    console.error('관리자 정보 조회 실패:', error);
    
    // API 실패 시 사용자에게 친화적인 에러 메시지
    if (error.code === 'ECONNREFUSED') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } else if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    } else if (error.response?.status === 403) {
      throw new Error('권한이 없습니다.');
    } else if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    throw error;
  }
};

// 계정 목록 가져오기 (실제 API 연결)
export const getAccounts = async (params = {}) => {
  try {
    // 디버깅을 위한 파라미터 로그
    console.log('🔍 전달받은 파라미터:', params);

    // 백엔드에서 startDate와 endDate는 필수이므로 기본값 설정
    const startDate = params.startDate || '2025-01-01'; // 2025년 1월 1일
    const endDate = params.endDate || '2025-12-31'; // 2025년 12월 31일
    
    // status와 reportFilterType도 기본값 설정
    const status = params.accountStatus || 'ACTIVE'; // 기본값: ACTIVE
    const reportFilterType = params.reportRecord && params.reportRecord !== "" && params.reportRecord !== "all" 
      ? params.reportRecord 
      : 'NO_REPORTS'; // 기본값: NO_REPORTS

    // 원하는 순서대로 쿼리 파라미터 구성
    const queryParams = new URLSearchParams();
    
    // 1. 필수 파라미터 먼저
    queryParams.append('startDate', startDate);
    queryParams.append('endDate', endDate);

    // 2. 선택적 파라미터 (기본값 포함)
    queryParams.append('status', status);
    queryParams.append('reportFilterType', reportFilterType);

    // 3. 페이지네이션 파라미터 마지막
    queryParams.append('page', (params.page || 0).toString());
    queryParams.append('size', (params.size || 10).toString());

    console.log('🔍 API 호출:', `/admin/account?${queryParams.toString()}`);
    return api.get(`/admin/account?${queryParams.toString()}`);

    // Mock 데이터 (API 실패 시 백업용 - 필요시 주석 해제)
    /*
    const mockAccounts = Array.from({ length: 25 }, (_, i) => ({
      userId: 167235 - i,
      nickname: `반띵#${4278232137 - i}`,
      status: i % 4 === 0 ? "SUSPENDED" : i % 3 === 0 ? "DORMANT" : "ACTIVE",
      reportCount: i % 5 === 0 ? 3 : i % 3 === 0 ? 1 : 0,
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
    }));

    // 페이지네이션 시뮬레이션
    const page = params.page || 0;
    const size = params.size || 10;
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedData = mockAccounts.slice(startIndex, endIndex);

    return Promise.resolve({
      data: {
        status: "success",
        data: {
          content: paginatedData,
          totalElements: mockAccounts.length,
          totalPages: Math.ceil(mockAccounts.length / size),
          number: page,
          size: size
        },
        message: null
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
    const queryParams = new URLSearchParams();

    // 필수 파라미터 순서: startDate, endDate, minReports, page, size
    queryParams.append('startDate', params.startDate || '2025-01-01');
    queryParams.append('endDate', params.endDate || '2025-12-31');
    queryParams.append('minReports', (params.minReports || 1).toString());
    queryParams.append('page', (params.page || 0).toString());
    queryParams.append('size', (params.size || 10).toString());

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
    const queryParams = new URLSearchParams();

    // 필수 파라미터 순서: startDate, endDate, page, size
    queryParams.append('startDate', params.startDate || '2025-01-01');
    queryParams.append('endDate', params.endDate || '2025-12-31');
    queryParams.append('page', (params.page || 0).toString());
    queryParams.append('size', (params.size || 10).toString());

    // 탈퇴 사유가 있으면 추가
    if (params.reason && params.reason !== "" && params.reason !== "all") {
      queryParams.append('reason', params.reason);
    }

    console.log('🔍 탈퇴 내역 API 호출:', `/admin/deletions?${queryParams.toString()}`);
    return api.get(`/admin/deletions?${queryParams.toString()}`);

    // Mock 데이터 (API 실패 시 백업용 - 필요시 주석 해제)
    /*
    const mockWithdrawals = Array.from({ length: 25 }, (_, i) => ({
      id: (i + 1).toString(),
      withdrawalId: `WD${1000 + i}`,
      withdrawalDate: "2024.12.15",
      memberId: `USER${2000 + i}`,
      nickname: `사용자${i + 1}`,
      status: i % 4 === 0 ? "정지" : i % 3 === 0 ? "휴면" : "정상",
      reportRecord: i % 5 === 0 ? "3건" : i % 3 === 0 ? "1건" : "없음",
      restricted: i % 7 === 0 ? "제한" : "없음"
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
export const adminLogin = async (data) => {
  try {
    console.log('🔍 로그인 API 호출:', '/admin/login');
    console.log('📤 요청 데이터:', data);
    
    // POST 요청에서 query parameter로 데이터 전송
    const response = await api.post("/admin/login", null, {
      params: data
    });
    console.log('📥 응답 데이터:', response.data);
    return response;
  } catch (error) {
    console.error('로그인 실패:', error);
    
    // API 실패 시 사용자에게 친화적인 에러 메시지
    if (error.code === 'ECONNREFUSED') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } else if (error.response?.status === 401) {
      throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
    } else if (error.response?.status === 403) {
      throw new Error('관리자 권한이 없습니다.');
    } else if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    throw error;
  }
};



// 회원 탈퇴 처리
export const withdrawMembers = async (memberIds) => {
  try {
    console.log('🔍 회원 탈퇴 처리 API 호출:', '/admin/account/withdraw');
    console.log('📤 요청 데이터:', { memberIds });
    
    const response = await api.post('/admin/account/withdraw', { memberIds });
    console.log('📥 응답 데이터:', response.data);
    return response;
  } catch (error) {
    console.error('회원 탈퇴 처리 실패:', error);
    
    // API 실패 시 사용자에게 친화적인 에러 메시지
    if (error.code === 'ECONNREFUSED') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } else if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    } else if (error.response?.status === 403) {
      throw new Error('권한이 없습니다.');
    } else if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    throw error;
  }
};

// 계정 정지 처리
export const suspendMembers = async (memberIds) => {
  try {
    console.log('🔍 계정 정지 처리 API 호출:', '/admin/account/suspend');
    console.log('📤 요청 데이터:', { memberIds });
    
    const response = await api.post('/admin/account/suspend', { memberIds });
    console.log('📥 응답 데이터:', response.data);
    return response;
  } catch (error) {
    console.error('계정 정지 처리 실패:', error);
    
    // API 실패 시 사용자에게 친화적인 에러 메시지
    if (error.code === 'ECONNREFUSED') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } else if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    } else if (error.response?.status === 403) {
      throw new Error('권한이 없습니다.');
    } else if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    throw error;
  }
};

// 계정 활성화 처리
export const activateMembers = async (memberIds) => {
  try {
    console.log('🔍 계정 활성화 처리 API 호출:', '/admin/account/activate');
    console.log('📤 요청 데이터:', { memberIds });
    
    const response = await api.post('/admin/account/activate', { memberIds });
    console.log('📥 응답 데이터:', response.data);
    return response;
  } catch (error) {
    console.error('계정 활성화 처리 실패:', error);
    
    // API 실패 시 사용자에게 친화적한 에러 메시지
    if (error.code === 'ECONNREFUSED') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } else if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    } else if (error.response?.status === 403) {
      throw new Error('권한이 없습니다.');
    } else if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    throw error;
  }
};

// ============================================================================
// 신고 관리 API
// ============================================================================

// 신고 삭제
export const deleteReports = async (reportIdList) => {
  try {
    // reportIdList를 query parameter로 전송 (배열이면 첫 번째 값 사용, 아니면 그대로 사용)
    const reportId = Array.isArray(reportIdList) ? reportIdList[0] : reportIdList;
    const queryParams = new URLSearchParams({
      reportIdList: reportId.toString()
    });
    
    console.log('🔍 신고 삭제 API 호출:', `/items/report/delete?${queryParams.toString()}`);
    console.log('📤 요청 데이터:', { reportIdList: reportId });
    
    // POST 요청에서 query parameter 사용
    const response = await api.post(`/items/report/delete?${queryParams.toString()}`);
    console.log('📥 응답 데이터:', response.data);
    return response;
  } catch (error) {
    console.error('신고 삭제 실패:', error);
    
    // API 실패 시 사용자에게 친화적인 에러 메시지
    if (error.code === 'ECONNREFUSED') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } else if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    } else if (error.response?.status === 403) {
      throw new Error('권한이 없습니다.');
    } else if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    throw error;
  }
};

// 신고 어드민 삭제
export const adminDeleteReports = async (reportIdList) => {
  try {
    // 실제 API 호출
    const response = await api.post('/items/report/adminDelete', { reportIdList });
    return response;

    // Mock 응답 (테스트용 - 필요시 주석 해제)
    /*
    console.log('Mock: 신고 어드민 삭제 처리', reportIdList);
    return Promise.resolve({
      data: {
        success: true,
        message: `${reportIdList.length}건의 신고가 관리자에 의해 삭제되었습니다.`,
        deletedCount: reportIdList.length
      }
    });
    */
  } catch (error) {
    console.error('신고 어드민 삭제 실패:', error);
    
    // API 실패 시 사용자에게 친화적인 에러 메시지
    if (error.code === 'ECONNREFUSED') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } else if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    } else if (error.response?.status === 403) {
      throw new Error('권한이 없습니다.');
    } else if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    throw error;
  }
};

// 신고 어드민 무효
export const adminInvalidReports = async (reportIdList) => {
  try {
    // reportIdList를 query parameter로 전송 (배열이면 첫 번째 값 사용, 아니면 그대로 사용)
    const reportId = Array.isArray(reportIdList) ? reportIdList[0] : reportIdList;
    const queryParams = new URLSearchParams({
      reportIdList: reportId.toString()
    });
    
    console.log('🔍 신고 무효 API 호출:', `/items/report/invalid?${queryParams.toString()}`);
    console.log('📤 요청 데이터:', { reportIdList: reportId });
    
    // POST 요청에서 query parameter 사용
    const response = await api.post(`/items/report/invalid?${queryParams.toString()}`);
    console.log('📥 응답 데이터:', response.data);
    return response;
  } catch (error) {
    console.error('신고 어드민 무효 실패:', error);
    
    // API 실패 시 사용자에게 친화적인 에러 메시지
    if (error.code === 'ECONNREFUSED') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } else if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    } else if (error.response?.status === 403) {
      throw new Error('권한이 없습니다.');
    } else if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    throw error;
  }
};

// 신고 어드민 검토
export const adminCheckReports = async (reportIdList) => {
  try {
    // 실제 API 호출
    const response = await api.post('/items/report/adminCheck', { reportIdList });
    return response;

    // Mock 응답 (테스트용 - 필요시 주석 해제)
    /*
    console.log('Mock: 신고 어드민 검토 처리', reportIdList);
    return Promise.resolve({
      data: {
        success: true,
        message: `${reportIdList.length}건의 신고가 검토 상태로 변경되었습니다.`,
        checkedCount: reportIdList.length
      }
    });
    */
  } catch (error) {
    console.error('신고 어드민 검토 실패:', error);
    
    // API 실패 시 사용자에게 친화적인 에러 메시지
    if (error.code === 'ECONNREFUSED') {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } else if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    } else if (error.response?.status === 403) {
      throw new Error('권한이 없습니다.');
    } else if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    throw error;
  }
};

