import React, { useState, useEffect } from "react";
import {
  getNoticeList,
  createNotice,
  updateNotice,
  deleteNotice,
  incrementNoticeViewCount,
} from "../../api/crm";
import { NOTICE_TARGET } from "../../types/notice";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import { Add, Delete, Edit, Visibility } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ko } from "date-fns/locale";
import dayjs from "dayjs";

const NoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    isImportant: null,
    target: "",
    startDate: null,
    endDate: null,
    isActive: true,
  });
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    authorId: 1, // 현재 로그인한 사용자의 ID를 기본값으로 설정
    isImportant: false,
    target: NOTICE_TARGET.ALL,
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: dayjs().add(30, 'day').format("YYYY-MM-DD"),
    isActive: true,
  });

  useEffect(() => {
    fetchNotices();
  }, [page, rowsPerPage, filters]);

  const fetchNotices = async () => {
    try {
      const response = await getNoticeList(page + 1, rowsPerPage, filters);
      setNotices(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error("공지사항 목록을 불러오는 중 오류가 발생했습니다:", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (mode, notice = null) => {
    setDialogMode(mode);
    if (notice) {
      setSelectedNotice(notice);
      setFormData({
        title: notice.title,
        content: notice.content,
        authorId: notice.author?.id || 1,
        isImportant: notice.isImportant,
        target: notice.target,
        startDate: notice.startDate.split("T")[0],
        endDate: notice.endDate.split("T")[0],
        isActive: notice.isActive,
      });
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      authorId: 1,
      isImportant: false,
      target: NOTICE_TARGET.ALL,
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: dayjs().add(30, 'day').format("YYYY-MM-DD"),
      isActive: true,
    });
    setSelectedNotice(null);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: dayjs(date).format("YYYY-MM-DD"),
    });
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === "create") {
        await createNotice(formData);
      } else {
        await updateNotice(selectedNotice.id, formData);
      }
      handleCloseDialog();
      fetchNotices();
    } catch (error) {
      console.error("공지사항 저장 중 오류가 발생했습니다:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      try {
        await deleteNotice(id);
        fetchNotices();
      } catch (error) {
        console.error("공지사항 삭제 중 오류가 발생했습니다:", error);
      }
    }
  };

  const handleViewNotice = async (notice) => {
    try {
      await incrementNoticeViewCount(notice.id);
      setSelectedNotice(notice);
      setViewDialogOpen(true);
    } catch (error) {
      console.error("조회수 증가 중 오류가 발생했습니다:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    });
    setPage(0);
  };

  const handleFilterDateChange = (name, date) => {
    setFilters({
      ...filters,
      [name]: date ? dayjs(date).format("YYYY-MM-DD") : null,
    });
    setPage(0);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      isImportant: null,
      target: "",
      startDate: null,
      endDate: null,
      isActive: true,
    });
  };

  const getTargetLabel = (target) => {
    switch (target) {
      case NOTICE_TARGET.ALL:
        return "전체";
      case NOTICE_TARGET.DOCTORS:
        return "의사";
      case NOTICE_TARGET.STAFF:
        return "스태프";
      default:
        return "";
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          공지사항 관리
        </Typography>

        {/* 필터 영역 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            필터
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="검색어"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>대상</InputLabel>
                <Select
                  label="대상"
                  name="target"
                  value={filters.target}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value={NOTICE_TARGET.ALL}>모든 사용자</MenuItem>
                  <MenuItem value={NOTICE_TARGET.DOCTORS}>의사</MenuItem>
                  <MenuItem value={NOTICE_TARGET.STAFF}>스태프</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.isImportant || false}
                    onChange={handleFilterChange}
                    name="isImportant"
                  />
                }
                label="중요 공지만"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.isActive || false}
                    onChange={handleFilterChange}
                    name="isActive"
                  />
                }
                label="활성화 공지만"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button 
                variant="outlined" 
                onClick={resetFilters}
                fullWidth
              >
                필터 초기화
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DatePicker
                  label="시작일"
                  value={filters.startDate ? dayjs(filters.startDate).toDate() : null}
                  onChange={(date) => handleFilterDateChange("startDate", date)}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DatePicker
                  label="종료일"
                  value={filters.endDate ? dayjs(filters.endDate).toDate() : null}
                  onChange={(date) => handleFilterDateChange("endDate", date)}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Paper>

        {/* 공지사항 목록 */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog("create")}
          >
            새 공지사항
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="5%">ID</TableCell>
                <TableCell width="40%">제목</TableCell>
                <TableCell width="15%">대상</TableCell>
                <TableCell width="10%">중요</TableCell>
                <TableCell width="10%">조회수</TableCell>
                <TableCell width="10%">활성화</TableCell>
                <TableCell width="10%">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notices.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell>{notice.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {notice.isImportant && (
                        <Chip 
                          label="중요" 
                          color="error" 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                        onClick={() => handleViewNotice(notice)}
                      >
                        {notice.title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getTargetLabel(notice.target)}</TableCell>
                  <TableCell>{notice.isImportant ? "예" : "아니오"}</TableCell>
                  <TableCell>{notice.viewCount}</TableCell>
                  <TableCell>{notice.isActive ? "예" : "아니오"}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleViewNotice(notice)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleOpenDialog("edit", notice)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDelete(notice.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {notices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    공지사항이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="페이지당 행 수:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} / ${count}`
            }
          />
        </TableContainer>
      </Box>

      {/* 공지사항 생성/수정 다이얼로그 */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "create" ? "공지사항 생성" : "공지사항 수정"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="제목"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="내용"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                multiline
                rows={8}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>대상</InputLabel>
                <Select
                  label="대상"
                  name="target"
                  value={formData.target}
                  onChange={handleInputChange}
                >
                  <MenuItem value={NOTICE_TARGET.ALL}>모든 사용자</MenuItem>
                  <MenuItem value={NOTICE_TARGET.DOCTORS}>의사</MenuItem>
                  <MenuItem value={NOTICE_TARGET.STAFF}>스태프</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isImportant}
                    onChange={handleInputChange}
                    name="isImportant"
                  />
                }
                label="중요 공지사항"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DatePicker
                  label="시작일"
                  value={formData.startDate ? dayjs(formData.startDate).toDate() : null}
                  onChange={(date) => handleDateChange("startDate", date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DatePicker
                  label="종료일"
                  value={formData.endDate ? dayjs(formData.endDate).toDate() : null}
                  onChange={(date) => handleDateChange("endDate", date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    name="isActive"
                  />
                }
                label="활성화"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 공지사항 상세 보기 다이얼로그 */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedNotice && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {selectedNotice.isImportant && (
                  <Chip 
                    label="중요" 
                    color="error" 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                )}
                {selectedNotice.title}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    작성자: {selectedNotice.author?.name || '관리자'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary" align="right">
                    조회수: {selectedNotice.viewCount + 1}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    대상: {getTargetLabel(selectedNotice.target)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary" align="right">
                    게시 기간: {dayjs(selectedNotice.startDate).format('YYYY-MM-DD')} ~ 
                    {dayjs(selectedNotice.endDate).format('YYYY-MM-DD')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 3, whiteSpace: 'pre-line' }}>
                    {selectedNotice.content}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>닫기</Button>
              <Button
                color="primary"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpenDialog("edit", selectedNotice);
                }}
              >
                수정
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default NoticesPage; 