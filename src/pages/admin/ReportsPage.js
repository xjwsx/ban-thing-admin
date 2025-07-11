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
import ReportDetailModal from "../../components/ui/ReportDetailModal";
import { getReports, deleteReports, adminInvalidReports, adminCheckReports } from "../../api/admin";

const ReportsPage = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  // 필터 상태 관리
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [mainReason, setMainReason] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState(null);
  
  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // 초기 로드 상태 관리
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // 데이터 상태 관리
  const [reportsData, setReportsData] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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

  // 신고 사유 데이터 정의 (간소화)
  const reasonsMap = {
    "advert": "광고성 콘텐츠",
    "product_info": "상품 정보 부정확",
    "prohibited_item": "거래 금지 품목",
    "unsafe_trade": "안전한 거래 거부",
    "fraud": "사기 의심",
    "copyright": "전문 판매업자 의심",
    "illegal": "불법한 내용",
    "offensive": "직성적 신고",
    "banned_account": "반려동물(식용 제외)",
    "animal": "동일/유사한 제품을 단기간에 판매",
    "trade_violation": "원금 거래 및 약투대납 유도",
    "bad_user": "비매너 사용자"
  };

  // API에서 신고 내역 데이터 가져오기
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage - 1, // API는 0부터 시작
        size: itemsPerPage,
      };

      // 시작일과 종료일 설정
      if (startDate && endDate) {
        // 둘 다 선택된 경우
        params.startDate = format(startDate, 'yyyy-MM-dd');
        params.endDate = format(endDate, 'yyyy-MM-dd');
      } else {
        // 선택되지 않은 경우 현재 년도의 1월 1일부터 12월 31일까지
        const today = new Date();
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1); // 0은 1월을 의미
        const lastDayOfYear = new Date(today.getFullYear(), 11, 31); // 11은 12월을 의미
        
        params.startDate = format(firstDayOfYear, 'yyyy-MM-dd');
        params.endDate = format(lastDayOfYear, 'yyyy-MM-dd');
        
        console.log('🗓️ 기본 날짜 범위 설정:', {
          startDate: params.startDate,
          endDate: params.endDate
        });
      }

      // 필터 파라미터들 추가 (값이 있을 때만 포함)
      if (mainReason && mainReason.trim() !== '') {
        params.hiReason = mainReason;
      }
      if (keyword && keyword.trim() !== '') {
        params.keyword = keyword;
      }
      if (status && status.trim() !== '') {
        params.status = status;
      }

      console.log('🔍 신고 내역 API 호출 파라미터:', params);
      const response = await getReports(params);
      
      // API 응답 처리 (에러 처리 강화)
      if (response.data) {
        if (response.data.status === 'success' && response.data.data && response.data.data.content) {
          // 성공적인 응답
          setReportsData(response.data.data.content);
          setTotalElements(response.data.data.totalElements);
        } else if (response.data.status === 'error') {
          // API에서 에러 응답을 받은 경우
          console.warn('API 에러:', response.data.message);
          
          // 이미지 인코딩 에러인 경우 사용자에게 알림
          if (response.data.message && response.data.message.includes('Base64')) {
            setError('이미지 처리 중 오류가 발생했습니다. 이미지 없이 데이터를 표시합니다.');
          } else {
            setError(response.data.message || '데이터를 불러오는데 실패했습니다.');
          }
          
          setReportsData([]);
          setTotalElements(0);
        } else {
          // 예상하지 못한 응답 구조
          setReportsData([]);
          setTotalElements(0);
        }
      } else {
        setReportsData([]);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('신고 내역 조회 실패:', error);
      setError(error.message || '데이터를 불러오는데 실패했습니다.');
      setReportsData([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, startDate, endDate, mainReason, keyword, status]); // 필터 관련 의존성 다시 추가

  // 초기 데이터 로드 함수
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: 0, // 초기에는 첫 페이지
        size: itemsPerPage,
      };

      // 초기 로드 시에는 현재 년도의 1월 1일부터 12월 31일까지를 기본 기간으로 설정
      const today = new Date();
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1); // 0은 1월을 의미
      const lastDayOfYear = new Date(today.getFullYear(), 11, 31); // 11은 12월을 의미
      
      params.startDate = format(firstDayOfYear, 'yyyy-MM-dd');
      params.endDate = format(lastDayOfYear, 'yyyy-MM-dd');
      
      console.log('🗓️ 초기 데이터 로드 - 기본 날짜 범위:', {
        startDate: params.startDate,
        endDate: params.endDate
      });

      const response = await getReports(params);
      
      // API 응답 처리 (에러 처리 강화)
      if (response.data) {
        if (response.data.status === 'success' && response.data.data && response.data.data.content) {
          // 성공적인 응답
          setReportsData(response.data.data.content);
          setTotalElements(response.data.data.totalElements);
        } else if (response.data.status === 'error') {
          // API에서 에러 응답을 받은 경우
          console.warn('API 에러:', response.data.message);
          
          // 이미지 인코딩 에러인 경우 사용자에게 알림
          if (response.data.message && response.data.message.includes('Base64')) {
            setError('이미지 처리 중 오류가 발생했습니다. 이미지 없이 데이터를 표시합니다.');
          } else {
            setError(response.data.message || '데이터를 불러오는데 실패했습니다.');
          }
          
          setReportsData([]);
          setTotalElements(0);
        } else {
          // 예상하지 못한 응답 구조
          setReportsData([]);
          setTotalElements(0);
        }
      } else {
        setReportsData([]);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
      setError(error.message || '데이터를 불러오는데 실패했습니다.');
      setReportsData([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
      setIsInitialLoad(false); // 초기 로드 완료 표시
    }
  }, [itemsPerPage]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 페이지 변경 시 데이터 로드
  useEffect(() => {
    if (isInitialLoad) return; // 초기 로드 중에는 호출하지 않음
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isInitialLoad]); // fetchReports 의존성 제거

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(totalElements / itemsPerPage);

  // 현재 페이지에 표시할 데이터
  const currentItems = reportsData;

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
    console.log('📄 신고내역 페이지 변경:', currentPage, '→', pageNumber);
    setCurrentPage(pageNumber);
  };

  const handleSearch = () => {
    // 검색 로직 구현
    console.log('🔍 필터 조건으로 검색:', {
      startDate,
      endDate,
      mainReason,
      keyword,
      status
    });
    
    // 검색 시 첫 페이지로 이동
    if (currentPage !== 1) {
      setCurrentPage(1); // 페이지가 변경되면 useEffect에서 fetchReports 호출됨
    } else {
      // 이미 1페이지인 경우 직접 fetchReports 호출
      fetchReports();
    }
  };

  // 페이지네이션을 위한 그룹화 로직
  const getPaginationGroup = () => {
    const groupSize = 5; // 한 그룹에 표시할 페이지 수
    const start = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
    const end = Math.min(start + groupSize - 1, totalPages);
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) return '-';
      return format(date, 'yyyy.MM.dd');
    } catch (error) {
      console.error('날짜 포맷 오류:', error);
      return '-';
    }
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
    setModalMessage("해당 글을 삭제하시겠습니까?");
    setModalAction("delete");
    setIsModalOpen(true);
  };

  const handleInvalidClick = () => {
    setModalMessage("해당 글을 무효처리하시겠습니까?");
    setModalAction("invalid");
    setIsModalOpen(true);
  };

  const handleReviewClick = () => {
    setModalMessage("해당 글을 검토하시겠습니까?");
    setModalAction("review");
    setIsModalOpen(true);
  };

  const handleModalConfirm = async () => {
    try {
      setLoading(true);
      
      if (modalAction === "delete") {
        // 삭제 API 호출
        await deleteReports(selectedRows);
        setNotificationMessage(`${selectedRows.length}건의 신고가 삭제되었습니다.`);
      } else if (modalAction === "invalid") {
        // 무효처리 API 호출
        await adminInvalidReports(selectedRows);
        setNotificationMessage(`${selectedRows.length}건의 신고가 무효처리되었습니다.`);
      } else if (modalAction === "review") {
        // 검토 API 호출
        await adminCheckReports(selectedRows);
        setNotificationMessage(`${selectedRows.length}건의 신고가 검토 상태로 변경되었습니다.`);
      }
      
      // 성공 후 데이터 새로고침
      await fetchReports();
      
    } catch (error) {
      console.error(`${modalAction} 실패:`, error);
      setNotificationMessage(`처리 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
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

  // 신고상세 모달 핸들러
  const handleRowClick = (report) => {
    try {
      // 이미지 데이터 유효성 체크
      if (report.images && Array.isArray(report.images) && report.images.length > 0) {
        console.log('📷 이미지 데이터 확인됨:', report.images.length, '개');
      }
      
      // 해당 신고의 상세 정보를 설정
      setSelectedReportDetail(report);
      setIsReportDetailModalOpen(true);
    } catch (error) {
      console.error('신고 상세보기 처리 중 오류:', error);
      setNotificationMessage('신고 상세보기를 표시하는 중 오류가 발생했습니다.');
      setIsNotificationOpen(true);
    }
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
          
          {/* 신고 사유 */}
          <Select value={mainReason} onValueChange={setMainReason}>
            <SelectTrigger className="border border-gray-300 bg-white">
              {mainReason ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">신고 사유</div>
              )}
            </SelectTrigger>
            <SelectContent>
              {Object.entries(reasonsMap).map(([key, label]) => (
                <SelectItem key={key} value={label}>{label}</SelectItem>
              ))}
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

        <div className="flex items-center gap-[10px]">
          {/* 처리상태 */}
          <div className="relative" style={{ width: "calc(25% - 12px)" }}>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="border border-gray-300 bg-white h-[40px]">
                {status ? (
                  <SelectValue />
                ) : (
                  <div className="text-gray-600">상태</div>
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
        <Button 
          variant="outline" 
          className={`w-[104px] h-[40px] rounded border ${
            selectedRows.length === 0 
              ? 'bg-[#F4F4F5] text-[#B6B6B6] border-[#F4F4F5] hover:bg-[#FAFAFA] hover:text-[#2B2B31] cursor-not-allowed' 
              : 'bg-[#18181B] text-[#FFFFFF] border-[#18181B] hover:bg-[#18181B] hover:text-[#FFFFFF]'
          }`}
          onClick={handleDeleteClick} 
          disabled={selectedRows.length === 0 || loading}
        >
          삭제
        </Button>
        <Button 
          variant="outline" 
          className={`w-[104px] h-[40px] rounded border ${
            selectedRows.length === 0 
              ? 'bg-[#F4F4F5] text-[#B6B6B6] border-[#F4F4F5] hover:bg-[#FAFAFA] hover:text-[#2B2B31] cursor-not-allowed' 
              : 'bg-[#18181B] text-[#FFFFFF] border-[#18181B] hover:bg-[#18181B] hover:text-[#FFFFFF]'
          }`}
          onClick={handleInvalidClick} 
          disabled={selectedRows.length === 0 || loading}
        >
          무효
        </Button>
        <Button 
          variant="outline" 
          className={`w-[104px] h-[40px] rounded border ${
            selectedRows.length === 0 
              ? 'bg-[#F4F4F5] text-[#B6B6B6] border-[#F4F4F5] hover:bg-[#FAFAFA] hover:text-[#2B2B31] cursor-not-allowed' 
              : 'bg-[#18181B] text-[#FFFFFF] border-[#18181B] hover:bg-[#18181B] hover:text-[#FFFFFF]'
          }`}
          onClick={handleReviewClick} 
          disabled={selectedRows.length === 0 || loading}
        >
          검토
        </Button>
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
                {currentItems.length > 0 ? (
                  currentItems.map((row) => (
                    <TableRow 
                      key={row.reportId} 
                      className="h-[44px] hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(row)}
                    >
                      <TableCell className="p-1 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center items-center">
                          <Checkbox
                            checked={selectedRows.includes(row.reportId)}
                            onCheckedChange={() => handleRowSelect(row.reportId)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="p-1">{row.reportId || '-'}</TableCell>
                      <TableCell className="p-1 max-w-[200px] truncate">{row.itemTitle || '-'}</TableCell>
                      <TableCell className="p-1">{row.hiReason ? row.hiReason.replace(/['"]/g, '') : '-'}</TableCell>
                      <TableCell className="p-1">{formatDate(row.createdAt)}</TableCell>
                      <TableCell className="p-1">{row.reporterId || '-'}</TableCell>
                      <TableCell className="p-1">{row.reportedUserId || '-'}</TableCell>
                      <TableCell className="p-1">{getStatusBadge(row.status || '-')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-[200px] text-center text-gray-500">
                      {error ? "데이터를 불러올 수 없습니다." : "신고 내역이 없습니다."}
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