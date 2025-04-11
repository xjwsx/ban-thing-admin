import React, { useState, useEffect } from "react";
import { getDoctorNotices, incrementNoticeViewCount } from "../../api/crm";
import {
  Box,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Button,
  Chip,
  IconButton,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import dayjs from "dayjs";

const DoctorNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    isImportant: null,
  });

  useEffect(() => {
    fetchNotices();
  }, [page, rowsPerPage, filters]);

  const fetchNotices = async () => {
    try {
      const response = await getDoctorNotices(page + 1, rowsPerPage, filters);
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

  const resetFilters = () => {
    setFilters({
      search: "",
      isImportant: null,
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          공지사항
        </Typography>

        {/* 필터 영역 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="검색어"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                size="small"
                placeholder="제목 또는 내용으로 검색"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.isImportant || false}
                    onChange={handleFilterChange}
                    name="isImportant"
                  />
                }
                label="중요 공지만 보기"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button 
                variant="outlined" 
                onClick={resetFilters}
                fullWidth
              >
                필터 초기화
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* 공지사항 목록 */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="5%">ID</TableCell>
                <TableCell width="50%">제목</TableCell>
                <TableCell width="15%">작성자</TableCell>
                <TableCell width="15%">게시일</TableCell>
                <TableCell width="10%">조회수</TableCell>
                <TableCell width="5%">보기</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notices.map((notice) => (
                <TableRow 
                  key={notice.id}
                  sx={{ 
                    backgroundColor: notice.isImportant ? 'rgba(255, 0, 0, 0.05)' : 'inherit'
                  }}
                >
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
                  <TableCell>{notice.author?.name || '관리자'}</TableCell>
                  <TableCell>{dayjs(notice.createdAt).format('YYYY-MM-DD')}</TableCell>
                  <TableCell>{notice.viewCount}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleViewNotice(notice)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {notices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
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
                    작성일: {dayjs(selectedNotice.createdAt).format('YYYY-MM-DD HH:mm')}
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
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default DoctorNoticesPage; 