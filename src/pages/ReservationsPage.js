import React, { useState, useEffect } from "react";
import { 
  NotionContainer, 
  NotionHeader, 
  NotionPage, 
  NotionSection, 
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
  CardContent, 
} from "../components/ui/card";
import { Search, Calendar as CalendarIcon, Plus, Loader2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { RESERVATION_STATUS, VISIT_TYPE } from "../types/reservation";
import {
  getReservationList,
  updateReservation,
  createReservation,
  getCustomerList,
  getDoctorList,
} from "../api/crm";
import dayjs from "dayjs";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMediaQuery } from "react-responsive";
import "dayjs/locale/ko";
import "../styles/calendar-custom.css"; 

dayjs.locale('ko');

const localizer = dayjsLocalizer(dayjs);

const messages = {
  allDay: '종일',
  previous: '이전',
  next: '다음',
  today: '오늘',
  month: '월간',
  week: '주간',
  day: '일간',
  agenda: '일정',
  date: '날짜',
  time: '시간',
  event: '일정',
  noEventsInRange: '이 기간에 예약이 없습니다.'
};

const statusLabels = {
  [RESERVATION_STATUS.PENDING]: "대기중",
  [RESERVATION_STATUS.CONFIRMED]: "확정됨",
  [RESERVATION_STATUS.CANCELED]: "취소됨",
  [RESERVATION_STATUS.COMPLETED]: "완료됨",
};

const statusClasses = {
  [RESERVATION_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [RESERVATION_STATUS.CONFIRMED]: "bg-green-100 text-green-800",
  [RESERVATION_STATUS.CANCELED]: "bg-red-100 text-red-800",
  [RESERVATION_STATUS.COMPLETED]: "bg-blue-100 text-blue-800",
};

const visitRouteOptions = [
  "인스타그램",
  "페이스북",
  "네이버",
  "지인 소개",
  "기타"
];

const ReservationsPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [searchTerm, setSearchTerm] = useState("");
  const [reservations, setReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // 예약 추가 관련 상태
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [newReservation, setNewReservation] = useState({
    customerId: "",
    doctorId: "",
    reservationDate: dayjs().format("YYYY-MM-DD"),
    startTime: "09:00",
    endTime: "10:00",
    duration: 60,
    visitRoute: "",
    visitType: VISIT_TYPE.NEW,
    sessionTreatment: "",
    hasPriorExperience: false,
    status: RESERVATION_STATUS.PENDING,
    notes: ""
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  // 추가: 예약 생성 성공 알림 다이얼로그 상태
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  // 추가: 예약 수정 성공 알림 다이얼로그 상태
  const [updateSuccessDialogOpen, setUpdateSuccessDialogOpen] = useState(false);
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState("");

  // Add state variables for edit dialog
  const [editReservationDialogOpen, setEditReservationDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  // 예약 목록 가져오기
  useEffect(() => {
    fetchReservations();
  }, [searchTerm, statusFilter, page, limit]);

  // fetchReservations 함수를 useEffect 밖으로 이동하여 재사용 가능하게 변경
  const fetchReservations = async () => {
    try {
      setLoading(true);
      // API 필터 구성
      const filters = {
        status: statusFilter !== "all" ? statusFilter : null,
      };
      
      // 검색어가 있으면 고객 이름 필터 추가
      if (searchTerm) {
        filters.customerName = searchTerm;
      }
      
      const response = await getReservationList(page, limit, filters);
      const reservationData = response.data.data || [];
      setReservations(reservationData);
      setTotal(response.data.total || 0);
      setError(null);

      // 캘린더용 이벤트 데이터 변환
      const events = reservationData.map(reservation => {
        const reservationDate = dayjs(reservation.reservationDate);
        const startTime = reservation.startTime || '09:00';
        const endTime = reservation.endTime || '10:00';
        
        // 시작 시간과 종료 시간을 Date 객체로 변환
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        const startDate = reservationDate.hour(startHour).minute(startMinute).toDate();
        const endDate = reservationDate.hour(endHour).minute(endMinute).toDate();
        
        return {
          id: reservation.id,
          title: reservation.customer?.name || '이름 없음',
          start: startDate,
          end: endDate,
          status: reservation.status,
          resource: reservation
        };
      });
      
      setCalendarEvents(events);
    } catch (err) {
      console.error("예약 목록을 불러오는데 실패했습니다:", err);
      setError("예약 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 고객 및 의사 목록 가져오기
  useEffect(() => {
    const fetchCustomersAndDoctors = async () => {
      try {
        // 고객 목록 가져오기
        const customersResponse = await getCustomerList(1, 100);
        setCustomers(customersResponse.data.data || []);
        
        // 의사 목록 가져오기
        const doctorsResponse = await getDoctorList(1, 100);
        setDoctors(doctorsResponse.data.data || []);
      } catch (err) {
        console.error("고객/의사 목록을 불러오는데 실패했습니다:", err);
      }
    };
    
    // 예약 추가 다이얼로그가 열렸을 때만 데이터 가져오기
    if (createDialogOpen) {
      fetchCustomersAndDoctors();
    }
  }, [createDialogOpen]);

  // 예약 확정 - fetchReservations 호출로 업데이트
  const confirmReservation = async (id) => {
    try {
      setLoading(true);
      await updateReservation(id, { status: RESERVATION_STATUS.CONFIRMED });
      
      // 예약 목록과 캘린더 이벤트 새로고침
      await fetchReservations();
    } catch (err) {
      console.error("예약 확정에 실패했습니다:", err);
      setError("예약 확정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 예약 취소 다이얼로그 열기
  const handleCancelReservation = (id) => {
    setReservationToCancel(id);
    setCancelDialogOpen(true);
  };

  // 예약 취소 확인 - fetchReservations 호출로 업데이트
  const confirmCancel = async () => {
    if (reservationToCancel) {
      try {
        setLoading(true);
        await updateReservation(reservationToCancel, { status: RESERVATION_STATUS.CANCELED });
        
        // 예약 목록과 캘린더 이벤트 새로고침
        await fetchReservations();
        
        setCancelDialogOpen(false);
        setReservationToCancel(null);
      } catch (err) {
        console.error("예약 취소에 실패했습니다:", err);
        setError("예약 취소에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
  };

  // 검색어 입력 핸들러
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // 검색 시 1페이지로 이동
  };

  // 필터 변경 핸들러
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1); // 상태 필터 변경 시 1페이지로 이동
  };

  // 특정 상태의 예약 개수 계산
  const getStatusCount = (status) => {
    return reservations.filter(r => r.status === status).length;
  };

  // 오늘 예약 개수 계산
  const getTodayReservationsCount = () => {
    const today = dayjs().format("YYYY-MM-DD");
    return reservations.filter(r => dayjs(r.reservationDate).format("YYYY-MM-DD") === today).length;
  };
  
  // 새 예약 입력값 변경 핸들러
  const handleNewReservationChange = (field, value) => {
    setNewReservation(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // 예약 생성 핸들러 - fetchReservations 호출로 업데이트
  const handleCreateReservation = async () => {
    try {
      setCreateLoading(true);
      setCreateError(null);
      
      // 필수 필드 검증
      if (!newReservation.customerId || !newReservation.doctorId || 
          !newReservation.reservationDate || !newReservation.startTime || 
          !newReservation.endTime || !newReservation.visitRoute || 
          !newReservation.sessionTreatment) {
        setCreateError("필수 항목을 모두 입력해주세요.");
        return;
      }
      
      // API 요청용 데이터 준비
      const payload = {
        ...newReservation,
        customerId: Number(newReservation.customerId),
        doctorId: Number(newReservation.doctorId),
        duration: Number(newReservation.duration),
        hasPriorExperience: newReservation.hasPriorExperience === "true"
      };
      
      // 예약 생성 API 호출
      await createReservation(payload);
      
      // 성공 시 다이얼로그 닫고 목록 새로고침
      setCreateDialogOpen(false);
      
      // 상태 초기화
      setNewReservation({
        customerId: "",
        doctorId: "",
        reservationDate: dayjs().format("YYYY-MM-DD"),
        startTime: "09:00",
        endTime: "10:00",
        duration: 60,
        visitRoute: "",
        visitType: VISIT_TYPE.NEW,
        sessionTreatment: "",
        hasPriorExperience: false,
        status: RESERVATION_STATUS.PENDING,
        notes: ""
      });
      
      // 예약 목록과 캘린더 이벤트 새로고침
      await fetchReservations();
      
      // 추가: 성공 알림 다이얼로그 표시
      setSuccessDialogOpen(true);
      
    } catch (err) {
      console.error("예약 생성에 실패했습니다:", err);
      setCreateError("예약 생성에 실패했습니다.");
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle clicking on a reservation
  const handleEditReservation = (reservation) => {
    setEditingReservation(reservation);
    setEditReservationDialogOpen(true);
  };

  // 예약 정보 변경사항 저장 - fetchReservations 호출로 업데이트
  const saveReservationChanges = async (id, data) => {
    try {
      setLoading(true);
      await updateReservation(id, data);
      
      // 예약 목록과 캘린더 이벤트 새로고침
      await fetchReservations();
      
      setError(null);
      
      // 성공 메시지 설정 및 다이얼로그 표시
      setUpdateSuccessMessage("예약 정보가 성공적으로 수정되었습니다.");
      setUpdateSuccessDialogOpen(true);
    } catch (err) {
      console.error("예약 정보 수정에 실패했습니다:", err);
      setError("예약 정보 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 캘린더 이벤트 스타일 지정
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    let textColor = '#fff';
    let borderColor = 'transparent';
    
    // 상태에 따른 스타일 지정
    switch(event.status) {
      case RESERVATION_STATUS.CONFIRMED:
        backgroundColor = 'rgba(16, 185, 129, 0.9)'; // 초록색(반투명)
        borderColor = 'rgb(5, 150, 105)'; // 약간 진한 경계선
        break;
      case RESERVATION_STATUS.PENDING:
        backgroundColor = 'rgba(245, 158, 11, 0.9)'; // 주황색(반투명)
        borderColor = 'rgb(217, 119, 6)'; // 약간 진한 경계선
        break;
      case RESERVATION_STATUS.CANCELED:
        backgroundColor = 'rgba(239, 68, 68, 0.9)'; // 빨간색(반투명)
        borderColor = 'rgb(185, 28, 28)'; // 약간 진한 경계선
        textColor = '#fff';
        break;
      case RESERVATION_STATUS.COMPLETED:
        backgroundColor = 'rgba(99, 102, 241, 0.9)'; // 보라색(반투명)
        borderColor = 'rgb(67, 56, 202)'; // 약간 진한 경계선
        break;
      default:
        backgroundColor = 'rgba(49, 116, 173, 0.9)'; // 기본 파란색(반투명)
        borderColor = 'rgb(37, 99, 235)'; // 약간 진한 경계선
    }
    
    return {
      style: {
        backgroundColor,
        color: textColor,
        borderRadius: '4px',
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${borderColor}`,
        display: 'block',
        padding: '2px 5px',
        fontSize: '12px',
        fontWeight: '500',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.15s ease',
        cursor: 'pointer'
      },
      className: `reservation-status-${event.status}`
    };
  };

  // 캘린더 이벤트 클릭 핸들러
  const handleEventClick = (event) => {
    handleEditReservation(event.resource);
  };

  return (
    <NotionContainer>
      <NotionHeader 
        title="예약 관리" 
        description="zarada 프로그램 예약 현황 및 관리 페이지입니다."
      />
      
      <NotionPage>
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4 items-center">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="고객 이름 검색..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8"
              />
            </div>
            
            <div className="w-40">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value={RESERVATION_STATUS.CONFIRMED}>확정됨</SelectItem>
                  <SelectItem value={RESERVATION_STATUS.PENDING}>대기중</SelectItem>
                  <SelectItem value={RESERVATION_STATUS.CANCELED}>취소됨</SelectItem>
                  <SelectItem value={RESERVATION_STATUS.COMPLETED}>완료됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            예약 추가
          </Button>
        </div>

        <NotionSection title="예약 현황">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">오늘 예약</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{getTodayReservationsCount()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">대기 중</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{getStatusCount(RESERVATION_STATUS.PENDING)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">확정 완료</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{getStatusCount(RESERVATION_STATUS.CONFIRMED)}</p>
              </CardContent>
            </Card>
          </div>
        </NotionSection>

        <NotionSection title="일정표">
          <Card>
            <CardContent>
              <div className="h-[600px]">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  className="notion-calendar"
                  defaultView={isMobile ? "day" : "week"}
                  views={['month', 'week', 'day', 'agenda']}
                  eventPropGetter={eventStyleGetter}
                  date={calendarDate}
                  onNavigate={(date) => setCalendarDate(date)}
                  onSelectEvent={handleEventClick}
                  formats={{
                    timeGutterFormat: (date, culture, localizer) => localizer.format(date, 'HH:mm', culture),
                    dayFormat: 'ddd DD',
                    monthHeaderFormat: 'YYYY년 MM월',
                    dayHeaderFormat: 'M월 D일 ddd',
                    dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
                      `${localizer.format(start, 'M월 D일', culture)} - ${localizer.format(end, 'M월 D일', culture)}`
                  }}
                  messages={messages}
                  culture="ko"
                  tooltipAccessor={(event) => 
                    `고객: ${event.title}\n시술: ${event.resource.sessionTreatment || '-'}\n담당의: ${event.resource.doctor?.name || '-'}`
                  }
                  popup
                  selectable
                  resizable
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4 p-3 bg-muted/30 rounded flex flex-wrap gap-2">
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></div>
              <span className="text-sm">확정됨</span>
            </div>
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b] mr-2"></div>
              <span className="text-sm">대기중</span>
            </div>
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 rounded-full bg-[#ef4444] mr-2"></div>
              <span className="text-sm">취소됨</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#6366f1] mr-2"></div>
              <span className="text-sm">완료됨</span>
            </div>
          </div>
        </NotionSection>

        <NotionSection title="예약 목록">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">로딩 중...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>고객명</TableHead>
                  <TableHead>시술</TableHead>
                  <TableHead>의사</TableHead>
                  <TableHead>예약 일자</TableHead>
                  <TableHead>시간</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.length > 0 ? (
                  reservations.map((reservation) => (
                    <TableRow 
                      key={reservation.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => handleEditReservation(reservation)}
                    >
                      <TableCell className="font-medium">{reservation.customer?.name || '-'}</TableCell>
                      <TableCell>{reservation.sessionTreatment || '-'}</TableCell>
                      <TableCell>{reservation.doctor?.name || '-'}</TableCell>
                      <TableCell>
                        {reservation.reservationDate ? dayjs(reservation.reservationDate).format("YYYY-MM-DD") : '-'}
                      </TableCell>
                      <TableCell>
                        {`${reservation.startTime || '--'} ~ ${reservation.endTime || '--'}`}
                      </TableCell>
                      <TableCell>
                        <span 
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            statusClasses[reservation.status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusLabels[reservation.status] || reservation.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          
          {/* 페이지네이션 - 필요하면 추가 */}
          {total > limit && (
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="mr-2"
              >
                이전
              </Button>
              <span className="flex items-center mx-2">
                {page} / {Math.ceil(total / limit)}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / limit)}
                className="ml-2"
              >
                다음
              </Button>
            </div>
          )}
        </NotionSection>
      </NotionPage>

      {/* 예약 취소 확인 다이얼로그 */}
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
      
      {/* 예약 추가 다이얼로그 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 예약 생성</DialogTitle>
            <DialogDescription>
              새로운 예약 정보를 입력해주세요. 별표(*)가 있는 항목은 필수입니다.
            </DialogDescription>
          </DialogHeader>
          
          {createError && (
            <div className="bg-red-50 text-red-800 p-3 rounded mb-4">
              {createError}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customerId">고객 *</Label>
              <Select
                value={newReservation.customerId}
                onValueChange={(value) => handleNewReservationChange('customerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="고객 선택" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name} ({customer.phoneNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="doctorId">의사 *</Label>
              <Select
                value={newReservation.doctorId}
                onValueChange={(value) => handleNewReservationChange('doctorId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="의사 선택" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="reservationDate">예약 날짜 *</Label>
              <Input
                type="date"
                value={newReservation.reservationDate}
                onChange={(e) => handleNewReservationChange('reservationDate', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="visitType">방문 구분 *</Label>
              <Select
                value={newReservation.visitType}
                onValueChange={(value) => handleNewReservationChange('visitType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="방문 구분 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={VISIT_TYPE.NEW}>{VISIT_TYPE.NEW}</SelectItem>
                  <SelectItem value={VISIT_TYPE.EXISTING}>{VISIT_TYPE.EXISTING}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="startTime">시작 시간 *</Label>
              <Input
                type="time"
                value={newReservation.startTime}
                onChange={(e) => handleNewReservationChange('startTime', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="endTime">종료 시간 *</Label>
              <Input
                type="time"
                value={newReservation.endTime}
                onChange={(e) => handleNewReservationChange('endTime', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="duration">소요 시간 (분) *</Label>
              <Input
                type="number"
                min={1}
                value={newReservation.duration}
                onChange={(e) => handleNewReservationChange('duration', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="visitRoute">방문 경로 *</Label>
              <Select
                value={newReservation.visitRoute}
                onValueChange={(value) => handleNewReservationChange('visitRoute', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="방문 경로 선택" />
                </SelectTrigger>
                <SelectContent>
                  {visitRouteOptions.map((route) => (
                    <SelectItem key={route} value={route}>
                      {route}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="sessionTreatment">시술 종류 *</Label>
              <Input
                placeholder="예) 기초 요가"
                value={newReservation.sessionTreatment}
                onChange={(e) => handleNewReservationChange('sessionTreatment', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="hasPriorExperience">이전 경험 여부 *</Label>
              <Select
                value={newReservation.hasPriorExperience ? "true" : "false"}
                onValueChange={(value) => handleNewReservationChange('hasPriorExperience', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="이전 경험 여부" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">있음</SelectItem>
                  <SelectItem value="false">없음</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2 col-span-2">
              <Label htmlFor="notes">특이사항</Label>
              <Textarea
                placeholder="특이사항을 입력하세요"
                value={newReservation.notes}
                onChange={(e) => handleNewReservationChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreateReservation} disabled={createLoading}>
              {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              예약 생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 추가: 예약 생성 성공 알림 다이얼로그 */}
      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약 생성 완료</AlertDialogTitle>
            <AlertDialogDescription>
              새 예약이 성공적으로 생성되었습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 예약 수정 다이얼로그 */}
      <Dialog open={editReservationDialogOpen} onOpenChange={setEditReservationDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>예약 정보 관리</DialogTitle>
            <DialogDescription>
              예약 정보를 수정하거나 삭제할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          {editingReservation && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customerName" className="text-right">고객명</Label>
                <div className="col-span-3 font-medium">
                  {editingReservation.customer?.name || '-'}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reservationDate" className="text-right">예약 일자</Label>
                <Input
                  id="reservationDate"
                  type="date"
                  className="col-span-3"
                  defaultValue={editingReservation.reservationDate ? dayjs(editingReservation.reservationDate).format("YYYY-MM-DD") : ''}
                  onChange={(e) => setEditingReservation({
                    ...editingReservation,
                    reservationDate: e.target.value
                  })}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">시간</Label>
                <div className="col-span-3 grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime" className="text-sm text-muted-foreground">시작 시간</Label>
                    <Input
                      id="startTime"
                      type="time"
                      className="mt-1"
                      defaultValue={editingReservation.startTime || ''}
                      onChange={(e) => setEditingReservation({
                        ...editingReservation,
                        startTime: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime" className="text-sm text-muted-foreground">종료 시간</Label>
                    <Input
                      id="endTime"
                      type="time"
                      className="mt-1"
                      defaultValue={editingReservation.endTime || ''}
                      onChange={(e) => setEditingReservation({
                        ...editingReservation,
                        endTime: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">상태</Label>
                <Select
                  defaultValue={editingReservation.status}
                  onValueChange={(value) => setEditingReservation({
                    ...editingReservation,
                    status: value
                  })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RESERVATION_STATUS.PENDING}>{statusLabels[RESERVATION_STATUS.PENDING]}</SelectItem>
                    <SelectItem value={RESERVATION_STATUS.CONFIRMED}>{statusLabels[RESERVATION_STATUS.CONFIRMED]}</SelectItem>
                    <SelectItem value={RESERVATION_STATUS.CANCELED}>{statusLabels[RESERVATION_STATUS.CANCELED]}</SelectItem>
                    <SelectItem value={RESERVATION_STATUS.COMPLETED}>{statusLabels[RESERVATION_STATUS.COMPLETED]}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doctor" className="text-right">의사</Label>
                <div className="col-span-3">
                  {editingReservation.doctor?.name || '-'}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sessionTreatment" className="text-right">시술</Label>
                <div className="col-span-3">
                  {editingReservation.sessionTreatment || '-'}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">특이사항</Label>
                <Textarea
                  id="notes"
                  className="col-span-3"
                  defaultValue={editingReservation.notes || ''}
                  onChange={(e) => setEditingReservation({
                    ...editingReservation,
                    notes: e.target.value
                  })}
                  placeholder="특이사항을 입력하세요"
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <div>
              <Button
                variant="destructive"
                onClick={() => {
                  handleCancelReservation(editingReservation.id);
                  setEditReservationDialogOpen(false);
                }}
              >
                예약 취소
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditReservationDialogOpen(false)}>
                닫기
              </Button>
              <Button onClick={() => {
                // 변경된 정보 저장
                saveReservationChanges(editingReservation.id, {
                  status: editingReservation.status,
                  notes: editingReservation.notes,
                  reservationDate: editingReservation.reservationDate,
                  startTime: editingReservation.startTime,
                  endTime: editingReservation.endTime
                });
                setEditReservationDialogOpen(false);
              }}>
                변경사항 저장
              </Button>
              {editingReservation && editingReservation.status !== RESERVATION_STATUS.CONFIRMED && (
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    confirmReservation(editingReservation.id);
                    setEditReservationDialogOpen(false);
                  }}
                >
                  예약 확정
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 추가: 예약 수정 성공 알림 다이얼로그 */}
      <AlertDialog open={updateSuccessDialogOpen} onOpenChange={setUpdateSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약 수정 완료</AlertDialogTitle>
            <AlertDialogDescription>
              {updateSuccessMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </NotionContainer>
  );
};

export default ReservationsPage; 