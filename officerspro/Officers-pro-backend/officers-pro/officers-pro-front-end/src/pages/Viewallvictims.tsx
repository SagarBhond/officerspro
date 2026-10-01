import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import { useEffect, useMemo, useState } from 'react';
import request from '../Service/axios_helper';
import Pagination from './Pagination';
import { useTranslation } from 'react-i18next';

let PageSize = 5;

type ViewallvictimsProps = {
  handleLogout: () => void;
};

const Viewallvictims: React.FC<ViewallvictimsProps> = ({ handleLogout }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState([{}]);
  const [currentPage, setCurrentPage] = useState(1);
  const [officer, setOfficer] = useState({});
  const [isOpen, setIsOpen] = useState({});
  const { t } = useTranslation();
  const {
    index,
    victimname,
    victimage,
    contact,
    type,
    viewdetails,
    search,
    norecords,
  } = t('table');
  const { viewallvictim } = t('breadcrumb');
  const normalizeText = (text) => {
    // Normalize text to NFC form and convert to lowercase for case-insensitive comparison
    return text ? text.normalize('NFC').toLowerCase() : '';
  };

  const filteredCases = cases.filter((item) => {
    const normalizedQuery = normalizeText(searchQuery);

    return (
      normalizeText(item?.victimName).includes(normalizedQuery) ||
      normalizeText(item?.type).includes(normalizedQuery)
    );
  });

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return filteredCases.slice(firstPageIndex, lastPageIndex); // Use filteredCases here
  }, [currentPage, filteredCases]);

  useEffect(() => {
    fetchOfficerDetails();
    if (officer.officerId) {
      fetchCases();
    }
  }, [officer.officerId]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const fetchOfficerDetails = async () => {
    let officerEmail = localStorage.getItem('officerEmail');
    const response = await request(
      'cms',
      'GET',
      `/getSingleOfficer/${officerEmail}`,
      {},
    );
    setOfficer(response);
  };

  const fetchCases = () => {
    request('cms', 'GET', `/getVictimsDetails/${officer.officerId}`, {})
      .then((res) => {
        console.log(res);
        setCases(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  function handlevictimClick(victimID: any): void {
    navigate(`/Victimdetails/${victimID}`);
  }

  const toggleDetails = (index) => {
    setIsOpen((prevOpen) => ({
      ...prevOpen,
      [index]: !prevOpen[index],
    }));
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={viewallvictim} />
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
                  {victimage}
                </th>
                <th className=" py-4 px-4 font-medium text-black dark:text-white">
                  {contact}
                </th>
                <th className=" py-4 px-4 font-medium text-black dark:text-white">
                  {type}
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
                        {item.victimName}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.victimAge}
                      </p>
                    </td>

                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.victimMobileNo}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.type}</p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <button
                        className="hover:text-primary"
                        onClick={() => handlevictimClick(item.victimId)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          width="30"
                          height="30"
                          viewBox="0 0 512 512"
                          className="fill-current"
                        >
                          <g>
                            <path
                              d="M307.11 185.06c0-28.19-22.92-51.12-51.09-51.12-28.19 0-51.12 22.93-51.12 51.12 0 28.17 22.93 51.09 51.12 51.09 28.17.01 51.09-22.91 51.09-51.09zm-86.2 0c0-19.36 15.75-35.11 35.11-35.11 19.34 0 35.08 15.75 35.08 35.11 0 19.34-15.74 35.08-35.08 35.08-19.36 0-35.11-15.73-35.11-35.08zM169.15 310.3v40.79c0 14.87 11.71 26.97 26.09 26.97h121.52c14.39 0 26.09-12.1 26.09-26.97V310.3c0-37.72-29.43-68.41-65.61-68.41h-42.49c-36.17-.01-65.6 30.68-65.6 68.41zm65.6-52.4h42.49c27.34 0 49.59 23.51 49.59 52.4v40.79c0 6.04-4.52 10.96-10.08 10.96H195.24c-5.56 0-10.08-4.92-10.08-10.96V310.3c0-28.89 22.25-52.4 49.59-52.4zm230.14 32.4c-7.16 43.88-27.64 83.77-59.23 115.36s-71.48 52.08-115.36 59.23c-.44.07-.87.11-1.3.11a8 8 0 0 1-7.89-6.72c-.71-4.37 2.25-8.48 6.61-9.19 82.98-13.53 147.83-78.38 161.37-161.37.71-4.37 4.83-7.33 9.19-6.61 4.36.71 7.33 4.82 6.61 9.19zM47.11 221.7c7.16-43.88 27.64-83.77 59.23-115.36s71.49-52.07 115.36-59.23c4.36-.71 8.48 2.25 9.19 6.61.71 4.37-2.25 8.48-6.61 9.19C141.3 76.45 76.45 141.3 62.91 224.28a8.008 8.008 0 0 1-7.89 6.72c-.43 0-.86-.03-1.3-.11-4.36-.71-7.33-4.82-6.61-9.19zm234-167.98c.71-4.36 4.83-7.32 9.19-6.61 43.88 7.16 83.77 27.64 115.36 59.23s52.08 71.49 59.23 115.36c.71 4.36-2.25 8.48-6.61 9.19-.44.07-.87.11-1.3.11a8 8 0 0 1-7.89-6.72C435.55 141.3 370.7 76.45 287.72 62.91c-4.36-.71-7.33-4.82-6.61-9.19zm-50.22 404.56A8.008 8.008 0 0 1 223 465c-.43 0-.86-.03-1.3-.11-43.88-7.16-83.77-27.64-115.36-59.23S54.26 334.17 47.11 290.3c-.71-4.37 2.25-8.48 6.61-9.19s8.48 2.25 9.19 6.61c13.53 82.98 78.38 147.83 161.37 161.37 4.36.71 7.33 4.82 6.61 9.19zm17.12-369.54v-72c0-4.42 3.58-8.01 8.01-8.01s8.01 3.58 8.01 8.01v72c0 4.42-3.58 8.01-8.01 8.01s-8.01-3.59-8.01-8.01zm16.01 334.52v72c0 4.42-3.58 8.01-8.01 8.01s-8.01-3.58-8.01-8.01v-72c0-4.42 3.58-8.01 8.01-8.01s8.01 3.58 8.01 8.01zm239.25-167.25c0 4.42-3.58 8.01-8.01 8.01h-72c-4.42 0-8.01-3.58-8.01-8.01s3.58-8.01 8.01-8.01h72c4.42.01 8.01 3.59 8.01 8.01zm-414.53 8.01h-72c-4.42 0-8.01-3.58-8.01-8.01s3.58-8.01 8.01-8.01h72c4.42 0 8.01 3.58 8.01 8.01s-3.58 8.01-8.01 8.01z"
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
                    {victimage} : {item.victimAge}
                  </p>
                  <p className="text-black dark:text-white">
                    {contact} : {item.victimMobileNo}
                  </p>

                  <p className="text-black dark:text-white">
                    {type} : {item.type}
                  </p>

                  <div className="flex gap-4 mt-2 justify-center">
                    <button
                      style={{
                        boxShadow:
                          'inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)',
                      }}
                      onClick={() => handlevictimClick(item.victimId)}
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
        totalCount={cases.length}
        pageSize={PageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </DefaultLayout>
  );
};

export default Viewallvictims;
