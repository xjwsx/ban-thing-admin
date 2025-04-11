/**
 * @typedef {Object} NoticeCreate
 * @property {string} title - 공지사항 제목
 * @property {string} content - 공지사항 내용
 * @property {number} authorId - 작성자 ID
 * @property {boolean} isImportant - 중요 공지사항 여부
 * @property {string} target - 대상 (all, doctors, staff)
 * @property {string} startDate - 시작 날짜 (YYYY-MM-DD)
 * @property {string} endDate - 종료 날짜 (YYYY-MM-DD)
 * @property {boolean} isActive - 활성화 여부
 */

/**
 * @typedef {Object} Notice
 * @property {number} id - 공지사항 ID
 * @property {string} title - 공지사항 제목
 * @property {string} content - 공지사항 내용
 * @property {number} authorId - 작성자 ID
 * @property {boolean} isImportant - 중요 공지사항 여부
 * @property {string} target - 대상 (all, doctors, staff)
 * @property {number} viewCount - 조회수
 * @property {boolean} isActive - 활성화 여부
 * @property {string} startDate - 시작 날짜 (ISO 형식)
 * @property {string} endDate - 종료 날짜 (ISO 형식)
 * @property {string} createdAt - 생성 시간 (ISO 형식)
 * @property {string} updatedAt - 수정 시간 (ISO 형식)
 */

/**
 * @typedef {Object} NoticeDetailed
 * @property {number} id - 공지사항 ID
 * @property {string} title - 공지사항 제목
 * @property {string} content - 공지사항 내용
 * @property {Object} author - 작성자 정보
 * @property {number} author.id - 작성자 ID
 * @property {string} author.name - 작성자 이름
 * @property {boolean} isImportant - 중요 공지사항 여부
 * @property {string} target - 대상 (all, doctors, staff)
 * @property {number} viewCount - 조회수
 * @property {boolean} isActive - 활성화 여부
 * @property {string} startDate - 시작 날짜 (ISO 형식)
 * @property {string} endDate - 종료 날짜 (ISO 형식)
 * @property {string} createdAt - 생성 시간 (ISO 형식)
 * @property {string} updatedAt - 수정 시간 (ISO 형식)
 */

/**
 * @typedef {Object} NoticeListResponse
 * @property {NoticeDetailed[]} data - 공지사항 목록
 * @property {number} total - 전체 공지사항 수
 */

// 공지사항 대상 상수
export const NOTICE_TARGET = {
  ALL: 'all',
  DOCTORS: 'doctors',
  STAFF: 'staff'
}; 