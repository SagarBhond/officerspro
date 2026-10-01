import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import Pagination from './Pagination';
import request from '../Service/axios_helper';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

let PageSize = 5;

type ViewwitnesscaseProps = {
  handleLogout: () => void;
};

const Viewwitnesscase: React.FC<ViewwitnesscaseProps> = ({ handleLogout }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState([{}]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState({});
  const { t } = useTranslation();
  const {
    index,
    shortdesc,
    victimname,
    offendername,
    firno,
    reportdate,
    section,
    search,
    viewwitnesses,
    addwitness,
    norecords,
  } = t('table');
  const { viewwitnesscase } = t('breadcrumb');

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const normalizeText = (text) => {
    // Normalize text to NFC form and convert to lowercase for case-insensitive comparison
    return text ? text.normalize('NFC').toLowerCase() : '';
  };

  const filteredCases = cases.filter((item) => {
    const normalizedQuery = normalizeText(searchQuery);

    return (
      normalizeText(item?.victimName).includes(normalizedQuery) ||
      normalizeText(item?.offenderName).includes(normalizedQuery) ||
      normalizeText(item?.firNo).includes(normalizedQuery) ||
      normalizeText(item?.shortDescription).includes(normalizedQuery)
    );
  });

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return filteredCases.slice(firstPageIndex, lastPageIndex); // Use filteredCases here
  }, [currentPage, filteredCases]);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = () => {
    request('dashboard', 'GET', '/all', {})
      .then((res) => {
        const reversedCases = res.reverse();
        const registeredCases = reversedCases.filter(
          (caseItem: any) => caseItem.firNo !== null,
        );
        const inProgressCases = registeredCases.filter(
          (caseItem: any) => caseItem.caseStatus === 'in progress',
        );
        const recentInProgressCases = inProgressCases;
        setCases(recentInProgressCases);
        console.log(recentInProgressCases);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  function handleWitnessClick(victimId: any): void {
    navigate(`/witness/${victimId}`);
  }

  function handleViewwitnessClick(victimId: any): void {
    navigate(`/viewwitness/${victimId}`);
  }

  const toggleDetails = (index) => {
    setIsOpen((prevOpen) => ({
      ...prevOpen,
      [index]: !prevOpen[index],
    }));
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={viewwitnesscase} />
      <div className="Searchbar pt-2 relative mx-auto text-gray-600 flex flex-row justify-end items-center gap-4 my-6 ">
        <form className="form relative h-fit ">
          <button className="absolute left-2 -translate-y-1/2 top-1/2 p-1">
            <svg
              width="17"
              height="16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-labelledby="search"
              className="w-5 h-5 text-gray-700"
            >
              <path
                d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                stroke="currentColor"
                stroke-width="1.333"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </button>
          <input
            class="input rounded-full px-8 py-3 border-2 border-transparent focus:outline-none focus:border-blue-500 shadow-md dark:bg-boxdark focus:duration-300"
            type="text"
            placeholder={search}
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          <button
            type="reset"
            className="absolute right-3 -translate-y-1/2 top-1/2 p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </form>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ">
        <div className="max-w-full overflow-x-auto hidden lg:block">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-lightcyan text-left dark:bg-meta-4">
                <th className=" py-4 px-4 font-medium text-black dark:text-white ">
                  {index}
                </th>
                <th className=" py-4 px-4 font-medium text-black dark:text-white ">
                  {victimname}
                </th>
                <th className=" py-4 px-4 font-medium text-black dark:text-white ">
                  {offendername}
                </th>
                <th className=" py-4 px-4 font-medium text-black dark:text-white ">
                  {firno}
                </th>
                <th className=" py-4 px-4 font-medium text-black dark:text-white">
                  {reportdate}
                </th>
                <th className=" py-4 px-4 font-medium text-black dark:text-white">
                  {section}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {shortdesc}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {viewwitnesses}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {addwitness}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTableData.length > 0 ? (
                currentTableData.map((item, index) => (
                  <tr key={index}>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {(currentPage - 1) * PageSize + index + 1}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.victimName}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.offenderName}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.firNo}</p>
                    </td>

                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {new Date(item.created_on).toLocaleString('mr-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          weekday: 'long',
                        })}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.sectionId}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.shortDescription ? item.shortDescription : 'N/A'}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <button
                        className="hover:text-primary"
                        onClick={() => handleViewwitnessClick(item.victimId)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          width="30"
                          height="30"
                          viewBox="0 0 64 64"
                          className="fill-current"
                        >
                          <g>
                            <path
                              d="M63 17c0-2.206-1.794-4-4-4-.732 0-1.409.212-2 .556V9c0-2.206-1.794-4-4-4-.732 0-1.409.212-2 .556V5c0-2.206-1.794-4-4-4s-4 1.794-4 4v.556A3.959 3.959 0 0 0 41 5c-2.206 0-4 1.794-4 4v14.111a7.013 7.013 0 0 0-2-1.425V3c0-1.103-.897-2-2-2H3c-1.103 0-2 .897-2 2v22c0 1.103.897 2 2 2h15.382l2.382 4.764a2.223 2.223 0 0 0 2 1.236A2.238 2.238 0 0 0 25 30.764V27h4v3.781A25.93 25.93 0 0 0 32.631 44H17v-3c1.103 0 2-.897 2-2v-4c0-1.103-.897-2-2-2H3c-1.103 0-2 .897-2 2v4c0 1.103.897 2 2 2v14c-1.103 0-2 .897-2 2v4c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-4c0-1.103-.897-2-2-2v-3h18v11h24V47.282a24.73 24.73 0 0 0 4-13.492zm-40 8v5.764c0 .221-.349.304-.447.105L19.618 25H3V3h30v18.08a7.026 7.026 0 0 0-1-.08c-1.654 0-3 1.346-3 3v1zM3 35h14l.001 4H3zm14.001 26H3v-4h14zM5 55V41h10v14zm12-5v-4h16.949A25.4 25.4 0 0 0 35 47.342V50zm20 11V47.999L57 48v13zm24-27.211c0 4.343-1.223 8.553-3.542 12.211l-20.992-.001A23.935 23.935 0 0 1 31 30.781V24c0-.552.449-1 1-1 2.757 0 5 2.243 5 5v6h2V9c0-1.103.897-2 2-2s2 .897 2 2v19.304h2V5c0-1.103.897-2 2-2s2 .897 2 2v23h2V9c0-1.103.897-2 2-2s2 .897 2 2v19h2V17c0-1.103.897-2 2-2s2 .897 2 2z"
                              fill=""
                            ></path>
                            <path
                              d="M21 17c0 1.103.897 2 2 2h6c1.103 0 2-.897 2-2v-3.303L26.535 7H19V5h-2v2H9.465L5 13.697V17c0 1.103.897 2 2 2h6c1.103 0 2-.897 2-2v-3.303L11.869 9H17v12h-4v2h10v-2h-4V9h5.131L21 13.697zM7 17v-2h6v2zm5.132-4H7.868L10 9.803zM23 17v-2h6v2zm3-7.197L28.132 13h-4.263z"
                              fill=""
                            ></path>
                          </g>
                        </svg>
                      </button>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <button
                        className="hover:text-primary"
                        onClick={() => handleWitnessClick(item.victimId)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          className="fill-current"
                          width="30"
                          height="30"
                          viewBox="0 0 512 512"
                        >
                          <g>
                            <path
                              d="M288 384.023a7.984 7.984 0 0 1-5.656-2.343 7.99 7.99 0 0 1 0-11.313l5.656-5.656a7.997 7.997 0 0 1 11.313 0 7.99 7.99 0 0 1 0 11.312l-5.657 5.657a7.984 7.984 0 0 1-5.656 2.343zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M293.664 378.367a7.848 7.848 0 0 1-2.191-.305c-4.25-1.207-6.72-5.628-5.504-9.878l8.984-31.59c1.2-4.25 5.621-6.746 9.879-5.504 4.246 1.207 6.719 5.629 5.504 9.879l-8.984 31.59a8.006 8.006 0 0 1-7.688 5.808zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M293.648 378.367a7.997 7.997 0 0 1-7.687-5.816c-1.2-4.254 1.254-8.68 5.504-9.88l31.605-8.968c4.258-1.23 8.684 1.258 9.883 5.504 1.2 4.258-1.258 8.68-5.504 9.883l-31.61 8.965a7.582 7.582 0 0 1-2.19.312zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M333.266 361.398a7.96 7.96 0 0 1-5.657-2.343l-22.625-22.621a7.99 7.99 0 0 1 0-11.313 7.99 7.99 0 0 1 11.313 0l22.625 22.621a7.997 7.997 0 0 1 0 11.313 7.974 7.974 0 0 1-5.656 2.343zM427.078 267.574a7.959 7.959 0 0 1-5.652-2.344L398.8 242.602a7.99 7.99 0 0 1 0-11.313 7.99 7.99 0 0 1 11.312 0l22.621 22.633a7.985 7.985 0 0 1 0 11.308 7.942 7.942 0 0 1-5.656 2.344zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M302.64 346.777a7.984 7.984 0 0 1-5.656-2.343 7.99 7.99 0 0 1 0-11.313l170.672-170.68a7.99 7.99 0 0 1 11.313 0 7.99 7.99 0 0 1 0 11.313l-170.672 170.68a7.99 7.99 0 0 1-5.656 2.343zM325.266 369.398a7.96 7.96 0 0 1-5.657-2.343 7.99 7.99 0 0 1 0-11.313L490.281 185.07a7.997 7.997 0 0 1 11.313 0 7.997 7.997 0 0 1 0 11.313L330.922 367.055a7.974 7.974 0 0 1-5.656 2.343zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M495.938 198.727a7.96 7.96 0 0 1-5.657-2.344 7.99 7.99 0 0 1 0-11.313 8.016 8.016 0 0 0 0-11.316c-3.113-3.113-8.203-3.121-11.312.008-3.13 3.11-8.192 3.117-11.32-.008-3.122-3.137-3.122-8.195.007-11.32 9.36-9.329 24.574-9.329 33.938 0 9.36 9.367 9.36 24.59 0 33.949a7.974 7.974 0 0 1-5.656 2.344zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M495.938 232.664a7.977 7.977 0 0 1-5.657-2.344 7.99 7.99 0 0 1 0-11.312 7.978 7.978 0 0 0 2.344-5.656 7.9 7.9 0 0 0-2.344-5.649 8.007 8.007 0 0 1-.008-11.32c3.125-3.125 8.192-3.117 11.32-.008a23.866 23.866 0 0 1 7.032 16.977c0 6.41-2.504 12.441-7.031 16.968a7.99 7.99 0 0 1-5.656 2.344zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M441.719 286.887a7.974 7.974 0 0 1-5.656-2.344 7.997 7.997 0 0 1 0-11.313l54.218-54.222a7.99 7.99 0 0 1 11.313 0 7.997 7.997 0 0 1 0 11.312l-54.219 54.223a7.928 7.928 0 0 1-5.656 2.344zM495.938 210.04a7.96 7.96 0 0 1-5.657-2.345L462 179.406a7.985 7.985 0 0 1 0-11.308 7.99 7.99 0 0 1 11.313 0l28.28 28.285a7.997 7.997 0 0 1 0 11.312 7.974 7.974 0 0 1-5.656 2.344zM368 488H32a7.99 7.99 0 0 1-8-8V8c0-4.426 3.574-8 8-8h288c2.129 0 4.16.84 5.656 2.344l48 48A7.997 7.997 0 0 1 376 56v217.406c0 4.426-3.574 8-8 8s-8-3.574-8-8V59.312L316.687 16H40v456h320V318.656c0-4.426 3.574-8 8-8s8 3.574 8 8V480c0 4.426-3.574 8-8 8zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M320 64a7.99 7.99 0 0 1-8-8V8c0-4.426 3.574-8 8-8s8 3.574 8 8v48c0 4.426-3.574 8-8 8zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M368 64h-48c-4.426 0-8-3.574-8-8s3.574-8 8-8h48c4.426 0 8 3.574 8 8s-3.574 8-8 8zM304 224.055H96a7.99 7.99 0 0 1-8-8c0-4.422 3.574-8 8-8h208c4.426 0 8 3.578 8 8 0 4.425-3.574 8-8 8zM304 264.047H96a7.99 7.99 0 0 1-8-8c0-4.422 3.574-8 8-8h208c4.426 0 8 3.578 8 8 0 4.426-3.574 8-8 8zM304 304.04H96a7.99 7.99 0 0 1-8-8c0-4.423 3.574-8 8-8h208c4.426 0 8 3.577 8 8 0 4.425-3.574 8-8 8zM200 344.031H96a7.99 7.99 0 0 1-8-8c0-4.422 3.574-8 8-8h104c4.426 0 8 3.578 8 8 0 4.426-3.574 8-8 8zM304 424.023h-56a7.99 7.99 0 0 1-8-8c0-4.421 3.574-8 8-8h56c4.426 0 8 3.579 8 8 0 4.426-3.574 8-8 8zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M288 440.023a7.99 7.99 0 0 1-8-8v-32c0-4.421 3.574-8 8-8s8 3.579 8 8v32c0 4.426-3.574 8-8 8zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M288.008 440.023a7.972 7.972 0 0 1-6.406-3.199l-24-32c-2.657-3.527-1.938-8.543 1.597-11.191 3.52-2.649 8.535-1.946 11.192 1.597l24 32c2.656 3.532 1.937 8.547-1.598 11.196a7.93 7.93 0 0 1-4.785 1.597zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M264 440.023a7.99 7.99 0 0 1-8-8v-32c0-4.421 3.574-8 8-8s8 3.579 8 8v32c0 4.426-3.574 8-8 8zM344 512a7.99 7.99 0 0 1-8-8v-24c0-4.426 3.574-8 8-8s8 3.574 8 8v24c0 4.426-3.574 8-8 8zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M344 512H8c-4.426 0-8-3.574-8-8s3.574-8 8-8h336c4.426 0 8 3.574 8 8s-3.574 8-8 8zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M8 512a7.99 7.99 0 0 1-8-8V32c0-4.426 3.574-8 8-8s8 3.574 8 8v472c0 4.426-3.574 8-8 8zm0 0"
                              fill="#"
                            ></path>
                            <path
                              d="M32 40H8c-4.426 0-8-3.574-8-8s3.574-8 8-8h24c4.426 0 8 3.574 8 8s-3.574 8-8 8zM152.016 168.113c-25.743 0-49.23-13.41-62.84-35.847a8.05 8.05 0 0 1 0-8.297c13.61-22.45 37.105-35.848 62.84-35.848 25.726 0 49.214 13.399 62.832 35.848a7.98 7.98 0 0 1 0 8.297c-13.618 22.445-37.106 35.847-62.832 35.847zm-46.414-40c10.925 15.117 27.941 24 46.414 24 18.457 0 35.472-8.883 46.41-24-10.938-15.12-27.953-24-46.41-24-18.473 0-35.489 8.88-46.414 24zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M152 151.977c-13.23 0-24-10.77-24-24 0-13.235 10.77-24 24-24s24 10.765 24 24c0 13.23-10.77 24-24 24zm0-32c-4.414 0-8 3.582-8 8 0 4.414 3.586 8 8 8s8-3.586 8-8c0-4.418-3.586-8-8-8zm0 0"
                              fill=""
                            ></path>
                          </g>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    {norecords}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Mobile Collapsible List View */}
        <div className="lg:hidden space-y-4">
          {currentTableData.length > 0 ? (
            currentTableData.map((item, index) => (
              <div
                key={index}
                className="border-b border-stroke dark:border-strokedark pb-4"
              >
                <button
                  onClick={() => toggleDetails(index)}
                  className="w-full text-left py-2 font-medium text-black dark:text-white flex align-middle justify-between"
                >
                  {(currentPage - 1) * PageSize + index + 1}
                  {'. '}
                  {victimname}
                  {' :'} {item.victimName}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                    width="30"
                    height="30"
                    x="0"
                    y="0"
                    viewBox="0 0 682.667 682.667"
                    className={` transition-transform duration-300 ${
                      isOpen[index] ? 'rotate-180' : ''
                    }`}
                  >
                    <g>
                      <g
                        clip-path="url(#a)"
                        transform="matrix(1.33333 0 0 -1.33333 0 682.667)"
                      >
                        <path
                          d="M0 0c0-130.339 105.661-236 236-236S472-130.339 472 0 366.339 236 236 236 0 130.339 0 0Z"
                          transform="translate(20 256)"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="40"
                          stroke-linecap="butt"
                          stroke-linejoin="miter"
                          stroke-miterlimit="10"
                          stroke-dasharray="none"
                          stroke-opacity=""
                        ></path>
                        <path
                          d="m0 0-110-110L-220 0"
                          transform="translate(366 290)"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="40"
                          stroke-linecap="square"
                          stroke-linejoin="miter"
                          stroke-miterlimit="10"
                          stroke-dasharray="none"
                          stroke-opacity=""
                        ></path>
                      </g>
                    </g>
                  </svg>
                </button>
                {/* Collapsible details */}
                <div className={`pt-2 ${isOpen[index] ? 'block' : 'hidden'}`}>
                  <p className="text-black dark:text-white">
                    {offendername} : {item.offenderName}
                  </p>
                  <p className="text-black dark:text-white">
                    {firno} : {item.firNo}
                  </p>
                  <p className="text-black dark:text-white">
                    {reportdate} :{' '}
                    {new Date(item.created_on).toLocaleString('mr-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      weekday: 'long',
                    })}
                  </p>
                  <p className="text-black dark:text-white">
                    {section} : {item.sectionId}
                  </p>
                  <p className="text-black dark:text-white">
                    {shortdesc} : {item.shortDescription}
                  </p>
                  <div className="flex gap-4 mt-2 justify-center">
                    <button
                      style={{
                        boxShadow:
                          'inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)',
                      }}
                      onClick={() => handleViewwitnessClick(item.victimId)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 from-slate-50 to-slate-200  p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                    >
                      {viewwitnesses}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-4">{norecords}</p>
          )}
        </div>
      </div>
      <Pagination
        className="pagination-bar"
        currentPage={currentPage}
        totalCount={cases.length}
        pageSize={PageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </DefaultLayout>
  );
};

export default Viewwitnesscase;
