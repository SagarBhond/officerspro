import { useEffect, useMemo, useState } from 'react';
import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Pagination from '../pages/Pagination';
import Firpopup from '../pages/Firpopup';
import request from '../Service/axios_helper';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

let PageSize = 5;
type AllstatementsProps = {
  handleLogout: () => void;
};

const Allstatements: React.FC<AllstatementsProps> = ({ handleLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState([{}]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isOpen, setIsOpen] = useState({});
  const nav = useNavigate();
  const { t } = useTranslation();
  const {
    index,
    victimname,
    offendername,
    reportdate,
    section,
    edit,
    nc,
    registercase,
    norecords,
    search,
  } = t('table');
  const { allstatements } = t('breadcrumb');

  const normalizeText = (text) => {
    // Normalize text to NFC form and convert to lowercase for case-insensitive comparison
    return text ? text.normalize('NFC').toLowerCase() : '';
  };

  const filteredCases = cases.filter((item) => {
    const normalizedQuery = normalizeText(searchQuery);

    return (
      normalizeText(item?.victimName).includes(normalizedQuery) ||
      normalizeText(item?.offenderName).includes(normalizedQuery) ||
      normalizeText(item?.sectionId).includes(normalizedQuery)
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
          (caseItem: any) => caseItem.firNo === null,
        );
        // const recentInProgressCases = inProgressCases;
        setCases(registeredCases);
        console.log(reversedCases);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const openPopup = (caseItem) => {
    setSelectedCase(caseItem);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedCase(null);
  };

  const handleSave = (firData) => {
    const formData = new FormData();
    formData.append('victimId', selectedCase.victimId);
    formData.append(
      'firDetails',
      JSON.stringify({
        firNo: firData.firNumber,
        shortDescription: firData.description,
      }),
    );
    formData.append('fir', firData.file);

    request('cms', 'POST', '/addFIR', formData)
      .then((res) => {
        console.log('FIR saved:', res);
        nav('/registeredCases');
        fetchCases();
      })
      .catch((err) => {
        console.error('Error saving FIR:', err);
      });

    closePopup();
  };

  const handleNcclicked = (caseInfo) => {
    console.log('Case Info:', caseInfo);
    nav('/Ncpage', { state: { caseInfo: caseInfo } });
  };

  function handleEditClick(victimId: any): void {
    nav(`/register-statement/${victimId}`, {
      state: { from: 'allstatements' },
    });
  }
  const toggleDetails = (index) => {
    setIsOpen((prevOpen) => ({
      ...prevOpen,
      [index]: !prevOpen[index],
    }));
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={allstatements} />
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

                <th className=" py-4 px-4 font-medium text-black dark:text-white">
                  {reportdate}
                </th>
                <th className=" py-4 px-4 font-medium text-black dark:text-white">
                  {section}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {edit}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {nc}
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  {registercase}
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
                            <path d="M10.681 18.207l-2.209 5.67 5.572-2.307-3.363-3.363zM26.855 6.097l-0.707-0.707c-0.78-0.781-2.047-0.781-2.828 0l-1.414 1.414 3.535 3.536 1.414-1.414c0.782-0.781 0.782-2.048 0-2.829zM10.793 17.918l0.506-0.506 3.535 3.535 9.9-9.9-3.535-3.535 0.707-0.708-11.113 11.114zM23.004 26.004l-17.026 0.006 0.003-17.026 11.921-0.004 1.868-1.98h-14.805c-0.552 0-1 0.447-1 1v19c0 0.553 0.448 1 1 1h19c0.553 0 1-0.447 1-1v-14.058l-2.015 1.977 0.054 11.085z"></path>{' '}
                          </g>
                        </svg>
                      </button>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <button
                        className="hover:text-primary"
                        onClick={() => handleNcclicked(item.victimId)}
                      >
                        <svg
                          width="35"
                          height="35"
                          viewBox="0 0 1024 1024"
                          className="fill-current"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                        >
                          <path
                            d="M892.87203 849.309805l-85.165757-132.98325c73.449438-61.147455 91.812821-169.05473 38.963956-251.592173v-0.010239c-19.235734-30.021342-45.560849-52.718831-75.318028-67.711584V156.550018c0-34.755787-28.275617-63.031404-63.031405-63.031404H189.695234c-34.755787 0-63.031404 28.275617-63.031404 63.031404v714.367863c0 34.766026 28.275617 63.042667 63.031404 63.042667h518.624538c34.755787 0 63.031404-28.275617 63.031405-63.042667V766.165197l73.105412 114.150928 48.415441-31.00632z m-82.472939-361.348585c44.413074 69.406115 24.130929 162.008351-45.253683 206.431664-6.959349 4.457997-14.240197 8.146032-21.676676 11.360008l-1.907499 0.790439c-16.52039 6.842626-33.645896 10.469227-50.66287 11.217688-0.499656 0.021502-0.998288 0.027645-1.498968 0.043003a148.948694 148.948694 0 0 1-24.142192-1.132417c-0.732078-0.097269-1.46518-0.263139-2.197258-0.370647a149.295791 149.295791 0 0 1-22.110803-4.913625c-0.565185-0.172013-1.152895-0.286688-1.716032-0.46382-7.393476-2.346745-14.565793-5.363111-21.52207-8.839202-0.897947-0.447438-1.807158-0.871326-2.69589-1.337195a148.804326 148.804326 0 0 1-19.5644-12.309149c-0.782248-0.582591-1.545043-1.191803-2.317053-1.789752-6.189387-4.791783-12.075704-10.049434-17.518678-15.861007-0.542659-0.582591-1.037196-1.216376-1.572688-1.808182-5.550482-6.119763-10.7467-12.670581-15.329611-19.830611v-0.010238c-0.475083-0.740269-0.842658-1.523541-1.303406-2.270978-2.20033-3.572336-4.330011-7.170269-6.19553-10.849089-0.452557-0.888732-0.789416-1.817396-1.221495-2.712272-1.763131-3.656294-3.473019-7.328971-4.913626-11.069225-0.101365-0.260067-0.167917-0.53242-0.267234-0.794535-20.888285-55.156702-7.099621-118.065241 34.962612-159.411777 0.184299-0.17918 0.343002-0.379861 0.527301-0.559042 2.959029-2.878142 6.135121-5.585294 9.368551-8.242277 0.670645-0.549826 1.273713-1.164158 1.955621-1.701697a150.194762 150.194762 0 0 1 12.320412-8.800294c5.714304-3.658342 11.620075-6.761739 17.607756-9.551827 2.247428-1.042315 4.566529-1.868591 6.854912-2.795207 3.774041-1.532756 7.566513-2.987697 11.409154-4.19281 2.776777-0.869279 5.587342-1.596237 8.405075-2.299646a146.98181 146.98181 0 0 1 10.511207-2.235142c2.927288-0.509895 5.857648-0.976787 8.808485-1.312621 3.597933-0.406482 7.19689-0.60614 10.800967-0.750508 2.879166-0.116723 5.755259-0.298975 8.641592-0.249828 2.754252 0.05017 5.492121 0.305118 8.236133 0.505799 3.252884 0.235494 6.508839 0.431056 9.75046 0.880542 2.753228 0.380885 5.463452 0.990097 8.189035 1.522517 3.219095 0.629689 6.444334 1.207161 9.631689 2.050843 2.563809 0.678836 5.064137 1.582927 7.590062 2.396915 3.303054 1.064841 6.616347 2.080535 9.863087 3.382917 27.89678 11.176732 52.740333 30.715536 70.153551 57.882285zM189.695234 136.605756h518.624538c11.003696 0 19.944262 8.951829 19.944262 19.944262v120.141681H169.750972V156.550018c0-10.992433 8.940567-19.944262 19.944262-19.944262z m538.5688 734.312125c0 11.003696-8.941591 19.955525-19.944262 19.955525H189.695234c-11.003696 0-19.944262-8.951829-19.944262-19.955525V319.778841h558.513062v61.401379c-0.373718-0.08703-0.75358-0.119795-1.127297-0.203753-4.287008-0.972691-8.627258-1.659718-12.97058-2.340602-1.801014-0.280545-3.588718-0.689075-5.394851-0.916378-43.230486-5.526933-88.546627 3.426944-128.052219 28.717936a196.346393 196.346393 0 0 0-15.87227 11.337482c-0.891804 0.706481-1.675076 1.50204-2.550498 2.220807-4.150831 3.404419-8.21668 6.884605-12.041915 10.594142-0.230374 0.225255-0.429008 0.472011-0.657335 0.697266-26.495081 25.94423-44.975187 58.982962-53.094597 96.049658-8.200298 37.361576-5.161406 75.423489 8.334426 110.302142l0.003072 0.008192c2.03958 5.269938 4.39042 10.442606 6.90713 15.553841 0.357336 0.727982 0.627642 1.484634 0.995217 2.210569a195.473019 195.473019 0 0 0 9.701313 16.977042c5.019086 7.83989 10.695506 15.072616 16.663734 22.001248 1.127298 1.305454 2.228998 2.62217 3.385989 3.890765 6.055258 6.661398 12.482186 12.898907 19.355528 18.5999 0.653239 0.540611 1.344361 1.017742 2.003744 1.549139a189.879533 189.879533 0 0 0 21.128897 14.779785c0.809893 0.489417 1.587022 1.025933 2.404083 1.503063 7.62897 4.451853 15.583535 8.350809 23.820692 11.727583 1.40989 0.579519 2.840258 1.06996 4.263458 1.615691 7.341258 2.808517 14.866815 5.216696 22.606364 7.138528 1.14368 0.283616 2.253572 0.657334 3.401348 0.920473 0.627642 0.144368 1.224567 0.364503 1.854256 0.502728 8.16139 1.788728 16.356568 2.878142 24.551746 3.608172 1.450846 0.125938 2.904763 0.144368 4.360728 0.236517 4.228646 0.280545 8.461388 0.689075 12.680819 0.689075 3.062441 0 6.073688-0.504775 9.123843-0.651191a189.848817 189.848817 0 0 0 8.931351-0.637881c7.026925-0.670645 13.9617-1.771322 20.863711-3.216023 1.470299-0.309213 2.954933-0.336858 4.421137-0.680884v114.952629z"
                            fill=""
                          />

                          <path
                            d="M205.656582 164.881373h86.174285v86.174285h-86.174285zM205.656582 381.418785h243.353993V450.031388H205.656582zM205.656582 575.827987h243.353993v68.613628H205.656582zM205.656582 771.191451h66.706129v66.706128h-66.706129zM343.298511 771.191451h66.706128v66.706128h-66.706128zM480.938391 771.191451h66.707153v66.706128h-66.707153zM618.580319 769.933095h66.707153v66.706129h-66.707153z"
                            fill=""
                          />
                        </svg>
                      </button>
                    </td>
                    <td className="border-b border-[#eee] py-4 dark:border-strokedark">
                      <button
                        className="hover:text-primary"
                        onClick={() => openPopup(item)}
                      >
                        <svg
                          className="fill-current"
                          fill=""
                          height="30"
                          width="30"
                          version="1.1"
                          id="Layer_1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
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
                              <g>
                                {' '}
                                <g>
                                  {' '}
                                  <path d="M465.807,109.398L359.533,3.126c-0.337-0.337-0.7-0.64-1.075-0.925c-0.095-0.073-0.19-0.144-0.286-0.212 c-0.377-0.267-0.763-0.518-1.169-0.735c-0.027-0.013-0.054-0.022-0.081-0.037c-0.383-0.201-0.782-0.371-1.188-0.523 c-0.112-0.042-0.224-0.083-0.336-0.121c-0.433-0.146-0.872-0.275-1.322-0.365c-0.01-0.002-0.018-0.002-0.028-0.004 c-0.439-0.085-0.885-0.135-1.336-0.166c-0.122-0.009-0.243-0.013-0.365-0.017C352.227,0.015,352.108,0,351.988,0H53.325 c-5.893,0-10.669,4.777-10.669,10.669v490.663c0,5.891,4.775,10.669,10.669,10.669h405.328c5.892,0,10.669-4.777,10.669-10.669 V117.758c0.006-0.142,0.021-0.282,0.021-0.424C469.344,114.184,467.978,111.352,465.807,109.398z M362.657,36.426l70.239,70.24 h-70.239V36.426z M447.985,490.663H63.994V21.337h277.326v21.331h-68.655c-5.892,0-10.669,4.779-10.669,10.669 c0,5.892,4.776,10.669,10.669,10.669h68.655v53.328c0,5.89,4.777,10.669,10.669,10.669h95.997V490.663z"></path>{' '}
                                  <path d="M241.767,64.006h0.254c5.891,0,10.669-4.776,10.669-10.669c0-5.89-4.777-10.669-10.669-10.669h-0.254 c-5.892,0-10.669,4.779-10.669,10.669C231.098,59.23,235.874,64.006,241.767,64.006z"></path>{' '}
                                  <path d="M175.315,447.999H95.991c-5.892,0-10.669,4.776-10.669,10.669c0,5.891,4.776,10.669,10.669,10.669h79.323 c5.892,0,10.669-4.777,10.669-10.669C185.984,452.774,181.207,447.999,175.315,447.999z"></path>{' '}
                                  <path d="M206.215,447.999h-0.254c-5.892,0-10.669,4.776-10.669,10.669c0,5.891,4.776,10.669,10.669,10.669h0.254 c5.891,0,10.669-4.777,10.669-10.669C216.883,452.774,212.106,447.999,206.215,447.999z"></path>{' '}
                                  <path d="M349.065,201.229l-27.774-27.772c-4.165-4.165-10.919-4.167-15.088-0.002c-5.142,5.14-14.694,8.21-25.548,8.21 c-7.577,0-14.803-1.561-19.332-4.174c-3.301-1.906-7.368-1.906-10.669,0c-4.527,2.613-11.756,4.174-19.332,4.174 c-10.854,0.002-20.404-3.067-25.546-8.207c-4.165-4.167-10.92-4.165-15.087,0l-27.776,27.772 c-3.589,3.59-4.153,9.212-1.346,13.443c15.941,24.033,10.695,39.183,4.624,56.725c-0.725,2.094-1.44,4.159-2.106,6.209 c-11.38,35.008,7.427,55.969,22.563,68.69c14.515,12.199,29.595,18.738,41.713,23.994c8.681,3.763,16.178,7.016,20.081,10.918 c2,2.003,4.715,3.128,7.544,3.128c0,0,0,0,0.001,0c2.828,0,5.543-1.126,7.544-3.126c4.075-4.075,11.635-7.341,20.39-11.125 c12.011-5.188,26.959-11.648,41.405-23.79c15.137-12.719,33.941-33.677,22.564-68.688c-0.667-2.053-1.382-4.119-2.107-6.213 c-6.072-17.54-11.314-32.692,4.626-56.723C353.219,210.442,352.655,204.819,349.065,201.229z M311.601,329.962 c-12.053,10.129-24.851,15.659-36.14,20.537c-7.256,3.137-13.845,5.982-19.499,9.635c-5.529-3.53-11.995-6.335-19.109-9.42 c-11.409-4.949-24.343-10.557-36.474-20.752c-17.45-14.665-21.936-27.496-15.999-45.761c0.625-1.924,1.296-3.861,1.977-5.824 c5.748-16.604,13.454-38.862-2.447-67.965l15.336-15.334c8.729,5.107,19.917,7.927,32.079,7.925 c9.064,0,17.607-1.554,24.666-4.436c7.06,2.882,15.604,4.436,24.666,4.436c12.162,0,23.353-2.818,32.081-7.925l15.336,15.334 c-15.901,29.101-8.196,51.36-2.451,67.961c0.681,1.965,1.352,3.905,1.977,5.828C333.536,302.467,329.049,315.299,311.601,329.962 z"></path>{' '}
                                  <path d="M255.989,234.663c-23.527,0-42.667,19.141-42.667,42.668c0,23.53,19.141,42.67,42.667,42.67 c23.529,0,42.669-19.141,42.669-42.67C298.659,253.803,279.518,234.663,255.989,234.663z M255.989,298.664 c-11.761,0-21.33-9.571-21.33-21.333c0-11.76,9.569-21.331,21.33-21.331c11.761,0,21.332,9.571,21.332,21.331 C277.321,289.094,267.75,298.664,255.989,298.664z"></path>{' '}
                                </g>{' '}
                              </g>{' '}
                            </g>{' '}
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
                      onClick={() => handleNcclicked(item.victimId)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 from-slate-50 to-slate-200  p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                    >
                      {nc}
                    </button>
                    <button
                      style={{
                        boxShadow:
                          'inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)',
                      }}
                      onClick={() => openPopup(item)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 from-slate-50 to-slate-200  p-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
                    >
                      {registercase}
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
      <Firpopup isOpen={isPopupOpen} onClose={closePopup} onSave={handleSave} />
    </DefaultLayout>
  );
};

export default Allstatements;
