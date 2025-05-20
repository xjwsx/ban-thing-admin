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

const ReportsPage = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  // 필터 상태 관리
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [mainReason, setMainReason] = useState(null);
  const [subReason, setSubReason] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState(null);
  
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

  // 모의 데이터 생성
  const mockData = [
    {
      id: '1',
      no: 1,
      reportId: 'Credit Card',
      date: '2025.06.11',
      title: '고양이 옷',
      mainReason: '신고 사유 입니다.',
      subReason: '신고 사유 입니다.',
      status: '처리중'
    },
    {
      id: '2',
      no: 2,
      reportId: 'PayPal',
      date: '2025.06.11',
      title: '나눔나눔',
      mainReason: '신고 사유 입니다.',
      subReason: '신고 사유 입니다.',
      status: '무효처리'
    },
    {
      id: '3',
      no: 3,
      reportId: 'Bank Transfer',
      date: '2025.06.11',
      title: '제목입니다.',
      mainReason: '신고 사유 입니다.',
      subReason: '신고 사유 입니다.',
      status: '처리완료'
    },
    {
      id: '4',
      no: 4,
      reportId: 'Credit Card',
      date: '2025.06.11',
      title: '제목입니다.',
      mainReason: '신고 사유 입니다.',
      subReason: '신고 사유 입니다.',
      status: '미처리'
    },
    {
      id: '5',
      no: 5,
      reportId: 'PayPal',
      date: '2025.06.11',
      title: '제목입니다.',
      mainReason: '신고 사유 입니다.',
      subReason: '신고 사유 입니다.',
      status: '처리완료'
    },
    {
      id: '6',
      no: 6,
      reportId: 'Bank Transfer',
      date: '2025.06.11',
      title: '제목입니다.',
      mainReason: '신고 사유 입니다.',
      subReason: '신고 사유 입니다.',
      status: '처리완료'
    },
    {
      id: '7',
      no: 7,
      reportId: 'Credit Card',
      date: '2025.06.11',
      title: '제목입니다.',
      mainReason: '신고 사유 입니다.',
      subReason: '신고 사유 입니다.',
      status: '처리완료'
    },
  ];

  const handleRowSelect = (id) => {
    setSelectedRows((prev) => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
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
  };

  function getStatusBadge(status) {
    switch (status) {
      case '처리중':
        return <div className="bg-[#6A8BFF] text-white font-medium px-5 py-1 rounded-md inline-block text-center">처리중</div>;
      case '무효처리':
        return <div className="bg-white border border-gray-200 text-gray-500 font-medium px-5 py-1 rounded-md inline-block text-center">무효처리</div>;
      case '처리완료':
        return <div className="bg-[#F3F3F3] text-gray-500 font-medium px-5 py-1 rounded-md inline-block text-center">처리완료</div>;
      case '미처리':
        return <div className="bg-[#FFF5F5] text-[#FF8989] font-medium px-5 py-1 rounded-md inline-block text-center">미처리</div>;
      default:
        return <div className="bg-[#F3F3F3] text-gray-500 font-medium px-5 py-1 rounded-md inline-block text-center">{status}</div>;
    }
  }

  return (
    <div className="space-y-6">
      {/* 필터 섹션 */}
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {/* 시작일 */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left font-normal"
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
                className="w-full justify-between text-left font-normal"
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

          {/* 상위 신고 사유 */}
          <Select value={mainReason} onValueChange={handleMainReasonChange}>
            <SelectTrigger className="border border-gray-300">
              {mainReason ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">상위 신고 사유</div>
              )}
            </SelectTrigger>
            <SelectContent>
              {Object.entries(reasonsMap).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 하위 신고 사유 */}
          <Select value={subReason} onValueChange={setSubReason} disabled={!mainReason}>
            <SelectTrigger className="border border-gray-300">
              {subReason ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">하위 신고 사유</div>
              )}
            </SelectTrigger>
            <SelectContent>
              {mainReason && reasonsMap[mainReason].subReasons.map((subReason) => (
                <SelectItem key={subReason.value} value={subReason.value}>
                  {subReason.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-[10px]">
          {/* 검색 키워드 */}
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="검색할 키워드를 입력하세요."
              className="pl-8 w-[204px] h-[40px]"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          {/* 상태 */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="border border-gray-300 w-[126px] h-[40px]">
              {status ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">상태</div>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">미처리</SelectItem>
              <SelectItem value="processing">처리중</SelectItem>
              <SelectItem value="completed">처리완료</SelectItem>
              <SelectItem value="invalid">무효처리</SelectItem>
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
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]">기본</Button>
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]">무효</Button>
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]">검토</Button>
      </div>

      {/* 테이블 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[50px] text-center"></TableHead>
              <TableHead className="w-[70px]">NO.</TableHead>
              <TableHead>신고 ID</TableHead>
              <TableHead>날짜</TableHead>
              <TableHead>글 제목</TableHead>
              <TableHead>상위 신고 사유</TableHead>
              <TableHead>하위 신고 사유</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="p-2 text-center">
                  <div className="flex justify-center items-center">
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={() => handleRowSelect(row.id)}
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{row.no}</TableCell>
                <TableCell>{row.reportId}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.mainReason}</TableCell>
                <TableCell>{row.subReason}</TableCell>
                <TableCell>{getStatusBadge(row.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReportsPage; 