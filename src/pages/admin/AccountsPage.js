import React, { useState, useEffect, useCallback } from "react";
import { SearchIcon, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Calendar } from "../../components/ui/calendar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import ConfirmModal from "../../components/ui/ConfirmModal";
import NotificationModal from "../../components/ui/NotificationModal";
import ReportHistoryModal from "../../components/ui/ReportHistoryModal";
import { getAccounts, withdrawMembers, suspendMembers, activateMembers } from "../../api/admin";

const AccountsPage = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  // 필터 상태 관리
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [accountStatus, setAccountStatus] = useState("");
  const [reportRecord, setReportRecord] = useState("all");
  const [keyword, setKeyword] = useState("");
  
  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 초기 로드 상태 관리
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalDetails, setModalDetails] = useState(null);
  const [modalAction, setModalAction] = useState(null);

  // NotificationModal 상태 관리
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // 신고이력 모달 상태 관리
  const [isReportHistoryModalOpen, setIsReportHistoryModalOpen] = useState(false);
  const [selectedMemberReportData, setSelectedMemberReportData] = useState([]);

  // API 데이터 상태 관리
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState(null);

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(totalElements / itemsPerPage);

  // API에서 받은 데이터를 현재 아이템으로 사용
  const currentItems = accounts;

  // API에서 계정 데이터 가져오기
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage - 1, // API는 0부터 시작
        size: itemsPerPage,
      };

      // 시작일이 있으면 추가
      if (startDate) {
        params.startDate = format(startDate, 'yyyy-MM-dd');
      }

      // 종료일이 있으면 추가
      if (endDate) {
        params.endDate = format(endDate, 'yyyy-MM-dd');
      }

      // 계정 상태가 있으면 추가
      if (accountStatus && accountStatus !== "") {
        params.accountStatus = accountStatus;
      }

      // 신고 이력이 있으면 추가
      if (reportRecord && reportRecord !== "" && reportRecord !== "all") {
        params.reportRecord = reportRecord;
      }

      // 키워드가 있으면 추가
      if (keyword && keyword !== "") {
        params.keyword = keyword;
      }

      console.log('API 호출 파라미터:', params); // 디버깅용 로그

      const response = await getAccounts(params);
      
      // 실제 API 응답 구조에 맞게 수정
      if (response.data && response.data.status === 'success' && response.data.data && response.data.data.content) {
        setAccounts(response.data.data.content);
        setTotalElements(response.data.data.totalElements);
      } else {
        setAccounts([]);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('계정 목록 조회 실패:', error);
      setError(error.message || '데이터를 불러오는데 실패했습니다.');
      setAccounts([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, startDate, endDate, accountStatus, reportRecord, keyword]); // 필터 관련 의존성 다시 추가

  // 초기 데이터 로드를 위한 함수
  const loadInitialData = useCallback(async () => {
    // 날짜 자동 설정 제거 - placeholder만 표시되도록 함
    await fetchAccounts();
    setIsInitialLoad(false); // 초기 로드 완료
  }, [fetchAccounts]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 페이지 변경 시 데이터 로드
  useEffect(() => {
    if (isInitialLoad) return; // 초기 로드 중에는 호출하지 않음
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isInitialLoad]); // fetchAccounts 의존성 제거

  const handleRowSelect = (userId) => {
    setSelectedRows((prev) => {
      if (prev.includes(userId)) {
        return prev.filter(rowId => rowId !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handlePageChange = (pageNumber) => {
    console.log('📄 계정관리 페이지 변경:', currentPage, '→', pageNumber);
    setCurrentPage(pageNumber);
  };

  const handleSearch = () => {
    // 검색 로직 구현
    console.log('🔍 필터 조건으로 검색:', {
      startDate,
      endDate,
      accountStatus,
      reportRecord,
      keyword
    });
    
    // 검색 시 첫 페이지로 이동
    if (currentPage !== 1) {
      setCurrentPage(1); // 페이지가 변경되면 useEffect에서 fetchAccounts 호출됨
    } else {
      // 이미 1페이지인 경우 직접 fetchAccounts 호출
      fetchAccounts();
    }
  };

  // 페이지네이션을 위한 그룹화 로직
  const getPaginationGroup = () => {
    const groupSize = 5; // 한 그룹에 표시할 페이지 수
    const start = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
    const end = Math.min(start + groupSize - 1, totalPages);
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // 모달 핸들러 함수들
  const handleWithdrawalClick = () => {
    if (selectedRows.length === 0) {
      alert("탈퇴시킬 회원을 선택해주세요.");
      return;
    }
    setModalMessage("해당 회원을 탈퇴시키겠습니까?");
    setModalDetails(null);
    setModalAction("withdrawal");
    setIsModalOpen(true);
  };

  const handleSuspensionClick = () => {
    if (selectedRows.length === 0) {
      alert("정지시킬 회원을 선택해주세요.");
      return;
    }
    setModalMessage("해당 회원을 정지시키겠습니까?");
    setModalDetails(null);
    setModalAction("suspension");
    setIsModalOpen(true);
  };

  const handleActivationClick = () => {
    if (selectedRows.length === 0) {
      alert("활성화할 회원을 선택해주세요.");
      return;
    }
    setModalMessage(`정지된 회원 ${selectedRows.length}명을 활성화시키겠습니까?`);
    setModalDetails([
      "정상/탈퇴된 계정은 변경되지 않습니다.",
      "선택한 계정 중 정지 상태인 회원만 활성화됩니다."
    ]);
    setModalAction("activation");
    setIsModalOpen(true);
  };

  // 신고이력 모달 핸들러
  const handleRowClick = (member) => {
    // getAccounts API 응답에 포함된 신고이력 데이터 사용
    const reportHistory = member.reportDetails || [];
    
    setSelectedMemberReportData(reportHistory);
    setIsReportHistoryModalOpen(true);
  };

  const handleReportHistoryModalClose = () => {
    setIsReportHistoryModalOpen(false);
    setSelectedMemberReportData([]);
  };

  // 체크박스 클릭 시 이벤트 전파 방지
  // eslint-disable-next-line no-unused-vars
  const handleCheckboxClick = (e, id) => {
    e.stopPropagation();
    handleRowSelect(id);
  };

  const handleModalConfirm = async () => {
    try {
      console.log(`${modalAction} action confirmed for members:`, selectedRows);
      
      // 실제 API 호출
      if (modalAction === "withdrawal") {
        await withdrawMembers(selectedRows);
        setNotificationMessage("회원 탈퇴가 완료되었습니다.");
      } else if (modalAction === "suspension") {
        await suspendMembers(selectedRows);
        setNotificationMessage("회원 정지가 완료되었습니다.");
      } else if (modalAction === "activation") {
        await activateMembers(selectedRows);
        setNotificationMessage("선택한 회원이 정상 상태로 활성화되었습니다.");
      }
      
      // 성공 시 데이터 새로고침
      await fetchAccounts();
      
    } catch (error) {
      setNotificationMessage(`작업 처리 중 오류가 발생했습니다: ${error.message}`);
      console.error('회원 처리 실패:', error);
    } finally {
      setIsModalOpen(false);
      setSelectedRows([]);
      setIsNotificationOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleNotificationClose = () => {
    setIsNotificationOpen(false);
  };

  return (
    <div className="space-y-6 flex flex-col h-full relative">
      {/* 필터 섹션 */}
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {/* 날짜 범위 (시작일 ~ 종료일) */}
          <div className="col-span-2 flex items-center gap-2">
            {/* 시작일 */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal bg-white"
                >
                  {startDate ? (
                    format(startDate, "yyyy-MM-dd")
                  ) : (
                    <span className="text-muted-foreground">시작일</span>
                  )}
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>



            {/* 종료일 */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal bg-white"
                >
                  {endDate ? (
                    format(endDate, "yyyy-MM-dd")
                  ) : (
                    <span className="text-muted-foreground">종료일</span>
                  )}
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* 계정 상태 */}
          <Select value={accountStatus} onValueChange={setAccountStatus}>
            <SelectTrigger className="border border-gray-300 bg-white">
              {accountStatus ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">계정 상태</div>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">정상</SelectItem>
              <SelectItem value="DELETED">탈퇴</SelectItem>
              <SelectItem value="SUSPENDED">정지</SelectItem>
            </SelectContent>
          </Select>
          
          {/* 신고 이력 */}
          <Select value={reportRecord} onValueChange={setReportRecord}>
            <SelectTrigger className="border border-gray-300 bg-white">
              {reportRecord && reportRecord !== "all" ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">신고 이력</div>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="NO_REPORTS">없음</SelectItem>
              <SelectItem value="LESS_THAN_EQUAL_5">5건 이하</SelectItem>
              <SelectItem value="LESS_THAN_EQUAL_10">10건 이하</SelectItem>
              <SelectItem value="GREATER_THAN_10">10건 초과</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-[10px]">
          {/* 검색 키워드 */}
          <div className="relative" style={{ width: "calc(25% - 12px)" }}>
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="키워드를 입력하세요"
              className="pl-8 h-[40px] w-full bg-white"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          {/* 검색 버튼 */}
          <Button
            className="bg-black hover:bg-gray-800 w-[165px] h-[40px] ml-auto"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "검색 중..." : "검색"}
          </Button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 테이블 헤더 버튼 */}
      <div className="flex gap-[8px]">
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]" onClick={handleWithdrawalClick} disabled={loading}>회원 탈퇴</Button>
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]" onClick={handleSuspensionClick} disabled={loading}>계정 정지</Button>
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]" onClick={handleActivationClick} disabled={loading}>활성화</Button>
      </div>

      <div className="flex flex-col h-full justify-between">
        {/* 로딩 상태 */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">데이터를 불러오는 중...</div>
          </div>
        )}

        {/* 테이블 컨테이너 - 테이블 영역만 포함 */}
        {!loading && (
          <div className="overflow-auto rounded-md border h-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50 h-[44px]">
                  <TableHead className="w-[50px] text-center p-2"></TableHead>
                  <TableHead className="p-2">회원 ID</TableHead>
                  <TableHead className="p-2">가입일</TableHead>
                  <TableHead className="p-2">닉네임</TableHead>
                  <TableHead className="p-2">계정 상태</TableHead>
                  <TableHead className="p-2">신고이력</TableHead>
                  <TableHead className="p-2">재가입 제한 여부</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((row, index) => {
                    // 날짜 포맷팅 함수
                    const formatDate = (dateString) => {
                      if (!dateString) return '-';
                      try {
                        const date = new Date(dateString);
                        const year = date.getFullYear().toString().slice(-2); // 뒤 2자리
                        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 2자리 패딩
                        const day = date.getDate().toString().padStart(2, '0'); // 2자리 패딩
                        return `${year}.${month}.${day}`;
                      } catch {
                        return dateString;
                      }
                    };

                    // 상태 한글 변환
                    const getStatusText = (status) => {
                      switch(status) {
                        case 'ACTIVE': return '정상';
                        case 'DELETED': return '탈퇴';
                        case 'SUSPENDED': return '정지';
                        default: return status || '-';
                      }
                    };

                    // 신고 횟수 표시
                    const getReportText = (count) => {
                      if (count === 0) return '없음';
                      return `${count}건`;
                    };

                    // 신고 이력 스타일 (1건 이상이면 밑줄)
                    const getReportStyle = (count) => {
                      return count > 0 ? 'underline cursor-pointer' : '';
                    };

                    return (
                      <TableRow 
                        key={row.userId || index} 
                        className="h-[44px] hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleRowClick(row)}
                      >
                        <TableCell className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center items-center">
                            <Checkbox
                              checked={selectedRows.includes(row.userId?.toString() || index.toString())}
                              onCheckedChange={() => handleRowSelect(row.userId?.toString() || index.toString())}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="p-2">{row.userId || '-'}</TableCell>
                        <TableCell className="p-2">{formatDate(row.createdAt)}</TableCell>
                        <TableCell className="p-2">{row.nickname || '-'}</TableCell>
                        <TableCell className="p-2">{getStatusText(row.status)}</TableCell>
                        <TableCell className={`p-2 ${getReportStyle(row.reportCount)}`}>{getReportText(row.reportCount)}</TableCell>
                        <TableCell className="p-2">-</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-[200px] text-center text-gray-500">
                      {error ? "데이터를 불러올 수 없습니다." : "계정 정보가 없습니다."}
                    </TableCell>
                  </TableRow>
                )}
                {/* 항상 빈 행을 추가하여 테이블 높이 일정하게 유지 */}
                {currentItems.length > 0 && currentItems.length < 10 && Array.from({ length: 10 - currentItems.length }).map((_, index) => (
                  <TableRow key={`empty-${index}`} className="h-[44px]">
                    <TableCell colSpan={7} className="h-[44px] p-2">&nbsp;</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 페이지네이션 - main content 하단 중앙에 배치 */}
        {!loading && totalElements > 0 && (
          <div className="w-full flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => {
                      if (currentPage > 1) {
                        const groupSize = 5;
                        if (currentPage % groupSize === 1) {
                          // 그룹의 첫 페이지인 경우 이전 그룹의 마지막 페이지로
                          handlePageChange(currentPage - 1);
                        } else {
                          // 그룹 내에서 이전 페이지로
                          handlePageChange(currentPage - 1);
                        }
                      }
                    }} 
                    href="#"
                    aria-disabled={currentPage === 1}
                    className={`${currentPage === 1 ? "pointer-events-none opacity-50" : ""} h-10 w-10`}
                  />
                </PaginationItem>
                
                {getPaginationGroup().map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href="#" 
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => {
                      if (currentPage < totalPages) {
                        const groupSize = 5;
                        const lastPageInGroup = Math.ceil(currentPage / groupSize) * groupSize;
                        if (currentPage === lastPageInGroup || currentPage === totalPages) {
                          // 그룹의 마지막 페이지인 경우 다음 그룹의 첫 페이지로
                          handlePageChange(currentPage + 1);
                        } else {
                          // 그룹 내에서 다음 페이지로
                          handlePageChange(currentPage + 1);
                        }
                      }
                    }}
                    href="#"
                    aria-disabled={currentPage === totalPages}
                    className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : ""} h-10 w-10`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* 모달 컴포넌트 */}
      <ConfirmModal
        isOpen={isModalOpen}
        message={modalMessage}
        details={modalDetails}
        onConfirm={handleModalConfirm}
        onClose={handleModalClose}
      />

      {/* 알림 모달 컴포넌트 */}
      <NotificationModal
        isOpen={isNotificationOpen}
        message={notificationMessage}
        onClose={handleNotificationClose}
      />

      {/* 신고이력 모달 컴포넌트 */}
      <ReportHistoryModal
        isOpen={isReportHistoryModalOpen}
        onClose={handleReportHistoryModalClose}
        reportData={selectedMemberReportData}
      />
    </div>
  );
};

export default AccountsPage; 