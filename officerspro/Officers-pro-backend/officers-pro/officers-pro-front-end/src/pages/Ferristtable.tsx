import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import { useEffect, useState } from 'react';
import request from '../Service/axios_helper';
import AddTypePopup from '../pages/AddTypePopup';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

type ferristtableProps = {
  handleLogout: () => void;
};
const Ferristtable: React.FC<ferristtableProps> = ({ handleLogout }) => {
  const { victimId } = useParams();
  const [ferristData, setFerristData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isOpen, setIsOpen] = useState({});
  const [editingFerrist, setEditingFerrist] = useState(null);
  const navigate = useNavigate();

  const { t } = useTranslation();
  const {
    addtype,
    viewchargesheet,
    index,
    doctype,
    docdesc,
    date,
    filename,
    pagecount,
    norecords,
    dlt,
    edit,
  } = t('ferristtable');

  const { ferristtable } = t('breadcrumb');

  const fetchFerristData = async () => {
    try {
      const response = await request(
        'cms',
        'GET',
        `/fetchAllFerrist/${victimId}`,
        {},
      );
      setFerristData(response);
    } catch (error) {
      console.error('Error fetching ferrist data:', error);
    }
  };

  const fetchSingleFerrist = async (ferristId) => {
    try {
      const response = await request(
        'cms',
        'GET',
        `/singleFerrist/${ferristId}`,
        {},
      );
      setEditingFerrist(response);
      setIsPopupOpen(true);
    } catch (error) {
      console.error('Error fetching single ferrist data:', error);
    }
  };

  useEffect(() => {
    fetchFerristData();
  }, [victimId]);

  const handleAddType = () => {
    setEditingFerrist(null);
    setIsPopupOpen(true);
  };

  const handleEditClick = (ferristId) => {
    fetchSingleFerrist(ferristId);
  };

  const handleDeleteClick = async (ferristId) => {
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
        await request(
          'cms',
          'DELETE',
          `/deleteFerrist/${victimId}/${ferristId}`,
          {},
        );
        console.log('Ferrist deleted successfully.');
        fetchFerristData();
        Swal.fire({
          title: 'Deleted!',
          text: 'Ferrist has been deleted.',
          icon: 'success',
        });
      }
    } catch (error) {
      console.error('Error deleting ferrist:', error);
    }
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  const handleTypeAdded = () => {
    fetchFerristData();
  };

  function viewChargesheet(victimId: any): void {
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
      <Breadcrumb pageName={ferristtable} />
      <div className="flex justify-end">
        <button
          className="relative text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          type="button"
          onClick={handleAddType}
        >
          {addtype}
        </button>
        <button
          className="relative text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          type="button"
          onClick={() => viewChargesheet(victimId)}
        >
          {viewchargesheet}
        </button>
      </div>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ">
        <div className="max-w-full overflow-x-auto hidden lg:block">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-lightcyan text-left dark:bg-meta-4">
                <th className=" py-4 px-4 font-medium text-black dark:text-white ">
                  {index}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {doctype}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {docdesc}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {date}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {pagecount}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {filename}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {edit}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {dlt}
                </th>
              </tr>
            </thead>
            <tbody>
              {ferristData.length > 0 ? (
                ferristData.map((item, index) => (
                  <tr key={index}>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{index + 1}</p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.docType}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.docDescription}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {new Date(item.date).toLocaleString('mr-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          weekday: 'long',
                        })}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.pageCount}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.ferristFile.fileName
                          ? item.ferristFile.fileName
                          : 'N/A'}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <button
                        className="hover:text-primary"
                        onClick={() => handleEditClick(item.ferristId)}
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
                        onClick={() => handleDeleteClick(item.ferristId)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          className="fill-current"
                          width="30"
                          height="30"
                          viewBox="0 0 427 427.001"
                        >
                          <g>
                            <path
                              d="M232.398 154.703c-5.523 0-10 4.477-10 10v189c0 5.52 4.477 10 10 10 5.524 0 10-4.48 10-10v-189c0-5.523-4.476-10-10-10zM114.398 154.703c-5.523 0-10 4.477-10 10v189c0 5.52 4.477 10 10 10 5.524 0 10-4.48 10-10v-189c0-5.523-4.476-10-10-10zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M28.398 127.121V373.5c0 14.563 5.34 28.238 14.668 38.05A49.246 49.246 0 0 0 78.796 427H268a49.233 49.233 0 0 0 35.73-15.45c9.329-9.812 14.668-23.487 14.668-38.05V127.121c18.543-4.922 30.559-22.836 28.079-41.863-2.485-19.024-18.692-33.254-37.88-33.258h-51.199V39.5a39.289 39.289 0 0 0-11.539-28.031A39.288 39.288 0 0 0 217.797 0H129a39.288 39.288 0 0 0-28.063 11.469A39.289 39.289 0 0 0 89.398 39.5V52H38.2C19.012 52.004 2.805 66.234.32 85.258c-2.48 19.027 9.535 36.941 28.078 41.863zM268 407H78.797c-17.098 0-30.399-14.688-30.399-33.5V128h250v245.5c0 18.813-13.3 33.5-30.398 33.5zM109.398 39.5a19.25 19.25 0 0 1 5.676-13.895A19.26 19.26 0 0 1 129 20h88.797a19.26 19.26 0 0 1 13.926 5.605 19.244 19.244 0 0 1 5.675 13.895V52h-128zM38.2 72h270.399c9.941 0 18 8.059 18 18s-8.059 18-18 18H38.199c-9.941 0-18-8.059-18-18s8.059-18 18-18zm0 0"
                              fill=""
                            ></path>
                            <path
                              d="M173.398 154.703c-5.523 0-10 4.477-10 10v189c0 5.52 4.477 10 10 10 5.524 0 10-4.48 10-10v-189c0-5.523-4.476-10-10-10zm0 0"
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
          {ferristData.length > 0 ? (
            ferristData.map((item, index) => (
              <div
                key={index}
                className="border-b border-stroke dark:border-strokedark pb-4"
              >
                <button
                  onClick={() => toggleDetails(index)}
                  className="w-full text-left py-2 font-medium text-black dark:text-white flex align-middle justify-between"
                >
                  {index + 1}
                  {'. '}
                  {doctype}
                  {' :'} {item.docType}
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
                    {filename} : {item.ferristFile.fileName}
                  </p>
                  <p className="text-black dark:text-white">
                    {docdesc} : {item.docDescription}
                  </p>
                  <p className="text-black dark:text-white">
                    {date} :{' '}
                    {new Date(item.date).toLocaleString('mr-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      weekday: 'long',
                    })}
                  </p>
                  <p className="text-black dark:text-white">
                    {pagecount} : {item.pageCount}
                  </p>

                  <div className="flex gap-4 mt-2 justify-center">
                    <button
                      style={{
                        boxShadow:
                          'inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)',
                      }}
                      onClick={() => handleEditClick(item.ferristId)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 from-slate-50 to-slate-200  p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                    >
                      {edit}
                    </button>
                    <button
                      style={{
                        boxShadow:
                          'inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)',
                      }}
                      onClick={() => handleDeleteClick(item.ferristId)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 from-slate-50 to-slate-200  p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                    >
                      {dlt}
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

      <AddTypePopup
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        victimId={victimId}
        onTypeAdded={handleTypeAdded}
        ferristData={editingFerrist}
      />
    </DefaultLayout>
  );
};

export default Ferristtable;
