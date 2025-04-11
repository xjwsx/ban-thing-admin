import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Table,
  Select,
  Tabs,
  List,
  Spin,
  message,
} from "antd";
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
import { useMediaQuery } from "react-responsive";
import { getStudentPaymentStats, getStudentPaymentOverdue } from "../api/crm";

const { Title } = Typography;
const { TabPane } = Tabs;

const StatisticsPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [loading, setLoading] = useState(false);
  const [paymentStats, setPaymentStats] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("M월"));
  const [selectedYear, setSelectedYear] = useState(dayjs().format("YYYY"));
  const [overdueData, setOverdueData] = useState([]);
  const [overdueLoading, setOverdueLoading] = useState(false);
  const [overduePage, setOverduePage] = useState(1);
  const [overdueTotal, setOverdueTotal] = useState(0);
  const [totalOverdueDays, setTotalOverdueDays] = useState(0);
  const [totalOverdueFees, setTotalOverdueFees] = useState(0);

  useEffect(() => {
    fetchPaymentStats();
  }, [selectedYear]);

  useEffect(() => {
    fetchOverdueData();
  }, [overduePage]);

  const fetchPaymentStats = async () => {
    setLoading(true);
    try {
      const startMonth = `${selectedYear}01`;
      const endMonth = `${selectedYear}12`;

      const { data } = await getStudentPaymentStats(startMonth, endMonth);

      const formattedData = data.map((item) => ({
        name: dayjs(item.month).format("M월"),
        매출: item.revenue,
        환불: item.refundAmount,
        결제건수: item.count,
      }));

      setPaymentStats(formattedData);
    } catch (error) {
      console.error("통계 데이터 로딩 실패:", error);
      message.error("통계 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueData = async () => {
    setOverdueLoading(true);
    try {
      const response = await getStudentPaymentOverdue(overduePage, 10);
      setOverdueData(response.data.data);
      setOverdueTotal(response.data.total);
      setTotalOverdueDays(response.data.totalOverdueDays);
      setTotalOverdueFees(response.data.totalOverdueFees);
    } catch (error) {
      console.error("연체 데이터 로딩 실패:", error);
      message.error("연체 데이터를 불러오는데 실패했습니다.");
    } finally {
      setOverdueLoading(false);
    }
  };

  const yearOptions = Array.from({ length: 11 }, (_, i) => {
    const year = dayjs().year() - 5 + i;
    return {
      value: year.toString(),
      label: `${year}년`,
    };
  });

  const monthOptions = paymentStats.map((item) => ({
    value: item.name,
    label: item.name,
  }));

  const getSelectedMonthValues = () => {
    const currentData = paymentStats.length ? paymentStats : [];
    return (
      currentData.find((item) => item.name === selectedMonth) ||
      currentData[currentData.length - 1] || { 매출: 0, 환불: 0, 결제건수: 0 }
    );
  };

  const delinquentColumns = [
    {
      title: "학생명",
      dataIndex: "name",
      key: "name",
      render: (name, record) =>
        `${name}${record.koreanName ? ` (${record.koreanName})` : ""}`,
    },
    {
      title: "회원번호",
      dataIndex: "memberCode",
      key: "memberCode",
    },
    {
      title: "연락처",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "연체일수",
      dataIndex: "overdueDays",
      key: "overdueDays",
      render: (days) => `${days}일`,
    },
    {
      title: "연체료",
      dataIndex: "overdueFee",
      key: "overdueFee",
      render: (fee) => `￥${fee.toLocaleString()}`,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? "0" : "0 0 24px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          통계
        </Title>
        <Select
          value={selectedYear}
          style={{ width: 100 }}
          onChange={setSelectedYear}
          options={yearOptions}
        />
      </div>

      <Tabs defaultActiveKey="sales">
        <TabPane tab="매출 통계" key="sales">
          <Row gutter={isMobile ? 12 : 24}>
            {!isMobile && (
              <Col span={16}>
                <div style={{ height: "400px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={paymentStats}
                      margin={{
                        top: 20,
                        right: 20,
                        left: 50,
                        bottom: 5,
                      }}
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
                      <Line type="monotone" dataKey="환불" stroke="#ff0000" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Col>
            )}
            <Col span={isMobile ? 24 : 8}>
              <Card
                title={`${selectedYear}년 통계`}
                style={{ marginTop: isMobile ? 0 : 18 }}
                extra={
                  <Select
                    value={selectedMonth}
                    style={{ width: 100 }}
                    onChange={setSelectedMonth}
                    options={monthOptions}
                  />
                }
              >
                <Statistic
                  title="매출"
                  value={getSelectedMonthValues().매출}
                  prefix="￥"
                  style={{ marginBottom: 16 }}
                />
                <Statistic
                  title="환불"
                  value={getSelectedMonthValues().환불}
                  prefix="￥"
                  valueStyle={{ color: "#cf1322" }}
                  style={{ marginBottom: 16 }}
                />
                <Statistic
                  title="결제건수"
                  value={getSelectedMonthValues().결제건수}
                  suffix="건"
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="연체 현황" key="delinquent">
          <Card>
            <Row gutter={isMobile ? 12 : 24} style={{ marginBottom: 24 }}>
              <Col span={isMobile ? 12 : 8}>
                <Statistic
                  title="총 연체 건수"
                  value={overdueTotal}
                  suffix="건"
                />
              </Col>
              <Col span={isMobile ? 12 : 8}>
                <Statistic
                  title="총 연체일수"
                  value={totalOverdueDays}
                  suffix="일"
                />
              </Col>
              <Col span={isMobile ? 24 : 8}>
                <Statistic
                  title="총 연체료"
                  value={totalOverdueFees}
                  prefix="￥"
                />
              </Col>
            </Row>
            {isMobile ? (
              <List
                loading={overdueLoading}
                dataSource={overdueData}
                renderItem={(item) => (
                  <List.Item extra={`￥${item.overdueFee.toLocaleString()}`}>
                    <List.Item.Meta
                      title={`${item.name}${
                        item.koreanName ? ` (${item.koreanName})` : ""
                      }`}
                      description={`${item.overdueDays}일 연체`}
                    />
                  </List.Item>
                )}
                pagination={{
                  current: overduePage,
                  total: overdueTotal,
                  pageSize: 10,
                  onChange: setOverduePage,
                }}
              />
            ) : (
              <Table
                columns={delinquentColumns}
                dataSource={overdueData}
                loading={overdueLoading}
                pagination={{
                  current: overduePage,
                  total: overdueTotal,
                  pageSize: 10,
                  onChange: setOverduePage,
                }}
                rowKey="studentId"
              />
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default StatisticsPage;
