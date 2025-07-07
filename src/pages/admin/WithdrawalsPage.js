import React, { useState, useEffect, useCallback } from "react";
import { SearchIcon, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
// Shadcn UI 컴포넌트들
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
import { getWithdrawals, restrictRejoinMembers } from "../../api/admin";

const WithdrawalsPage = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  
  // 필터 상태 관리
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState('');
  
  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // 데이터 상태 관리
  const [withdrawalsData, setWithdrawalsData] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // 알림 모달 상태 관리
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // API에서 탈퇴 내역 데이터 가져오기
  const fetchWithdrawals = useCallback(async () => {
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

      // 탈퇴 사유가 있으면 추가
      if (withdrawalReason && withdrawalReason !== "") {
        params.reason = withdrawalReason;
      }

      const response = await getWithdrawals(params);
      
      // 원래 API 응답 구조로 복구
      if (response.data && response.data.status === 'success' && response.data.data && response.data.data.content) {
        setWithdrawalsData(response.data.data.content);
        setTotalElements(response.data.data.totalElements);
      } else {
        setWithdrawalsData([]);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('탈퇴 내역 조회 실패:', error);
      setError(error.message || '데이터를 불러오는데 실패했습니다.');
      setWithdrawalsData([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, withdrawalReason]);

  // 초기 데이터 로드를 위한 함수
  const loadInitialData = useCallback(async () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // 현재 달의 1일부터 오늘까지 자동 설정
    setStartDate(firstDayOfMonth);
    setEndDate(today);
    
    await fetchWithdrawals();
  }, [fetchWithdrawals]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 페이지/필터 변경 시 데이터 로드 (날짜 제외)
  useEffect(() => {
    if (currentPage === 1) return; // 초기 로드에서는 호출하지 않음
    fetchWithdrawals();
  }, [currentPage, itemsPerPage, withdrawalReason]);

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(totalElements / itemsPerPage);

  // 현재 페이지에 표시할 데이터
  const currentItems = withdrawalsData;

  const handleRowSelect = (id) => {
    setSelectedRows((prev) => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = async () => {
    // 검색 로직 구현
    console.log('필터 조건으로 검색:', {
      startDate,
      endDate,
      keyword,
      withdrawalReason
    });
    // 검색 후 첫 페이지로 이동하고 데이터 다시 로드
    setCurrentPage(1);
    await fetchWithdrawals();
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd HH:mm');
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return dateString;
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
  const handleRejoinRestrictionClick = () => {
    if (selectedRows.length === 0) {
      alert("재가입 제한할 계정을 선택해주세요.");
      return;
    }
    setModalMessage("해당 계정 재가입을 제한 하시겠습니까?");
    setModalAction("restriction");
    setIsModalOpen(true);
  };

  const handleModalConfirm = async () => {
    try {
      console.log(`${modalAction} action confirmed for accounts:`, selectedRows);
      
      // 실제 API 호출
      if (modalAction === "restriction") {
        await restrictRejoinMembers(selectedRows);
        setNotificationMessage(`${selectedRows.length}명의 계정이 재가입 제한으로 설정되었습니다.`);
        
        // 성공 시 데이터 새로고침
        await fetchWithdrawals();
      }
      
    } catch (error) {
      setNotificationMessage(`작업 처리 중 오류가 발생했습니다: ${error.message}`);
      console.error('재가입 제한 처리 실패:', error);
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

            {/* ~ 표시 */}
            <span className="text-gray-600 font-medium px-2">~</span>

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
            
          {/* 탈퇴 사유 */}
          <Select value={withdrawalReason} onValueChange={setWithdrawalReason}>
            <SelectTrigger className="border border-gray-300 bg-white">
              {withdrawalReason ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">탈퇴 사유</div>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="찾는 물품이 없어요">찾는 물품이 없어요</SelectItem>
              <SelectItem value="물품이 안 팔려요">물품이 안 팔려요</SelectItem>
              <SelectItem value="비매너 사용자를 만났어요">비매너 사용자를 만났어요</SelectItem>
              <SelectItem value="상품을 찾기 불편해요">상품을 찾기 불편해요</SelectItem>
              <SelectItem value="개인정보를 삭제하고 싶어요">개인정보를 삭제하고 싶어요</SelectItem>
              <SelectItem value="서비스가 나와 맞지 않음">서비스가 나와 맞지 않음</SelectItem>
              <SelectItem value="기타">기타</SelectItem>
            </SelectContent>
          </Select>

          {/* 검색 키워드 */}
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="키워드를 입력하세요"
              className="pl-8 h-[40px] w-full bg-white"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          {/* 검색 버튼 */}
          <Button
            className="bg-black hover:bg-gray-800 w-[165px] h-[40px]"
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
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[109px] h-[40px] rounded" onClick={handleRejoinRestrictionClick} disabled={loading}>재가입 제한</Button>
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
                  <TableHead className="p-2">탈퇴일</TableHead>
                  <TableHead className="p-2">마지막 접속일</TableHead>
                  <TableHead className="p-2">탈퇴 사유</TableHead>
                  <TableHead className="p-2">메모</TableHead>
                  <TableHead className="p-2">재가입 제한 여부</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((row) => (
                    <TableRow 
                      key={row.userId} 
                      className="h-[44px] hover:bg-gray-50"
                    >
                      <TableCell className="p-2 text-center">
                        <div className="flex justify-center items-center">
                          <Checkbox
                            checked={selectedRows.includes(row.userId)}
                            onCheckedChange={() => handleRowSelect(row.userId)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="p-2">{row.userId}</TableCell>
                      <TableCell className="p-2">{formatDate(row.joinedAt)}</TableCell>
                      <TableCell className="p-2">{formatDate(row.deletedAt)}</TableCell>
                      <TableCell className="p-2">{formatDate(row.lastLoginAt)}</TableCell>
                      <TableCell className="p-2">{row.reason}</TableCell>
                      <TableCell className="p-2">{row.memo || '-'}</TableCell>
                      <TableCell className="p-2">{row.rejoinRestricted ? '제한' : '없음'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-[200px] text-center text-gray-500">
                      {error ? "데이터를 불러올 수 없습니다." : "탈퇴 내역이 없습니다."}
                    </TableCell>
                  </TableRow>
                )}
                {/* 항상 빈 행을 추가하여 테이블 높이 일정하게 유지 */}
                {currentItems.length > 0 && currentItems.length < 10 && Array.from({ length: 10 - currentItems.length }).map((_, index) => (
                  <TableRow key={`empty-${index}`} className="h-[44px]">
                    <TableCell colSpan={8} className="h-[44px] p-2">&nbsp;</TableCell>
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
        onConfirm={handleModalConfirm}
        onClose={handleModalClose}
      />

      {/* 알림 모달 컴포넌트 */}
      <NotificationModal
        isOpen={isNotificationOpen}
        message={notificationMessage}
        onClose={handleNotificationClose}
      />
    </div>
  );
};

export default WithdrawalsPage; 