import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

const StatisticsPage = () => {
  const [selectedYear, setSelectedYear] = useState(dayjs().format("YYYY"));

  // 임시 통계 데이터
  const statistics = {
    dailyStats: {
      totalAppointments: 24,
      completedAppointments: 18,
      canceledAppointments: 2,
      newCustomers: 3,
    },
    weeklyStats: {
      totalRevenue: 2450000,
      appointmentCount: 156,
      customerSatisfaction: 4.8,
      topServices: [
        { name: "정기검진", count: 45 },
        { name: "상담", count: 32 },
        { name: "치료", count: 28 },
      ],
    },
  };

  const yearOptions = Array.from({ length: 11 }, (_, i) => {
    const year = dayjs().year() - 5 + i;
    return {
      value: year.toString(),
      label: `${year}년`,
    };
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">통계</h1>
          <p className="text-muted-foreground mt-1">
            병원 운영 현황과 통계를 확인하세요
          </p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="연도 선택" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 일일 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 예약</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.dailyStats.totalAppointments}
            </div>
            <p className="text-xs text-muted-foreground">오늘</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료된 예약</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.dailyStats.completedAppointments}
            </div>
            <p className="text-xs text-muted-foreground">오늘</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">취소된 예약</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.dailyStats.canceledAppointments}
            </div>
            <p className="text-xs text-muted-foreground">오늘</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">신규 고객</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.dailyStats.newCustomers}
            </div>
            <p className="text-xs text-muted-foreground">오늘</p>
          </CardContent>
        </Card>
      </div>

      {/* 주간 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-6">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>주간 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { name: "월", 매출: 1200000 },
                    { name: "화", 매출: 1400000 },
                    { name: "수", 매출: 1100000 },
                    { name: "목", 매출: 1600000 },
                    { name: "금", 매출: 1800000 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="매출"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>인기 서비스</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {statistics.weeklyStats.topServices.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {service.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {service.count}회 예약
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {Math.round(
                        (service.count /
                          statistics.weeklyStats.appointmentCount) *
                          100
                      )}
                      %
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* 상세 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>상세 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue" className="space-y-4">
            <TabsList>
              <TabsTrigger value="revenue">매출</TabsTrigger>
              <TabsTrigger value="appointments">예약</TabsTrigger>
              <TabsTrigger value="customers">고객</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        이번 달 매출
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {statistics.weeklyStats.totalRevenue.toLocaleString()}원
                      </div>
                      <p className="text-xs text-muted-foreground">
                        전월 대비 12% 증가
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        평균 객단가
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Math.round(
                          statistics.weeklyStats.totalRevenue /
                            statistics.weeklyStats.appointmentCount
                        ).toLocaleString()}
                        원
                      </div>
                      <p className="text-xs text-muted-foreground">
                        전월 대비 5% 증가
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="appointments">
              <div className="space-y-4">
                <div className="grid gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        예약 현황
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>구분</TableHead>
                            <TableHead>건수</TableHead>
                            <TableHead>비율</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>예약확정</TableCell>
                            <TableCell>
                              {statistics.dailyStats.completedAppointments}
                            </TableCell>
                            <TableCell>
                              {Math.round(
                                (statistics.dailyStats.completedAppointments /
                                  statistics.dailyStats.totalAppointments) *
                                  100
                              )}
                              %
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>취소</TableCell>
                            <TableCell>
                              {statistics.dailyStats.canceledAppointments}
                            </TableCell>
                            <TableCell>
                              {Math.round(
                                (statistics.dailyStats.canceledAppointments /
                                  statistics.dailyStats.totalAppointments) *
                                  100
                              )}
                              %
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="customers">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      고객 통계
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            신규 고객
                          </p>
                          <p className="text-sm text-muted-foreground">
                            이번 달 새로 등록한 고객 수
                          </p>
                        </div>
                        <div className="text-2xl font-bold">
                          {statistics.dailyStats.newCustomers * 20}명
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            재방문율
                          </p>
                          <p className="text-sm text-muted-foreground">
                            한 달 이내 재방문한 고객 비율
                          </p>
                        </div>
                        <div className="text-2xl font-bold">68%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsPage;
