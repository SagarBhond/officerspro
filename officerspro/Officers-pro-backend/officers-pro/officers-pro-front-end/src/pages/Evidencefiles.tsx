import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import request from '../Service/axios_helper';
import Swal from 'sweetalert2';
import axios from 'axios';
import Loader from '../common/Loader';
import { useTranslation } from 'react-i18next';

type EvidencefilesProps = {
  handleLogout: () => void;
};

const Evidencefiles: React.FC<EvidencefilesProps> = ({ handleLogout }) => {
  const imagekey = import.meta.env.VITE_IMAGE_API;
  const { victimId } = useParams();
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [updateFileId, setUpdateFileId] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const { evidencefilepage } = t('breadcrumb');
  const { evidencename, download, update, confirmupdate, del } =
    t('evidencefile');

  useEffect(() => {
    if (victimId) fetchEvidenceFiles();
  }, [victimId]);

  const fetchEvidenceFiles = async () => {
    try {
      const response = await request(
        'cms',
        'GET',
        `/listOfEvidence/${victimId}`,
        {},
      );
      setEvidenceFiles(response);

      const fileMetadataList = response; // Adjust based on actual response structure

      const filePromises = fileMetadataList.map(
        async (fileMetadata: {
          evidenceFilePath: string;
          evidenceId: string;
          fileType: string;
        }) => {
          if (!fileMetadata.evidenceFilePath || !victimId) {
            console.error('Invalid file metadata or victim ID');
            return;
          }

          const fileUrl = await fetchFile(fileMetadata);
          setEvidenceFiles((prevState) =>
            prevState.map((file) =>
              file.evidenceId === fileMetadata.evidenceId
                ? { ...file, url: fileUrl }
                : file,
            ),
          );
        },
      );

      await Promise.all(filePromises);
    } catch (error) {
      console.error('Error fetching evidence files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFile = async (fileMetadata: { evidenceFilePath: string }) => {
    try {
      const sanitizedFilePath = encodeURIComponent(fileMetadata.evidenceFilePath.replace(/\\/g, '/'));
      const path = `${imagekey}?filePath=${sanitizedFilePath}`;     
      const response = await axios({
        url: path,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        method: 'GET',
        responseType: 'blob',
      });
      const blob = response.data;
      console.log('Blob received:', blob);

      const url = URL.createObjectURL(blob);
      console.log('Blob URL:', url);

      return url;
    } catch (error) {
      console.error(
        `Error fetching file: ${fileMetadata.evidenceFilePath}`,
        error,
      );
      return '';
    }
  };

  const handleDownload = async (path: string) => {
    const fileName = path.split(/[\\\/]/).pop() || '';

    try {
      const sanitizedFilePath = encodeURIComponent(path.replace(/\\/g, '/'));
      const filePath = `${imagekey}?filePath=${sanitizedFilePath}`;     
      const response = await axios({
        url: filePath,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        method: 'GET',
        responseType: 'blob',
      });
      const blob = response.data;
      const blobURL = window.URL.createObjectURL(blob);
      const aTag = document.createElement('a');
      aTag.href = blobURL;
      aTag.setAttribute('download', fileName);
      document.body.appendChild(aTag);
      aTag.click();
      document.body.removeChild(aTag);
      window.URL.revokeObjectURL(blobURL);

      console.log('File downloaded.');
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        await request('cms', 'DELETE', `/deleteEvidenceById/${evidenceId}`, {});
        console.log('Evidence deleted successfully.');
        fetchEvidenceFiles();
        Swal.fire({
          title: 'Deleted!',
          text: 'Evidence has been deleted.',
          icon: 'success',
        });
      }
    } catch (error) {
      console.error('Error deleting evidence:', error);
    }
  };

  const handleUpdateClicked = (fileId: string) => {
    setUpdateFileId(fileId);
  };

  const handleUpdateEvidence = async (evidenceId: string) => {
    if (!selectedFile || !evidenceId) {
      console.error('No file selected or no evidence ID provided.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await request(
        'cms',
        'PUT',
        `/updateEvidenceById/${evidenceId}`,
        formData,
      );

      if (response) {
        Swal.fire({
          title: 'Evidence updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
            fetchEvidenceFiles();
          }
        });

        setSelectedFile(null);
        setUpdateFileId(null);
      } else {
        throw new Error('Failed to update evidence:', response.statusText);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...not Updated',
        text: 'Something went wrong! Please try again later.',
      });
    }
  };

  const handleEvidenceNameChange = (
    newFile: File,
    oldFile: { evidenceFilePath: string },
  ) => {
    const parts = oldFile.evidenceFilePath.split(/[\\\/]/);
    const fileName = parts[parts.length - 1];

    const updatedFile = new File([newFile], fileName, { type: newFile.type });
    setSelectedFile(updatedFile);
  };

  const handleImageLoad = (fileKey: string) => {
    setImagesLoaded((prevState) => ({ ...prevState, [fileKey]: true }));
  };

  const renderFileIcon = (fileUrl: string, fileType: string) => {
    console.log(fileUrl);
    console.log(fileType);
    switch (fileType) {
      case 'image':
        return <img src={fileUrl} alt="Evidence" className="h-50 w-50" />;
      case 'pdf':
        return (
          <svg
            className="h-50 w-50"
            viewBox="-4 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {' '}
              <path
                d="M25.6686 26.0962C25.1812 26.2401 24.4656 26.2563 23.6984 26.145C22.875 26.0256 22.0351 25.7739 21.2096 25.403C22.6817 25.1888 23.8237 25.2548 24.8005 25.6009C25.0319 25.6829 25.412 25.9021 25.6686 26.0962ZM17.4552 24.7459C17.3953 24.7622 17.3363 24.7776 17.2776 24.7939C16.8815 24.9017 16.4961 25.0069 16.1247 25.1005L15.6239 25.2275C14.6165 25.4824 13.5865 25.7428 12.5692 26.0529C12.9558 25.1206 13.315 24.178 13.6667 23.2564C13.9271 22.5742 14.193 21.8773 14.468 21.1894C14.6075 21.4198 14.7531 21.6503 14.9046 21.8814C15.5948 22.9326 16.4624 23.9045 17.4552 24.7459ZM14.8927 14.2326C14.958 15.383 14.7098 16.4897 14.3457 17.5514C13.8972 16.2386 13.6882 14.7889 14.2489 13.6185C14.3927 13.3185 14.5105 13.1581 14.5869 13.0744C14.7049 13.2566 14.8601 13.6642 14.8927 14.2326ZM9.63347 28.8054C9.38148 29.2562 9.12426 29.6782 8.86063 30.0767C8.22442 31.0355 7.18393 32.0621 6.64941 32.0621C6.59681 32.0621 6.53316 32.0536 6.44015 31.9554C6.38028 31.8926 6.37069 31.8476 6.37359 31.7862C6.39161 31.4337 6.85867 30.8059 7.53527 30.2238C8.14939 29.6957 8.84352 29.2262 9.63347 28.8054ZM27.3706 26.1461C27.2889 24.9719 25.3123 24.2186 25.2928 24.2116C24.5287 23.9407 23.6986 23.8091 22.7552 23.8091C21.7453 23.8091 20.6565 23.9552 19.2582 24.2819C18.014 23.3999 16.9392 22.2957 16.1362 21.0733C15.7816 20.5332 15.4628 19.9941 15.1849 19.4675C15.8633 17.8454 16.4742 16.1013 16.3632 14.1479C16.2737 12.5816 15.5674 11.5295 14.6069 11.5295C13.948 11.5295 13.3807 12.0175 12.9194 12.9813C12.0965 14.6987 12.3128 16.8962 13.562 19.5184C13.1121 20.5751 12.6941 21.6706 12.2895 22.7311C11.7861 24.0498 11.2674 25.4103 10.6828 26.7045C9.04334 27.3532 7.69648 28.1399 6.57402 29.1057C5.8387 29.7373 4.95223 30.7028 4.90163 31.7107C4.87693 32.1854 5.03969 32.6207 5.37044 32.9695C5.72183 33.3398 6.16329 33.5348 6.6487 33.5354C8.25189 33.5354 9.79489 31.3327 10.0876 30.8909C10.6767 30.0029 11.2281 29.0124 11.7684 27.8699C13.1292 27.3781 14.5794 27.011 15.985 26.6562L16.4884 26.5283C16.8668 26.4321 17.2601 26.3257 17.6635 26.2153C18.0904 26.0999 18.5296 25.9802 18.976 25.8665C20.4193 26.7844 21.9714 27.3831 23.4851 27.6028C24.7601 27.7883 25.8924 27.6807 26.6589 27.2811C27.3486 26.9219 27.3866 26.3676 27.3706 26.1461ZM30.4755 36.2428C30.4755 38.3932 28.5802 38.5258 28.1978 38.5301H3.74486C1.60224 38.5301 1.47322 36.6218 1.46913 36.2428L1.46884 3.75642C1.46884 1.6039 3.36763 1.4734 3.74457 1.46908H20.263L20.2718 1.4778V7.92396C20.2718 9.21763 21.0539 11.6669 24.0158 11.6669H30.4203L30.4753 11.7218L30.4755 36.2428ZM28.9572 10.1976H24.0169C21.8749 10.1976 21.7453 8.29969 21.7424 7.92417V2.95307L28.9572 10.1976ZM31.9447 36.2428V11.1157L21.7424 0.871022V0.823357H21.6936L20.8742 0H3.74491C2.44954 0 0 0.785336 0 3.75711V36.2435C0 37.5427 0.782956 40 3.74491 40H28.2001C29.4952 39.9997 31.9447 39.2143 31.9447 36.2428Z"
                fill="#EB5757"
              ></path>{' '}
            </g>
          </svg>
        );
      case 'vid':
        return (
          <svg
            className="h-50 w-50 icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            fill="#000000"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M21.333329 405.333462l981.333129 0 0 597.333209-981.333129 0 0-597.333209Z"
                fill="#9FDBAD"
              ></path>
              <path
                d="M959.9998 426.666791a21.333329 21.333329 0 0 1 21.333329 21.333329v511.999893a21.333329 21.333329 0 0 1-21.333329 21.333329H63.999987a21.333329 21.333329 0 0 1-21.333329-21.333329V448.00012a21.333329 21.333329 0 0 1 21.333329-21.333329h895.999813m0-42.666658H63.999987a63.999987 63.999987 0 0 0-63.999987 63.999987v511.999893a63.999987 63.999987 0 0 0 63.999987 63.999987h895.999813a63.999987 63.999987 0 0 0 63.999987-63.999987V448.00012a63.999987 63.999987 0 0 0-63.999987-63.999987z"
                fill="#5C2D51"
              ></path>
              <path
                d="M66.986653 407.040129a15.999997 15.999997 0 0 1-15.359997-11.946665L21.333329 281.600155a15.999997 15.999997 0 0 1 11.519997-19.626663L951.679802 21.333542h4.053332a15.999997 15.999997 0 0 1 15.359997 11.946664l29.653327 113.49331a15.999997 15.999997 0 0 1-11.519997 19.626663L71.039985 406.613462z"
                fill="#FFFFFF"
              ></path>
              <path
                d="M951.893135 43.946871l27.093328 103.253312L70.826652 384.000133l-26.879994-102.613312L951.893135 43.946871M955.733134 0.000213a37.333326 37.333326 0 0 0-9.386664 1.28L27.946661 241.493496a37.333326 37.333326 0 0 0-26.666661 45.439991l29.653327 113.49331A37.333326 37.333326 0 0 0 76.373317 426.666791L994.986459 186.880174a37.333326 37.333326 0 0 0 26.666661-45.653323L991.999793 27.946874A37.333326 37.333326 0 0 0 955.733134 0.000213z"
                fill="#5C2D51"
              ></path>
              <path
                d="M177.493296 224.426833l78.933317-20.693329 9.173332 151.893302-78.933317 20.693329-9.173332-151.893302z"
                fill="#F05071"
              ></path>
              <path
                d="M236.799951 230.826832l6.399998 108.586644-36.906659 9.599998-6.399998-108.586644 36.906659-9.599998m39.466658-54.399989L155.306634 208.213503l11.519998 195.413293 120.959975-31.573327-11.519998-195.413292z"
                fill="#5C2D51"
              ></path>
              <path
                d="M369.919923 174.080177l78.933317-20.693329 8.959998 152.106635-78.933317 20.479996-8.959998-151.893302z"
                fill="#F05071"
              ></path>
              <path
                d="M429.013244 180.693509l6.399999 108.586644-36.693326 9.386665-6.399999-108.586644 36.906659-9.599998M469.333236 126.29352L347.519928 157.866847l11.519997 195.413293 120.959975-31.573327-10.666664-195.413293z"
                fill="#5C2D51"
              ></path>
              <path
                d="M562.133216 123.733521l78.933317-20.693329 9.173332 152.106635-79.146651 20.693329-8.959998-152.106635z"
                fill="#F05071"
              ></path>
              <path
                d="M621.439871 130.346853l6.399998 108.586644-36.906659 9.599998-6.399998-108.586644 36.906659-9.599998M661.333196 75.946864L539.946554 106.666858l11.519998 195.413292 120.959975-31.573326L661.333196 75.946864z"
                fill="#5C2D51"
              ></path>
              <path
                d="M754.559843 73.386865l78.719983-20.479996 9.173332 151.893302-78.933317 20.693329-8.959998-152.106635z"
                fill="#F05071"
              ></path>
              <path
                d="M813.653164 80.000197l6.399998 108.586644-36.906658 9.599998-6.399999-108.586644 36.906659-9.599998M853.333156 25.600208l-121.173309 31.573327 11.519998 195.413292 120.959975-31.573326L853.333156 25.600208z"
                fill="#5C2D51"
              ></path>
              <path
                d="M429.013244 842.026705a42.666658 42.666658 0 0 1-42.666658-42.666658v-189.866627a42.666658 42.666658 0 0 1 42.666658-42.666658 42.666658 42.666658 0 0 1 21.333329 5.759999l165.973299 94.933313a42.666658 42.666658 0 0 1 0 74.666651l-165.973299 94.079981a42.666658 42.666658 0 0 1-21.333329 5.759999z"
                fill="#FDCA89"
              ></path>
              <path
                d="M429.013244 587.306758a21.333329 21.333329 0 0 1 10.666664 2.986666l165.973299 94.933313a21.333329 21.333329 0 0 1 0 37.759992l-165.973299 94.933314a21.333329 21.333329 0 0 1-10.666664 2.986666 21.333329 21.333329 0 0 1-21.333329-21.333329v-189.866627a21.333329 21.333329 0 0 1 21.333329-21.333329m0-42.666658a63.999987 63.999987 0 0 0-63.999987 63.999987v189.866627a63.999987 63.999987 0 0 0 96.426647 55.893322l165.973299-94.933314a63.999987 63.999987 0 0 0 0-111.786643l-165.973299-94.933314a63.999987 63.999987 0 0 0-31.78666-8.533331z"
                fill="#5C2D51"
              ></path>
            </g>
          </svg>
        );
      case 'docx':
        return (
          <svg
            fill="#EB5757"
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            className="h-50 w-50"
            viewBox="0 0 548.291 548.291"
            stroke="#EB5757"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {' '}
              <g>
                {' '}
                <path d="M486.201,196.121h-13.166v-63.525c0-0.399-0.062-0.795-0.115-1.2c-0.021-2.522-0.825-5-2.552-6.96L364.657,3.675 c-0.033-0.031-0.064-0.042-0.085-0.073c-0.63-0.704-1.364-1.292-2.143-1.796c-0.229-0.157-0.461-0.286-0.702-0.419 c-0.672-0.365-1.387-0.672-2.121-0.893c-0.2-0.052-0.379-0.134-0.577-0.188C358.23,0.118,357.401,0,356.562,0H96.757 C84.894,0,75.256,9.649,75.256,21.502v174.613H62.092c-16.971,0-30.732,13.756-30.732,30.73v159.81 c0,16.966,13.761,30.736,30.732,30.736h13.164V526.79c0,11.854,9.638,21.501,21.501,21.501h354.776 c11.853,0,21.501-9.647,21.501-21.501V417.392h13.166c16.966,0,30.729-13.764,30.729-30.731v-159.81 C516.93,209.877,503.167,196.121,486.201,196.121z M96.757,21.507h249.054v110.006c0,5.94,4.817,10.751,10.751,10.751h94.972 v53.861H96.757V21.507z M367.547,335.847c7.843,0,16.547-1.701,21.666-3.759l3.916,20.301c-4.768,2.376-15.509,4.949-29.493,4.949 c-39.748,0-60.204-24.73-60.204-57.472c0-39.226,27.969-61.055,62.762-61.055c13.465,0,23.705,2.737,28.31,5.119l-5.285,20.64 c-5.287-2.226-12.615-4.263-21.832-4.263c-20.641,0-36.663,12.444-36.663,38.027C330.718,321.337,344.362,335.847,367.547,335.847z M291.647,296.97c0,37.685-22.854,60.537-56.444,60.537c-34.113,0-54.066-25.759-54.066-58.495 c0-34.447,21.995-60.206,55.94-60.206C272.39,238.806,291.647,265.248,291.647,296.97z M67.72,355.124V242.221 c9.552-1.532,21.999-2.375,35.13-2.375c21.83,0,35.981,3.916,47.055,12.276c11.945,8.863,19.455,23.021,19.455,43.311 c0,21.994-8.017,37.181-19.105,46.556c-12.111,10.058-30.528,14.841-53.045,14.841C83.749,356.825,74.198,355.968,67.72,355.124z M451.534,520.968H96.757V417.392h354.776V520.968z M471.245,355.627l-10.409-20.804c-4.263-8.012-6.992-13.99-10.231-20.636 h-0.342c-2.388,6.656-5.28,12.624-8.861,20.636l-9.552,20.804h-29.675l33.254-58.158l-32.054-56.786h29.849l10.058,20.984 c3.413,6.979,5.963,12.614,8.694,19.092h0.335c2.729-7.332,4.955-12.446,7.843-19.092l9.721-20.984h29.683l-32.406,56.103 l34.105,58.841H471.245z"></path>{' '}
                <path d="M141.729,296.277c0.165-23.869-13.814-36.494-36.15-36.494c-5.807,0-9.552,0.514-11.772,1.027v75.2 c2.226,0.509,5.806,0.509,9.047,0.509C126.388,336.698,141.729,323.743,141.729,296.277z"></path>{' '}
                <path d="M208.604,298.493c0,22.515,10.575,38.372,27.969,38.372c17.567,0,27.617-16.703,27.617-39.045 c0-20.641-9.885-38.377-27.801-38.377C218.827,259.448,208.604,276.162,208.604,298.493z"></path>{' '}
              </g>{' '}
            </g>
          </svg>
        );
      default:
        return <div>Unsupported file type</div>;
    }
  };

  if (isLoading) return <Loader />;

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={evidencefilepage} />
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ">
        <div className="box">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-around',
            }}
          >
            {evidenceFiles.map((file, index) => {
              return (
                <div
                  key={index}
                  style={{
                    flex: '0 0 calc(33.33% - 10px)',
                    margin: '5px',
                    textAlign: 'center',
                  }}
                >
                  <div className="flex justify-center">
                    {renderFileIcon(file.url, file.fileType)}
                  </div>

                  <label className="flex font-semibold justify-around m-3">
                    {evidencename} : {file.evidenceName}
                  </label>
                  <span className="flex justify-center m-3">
                    <button
                      className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                      onClick={() => handleDownload(file.evidenceFilePath)}
                    >
                      <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                        {download}
                      </span>
                    </button>
                    <button
                      className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                      onClick={() => handleUpdateClicked(file.evidenceId)}
                    >
                      <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                        {update}
                      </span>
                    </button>

                    <button
                      className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                      onClick={() => handleDeleteEvidence(file.evidenceId)}
                    >
                      <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                        {del}
                      </span>
                    </button>
                  </span>
                  {updateFileId === file.evidenceId && (
                    <div className="flex flex-col items-center justify-center m-3">
                      <input
                        type="file"
                        onChange={(e) =>
                          handleEvidenceNameChange(e.target.files[0], file)
                        }
                        className="w-full cursor-pointer rounded-lg border-[1.5px] mb-4 border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                      />

                      <button
                        onClick={() => handleUpdateEvidence(file.evidenceId)}
                        className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                      >
                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-graydark rounded-md group-hover:bg-opacity-0">
                          {confirmupdate}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Evidencefiles;
