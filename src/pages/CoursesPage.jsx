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
import { Search, Plus, ArrowUpDown } from "lucide-react";

// 샘플 데이터
const COURSES = [
  { id: 1, name: "기초 요가", instructor: "김지연", duration: 60, price: 15000, maxCapacity: 10, difficulty: "초급" },
  { id: 2, name: "필라테스 중급", instructor: "박서연", duration: 90, price: 20000, maxCapacity: 8, difficulty: "중급" },
  { id: 3, name: "아쉬탕가 요가", instructor: "이미나", duration: 120, price: 25000, maxCapacity: 12, difficulty: "고급" },
  { id: 4, name: "하타 요가", instructor: "최태양", duration: 60, price: 15000, maxCapacity: 15, difficulty: "초급" },
  { id: 5, name: "산전 요가", instructor: "정수빈", duration: 75, price: 18000, maxCapacity: 6, difficulty: "특수" },
];

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState(COURSES);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredCourses = courses
    .filter(course => 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string') {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === "asc" 
          ? aValue - bValue 
          : bValue - aValue;
      }
    });

  return (
    <NotionContainer>
      <NotionHeader 
        title="코스 관리" 
        description="자라다 요가 및 필라테스 코스 관리 페이지입니다."
      />
      
      <NotionPage>
        <div className="flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="코스 또는 강사 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            코스 추가
          </Button>
        </div>

        <NotionSection title="코스 통계">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">총 코스 수</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{courses.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">초급 코스</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {courses.filter(c => c.difficulty === "초급").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">중급 코스</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {courses.filter(c => c.difficulty === "중급").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">고급 코스</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {courses.filter(c => c.difficulty === "고급").length}
                </p>
              </CardContent>
            </Card>
          </div>
        </NotionSection>

        <NotionSection title="코스 목록">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort("name")}
                  >
                    코스명
                    {sortField === "name" && (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort("instructor")}
                  >
                    강사
                    {sortField === "instructor" && (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort("duration")}
                  >
                    시간(분)
                    {sortField === "duration" && (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort("price")}
                  >
                    가격(원)
                    {sortField === "price" && (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>정원</TableHead>
                <TableHead>난이도</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>{course.duration}분</TableCell>
                  <TableCell>{course.price.toLocaleString()}원</TableCell>
                  <TableCell>{course.maxCapacity}명</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      course.difficulty === "초급" ? "bg-green-100 text-green-800" :
                      course.difficulty === "중급" ? "bg-blue-100 text-blue-800" :
                      course.difficulty === "고급" ? "bg-purple-100 text-purple-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {course.difficulty}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">수정</Button>
                      <Button variant="ghost" size="sm">삭제</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCourses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
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

export default CoursesPage; 