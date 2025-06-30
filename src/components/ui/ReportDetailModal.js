import React from "react";
import { X } from "lucide-react";

const ReportDetailModal = ({ isOpen, onClose, reportDetail = null }) => {
  if (!isOpen) return null;

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
        purchaseDate: "24년 7월 정도"
      },
    image: "/api/placeholder/119/101" // 플레이스홀더 이미지
  };

  // 이미지 처리 함수
  const getImageSrc = (reportDetail) => {
    if (reportDetail && reportDetail.images && Array.isArray(reportDetail.images) && reportDetail.images.length > 0) {
      const base64Data = reportDetail.images[0];
      // base64 데이터가 이미 data URL 형태인지 확인
      if (base64Data.startsWith('data:image/')) {
        return base64Data;
      }
      // base64 데이터만 있는 경우 data URL로 변환
      return `data:image/png;base64,${base64Data}`;
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
        region: "연수동", // API에 지역 정보가 없으므로 기본값
        date: reportDetail.itemCreatedAt ? new Date(reportDetail.itemCreatedAt).toLocaleDateString('ko-KR', { 
          year: '2-digit', 
          month: '2-digit', 
          day: '2-digit' 
        }).replace(/\./g, '.').replace(/\s/g, '') : defaultData.postInfo.date,
        content: reportDetail.itemContent || "상품 설명이 없습니다.",
        tags: reportDetail.hashtags && Array.isArray(reportDetail.hashtags) ? reportDetail.hashtags : ["태그 없음"]
      },
      cleanChecklist: {
        pollution: reportDetail.pollution || "정보 없음",
        usageCount: reportDetail.timeUsed || "정보 없음", 
        washingStatus: reportDetail.cleaned || "정보 없음",
        purchaseDate: reportDetail.purchasedDate || "정보 없음"
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
            <div className="border border-gray-200 rounded-lg p-4 space-y-6 w-[501px] h-[386px]">
              <div className="flex gap-6 w-[461px] h-[150px]">
                {/* 왼쪽: 게시글 상세 정보 */}
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
                      {data.postInfo.tags.map((tag, index) => (
                        <span key={index} className="text-gray-900 text-[13px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* 클린 체크리스트 섹션 */}
              <div className="w-[461px] h-[164px]">
                {/* 구분선 */}
                <div className="border-t border-gray-200 mt-2 mb-5"></div>
                <h4 className="text-[13px] font-semibold text-gray-900 mb-3">클린 체크리스트</h4>
                <div className="flex gap-6">
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
                  </div>
                  
                  {/* 오른쪽: 제품 이미지 */}
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
    </div>
  );
};

export default ReportDetailModal; 