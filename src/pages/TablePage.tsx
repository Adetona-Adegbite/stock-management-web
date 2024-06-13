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
import axiosInstance from "../axiosinstance";
import Receipt from "../components/Reciept";

export interface TableData {
  id: number;
  number: number;
  waiterId: number;
  name: string;
  cleared: boolean;
}

export interface Waiter {
  id: number;
  name: string;
}

export interface Item {
  id: number;
  name: string;
  quantity: number;
  price?: number;
}

export interface Order {
  id: number;
  tableId: number;
  itemName: string;
  quantity: number;
}

export const TablePage: React.FC = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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
    const response = await axiosInstance.get<TableData[]>("tables");
    setTables(response.data);
    setLoading(false);
  };

  const fetchWaiters = async () => {
    setLoading(true);
    const response = await axiosInstance.get<Waiter[]>("waiters");
    setWaiters(response.data);
    setLoading(false);
  };

  const fetchItems = async () => {
    setLoading(true);
    const response = await axiosInstance.get<Item[]>("stock");
    setItems(response.data);
    setLoading(false);
  };

  const fetchOrders = async (tableId: number) => {
    setLoading(true);
    const response = await axiosInstance.get<Order[]>(`table-items/${tableId}`);
    setOrders((prevOrders) => ({
      ...prevOrders,
      [tableId]: response.data,
    }));
    console.log(response.data);

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
        await axiosInstance.post("add-to-table", {
          tableId: selectedTableId,
          itemId: values.itemId,
          quantity: values.quantity,
        });
        setIsAddItemModalVisible(false);
        fetchOrders(selectedTableId);
      } catch (e: any) {
        message.error(`Error:  ${e.response.data}`);
      }
    }
  };

  const showAddItemModal = (tableId: number) => {
    setSelectedTableId(tableId);
    setIsAddItemModalVisible(true);
    addItemForm.resetFields();
  };

  const handleClearTable = async (tableId: number) => {
    try {
      await axiosInstance.put(`clear-table/${tableId}`);
      fetchTables();
      message.success("Table cleared successfully");
    } catch (e: any) {
      message.error(`Error: ${e.response.data}`);
    }
  };

  const handlePrintReceipt = (tableId: number) => {
    // console.log(orders, waiters, tables);
    console.log(tableId);
    console.log(tables);

    const table = tables.find((t) => t.id === tableId);
    const waiter = waiters.find((w) => w.id === table?.waiterId);

    // Flatten orders if it contains nested arrays

    const tableOrders = orders[table?.id];
    console.log(table);
    console.log(orders);

    console.log(tableOrders);

    console.log(waiters);

    // console.log(table);
    // console.log(orders);

    // console.log(tableOrders);

    Modal.confirm({
      title: `Print Receipt for Table ${table?.number}`,
      content: (
        <Receipt
          table={table!}
          orders={tableOrders}
          items={items}
          waiter={waiter!} // Ensure waiter is not undefined
        />
      ),
      okText: "Print",
      cancelText: "Cancel",
      onOk() {
        window.print();
      },
    });
  };

  const handleDeleteItem = async (orderId: number) => {
    try {
      await axiosInstance.delete(`delete-order/${orderId}`);
      if (selectedTableId !== null) fetchOrders(selectedTableId);
      message.success("Item deleted successfully");
    } catch (e: any) {
      console.log(e);

      message.error(`Error: ${e.response.data.error}`);
    }
  };

  const expandedRowRender = (table: TableData) => {
    const tableOrders = orders[table.id] || [];
    // console.log(tableOrders);

    const orderColumns = [
      { title: "Item", dataIndex: "itemname", key: "itemName" },
      { title: "Quantity", dataIndex: "quantity", key: "quantity" },
      {
        title: "Actions",
        key: "actions",
        render: (_text: string, record: Order) => (
          <Button
            onClick={() => handleDeleteItem(record.id)}
            type="primary"
            danger
          >
            Delete
          </Button>
        ),
      },
    ];
    return (
      <Table
        columns={orderColumns}
        dataSource={tableOrders}
        pagination={false}
        rowKey="id"
      />
    );
  };

  const columns = [
    { title: "Number", dataIndex: "number", key: "number" },
    { title: "Waiter", dataIndex: "name", key: "waiterId" },
    {
      title: "Cleared",
      dataIndex: "cleared",
      key: "cleared",
      render: (cleared: boolean) => (cleared ? "Yes" : "No"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_text: string, record: TableData) => (
        <span>
          <Button
            onClick={() => showAddItemModal(record.id)} // Pass tableId instead of tableNumber
            style={{ marginRight: 10 }}
          >
            Add Items
          </Button>
          <Button
            onClick={() => handleClearTable(record.id)}
            type="primary"
            danger
            style={{ marginRight: 10 }}
          >
            Clear Table
          </Button>
          <Button onClick={() => handlePrintReceipt(record.id)}>
            Print Receipt
          </Button>
        </span>
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
          expandable={{
            expandedRowRender,
            onExpand: (expanded, record) => {
              if (expanded) fetchOrders(record.id);
            },
          }}
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
