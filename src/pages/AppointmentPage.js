import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import dayjs from "dayjs";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";

const AppointmentPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: "김영희",
      time: "09:00",
      duration: 60,
      type: "정기검진",
      status: "예약확정",
      notes: "첫 방문 환자",
    },
    {
      id: 2,
      patientName: "이철수",
      time: "10:30",
      duration: 30,
      type: "상담",
      status: "대기중",
      notes: "치료 상담 예정",
    },
  ]);

  const handleNewAppointment = (data) => {
    // 새 예약 추가 로직
    setIsNewAppointmentOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "예약확정":
        return "bg-green-100 text-green-800";
      case "대기중":
        return "bg-yellow-100 text-yellow-800";
      case "취소":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">예약 관리</h1>
          <p className="text-muted-foreground mt-1">
            환자 예약을 관리하고 새로운 예약을 생성하세요
          </p>
        </div>
        <Dialog
          open={isNewAppointmentOpen}
          onOpenChange={setIsNewAppointmentOpen}
        >
          <DialogTrigger asChild>
            <Button size="lg">새 예약 추가</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>새 예약 생성</DialogTitle>
              <DialogDescription>
                새로운 예약의 상세 정보를 입력하세요
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">환자명</Label>
                <Input id="name" placeholder="환자 이름을 입력하세요" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">예약 시간</Label>
                <Input id="time" type="time" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">진료 유형</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="진료 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="정기검진">정기검진</SelectItem>
                    <SelectItem value="상담">상담</SelectItem>
                    <SelectItem value="치료">치료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">소요 시간</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="소요 시간 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30분</SelectItem>
                    <SelectItem value="60">1시간</SelectItem>
                    <SelectItem value="90">1시간 30분</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">메모</Label>
                <Input id="notes" placeholder="특이사항을 입력하세요" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsNewAppointmentOpen(false)}
              >
                취소
              </Button>
              <Button onClick={handleNewAppointment}>예약 생성</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>날짜 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full"
            />
          </CardContent>
        </Card>

        <div className="md:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {dayjs(selectedDate).format("YYYY년 M월 D일")} 예약 현황
              </CardTitle>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 보기</SelectItem>
                  <SelectItem value="confirmed">예약확정</SelectItem>
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="canceled">취소됨</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex flex-col space-y-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold">
                                {appointment.patientName}
                              </span>
                              <Badge variant="outline">
                                {appointment.type}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.time} ({appointment.duration}분)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getStatusColor(appointment.status)}
                            variant="secondary"
                          >
                            {appointment.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            상세
                          </Button>
                        </div>
                      </div>
                      {appointment.notes && (
                        <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                          {appointment.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;
