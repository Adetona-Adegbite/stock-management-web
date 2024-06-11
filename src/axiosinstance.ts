import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://stock-management-backend.adaptable.app", // Your API base URL
});
// const axiosInstance = axios.create({
//   baseURL: "http://127.0.0.1:3000", // Your API base URL
// });

const handle401Error = () => {
  localStorage.removeItem("token"); // Clear the token from localStorage or any other storage
  window.location.href = "/login"; // Redirect to login page
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log(token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      handle401Error();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
