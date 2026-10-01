import { useEffect, useMemo, useState } from 'react';
import request from '../Service/axios_helper';
import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Pagination from './Pagination';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import CaseShareModal from './CaseShareModal';

let PageSize = 5;
type ViewallcasesProps = {
  handleLogout: () => void;
};

const Viewallcases: React.FC<ViewallcasesProps> = ({ handleLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isOpen, setIsOpen] = useState({});
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const { t } = useTranslation();
  const {
    index,
    action,
    victimname,
    offendername,
    reportdate,
    section,
    share,
    reopen,
    complete,
    inprogress,
    allcases,
    firno,
    shortdesc,
    casestatus,

    norecords,
    search,
  } = t('table');
  const { viewallcases } = t('breadcrumb');

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
    setCurrentPage(1); // Reset to the first page when status changes
  };

  const fetchCases = () => {
    request('dashboard', 'GET', '/all', {})
      .then((res) => {
        const reversedCases = res.reverse();
        const registeredCases = reversedCases.filter(
          (caseItem) => caseItem.firNo !== null,
        );
        setCases(registeredCases);
        console.log(registeredCases);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const normalizeText = (text) => {
    // Normalize text to NFC form and convert to lowercase for case-insensitive comparison
    return text ? text.normalize('NFC').toLowerCase() : '';
  };

  const filteredCases = cases.filter((item) => {
    const normalizedQuery = normalizeText(searchQuery);
    // Check if the case status matches the selected status or if 'all' is selected
    const statusMatches =
      selectedStatus === 'all' || item.caseStatus === selectedStatus;

    // Normalize text fields and check if the query matches any of them
    const searchMatches =
      normalizeText(item?.victimName).includes(normalizedQuery) ||
      normalizeText(item?.offenderName).includes(normalizedQuery) ||
      normalizeText(item?.firNo).includes(normalizedQuery) ||
      normalizeText(item?.shortDescription).includes(normalizedQuery);

    // Return true if both status and search match
    return statusMatches && searchMatches;
  });

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return filteredCases.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredCases]);

  const handleReopenClick = async (victimId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You want to reopen this case !',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Reopen it!',
      });
      if (result.isConfirmed) {
        await request('complaintandfir', 'PUT', `/caseReopen/${victimId}`, {});
        fetchCases();
        Swal.fire({
          title: 'Case Reopened !',
          text: 'Case is reopened .',
          icon: 'success',
        });
      }
    } catch (error) {
      console.error('Error Reopening case :', error);
    }
  };
  const toggleDetails = (index) => {
    setIsOpen((prevOpen) => ({
      ...prevOpen,
      [index]: !prevOpen[index],
    }));
  };

  const handleShareClick = (victimId, officerId) => {
    setSelectedCase({ victimId, officerId });
    setIsShareModalOpen(true);
  };

  const handleShareCase = async (officerEmail) => {
    setIsShareModalOpen(false);
    try {
      await request(
        'complaintandfir',
        'POST',
        `/transfer/${selectedCase.victimId}/${selectedCase.officerId}`,
        { officerEmail: officerEmail },
      );
      fetchCases();
      Swal.fire('Success', 'Case shared successfully!', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to share case', 'error');
    }
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={viewallcases} />
      <div className="Searchbar pt-2 relative mx-auto text-gray-600 flex flex-col md:flex-row justify-between  items-center gap-4 my-6 ">
        <select
          className="rounded-lg border-[1.5px] border-stroke bg-white py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          value={selectedStatus}
          onChange={handleStatusChange}
        >
          <option value="all">{allcases}</option>
          <option value="in progress">{inprogress}</option>
          <option value="completed">{complete}</option>
        </select>
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

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto hidden lg:block">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-lightcyan text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {index}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {victimname}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {offendername}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {firno}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {reportdate}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {section}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {shortdesc}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {casestatus}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {action}
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
                      <p className="text-black dark:text-white">
                        {item.caseStatus}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4  dark:border-strokedark">
                      {item.caseStatus === 'Completed' && (
                        <button
                          className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:bg-black"
                          onClick={() => handleReopenClick(item.victimId)}
                        >
                          {reopen}
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleShareClick(item.victimId, item.officerId)
                        }
                        className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:bg-black"
                      >
                        {share}
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
                  <p className="text-black dark:text-white">
                    {casestatus} : {item.caseStatus}
                  </p>
                  <div className="flex gap-4 mt-2 justify-center">
                    {item.caseStatus === 'Completed' && (
                      <button
                        onClick={() => handleReopenClick(item.victimId)}
                        style={{
                          boxShadow:
                            'inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)',
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 from-slate-50 to-slate-200  p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                      >
                        {reopen}
                      </button>
                    )}
                    <button
                      style={{
                        boxShadow:
                          'inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)',
                      }}
                      onClick={() =>
                        handleShareClick(item.victimId, item.officerId)
                      }
                      className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 from-slate-50 to-slate-200  p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                    >
                      {share}
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
        totalCount={filteredCases.length}
        pageSize={PageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />
      <CaseShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShareCase}
        victimId={selectedCase?.victimId}
        officerId={selectedCase?.officerId}
      />
    </DefaultLayout>
  );
};

export default Viewallcases;
