import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Divider,
  Button,
  message,
  Modal,
  Row,
  Pagination,
  Tag,
} from "antd";
import { useNavigate } from "react-router-dom";
import { getUsers, deleteUser } from "../api/user";

const { Title } = Typography;

const UserPage = () => {
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState({
    totalCount: 0,
    totalPage: 1,
  });

  const showModal = () => {
    setOpen(true);
  };
  const hideModal = () => {
    setOpen(false);
  };

  const goToUserRegister = () => {
    navigate("/user/register");
  };

  const getList = async (newPage) => {
    try {
      const response = await getUsers({
        page: newPage,
        limit: 20,
      });
      if (response.status !== 200) {
        throw new Error("서버 에러");
      }

      const { totalCount, totalPage, users } = response.data;

      const data = users.map((item) => {
        const today = new Date();
        const todayUTC = new Date(
          Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate()
          )
        );
        const isActive = item.Subscriptions?.some((sub) => {
          const subscriptionDate = new Date(
            Date.UTC(
              new Date(sub.subscriptionDate).getUTCFullYear(),
              new Date(sub.subscriptionDate).getUTCMonth(),
              new Date(sub.subscriptionDate).getUTCDate()
            )
          );
          const expirationDate = new Date(
            Date.UTC(
              new Date(sub.expirationDate).getUTCFullYear(),
              new Date(sub.expirationDate).getUTCMonth(),
              new Date(sub.expirationDate).getUTCDate()
            )
          );
          return todayUTC >= subscriptionDate && todayUTC <= expirationDate;
        });

        return {
          ...item,
          key: item.id,
          active: isActive,
          subscriptions: item.subscriptions?.map((sub) => {
            return {
              ...sub,
              key: sub.id,
            };
          }),
        };
      });

      setDataSource(data);
      setMetadata({
        totalCount,
        totalPage,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const onDelete = async () => {
    const methods = selectedRowKeys.map((key) => deleteUser(key));
    await Promise.all(methods);

    message.success(selectedRowKeys.length + "명 유저가 삭제되었습니다.");

    setSelectedRowKeys([]);
    setOpen(false);
    refresh();
  };

  const refresh = () => {
    if (page === 1) {
      getList(1);
    } else {
      setPage(1);
    }
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  useEffect(() => {
    getList(page);
  }, [page]);

  const expandedRowRender = (record) => {
    const columns = [
      { title: "Type", dataIndex: "type", key: "type" },
      { title: "Plan", dataIndex: "plan", key: "plan" },
      {
        title: "Subscription Date",
        dataIndex: "subscriptionDate",
        key: "subscriptionDate",
        render: (text) => {
          const date = new Date(text);
          const offset = date.getTimezoneOffset() / 60;
          const gmt = `GMT${offset >= 0 ? "+" : ""}${offset}`;
          return `${date.toLocaleString()} (${gmt})`;
        },
      },
      {
        title: "Expiration Date",
        dataIndex: "expirationDate",
        key: "expirationDate",
        render: (text) => {
          const date = new Date(text);
          const offset = date.getTimezoneOffset() / 60;
          const gmt = `GMT${offset >= 0 ? "+" : ""}${offset}`;
          return `${date.toLocaleString()} (${gmt})`;
        },
      },
      { title: "Quiz", dataIndex: "quiz", key: "quiz" },
      { title: "Zoom", dataIndex: "zoom", key: "zoom" },
    ];

    return (
      <Table
        columns={columns}
        dataSource={record.Subscriptions}
        pagination={false}
      />
    );
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      render: (active) => active && <Tag color="green">Active</Tag>,
    },
    { title: "PhoneNumber", dataIndex: "phoneNumber", key: "phoneNumber" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "CreatedAt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => {
        const date = new Date(text);
        const offset = date.getTimezoneOffset() / 60;
        const gmt = `GMT${offset >= 0 ? "+" : ""}${offset}`;
        return `${date.toLocaleString()} (${gmt})`;
      },
    },
  ];

  return (
    <div>
      <Title level={2}>사용자 관리</Title>
      <Divider />
      <Row justify="space-between" style={{ width: "100%", paddingBottom: 10 }}>
        <Button onClick={showModal} disabled={selectedRowKeys.length === 0}>
          삭제
        </Button>
        <Pagination
          current={page}
          pageSize={20}
          total={metadata.totalCount}
          onChange={(newPage) => setPage(newPage)}
          showSizeChanger={false}
        />
      </Row>
      <Modal
        title="Delete"
        open={open}
        onOk={onDelete}
        onCancel={hideModal}
        okText="Ok"
        cancelText="Cancel"
      >
        <p>정말 삭제하시겠습니까? (유저는 삭제를 권하지 않습니다.)</p>
      </Modal>
      <Table
        columns={columns}
        expandable={{ expandedRowRender }}
        dataSource={dataSource}
        rowSelection={rowSelection}
        pagination={false}
      />
    </div>
  );
};

export default UserPage;
