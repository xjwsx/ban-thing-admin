import React from "react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, message, details }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-[512px] min-h-[128px] flex items-center justify-center">
        <div className="w-full">
          <h3 className="text-lg font-medium text-gray-900 text-left mb-8">
            {message}
          </h3>
          {details && (
            <div className="mb-8 text-left">
              {details.map((detail, index) => (
                <div key={index} className="flex items-start mb-2">
                  <span className="text-gray-900 mr-2">•</span>
                  <span className="text-gray-900 text-sm">{detail}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="w-[57px] h-[36px] border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center text-sm"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="w-[57px] h-[36px] bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center text-sm"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 