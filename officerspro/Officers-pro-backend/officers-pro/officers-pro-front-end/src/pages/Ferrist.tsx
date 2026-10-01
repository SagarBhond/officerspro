import { useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import request from '../Service/axios_helper';
import Pagination from './Pagination';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
let PageSize = 5;
type FerristProps = {
  handleLogout: () => void;
};
const Ferrist: React.FC<FerristProps> = ({ handleLogout }) => {
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
    chargesheet,
    firno,
    shortdesc,
    viewferrist,
    norecords,
    search,
  } = t('table');

  const { ferrist } = t('breadcrumb');

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
        setCases(registeredCases);
        console.log(registeredCases);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  function handleFerristClick(victimId: any): void {
    navigate(`/ferristtable/${victimId}`);
  }

  function handleChargesheetClick(victimId: any): void {
    navigate(`/chargesheet/${victimId}`);
  }

  const toggleDetails = (index) => {
    setIsOpen((prevOpen) => ({
      ...prevOpen,
      [index]: !prevOpen[index],
    }));
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={ferrist} />
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
                  {viewferrist}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {chargesheet}
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
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <button
                        className="hover:text-primary"
                        onClick={() => handleChargesheetClick(item.victimId)}
                      >
                        <svg
                          className="fill-current"
                          xmlns="http://www.w3.org/2000/svg"
                          width="30"
                          height="30"
                          fillRule="evenodd"
                          enableBackground="new 0 0 512 512"
                          viewBox="0 0 173.397 173.397"
                        >
                          <path
                            d="M123.091 160.804H11.831a1.672 1.672 0 01-1.672-1.67V14.264c0-.922.749-1.67 1.671-1.67l120.33-.001c.921 0 1.67.749 1.67 1.671v69a1.672 1.672 0 01-3.342 0V15.936H13.502v141.526H123.09a1.67 1.67 0 010 3.342z"
                            data-original="#000000"
                          ></path>
                          <path
                            d="M123.091 83.856c-20.293 0-36.801 16.509-36.801 36.801 0 20.293 16.508 36.805 36.8 36.805s36.805-16.512 36.805-36.805c0-20.292-16.512-36.8-36.804-36.8zm0 76.948c-22.134 0-40.144-18.009-40.144-40.147 0-22.134 18.01-40.143 40.143-40.143 22.139 0 40.147 18.009 40.147 40.143 0 22.138-18.009 40.147-40.146 40.147z"
                            data-original="#000000"
                          ></path>
                          <path
                            d="M123.091 108.866h-17.616a1.672 1.672 0 010-3.342h17.616a1.67 1.67 0 010 3.342z"
                            data-original="#000000"
                          ></path>
                          <path
                            d="M114.683 126.266a1.667 1.667 0 01-1.476-.891l-7.732-14.604-7.728 14.604a1.673 1.673 0 01-2.26.696 1.674 1.674 0 01-.696-2.26l9.208-17.396a1.671 1.671 0 012.956 0l9.205 17.397a1.67 1.67 0 01-1.477 2.454zm-4.25 20.738h25.316v-3.843c0-.7-.428-1.243-.794-1.243h-23.724c-.37 0-.798.543-.798 1.243zm26.987 3.342h-28.658a1.672 1.672 0 01-1.672-1.671v-5.514c0-2.528 1.856-4.585 4.14-4.585h23.725c2.281 0 4.136 2.057 4.136 4.585v5.514a1.67 1.67 0 01-1.671 1.671zm3.287-41.48h-17.616a1.672 1.672 0 010-3.342h17.616a1.67 1.67 0 010 3.342zm-7.537 17.396v.244a4.716 4.716 0 004.713 4.71h5.65a4.715 4.715 0 004.71-4.71v-.244zm10.364 8.296h-5.65c-4.443 0-8.053-3.61-8.053-8.052v-1.915a1.67 1.67 0 011.67-1.671h18.414c.922 0 1.67.748 1.67 1.671l.001 1.915c0 4.442-3.614 8.052-8.052 8.052z"
                            data-original="#000000"
                          ></path>
                          <path
                            d="M131.498 126.266a1.674 1.674 0 01-1.476-2.454l9.208-17.396a1.671 1.671 0 011.476-.892c.62 0 1.187.345 1.476.892l9.209 17.396a1.67 1.67 0 11-2.953 1.563l-7.731-14.604-7.73 14.604c-.299.567-.88.891-1.479.891zm-33.556-.004v.244c0 2.6 2.113 4.713 4.71 4.713h5.65a4.716 4.716 0 004.71-4.713v-.244zm10.36 8.296h-5.65c-4.442 0-8.053-3.61-8.053-8.052v-1.915c0-.922.749-1.671 1.671-1.671h18.413a1.67 1.67 0 011.671 1.671v1.915c0 4.442-3.613 8.052-8.052 8.052zm14.789 7.36a1.672 1.672 0 01-1.671-1.67V100.34c0-.926.748-1.671 1.67-1.671.924 0 1.671.745 1.671 1.67v39.907a1.67 1.67 0 01-1.67 1.671z"
                            data-original="#000000"
                          ></path>
                          <path
                            d="M123.091 93.2c-1.615 1.671-3.085 3.405-3.085 4.759 0 .39.317.71.707.71h4.755a.71.71 0 00.707-.71c0-1.354-1.47-3.088-3.084-4.759zm2.377 8.811h-4.755a4.055 4.055 0 01-4.049-4.052c0-3.067 2.667-5.734 5.243-8.313a1.68 1.68 0 011.183-.491c.443 0 .87.177 1.184.49 2.577 2.577 5.243 5.244 5.243 8.314a4.053 4.053 0 01-4.049 4.052zM49.144 34.728c1.006 3.464 3.384 13.883-1.278 22.722-3.039 5.762 4.192 15.896 12.686 21.104 3.489 2.141 7.443 3.27 11.443 3.27s7.958-1.129 11.443-3.27c8.495-5.208 15.725-15.342 12.69-21.104-4.662-8.839-2.284-19.258-1.278-22.722l-5.462-4.244a19.88 19.88 0 01-1.487.056c-3.254 0-9.51-.728-15.906-5.41-6.395 4.682-12.648 5.41-15.903 5.41a19.63 19.63 0 01-1.486-.056zm22.852 50.437c-4.617 0-9.178-1.298-13.191-3.76-9.978-6.123-17.943-17.834-13.894-25.514 4.885-9.264.759-21.09.717-21.208a1.677 1.677 0 01.546-1.884l6.91-5.368a1.681 1.681 0 011.292-.33s.637.097 1.717.097c2.994 0 8.905-.714 14.858-5.48a1.675 1.675 0 012.089 0c5.953 4.766 11.867 5.48 14.861 5.48 1.077 0 1.717-.098 1.724-.098a1.67 1.67 0 011.28.331l6.911 5.368c.571.446.794 1.205.55 1.884-.041.114-4.153 11.975.717 21.208 4.05 7.68-3.916 19.39-13.897 25.514-4.01 2.462-8.571 3.76-13.19 3.76z"
                            data-original="#000000"
                          ></path>
                          <path
                            d="M55.247 60.221l-.01.084c-.05.446.18 1.434.532 2.301 1.706 4.199 6.002 8.244 9.5 10.392 2.134 1.305 4.397 1.97 6.726 1.97 2.333 0 4.596-.665 6.726-1.97 3.502-2.148 7.798-6.193 9.504-10.392.352-.867.578-1.855.533-2.3l-.01-.084-.038-.074c-2.841-5.437-3.945-12.104-3.197-19.283.108-1.034.247-2.054.411-3.039l.084-.48-.488-.035a36.043 36.043 0 01-13.326-3.67l-.198-.097-.195.098a36.119 36.119 0 01-13.33 3.669l-.484.035.08.48c.167.985.306 2.005.414 3.04.749 7.178-.355 13.848-3.196 19.282zm16.749 18.09c-2.914 0-5.846-.854-8.47-2.465-3.68-2.256-8.725-6.747-10.852-11.983-.282-.69-.916-2.454-.76-3.913l.043-.4c.02-.206.083-.408.18-.596l.186-.355c2.534-4.85 3.515-10.861 2.833-17.389-.1-.96-.23-1.915-.383-2.83l-.386-2.288c-.077-.463.041-.94.334-1.309.289-.369.72-.598 1.19-.637l2.312-.17a32.663 32.663 0 0012.09-3.328l.941-.467a1.688 1.688 0 011.486 0l.937.467a32.723 32.723 0 0012.09 3.328l2.316.17c.47.039.901.268 1.19.637.289.37.41.846.334 1.31l-.386 2.287c-.153.915-.282 1.87-.383 2.83-.682 6.524.3 12.54 2.834 17.39l.184.354c.098.188.157.39.181.596l.043.4c.156 1.459-.478 3.224-.76 3.913-2.127 5.236-7.175 9.727-10.851 11.983-2.625 1.611-5.557 2.464-8.473 2.464z"
                            data-original="#000000"
                          ></path>
                          <path
                            d="M71.996 58.502c.22 0 .434.041.64.125l3.624 1.497-.303-3.91A1.664 1.664 0 0176.35 55l2.542-2.983-3.812-.919a1.672 1.672 0 01-1.03-.749l-2.054-3.342-2.05 3.342a1.68 1.68 0 01-1.035.749l-3.808.919L67.643 55c.287.338.429.773.394 1.215l-.302 3.91 3.623-1.497c.206-.084.421-.125.638-.125zm-6.138 5.876a1.668 1.668 0 01-1.664-1.8l.46-5.935-3.862-4.53a1.672 1.672 0 01.881-2.708l5.787-1.396 3.112-5.069a1.67 1.67 0 012.847 0l3.116 5.069 5.786 1.396a1.67 1.67 0 01.88 2.709l-3.86 4.529.46 5.935a1.667 1.667 0 01-2.302 1.671l-5.503-2.27-5.501 2.27a1.626 1.626 0 01-.637.13zm8.676 67.367H22.888a1.672 1.672 0 010-3.342h51.646a1.671 1.671 0 010 3.342zm9.747 17.873H22.888a1.672 1.672 0 010-3.342H84.28a1.671 1.671 0 010 3.342zM76.4 113.872H22.888a1.67 1.67 0 110-3.339h53.511a1.668 1.668 0 110 3.339zm8.591-17.87H22.888a1.672 1.672 0 010-3.342H84.99a1.671 1.671 0 010 3.343z"
                            data-original="#000000"
                          ></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
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
                      onClick={() => handleFerristClick(item.victimId)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 from-slate-50 to-slate-200  p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                    >
                      {viewferrist}
                    </button>
                    <button
                      style={{
                        boxShadow:
                          'inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)',
                      }}
                      onClick={() => handleChargesheetClick(item.victimId)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 from-slate-50 to-slate-200  p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                    >
                      {chargesheet}
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

export default Ferrist;
