import axios, { AxiosRequestConfig } from 'axios';

const dashboard = import.meta.env.VITE_DASHBOARD_API;
const complaintandfir = import.meta.env.VITE_COMPLAINTANDFIR_API;
const investigation = import.meta.env.VITE_INVESTIGATION_API;
const support = import.meta.env.VITE_SUPPORT_API;
const ccms = import.meta.env.VITE_CCMS_API;
const documents = import.meta.env.VITE_DOCUMENT_API;

const documentApi = import.meta.env.VITE_DOCUMENT_API;
const chargesheetApi = import.meta.env.VITE_CHARGESHEET_API;

const ferrist = import.meta.env.VITE_FERRIST_API;

const baseURLs = {
  dashboard: dashboard,
  complaintandfir: complaintandfir,
  investigation: investigation,
  support: support,
  ccms: ccms,
  documents: documents,
  ferrist: ferrist,
  document: documentApi,
  chargesheet: chargesheetApi
};

const request = async (
  base:
    | 'dashboard'
    | 'complaintandfir'
    | 'investigation' 
    | 'ferrist' 
    | 'document' 
    | 'chargesheet'
    | 'support'
    | 'ccms'
    | 'documents',
  method: string,
  url: string,
  data: any,
  options: { skipAuth?: boolean; responseType?: 'blob' | 'json' | 'text' } = {},
): Promise<any> => {
  const headers: { [key: string]: string } = {};

  // Add authentication token if available and not skipped
  if (!options.skipAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Add cache control headers for GET requests to prevent caching
  if (method.toUpperCase() === 'GET') {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  }

  // Set content type
  if (data instanceof FormData) {
    console.log(
      '📦 FormData detected - letting browser set Content-Type with boundary',
    );
  } else if (method.toUpperCase() === 'DELETE') {
    // Don't send body for DELETE requests
    data = undefined;
  } else if (data !== null && typeof data === 'object' && Object.keys(data).length > 0) {
    headers['Content-Type'] = 'application/json';
    data = JSON.stringify(data);
  } else if (data !== null && typeof data === 'object') {
    // Empty object - don't send body
    data = undefined;
  }

  const fullUrl = baseURLs[base] + url;
  console.log(`Making ${method} request to:`, fullUrl);
  console.log('🔑 Headers being sent:', headers);

  const config: AxiosRequestConfig = {
    method,
    url: fullUrl,
    headers,
    data,
    responseType: options.responseType as any,
    validateStatus: (status) => status < 500,
  };

  try {
    console.log(`🌐 Sending ${method} request to ${fullUrl}...`);
    const response = await axios(config);

    // ✅ FIXED: Don't log response.data for blob responses (they're binary)
    if (options.responseType === 'blob') {
      console.log(
        `✅ Response from ${method} ${url}: ${response.status} (Blob, size: ${response.data.size} bytes)`
      );
    } else {
      console.log(
        `✅ Response from ${method} ${url}:`,
        response.status,
        response.data,
      );

      // Add better debug info for updates
      if (url.includes('/update') && method.toUpperCase() === 'PUT') {
        console.log('📝 UPDATE RESPONSE DETAILS:');
        console.log('- Status:', response.status);
        console.log('- Data:', response.data);
        console.log('- Headers:', response.headers);
      }
    }

    // ✅ PRODUCTION READY FIX: Return full response for blob, data only for others
    if (options.responseType === 'blob') {
      return response; // Full response object (status + data) for blob handling
    }
    return response.data; // Just data for JSON/text responses

  } catch (error: any) {
    console.error('❌ Request failed:', {
      method,
      url: fullUrl,
      status: error.response?.status,
      statusText: error.response?.statusText,
      error: error.message,
      response: error.response?.data,
    });

    // Add better debug info for update operations
    if (url.includes('/update') && method.toUpperCase() === 'PUT') {
      console.error('❌ UPDATE OPERATION FAILED:');
      console.error('- URL:', fullUrl);
      console.error('- Status:', error.response?.status);
      console.error('- Status Text:', error.response?.statusText);
      console.error('- Response Data:', error.response?.data);
      console.error('- Error Message:', error.message);
      console.error('- Headers Sent:', headers);

      if (error.response?.status === 400) {
        console.error(
          '❌ Bad Request (400): The server rejected the update due to invalid data format',
        );
      } else if (error.response?.status === 404) {
        console.error(
          '❌ Not Found (404): The resource being updated could not be found',
        );
      } else if (error.response?.status === 415) {
        console.error(
          '❌ Unsupported Media Type (415): The content type may be incorrect',
        );
      }
    }

    // Handle 403 Forbidden specifically
    if (error.response?.status === 403) {
      console.error(
        '❌ Access denied (403). You may need to log in or refresh your session.',
      );
    }

    throw error;
  }
};

export default request;
