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
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "../components/ui/alert-dialog";
import { Switch } from "../components/ui/switch";
import { Search, Plus, Eye, Edit, Trash2, Calendar, AlertCircle, Loader2 } from "lucide-react";
import {
  getNoticeList,
  createNotice,
  updateNotice,
  deleteNotice,
  incrementNoticeViewCount,
} from "../api/crm";
import { NOTICE_TARGET } from "../types/notice";
import dayjs from "dayjs";

const NoticesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [notices, setNotices] = useState([]);
  const [filter, setFilter] = useState("all"); // all, important
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // 모달 관련 상태
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  
  // 성공 메시지 모달 관련 상태
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    authorId: 1, // 현재 로그인된 사용자 ID 사용
    isImportant: false,
    target: NOTICE_TARGET.ALL,
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: dayjs().add(30, 'day').format("YYYY-MM-DD"),
    isActive: true,
  });

  // API 호출을 위한 필터
  const [apiFilters, setApiFilters] = useState({
    search: "",
    isImportant: filter === "important" ? true : undefined,
    target: undefined,
    startDate: undefined,
    endDate: undefined,
    isActive: true,
  });

  // 공지사항 데이터 가져오기
  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 모든 필터 제거 - 가장 기본적인 요청만 시도
      console.log("원본 필터:", apiFilters);
      console.log("페이지:", page, "한 페이지당 항목 수:", limit);
      
      // 페이지 번호가 1부터 시작하는지 확인
      const pageNumber = Math.max(1, page); // 페이지 번호가 최소 1이 되도록 함
      
      // 필터 없이 기본 요청만 시도
      let response;
      try {
        response = await getNoticeList(pageNumber, limit, {});
      } catch (apiError) {
        console.error("API 요청 실패:", apiError);
        console.error("요청 설정:", apiError.config);
        if (apiError.response) {
          console.error("응답 데이터:", apiError.response.data);
          console.error("응답 헤더:", apiError.response.headers);
        }
        throw apiError; // 상위 catch 블록으로 전달
      }
      // 응답 구조 확인 및 데이터 추출
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          // 데이터가 배열로 직접 오는 경우
          setNotices(response.data);
          setTotal(response.data.length);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // 표준 페이지네이션 응답 구조: { data: [...], total: n }
          setNotices(response.data.data);
          setTotal(response.data.total || 0);
        } else if (response.data.items && Array.isArray(response.data.items)) {
          // 대체 응답 구조: { items: [...], totalCount: n }
          setNotices(response.data.items);
          setTotal(response.data.totalCount || 0);
        } else {
          // 예상하지 못한 응답 구조
          console.error("예상치 못한 API 응답 구조:", response.data);
          setNotices([]);
          setTotal(0);
          setError("API 응답 형식이 예상과 다릅니다.");
        }
      } else {
        setNotices([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("공지사항을 불러오는데 실패했습니다:", err);
      if (err.response) {
        // 서버 응답이 있는 경우 (4xx, 5xx 오류)
        console.error("서버 응답 오류:", err.response.status, err.response.data);
        // 오류 메시지 추출
        const errorMessage = err.response.data?.message
          ? Array.isArray(err.response.data.message)
            ? err.response.data.message.join(', ')
            : err.response.data.message
          : `오류 코드: ${err.response.status}`;
        setError(`공지사항을 불러오는데 실패했습니다. ${errorMessage}`);
      } else if (err.request) {
        // 요청이 전송되었으나 응답이 없는 경우 (네트워크 오류)
        console.error("네트워크 오류:", err.request);
        setError("네트워크 오류로 공지사항을 불러오지 못했습니다.");
      } else {
        // 요청 설정 중 오류 발생
        setError(`오류 발생: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 검색어나 필터 변경 시 API 호출
  useEffect(() => {
    setApiFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      isImportant: filter === "important" ? true : undefined,
    }));
    
    // 페이지를 첫 페이지로 리셋
    setPage(1);
  }, [searchTerm, filter]);

  // API 필터, 페이지, 한계 변경 시 데이터 가져오기
  useEffect(() => {
    fetchNotices();
  }, [apiFilters, page, limit]);

  // 모달 열기 함수들
  const openCreateDialog = () => {
    // 공지사항 생성 폼 데이터 초기화 (기본값으로 설정)
    setFormData({
      title: "",
      content: "",
      authorId: 1, // 현재 로그인된 사용자 ID 사용
      isImportant: false,
      target: NOTICE_TARGET.ALL,
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: dayjs().add(30, 'day').format("YYYY-MM-DD"),
      isActive: true
    });
    setCreateDialogOpen(true);
  };

  const openViewDialog = async (notice) => {
    try {
      // 조회수 증가 API 호출
      await incrementNoticeViewCount(notice.id);
      
      // 선택된 공지사항 설정
      setSelectedNotice(notice);
      setViewDialogOpen(true);
      
      // 목록 새로고침 (조회수 업데이트)
      fetchNotices();
    } catch (error) {
      console.error("공지사항 조회 중 오류가 발생했습니다:", error);
    }
  };

  const openEditDialog = (notice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      authorId: notice.author?.id || 1,
      isImportant: notice.isImportant,
      target: notice.target,
      startDate: notice.startDate ? dayjs(notice.startDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
      endDate: notice.endDate ? dayjs(notice.endDate).format("YYYY-MM-DD") : dayjs().add(30, 'day').format("YYYY-MM-DD"),
      isActive: notice.isActive,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (notice) => {
    setSelectedNotice(notice);
    setDeleteDialogOpen(true);
  };

  // 폼 입력 핸들러
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 공지사항 생성
  const handleCreateNotice = async () => {
    try {
      setLoading(true);
      await createNotice(formData);
      setCreateDialogOpen(false);
      fetchNotices();
      setSuccessDialogOpen(true);
      setSuccessMessage("공지사항이 성공적으로 생성되었습니다.");
    } catch (error) {
      console.error("공지사항 생성 중 오류가 발생했습니다:", error);
      setError("공지사항 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 공지사항 수정
  const handleUpdateNotice = async () => {
    try {
      setLoading(true);
      await updateNotice(selectedNotice.id, formData);
      setEditDialogOpen(false);
      fetchNotices();
      setSuccessDialogOpen(true);
      setSuccessMessage("공지사항이 성공적으로 수정되었습니다.");
    } catch (error) {
      console.error("공지사항 수정 중 오류가 발생했습니다:", error);
      setError("공지사항 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 공지사항 삭제
  const handleDeleteNotice = async () => {
    try {
      setLoading(true);
      await deleteNotice(selectedNotice.id);
      setDeleteDialogOpen(false);
      fetchNotices();
      setSuccessDialogOpen(true);
      setSuccessMessage("공지사항이 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("공지사항 삭제 중 오류가 발생했습니다:", error);
      setError("공지사항 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 대상 레이블 가져오기
  const getTargetLabel = (target) => {
    switch (target) {
      case NOTICE_TARGET.ALL:
        return "전체";
      case NOTICE_TARGET.DOCTORS:
        return "의사";
      case NOTICE_TARGET.STAFF:
        return "스태프";
      default:
        return "전체";
    }
  };

  return (
    <NotionContainer>
      <NotionHeader 
        title="공지사항" 
        description="자라다 회원님들을 위한 공지사항 관리 페이지입니다."
      />
      
      <NotionPage>
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="공지사항 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setFilter("all")}
                className={filter === "all" ? "bg-accent" : ""}
              >
                전체
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setFilter("important")}
                className={filter === "important" ? "bg-accent" : ""}
              >
                중요 공지
              </Button>
            </div>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            공지사항 작성
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 p-3 rounded mt-4 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        <NotionSection title="중요 공지사항">
          {loading && notices.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">로딩 중...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {notices.filter(notice => notice.isImportant).slice(0, 3).map(notice => (
                <Card key={notice.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-1">{notice.title}</CardTitle>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        중요
                      </span>
                    </div>
                    <CardDescription className="flex items-center text-xs">
                      <Calendar className="h-3 w-3 mr-1" /> 
                      {notice.startDate ? dayjs(notice.startDate).format("YYYY-MM-DD") : '-'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-2 min-h-[2.5rem]">{notice.content}</p>
                  </CardContent>
                  <CardFooter className="pt-1 pb-3 border-t flex justify-between text-xs text-muted-foreground h-8">
                    <span>작성자: {notice.author?.name || '관리자'}</span>
                    <span>조회수: {notice.viewCount}</span>
                  </CardFooter>
                </Card>
              ))}
              {notices.filter(notice => notice.isImportant).length === 0 && (
                <div className="col-span-3 text-center py-10 text-muted-foreground">
                  중요 공지사항이 없습니다.
                </div>
              )}
            </div>
          )}
        </NotionSection>

        <NotionSection title={filter === "important" ? "중요 공지사항 목록" : "전체 공지사항 목록"}>
          {loading && notices.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">로딩 중...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {(filter === "important" 
                ? notices.filter(notice => notice.isImportant) 
                : notices
              ).map((notice) => (
                <Card key={notice.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6 cursor-pointer" onClick={() => openViewDialog(notice)}>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold line-clamp-1">{notice.title}</h3>
                        {notice.isImportant && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            중요
                          </span>
                        )}
                      </div>
                      <p className="text-sm line-clamp-2 mb-4 text-muted-foreground min-h-[2.5rem]">{notice.content}</p>
                      <div className="flex justify-between text-xs text-muted-foreground h-5">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" /> 
                            {notice.startDate ? dayjs(notice.startDate).format("YYYY-MM-DD") : '-'}
                          </span>
                          <span>대상: {getTargetLabel(notice.target)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>작성자: {notice.author?.name || '관리자'}</span>
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" /> {notice.viewCount}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex md:flex-col justify-end p-4 md:border-l">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 mb-1"
                        onClick={() => openViewDialog(notice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 mb-1"
                        onClick={() => openEditDialog(notice)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(notice)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {notices.length === 0 && !loading && (
                <div className="text-center py-10 text-muted-foreground">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          )}

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

      {/* 공지사항 생성 다이얼로그 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>새 공지사항 작성</DialogTitle>
            <DialogDescription>
              새로운 공지사항 정보를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                rows={6}
                value={formData.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
                placeholder="공지사항 내용을 입력하세요"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="target">대상</Label>
                <Select
                  value={formData.target}
                  onValueChange={(value) => handleFormChange('target', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="대상 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NOTICE_TARGET.ALL}>전체</SelectItem>
                    <SelectItem value={NOTICE_TARGET.DOCTORS}>의사</SelectItem>
                    <SelectItem value={NOTICE_TARGET.STAFF}>스태프</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>중요 공지사항</Label>
                <div className="flex items-center">
                  <Switch
                    checked={formData.isImportant}
                    onCheckedChange={(checked) => handleFormChange('isImportant', checked)}
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {formData.isImportant ? '예' : '아니오'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">시작일</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleFormChange('startDate', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endDate">종료일</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleFormChange('endDate', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>활성화</Label>
              <div className="flex items-center">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleFormChange('isActive', checked)}
                />
                <span className="ml-2 text-sm text-muted-foreground">
                  {formData.isActive ? '예' : '아니오'}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreateNotice} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 공지사항 보기 다이얼로그 */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedNotice && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {selectedNotice.isImportant && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      중요
                    </span>
                  )}
                  <DialogTitle>{selectedNotice.title}</DialogTitle>
                </div>
                <DialogDescription>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>작성자: {selectedNotice.author?.name || '관리자'}</span>
                    <span>조회수: {selectedNotice.viewCount}</span>
                  </div>
                  <div className="flex justify-between mt-1 text-sm">
                    <span>대상: {getTargetLabel(selectedNotice.target)}</span>
                    <span>
                      게시 기간: {dayjs(selectedNotice.startDate).format('YYYY-MM-DD')} ~ 
                      {dayjs(selectedNotice.endDate).format('YYYY-MM-DD')}
                    </span>
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 border-t border-b">
                <div className="whitespace-pre-line">{selectedNotice.content}</div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  닫기
                </Button>
                <Button onClick={() => {
                  setViewDialogOpen(false);
                  openEditDialog(selectedNotice);
                }}>
                  수정
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 공지사항 수정 다이얼로그 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>공지사항 수정</DialogTitle>
            <DialogDescription>
              공지사항 정보를 수정해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">제목</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-content">내용</Label>
              <Textarea
                id="edit-content"
                rows={6}
                value={formData.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
                placeholder="공지사항 내용을 입력하세요"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-target">대상</Label>
                <Select
                  value={formData.target}
                  onValueChange={(value) => handleFormChange('target', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="대상 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NOTICE_TARGET.ALL}>전체</SelectItem>
                    <SelectItem value={NOTICE_TARGET.DOCTORS}>의사</SelectItem>
                    <SelectItem value={NOTICE_TARGET.STAFF}>스태프</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>중요 공지사항</Label>
                <div className="flex items-center">
                  <Switch
                    checked={formData.isImportant}
                    onCheckedChange={(checked) => handleFormChange('isImportant', checked)}
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {formData.isImportant ? '예' : '아니오'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">시작일</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleFormChange('startDate', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-endDate">종료일</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleFormChange('endDate', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>활성화</Label>
              <div className="flex items-center">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleFormChange('isActive', checked)}
                />
                <span className="ml-2 text-sm text-muted-foreground">
                  {formData.isActive ? '예' : '아니오'}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdateNotice} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 공지사항 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공지사항 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 공지사항을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteNotice}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 성공 메시지 다이얼로그 */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>알림</DialogTitle>
            <DialogDescription>
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuccessDialogOpen(false)}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NotionContainer>
  );
};

export default NoticesPage; 