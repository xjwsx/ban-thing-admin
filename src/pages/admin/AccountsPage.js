import React, { useState, useEffect } from "react";
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
  PaginationEllipsis,
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
  const [reportHistory, setReportHistory] = useState("all");
  const [keyword, setKeyword] = useState("");
  
  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // 계정 목록 API 호출
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage - 1, // API는 0부터 시작
        size: itemsPerPage,
        startDate,
        endDate,
        accountStatus,
        reportHistory: reportHistory === "all" ? "" : reportHistory,
      };

      console.log('📤 API 요청 파라미터:', params);
      const response = await getAccounts(params);
      console.log('📥 API 응답:', response);
      
      // API 응답 구조에 따라 조정
      const data = response.data;
      setAccounts(data.content || data.data || data || []);
      setTotalElements(data.totalElements || data.total || 0);
      
    } catch (err) {
      const errorMessage = err.message || '데이터 조회 중 오류가 발생했습니다.';
      setError(errorMessage);
      setAccounts([]); // 에러 시 빈 배열로 설정
      setTotalElements(0);
      
      console.error('계정 목록 조회 실패:', err);
      
      // 개발환경에서만 상세 에러 정보 표시
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 개발 모드: API 연결 실패 시 Mock 데이터를 사용하려면 admin.js에서 Mock 코드를 주석 해제하세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 및 의존성 변경 시 데이터 조회
  useEffect(() => {
    fetchAccounts();
  }, [currentPage, itemsPerPage, startDate, endDate, accountStatus, reportHistory]);

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

  const handleSearch = () => {
    // 검색 시 첫 페이지로 이동 후 API 호출
    setCurrentPage(1);
    // useEffect에 의해 fetchAccounts가 자동 호출됨
  };

  // 페이지네이션을 위한 그룹화 로직
  const getPaginationGroup = () => {
    const groupSize = 5; // 한 그룹에 표시할 페이지 수
    const currentGroup = Math.floor((currentPage - 1) / groupSize);
    const start = currentGroup * groupSize + 1;
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
    // 해당 회원의 신고이력 데이터를 설정 (실제로는 API에서 가져와야 함)
    const mockReportData = [
      {
        reporterId: "A321",
        reportedId: member.memberId || member.id,
        reportReason: "동일 제품을 다양한 사이즈나 색상 판매",
        joinDate: member.joinDate || "00.00.00"
      },
      {
        reporterId: "A321", 
        reportedId: member.memberId || member.id,
        reportReason: "동일 제품을 다양한 사이즈나 색상 판매",
        joinDate: member.joinDate || "00.00.00"
      }
    ];
    
    setSelectedMemberReportData(mockReportData);
    setIsReportHistoryModalOpen(true);
  };

  const handleReportHistoryModalClose = () => {
    setIsReportHistoryModalOpen(false);
    setSelectedMemberReportData([]);
  };

  // 체크박스 클릭 시 이벤트 전파 방지
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
              <SelectItem value="active">정상</SelectItem>
              <SelectItem value="blocked">차단됨</SelectItem>
              <SelectItem value="restricted">제한됨</SelectItem>
              <SelectItem value="dormant">휴면</SelectItem>
            </SelectContent>
          </Select>
          
          {/* 신고 이력 */}
          <Select value={reportHistory} onValueChange={setReportHistory}>
            <SelectTrigger className="border border-gray-300 bg-white">
              {reportHistory && reportHistory !== "all" ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">신고 이력</div>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="0">없음</SelectItem>
              <SelectItem value="1">1건 이상</SelectItem>
              <SelectItem value="2">2건 이상</SelectItem>
              <SelectItem value="3">3건 이상</SelectItem>
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

      {/* 테이블 헤더 버튼 */}
      <div className="flex gap-[8px]">
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]" onClick={handleWithdrawalClick}>회원 탈퇴</Button>
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]" onClick={handleSuspensionClick}>계정 정지</Button>
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]" onClick={handleActivationClick}>활성화</Button>
      </div>
<div className="flex flex-col h-full justify-between">
      {/* 테이블 컨테이너 - 테이블 영역만 포함 */}
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
            {loading ? (
              <TableRow className="h-[44px]">
                <TableCell colSpan={7} className="h-[44px] p-2 text-center">
                  데이터를 불러오는 중...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow className="h-[44px]">
                <TableCell colSpan={7} className="h-[44px] p-2 text-center text-red-500">
                  데이터 로드 실패: {error}
                </TableCell>
              </TableRow>
            ) : currentItems.length === 0 ? (
              <TableRow className="h-[44px]">
                <TableCell colSpan={7} className="h-[44px] p-2 text-center">
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((row, index) => (
                <TableRow 
                  key={row.id || index} 
                  className="h-[44px] hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(row)}
                >
                  <TableCell className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={selectedRows.includes(row.id || index.toString())}
                        onCheckedChange={() => handleRowSelect(row.id || index.toString())}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="p-2">{row.memberId || row.id}</TableCell>
                  <TableCell className="p-2">{row.joinDate || row.createdAt}</TableCell>
                  <TableCell className="p-2">{row.nickname || row.name}</TableCell>
                  <TableCell className="p-2">{row.status || row.accountStatus}</TableCell>
                  <TableCell className="p-2">{row.reportHistory || row.reportCount}</TableCell>
                  <TableCell className="p-2">{row.restricted || row.rejoinRestricted}</TableCell>
                </TableRow>
              ))
            )}
            {/* 로딩이 아닌 경우에만 빈 행 추가 */}
            {!loading && !error && currentItems.length < 10 && Array.from({ length: 10 - currentItems.length }).map((_, index) => (
              <TableRow key={`empty-${index}`} className="h-[44px]">
                <TableCell colSpan={7} className="h-[44px] p-2">&nbsp;</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* 페이지네이션 - main content 하단 중앙에 배치 */}
      <div className="w-full flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => {
                  if (currentPage > 1) {
                    const groupSize = 5;
                    const currentGroup = Math.floor((currentPage - 1) / groupSize);
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
                    const currentGroup = Math.floor((currentPage - 1) / groupSize);
                    const lastPageInGroup = (currentGroup + 1) * groupSize;
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