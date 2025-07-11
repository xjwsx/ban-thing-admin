import React from "react";
import { X } from "lucide-react";

const ReportDetailModal = ({ isOpen, onClose, reportDetail = null }) => {
  if (!isOpen) return null;

  // 주소에서 동 부분만 추출하는 함수
  const extractRegion = (address) => {
    if (!address) return "연수동"; // 기본값
    
    // 공백으로 분리하여 마지막 부분(동/리) 추출
    const parts = address.trim().split(' ');
    const lastPart = parts[parts.length - 1];
    
    // 동/리로 끝나는지 확인하고 반환
    if (lastPart.endsWith('동') || lastPart.endsWith('리') || lastPart.endsWith('면') || lastPart.endsWith('읍')) {
      return lastPart;
    }
    
    // 동/리로 끝나지 않으면 전체 주소 반환
    return address;
  };

  // 기본 데이터 (reportDetail이 없을 때)
  const defaultData = {
    mainReason: "광고성콘텐츠에요",
    subReason: "상품도배",
    postInfo: {
      title: "강아지 옷 팔아요~~",
      author: "태오엄마",
      region: "연수동",
      date: "00.00.00",
      content: "상태좋아요~~!! 빠르게 구매하실 분~~~",
      tags: ["#초록색", "#초록색"]
    },
    cleanChecklist: {
      pollution: "1~3개",
      usageCount: "5회 미만",
      washingStatus: "세상품",
      purchaseDate: "24년 7월 정도",
      expiryDate: "25년 7월 정도"
    },
    image: "/api/placeholder/119/101" // 플레이스홀더 이미지
  };

  // 이미지 처리 함수 (에러 처리 강화)
  const getImageSrc = (reportDetail) => {
    try {
      if (reportDetail && reportDetail.images && Array.isArray(reportDetail.images) && reportDetail.images.length > 0) {
        const base64Data = reportDetail.images[0];
        
        // 빈 문자열이나 null 체크
        if (!base64Data || base64Data.trim() === '') {
          console.warn('이미지 데이터가 비어있습니다.');
          return "/api/placeholder/119/101";
        }
        
        // base64 데이터가 이미 data URL 형태인지 확인
        if (base64Data.startsWith('data:image/')) {
          return base64Data;
        }
        
        // base64 데이터 유효성 검사 (기본적인 문자 체크)
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
          console.warn('유효하지 않은 base64 데이터입니다.');
          return "/api/placeholder/119/101";
        }
        
        // base64 데이터만 있는 경우 data URL로 변환
        return `data:image/png;base64,${base64Data}`;
      }
    } catch (error) {
      console.error('이미지 처리 중 오류 발생:', error);
    }
    
    return "/api/placeholder/119/101"; // 기본 플레이스홀더
  };

  // reportDetail이 있을 경우 데이터 구조 변환
  let data = defaultData;
  
  if (reportDetail) {
    data = {
      mainReason: reportDetail.hiReason ? reportDetail.hiReason.replace(/['"]/g, '') : defaultData.mainReason,
      subReason: reportDetail.loReason ? reportDetail.loReason.replace(/['"]/g, '') : defaultData.subReason,
      postInfo: {
        title: reportDetail.itemTitle || defaultData.postInfo.title,
        author: reportDetail.sellerNickname || "태오엄마",
        region: extractRegion(reportDetail.address), // API에서 받은 address를 동 부분만 추출해서 사용
        date: reportDetail.itemCreatedAt ? new Date(reportDetail.itemCreatedAt).toLocaleDateString('ko-KR', { 
          year: '2-digit', 
          month: '2-digit', 
          day: '2-digit' 
        }).replace(/\./g, '.').replace(/\s/g, '') : defaultData.postInfo.date,
        content: reportDetail.itemContent || "상품 설명이 없습니다.",
        tags: (() => {
          console.log('🏷️ 태그 데이터 확인:', reportDetail.hashtags, typeof reportDetail.hashtags);
          
          // null, undefined 처리
          if (reportDetail.hashtags === null || reportDetail.hashtags === undefined) {
            console.log('🏷️ 태그 데이터가 null/undefined -> 빈 배열 반환');
            return [];
          }
          
          // 문자열 "[]" 처리
          if (typeof reportDetail.hashtags === 'string' && reportDetail.hashtags === "[]") {
            console.log('🏷️ 태그 데이터가 문자열 "[]" -> 빈 배열 반환');
            return [];
          }
          
          // 배열인 경우
          if (Array.isArray(reportDetail.hashtags)) {
            if (reportDetail.hashtags.length === 0) {
              console.log('🏷️ 태그 배열이 비어있음 -> 빈 배열 반환');
              return [];
            }
            
            // 배열 안에 "[]" 문자열이나 빈 문자열만 있는 경우 필터링
            const validTags = reportDetail.hashtags.filter(tag => 
              tag && 
              typeof tag === 'string' && 
              tag.trim() !== '' && 
              tag.trim() !== '[]'
            );
            
            if (validTags.length === 0) {
              console.log('🏷️ 유효한 태그가 없음 (빈 문자열 또는 "[]"만 존재) -> 빈 배열 반환');
              return [];
            }
            
            console.log('🏷️ 정상적인 태그 배열:', validTags);
            return validTags;
          }
          
          console.log('🏷️ 예상하지 못한 태그 데이터 타입 -> 빈 배열 반환');
          return [];
        })()
      },
      cleanChecklist: {
        pollution: reportDetail.pollution || "정보 없음",
        usageCount: reportDetail.timeUsed || "정보 없음", 
        washingStatus: reportDetail.cleaned || "정보 없음",
        purchaseDate: reportDetail.purchasedDate || "정보 없음",
        expiryDate: reportDetail.expire || "없음"
      },
      image: getImageSrc(reportDetail)
    };
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[549px] h-[634px] max-w-[90vw] overflow-hidden">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6">
          <h2 className="text-[20px] font-semibold text-gray-900">신고된 글 상세보기</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="pt-0 px-6 pb-6 space-y-6 overflow-auto h-[554px]">
          {/* 신고 사유 섹션 - 회색 배경 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-4">
              <div className="flex gap-28">
                <div className="text-sm text-gray-600 w-22">상위 신고 사유</div>
                <div className="text-[14px] font-medium text-gray-900">{data.mainReason}</div>
              </div>
              <div className="flex gap-28">
                <div className="text-sm text-gray-600 w-22">하위 신고 사유</div>
                <div className="text-[14px] font-medium text-gray-900">{data.subReason}</div>
              </div>
            </div>
          </div>

          {/* 게시글 정보 섹션 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">게시글 정보</h3>
            <div className="border border-gray-200 rounded-lg p-4 space-y-6 w-[501px] h-[216px]">
              <div className="flex gap-6 w-[461px] h-[180px]">
                {/* 게시글 상세 정보 */}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-28">
                    <div className="text-[13px] text-gray-600 w-20">제목</div>
                    <div className="text-[13px] text-gray-900">{data.postInfo.title}</div>
                  </div>
                  <div className="flex gap-28">
                    <div className="text-[13px] text-gray-600 w-20">작성자</div>
                    <div className="text-[13px] text-gray-900">{data.postInfo.author}</div>
                  </div>
                  <div className="flex gap-28">
                    <div className="text-[13px] text-gray-600 w-20">지역</div>
                    <div className="text-[13px] text-gray-900">{data.postInfo.region}</div>
                  </div>
                  <div className="flex gap-28">
                    <div className="text-[13px] text-gray-600 w-20">작성일</div>
                    <div className="text-[13px] text-gray-900">{data.postInfo.date}</div>
                  </div>
                  <div className="flex gap-28">
                    <div className="text-[13px] text-gray-600 w-20">내용</div>
                    <div className="text-[13px] text-gray-900">{data.postInfo.content}</div>
                  </div>
                  <div className="flex gap-28">
                    <div className="text-[13px] text-gray-600 w-20">태그</div>
                    <div className="flex gap-2">
                      {(() => {
                        console.log('🏷️ UI 렌더링 - 태그 배열:', data.postInfo.tags, '길이:', data.postInfo.tags.length);
                        
                        if (!data.postInfo.tags || data.postInfo.tags.length === 0) {
                          console.log('🏷️ 태그 없음으로 표시');
                          return <span className="text-gray-900 text-[13px]">태그 없음</span>;
                        }
                        
                        console.log('🏷️ 태그 목록 렌더링');
                        return data.postInfo.tags.map((tag, index) => (
                          <span key={index} className="text-gray-900 text-[13px]">
                            {tag && tag.trim() !== '' ? 
                              (tag.startsWith('#') ? tag : `#${tag}`) : 
                              tag
                            }
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 클린 체크리스트 섹션 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">클린 체크리스트</h3>
            <div className="border border-gray-200 rounded-lg p-4 w-[501px] h-[164px]">
              <div className="flex gap-6 w-[461px] h-[132px]">
                <div className="flex-1 space-y-2">
                  <div className="flex gap-28">
                    <div className="text-[13px] text-gray-600 w-20">오염</div>
                    <div className="text-[13px] text-gray-900">{data.cleanChecklist.pollution}</div>
                  </div>
                  <div className="flex gap-28">
                    <div className="text-[13px] text-gray-600 w-20">사용횟수</div>
                    <div className="text-[13px] text-gray-900">{data.cleanChecklist.usageCount}</div>
                  </div>
                  <div className="flex gap-28">
                    <div className="text-[13px] text-gray-600 w-20">세탁유무</div>
                    <div className="text-[13px] text-gray-900">{data.cleanChecklist.washingStatus}</div>
                  </div>
                  <div className="flex gap-28">
                    <div className="text-[13px] text-gray-600 w-20">구매시기</div>
                    <div className="text-[13px] text-gray-900">{data.cleanChecklist.purchaseDate}</div>
                  </div>
                  <div className="flex gap-28">
                    <div className="text-[13px] text-gray-600 w-20">유통기한</div>
                    <div className="text-[13px] text-gray-900">{data.cleanChecklist.expiryDate}</div>
                  </div>
                </div>

                {/* 제품 이미지 */}
                <div className="flex-shrink-0 w-[119px] h-[101px]">
                  <img
                    src={data.image}
                    alt="제품 이미지"
                    className="w-[119px] h-[101px] object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.src = "/api/placeholder/119/101";
                    }}
                  />
                  {/* 여러 이미지가 있을 경우 표시 */}
                  {reportDetail && reportDetail.images && reportDetail.images.length > 1 && (
                    <div className="text-[11px] text-gray-500 text-center mt-1">
                      +{reportDetail.images.length - 1}장 더
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal; 