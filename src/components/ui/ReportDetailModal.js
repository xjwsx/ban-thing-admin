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
      purchaseDate: "24년 7월 정도",
      expirationDate: "00.00.00"
    },
    image: "/api/placeholder/119/101" // 플레이스홀더 이미지
  };

  // reportDetail이 있을 경우 데이터 구조 변환
  let data = defaultData;
  
  if (reportDetail) {
    data = {
      mainReason: reportDetail.mainReason || defaultData.mainReason,
      subReason: reportDetail.subReason || defaultData.subReason,
      postInfo: {
        title: reportDetail.title || defaultData.postInfo.title,
        author: "태오엄마", // 실제 데이터에서는 reportDetail.author 등으로 수정
        region: "연수동", // 실제 데이터에서는 reportDetail.region 등으로 수정
        date: reportDetail.date || defaultData.postInfo.date,
        content: "상태좋아요~~!! 빠르게 구매하실 분~~~", // 실제 데이터에서는 reportDetail.content 등으로 수정
        tags: ["#초록색", "#초록색"] // 실제 데이터에서는 reportDetail.tags 등으로 수정
      },
      cleanChecklist: defaultData.cleanChecklist, // 실제 API에서 가져와야 할 데이터
      image: "/api/placeholder/119/101" // 실제 데이터에서는 reportDetail.image 등으로 수정
    };
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] max-w-[90vw] max-h-[80vh] overflow-hidden">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">신고된 글 상세보기</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="p-6 space-y-6 overflow-auto max-h-[calc(80vh-80px)]">
          {/* 신고 사유 섹션 - 회색 배경 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-4">
              <div className="flex">
                <div className="text-sm text-gray-600 w-20">상위 신고 사유</div>
                <div className="text-base font-medium text-gray-900">{data.mainReason}</div>
              </div>
              <div className="flex">
                <div className="text-sm text-gray-600 w-20">하위 신고 사유</div>
                <div className="text-base font-medium text-gray-900">{data.subReason}</div>
              </div>
            </div>
          </div>

          {/* 게시글 정보 섹션 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">게시글 정보</h3>
            <div className="border border-gray-200 rounded-lg p-4 space-y-6">
              <div className="flex gap-6">
                {/* 왼쪽: 게시글 상세 정보 */}
                <div className="flex-1 space-y-4">
                  <div className="flex">
                    <div className="text-sm text-gray-600 w-20">제목</div>
                    <div className="text-base text-gray-900">{data.postInfo.title}</div>
                  </div>
                  <div className="flex">
                    <div className="text-sm text-gray-600 w-20">작성자</div>
                    <div className="text-base text-gray-900">{data.postInfo.author}</div>
                  </div>
                  <div className="flex">
                    <div className="text-sm text-gray-600 w-20">지역</div>
                    <div className="text-base text-gray-900">{data.postInfo.region}</div>
                  </div>
                  <div className="flex">
                    <div className="text-sm text-gray-600 w-20">작성일</div>
                    <div className="text-base text-gray-900">{data.postInfo.date}</div>
                  </div>
                  <div className="flex">
                    <div className="text-sm text-gray-600 w-20">내용</div>
                    <div className="text-base text-gray-900">{data.postInfo.content}</div>
                  </div>
                  <div className="flex">
                    <div className="text-sm text-gray-600 w-20">태그</div>
                    <div className="flex gap-2">
                      {data.postInfo.tags.map((tag, index) => (
                        <span key={index} className="text-blue-600 text-base">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 제품 이미지 */}
                <div className="flex-shrink-0">
                  <img
                    src={data.image}
                    alt="제품 이미지"
                    className="w-[119px] h-[101px] object-cover rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              {/* 클린 체크리스트 섹션 */}
              <div>
                {/* 구분선 */}
                <div className="border-t border-gray-200 pt-6 mb-4"></div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">클린 체크리스트</h4>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="text-sm text-gray-600 w-20">오염</div>
                    <div className="text-base text-gray-900">1~3개</div>
                  </div>
                  <div className="flex">
                    <div className="text-sm text-gray-600 w-20">사용횟수</div>
                    <div className="text-base text-gray-900">5회 미만</div>
                  </div>
                  <div className="flex">
                    <div className="text-sm text-gray-600 w-20">세탁유무</div>
                    <div className="text-base text-gray-900">새상품</div>
                  </div>
                  <div className="flex">
                    <div className="text-sm text-gray-600 w-20">구매시기</div>
                    <div className="text-base text-gray-900">24년 7월 정도</div>
                  </div>
                  <div className="flex">
                    <div className="text-sm text-gray-600 w-20">유통기한</div>
                    <div className="text-base text-gray-900">00.00.00</div>
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