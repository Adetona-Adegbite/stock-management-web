import React from "react";
import { Table, Spin } from "antd";

interface ReceiptProps {
  receiptLoading: boolean;
  receiptData: any[];
  receiptColumns: any[];
  calculateTotal: () => number;
  ref?: React.RefObject<HTMLDivElement>;
}

const Receipt: React.FC<ReceiptProps> = ({
  receiptLoading,
  receiptData,
  receiptColumns,
  calculateTotal,
  ref,
}) => {
  return (
    <div ref={ref}>
      <Spin spinning={receiptLoading}>
        <Table
          columns={receiptColumns}
          dataSource={receiptData}
          rowKey="id"
          pagination={false}
        />
        <div style={{ marginTop: "16px", textAlign: "right" }}>
          <strong>Total: ₦{calculateTotal()}</strong>
          <br />
          <span>Printed on: {new Date().toLocaleString()}</span>
        </div>
      </Spin>
    </div>
  );
};

export default Receipt;
