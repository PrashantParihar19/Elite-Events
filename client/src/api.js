import axios from 'axios';

const API = axios.create({
  // This pulls your ngrok link from the .env file
  baseURL: import.meta.env.VITE_API_URL, 
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true' // This bypasses the ngrok warning screen
  }
});

// 🎯 THE MAGIC PART: Attach the token automatically
API.interceptors.request.use((config) => {
  const eliteUser = JSON.parse(localStorage.getItem('eliteUser'));
  
  // If the user is logged in, attach their token to the "Authorization" header
  if (eliteUser && eliteUser.token) {
    config.headers.Authorization = `Bearer ${eliteUser.token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;