import api from ".";

// ----------- students ---------------
export const getStudentList = async (page, limit, filters = {}) =>
  await api.get("/students", {
    params: {
      page,
      limit,
      ...filters,
    },
  });

export const getStudentsByRegistrationYear = async (year) =>
  await api.get(`/students/registration/${year}`);

export const getStudentsByRegistrationMonth = async (year, month) =>
  await api.get(`/students/registration/${year}/${month}`);

export const getStudentDetail = async (id) => await api.get(`/students/${id}`);

export const createStudent = async (payload) =>
  await api.post("/students", payload);

export const uploadStudents = async (payload) =>
  await api.post("/students/upload", payload);

export const updateStudent = async (id, payload) =>
  await api.patch(`/students/${id}`, payload);

export const deleteStudent = async (id) => await api.delete(`/students/${id}`);

export const searchStudents = async (query) =>
  await api.get("/students/search", {
    params: {
      query,
      page: 1,
      limit: 10,
    },
  });

// ----------- // students ---------------

// ----------- student-diary ---------------
export const getStudentDiaryList = async (studentId, page, limit) =>
  await api.get(`/student-diary/student/${studentId}`, {
    params: {
      page,
      limit,
    },
  });

export const createStudentDiary = async (payload) =>
  await api.post("/student-diary", payload);

export const updateStudentDiary = async (id, payload) =>
  await api.patch(`/student-diary/${id}`, payload);

export const deleteStudentDiary = async (id) =>
  await api.delete(`/student-diary/${id}`);
// ----------- // student-diary ---------------

// ----------- student-course ---------------
export const getStudentCourseList = async (studentId) =>
  await api.get(`/student-course/${studentId}`);

export const createStudentCourse = async (payload) =>
  await api.post("/student-course", payload);

export const updateStudentCourse = async (id, payload) =>
  await api.patch(`/student-course/${id}`, payload);

export const deleteStudentCourse = async (id) =>
  await api.delete(`/student-course/${id}`);
// ----------- // student-course ---------------

// ----------- student-payments ---------------
export const getStudentPaymentList = async (
  page,
  limit,
  filters = {
    startDate: null,
    endDate: null,
    minAmount: null,
    maxAmount: null,
    paymentMethod: null,
    studentId: null,
    monthOfClass: null,
    studentName: null,
  }
) => {
  const requiredParams = {
    page,
    limit,
  };

  const optionalParams = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return await api.get(`/student-payments`, {
    params: {
      ...requiredParams,
      ...optionalParams,
    },
  });
};

export const getStudentPaymentDetail = async (studentId, page, limit) =>
  await api.get(`/student-payments/student/${studentId}`, {
    params: {
      page,
      limit,
    },
  });

export const createStudentPayment = async (payload) =>
  await api.post("/student-payments", payload);

export const updateStudentPayment = async (id, payload) =>
  await api.patch(`/student-payments/${id}`, payload);

export const deleteStudentPayment = async (id) =>
  await api.delete(`/student-payments/${id}`);

export const uploadPayments = async (payload) =>
  await api.post("/student-payments/upload", payload);
// ----------- // student-payments ---------------

// 결제 통계 API 추가
export const getStudentPaymentStats = async (startMonth, endMonth) =>
  await api.get("/student-payments/stats", {
    params: {
      startMonth,
      endMonth,
    },
  });

// 연체 데이터 API 추가
export const getStudentPaymentOverdue = async (page, limit) =>
  await api.get("/student-payments/overdue", {
    params: {
      page,
      limit,
    },
  });

// ----------- // student-payments ---------------

// ----------- teachers ---------------
export const getTeacherList = async (page, limit) =>
  await api.get("/teachers", {
    params: {
      page,
      limit,
    },
  });

export const getTeacherDetail = async (id) => await api.get(`/teachers/${id}`);

export const createTeacher = async (payload) =>
  await api.post("/teachers", payload);

export const updateTeacher = async (id, payload) =>
  await api.patch(`/teachers/${id}`, payload);

export const deleteTeacher = async (id) => await api.delete(`/teachers/${id}`);

export const teacherLogin = async (payload) =>
  await api.post("/teachers/login", payload);

export const teacherRefreshToken = async () =>
  await api.post("/teachers/refresh");

export const getTeacherMe = async () => await api.get("/teachers/me");

// ----------- // teachers ---------------

// ----------- teacher-task ---------------
export const getTeacherTaskList = async (teacherId) =>
  await api.get(`/teacher-task`, {
    params: {
      teacherId,
    },
  });

export const getTeacherTaskDetail = async (teacherId) =>
  await api.get(`/teacher-task/${teacherId}`);

export const createTeacherTask = async (payload) =>
  await api.post("/teacher-task", payload);

export const updateTeacherTask = async (id, payload) =>
  await api.patch(`/teacher-task/${id}`, payload);

export const deleteTeacherTask = async (id) =>
  await api.delete(`/teacher-task/${id}`);
// ----------- // teacher-task ---------------

// ----------- teacher-history ---------------
export const getTeacherHistoryList = async (teacherId, page, limit) =>
  await api.get(`/teacher-history`, {
    params: {
      page,
      limit,
      teacherId,
    },
  });
// ----------- // teacher-history ---------------

// ----------- teacher-permissions ---------------
export const getTeacherPermissions = async (teacherId) =>
  await api.get("/teacher-permissions", {
    params: {
      teacherId,
    },
  });

export const updateTeacherPermission = async (id, payload) =>
  await api.patch(`/teacher-permissions/${id}`, payload);
// ----------- // teacher-permissions ---------------

// ----------- teacher-schedules ---------------
export const getTeacherSchedule = async (resourceName, startDate, endDate) =>
  await api.get(`/teacher-schedules/schedules`, {
    params: {
      resourceName,
      startDate,
      endDate,
    },
  });
// ----------- // teacher-schedules ---------------

// ----------- courses ---------------
export const getCourseList = async (page, limit) =>
  await api.get("/courses", {
    params: {
      page,
      limit,
    },
  });

export const getCourseDetail = async (id) => await api.get(`/courses/${id}`);

export const createCourse = async (payload) =>
  await api.post("/courses", payload);

export const updateCourse = async (id, payload) =>
  await api.patch(`/courses/${id}`, payload);

export const deleteCourse = async (id) => await api.delete(`/courses/${id}`);
// ----------- // courses ---------------

// ----------- teacher-task-comment ---------------
export const getTeacherTaskCommentList = async (taskId) =>
  await api.get(`/teacher-task-comment`, {
    params: {
      taskId,
    },
  });

export const getTeacherTaskCommentDetail = async (id) =>
  await api.get(`/teacher-task-comment/${id}`);

export const createTeacherTaskComment = async (payload) =>
  await api.post("/teacher-task-comment", payload);

export const updateTeacherTaskComment = async (id, payload) =>
  await api.patch(`/teacher-task-comment/${id}`, payload);

export const deleteTeacherTaskComment = async (id) =>
  await api.delete(`/teacher-task-comment/${id}`);
// ----------- // teacher-task-comment ---------------
