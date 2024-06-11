import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  Popconfirm,
  message,
} from "antd";
import "./pages.css";
import axiosInstance from "../axiosinstance";

interface Waiter {
  id: number;
  name: string;
}

export const WaiterPage: React.FC = () => {
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchWaiters();
  }, []);

  const fetchWaiters = async () => {
    setLoading(true);
    const response = await axiosInstance.get<Waiter[]>("waiters");
    setWaiters(response.data);
    setLoading(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleOk = async () => {
    const values = form.getFieldsValue();
    await axiosInstance.post("create-waiter", values);
    setIsModalVisible(false);
    fetchWaiters();
  };

  const handleDelete = async (id: number) => {
    try {
      await axiosInstance.delete(`delete-waiter/${id}`);
      message.success("Waiter deleted successfully");
      fetchWaiters();
    } catch (error) {
      message.error("Failed to delete waiter");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Actions",
      key: "actions",
      render: (record: Waiter) => (
        <Popconfirm
          title="Are you sure to delete this waiter?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="page-container">
      <h1>Waiters</h1>
      <Button style={{ margin: 10 }} type="primary" onClick={showModal}>
        Add Waiter
      </Button>
      <Spin spinning={loading}>
        <Table
          style={{ width: "90%" }}
          columns={columns}
          dataSource={waiters}
          rowKey="id"
        />
      </Spin>
      <Modal
        title="Add Waiter"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
