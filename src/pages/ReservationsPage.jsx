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
import { Search, Calendar, Plus, Check, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

// 샘플 데이터
const RESERVATIONS = [
  { 
    id: 1, 
    customer: "홍길동", 
    course: "기초 요가", 
    instructor: "김지연", 
    date: "2023-08-10", 
    time: "09:00", 
    status: "확정" 
  },
  { 
    id: 2, 
    customer: "김철수", 
    course: "필라테스 중급", 
    instructor: "박서연", 
    date: "2023-08-10", 
    time: "11:00", 
    status: "확정" 
  },
  { 
    id: 3, 
    customer: "이영희", 
    course: "아쉬탕가 요가", 
    instructor: "이미나", 
    date: "2023-08-11", 
    time: "14:00", 
    status: "대기" 
  },
  { 
    id: 4, 
    customer: "박지민", 
    course: "하타 요가", 
    instructor: "최태양", 
    date: "2023-08-12", 
    time: "16:00", 
    status: "취소" 
  },
  { 
    id: 5, 
    customer: "최수진", 
    course: "산전 요가", 
    instructor: "정수빈", 
    date: "2023-08-13", 
    time: "10:00", 
    status: "확정" 
  },
];

const ReservationsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [reservations, setReservations] = useState(RESERVATIONS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);

  const filteredReservations = reservations
    .filter(reservation => 
      (reservation.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
       reservation.course.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || reservation.status === statusFilter)
    );

  const confirmReservation = (id) => {
    setReservations(
      reservations.map(res => 
        res.id === id ? { ...res, status: "확정" } : res
      )
    );
  };

  const handleCancelReservation = (id) => {
    setReservationToCancel(id);
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (reservationToCancel) {
      setReservations(
        reservations.map((reservation) =>
          reservation.id === reservationToCancel
            ? { ...reservation, status: "취소" }
            : reservation
        )
      );
      setCancelDialogOpen(false);
      setReservationToCancel(null);
    }
  };

  const getStatusCount = (status) => {
    return reservations.filter(r => r.status === status).length;
  };

  return (
    <NotionContainer>
      <NotionHeader 
        title="예약 관리" 
        description="자라다 프로그램 예약 현황 및 관리 페이지입니다."
      />
      
      <NotionPage>
        <div className="flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="고객 또는 코스 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStatusFilter("all")} 
              className={statusFilter === "all" ? "bg-accent" : ""}>
              전체
            </Button>
            <Button variant="ghost" onClick={() => setStatusFilter("확정")}
              className={statusFilter === "확정" ? "bg-accent" : ""}>
              확정
            </Button>
            <Button variant="ghost" onClick={() => setStatusFilter("대기")}
              className={statusFilter === "대기" ? "bg-accent" : ""}>
              대기
            </Button>
            <Button variant="ghost" onClick={() => setStatusFilter("취소")}
              className={statusFilter === "취소" ? "bg-accent" : ""}>
              취소
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              예약 추가
            </Button>
          </div>
        </div>

        <NotionSection title="예약 현황">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">오늘 예약</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">2</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">대기 중</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{getStatusCount("대기")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">확정 완료</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{getStatusCount("확정")}</p>
              </CardContent>
            </Card>
          </div>
        </NotionSection>

        <NotionSection title="일정표">
          <div className="flex items-center justify-center p-4 bg-muted/20 rounded-lg mb-6">
            <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">이 섹션에는 추후 캘린더 뷰가 추가될 예정입니다.</span>
          </div>
        </NotionSection>

        <NotionSection title="예약 목록">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>고객명</TableHead>
                <TableHead>코스</TableHead>
                <TableHead>강사</TableHead>
                <TableHead>날짜</TableHead>
                <TableHead>시간</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{reservation.customer}</TableCell>
                  <TableCell>{reservation.course}</TableCell>
                  <TableCell>{reservation.instructor}</TableCell>
                  <TableCell>{reservation.date}</TableCell>
                  <TableCell>{reservation.time}</TableCell>
                  <TableCell>
                    <span 
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        reservation.status === "확정" ? "bg-green-100 text-green-800" :
                        reservation.status === "대기" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {reservation.status !== "확정" && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => confirmReservation(reservation.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {reservation.status !== "취소" && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredReservations.length === 0 && (
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

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약 취소 확인</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 예약을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </NotionContainer>
  );
};

export default ReservationsPage; 