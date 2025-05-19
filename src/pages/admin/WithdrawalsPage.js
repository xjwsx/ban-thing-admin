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

const WithdrawalsPage = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  
  // 필터 상태 관리
  const [searchType, setSearchType] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState(null);
  
  // 모의 데이터 생성
  const mockData = [
    {
      id: '1',
      no: 1,
      userId: 'Credit Card',
      joinDate: '2025.06.11',
      withdrawalDate: '2025.06.11',
      lastAccessDate: '2025.06.11',
      reason: '신고 사유 입니다.',
    },
    {
      id: '2',
      no: 2,
      userId: 'PayPal',
      joinDate: '2025.06.11',
      withdrawalDate: '2025.06.11',
      lastAccessDate: '2025.06.11',
      reason: '신고 사유 입니다.',
    },
    {
      id: '3',
      no: 3,
      userId: 'Bank Transfer',
      joinDate: '2025.06.11',
      withdrawalDate: '2025.06.11',
      lastAccessDate: '2025.06.11',
      reason: '신고 사유 입니다.',
    },
    {
      id: '4',
      no: 4,
      userId: 'Credit Card',
      joinDate: '2025.06.11',
      withdrawalDate: '2025.06.11',
      lastAccessDate: '2025.06.11',
      reason: '신고 사유 입니다.',
    },
    {
      id: '5',
      no: 5,
      userId: 'PayPal',
      joinDate: '2025.06.11',
      withdrawalDate: '2025.06.11',
      lastAccessDate: '2025.06.11',
      reason: '신고 사유 입니다.',
    },
    {
      id: '6',
      no: 6,
      userId: 'Bank Transfer',
      joinDate: '2025.06.11',
      withdrawalDate: '2025.06.11',
      lastAccessDate: '2025.06.11',
      reason: '신고 사유 입니다.',
    },
    {
      id: '7',
      no: 7,
      userId: 'Credit Card',
      joinDate: '2025.06.11',
      withdrawalDate: '2025.06.11',
      lastAccessDate: '2025.06.11',
      reason: '신고 사유 입니다.',
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
      searchType,
      keyword,
      withdrawalReason
    });
  };

  return (
    <div className="space-y-6">
      {/* 필터 섹션 */}
      <div className="space-y-4">
        <div className="flex items-center gap-[10px]">
          {/* 검색 드롭다운 */}
          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger className="border border-gray-300 w-[126px] h-[40px]">
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
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="검색할 키워드를 입력하세요."
              className="pl-8 w-[204px] h-[40px]"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          {/* 탈퇴 사유 */}
          <Select value={withdrawalReason} onValueChange={setWithdrawalReason}>
            <SelectTrigger className="border border-gray-300 w-[220px] h-[40px]">
              {withdrawalReason ? (
                <SelectValue />
              ) : (
                <div className="text-gray-600">탈퇴 사유</div>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reason1">서비스 불만족</SelectItem>
              <SelectItem value="reason2">개인 정보 보호</SelectItem>
              <SelectItem value="reason3">다른 서비스 이용</SelectItem>
              <SelectItem value="reason4">기타</SelectItem>
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

      {/* 테이블 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[50px] text-center"></TableHead>
              <TableHead className="w-[70px]">NO.</TableHead>
              <TableHead>사용자 ID</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>탈퇴일</TableHead>
              <TableHead>탈퇴 전 마지막 접속일</TableHead>
              <TableHead>탈퇴 사유</TableHead>
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
                <TableCell>{row.userId}</TableCell>
                <TableCell>{row.joinDate}</TableCell>
                <TableCell>{row.withdrawalDate}</TableCell>
                <TableCell>{row.lastAccessDate}</TableCell>
                <TableCell>{row.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WithdrawalsPage; 