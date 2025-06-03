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
import ReportDetailModal from "../../components/ui/ReportDetailModal";

const ReportsPage = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  // 필터 상태 관리
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [mainReason, setMainReason] = useState(null);
  const [subReason, setSubReason] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState(null);
  
  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // NotificationModal 상태 관리
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // 신고상세 모달 상태 관리
  const [isReportDetailModalOpen, setIsReportDetailModalOpen] = useState(false);
  const [selectedReportDetail, setSelectedReportDetail] = useState(null);

  // 신고 사유 데이터 정의
  const reasonsMap = {
    "advert": {
      label: "광고성 콘텐츠",
      subReasons: [
        { value: "advert_1", label: "상점 및 타사이트 홍보" },
        { value: "advert_2", label: "블래만 내용" },
        { value: "advert_3", label: "직성적 신고" }
      ]
    },
    "product_info": {
      label: "상품 정보 부정확",
      subReasons: [
        { value: "product_info_1", label: "상품 정보 부정확" }
      ]
    },
    "prohibited_item": {
      label: "거래 금지 품목",
      subReasons: [
        { value: "prohibited_item_1", label: "거래 금지 품목" }
      ]
    },
    "unsafe_trade": {
      label: "안전한 거래 거부",
      subReasons: [
        { value: "unsafe_trade_1", label: "안전한 거래 거부" }
      ]
    },
    "fraud": {
      label: "사기 의심",
      subReasons: [
        { value: "fraud_1", label: "사기 의심" }
      ]
    },
    "copyright": {
      label: "전문 판매업자 의심",
      subReasons: [
        { value: "copyright_1", label: "전문 판매업자 의심" }
      ]
    },
    "illegal": {
      label: "불법한 내용",
      subReasons: [
        { value: "illegal_1", label: "불법한 내용" }
      ]
    },
    "offensive": {
      label: "직성적 신고",
      subReasons: [
        { value: "offensive_1", label: "직성적 신고" }
      ]
    },
    "banned_account": {
      label: "반려동물(식용 제외)",
      subReasons: [
        { value: "banned_1", label: "가봉(쥐조류/이빨동물)" },
        { value: "banned_2", label: "파충류(뱀/거북/도마뱀 등)" },
        { value: "banned_3", label: "개인정보 거래(SNS계정, 인증번호 등)" },
        { value: "banned_4", label: "계정제공/아이템/대리육성" },
        { value: "banned_5", label: "담배" },
        { value: "banned_6", label: "화장품 샘플(견본품, 증정품)" },
        { value: "banned_7", label: "음란물 / 성인용품" },
        { value: "banned_8", label: "의약품/의료 기기" },
        { value: "banned_9", label: "주류" }
      ]
    },
    "animal": {
      label: "동일/유사한 제품을 단기간에 판매",
      subReasons: [
        { value: "animal_1", label: "동일 제품을 다양한 사이즈나 색상 판매" },
        { value: "animal_2", label: "거래 완료 후, 추가 금액 요청" }
      ]
    },
    "trade_violation": {
      label: "원금 거래 및 약투대납 유도",
      subReasons: [
        { value: "trade_violation_1", label: "배송완료 전 거래완료 요청" },
        { value: "trade_violation_2", label: "거래 완료 후, 추가 금액 요청" }
      ]
    },
    "bad_user": {
      label: "비매너 사용자",
      subReasons: [
        { value: "bad_user_1", label: "거래 중 문의 발생" },
        { value: "bad_user_2", label: "사기 의심" },
        { value: "bad_user_3", label: "특정 버튼 클릭유도 사용" },
        { value: "bad_user_4", label: "연락 목적외 활용하지 않는 대화 시도" },
        { value: "bad_user_5", label: "부적절한 성적 행위" },
        { value: "bad_user_6", label: "기타 부적절한 행위" }
      ]
    }
  };

  // 상위 사유 변경 시 하위 사유 초기화
  const handleMainReasonChange = (value) => {
    setMainReason(value);
    setSubReason(null);
  };

  // 모의 데이터 생성 (더 많은 데이터 생성)
  const mockData = Array.from({ length: 35 }, (_, i) => ({
    id: (i + 1).toString(),
    no: i + 1,
    reportId: `R${1000 + i}`,
    date: '2025.06.11',
    title: i % 4 === 0 ? '고양이 옷' : i % 3 === 0 ? '나눔나눔' : '제목입니다.',
    mainReason: '신고 사유 입니다.',
    subReason: '신고 사유 입니다.',
    reporterId: `USER${2000 + i}`,
    reportedId: `USER${3000 + i}`,
    status: i % 4 === 0 ? '처리중' : i % 3 === 0 ? '무효처리' : i % 2 === 0 ? '처리완료' : '미처리'
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
      startDate,
      endDate,
      mainReason,
      subReason,
      keyword,
      status
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

  function getStatusBadge(status) {
    switch (status) {
      case '처리완료':
        return <div className="bg-[#F3F3F3] text-gray-400 font-medium px-3 py-1 rounded-md inline-block text-center">처리완료</div>;
      case '미처리':
        return <div className="bg-[#FFF5F5] text-[#FF8989] font-medium px-3 py-1 rounded-md inline-block text-center">미처리</div>;
      case '처리중':
        return <div className="bg-[#6A8BFF] text-white font-medium px-3 py-1 rounded-md inline-block text-center">처리중</div>;
      case '무효처리':
        return <div className="bg-white border-2 border-gray-200 text-gray-500 font-medium px-3 py-1 rounded-md inline-block text-center">무효처리</div>;
      default:
        return <div className="bg-[#F3F3F3] text-gray-500 font-medium px-3 py-1 rounded-md inline-block text-center">{status}</div>;
    }
  }

  // 모달 핸들러 함수들
  const handleDeleteClick = () => {
    if (selectedRows.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }
    setModalMessage("해당 글을 삭제하시겠습니까?");
    setModalAction("delete");
    setIsModalOpen(true);
  };

  const handleInvalidClick = () => {
    if (selectedRows.length === 0) {
      alert("무효처리할 항목을 선택해주세요.");
      return;
    }
    setModalMessage("해당 글을 무효처리하시겠습니까?");
    setModalAction("invalid");
    setIsModalOpen(true);
  };

  const handleReviewClick = () => {
    if (selectedRows.length === 0) {
      alert("검토할 항목을 선택해주세요.");
      return;
    }
    setModalMessage("해당 글을 검토하시겠습니까?");
    setModalAction("review");
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    // 실제 API 호출이나 상태 업데이트 로직을 여기에 추가
    console.log(`${modalAction} action confirmed for items:`, selectedRows);
    
    // 여기에 실제 처리 로직 추가
    if (modalAction === "delete") {
      // 삭제 로직
      setNotificationMessage("삭제가 완료되었습니다.");
    } else if (modalAction === "invalid") {
      // 무효처리 로직
      setNotificationMessage("무효처리가 완료되었습니다.");
    } else if (modalAction === "review") {
      // 검토 로직
      setNotificationMessage("검토가 완료되었습니다.");
    }
    
    setIsModalOpen(false);
    setSelectedRows([]);
    setIsNotificationOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleNotificationClose = () => {
    setIsNotificationOpen(false);
  };

  // 신고상세 모달 핸들러
  const handleRowClick = (report) => {
    // 해당 신고의 상세 정보를 설정 (실제로는 API에서 가져와야 함)
    setSelectedReportDetail(report);
    setIsReportDetailModalOpen(true);
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
          
          {/* 신고 사유 */}
          <Select value={mainReason} onValueChange={handleMainReasonChange}>
            <SelectTrigger className="border border-gray-300 bg-white">
              {mainReason ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">상위 신고 사유</div>
              )}
            </SelectTrigger>
            <SelectContent>
              {Object.entries(reasonsMap).map(([value, data]) => (
                <SelectItem key={value} value={value}>{data.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* 신고 상세 사유 */}
          <Select 
            value={subReason} 
            onValueChange={setSubReason}
            disabled={!mainReason}
          >
            <SelectTrigger className="border border-gray-300 bg-white">
              {subReason ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">하위 신고 사유</div>
              )}
            </SelectTrigger>
            <SelectContent>
              {mainReason && reasonsMap[mainReason].subReasons.map(reason => (
                <SelectItem key={reason.value} value={reason.value}>
                  {reason.label}
                </SelectItem>
              ))}
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

          {/* 처리상태 */}
          <div className="w-40">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="border border-gray-300 bg-white h-[40px]">
                {status ? (
                  <SelectValue />
                ) : (
                  <div className="text-gray-600">처리상태</div>
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="처리완료">처리완료</SelectItem>
                <SelectItem value="미처리">미처리</SelectItem>
                <SelectItem value="처리중">처리중</SelectItem>
                <SelectItem value="무효처리">무효처리</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]" onClick={handleDeleteClick}>삭제</Button>
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]" onClick={handleInvalidClick}>무효</Button>
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]" onClick={handleReviewClick}>검토</Button>
      </div>

      <div className="flex flex-col h-full justify-between">
        {/* 테이블 컨테이너 - 테이블 영역만 포함 */}
        <div className="overflow-auto rounded-md border h-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 h-[44px]">
                <TableHead className="w-[50px] text-center p-2"></TableHead>
                <TableHead className=" p-2">신고 ID</TableHead>
                <TableHead className=" p-2">제목</TableHead>
                <TableHead className=" p-2">상위 신고 사유</TableHead>
                <TableHead className=" p-2">날짜</TableHead>
                <TableHead className=" p-2">신고자 ID</TableHead>
                <TableHead className=" p-2">피신고자 ID</TableHead>
                <TableHead className=" p-2">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((row) => (
                <TableRow 
                  key={row.id} 
                  className="h-[44px] hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(row)}
                >
                  <TableCell className="p-1 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={selectedRows.includes(row.id)}
                        onCheckedChange={() => handleRowSelect(row.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="p-1">{row.reportId}</TableCell>
                  <TableCell className="p-1">{row.title}</TableCell>
                  <TableCell className="p-1">{row.mainReason}</TableCell>
                  <TableCell className="p-1">{row.date}</TableCell>
                  <TableCell className="p-1">{row.reporterId}</TableCell>
                  <TableCell className="p-1">{row.reportedId}</TableCell>
                  <TableCell className="p-1">{getStatusBadge(row.status)}</TableCell>
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

      {/* 신고상세 모달 컴포넌트 */}
      <ReportDetailModal
        isOpen={isReportDetailModalOpen}
        onClose={() => setIsReportDetailModalOpen(false)}
        reportDetail={selectedReportDetail}
      />
    </div>
  );
};

export default ReportsPage; 