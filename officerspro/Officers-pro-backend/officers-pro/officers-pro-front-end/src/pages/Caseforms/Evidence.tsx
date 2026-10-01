import { useTranslation } from 'react-i18next';

const Evidence = ({
  index,
  evidence,
  handleEvidenceChange,
  handleEvidenceDataChange,
  removeEvidence,
}) => {
  const { t } = useTranslation();
  const {
    evidenceno,
    evidencetype,
    selectevidencetype,
    physical,
    virtual,
    medical,
    fircopy,
    chemical,
    panchanama,
    selectfiletype,
    image,
    video,
    pdf,
    docx,
    evidencename,
    evidencedesc,
    filetype,
    uploadimage,
    uploadvideo,
    uploadpdf,
    uploaddocx,
    removeevidence,
  } = t('evidence');

  const renderFileInput = () => {
    switch (evidence[index].fileType) {
      case 'image':
        return (
          <div className="col-md-6">
            <label
              htmlFor={`evidenceData_${index}`}
              className="mb-3 block text-black dark:text-white font-semibold"
            >
              {uploadimage} :
            </label>
            <input
              type="file"
              id={`evidenceData_${index}`}
              name="evidenceData"
              onChange={(e) =>
                handleEvidenceDataChange(
                  e.target.files[0],
                  evidence[index].evidenceName,
                )
              }
              accept="image/*"
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
            />
          </div>
        );
      case 'pdf':
        return (
          <div className="col-md-6">
            <label
              htmlFor={`evidenceData_${index}`}
              className="mb-3 block text-black dark:text-white font-semibold"
            >
              {uploadpdf} :
            </label>
            <input
              type="file"
              id={`evidenceData_${index}`}
              name="evidenceData"
              onChange={(e) =>
                handleEvidenceDataChange(
                  e.target.files[0],
                  evidence[index].evidenceName,
                )
              }
              accept=".pdf"
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
            />
          </div>
        );
      case 'docx':
        return (
          <div className="col-md-6">
            <label
              htmlFor={`evidenceData_${index}`}
              className="mb-3 block text-black dark:text-white font-semibold"
            >
              {uploaddocx} :
            </label>
            <input
              type="file"
              id={`evidenceData_${index}`}
              name="evidenceData"
              onChange={(e) =>
                handleEvidenceDataChange(
                  e.target.files[0],
                  evidence[index].evidenceName,
                )
              }
              accept=".docx, .txt, .xlsx, .csv, .doc"
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
            />
          </div>
        );
      case 'vid':
        return (
          <div className="col-md-6">
            <label
              htmlFor={`evidenceData_${index}`}
              className="mb-3 block text-black dark:text-white font-semibold"
            >
              {uploadvideo} :
            </label>
            <input
              type="file"
              id={`evidenceData_${index}`}
              name="evidenceData"
              onChange={(e) =>
                handleEvidenceDataChange(
                  e.target.files[0],
                  evidence[index].evidenceName,
                )
              }
              accept="video/*"
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-3">
        <h4 className="text-xl text-black dark:text-white font-semibold  p-3 ">
          {evidenceno}
          {` ${index + 1}`}
        </h4>
        <div className="grid grid-cols-2 gap-4 px-8 pb-2 pt-8">
          <div className="col-md-6">
            <label
              htmlFor="evidenceType"
              className="mb-3 block text-black dark:text-white font-semibold"
            >
              {evidencetype} :
            </label>
            <select
              id="evidenceType"
              name="evidenceType"
              value={evidence[index].evidenceType}
              onChange={(e) => handleEvidenceChange(e, index)}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="" disabled>
                {selectevidencetype}
              </option>
              <option value="भौतिक पुरावा">{physical}</option>
              <option value="आभासी पुरावा">{virtual}</option>
              <option value="एफआयआर प्रतिलिपी">{fircopy}</option>
              <option value="रासायनिक विश्लेषण">{chemical}</option>
              <option value="वैद्यकीय अहवाल">{medical}</option>
              <option value="पंचनामा">{panchanama}</option>
            </select>
          </div>
          <div className="col-md-6">
            <label
              htmlFor="fileType"
              className="mb-3 block text-black dark:text-white font-semibold"
            >
              {filetype} :
            </label>
            <select
              id="fileType"
              name="fileType"
              value={evidence[index].fileType}
              onChange={(e) => handleEvidenceChange(e, index)}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="" disabled>
                {selectfiletype}
              </option>
              <option value="image">{image}</option>
              <option value="pdf">{pdf}</option>
              <option value="docx">{docx}</option>
              <option value="vid">{video}</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 px-8 pb-2">
          <div className="col-md-6">
            <label
              htmlFor="evidenceName"
              className="mb-3 block text-black dark:text-white font-semibold"
            >
              {evidencename} :
            </label>
            <input
              type="text"
              id={`evidenceName_${index}`}
              name="evidenceName"
              value={evidence[index].evidenceName}
              onChange={(e) => handleEvidenceChange(e, index)}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="row">{renderFileInput()}</div>
        </div>
        <div className="grid grid-cols-1 gap-4 px-8 pb-2">
          <div className="col-md-6">
            <label
              htmlFor="evidenceDescription"
              className="mb-3 block text-black dark:text-white font-semibold"
            >
              {evidencedesc} :
            </label>
            <input
              type="text"
              id={`description_${index}`}
              name="description"
              value={evidence[index].description}
              onChange={(e) => handleEvidenceChange(e, index)}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        {index !== 0 && (
          <button
            type="button"
            onClick={() => removeEvidence(index)}
            className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            {removeevidence}
          </button>
        )}
      </div>
    </div>
  );
};

export default Evidence;
