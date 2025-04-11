import api from ".";

// ----------- customers ---------------
export const getCustomerList = async (page = 1, limit = 10, filters = {}) =>
  await api.get("/api/v1/customers", {
    params: {
      page,
      limit,
      ...filters,
    },
  });

export const getCustomersByRegistrationYear = async (year) =>
  await api.get(`/api/v1/customers/registration/${year}`);

export const getCustomersByRegistrationMonth = async (year, month) =>
  await api.get(`/api/v1/customers/registration/${year}/${month}`);

export const getCustomerDetail = async (id) => await api.get(`/api/v1/customers/${id}`);

export const createCustomer = async (payload) =>
  await api.post("/api/v1/customers", payload);

export const uploadCustomers = async (payload) =>
  await api.post("/api/v1/customers/upload", payload);

export const updateCustomer = async (id, payload) =>
  await api.patch(`/api/v1/customers/${id}`, payload);

export const deleteCustomer = async (id) => await api.delete(`/api/v1/customers/${id}`);

export const searchCustomers = async (query) =>
  await api.get("/api/v1/customers/search", {
    params: {
      query,
      page: 1,
      limit: 10,
    },
  });

// ----------- // customers ---------------

// ----------- customer-diary ---------------
export const getCustomerDiaryList = async (customerId, page = 1, limit = 10) =>
  await api.get(`/api/v1/customer-diaries`, {
    params: {
      customerId,
      page,
      limit,
    },
  });

export const createCustomerDiary = async (payload) =>
  await api.post("/api/v1/customer-diaries", payload);

export const updateCustomerDiary = async (id, payload) =>
  await api.patch(`/api/v1/customer-diaries/${id}`, payload);

export const deleteCustomerDiary = async (id) =>
  await api.delete(`/api/v1/customer-diaries/${id}`);
// ----------- // customer-diary ---------------

// ----------- customer-course ---------------
export const getCustomerCourseList = async (customerId) =>
  await api.get(`/api/v1/customer-courses`, {
    params: {
      customerId,
    }
  });

export const createCustomerCourse = async (payload) =>
  await api.post("/api/v1/customer-courses", payload);

export const updateCustomerCourse = async (id, payload) =>
  await api.patch(`/api/v1/customer-courses/${id}`, payload);

export const deleteCustomerCourse = async (id) =>
  await api.delete(`/api/v1/customer-courses/${id}`);
// ----------- // customer-course ---------------

// ----------- customer-payments ---------------
export const getCustomerPaymentList = async (
  page = 1,
  limit = 10,
  filters = {
    startDate: null,
    endDate: null,
    minAmount: null,
    maxAmount: null,
    paymentMethod: null,
    customerId: null,
    monthOfClass: null,
    customerName: null,
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

  return await api.get(`/api/v1/customer-payments`, {
    params: {
      ...requiredParams,
      ...optionalParams,
    },
  });
};

export const getCustomerPaymentDetail = async (customerId, page = 1, limit = 10) =>
  await api.get(`/api/v1/customer-payments`, {
    params: {
      customerId,
      page,
      limit,
    },
  });

export const createCustomerPayment = async (payload) =>
  await api.post("/api/v1/customer-payments", payload);

export const updateCustomerPayment = async (id, payload) =>
  await api.patch(`/api/v1/customer-payments/${id}`, payload);

export const deleteCustomerPayment = async (id) =>
  await api.delete(`/api/v1/customer-payments/${id}`);

export const uploadPayments = async (payload) =>
  await api.post("/api/v1/customer-payments/upload", payload);
// ----------- // customer-payments ---------------

// 결제 통계 API 추가
export const getCustomerPaymentStats = async (startMonth, endMonth) =>
  await api.get("/api/v1/customer-payments/stats", {
    params: {
      startMonth,
      endMonth,
    },
  });

// 연체 데이터 API 추가
export const getCustomerPaymentOverdue = async (page = 1, limit = 10) =>
  await api.get("/api/v1/customer-payments/overdue", {
    params: {
      page,
      limit,
    },
  });

// ----------- // customer-payments ---------------

// ----------- doctors ---------------
export const getDoctorList = async (page = 1, limit = 10) =>
  await api.get("/api/v1/doctors", {
    params: {
      page,
      limit,
    },
  });

export const getDoctorDetail = async (id) => await api.get(`/api/v1/doctors/${id}`);

export const createDoctor = async (payload) =>
  await api.post("/api/v1/doctors", payload);

export const updateDoctor = async (id, payload) =>
  await api.patch(`/api/v1/doctors/${id}`, payload);

export const deleteDoctor = async (id) => await api.delete(`/api/v1/doctors/${id}`);

export const doctorLogin = async (payload) =>
  await api.post("/api/v1/auth/login", payload);

export const doctorRefreshToken = async (payload) =>
  await api.post("/api/v1/auth/refresh", payload);

export const getDoctorMe = async () => await api.get("/api/v1/doctors/me");

// ----------- // doctors ---------------

// ----------- doctor-task ---------------
export const getDoctorTaskList = async (doctorId) =>
  await api.get(`/api/v1/doctor-tasks`, {
    params: {
      doctorId,
    },
  });

export const getDoctorTaskDetail = async (id) =>
  await api.get(`/api/v1/doctor-tasks/${id}`);

export const createDoctorTask = async (payload) =>
  await api.post("/api/v1/doctor-tasks", payload);

export const updateDoctorTask = async (id, payload) =>
  await api.patch(`/api/v1/doctor-tasks/${id}`, payload);

export const deleteDoctorTask = async (id) =>
  await api.delete(`/api/v1/doctor-tasks/${id}`);
// ----------- // doctor-task ---------------

// ----------- doctor-history ---------------
export const getDoctorHistoryList = async (doctorId, page = 1, limit = 10) =>
  await api.get(`/api/v1/doctor-histories`, {
    params: {
      doctorId,
      page,
      limit,
    },
  });
// ----------- // doctor-history ---------------

// ----------- doctor-permissions ---------------
export const getDoctorPermissions = async (doctorId) =>
  await api.get("/api/v1/doctor-permissions", {
    params: {
      doctorId,
    },
  });

export const updateDoctorPermission = async (id, payload) =>
  await api.patch(`/api/v1/doctor-permissions/${id}`, payload);
// ----------- // doctor-permissions ---------------

// ----------- doctor-schedules ---------------
export const getDoctorSchedule = async (resourceName, startDate, endDate) =>
  await api.get(`/api/v1/doctor-schedules`, {
    params: {
      resourceName,
      startDate,
      endDate,
    },
  });
// ----------- // doctor-schedules ---------------

// ----------- courses ---------------
export const getCourseList = async (page = 1, limit = 10) =>
  await api.get("/api/v1/courses", {
    params: {
      page,
      limit,
    },
  });

export const getCourseDetail = async (id) => await api.get(`/api/v1/courses/${id}`);

export const createCourse = async (payload) =>
  await api.post("/api/v1/courses", payload);

export const updateCourse = async (id, payload) =>
  await api.patch(`/api/v1/courses/${id}`, payload);

export const deleteCourse = async (id) => await api.delete(`/api/v1/courses/${id}`);
// ----------- // courses ---------------

// ----------- doctor-task-comment ---------------
export const getDoctorTaskCommentList = async (taskId) =>
  await api.get(`/api/v1/doctor-task-comments`, {
    params: {
      taskId,
    },
  });

export const getDoctorTaskCommentDetail = async (id) =>
  await api.get(`/api/v1/doctor-task-comments/${id}`);

export const createDoctorTaskComment = async (payload) =>
  await api.post("/api/v1/doctor-task-comments", payload);

export const updateDoctorTaskComment = async (id, payload) =>
  await api.patch(`/api/v1/doctor-task-comments/${id}`, payload);

export const deleteDoctorTaskComment = async (id) =>
  await api.delete(`/api/v1/doctor-task-comments/${id}`);
// ----------- // doctor-task-comment ---------------
