import React, { useState } from "react";
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
import { Badge } from "../../components/ui/badge";

const ReportsPage = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  // 필터 상태 관리
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [mainReason, setMainReason] = useState(null);
  const [subReason, setSubReason] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState(null);
  
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
      status: '접수대기'
    },
    {
      id: '2',
      no: 2,
      reportId: 'PayPal',
      date: '2025.06.11',
      title: '나눔나눔',
      mainReason: '신고 사유 입니다.',
      subReason: '신고 사유 입니다.',
      status: '처리완료'
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
      status: '처리완료'
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
      case '접수대기':
        return <Badge className="bg-blue-500">접수대기</Badge>;
      case '처리완료':
        return <Badge className="bg-green-500">처리완료</Badge>;
      case '처리중':
        return <Badge className="bg-orange-500">처리중</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
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
          <Select value={mainReason} onValueChange={setMainReason}>
            <SelectTrigger className="border border-gray-300">
              {mainReason ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">상위 신고 사유</div>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reason1">부적절한 컨텐츠</SelectItem>
              <SelectItem value="reason2">사기/사칭</SelectItem>
              <SelectItem value="reason3">욕설/비하</SelectItem>
            </SelectContent>
          </Select>

          {/* 하위 신고 사유 */}
          <Select value={subReason} onValueChange={setSubReason}>
            <SelectTrigger className="border border-gray-300">
              {subReason ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">하위 신고 사유</div>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sub1">유해한 컨텐츠</SelectItem>
              <SelectItem value="sub2">허위 정보</SelectItem>
              <SelectItem value="sub3">개인정보 노출</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* 검색 키워드 */}
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="검색할 키워드를 입력하세요."
              className="pl-8 w-full"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          {/* 상태 */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="border border-gray-300">
              {status ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">상태</div>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">접수대기</SelectItem>
              <SelectItem value="processing">처리중</SelectItem>
              <SelectItem value="completed">처리완료</SelectItem>
            </SelectContent>
          </Select>

          {/* 검색 버튼 */}
          <div className="col-span-2 flex justify-end">
            <Button
              className="bg-black hover:bg-gray-800 w-[165px]"
              onClick={handleSearch}
            >
              검색
            </Button>
          </div>
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