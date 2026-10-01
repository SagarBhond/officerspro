import React, { useEffect, useState } from 'react';
import RaiseIssuePopup from './RaiseIssuePopup';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import request from '../../Service/axios_helper';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

type HelpAndSupportPageProps = {
  handleLogout: () => void;
};

const HelpAndSupportPage: React.FC<HelpAndSupportPageProps> = ({
  handleLogout,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [issuesList, setIssuesList] = useState([]);
  const [isOpen, setIsOpen] = useState({});
  const [officer, setOfficer] = useState({});
  const [currentUuid, setCurrentUuid] = useState('');

  const { t } = useTranslation();
  const { helpsupport } = t('breadcrumb');
  const {
    search,
    tickitid,
    name,
    issue,
    response,
    createdon,
    edit,
    dlt,
    raiseissue,
  } = t('helpsupport');

  useEffect(() => {
    fetchOfficerDetails();
  }, []);

  useEffect(() => {
    fetchListOfIssuesOfOfficer();
  }, [officer.officerId]);

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

  const fetchListOfIssuesOfOfficer = async () => {
    const response = await request(
      'cms',
      'GET',
      `/getAllHelpAndSupportWithOfficer/${officer.officerId}`,
      {},
    );
    setIssuesList(response);
  };

  const normalizeText = (text) => {
    // Normalize text to NFC form and convert to lowercase for case-insensitive comparison
    return text ? text.normalize('NFC').toLowerCase() : '';
  };

  const filteredCases = issuesList.filter((item) => {
    const normalizedQuery = normalizeText(searchQuery);

    return (
      normalizeText(item?.uuid).includes(normalizedQuery) ||
      normalizeText(item?.subject).includes(normalizedQuery) ||
      normalizeText(item?.issueDesc).includes(normalizedQuery)
    );
  });

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleOpen = (): void => {
    setIsModalOpen(true);
  };

  const handleClose = (): void => {
    setIsModalOpen(false);
    setCurrentUuid('');
    fetchListOfIssuesOfOfficer();
  };

  const handleEditClick = (uuid): void => {
    setCurrentUuid(uuid);
    setIsModalOpen(true);
  };

  const handleDelete = (uuid) => {
    // Display SweetAlert confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this issue!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      // If user confirms deletion
      if (result.isConfirmed) {
        // Send delete request
        request('cms', 'DELETE', `/deleteByUuid/${uuid}`, {})
          .then(() => {
            // If deletion is successful, show success message
            Swal.fire('Deleted!', 'The issue has been deleted.', 'success');
            fetchListOfIssuesOfOfficer();
            // You may want to trigger any additional actions after successful deletion here
          })
          .catch((error) => {
            // If an error occurs during deletion, show error message
            console.error('Error deleting issue:', error);
            Swal.fire(
              'Error!',
              'An error occurred while deleting the issue.',
              'error',
            );
          });
      }
    });
  };
  const toggleDetails = (index) => {
    setIsOpen((prevOpen) => ({
      ...prevOpen,
      [index]: !prevOpen[index],
    }));
  };
  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={helpsupport} />
      <div className="p-6 font-sans">
        <div className="Searchbar pt-2 relative mx-auto text-gray-600 flex flex-col md:flex-row justify-between items-center gap-4 my-6 ">
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
          <button
            onClick={handleOpen}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            {raiseissue}
          </button>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ">
          <div className="max-w-full overflow-x-auto hidden lg:block">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-lightcyan text-left dark:bg-meta-4">
                  <th className=" py-4 px-4 font-medium text-black dark:text-white">
                    {tickitid}
                  </th>
                  <th className=" py-4 px-4 font-medium text-black dark:text-white">
                    {name}
                  </th>
                  <th className=" py-4 px-4 font-medium text-black dark:text-white">
                    {issue}
                  </th>
                  <th className=" py-4 px-4 font-medium text-black dark:text-white">
                    {response}
                  </th>
                  <th className=" py-4 px-4 font-medium text-black dark:text-white">
                    {createdon}
                  </th>
                  <th className=" py-4 px-4 font-medium text-black dark:text-white">
                    {edit}
                  </th>
                  <th className=" py-4 px-4 font-medium text-black dark:text-white">
                    {dlt}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((entry, index) => (
                  <tr key={index}>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark text-black dark:text-white">
                      {entry.uuid}
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark text-black dark:text-white">
                      {entry.subject}
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark text-black dark:text-white">
                      {entry.issueDesc}
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark text-black dark:text-white">
                      {entry.response ? entry.response : 'No Response'}
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark text-black dark:text-white">
                      {new Date(entry.createdOn).toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        weekday: 'long',
                      })}
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <button
                        onClick={() => {
                          handleEditClick(entry.uuid);
                        }}
                        className="hover:text-primary"
                      >
                        <svg
                          className="fill-current"
                          fill=""
                          width="30"
                          height="30"
                          viewBox="0 0 16 16"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M57.5,41a.5.5,0,0,0-.5.5V43H47V31h2v.5a.5.5,0,0,0,.5.5h5a.5.5,0,0,0,.5-.5V31h2v.5a.5.5,0,0,0,1,0v-1a.5.5,0,0,0-.5-.5H55v-.5A1.5,1.5,0,0,0,53.5,28h-3A1.5,1.5,0,0,0,49,29.5V30H46.5a.5.5,0,0,0-.5.5v13a.5.5,0,0,0,.5.5h11a.5.5,0,0,0,.5-.5v-2A.5.5,0,0,0,57.5,41ZM50,29.5a.5.5,0,0,1,.5-.5h3a.5.5,0,0,1,.5.5V31H50Zm11.854,4.646-2-2a.5.5,0,0,0-.708,0l-6,6A.5.5,0,0,0,53,38.5v2a.5.5,0,0,0,.5.5h2a.5.5,0,0,0,.354-.146l6-6A.5.5,0,0,0,61.854,34.146ZM54,40V38.707l5.5-5.5L60.793,34.5l-5.5,5.5Zm-2,.5a.5.5,0,0,1-.5.5h-2a.5.5,0,0,1,0-1h2A.5.5,0,0,1,52,40.5Zm0-3a.5.5,0,0,1-.5.5h-2a.5.5,0,0,1,0-1h2A.5.5,0,0,1,52,37.5ZM54.5,35h-5a.5.5,0,0,1,0-1h5a.5.5,0,0,1,0,1Z"
                            transform="translate(-46 -28)"
                            fill=""
                          />
                        </svg>
                      </button>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <button
                        onClick={() => {
                          handleDelete(entry.uuid);
                        }}
                        className="hover:text-primary"
                      >
                        <svg
                          className="fill-current"
                          xmlns="http://www.w3.org/2000/svg"
                          fill=""
                          width="33"
                          height="33"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                            fill=""
                          ></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lg:hidden space-y-4">
            {filteredCases.length > 0 ? (
              filteredCases.map((entry, index) => (
                <div
                  key={index}
                  className="border-b border-stroke dark:border-strokedark pb-4"
                >
                  <button
                    onClick={() => toggleDetails(index)}
                    className="w-full text-left py-2 font-medium text-black dark:text-white flex justify-between"
                  >
                    {index + 1}. {name}: {entry.subject}
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
                  <div className={`pt-2 ${isOpen[index] ? 'block' : 'hidden'}`}>
                    <p className="text-black dark:text-white">
                      {tickitid}: {entry.uuid}
                    </p>
                    <p className="text-black dark:text-white">
                      {issue}: {entry.issueDesc}
                    </p>
                    <p className="text-black dark:text-white">
                      {response}: {entry.response || 'No Response'}
                    </p>
                    <p className="text-black dark:text-white">
                      {createdon}:{' '}
                      {new Date(entry.createdOn).toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        weekday: 'long',
                      })}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <button
                        onClick={() => handleEditClick(entry.uuid)}
                        className="hover:text-primary p-2 rounded border border-slate-300"
                      >
                        {edit}
                      </button>
                      <button
                        onClick={() => handleDelete(entry.uuid)}
                        className="hover:text-primary p-2 rounded border border-slate-300"
                      >
                        {dlt}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4">no records</p>
            )}
          </div>
        </div>
        {isModalOpen && (
          <RaiseIssuePopup
            officerId={officer.officerId}
            uuid={currentUuid}
            onClose={handleClose}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default HelpAndSupportPage;
