import axios from "axios";

const AxiosInstance = axios.create({
  baseURL: "https://r-production-7684.up.railway.app/api", // The base URL for all API requests
  timeout: 300000, // Default timeout for requests (in milliseconds)
  headers: {
    "Content-Type": "application/json", // Default headers for requests
  },
});

// Enable sending cookies with requests

// Export the AxiosInstance so it can be used elsewhere
export default AxiosInstance;
