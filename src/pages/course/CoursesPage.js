import React, { useState, useEffect } from "react";
import { 
  NotionContainer, 
  NotionHeader, 
  NotionPage, 
  NotionSection, 
} from "../../components/NotionLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "../../components/ui/table";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
} from "../../components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Search, Plus, ArrowUpDown, Loader2 } from "lucide-react";
import {
  getCourseList,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../api/crm";

// 페이지 사이즈 상수 추가
const PAGE_SIZE = 10;

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
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
    description: "",
    price: "",
    isActive: true
  });
  
  // 폼 입력 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Switch 컴포넌트 상태 변경 처리
  const handleSwitchChange = (checked) => {
    setFormData({
      ...formData,
      isActive: checked
    });
  };

  // API에서 코스 목록 가져오기
  const fetchCourses = async (currentPage = page) => {
    setLoading(true);
    try {
      const response = await getCourseList(currentPage, PAGE_SIZE);
      if (response) {
        const sortedCourses = [...response.data].sort((a, b) => b.id - a.id);
        setCourses(sortedCourses);
        setTotal(response.data.length);
      } else {
        setCourses([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setAlertState({
        open: true,
        title: "오류",
        message: "코스 목록을 불러오는데 실패했습니다.",
        actionLabel: "확인",
        isDestructive: false,
        onAction: () => setAlertState(prev => ({ ...prev, open: false })),
      });
      setCourses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // 코스 추가 모달 열기
  const handleAddCourse = () => {
    setEditingCourse(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      isActive: true
    });
    setModalOpen(true);
  };

  // 코스 수정 모달 열기
  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name || "",
      description: course.description || "",
      price: course.price ? String(course.price) : "",
      isActive: course.isActive !== undefined ? course.isActive : true
    });
    setModalOpen(true);
  };

  // 코스 저장 (추가 또는 수정)
  const handleSaveCourse = async () => {
    try {
      const courseData = {
        ...formData,
        price: Number(formData.price)
      };
      
      if (editingCourse) {
        await updateCourse(editingCourse.id, courseData);
        setAlertState({
          open: true,
          title: "성공",
          message: "코스가 수정되었습니다.",
          actionLabel: "확인",
          isDestructive: false,
          onAction: () => {
            setAlertState(prev => ({ ...prev, open: false }));
            setModalOpen(false);
            fetchCourses(page);
          },
        });
      } else {
        await createCourse(courseData);
        setAlertState({
          open: true,
          title: "성공",
          message: "코스가 추가되었습니다.",
          actionLabel: "확인",
          isDestructive: false,
          onAction: () => {
            setAlertState(prev => ({ ...prev, open: false }));
            setModalOpen(false);
            fetchCourses(page);
          },
        });
      }
    } catch (error) {
      console.error("Error saving course:", error);
      setAlertState({
        open: true,
        title: "오류",
        message: "코스 저장에 실패했습니다.",
        actionLabel: "확인",
        isDestructive: false,
        onAction: () => setAlertState(prev => ({ ...prev, open: false })),
      });
    }
  };

  // 삭제 확인 대화상자 열기
  const handleDeleteConfirm = (id) => {
    setCourseToDelete(id);
    setDeleteAlertOpen(true);
  };

  // 삭제 진행
  const confirmDelete = async () => {
    setDeleteAlertOpen(false);
    
    // 잠시 후 삭제 진행 (모달이 닫힌 후)
    setTimeout(() => {
      if (courseToDelete) {
        try {
          deleteCourse(courseToDelete).then(() => {
            setAlertState({
              open: true,
              title: "성공",
              message: "코스가 삭제되었습니다.",
              actionLabel: "확인",
              isDestructive: false,
              onAction: () => {
                setAlertState(prev => ({ ...prev, open: false }));
                fetchCourses(page);
                setCourseToDelete(null);
              },
            });
          });
        } catch (error) {
          console.error("Error deleting course:", error);
          setAlertState({
            open: true,
            title: "오류",
            message: "코스 삭제에 실패했습니다.",
            actionLabel: "확인",
            isDestructive: false,
            onAction: () => setAlertState(prev => ({ ...prev, open: false })),
          });
        }
      }
    }, 100);
  };

  const filteredCourses = courses
    .filter(course => 
      (course.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      !searchTerm
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

  // 난이도에 따른 코스 개수 계산
  const getCoursesByDifficulty = (difficulty) => {
    return courses.filter(c => c.difficulty === difficulty).length;
  };

  return (
    <NotionContainer>
      <NotionHeader 
        title="코스 관리" 
        description={`zarada 코스 관리 페이지입니다. (총 ${total}개)`}
      />
      
      <NotionPage>
        <div className="flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="코스명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button size="sm" onClick={handleAddCourse}>
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
                  {getCoursesByDifficulty("초급")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">중급 코스</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {getCoursesByDifficulty("중급")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">고급 코스</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {getCoursesByDifficulty("고급")}
                </p>
              </CardContent>
            </Card>
          </div>
        </NotionSection>

        <NotionSection title="코스 목록">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">데이터 로딩 중...</span>
            </div>
          ) : (
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
                      onClick={() => handleSort("description")}
                    >
                      설명
                      {sortField === "description" && (
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
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow 
                    key={course.id} 
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => handleEditCourse(course)}
                  >
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{course.description || '-'}</TableCell>
                    <TableCell>{course.price ? `${course.price.toLocaleString()}원` : '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        course.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {course.isActive ? "활성" : "비활성"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCourses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      {courses.length === 0 ? "등록된 코스가 없습니다." : "검색 결과가 없습니다."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </NotionSection>
      </NotionPage>

      {/* 코스 추가/수정 모달 */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "코스 수정" : "새 코스 추가"}</DialogTitle>
            <DialogDescription>
              {editingCourse ? "코스 정보를 수정하세요." : "새로운 코스 정보를 입력하세요."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                코스명
              </Label>
              <Input
                id="name"
                name="name"
                className="col-span-3"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="코스 이름을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                설명
              </Label>
              <Textarea
                id="description"
                name="description"
                className="col-span-3"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="코스 설명을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                가격
              </Label>
              <Input
                id="price"
                name="price"
                className="col-span-3"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="가격을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                상태
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch 
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isActive">
                  {formData.isActive ? "활성" : "비활성"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              {editingCourse && (
                <Button
                  variant="destructive" 
                  onClick={() => handleDeleteConfirm(editingCourse.id)}
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
              <Button onClick={handleSaveCourse}>
                {editingCourse ? "수정" : "추가"}
              </Button>
            </div>
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

      {/* 삭제 확인 Alert Dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>코스 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말 이 코스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </NotionContainer>
  );
};

export default CoursesPage;