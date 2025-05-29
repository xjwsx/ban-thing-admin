import React, { useEffect } from "react";

const NotificationModal = ({ isOpen, onClose, message }) => {
  // 자동 닫기 기능
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // 2초 후 자동 닫기

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg px-4 py-3 w-[388px] h-[52px] flex items-center justify-center">
        <div className="w-full">
          <h3 className="text-sm font-medium text-gray-900 text-left">
            {message}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal; 