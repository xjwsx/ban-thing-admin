/**
 * @typedef {Object} ReservationCreate
 * @property {number} customerId - 고객 ID
 * @property {string} reservationDate - 예약 날짜 (ISO 형식)
 * @property {number} doctorId - 의사 ID
 * @property {string} startTime - 시작 시간 (HH:MM)
 * @property {string} endTime - 종료 시간 (HH:MM)
 * @property {number} duration - 소요 시간 (분)
 * @property {string} visitRoute - 방문 경로
 * @property {string} visitType - 방문 유형 (신규/기존)
 * @property {string} sessionTreatment - 시술 종류
 * @property {boolean} hasPriorExperience - 이전 경험 여부
 * @property {string} [notes] - 특이사항
 */

/**
 * @typedef {Object} Reservation
 * @property {number} id - 예약 ID
 * @property {string} reservationNumber - 예약 번호
 * @property {number} customerId - 고객 ID
 * @property {string} reservationDate - 예약 날짜 (ISO 형식)
 * @property {number} doctorId - 의사 ID
 * @property {string} status - 상태 (pending, confirmed, canceled, completed)
 * @property {string} startTime - 시작 시간 (HH:MM)
 * @property {string} endTime - 종료 시간 (HH:MM)
 * @property {number} duration - 소요 시간 (분)
 * @property {string} visitRoute - 방문 경로
 * @property {string} visitType - 방문 유형 (신규/기존)
 * @property {string} sessionTreatment - 시술 종류
 * @property {boolean} hasPriorExperience - 이전 경험 여부
 * @property {string} [notes] - 특이사항
 * @property {string} createdAt - 생성 시간 (ISO 형식)
 * @property {string} updatedAt - 수정 시간 (ISO 형식)
 */

/**
 * @typedef {Object} ReservationDetailed
 * @property {number} id - 예약 ID
 * @property {string} reservationNumber - 예약 번호
 * @property {Object} customer - 고객 정보
 * @property {number} customer.id - 고객 ID
 * @property {string} customer.name - 고객 이름
 * @property {string} customer.phoneNumber - 고객 전화번호
 * @property {string} reservationDate - 예약 날짜 (ISO 형식)
 * @property {Object} doctor - 의사 정보
 * @property {number} doctor.id - 의사 ID
 * @property {string} doctor.name - 의사 이름
 * @property {string} status - 상태 (pending, confirmed, canceled, completed)
 * @property {string} startTime - 시작 시간 (HH:MM)
 * @property {string} endTime - 종료 시간 (HH:MM)
 * @property {number} duration - 소요 시간 (분)
 * @property {string} visitRoute - 방문 경로
 * @property {string} visitType - 방문 유형 (신규/기존)
 * @property {string} sessionTreatment - 시술 종류
 * @property {boolean} hasPriorExperience - 이전 경험 여부
 * @property {string} [notes] - 특이사항
 * @property {string} createdAt - 생성 시간 (ISO 형식)
 * @property {string} updatedAt - 수정 시간 (ISO 형식)
 */

/**
 * @typedef {Object} ReservationListResponse
 * @property {ReservationDetailed[]} data - 예약 목록
 * @property {number} total - 전체 예약 수
 */

/**
 * @typedef {Object} TimeSlot
 * @property {string} start - 시작 시간 (HH:MM)
 * @property {string} end - 종료 시간 (HH:MM)
 */

// 예약 상태 상수
export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELED: 'canceled',
  COMPLETED: 'completed'
};

// 예약 방문 유형 상수
export const VISIT_TYPE = {
  NEW: '신규',
  EXISTING: '기존'
}; 