import api from ".";

// ----------- customers ---------------
export const getCustomerList = async (page = 1, limit = 10, filters = {}) =>
  await api.get("/customers", {
    params: {
      page,
      limit,
      ...filters,
    },
  });

export const getCustomersByRegistrationYear = async (year) =>
  await api.get(`/customers/registration/${year}`);

export const getCustomersByRegistrationMonth = async (year, month) =>
  await api.get(`/customers/registration/${year}/${month}`);

export const getCustomerDetail = async (id) => await api.get(`/customers/${id}`);

export const createCustomer = async (payload) =>
  await api.post("/customers", payload);

export const uploadCustomers = async (payload) =>
  await api.post("/customers/upload", payload);

export const updateCustomer = async (id, payload) =>
  await api.patch(`/customers/${id}`, payload);

export const deleteCustomer = async (id) => await api.delete(`/customers/${id}`);

export const searchCustomers = async (query) =>
  await api.get("/customers/search", {
    params: {
      query,
      page: 1,
      limit: 10,
    },
  });

// ----------- // customers ---------------

// ----------- customer-diary ---------------
export const getCustomerDiaryList = async (customerId, page = 1, limit = 10) =>
  await api.get(`/customer-diary/customer/${customerId}`, {
    params: {
      page,
      limit,
    },
  });

export const createCustomerDiary = async (payload) =>
  await api.post("/customer-diary", payload);

export const updateCustomerDiary = async (id, payload) =>
  await api.patch(`/customer-diary/${id}`, payload);

export const deleteCustomerDiary = async (id) =>
  await api.delete(`/customer-diary/${id}`);
// ----------- // customer-diary ---------------

// ----------- customer-course ---------------
export const getCustomerCourseList = async (customerId) =>
  await api.get(`/customer-course/${customerId}`);

export const createCustomerCourse = async (payload) =>
  await api.post("/customer-course", payload);

export const updateCustomerCourse = async (id, payload) =>
  await api.patch(`/customer-course/${id}`, payload);

export const deleteCustomerCourse = async (id) =>
  await api.delete(`/customer-course/${id}`);
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

  return await api.get(`/customer-payments`, {
    params: {
      ...requiredParams,
      ...optionalParams,
    },
  });
};

export const getCustomerPaymentDetail = async (customerId, page = 1, limit = 10) =>
  await api.get(`/customer-payments/customer/${customerId}`, {
    params: {
      page,
      limit,
    },
  });

export const createCustomerPayment = async (payload) =>
  await api.post("/customer-payments", payload);

export const updateCustomerPayment = async (id, payload) =>
  await api.patch(`/customer-payments/${id}`, payload);

export const deleteCustomerPayment = async (id) =>
  await api.delete(`/customer-payments/${id}`);

export const uploadPayments = async (payload) =>
  await api.post("/customer-payments/upload", payload);
// ----------- // customer-payments ---------------

// 결제 통계 API 추가
export const getCustomerPaymentStats = async (startMonth, endMonth) =>
  await api.get("/customer-payments/stats", {
    params: {
      startMonth,
      endMonth,
    },
  });

// 연체 데이터 API 추가
export const getCustomerPaymentOverdue = async (page = 1, limit = 10) =>
  await api.get("/customer-payments/overdue", {
    params: {
      page,
      limit,
    },
  });

// ----------- // customer-payments ---------------

// ----------- doctors ---------------
export const getDoctorList = async (page = 1, limit = 10) =>
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

export const doctorRefreshToken = async (payload) =>
  await api.post("/doctors/refresh", payload);

export const getDoctorMe = async () => await api.get("/doctors/me");

// ----------- // doctors ---------------

// ----------- doctor-task ---------------
export const getDoctorTaskList = async (doctorId) =>
  await api.get(`/doctor-task`, {
    params: {
      doctorId,
    },
  });

export const getDoctorTaskDetail = async (id) =>
  await api.get(`/doctor-task/${id}`);

export const createDoctorTask = async (payload) =>
  await api.post("/doctor-task", payload);

export const updateDoctorTask = async (id, payload) =>
  await api.patch(`/doctor-task/${id}`, payload);

export const deleteDoctorTask = async (id) =>
  await api.delete(`/doctor-task/${id}`);
// ----------- // doctor-task ---------------

// ----------- doctor-history ---------------
export const getDoctorHistoryList = async (doctorId, page = 1, limit = 10) =>
  await api.get(`/doctor-history`, {
    params: {
      doctorId,
      page,
      limit,
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
export const getCourseList = async (page = 1, limit = 10) =>
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

// ----------- reservations ---------------
export const createReservation = async (payload) =>
  await api.post("/reservations", payload);

export const getReservationList = async (
  page = 1,
  limit = 10,
  filters = {
    customerName: null,
    customerId: null,
    doctorId: null,
    status: null,
    startDate: null,
    endDate: null,
    sessionTreatment: null,
    visitType: null,
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

  return await api.get(`/reservations`, {
    params: {
      ...requiredParams,
      ...optionalParams,
    },
  });
};

export const getReservationDetail = async (id) => 
  await api.get(`/reservations/${id}`);

export const updateReservation = async (id, payload) =>
  await api.patch(`/reservations/${id}`, payload);

export const deleteReservation = async (id) =>
  await api.delete(`/reservations/${id}`);

export const getReservationAvailableSlots = async (date, doctorId = null) => {
  const params = { date };
  if (doctorId) params.doctorId = doctorId;
  
  return await api.get(`/reservations/available-slots`, {
    params,
  });
};
// ----------- // reservations ---------------

// ----------- notices ---------------
export const getNoticeList = async (
  page = 1,
  limit = 10,
  filters = {
    search: null,
    isImportant: null,
    target: null,
    authorId: null,
    startDate: null,
    endDate: null,
    isActive: null,
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

  return await api.get(`/notices`, {
    params: {
      ...requiredParams,
      ...optionalParams,
    },
  });
};

export const getNoticeDetail = async (id) => 
  await api.get(`/notices/${id}`);

export const createNotice = async (payload) =>
  await api.post("/notices", payload);

export const updateNotice = async (id, payload) =>
  await api.patch(`/notices/${id}`, payload);

export const deleteNotice = async (id) =>
  await api.delete(`/notices/${id}`);

export const incrementNoticeViewCount = async (id) =>
  await api.patch(`/notices/${id}/view`);

export const getDoctorNotices = async (
  page = 1,
  limit = 10,
  filters = {
    search: null,
    isImportant: null,
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

  return await api.get(`/notices/doctor`, {
    params: {
      ...requiredParams,
      ...optionalParams,
    },
  });
};
// ----------- // notices ---------------

// API 함수명 수정 (Customer -> Student) 호환성을 위한 별칭
export const searchStudents = searchCustomers;
export const getStudentPaymentList = getCustomerPaymentList;
export const getStudentPaymentStats = getCustomerPaymentStats;
export const getStudentPaymentOverdue = getCustomerPaymentOverdue;
export const createStudentPayment = createCustomerPayment;
export const updateStudentPayment = updateCustomerPayment;
export const deleteStudentPayment = deleteCustomerPayment;
