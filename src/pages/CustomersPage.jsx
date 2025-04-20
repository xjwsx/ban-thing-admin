import React, { useState } from "react";
import { 
  NotionContainer, 
  NotionHeader, 
  NotionPage, 
  NotionSection, 
  NotionDivider 
} from "../components/NotionLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "../components/ui/table";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "../components/ui/card";
import { Search, UserPlus, Filter } from "lucide-react";

// 샘플 데이터
const CUSTOMERS = [
  { id: 1, name: "홍길동", email: "hong@example.com", phone: "010-1234-5678", visits: 5, lastVisit: "2023-05-15" },
  { id: 2, name: "김철수", email: "kim@example.com", phone: "010-2345-6789", visits: 3, lastVisit: "2023-06-20" },
  { id: 3, name: "이영희", email: "lee@example.com", phone: "010-3456-7890", visits: 8, lastVisit: "2023-07-05" },
  { id: 4, name: "박지민", email: "park@example.com", phone: "010-4567-8901", visits: 1, lastVisit: "2023-07-10" },
  { id: 5, name: "최수진", email: "choi@example.com", phone: "010-5678-9012", visits: 4, lastVisit: "2023-07-18" },
];

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState(CUSTOMERS);

  const filteredCustomers = customers.filter(customer => 
    customer.name.includes(searchTerm) || 
    customer.email.includes(searchTerm) || 
    customer.phone.includes(searchTerm)
  );

  return (
    <NotionContainer>
      <NotionHeader 
        title="고객 관리" 
        description="자라다 고객 정보를 관리하고 모니터링하는 페이지입니다."
      />
      
      <NotionPage>
        <div className="flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="고객 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              필터
            </Button>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              고객 추가
            </Button>
          </div>
        </div>

        <NotionSection title="고객 개요">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">총 고객 수</CardTitle>
                <CardDescription>전체 등록된 고객</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{customers.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">신규 고객</CardTitle>
                <CardDescription>이번 달 등록</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">2</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">방문 예정</CardTitle>
                <CardDescription>다음 7일 내</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">3</p>
              </CardContent>
            </Card>
          </div>
        </NotionSection>

        <NotionSection title="고객 목록">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>방문 횟수</TableHead>
                <TableHead>최근 방문일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.visits}</TableCell>
                  <TableCell>{customer.lastVisit}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">상세보기</Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </NotionSection>
      </NotionPage>
    </NotionContainer>
  );
};

export default CustomersPage; 