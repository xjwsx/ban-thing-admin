import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    clinicName: "우리 병원",
    address: "서울시 강남구 테헤란로 123",
    phone: "02-1234-5678",
    email: "contact@hospital.com",
    businessHours: {
      weekday: "09:00-18:00",
      weekend: "10:00-15:00",
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      appointmentReminders: true,
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (name) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: !prev.notifications[name],
      },
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">설정</h1>

      <div className="grid gap-6">
        {/* 기본 정보 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">병원명</label>
              <Input
                name="clinicName"
                value={settings.clinicName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">주소</label>
              <Input
                name="address"
                value={settings.address}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">전화번호</label>
              <Input
                name="phone"
                value={settings.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">이메일</label>
              <Input
                name="email"
                type="email"
                value={settings.email}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* 영업시간 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>영업시간</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">평일</label>
              <Input
                name="weekday"
                value={settings.businessHours.weekday}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    businessHours: {
                      ...prev.businessHours,
                      weekday: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">주말</label>
              <Input
                name="weekend"
                value={settings.businessHours.weekend}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    businessHours: {
                      ...prev.businessHours,
                      weekend: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>알림 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">이메일 알림</span>
              <Button
                variant={
                  settings.notifications.emailNotifications
                    ? "default"
                    : "outline"
                }
                onClick={() => handleNotificationChange("emailNotifications")}
              >
                {settings.notifications.emailNotifications ? "켜짐" : "꺼짐"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SMS 알림</span>
              <Button
                variant={
                  settings.notifications.smsNotifications
                    ? "default"
                    : "outline"
                }
                onClick={() => handleNotificationChange("smsNotifications")}
              >
                {settings.notifications.smsNotifications ? "켜짐" : "꺼짐"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">예약 알림</span>
              <Button
                variant={
                  settings.notifications.appointmentReminders
                    ? "default"
                    : "outline"
                }
                onClick={() => handleNotificationChange("appointmentReminders")}
              >
                {settings.notifications.appointmentReminders ? "켜짐" : "꺼짐"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <Button className="w-32">저장</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
