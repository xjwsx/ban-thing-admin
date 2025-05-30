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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[700px] max-w-[90vw] max-h-[80vh] overflow-hidden">
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
                  <TableHead className="text-center font-medium text-gray-700 py-3">회원 ID</TableHead>
                  <TableHead className="text-center font-medium text-gray-700 py-3">회원 ID</TableHead>
                  <TableHead className="text-center font-medium text-gray-700 py-3">신고이력</TableHead>
                  <TableHead className="text-center font-medium text-gray-700 py-3">가입일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.length > 0 ? (
                  reportData.map((item, index) => (
                    <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell className="text-center py-3 text-gray-900">{item.reporterId || "A321"}</TableCell>
                      <TableCell className="text-center py-3 text-gray-900">{item.reportedId || "B123"}</TableCell>
                      <TableCell className="text-center py-3 text-gray-700">{item.reportReason || "동일 제품을 다양한 사이즈나 색상 판매"}</TableCell>
                      <TableCell className="text-center py-3 text-gray-700">{item.joinDate || "00.00.00"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  // 기본 데이터 (데이터가 없을 때)
                  <>
                    <TableRow className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell className="text-center py-3 text-gray-900">A321</TableCell>
                      <TableCell className="text-center py-3 text-gray-900">B123</TableCell>
                      <TableCell className="text-center py-3 text-gray-700">동일 제품을 다양한 사이즈나 색상 판매</TableCell>
                      <TableCell className="text-center py-3 text-gray-700">00.00.00</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell className="text-center py-3 text-gray-900">A321</TableCell>
                      <TableCell className="text-center py-3 text-gray-900">B123</TableCell>
                      <TableCell className="text-center py-3 text-gray-700">동일 제품을 다양한 사이즈나 색상 판매</TableCell>
                      <TableCell className="text-center py-3 text-gray-700">00.00.00</TableCell>
                    </TableRow>
                  </>
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