import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { useNavigate, useParams } from 'react-router-dom';
import Pagination from './Pagination';
import request from '../Service/axios_helper';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

let PageSize = 5;
type ViewwitnessProps = {
  handleLogout: () => void;
};

const Viewwitness: React.FC<ViewwitnessProps> = ({ handleLogout }) => {
  const { victimId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [witness, setWitness] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const nav = useNavigate();
  const [isOpen, setIsOpen] = useState({});
  const { t } = useTranslation();
  const {
    index,
    witnessname,
    witnesstype,
    adress,
    reportdate,
    search,
    norecords,
    viewdetails,
  } = t('table');
  const { witnesslist } = t('breadcrumb');

  const filteredCases = witness.filter(
    (item) =>
      item?.witnessName?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      item?.witnessAddress?.toLowerCase()?.includes(searchQuery.toLowerCase()),
  );

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return filteredCases.slice(firstPageIndex, lastPageIndex); // Use filteredCases here
  }, [currentPage, filteredCases]);

  useEffect(() => {
    fetchWitness();
  }, []);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const fetchWitness = async () => {
    try {
      const response = await request(
        'complaintandfir',
        'GET',
        `/api/witnesses/investigation/${victimId}`,
        {},
      );
      console.log(response);
      setWitness(response);
    } catch (error) {
      console.error('Error fetching Witness :', error);
    }
  };

  function handleOpenwitnessinfoClick(witnessId: any): void {
    nav(`/witnessdetails/${witnessId}`);
  }

  const toggleDetails = (index) => {
    setIsOpen((prevOpen) => ({
      ...prevOpen,
      [index]: !prevOpen[index],
    }));
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={witnesslist} />
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
                  {witnessname}
                </th>
                <th className=" py-4 px-4 font-medium text-black dark:text-white ">
                  {witnesstype}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {adress}
                </th>
                <th className=" py-4 px-4 font-medium text-black dark:text-white">
                  {reportdate}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {viewdetails}
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
                        {item.witnessName}
                      </p>
                    </td>

                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.witnessType}
                      </p>
                    </td>

                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.witnessAddress ? item.witnessAddress : 'N/A'}
                      </p>
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
                      <button
                        className="hover:text-primary"
                        onClick={() =>
                          handleOpenwitnessinfoClick(item.witnessId)
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          className="fill-current"
                          width="30"
                          height="30"
                          viewBox="0 0 66 66"
                        >
                          <g>
                            <path
                              d="M21.38 17.72a.96.96 0 1 0-.96-.96c.01.53.44.96.96.96zM28.23 17.72a.96.96 0 1 0 0-1.92.96.96 0 0 0 0 1.92zM24.81 23.82c.78 0 1.51-.3 2.06-.85.34-.34.34-.9 0-1.24s-.9-.34-1.24 0c-.44.44-1.2.44-1.64 0-.34-.34-.9-.34-1.24 0s-.34.9 0 1.24c.55.54 1.28.85 2.06.85z"
                              fill=""
                            ></path>
                            <path
                              d="M64 48.86H45.61V41.2c0-5.42-4.41-9.83-9.83-9.83-.19 0-.36.07-.5.18-1.32-.76-2.73-1.37-4.19-1.83v-3.2c1.06-.96 2.02-2.15 2.83-3.53.22.06.44.09.67.09 1.85 0 3.3-1.88 3.3-4.28 0-1.59-.67-3.01-1.72-3.74 0-.5 0-1.8-.01-2.66-.05-6.22-5.14-11.27-11.35-11.27S13.51 6.19 13.46 12.4c-.01.86-.01 2.17-.01 2.66-1.05.73-1.72 2.16-1.72 3.74 0 2.4 1.45 4.28 3.3 4.28.23 0 .45-.03.67-.09.81 1.39 1.78 2.57 2.83 3.53v3.2c-1.34.42-2.64.97-3.87 1.65h-.83C8.41 31.37 4 35.78 4 41.2v7.66H2c-.48 0-.88.39-.88.88v5.63c0 .48.39.88.88.88h3.52V64c0 .48.39.88.88.88h53.22c.48 0 .88-.39.88-.88v-7.76H64c.48 0 .88-.39.88-.88v-5.63a.886.886 0 0 0-.88-.87zM27.32 37.53l-1.34-1.63 4.4-4.57c1.21.36 2.38.85 3.5 1.44l-3.94 7.95zM24.81 2.88c5.25 0 9.56 4.28 9.6 9.53v.44c-3.45.29-5.31-1.68-6.02-2.67.85-.85 1.63-1.86 2.29-3.06.23-.42.08-.96-.34-1.19s-.96-.08-1.19.34c-3.77 6.82-11.54 6.64-13.95 6.41v-.28c.04-5.25 4.35-9.52 9.61-9.52zm-7.96 18.58a.883.883 0 0 0-.56-.44.761.761 0 0 0-.21-.03c-.17 0-.34.05-.49.15-1.08.73-2.11-.7-2.11-2.33 0-1.27.6-2.19 1.2-2.44.33-.14.55-.47.54-.83l-.02-.29v-.81c.41.03.91.05 1.51.05 2.64 0 6.88-.5 10.37-3.17.94 1.23 3.06 3.32 6.66 3.32.22 0 .45-.01.69-.03v.64l-.02.29c-.01.36.2.69.54.83.6.25 1.2 1.17 1.2 2.44 0 1.63-1.02 3.06-2.11 2.33-.21-.14-.46-.18-.7-.12s-.44.22-.56.44c-.75 1.43-1.83 2.91-3.16 4.05-.01.01-.02.01-.03.02-1.36 1.16-2.99 1.96-4.78 1.96s-3.41-.8-4.78-1.96L20 25.5c-1.32-1.13-2.4-2.61-3.15-4.04zm7.96 7.77c1.54 0 3.09-.51 4.53-1.4v2.05l-4.53 4.71-4.53-4.71v-2.05c1.44.9 2.98 1.4 4.53 1.4zm-5.58 2.09 4.4 4.58-3.96 4.81-3.94-7.95c1.12-.59 2.29-1.07 3.5-1.44zM5.75 41.2c0-4.46 3.62-8.08 8.08-8.08h.13l4.75 9.58c.13.27.39.45.68.48.03 0 .07.01.1.01a.9.9 0 0 0 .68-.32l4.63-5.64 1.04 1.26 3.6 4.38c.17.2.42.32.68.32.03 0 .07 0 .1-.01.29-.03.55-.21.68-.48l4.76-9.61c.04.01.08.02.12.02 4.45 0 8.08 3.63 8.08 8.08v7.66h-5.09V43.7c0-.48-.39-.88-.88-.88s-.88.39-.88.88v5.15H12.59V43.7c0-.48-.39-.88-.88-.88s-.88.39-.88.88v5.15H5.75zm52.98 21.92H7.27v-6.88h51.47v6.88zm4.39-8.63H2.88v-3.88h60.25v3.88zM42.35 12.12c2.54 2.54 5.91 3.93 9.49 3.93s6.96-1.4 9.49-3.93l2.14-2.14c.34-.34.34-.9 0-1.24L61.33 6.6a13.328 13.328 0 0 0-9.49-3.93c-3.59 0-6.96 1.4-9.49 3.93l-2.14 2.14a.87.87 0 0 0 0 1.24zm1.23-4.27c2.2-2.2 5.13-3.42 8.25-3.42s6.05 1.21 8.25 3.42l1.52 1.52-1.52 1.52c-2.2 2.2-5.14 3.42-8.25 3.42-3.12 0-6.05-1.21-8.25-3.42l-1.52-1.52z"
                              fill=""
                            ></path>
                            <path
                              d="M51.84 13.2c2.11 0 3.83-1.72 3.83-3.83 0-.11-.01-.22-.04-.39-.03-.29-.2-.54-.46-.68s-.57-.13-.82 0c-.75.4-1.58-.18-1.58-.94 0-.17.05-.34.13-.5.14-.26.1-.57-.03-.82-.13-.26-.43-.44-.71-.48-.1-.01-.21-.03-.32-.03-2.11 0-3.83 1.72-3.83 3.83s1.71 3.84 3.83 3.84zm-.82-5.73a2.825 2.825 0 0 0 2.73 2.71c-.32.75-1.06 1.27-1.92 1.27-1.15 0-2.08-.93-2.08-2.08.01-.85.51-1.58 1.27-1.9z"
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
                  <td colSpan="6" className="text-center py-4">
                    {norecords}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Mobile Collapsible List View */}
        <div className="lg:hidden space-y-4 ">
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
                  {witnessname}
                  {' :'} {item.witnessName}
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
                    {witnesstype} : {item.witnessType}
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
                    {adress} : {item.witnessAddress}
                  </p>
                  <div className="flex gap-4 mt-2 justify-center">
                    <button
                      style={{
                        boxShadow:
                          'inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)',
                      }}
                      onClick={() => handleOpenwitnessinfoClick(item.witnessId)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 from-slate-50 to-slate-200  p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                    >
                      {viewdetails}
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
        totalCount={witness.length}
        pageSize={PageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </DefaultLayout>
  );
};

export default Viewwitness;
