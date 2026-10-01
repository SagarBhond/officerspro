import axios, { AxiosRequestConfig } from 'axios';

const admin = import.meta.env.VITE_ADMIN_API;
const cms = import.meta.env.VITE_CMS_API;

const baseURLs = {
  admin: admin,
  cms: cms,
};

const request = async (
  base: 'admin' | 'cms',
  method: string,
  url: string,
  data: any
): Promise<any> => {
  const headers: { [key: string]: string } = {};

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let contentType: string;
  if (data instanceof FormData) {
    contentType = 'multipart/form-data';
  } else {
    contentType = 'application/json';
  }

  headers['Content-Type'] = contentType;

  const config: AxiosRequestConfig = {
    method,
    url: baseURLs[base] + url,
    headers,
    data,
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
};

export default request;