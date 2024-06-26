import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import "./pages.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosinstance";

interface LoginProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("login", values);
      console.log(response.data);

      localStorage.setItem("token", response.data.accessToken);
      message.success("Login successful");
      navigate("/");
      onLogin();
    } catch (error) {
      console.log(error);

      message.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="page-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Form onFinish={handleLogin} style={{ width: 500 }}>
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ width: "100%" }}
          >
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
