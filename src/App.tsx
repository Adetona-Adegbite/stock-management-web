import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  Navigate,
} from "react-router-dom";
import { Layout, Menu, message } from "antd";
import { StockPage } from "./pages/StockPage";
import { WaiterPage } from "./pages/WaiterPage";
import { TablePage } from "./pages/TablePage";
import OrdersPage from "./pages/OrdersPage";
import LoginPage from "./pages/LoginPage";

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    message.success("Logout successful");
  };

  return (
    <Router>
      <Layout className="layout">
        {isAuthenticated ? (
          <>
            <Header>
              <div className="logo" />
              <Menu theme="dark" mode="horizontal">
                <Menu.Item key="0">
                  <h1 style={{ fontSize: 20, marginTop: 18 }}>
                    Stock Management
                  </h1>
                </Menu.Item>
                <Menu.Item key="1">
                  <Link to="/">Stock</Link>
                </Menu.Item>
                <Menu.Item key="2">
                  <Link to="/waiters">Waiters</Link>
                </Menu.Item>
                <Menu.Item key="3">
                  <Link to="/tables">Tables</Link>
                </Menu.Item>
                <Menu.Item key="4">
                  <Link to="/orders">Orders</Link>
                </Menu.Item>
                <Menu.Item key="5" onClick={handleLogout}>
                  Logout
                </Menu.Item>
              </Menu>
            </Header>
            <Content
              style={{ padding: "0 50px", height: "calc(100vh - 134px)" }}
            >
              <div className="site-layout-content" style={{ height: "100%" }}>
                <Routes>
                  <Route path="/" Component={StockPage} />
                  <Route path="/waiters" Component={WaiterPage} />
                  <Route path="/tables" Component={TablePage} />
                  <Route path="/orders" Component={OrdersPage} />
                </Routes>
              </div>
            </Content>
            <Footer style={{ textAlign: "center" }}>
              Stock Management App ©2023
            </Footer>
          </>
        ) : (
          <Routes>
            <Route
              path="/login"
              Component={() => <LoginPage onLogin={handleLogin} />}
            />
            <Route path="*" Component={() => <Navigate to="/login" />} />
          </Routes>
        )}
      </Layout>
    </Router>
  );
};

export default App;
