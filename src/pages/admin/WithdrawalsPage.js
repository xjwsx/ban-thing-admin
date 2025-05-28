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

const WithdrawalsPage = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  
  // 필터 상태 관리
  const [searchType, setSearchType] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState(null);
  
  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // 모의 데이터 생성 (더 많은 데이터 생성)
  const mockData = Array.from({ length: 35 }, (_, i) => ({
    id: (i + 1).toString(),
    no: i + 1,
    userId: i % 3 === 0 ? 'Credit Card' : i % 2 === 0 ? 'PayPal' : 'Bank Transfer',
    joinDate: '2025.06.11',
    withdrawalDate: '2025.06.11',
    lastAccessDate: '2025.06.11',
    reason: i % 4 === 0 ? '찾는 물품이 없어요' : i % 3 === 0 ? '물품이 안 팔려요' : i % 2 === 0 ? '비매너 사용자를 만났어요' : '개인정보를 삭제하고 싶어요'
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

  return (
    <div className="space-y-6 flex flex-col h-full">
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
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]">개정 복구</Button>
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]">재가입 제한</Button>
      </div>

      {/* 테이블 컨테이너 - 테이블 영역 높이 고정 */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* 테이블 */}
        <div className="rounded-md border flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[50px] text-center"></TableHead>
                <TableHead>사용자 ID</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>탈퇴일</TableHead>
                <TableHead>탈퇴 전 마지막 접속일</TableHead>
                <TableHead>탈퇴 사유</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="p-2 text-center">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={selectedRows.includes(row.id)}
                        onCheckedChange={() => handleRowSelect(row.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>{row.userId}</TableCell>
                  <TableCell>{row.joinDate}</TableCell>
                  <TableCell>{row.withdrawalDate}</TableCell>
                  <TableCell>{row.lastAccessDate}</TableCell>
                  <TableCell>{row.reason}</TableCell>
                </TableRow>
              ))}
              {/* 항상 빈 행을 추가하여 테이블 높이 일정하게 유지 */}
              {currentItems.length < 10 && Array.from({ length: 10 - currentItems.length }).map((_, index) => (
                <TableRow key={`empty-${index}`}>
                  <TableCell colSpan={6} className="h-[44px]">&nbsp;</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* 페이지네이션 - 화면 최하단에 고정 */}
      <div className="fixed bottom-2 left-0 right-0 w-full flex justify-center">
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
  );
};

export default WithdrawalsPage; 