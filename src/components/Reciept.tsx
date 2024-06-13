import React from "react";
import { Table } from "antd";
import { TableData, Waiter, Item, Order } from "../pages/TablePage"; // Adjust the import path if needed

interface ReceiptProps {
  table: TableData;
  orders: Order[];
  items: Item[];
  waiter: Waiter;
}

const Receipt: React.FC<ReceiptProps> = ({ table, orders, items, waiter }) => {
  console.log(table, orders, items, waiter);

  const total = orders.reduce((sum, order) => {
    const item = items.find((i) => i.id === order.id);
    console.log("total", item);

    return sum + (item ? item.price * order.quantity : 0);
  }, 0);

  const columns = [
    { title: "Item", dataIndex: "itemname", key: "itemName" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Unit Price",
      key: "price",
      render: (_: any, order: Order) => {
        const item = items.find((i) => i.id === order.id);
        return item ? item.price : 0;
      },
    },
    {
      title: "Total",
      key: "total",
      render: (_: any, order: Order) => {
        const item = items.find((i) => i.id === order.id);
        return item ? item.price * order.quantity : 0;
      },
    },
  ];

  return (
    <div>
      <h1>Receipt</h1>
      <p>Table Number: {table.number}</p>
      <p>Waiter: {table.name}</p>
      <p>Date: {new Date().toLocaleString()}</p>
      <Table
        dataSource={orders}
        columns={columns}
        pagination={false}
        rowKey="id"
      />
      <p>Total: {total}</p>
    </div>
  );
};

export default Receipt;
