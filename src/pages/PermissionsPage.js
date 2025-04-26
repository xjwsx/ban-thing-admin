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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Loader2, UserPlus, AlertCircle } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import { 
  getDoctorList, 
  getDoctorPermissions, 
  updateDoctorPermission,
  createDoctor
} from "../api/crm";

const PermissionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [menus, setMenus] = useState([
    { id: 1, name: '홈', code: 'MENU000', description: '메인 홈 화면' },
    { id: 2, name: '고객 관리', code: 'MENU001', description: '고객 정보 관리' },
    { id: 3, name: '코스 관리', code: 'MENU002', description: '치료 코스 관리' },
    { id: 4, name: '예약 관리', code: 'MENU003', description: '예약 일정 관리' },
    { id: 5, name: '할일 관리', code: 'MENU004', description: '할 일 및 업무 관리' },
    { id: 6, name: '공지사항', code: 'MENU005', description: '공지사항 관리' },
    { id: 7, name: '권한 관리', code: 'MENU006', description: '사용자 권한 관리' }
  ]);
  
  const [permissions, setPermissions] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [addDoctorDialogOpen, setAddDoctorDialogOpen] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    title: "",
    message: "",
    actionLabel: "확인",
    isDestructive: false,
    onAction: () => {},
  });
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    subject: "",
    role: "doctor",
    password: "",
  });
  const [error, setError] = useState(null);
  
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // 과목별 색상 매핑
  const subjectColors = {
    'Mathematics': 'bg-blue-100 text-blue-800',
    'Dermatology': 'bg-purple-100 text-purple-800',
    'Internal Medicine': 'bg-green-100 text-green-800',
    'Neurosurgery': 'bg-orange-100 text-orange-800',
    'Rehabilitation Medicine': 'bg-yellow-100 text-yellow-800',
    'Orthopedics': 'bg-indigo-100 text-indigo-800',
  };

  // 과목에 따른 색상 클래스를 가져오는 함수
  const getSubjectColorClass = (subject) => {
    return subjectColors[subject] || 'bg-gray-100 text-gray-800';
  };
  
  // 의사 목록 가져오기
  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getDoctorList();
      console.log("의사 목록 응답:", response);
      
      if (response && response.data) {
        // 응답 데이터 구조 확인 및 배열 처리
        const doctorsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.doctors && Array.isArray(response.data.doctors) 
            ? response.data.doctors 
            : response.data.data && Array.isArray(response.data.data) 
              ? response.data.data 
              : [];
        
        setDoctors(doctorsData);
        
        // 첫 번째 의사 선택
        if (doctorsData.length > 0 && !selectedDoctor) {
          setSelectedDoctor(doctorsData[0].id.toString());
        }
      }
    } catch (err) {
      console.error("의사 목록을 불러오는데 실패했습니다:", err);
      setError("의사 목록을 불러오는데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };
  
  // 권한 데이터 가져오기
  const fetchPermissions = async (doctorId) => {
    if (!doctorId) return;
    
    setLoadingPermissions(true);
    setError(null);
    
    try {
      const response = await getDoctorPermissions(doctorId);
      console.log("권한 정보 응답:", response);
      
      if (response && response.data) {
        // 응답 구조 확인 (doctors 배열 형태)
        const doctor = response.data.doctors && response.data.doctors.length > 0
          ? response.data.doctors[0]
          : null;
          
        if (doctor && Array.isArray(doctor.permissions)) {
          setPermissions(doctor.permissions);
        } else if (response.data.permissions) {
          // 다른 형태의 응답 구조 처리
          setPermissions(response.data.permissions);
        } else if (Array.isArray(response.data)) {
          setPermissions(response.data);
        } else {
          setPermissions([]);
        }
      }
    } catch (err) {
      console.error("권한 정보를 불러오는데 실패했습니다:", err);
      setError("권한 정보를 불러오는데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoadingPermissions(false);
    }
  };
  
  useEffect(() => {
    fetchDoctors();
  }, []);
  
  useEffect(() => {
    if (selectedDoctor) {
      fetchPermissions(selectedDoctor);
    }
  }, [selectedDoctor]);
  
  // 의사 정보 가져오기
  const getDoctorById = (doctorId) => {
    return doctors.find((doctor) => doctor?.id?.toString() === doctorId?.toString()) || {};
  };
  
  // 특정 메뉴에 대한 의사의 권한 가져오기
  const getDoctorPermissionForMenu = (menuCode) => {
    return permissions.find(p => p?.menuCode === menuCode) || null;
  };

  // 권한 토글 핸들러
  const handlePermissionToggle = async (permissionId, field) => {
    const permission = permissions.find(p => p.id === permissionId);
    if (!permission) return;
    
    // API 요청에 필요한 정보로 업데이트 객체 구성
    const updatedPermission = { 
      id: permission.id,
      menuCode: permission.menuCode,
      canRead: field === 'canRead' ? !permission.canRead : permission.canRead,
      canCreate: field === 'canCreate' ? !permission.canCreate : permission.canCreate,
      canUpdate: field === 'canUpdate' ? !permission.canUpdate : permission.canUpdate,
      canDelete: field === 'canDelete' ? !permission.canDelete : permission.canDelete
    };
    
    try {
      setLoadingPermissions(true);
      console.log(`권한 업데이트 요청:`, updatedPermission);
      
      // API 호출
      const response = await updateDoctorPermission(permissionId, updatedPermission);
      console.log("권한 업데이트 응답:", response);
      
      // UI 상태 업데이트
      setPermissions(prev =>
        prev.map(p => p.id === permissionId ? updatedPermission : p)
      );
      
      setAlertState({
        open: true,
        title: "성공",
        message: "권한이 업데이트되었습니다.",
        actionLabel: "확인",
        isDestructive: false,
        onAction: () => setAlertState(prev => ({ ...prev, open: false })),
      });
    } catch (err) {
      console.error("권한 업데이트에 실패했습니다:", err);
      setError("권한 업데이트에 실패했습니다. 다시 시도해주세요.");
      
      // 개발 중에는 UI만 업데이트 (오류가 발생해도 UX 유지)
      setPermissions(prev =>
        prev.map(p => p.id === permissionId ? updatedPermission : p)
      );
    } finally {
      setLoadingPermissions(false);
    }
  };
  
  // 새 의사 추가
  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.email) {
      setAlertState({
        open: true,
        title: "오류",
        message: "이름과 이메일을 입력해주세요.",
        actionLabel: "확인",
        isDestructive: false,
        onAction: () => setAlertState(prev => ({ ...prev, open: false })),
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // 새 의사 생성
      const response = await createDoctor(newDoctor);
      console.log("의사 추가 응답:", response);
      
      if (response && response.data) {
        let newDoctorData = response.data;
        
        // 응답 데이터 구조 확인
        if (response.data.data && !response.data.id) {
          newDoctorData = response.data.data;
        }
        
        // 의사 목록에 추가
        setDoctors(prev => [...prev, newDoctorData]);
        
        // 새로 추가된 의사 선택
        setSelectedDoctor(newDoctorData.id.toString());
        
        // 폼 초기화
        setNewDoctor({ 
          name: "", 
          email: "", 
          subject: "",
          role: "doctor",
          password: "defaultPassword123" 
        });
        
        // 다이얼로그 닫기
        setAddDoctorDialogOpen(false);
        
        // 성공 메시지
        setAlertState({
          open: true,
          title: "성공",
          message: "새 의사가 추가되었습니다.",
          actionLabel: "확인",
          isDestructive: false,
          onAction: () => setAlertState(prev => ({ ...prev, open: false })),
        });
      }
    } catch (err) {
      console.error("의사 추가에 실패했습니다:", err);
      setError("의사 추가에 실패했습니다. 다시 시도해주세요.");
      setLoading(false);
    }
  };
  
  // 역할별 의사 수 계산
  const getDoctorCountByRole = (role) => {
    return doctors.filter(d => d.role === role).length;
  };

  // 에러 메시지 컴포넌트
  const ErrorMessage = ({ message }) => (
    <div className="bg-destructive/10 p-4 rounded-md flex items-center space-x-2 mb-4">
      <AlertCircle className="h-5 w-5 text-destructive" />
      <p className="text-destructive text-sm">{message}</p>
    </div>
  );

  if (loading) {
    return (
      <NotionContainer>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">데이터 로딩 중...</span>
        </div>
      </NotionContainer>
    );
  }

  return (
    <NotionContainer>
      <NotionHeader 
        title="권한 관리" 
        description="의사별 메뉴 접근 권한을 관리할 수 있습니다"
      />
      
      <NotionPage>
        {error && <ErrorMessage message={error} />}
      
        <div className="flex justify-between items-center">
          <div className="w-80">
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="의사 선택" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(doctors) && doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                    <span className="flex items-center">
                      {doctor.name}
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        doctor.subject 
                          ? getSubjectColorClass(doctor.subject) 
                          : (doctor.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-primary/10 text-primary')
                      }`}>
                        {doctor.subject || (doctor.role === 'admin' ? '관리자' : '의사')}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {doctor.email}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={() => setAddDoctorDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            의사 추가
          </Button>
        </div>

        <NotionSection title="통계">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">총 의사 수</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{Array.isArray(doctors) ? doctors.length : 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">관리자 계정</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{getDoctorCountByRole('admin')}</p>
              </CardContent>
            </Card>
          </div>
        </NotionSection>

        <NotionSection title={
          selectedDoctor 
            ? <span className="flex items-center">
                {getDoctorById(parseInt(selectedDoctor))?.name || '의사'} 권한 관리
              </span>
            : '권한 관리'
        }>
          {loadingPermissions ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">권한 정보 로딩 중...</span>
            </div>
          ) : !selectedDoctor ? (
            <div className="text-center py-10 text-muted-foreground">
              의사를 선택해주세요.
            </div>
          ) : permissions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              권한 정보가 없습니다.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">메뉴명</TableHead>
                  <TableHead className="w-[100px] text-center">조회</TableHead>
                  <TableHead className="w-[100px] text-center">생성</TableHead>
                  <TableHead className="w-[100px] text-center">수정</TableHead>
                  <TableHead className="w-[100px] text-center">삭제</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menus.map((menu) => {
                  const permission = getDoctorPermissionForMenu(menu.code);
                  
                  // 해당 메뉴에 대한 권한이 없으면 표시하지 않음
                  if (!permission) return null;
                  
                  return (
                    <TableRow key={menu.id}>
                      <TableCell className="font-medium">{menu.name}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={permission.canRead}
                            onCheckedChange={() => handlePermissionToggle(permission.id, 'canRead')}
                            disabled={loadingPermissions}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={permission.canCreate}
                            onCheckedChange={() => handlePermissionToggle(permission.id, 'canCreate')}
                            disabled={loadingPermissions}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={permission.canUpdate}
                            onCheckedChange={() => handlePermissionToggle(permission.id, 'canUpdate')}
                            disabled={loadingPermissions}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={permission.canDelete}
                            onCheckedChange={() => handlePermissionToggle(permission.id, 'canDelete')}
                            disabled={loadingPermissions}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </NotionSection>
      </NotionPage>
      
      {/* 의사 추가 다이얼로그 */}
      <Dialog open={addDoctorDialogOpen} onOpenChange={setAddDoctorDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>새 의사 추가</DialogTitle>
            <DialogDescription>
              시스템에 새로운 의사를 추가합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctorName" className="text-right">
                이름
              </Label>
              <Input
                id="doctorName"
                className="col-span-3"
                value={newDoctor.name}
                onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                placeholder="홍길동"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctorEmail" className="text-right">
                이메일
              </Label>
              <Input
                id="doctorEmail"
                className="col-span-3"
                value={newDoctor.email}
                onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                placeholder="example@zarada.com"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctorSubject" className="text-right">
                과목
              </Label>
              <Input
                id="doctorSubject"
                className="col-span-3"
                value={newDoctor.subject}
                onChange={(e) => setNewDoctor({...newDoctor, subject: e.target.value})}
                placeholder="Mathematics"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctorRole" className="text-right">
                역할
              </Label>
              <Select 
                value={newDoctor.role} 
                onValueChange={(value) => setNewDoctor({...newDoctor, role: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="역할 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">의사</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctorPassword" className="text-right">
                비밀번호
              </Label>
              <Input
                id="doctorPassword"
                type="password"
                className="col-span-3"
                value={newDoctor.password}
                onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})}
                placeholder="비밀번호"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDoctorDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddDoctor} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 일반 알림용 Alert Dialog */}
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

export default PermissionsPage; 