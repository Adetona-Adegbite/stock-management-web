import React, { useState, useEffect, useRef } from "react";
import { Table, Button, Modal, Form, Select, Spin } from "antd";
import axiosInstance from "../axiosinstance.ts";
import { useReactToPrint } from "react-to-print";
import "./pages.css";

const { Option } = Select;

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [receiptData, setReceiptData] = useState<any[]>({
    items: [],
    total: 0,
    printedDate: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [receiptLoading, setReceiptLoading] = useState<boolean>(false);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTables();
    fetchOrders();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("tables");
      setTables(response.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
    setLoading(false);
  };

  const showPrintModal = () => {
    setIsModalVisible(true);
    setSelectedTable(null);
    setReceiptData({ items: [], total: 0, printedDate: "" });
  };

  const handleTableSelect = async (tableId: number) => {
    setReceiptLoading(true);
    try {
      const response = await axiosInstance.get(`orders/${tableId}`);
      const total = calculateTotal(response.data);
      setReceiptData({
        items: response.data,
        total,
        printedDate: new Date().toLocaleString(),
      });
    } catch (error) {
      console.error("Error fetching receipt data:", error);
    } finally {
      setReceiptLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    documentTitle: `
       Total: ₦${receiptData.total}
      `,
    content: () => componentRef.current,
    onAfterPrint: async () => {
      if (selectedTable !== null) {
        await axiosInstance.delete(`clear-table/${selectedTable}`);
        fetchOrders();
        setIsModalVisible(false);
      }
    },
  });

  const columns = [
    { title: "Table Number", dataIndex: "tablenumber", key: "tableNumber" },
    { title: "Item Name", dataIndex: "itemname", key: "itemName" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Waiter Name", dataIndex: "waitername", key: "waiterName" },
    { title: "Order Time", dataIndex: "ordertime", key: "orderTime" },
  ];

  const receiptColumns = [
    { title: "Item Name", dataIndex: "itemname", key: "itemName" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Unit Price", dataIndex: "price", key: "price" },
    { title: "Waiter Name", dataIndex: "waitername", key: "waiterName" },
    { title: "Order Time", dataIndex: "ordertime", key: "orderTime" },
  ];

  const calculateTotal = (data: any[]) => {
    return data.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  return (
    <div className="page-container">
      <h1>Orders</h1>
      <Button style={{ margin: 10 }} type="primary" onClick={showPrintModal}>
        Print Table Receipt
      </Button>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={orders} rowKey="id" />
      </Spin>
      <Modal
        title="Print Table Receipt"
        visible={isModalVisible}
        onOk={handlePrint}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="Select Table">
            <Select
              onChange={(value: number) => {
                console.log(value);

                setSelectedTable(value);
                handleTableSelect(value);
              }}
              value={selectedTable}
            >
              {tables.map((table) => (
                <Option key={table.id} value={table.id}>
                  Table {table.number}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <div ref={componentRef}>
            <Spin spinning={receiptLoading}>
              <Table
                columns={receiptColumns}
                dataSource={receiptData.items}
                rowKey="id"
                pagination={false}
              />
              <div style={{ marginTop: "16px", textAlign: "right" }}>
                <strong>Total: ₦{receiptData.total}</strong>
                <br />
                <span>Printed on: {receiptData.printedDate}</span>
              </div>
            </Spin>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default OrdersPage;
