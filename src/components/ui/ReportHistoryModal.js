import React from "react";
import { X } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "./table";

const ReportHistoryModal = ({ isOpen, onClose, reportData = [] }) => {
  if (!isOpen) return null;

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear().toString().slice(-2); // 연도 뒤 2자리
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 월 2자리 패딩
      const day = date.getDate().toString().padStart(2, '0'); // 일 2자리 패딩
      return `${year}.${month}.${day}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] max-w-[90vw] max-h-[80vh] overflow-hidden">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">신고이력 상세보기</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="p-6">
          <div className="overflow-auto max-h-[400px]">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-center font-medium text-gray-700 py-3">신고 ID</TableHead>
                  <TableHead className="text-center font-medium text-gray-700 py-3">신고 사유</TableHead>
                  <TableHead className="text-center font-medium text-gray-700 py-3">날짜</TableHead>
                  <TableHead className="text-center font-medium text-gray-700 py-3">신고자 ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.length > 0 ? (
                  reportData.map((item, index) => (
                    <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell className="text-center py-3 text-gray-900">{item.reportId || "-"}</TableCell>
                      <TableCell className="text-center py-3 text-gray-700">{item.reason || "-"}</TableCell>
                      <TableCell className="text-center py-3 text-gray-700">{formatDate(item.createdAt)}</TableCell>
                      <TableCell className="text-center py-3 text-gray-900">{item.reporterId || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      신고이력이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportHistoryModal; 