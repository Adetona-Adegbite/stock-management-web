import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Spin,
} from "antd";
import "./pages.css";
import axiosInstance from "../axiosinstance";

interface TableData {
  id: number;
  number: number;
  waiterId: number;
  name: string;
}

interface Waiter {
  id: number;
  name: string;
}

interface Item {
  id: number;
  name: string;
  quantity: number;
}

export const TablePage: React.FC = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [addItemForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchTables();
    fetchWaiters();
    fetchItems();
  }, []);

  const fetchTables = async () => {
    setLoading(true);

    const response = await axiosInstance.get<TableData[]>(
      "http://127.0.0.1:3000/tables"
    );
    setTables(response.data);
    setLoading(false);
  };

  const fetchWaiters = async () => {
    setLoading(true);

    const response = await axiosInstance.get<Waiter[]>(
      "http://127.0.0.1:3000/waiters"
    );
    setWaiters(response.data);
    setLoading(false);
  };

  const fetchItems = async () => {
    setLoading(true);

    const response = await axiosInstance.get<Item[]>(
      "http://127.0.0.1:3000/stock"
    );
    setItems(response.data);
    setLoading(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleOk = async () => {
    const values = form.getFieldsValue();
    await axiosInstance.post("create-waiter-tab", values);
    setIsModalVisible(false);
    fetchTables();
  };

  const handleAddItemOk = async () => {
    const values = addItemForm.getFieldsValue();
    if (selectedTableId !== null) {
      try {
        const response = await axiosInstance.post("add-to-waiter-tab", {
          tableId: selectedTableId,
          itemId: values.itemId,
          quantity: values.quantity,
        });
        console.log(response.data);

        setIsAddItemModalVisible(false);
        fetchTables();
        fetchItems();
      } catch (e: any) {
        console.log("Error: ", e.response.data);
        message.error(`Error:  ${e.response.data}`);
      }
    }
  };

  const showAddItemModal = (tableId: number) => {
    setSelectedTableId(tableId);
    setIsAddItemModalVisible(true);
    addItemForm.resetFields();
  };

  const columns = [
    { title: "Number", dataIndex: "number", key: "number" },
    { title: "Waiter", dataIndex: "name", key: "waiterId" },
    {
      title: "Actions",
      key: "actions",
      render: (_text: string, record: TableData) => (
        <Button onClick={() => showAddItemModal(record.id)}>Add Items</Button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <h1>Tables</h1>
      <Button style={{ margin: 10 }} type="primary" onClick={showModal}>
        Add Table
      </Button>
      <Spin spinning={loading}>
        <Table
          style={{ width: "90%" }}
          columns={columns}
          dataSource={tables}
          rowKey="id"
        />
      </Spin>
      <Modal
        title="Add Table"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="number"
            label="Table Number"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item
            name="waiterId"
            label="Waiter"
            rules={[{ required: true }]}
          >
            <Select>
              {waiters.map((waiter) => (
                <Select.Option key={waiter.id} value={waiter.id}>
                  {waiter.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Add Items to Table"
        visible={isAddItemModalVisible}
        onOk={handleAddItemOk}
        onCancel={() => setIsAddItemModalVisible(false)}
      >
        <Form form={addItemForm} layout="vertical">
          <Form.Item name="itemId" label="Item" rules={[{ required: true }]}>
            <Select>
              {items.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name} (Available: {item.quantity})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, type: "number", min: 1 }]}
          >
            <InputNumber min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
