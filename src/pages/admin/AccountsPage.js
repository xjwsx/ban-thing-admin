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

const AccountsPage = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  // 필터 상태 관리
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [accountStatus, setAccountStatus] = useState(null);
  const [reportHistory, setReportHistory] = useState(null);
  
  // 모의 데이터 생성
  const mockData = [
    {
      id: '1',
      no: 1,
      memberId: 'A417',
      joinDate: '00.00.00',
      nickname: '코코',
      status: '정상',
      reportHistory: '1건',
      restricted: '정상'
    },
    {
      id: '2',
      no: 2,
      memberId: 'A117',
      joinDate: '00.00.00',
      nickname: '코코',
      status: '정상',
      reportHistory: '1건',
      restricted: '정상'
    },
    {
      id: '3',
      no: 3,
      memberId: 'A250',
      joinDate: '00.00.00',
      nickname: '코코',
      status: '정상',
      reportHistory: '1건',
      restricted: '정상'
    },
    {
      id: '4',
      no: 4,
      memberId: 'A301',
      joinDate: '00.00.00',
      nickname: '코코',
      status: '정상',
      reportHistory: '1건',
      restricted: '정상'
    },
    {
      id: '5',
      no: 5,
      memberId: 'A120',
      joinDate: '00.00.00',
      nickname: '코코',
      status: '정상',
      reportHistory: '1건',
      restricted: '정상'
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
      keyword,
      accountStatus,
      reportHistory
    });
  };

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
          
          {/* 계정 상태 */}
          <Select value={accountStatus} onValueChange={setAccountStatus}>
            <SelectTrigger className="border border-gray-300">
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
            <SelectTrigger className="border border-gray-300">
              {reportHistory ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">신고 이력</div>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">없음</SelectItem>
              <SelectItem value="1">1건</SelectItem>
              <SelectItem value="2">2건</SelectItem>
              <SelectItem value="3+">3건 이상</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-[10px]">
          {/* 검색 키워드 */}
          <div className="relative w-1/4">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="키워드를 입력하세요"
              className="pl-8 h-[40px] w-full"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
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
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]">회원 탈퇴</Button>
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]">계정 정지</Button>
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 w-[104px] h-[40px]">활성화</Button>
      </div>

      {/* 테이블 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[50px] text-center"></TableHead>
              <TableHead className="w-[70px]">NO.</TableHead>
              <TableHead>회원 ID</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>닉네임</TableHead>
              <TableHead>계정 상태</TableHead>
              <TableHead>신고이력</TableHead>
              <TableHead>재가입 제한 여부</TableHead>
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
                <TableCell>{row.memberId}</TableCell>
                <TableCell>{row.joinDate}</TableCell>
                <TableCell>{row.nickname}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.reportHistory}</TableCell>
                <TableCell>{row.restricted}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AccountsPage; 