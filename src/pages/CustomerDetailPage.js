import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCustomerDetail, updateCustomer } from "../api/crm";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Save,
  Calendar,
  Clock,
  Phone,
  Mail,
  FileEdit,
  Trash2,
} from "lucide-react";

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("기본 정보");
  const [editMode, setEditMode] = useState(false);

  // 임시 데이터 - 실제 구현에서는 API에서 받아온 데이터를 사용
  const [appointmentHistory, setAppointmentHistory] = useState([
    {
      id: 1,
      date: "2023-09-15",
      time: "14:00",
      service: "건강검진",
      doctor: "김철수",
      status: "완료",
    },
    {
      id: 2,
      date: "2023-10-22",
      time: "10:30",
      service: "정기검진",
      doctor: "박지영",
      status: "완료",
    },
    {
      id: 3,
      date: "2023-12-05",
      time: "16:15",
      service: "치료",
      doctor: "김철수",
      status: "취소",
    },
    {
      id: 4,
      date: "2024-01-18",
      time: "09:00",
      service: "상담",
      doctor: "이민호",
      status: "완료",
    },
  ]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const data = await getCustomerDetail(id);
        setCustomer(data);
      } catch (err) {
        setError("고객 정보를 불러오는데 실패했습니다.");
        console.error("Failed to fetch customer:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  const handleUpdate = async () => {
    try {
      await updateCustomer(id, customer);
      setEditMode(false);
    } catch (err) {
      setError("고객 정보 업데이트에 실패했습니다.");
      console.error("Failed to update customer:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer({ ...customer, [name]: value });
  };

  const handleStatusChange = (value) => {
    setCustomer({ ...customer, status: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
        <p className="ml-2 text-gray-500">고객 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>
        <Button
          onClick={() => navigate("/customers")}
          variant="outline"
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          고객 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  // 임시 데이터 - 실제 구현에서는 API에서 받아온 데이터를 사용
  const customerData = customer || {
    id: "C001",
    name: "홍길동",
    nameHanja: "洪吉童",
    status: "활성",
    phone: "010-1234-5678",
    email: "hong@example.com",
    age: 35,
    gender: "남성",
    address: "서울시 강남구 역삼동 123-456",
    birthdate: "1988-05-15",
    registeredDate: "2022-03-10",
    note: "정기 검진 선호, 오전 시간대 선호",
    doctor: "김철수",
    group: "VIP",
    classroom: "A반",
    course: "정기검진",
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate("/customers")}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{customerData.name}</h1>
          <Badge
            className={
              customerData.status === "활성"
                ? "bg-green-50 text-green-700 hover:bg-green-50"
                : "bg-gray-100 text-gray-700 hover:bg-gray-100"
            }
          >
            {customerData.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button
                onClick={handleUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                저장
              </Button>
              <Button onClick={() => setEditMode(false)} variant="outline">
                취소
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setEditMode(true)}
                variant="outline"
                className="border-gray-200"
              >
                <FileEdit className="h-4 w-4 mr-2" />
                편집
              </Button>
              <Button
                variant="outline"
                className="text-red-500 border-gray-200 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 탭 */}
      <div className="border-b border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border-b border-transparent h-10">
            <TabsTrigger
              value="기본 정보"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-10 px-4 font-medium"
            >
              기본 정보
            </TabsTrigger>
            <TabsTrigger
              value="진료 내역"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-10 px-4 font-medium"
            >
              진료 내역
            </TabsTrigger>
            <TabsTrigger
              value="결제 내역"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-10 px-4 font-medium"
            >
              결제 내역
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 탭 내용 */}
      <div className="flex-1 overflow-y-auto p-6">
        <TabsContent value="기본 정보" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 개인 정보 섹션 */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">개인 정보</h2>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름 (한글)</Label>
                    <Input
                      id="name"
                      name="name"
                      value={customerData.name}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameHanja">이름 (한자)</Label>
                    <Input
                      id="nameHanja"
                      name="nameHanja"
                      value={customerData.nameHanja}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">성별</Label>
                    <Select
                      value={customerData.gender}
                      onValueChange={(value) =>
                        setCustomer({ ...customerData, gender: value })
                      }
                      disabled={!editMode}
                    >
                      <SelectTrigger
                        id="gender"
                        className="bg-white border-gray-200"
                      >
                        <SelectValue placeholder="성별 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="남성">남성</SelectItem>
                        <SelectItem value="여성">여성</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">생년월일</Label>
                    <Input
                      id="birthdate"
                      name="birthdate"
                      type="date"
                      value={customerData.birthdate}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">나이</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={customerData.age}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">상태</Label>
                    <Select
                      value={customerData.status}
                      onValueChange={handleStatusChange}
                      disabled={!editMode}
                    >
                      <SelectTrigger
                        id="status"
                        className="bg-white border-gray-200"
                      >
                        <SelectValue placeholder="상태 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="활성">활성</SelectItem>
                        <SelectItem value="휴면">휴면</SelectItem>
                        <SelectItem value="탈퇴">탈퇴</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* 연락처 정보 섹션 */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">연락처 정보</h2>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      name="phone"
                      value={customerData.phone}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="pl-10 bg-white border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={customerData.email}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="pl-10 bg-white border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">주소</Label>
                  <Input
                    id="address"
                    name="address"
                    value={customerData.address}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="bg-white border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* 추가 정보 섹션 */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">추가 정보</h2>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="classroom">교실</Label>
                    <Input
                      id="classroom"
                      name="classroom"
                      value={customerData.classroom}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group">그룹</Label>
                    <Input
                      id="group"
                      name="group"
                      value={customerData.group}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">코스</Label>
                    <Input
                      id="course"
                      name="course"
                      value={customerData.course}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor">담당 의사</Label>
                    <Input
                      id="doctor"
                      name="doctor"
                      value={customerData.doctor}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registeredDate">가입일</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="registeredDate"
                      name="registeredDate"
                      value={customerData.registeredDate}
                      disabled={true}
                      className="pl-10 bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 메모 섹션 */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">메모</h2>

              <div className="space-y-2">
                <Textarea
                  id="note"
                  name="note"
                  value={customerData.note}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="h-[180px] bg-white border-gray-200"
                  placeholder="고객에 대한 추가 메모를 입력하세요"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="진료 내역" className="mt-0">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">진료 내역</h2>
              <Button
                onClick={() => navigate(`/appointments/new?customerId=${id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                새 예약 등록
              </Button>
            </div>

            {appointmentHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500 border border-gray-200 rounded-md">
                <p>진료 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointmentHistory.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {appointment.service}
                        </h3>
                        <div className="mt-1 text-sm text-gray-500 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {appointment.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge
                          className={
                            appointment.status === "완료"
                              ? "bg-green-50 text-green-700 hover:bg-green-50"
                              : appointment.status === "취소"
                              ? "bg-red-50 text-red-700 hover:bg-red-50"
                              : "bg-blue-50 text-blue-700 hover:bg-blue-50"
                          }
                        >
                          {appointment.status}
                        </Badge>
                        <span className="mt-2 text-sm text-gray-500">
                          Dr. {appointment.doctor}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="결제 내역" className="mt-0">
          <div className="flex flex-col items-center justify-center p-8 text-gray-500 border border-gray-200 rounded-md">
            <p>결제 내역이 현재 준비 중입니다.</p>
          </div>
        </TabsContent>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
