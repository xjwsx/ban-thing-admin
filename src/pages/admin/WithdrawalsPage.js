import React, { useState } from "react";
import { SearchIcon } from "lucide-react";
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

const WithdrawalsPage = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  
  // 필터 상태 관리
  const [searchType, setSearchType] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState(null);
  
  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // 알림 모달 상태 관리
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // 모의 데이터 생성 (더 많은 데이터 생성)
  const mockData = Array.from({ length: 35 }, (_, i) => ({
    id: (i + 1).toString(),
    no: i + 1,
    userId: i % 3 === 0 ? 'User' + (1000 + i) : i % 2 === 0 ? 'User' + (2000 + i) : 'User' + (3000 + i),
    joinDate: '2025.06.11',
    withdrawalDate: '2025.06.11',
    lastAccessDate: '2025.06.11',
    reason: i % 4 === 0 ? '찾는 물품이 없어요' : i % 3 === 0 ? '물품이 안 팔려요' : i % 2 === 0 ? '비매너 사용자를 만났어요' : '개인정보를 삭제하고 싶어요',
    memo: i % 5 === 0 ? '고객 요청으로 탈퇴' : i % 4 === 0 ? '불만사항 있음' : i % 3 === 0 ? '재가입 희망' : '',
    isRestricted: i % 7 === 0
  }));

  // 현재 페이지에 표시할 데이터 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = mockData.slice(indexOfFirstItem, indexOfLastItem);
  
  // 전체 페이지 수 계산
  const totalPages = Math.ceil(mockData.length / itemsPerPage);

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
    // 검색 로직 구현
    console.log('필터 조건으로 검색:', {
      searchType,
      keyword,
      withdrawalReason
    });
    // 검색 후 첫 페이지로 이동
    setCurrentPage(1);
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
  const handleRejoinRestrictionClick = () => {
    if (selectedRows.length === 0) {
      alert("재가입 제한할 계정을 선택해주세요.");
      return;
    }
    setModalMessage("해당 계정 재가입을 제한 하시겠습니까?");
    setModalAction("restriction");
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    // 실제 API 호출이나 상태 업데이트 로직을 여기에 추가
    console.log(`${modalAction} action confirmed for accounts:`, selectedRows);
    
    // 여기에 실제 처리 로직 추가
    if (modalAction === "restriction") {
      // 재가입 제한 로직
      // 성공 후 알림 모달 표시
      setNotificationMessage("재가입 제한 계정으로 설정되었습니다.");
      setIsNotificationOpen(true);
    }
    
    setIsModalOpen(false);
    setSelectedRows([]);
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
        <div className="flex items-center gap-[10px]">
          {/* 검색 드롭다운 */}
          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger className="border border-gray-300 bg-white w-[126px] h-[40px]">
              {searchType ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">날짜</div>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="userId">사용자 ID</SelectItem>
              <SelectItem value="email">이메일</SelectItem>
              <SelectItem value="phoneNumber">전화번호</SelectItem>
            </SelectContent>
          </Select>

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

          {/* 탈퇴 사유 */}
          <Select value={withdrawalReason} onValueChange={setWithdrawalReason}>
            <SelectTrigger className="border border-gray-300 bg-white w-[220px] h-[40px]">
              {withdrawalReason ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">탈퇴 사유</div>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reason1">찾는 물품이 없어요</SelectItem>
              <SelectItem value="reason2">물품이 안 팔려요</SelectItem>
              <SelectItem value="reason3">비매너 사용자를 만났어요</SelectItem>
              <SelectItem value="reason4">상품을 찾기 불편해요</SelectItem>
              <SelectItem value="reason5">개인정보를 삭제하고 싶어요</SelectItem>
              <SelectItem value="reason6">기타</SelectItem>
            </SelectContent>
          </Select>

          {/* 검색 버튼 */}
          <Button
            className="bg-black hover:bg-gray-800 w-[165px] h-[40px] ml-auto"
            onClick={handleSearch}
          >
            검색
          </Button>
        </div>
      </div>

      {/* 테이블 헤더 버튼 */}
      <div className="flex gap-[8px]">
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[109px] h-[40px] rounded" onClick={handleRejoinRestrictionClick}>재가입 제한</Button>
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
                <TableHead className="p-2">탈퇴일</TableHead>
                <TableHead className="p-2">마지막 접속일</TableHead>
                <TableHead className="p-2">탈퇴 사유</TableHead>
                <TableHead className="p-2">메모</TableHead>
                <TableHead className="p-2">재가입 제한 여부</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((row) => (
                <TableRow 
                  key={row.id} 
                  className="h-[44px] hover:bg-gray-50"
                >
                  <TableCell className="p-2 text-center">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={selectedRows.includes(row.id)}
                        onCheckedChange={() => handleRowSelect(row.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="p-2">{row.userId}</TableCell>
                  <TableCell className="p-2">{row.joinDate}</TableCell>
                  <TableCell className="p-2">{row.withdrawalDate}</TableCell>
                  <TableCell className="p-2">{row.lastAccessDate}</TableCell>
                  <TableCell className="p-2">{row.reason}</TableCell>
                  <TableCell className="p-2">{row.memo || '-'}</TableCell>
                  <TableCell className="p-2">{row.isRestricted ? '제한' : '없음'}</TableCell>
                </TableRow>
              ))}
              {/* 항상 빈 행을 추가하여 테이블 높이 일정하게 유지 */}
              {currentItems.length < 10 && Array.from({ length: 10 - currentItems.length }).map((_, index) => (
                <TableRow key={`empty-${index}`} className="h-[44px]">
                  <TableCell colSpan={8} className="h-[44px] p-2">&nbsp;</TableCell>
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