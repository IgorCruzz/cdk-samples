import axios from 'axios';

const cognito = axios.create({
  baseURL: import.meta.env.VITE_COGNITO_URL,
});
