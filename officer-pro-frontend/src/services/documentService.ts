import request from '../Service/axios_helper';

/**
 * Document Service - Handles file access using ONLY signed URLs
 * No download API is used - files are accessed directly from S3 via signed URLs
 */

interface SignedUrlResponse {
  documentId: number;
  signedUrl: string;
  expiresInMinutes: number;
}

/**
 * Get a signed URL for a document by its ID
 * This is the ONLY method to access files - no download API needed
 * @param documentId - The document ID
 * @returns Signed URL response with expiration time (30 minutes)
 */
export const getSignedUrl = async (documentId: number): Promise<SignedUrlResponse> => {
  try {
    console.log(`📄 Getting signed URL for document ID: ${documentId}`);
    const response = await request('documents', 'GET', `/${documentId}/signed-url`, null);
    const data = response.data || response;
    console.log(`✅ Signed URL obtained, expires in ${data.expiresInMinutes} minutes`);
    return data;
  } catch (error) {
    console.error('❌ Error getting signed URL:', error);
    throw error;
  }
};

/**
 * Get the direct signed URL string for a document
 * Use this when you just need the URL (e.g., for <img src> or window.open)
 * @param documentId - The document ID
 * @returns Direct S3 signed URL string
 */
export const getSignedUrlString = async (documentId: number): Promise<string> => {
  try {
    const { signedUrl } = await getSignedUrl(documentId);
    return signedUrl;
  } catch (error) {
    console.error('❌ Error getting signed URL string:', error);
    throw error;
  }
};

/**
 * Download a file as a blob using signed URL
 * The file is downloaded directly from S3, not through your backend
 * @param documentId - The document ID
 * @returns Blob of the file
 */
export const downloadFile = async (documentId: number): Promise<Blob> => {
  try {
    console.log(`📥 Downloading file for document ID: ${documentId}`);
    
    // Get signed URL from backend
    const { signedUrl } = await getSignedUrl(documentId);
    
    // Download file directly from S3 using signed URL (no auth needed)
    const response = await fetch(signedUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download file from S3: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log(`✅ File downloaded successfully, size: ${blob.size} bytes`);
    return blob;
  } catch (error) {
    console.error('❌ Error downloading file:', error);
    throw error;
  }
};

/**
 * Get an object URL for displaying a file (e.g., in <img> tag)
 * Downloads the file from S3 and creates a local object URL
 * @param documentId - The document ID
 * @returns Object URL for the file (remember to revoke when done)
 */
export const getFileObjectUrl = async (documentId: number): Promise<string> => {
  try {
    const blob = await downloadFile(documentId);
    const objectUrl = URL.createObjectURL(blob);
    console.log(`✅ Object URL created: ${objectUrl}`);
    return objectUrl;
  } catch (error) {
    console.error('❌ Error creating object URL:', error);
    throw error;
  }
};

/**
 * Open a file in a new browser tab
 * Uses signed URL to open the file directly from S3
 * @param documentId - The document ID
 */
export const openFileInNewTab = async (documentId: number): Promise<void> => {
  try {
    const signedUrl = await getSignedUrlString(documentId);
    window.open(signedUrl, '_blank', 'noopener,noreferrer');
    console.log(`✅ File opened in new tab`);
  } catch (error) {
    console.error('❌ Error opening file:', error);
    throw error;
  }
};

/**
 * Download a file and trigger browser download
 * @param documentId - The document ID
 * @param fileName - Optional custom filename for download
 */
export const triggerFileDownload = async (documentId: number, fileName?: string): Promise<void> => {
  try {
    const blob = await downloadFile(documentId);
    const url = URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || `document_${documentId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
    console.log(`✅ File download triggered`);
  } catch (error) {
    console.error('❌ Error triggering download:', error);
    throw error;
  }
};

export default {
  getSignedUrl,
  getSignedUrlString,
  downloadFile,
  getFileObjectUrl,
  openFileInNewTab,
  triggerFileDownload,
};
