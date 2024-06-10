import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Spin } from "antd";
import axios from "axios";
import "./pages.css";
import axiosInstance from "../axiosinstance";

interface Item {
  id: number;
  name: string;
  quantity: number;
  price: number;
  description: string;
}

export const StockPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);

    const response = await axiosInstance.get<Item[]>("stock");
    setItems(response.data);
    setLoading(false);
  };

  const showModal = (item: Item | null) => {
    setEditingItem(item);
    setIsModalVisible(true);
    form.setFieldsValue(item || {});
  };

  const handleOk = async () => {
    setLoading(true);
    setIsModalVisible(false);

    const values = form.getFieldsValue();
    if (editingItem) {
      await axiosInstance.put("edit-stock-item", {
        ...values,
        id: editingItem.id,
      });
    } else {
      await axiosInstance.post("add-stock", values);
    }
    fetchItems();
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);

    await axiosInstance.delete("delete-stock-item", {
      data: { id },
    });
    fetchItems();
    setLoading(false);
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Action",
      key: "action",
      render: (record: Item) => (
        <>
          <Button style={{ margin: 5 }} onClick={() => showModal(record)}>
            Edit
          </Button>
          <Button onClick={() => handleDelete(record.id)} danger>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="page-container">
      <h1>Stock</h1>
      <Button
        style={{ margin: 10 }}
        type="primary"
        onClick={() => showModal(null)}
      >
        Add Item
      </Button>
      <Spin spinning={loading}>
        <Table
          style={{ width: "90%" }}
          columns={columns}
          dataSource={items}
          rowKey="id"
        />
      </Spin>
      <Modal
        title={editingItem ? "Edit Item" : "Add Item"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
