import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface EvidenceProps {
  index: number;
  evidence: any;
  handleEvidenceChange: (e: any, index: number) => void;
  handleEvidenceDataChange: (files: File[], evidenceIndex: number) => void;
  removeEvidence: (index: number) => void;
  initialFiles?: File[];
  existingDocuments?: any[];
  onRemoveExistingDocument?: (evidenceIndex: number, docIndex: number) => void;
}

const Evidence = ({
  index,
  evidence,
  handleEvidenceChange,
  handleEvidenceDataChange,
  removeEvidence,
  initialFiles = [],
  existingDocuments = [],
  onRemoveExistingDocument,
}: EvidenceProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>(initialFiles);
  const [fileSizeError, setFileSizeError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [localExistingDocs, setLocalExistingDocs] = useState<any[]>(existingDocuments);
  const { t } = useTranslation();

  // Translation keys
  const evidencetype = t('evidence.evidencetype');
  const selectevidencetype = t('evidence.selectevidencetype');
  const physical = t('evidence.physical');
  const virtual = t('evidence.virtual');
  const medical = t('evidence.medical');
  const chemical = t('evidence.chemical');
  const panchanama = t('evidence.biological');
  const evidencename = t('evidence.evidencename');
  const evidencedesc = t('evidence.evidencedesc');
  const removeevidence = t('evidence.removeevidence');

  // File size limits in MB
  const FILE_SIZE_LIMITS: { [key: string]: number } = {
    'jpg': 5,
    'jpeg': 5,
    'png': 5,
    'gif': 5,
    'pdf': 10,
    'doc': 10,
    'docx': 10,
    'txt': 5,
    'mp4': 50,
    'avi': 50,
    'mov': 50,
    'xlsx': 10,
    'csv': 5,
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    let hasError = false;
    const validFiles: File[] = [];

    files.forEach((file) => {
      // Get file extension
      const extension = file.name.split('.').pop()?.toLowerCase() || '';

      // Check file size
      const maxSize = FILE_SIZE_LIMITS[extension] || 10; // Default 10MB
      const fileSizeMB = file.size / (1024 * 1024);

      if (fileSizeMB > maxSize) {
        setFileSizeError(`File "${file.name}" size exceeds ${maxSize}MB limit for ${extension.toUpperCase()} files`);
        hasError = true;
        return;
      }

      validFiles.push(file);
    });

    if (hasError) {
      setSelectedFiles([]);
      return;
    }

    setFileSizeError('');

    // Filter out duplicate files (same name and size)
    const uniqueValidFiles = validFiles.filter(newFile =>
      !selectedFiles.some(existingFile =>
        existingFile.name === newFile.name && existingFile.size === newFile.size
      )
    );

    // Add new files to existing files (accumulate)
    const allFiles = [...selectedFiles, ...uniqueValidFiles];
    setSelectedFiles(allFiles);

    // Pass all files to the parent handler
    handleEvidenceDataChange(allFiles, index);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Validate all files
    let hasError = false;
    const validFiles: File[] = [];

    files.forEach((file) => {
      // Get file extension
      const extension = file.name.split('.').pop()?.toLowerCase() || '';

      // Check file size
      const maxSize = FILE_SIZE_LIMITS[extension] || 10; // Default 10MB
      const fileSizeMB = file.size / (1024 * 1024);

      if (fileSizeMB > maxSize) {
        setFileSizeError(`File "${file.name}" size exceeds ${maxSize}MB limit for ${extension.toUpperCase()} files`);
        hasError = true;
        return;
      }

      validFiles.push(file);
    });

    if (hasError) {
      return;
    }

    setFileSizeError('');

    // Filter out duplicate files (same name and size)
    const uniqueValidFiles = validFiles.filter(newFile =>
      !selectedFiles.some(existingFile =>
        existingFile.name === newFile.name && existingFile.size === newFile.size
      )
    );

    // Add new files to existing files (accumulate)
    const allFiles = [...selectedFiles, ...uniqueValidFiles];
    setSelectedFiles(allFiles);

    // Pass all files to the parent handler
    handleEvidenceDataChange(allFiles, index);
  };

  const removeFile = (fileIndex: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== fileIndex);
    setSelectedFiles(updatedFiles);

    // Notify parent component of the file removal
    handleEvidenceDataChange(updatedFiles, index);
  };

  return (
    <div className="rounded-xl border-2 border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark my-6 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b-2 border-stroke dark:border-strokedark py-5 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary bg-opacity-10">
              <span className="text-xl font-bold text-primary">{index + 1}</span>
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white">
              Evidence Entry 
            </h3>
          </div>
          {index !== 0 && (
            <button
              type="button"
              onClick={() => removeEvidence(index)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-200 font-medium rounded-lg transition-all duration-200 border border-red-200 dark:border-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {removeevidence}
            </button>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8 space-y-6">
        {/* Evidence Type and File Upload Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Evidence Type */}
          <div className="space-y-2">
            <label
              htmlFor={`evidenceType_${index}`}
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              {evidencetype} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id={`evidenceType_${index}`}
                name="evidenceType"
                value={evidence[index].evidenceType}
                onChange={(e) => handleEvidenceChange(e, index)}
                className="w-full appearance-none rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3.5 px-4 pr-10 text-gray-900 dark:text-white font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
              >
                <option value="" className="text-gray-400">{selectevidencetype}</option>
                <option value="PHYSICAL">{physical}</option>
                <option value="DIGITAL">{virtual}</option>
                <option value="DOCUMENTARY">FIR Copy</option>
                <option value="CHEMICAL">{chemical}</option>
                <option value="FORENSIC">{medical}</option>
                <option value="BIOLOGICAL">{panchanama}</option>
                <option value="OTHER">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label
              htmlFor={`fileUpload_${index}`}
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Upload Evidence Files <span className="text-red-500">*</span>
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id={`fileUpload_${index}`}
                name="fileUpload"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-primary">Click to upload</span> or drag and drop
                </div>
                {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                  Support for multiple files • Max file sizes vary by type
                </p> */}
              </div>
            </div>

            {/* File Size Error */}
            {fileSizeError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{fileSizeError}</p>
              </div>
            )}

            {/* Existing Documents Display */}
            {localExistingDocs.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Existing Documents ({localExistingDocs.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {localExistingDocs.map((doc, docIndex) => (
                    <div key={docIndex} className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-600 rounded-md">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                            {doc.documentName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Previously uploaded
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          // Remove from local state
                          const updatedDocs = localExistingDocs.filter((_, i) => i !== docIndex);
                          setLocalExistingDocs(updatedDocs);
                          
                          // Notify parent if callback provided
                          if (onRemoveExistingDocument) {
                            onRemoveExistingDocument(index, docIndex);
                          }
                        }}
                        className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Remove this document"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File List Display */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Selected Files ({selectedFiles.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFiles([]);
                      handleEvidenceDataChange([], index);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedFiles.map((file, fileIndex) => (
                    <div key={fileIndex} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                            {file.name}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {file.name.split('.').pop()?.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(fileIndex)}
                        className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Evidence Name and Location Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Evidence Name */}
          <div className="space-y-2">
            <label
              htmlFor={`evidenceName_${index}`}
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              {evidencename} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={`evidenceName_${index}`}
              name="evidenceName"
              value={evidence[index].evidenceName}
              onChange={(e) => handleEvidenceChange(e, index)}
              className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3.5 px-4 text-gray-900 dark:text-white font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
            />
          </div>

          {/* Evidence Location */}
          <div className="space-y-2">
            <label
              htmlFor={`location_${index}`}
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Evidence Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={`location_${index}`}
              name="location"
              value={evidence[index].location || ''}
              onChange={(e) => handleEvidenceChange(e, index)}
              className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3.5 px-4 text-gray-900 dark:text-white font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
            />
          </div>
        </div>

        {/* Evidence Description - Full Width */}
        <div className="space-y-2">
          <label
            htmlFor={`description_${index}`}
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            {evidencedesc}
          </label>
          <textarea
            id={`description_${index}`}
            name="description"
            value={evidence[index].description}
            onChange={(e) => handleEvidenceChange(e, index)}
            rows={3}
            className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3.5 px-4 text-gray-900 dark:text-white font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default Evidence;
