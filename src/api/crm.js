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

// ----------- doctors ---------------
export const getDoctorList = async (page, limit) =>
  await api.get("/doctors", {
    params: {
      page,
      limit,
    },
  });

export const getDoctorDetail = async (id) => await api.get(`/doctors/${id}`);

export const createDoctor = async (payload) =>
  await api.post("/doctors", payload);

export const updateDoctor = async (id, payload) =>
  await api.patch(`/doctors/${id}`, payload);

export const deleteDoctor = async (id) => await api.delete(`/doctors/${id}`);

export const doctorLogin = async (payload) =>
  await api.post("/doctors/login", payload);

export const doctorRefreshToken = async () =>
  await api.post("/doctors/refresh");

export const getDoctorMe = async () => await api.get("/doctors/me");

// ----------- // doctors ---------------

// ----------- doctor-task ---------------
export const getDoctorTaskList = async (doctorId) =>
  await api.get(`/doctor-task`, {
    params: {
      doctorId,
    },
  });

export const getDoctorTaskDetail = async (doctorId) =>
  await api.get(`/doctor-task/${doctorId}`);

export const createDoctorTask = async (payload) =>
  await api.post("/doctor-task", payload);

export const updateDoctorTask = async (id, payload) =>
  await api.patch(`/doctor-task/${id}`, payload);

export const deleteDoctorTask = async (id) =>
  await api.delete(`/doctor-task/${id}`);
// ----------- // doctor-task ---------------

// ----------- doctor-history ---------------
export const getDoctorHistoryList = async (doctorId, page, limit) =>
  await api.get(`/doctor-history`, {
    params: {
      page,
      limit,
      doctorId,
    },
  });
// ----------- // doctor-history ---------------

// ----------- doctor-permissions ---------------
export const getDoctorPermissions = async (doctorId) =>
  await api.get("/doctor-permissions", {
    params: {
      doctorId,
    },
  });

export const updateDoctorPermission = async (id, payload) =>
  await api.patch(`/doctor-permissions/${id}`, payload);
// ----------- // doctor-permissions ---------------

// ----------- doctor-schedules ---------------
export const getDoctorSchedule = async (resourceName, startDate, endDate) =>
  await api.get(`/doctor-schedules/schedules`, {
    params: {
      resourceName,
      startDate,
      endDate,
    },
  });
// ----------- // doctor-schedules ---------------

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

// ----------- doctor-task-comment ---------------
export const getDoctorTaskCommentList = async (taskId) =>
  await api.get(`/doctor-task-comment`, {
    params: {
      taskId,
    },
  });

export const getDoctorTaskCommentDetail = async (id) =>
  await api.get(`/doctor-task-comment/${id}`);

export const createDoctorTaskComment = async (payload) =>
  await api.post("/doctor-task-comment", payload);

export const updateDoctorTaskComment = async (id, payload) =>
  await api.patch(`/doctor-task-comment/${id}`, payload);

export const deleteDoctorTaskComment = async (id) =>
  await api.delete(`/doctor-task-comment/${id}`);
// ----------- // doctor-task-comment ---------------
