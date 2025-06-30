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

    // 원하는 순서대로 쿼리 파라미터 구성
    const queryParams = new URLSearchParams();
    
    // 1. 필수 파라미터 먼저
    queryParams.append('startDate', startDate);
    queryParams.append('endDate', endDate);

    // 2. 선택적 파라미터 (값이 있을 때만 추가)
    if (params.accountStatus && params.accountStatus !== "") {
      queryParams.append('status', params.accountStatus);
    }
    
    if (params.reportRecord && params.reportRecord !== "" && params.reportRecord !== "all") {
      queryParams.append('reportFilterType', params.reportRecord);
    }

    // 3. 페이지네이션 파라미터 마지막
    queryParams.append('page', (params.page || 0).toString());
    queryParams.append('size', (params.size || 10).toString());

    console.log('🔍 API 호출:', `/admin/account?${queryParams.toString()}`);
    return api.get(`/admin/account?${queryParams.toString()}`);

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

    // 필수 파라미터 순서: startDate, endDate, page, size
    queryParams.append('startDate', params.startDate || '2025-01-01');
    queryParams.append('endDate', params.endDate || '2025-12-31');
    queryParams.append('page', (params.page || 0).toString());
    queryParams.append('size', (params.size || 10).toString());

    // 필수 파라미터들 추가 (항상 포함)
    queryParams.append('hiReason', params.hiReason || '');
    queryParams.append('keyword', params.keyword || '');
    queryParams.append('status', params.status || '');

    // 기존 minReports 파라미터 유지 (선택적)
    if (params.minReports !== undefined && params.minReports !== null) {
      queryParams.append('minReports', params.minReports.toString());
    }

    console.log('🔍 신고 내역 API 호출:', `/admin/reports?${queryParams.toString()}`);
    return api.get(`/admin/reports?${queryParams.toString()}`);

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

    // minReports 파라미터 추가
    if (params.minReports !== undefined && params.minReports !== null) {
      queryParams.append('minReports', params.minReports.toString());
    }

    console.log('🔍 탈퇴 내역 API 호출:', `/admin/reports/users?${queryParams.toString()}`);
    return api.get(`/admin/reports/users?${queryParams.toString()}`);

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
    const results = [];
    
    // 각 사용자마다 개별 API 호출
    for (const memberId of memberIds) {
      console.log(`🔍 계정 정지 처리 API 호출: /admin/${memberId}/suspend`);
      console.log('📤 요청 데이터:', { memberId });
      
      const response = await api.post(`/admin/${memberId}/suspend`);
      console.log('📥 응답 데이터:', response.data);
      results.push(response);
    }
    
    return results[0]; // 첫 번째 응답을 반환 (기존 호환성 유지)
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
    const results = [];
    
    // 각 사용자마다 개별 API 호출
    for (const memberId of memberIds) {
      console.log(`🔍 계정 활성화 처리 API 호출: /admin/${memberId}/activate`);
      console.log('📤 요청 데이터:', { memberId });
      
      const response = await api.post(`/admin/${memberId}/activate`);
      console.log('📥 응답 데이터:', response.data);
      results.push(response);
    }
    
    return results[0]; // 첫 번째 응답을 반환 (기존 호환성 유지)
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

// 재가입 제한 처리
export const restrictRejoinMembers = async (memberIds) => {
  try {
    const results = [];
    
    // 각 사용자마다 개별 API 호출
    for (const memberId of memberIds) {
      console.log(`🔍 재가입 제한 처리 API 호출: /admin/rejoin-restriction?userId=${memberId}`);
      console.log('📤 요청 데이터:', { userId: memberId });
      
      const response = await api.post(`/admin/rejoin-restriction?userId=${memberId}`);
      console.log('📥 응답 데이터:', response.data);
      results.push(response);
    }
    
    return results[0]; // 첫 번째 응답을 반환 (기존 호환성 유지)
  } catch (error) {
    console.error('재가입 제한 처리 실패:', error);
    
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

// ============================================================================
// 신고 관리 API
// ============================================================================

// 신고 삭제
export const deleteReports = async (reportIdList) => {
  try {
    // reportIdList를 콤마로 구분된 문자열로 변환
    const reportIds = Array.isArray(reportIdList) ? reportIdList.join(',') : reportIdList.toString();
    const queryParams = new URLSearchParams({
      reportIdList: reportIds
    });
    
    console.log('🔍 신고 삭제 API 호출:', `/items/report/delete?${queryParams.toString()}`);
    console.log('📤 요청 데이터:', { reportIdList: reportIds });
    
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
    // reportIdList를 콤마로 구분된 문자열로 변환
    const reportIds = Array.isArray(reportIdList) ? reportIdList.join(',') : reportIdList.toString();
    const queryParams = new URLSearchParams({
      reportIdList: reportIds
    });
    
    console.log('🔍 신고 무효 API 호출:', `/items/report/invalid?${queryParams.toString()}`);
    console.log('📤 요청 데이터:', { reportIdList: reportIds });
    
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
    // reportIdList를 콤마로 구분된 문자열로 변환
    const reportIds = Array.isArray(reportIdList) ? reportIdList.join(',') : reportIdList.toString();
    const queryParams = new URLSearchParams({
      reportIdList: reportIds
    });
    
    console.log('🔍 신고 검토 API 호출:', `/items/report/check?${queryParams.toString()}`);
    console.log('📤 요청 데이터:', { reportIdList: reportIds });
    
    // POST 요청에서 query parameter 사용
    const response = await api.post(`/items/report/check?${queryParams.toString()}`);
    console.log('📥 응답 데이터:', response.data);
    return response;
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

