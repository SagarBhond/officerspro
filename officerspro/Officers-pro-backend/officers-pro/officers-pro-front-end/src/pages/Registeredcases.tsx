import { useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import Pagination from './Pagination';
import { useNavigate } from 'react-router-dom';
import request from '../Service/axios_helper';
import { useTranslation } from 'react-i18next';

let PageSize = 5;
type RegisteredcasesProps = {
  handleLogout: () => void;
};

const Registeredcases: React.FC<RegisteredcasesProps> = ({ handleLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState([{}]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState({});
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    index,
    victimname,
    offendername,
    reportdate,
    section,
    edit,
    firno,
    shortdesc,
    viewferrist,
    norecords,
    search,
  } = t('table');
  const { registeredcase } = t('breadcrumb');

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

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const fetchCases = () => {
    request('admin', 'GET', '/all', {})
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

  function handleEditClick(victimId: any): void {
    // navigate(`/register-statement/${victimId}`);
    navigate(`/register-statement/${victimId}`, {
      state: { from: 'registeredCases' },
    });
  }

  function handleFerristClick(victimId: any): void {
    navigate(`/ferristtable/${victimId}`);
  }
  const toggleDetails = (index) => {
    setIsOpen((prevOpen) => ({
      ...prevOpen,
      [index]: !prevOpen[index],
    }));
  };
  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={registeredcase} />
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
                  {edit}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {viewferrist}
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
                        onClick={() => handleEditClick(item.victimId)}
                      >
                        <svg
                          className="fill-current"
                          fill=""
                          width="30"
                          height="30"
                          viewBox="0 0 32 32"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          stroke="currentColor"
                        >
                          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            {' '}
                            <path d="M10.681 18.207l-2.209 5.67 5.572-2.307-3.363-3.363zM26.855 6.097l-0.707-0.707c-0.78-0.781-2.047-0.781-2.828 0l-1.414 1.414 3.535 3.536 1.414-1.414c0.782-0.781 0.782-2.048 0-2.829zM10.793 17.918l0.506-0.506 3.535 3.535 9.9-9.9-3.535-3.535 0.707-0.708-11.113 11.114zM23.004 26.004l-17.026 0.006 0.003-17.026 11.921-0.004 1.868-1.98h-14.805c-0.552 0-1 0.447-1 1v19c0 0.553 0.448 1 1 1h19c0.553 0 1-0.447 1-1v-14.058l-2.015 1.977 0.054 11.085z"></path>{' '}
                          </g>
                        </svg>
                      </button>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <button
                        className="hover:text-primary"
                        onClick={() => handleFerristClick(item.victimId)}
                      >
                        <svg
                          className="fill-current"
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          width="30"
                          height="30"
                          fill=""
                          viewBox="0 0 682.667 682.667"
                        >
                          <g>
                            <defs>
                              <clipPath id="a" clipPathUnits="userSpaceOnUse">
                                <path
                                  d="M0 512h512V0H0Z"
                                  fill=""
                                  opacity="1"
                                  data-original="#000000"
                                ></path>
                              </clipPath>
                            </defs>
                            <path
                              d="M0 0h-119.109"
                              style={{
                                strokeWidth: 15,
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                strokeMiterlimit: 10,
                                strokeDasharray: 'none',
                                strokeOpacity: 1,
                              }}
                              transform="matrix(1.33333 0 0 -1.33333 416.693 425.68)"
                              fill=""
                              stroke="currentColor"
                              data-original="#000000"
                            ></path>
                            <path
                              d="M0 0h-82.68"
                              style={{
                                strokeWidth: 15,
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                strokeMiterlimit: 10,
                                strokeDasharray: 'none',
                                strokeOpacity: 1,
                              }}
                              transform="matrix(1.33333 0 0 -1.33333 368.12 330.76)"
                              fill=""
                              stroke="currentColor"
                              data-original="#000000"
                            ></path>
                            <path
                              d="M0 0h-107.86"
                              style={{
                                strokeWidth: 15,
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                strokeMiterlimit: 10,
                                strokeDasharray: 'none',
                                strokeOpacity: 1,
                              }}
                              transform="matrix(1.33333 0 0 -1.33333 416.853 235.84)"
                              fill=""
                              stroke="currentColor"
                              data-original="#000000"
                            ></path>
                            <g
                              clipPath="url(#a)"
                              transform="matrix(1.33333 0 0 -1.33333 0 682.667)"
                            >
                              <path
                                d="M0 0h67.74c2.76 0 5-2.24 5-5v-67.03"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(314.41 420.44)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="M0 0v29.801c0 2.76 2.24 5 5 5h67.74"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(120.67 385.64)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="M0 0v64.22"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(120.67 149.86)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="M0 0v-109.26c0-2.76-2.24-5-5-5h-256.48c-2.76 0-5 2.24-5 5v44.771"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(387.15 179.35)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="m0 0 10.97 30.149C14.63 40.22 25.76 45.41 35.83 41.75l7-2.551"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(41.7 242.82)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="m0 0 7-2.55c10.06-3.67 15.26-14.8 11.59-24.87L7.62-57.57"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(112.98 271.67)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="m0 0-7.83-21.5c-2.86-7.86 1.19-16.54 9.05-19.4 7.85-2.86 16.54 1.19 19.4 9.04l7.82 21.5"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(90.85 299.37)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="m0 0-2.792-7.669c-5.566-15.295 2.32-32.207 17.615-37.773 15.295-5.568 32.206 2.318 37.773 17.613l2.792 7.67c5.566 15.295-2.32 32.206-17.615 37.773C22.479 23.181 5.567 15.295 0 0Z"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(88.819 335.71)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="m0 0 141.452-51.484a4.44 4.44 0 0 0 2.652-5.689L92-200.326a4.439 4.439 0 0 0-5.687-2.653l-141.452 51.485a4.438 4.438 0 0 0-2.653 5.688L-5.688-2.653A4.438 4.438 0 0 0 0 0Z"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(65.56 405.7)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="m0 0-18.479 32.008"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(426.12 155.95)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="m0 0-14.21 24.613a5.245 5.245 0 0 1-7.165 1.92L-53.759 7.836A5.245 5.245 0 0 1-55.678.672l51.81-89.738c6.611-11.452 21.254-15.374 32.705-8.763 11.451 6.611 15.374 21.253 8.763 32.704L17.498-30.308"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(463.688 138.762)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="M0 0c-26.922-15.543-36.146-49.969-20.603-76.891 15.544-26.922 49.969-36.145 76.891-20.602 26.922 15.544 36.147 49.969 20.603 76.89C61.348 6.319 26.923 15.544 0 0Z"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(336.152 312.93)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="M0 0v-30.006a5 5 0 0 1 5-5h110.996a5 5 0 0 1 5 5V0a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5Z"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(193.411 435.443)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="M0 0v11.423c0 12.378 10.035 22.413 22.413 22.413s22.413-10.035 22.413-22.413V0"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(231.496 440.443)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="M0 0v-23.093a5 5 0 0 1 5-5h23.092a5 5 0 0 1 5 5V0a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5Z"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(170.08 133.74)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="M0 0h71.432"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(236.792 105.647)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                              <path
                                d="M0 0c-41.94-24.215-56.31-77.844-32.096-119.784 24.214-41.94 77.843-56.308 119.784-32.094 41.94 24.215 56.31 77.842 32.096 119.782C95.569 9.844 41.94 24.214 0 0Z"
                                style={{
                                  strokeWidth: 15,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeMiterlimit: 10,
                                  strokeDasharray: 'none',
                                  strokeOpacity: 1,
                                }}
                                transform="translate(319.953 339.836)"
                                fill="none"
                                stroke="currentColor"
                                data-original="#000000"
                              ></path>
                            </g>
                          </g>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4">
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
                      onClick={() => handleEditClick(item.victimId)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 from-slate-50 to-slate-200  p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                    >
                      {edit}
                    </button>
                    <button
                      style={{
                        boxShadow:
                          'inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)',
                      }}
                      onClick={() => handleFerristClick(item.victimId)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 from-slate-50 to-slate-200  p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                    >
                      {viewferrist}
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

export default Registeredcases;
