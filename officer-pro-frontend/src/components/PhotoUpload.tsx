import React, { useRef, useState, useEffect } from 'react';

interface PhotoUploadProps {
  onFileSelect: (file: File | null, index?: number) => void;
  currentFile?: File | null;
  existingPath?: string;   // ✅ Show saved path if exists
  label: string;
  accept?: string;
  index?: number;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onFileSelect,
  currentFile,
  existingPath,
  label,
  accept = "image/*",
  index = 0,
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update refreshKey when currentFile changes to force re-render of preview
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [currentFile]);

  const startCameraCapture = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
      setIsCapturing(false);
    }
  };

  const stopCameraCapture = () => {
    setIsCapturing(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera_capture_${Date.now()}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });

            onFileSelect(file, index);
          }
        }, 'image/jpeg', 0.9);
      }
    }
    stopCameraCapture();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size too large. Please select a file smaller than 10MB.');
        return;
      }
      onFileSelect(file, index);
    }
  };

  const removeFile = () => {
    onFileSelect(null, index);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setRefreshKey(prev => prev + 1);
  };

  // Handle currentFile prop safely
  const safeCurrentFile = currentFile || null;

  return (
    <div className="space-y-4">
      <label className="mb-3 block text-black dark:text-white">
        {label}
      </label>

      {/* Camera Capture Modal */}
      {isCapturing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-md w-full mx-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover rounded"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex justify-between mt-4">
              <button
                onClick={stopCameraCapture}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Input and Camera Button */}
      <div className="space-y-2">
        <div className="flex space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
          />
          <button
            type="button"
            onClick={startCameraCapture}
            className="px-2 py-1 sm:px-3 sm:py-2 text-blue-500 hover:text-blue-700 text-base sm:text-lg flex items-center gap-1 transition-colors min-w-[44px] sm:min-w-[48px]"
            title="Open Camera"
          >
            📷
          </button>
        </div>

        {/* Show filename only - no preview */}
        {safeCurrentFile && (
          <div className="relative" key={refreshKey}>
            <div className="px-2 justify-between w-full flex rounded-lg border-[1.5px] border-stroke bg-transparent py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
              <div className="mr-2 flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                📎 {safeCurrentFile.name}
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-all duration-200 flex items-center justify-center"
                title="Remove File"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Size: {(safeCurrentFile.size / 1024).toFixed(1)} KB
            </div>
          </div>
        )}

        {/* Show existing path if no current file but existingPath provided */}
        {existingPath && !safeCurrentFile && (
          <div className="px-2 justify-between w-full flex rounded-lg border-[1.5px] border-stroke bg-transparent py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
            <div className="mr-2 flex-grow overflow-hidden text-ellipsis whitespace-nowrap text-green-600">
              📁 {existingPath.split('/').pop()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;
