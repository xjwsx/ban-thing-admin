import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
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
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search, UserPlus, Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import {
  getCustomerList,
  updateCustomer,
  createCustomer,
  deleteCustomer,
  getDoctorList,
  getCourseList,
} from "../api/crm";

// 페이지 사이즈 상수 추가
const PAGE_SIZE = 10;

// 유틸리티 함수들
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "";
  const cleaned = phoneNumber.replace(/-/g, "");
  if (cleaned.startsWith("080")) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  if (cleaned.startsWith("066")) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
};

const calculateAge = (birthDate) => {
  if (!birthDate) return "";
  const today = new Date();
  const birth = new Date(birthDate);
  return today.getFullYear() - birth.getFullYear();
};

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [alertState, setAlertState] = useState({
    open: false,
    title: "",
    message: "",
    actionLabel: "확인",
    isDestructive: false,
    onAction: () => {},
  });
  
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    name: "",
    koreanName: "",
    memberCode: "",
    status: "방문중",
    courseId: "",
    phoneNumber: "",
    birthDate: "",
    registrationDate: new Date().toISOString().split('T')[0],
    deadline: "",
    classroom: "",
    experienceDate: "",
    experienceContent: "",
    hopeDate: "",
    memo: "",
    group: "",
    doctors: []
  });

  useEffect(() => {
    fetchCustomers();
    fetchDoctors();
    fetchCourses();
  }, []);
  
  // 페이지가 변경될 때 목록 다시 불러오기
  useEffect(() => {
    fetchCustomers();
  }, [page]);

  // API 호출 함수들
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await getCustomerList(page, PAGE_SIZE);
      if (response) {
        setCustomers(response.data.data || []);
        setTotal(response.data.totalCount || 0);
      } else {
        setCustomers([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setAlertState({
        open: true,
        title: "오류",
        message: "고객 목록을 불러오는데 실패했습니다.",
        actionLabel: "확인",
        isDestructive: false,
        onAction: () => setAlertState(prev => ({ ...prev, open: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await getDoctorList(1, 100);
      if (response) {
        setDoctors(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await getCourseList(1, 100);
      if (response) {
        setCourses(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // 고객 추가 모달 열기
  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      koreanName: "",
      memberCode: "",
      status: "방문중",
      courseId: "",
      phoneNumber: "",
      birthDate: "",
      registrationDate: new Date().toISOString().split('T')[0],
      deadline: "",
      classroom: "",
      experienceDate: "",
      experienceContent: "",
      hopeDate: "",
      memo: "",
      group: "",
      doctors: []
    });
    setModalOpen(true);
  };

  // 고객 수정 모달 열기
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || "",
      koreanName: customer.koreanName || "",
      memberCode: customer.memberCode || "",
      status: customer.status || "방문중",
      courseId: customer.courseId || "",
      phoneNumber: customer.phoneNumber || "",
      birthDate: customer.birthDate || "",
      registrationDate: customer.registrationDate || "",
      deadline: customer.deadline || "",
      classroom: customer.classroom || "",
      experienceDate: customer.experienceDate || "",
      experienceContent: customer.experienceContent || "",
      hopeDate: customer.hopeDate || "",
      memo: customer.memo || "",
      group: customer.group || "",
      doctors: customer.doctors?.map(d => d.id) || []
    });
    setModalOpen(true);
  };

  // 고객 저장 (추가 또는 수정)
  const handleSaveCustomer = async () => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
        setAlertState({
          open: true,
          title: "성공",
          message: "고객 정보가 수정되었습니다.",
          actionLabel: "확인",
          isDestructive: false,
          onAction: () => {
            setAlertState(prev => ({ ...prev, open: false }));
            setModalOpen(false);
            fetchCustomers();
          },
        });
      } else {
        await createCustomer(formData);
        setAlertState({
          open: true,
          title: "성공",
          message: "고객이 등록되었습니다.",
          actionLabel: "확인",
          isDestructive: false,
          onAction: () => {
            setAlertState(prev => ({ ...prev, open: false }));
            setModalOpen(false);
            fetchCustomers();
          },
        });
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      setAlertState({
        open: true,
        title: "오류",
        message: "고객 정보 저장에 실패했습니다.",
        actionLabel: "확인",
        isDestructive: false,
        onAction: () => setAlertState(prev => ({ ...prev, open: false })),
      });
    }
  };

  // 고객 삭제
  const handleDeleteCustomer = (id) => {
    setAlertState({
      open: true,
      title: "고객 삭제",
      message: "정말 이 고객을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      actionLabel: "삭제",
      isDestructive: true,
      onAction: async () => {
        try {
          await deleteCustomer(id);
          setAlertState({
            open: true,
            title: "성공",
            message: "고객이 삭제되었습니다.",
            actionLabel: "확인",
            isDestructive: false,
            onAction: () => {
              setAlertState(prev => ({ ...prev, open: false }));
              setModalOpen(false);
              fetchCustomers();
            },
          });
        } catch (error) {
          console.error("Error deleting customer:", error);
          setAlertState({
            open: true,
            title: "오류",
            message: "고객 삭제에 실패했습니다.",
            actionLabel: "확인",
            isDestructive: false,
            onAction: () => setAlertState(prev => ({ ...prev, open: false })),
          });
        }
      },
    });
  };

  // 폼 입력 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 셀렉트 컴포넌트 변경 처리
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 필터링된 고객 목록
  const filteredCustomers = customers.filter(customer => 
    (customer.name?.toLowerCase()?.includes(searchTerm.toLowerCase())) ||
    (customer.koreanName?.toLowerCase()?.includes(searchTerm.toLowerCase())) ||
    (customer.phoneNumber?.includes(searchTerm)) ||
    (customer.memberCode?.toString()?.includes(searchTerm)) ||
    !searchTerm
  );

  // 신규 고객 카운트 계산 (이번 달 등록)
  const getNewCustomersCount = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return customers.filter(c => {
      const regDate = new Date(c.registrationDate);
      return regDate >= monthStart;
    }).length;
  };

  // 날짜 형식화 함수
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
    } catch (e) {
      return '-';
    }
  };

  return (
    <NotionContainer>
      <NotionHeader 
        title="고객 관리" 
        description="zarada 고객 정보를 관리하고 모니터링하는 페이지입니다."
      />
      
      <NotionPage>
        <div className="flex justify-between items-center">
          <div className="relative w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="이름, 회원코드, 연락처로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddCustomer}>
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
                <p className="text-3xl font-bold">{total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">신규 고객</CardTitle>
                <CardDescription>이번 달 등록</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{getNewCustomersCount()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">활성 고객</CardTitle>
                <CardDescription>현재 방문중</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {customers.filter(c => c.status === "방문중").length}
                </p>
              </CardContent>
            </Card>
          </div>
        </NotionSection>

        <NotionSection title="고객 목록">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">데이터 로딩 중...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>회원코드</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>교실</TableHead>
                  <TableHead>그룹</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead>수강기한</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow 
                    key={customer.id} 
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => handleEditCustomer(customer)}
                  >
                    <TableCell>{customer.memberCode || '-'}</TableCell>
                    <TableCell className="font-medium">
                      {customer.name}
                      {customer.koreanName && <span className="ml-1 text-muted-foreground">({customer.koreanName})</span>}
                    </TableCell>
                    <TableCell>{formatPhoneNumber(customer.phoneNumber) || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        customer.status === "방문중" 
                          ? "bg-green-100 text-green-800" 
                          : customer.status === "탈퇴"
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                      }`}>
                        {customer.status || '미정'}
                      </span>
                    </TableCell>
                    <TableCell>{customer.classroom || '-'}</TableCell>
                    <TableCell>{customer.group || '-'}</TableCell>
                    <TableCell>
                      {formatDate(customer.registrationDate)}
                    </TableCell>
                    <TableCell>
                      {formatDate(customer.deadline)}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      {customers.length === 0 ? "등록된 고객이 없습니다." : "검색 결과가 없습니다."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </NotionSection>

        {/* 페이지네이션 */}
        {!loading && customers.length > 0 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                이전
              </Button>
              
              <div className="flex items-center gap-1 mx-2">
                <span className="text-sm font-medium">{page}</span>
                <span className="text-sm text-muted-foreground">/ {Math.ceil(total / PAGE_SIZE)}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(Math.ceil(total / PAGE_SIZE), page + 1))}
                disabled={page >= Math.ceil(total / PAGE_SIZE)}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </NotionPage>

      {/* 고객 추가/수정 모달 */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "고객 정보 수정" : "새 고객 등록"}</DialogTitle>
            <DialogDescription>
              {editingCustomer ? "고객 정보를 수정하세요." : "새로운 고객 정보를 입력하세요."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">이름(일문)</Label>
              <Input
                id="name"
                name="name"
                className="col-span-3"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="タナカ タロウ"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="koreanName" className="text-right">이름(한글)</Label>
              <Input
                id="koreanName"
                name="koreanName"
                className="col-span-3"
                value={formData.koreanName}
                onChange={handleInputChange}
                placeholder="홍길동"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="memberCode" className="text-right">회원코드</Label>
              <Input
                id="memberCode"
                name="memberCode"
                className="col-span-3"
                value={formData.memberCode}
                onChange={handleInputChange}
                placeholder="회원 코드"
                disabled={editingCustomer !== null}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">상태</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="방문중">방문중</SelectItem>
                  <SelectItem value="탈퇴">탈퇴</SelectItem>
                  <SelectItem value="그룹대기">그룹대기</SelectItem>
                  <SelectItem value="휴면">휴면</SelectItem>
                  <SelectItem value="회수권">회수권</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="classroom" className="text-right">교실</Label>
              <Input
                id="classroom"
                name="classroom"
                className="col-span-3"
                value={formData.classroom}
                onChange={handleInputChange}
                placeholder="교실 정보 (예: A1)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">연락처</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                className="col-span-3"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="010-1234-5678"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="courseId" className="text-right">수강 코스</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => handleSelectChange("courseId", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="코스 선택" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} (₩{course.price?.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="birthDate" className="text-right">생년월일</Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !formData.birthDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.birthDate ? format(new Date(formData.birthDate), 'PPP', { locale: ko }) : "생년월일 선택"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.birthDate ? new Date(formData.birthDate) : undefined}
                      onSelect={(date) => setFormData({...formData, birthDate: date ? date.toISOString().split('T')[0] : ""})}
                      initialFocus
                      locale={ko}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="registrationDate" className="text-right">등록일</Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !formData.registrationDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.registrationDate ? format(new Date(formData.registrationDate), 'PPP', { locale: ko }) : "등록일 선택"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.registrationDate ? new Date(formData.registrationDate) : undefined}
                      onSelect={(date) => setFormData({...formData, registrationDate: date ? date.toISOString().split('T')[0] : ""})}
                      initialFocus
                      locale={ko}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">수강기한</Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !formData.deadline && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.deadline ? format(new Date(formData.deadline), 'PPP', { locale: ko }) : "수강기한 선택"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.deadline ? new Date(formData.deadline) : undefined}
                      onSelect={(date) => setFormData({...formData, deadline: date ? date.toISOString().split('T')[0] : ""})}
                      initialFocus
                      locale={ko}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="experienceDate" className="text-right">체험일</Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !formData.experienceDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.experienceDate ? format(new Date(formData.experienceDate), 'PPP', { locale: ko }) : "체험일 선택"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.experienceDate ? new Date(formData.experienceDate) : undefined}
                      onSelect={(date) => setFormData({...formData, experienceDate: date ? date.toISOString().split('T')[0] : ""})}
                      initialFocus
                      locale={ko}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hopeDate" className="text-right">희망일</Label>
              <Input
                id="hopeDate"
                name="hopeDate"
                className="col-span-3"
                value={formData.hopeDate}
                onChange={handleInputChange}
                placeholder="희망일 (예: 2023-02-01)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="experienceContent" className="text-right">체험내용</Label>
              <Textarea
                id="experienceContent"
                name="experienceContent"
                className="col-span-3"
                value={formData.experienceContent}
                onChange={handleInputChange}
                placeholder="체험 수업에서의 특이사항이나 피드백"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group" className="text-right">그룹</Label>
              <Input
                id="group"
                name="group"
                className="col-span-3"
                value={formData.group}
                onChange={handleInputChange}
                placeholder="그룹 정보 (예: Group A)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="memo" className="text-right">메모</Label>
              <Textarea
                id="memo"
                name="memo"
                className="col-span-3"
                value={formData.memo}
                onChange={handleInputChange}
                placeholder="고객에 대한 메모"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              {editingCustomer && (
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteCustomer(editingCustomer.id)}
                >
                  삭제
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                취소
              </Button>
              <Button onClick={handleSaveCustomer}>
                {editingCustomer ? "수정" : "등록"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 알림용 Alert Dialog */}
      <AlertDialog open={alertState.open} onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertState.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertState.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={alertState.onAction}
              className={alertState.isDestructive ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {alertState.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </NotionContainer>
  );
};

export default CustomersPage; 