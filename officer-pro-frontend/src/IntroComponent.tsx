import React, { useEffect, useState } from 'react';
import './css/introcss.css';

interface IntroComponentProps {
  onLogin: () => void;
}

const IntroComponent: React.FC<IntroComponentProps> = ({ onLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = [
    'images/dashboard.png',
    'images/registerstatement.png',
    'images/ncpage.png',
    'images/casediary.png',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length,
    );
  };

  // Toggle function for opening and closing the menu
  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // ✅ Trigger Keycloak login when user clicks button
  const handleLogin = () => {
    console.log('🔐 User clicked login, redirecting to Keycloak...');
    onLogin();
  };

  return (
    <>
      <section className="main-banner" id="home">
        <div className="layer">
          <div className="header-wthree-top-w3layouts text-right">
            <h1 className="logo responsive-header">
              <a>Officer's PRO</a>
            </h1>
            <ul className="list-unstyled apps-lists text-right">
              <li>
                <a
                  onClick={handleLogin}
                  className="btn"
                  style={{ cursor: 'pointer' }}
                >
                  <span className="fa fa-globe mr-2" aria-hidden="true"></span>{' '}
                  Try Officer's PRO
                </a>
              </li>
            </ul>
            <ul id="menu" className="relative">
              <li>
                {/* Checkbox is hidden, but it still controls the menu */}
                <input
                  id="check02"
                  type="checkbox"
                  className="hidden"
                  checked={isOpen}
                  readOnly
                />
                <label
                  htmlFor="check02"
                  className="cursor-pointer"
                  onClick={toggleMenu}
                >
                  <span aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      version="1.1"
                      width="30"
                      height="30"
                      x="0"
                      y="0"
                      viewBox="0 0 464.205 464.205"
                    >
                      <g>
                        <path
                          d="M435.192 406.18H29.013C12.989 406.18 0 393.19 0 377.167s12.989-29.013 29.013-29.013h406.18c16.023 0 29.013 12.99 29.013 29.013-.001 16.023-12.99 29.013-29.014 29.013zM435.192 261.115H29.013C12.989 261.115 0 248.126 0 232.103s12.989-29.013 29.013-29.013h406.18c16.023 0 29.013 12.989 29.013 29.013s-12.99 29.012-29.014 29.012zM435.192 116.051H29.013C12.989 116.051 0 103.062 0 87.038s12.989-29.013 29.013-29.013h406.18c16.023 0 29.013 12.989 29.013 29.013s-12.99 29.013-29.014 29.013z"
                          fill="#ffffff"
                          opacity="1"
                        ></path>
                      </g>
                    </svg>
                  </span>
                </label>
                <ul
                  className={`submenu absolute mt-2 w-48 bg-white shadow-md rounded ${
                    isOpen ? 'block' : 'hidden'
                  }`}
                >
                  <li>
                    <a
                      href="#home"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <a
                      href="#about"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Why
                    </a>
                  </li>
                  <li>
                    <a
                      href="#services"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#screen"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Screen Shots
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          <div className="container mx-auto text-center">
            <div className="baner-info-w3layouts">
              <h3 className="text-2xl font-bold">Welcome To Officer's PRO</h3>
              <h6 className="mx-auto mt-md-4 mt-3 text-lg">
                Where Technology Meets Justice
              </h6>
              <div className="m-6">
                <a
                  href="/images/manuel.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="pdf">Open Manual</button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="p-12 bg-gray-50" id="about">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap text-left pb-6">
            <div className="w-full lg:w-1/2 pt-8">
              <img
                src="images/questioning.png"
                className="w-full h-auto object-cover"
                alt="mobile-image"
              />
            </div>
            {/* Right Column: Text Content */}
            <div className="w-full lg:w-1/2 lg:pl-12">
              <div className="pt-8">
                <h3 className="text-3xl font-bold mb-6">Why Officer's PRO?</h3>
              </div>
              <p className="mb-4">
                Let’s talk about the problem. When a complaint is filed, the
                process can be slow and tedious. Filling out forms and writing
                statements takes a lot of time, and every minute counts in an
                investigation.
              </p>
              <p className="mb-6">
                That’s where Officer's PRO comes in! This app makes it easy for
                you to register statements from complaints quickly. With just a
                few clicks, Officer's PRO can create a detailed statement,
                giving you more time to focus on your investigation.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="fa fa-check text-green-500 mr-2"></span>
                  Automatic statement generation
                </li>
                <li className="flex items-start">
                  <span className="fa fa-check text-green-500 mr-2"></span>
                  Options to register a First Information Report (FIR) and also
                  generate Non-Cognizable (NC) reports.
                </li>
                <li className="flex items-start">
                  <span className="fa fa-check  mr-2"></span>A daily
                  investigation log where you can add notes about what you did
                  each day.
                </li>
                <li className="flex items-start">
                  <span className="fa fa-check text-green-500 mr-2"></span>
                  The ability to upload evidence in various formats like
                  pictures, PDFs, and videos—all in one place!
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="services p-12" id="services">
        <div className="container mx-auto py-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold">What Officer's PRO Offers</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            <div className="p-8 bg-white shadow-md rounded-lg">
              <span aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 682.667 682.667"
                >
                  <g>
                    <defs>
                      <clipPath id="a" clipPathUnits="userSpaceOnUse">
                        <path
                          d="M0 512h512V0H0Z"
                          fill="#000000"
                          opacity="1"
                          data-original="#000000"
                        ></path>
                      </clipPath>
                    </defs>
                    <g
                      clip-path="url(#a)"
                      transform="matrix(1.33333 0 0 -1.33333 0 682.667)"
                    >
                      <path
                        d="M0 0v-307.856c0-24.263-19.669-43.933-43.933-43.933h-344.781c-24.264 0-43.933 19.669-43.933 43.933v408.322c0 24.264 19.669 43.933 43.933 43.933h244.315a54.91 54.91 0 0 0 38.828-16.083l89.488-89.487A54.916 54.916 0 0 0 0 0"
                        transform="translate(504.498 359.695)"
                        fill="#eaeaea"
                        data-original="#eaeaea"
                      ></path>
                      <path
                        d="M0 0v-9.375C0 8.366-14.387 22.753-32.127 22.753h-45.596c-24.26 0-43.928 19.667-43.928 43.928v45.595c0 17.741-14.387 32.128-32.127 32.128h9.374a54.958 54.958 0 0 0 38.837-16.084l89.483-89.484A54.955 54.955 0 0 0 0 0"
                        transform="translate(504.5 359.688)"
                        fill="#dfdfdf"
                        data-original="#dfdfdf"
                      ></path>
                      <path
                        d="M0 0v21.018a54.916 54.916 0 0 1-16.083 38.829l-89.488 89.487a54.91 54.91 0 0 1-38.828 16.083h-31.602"
                        transform="translate(504.498 338.677)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0v.01"
                        transform="translate(73.34 40.46)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h-.01C5.01-18.75 22.1-32.56 42.43-32.56h344.79c24.26 0 43.93 19.67 43.93 43.94v298.48c0 17.74-14.39 32.12-32.13 32.12h-17.83"
                        transform="translate(73.35 40.46)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0v106c0 24.27 19.67 43.94 43.93 43.94h234.94c17.74 0 32.13-14.39 32.13-32.13v-45.6c0-23.52 18.48-42.72 41.71-43.87"
                        transform="translate(71.85 354.16)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h238.748"
                        transform="translate(191.783 237.758)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h-284.71"
                        transform="translate(430.531 190.185)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h-284.71"
                        transform="translate(430.531 142.602)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h145.033"
                        transform="translate(145.82 95.032)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="m0 0 21.697 56.968c.444 1.084 1.978 1.086 2.424.003L45.62 0"
                        transform="translate(205.774 382.728)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h32.196"
                        transform="translate(212.54 396.916)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0v57.674L38.993 1.21c.723-1.044 1.497-.533 1.497.737l-.54 55.835"
                        transform="translate(381.454 290.067)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="m0 0 10.156 56.269c.254 1.318 2.092 1.441 2.519.169l16.522-56c.4-1.192 2.09-1.184 2.479.013l15.957 55.978c.414 1.276 2.253 1.172 2.52-.143L60.91 0"
                        transform="translate(253.906 290.518)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h-24.125v-57.255H0"
                        transform="translate(334.205 439.982)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h-22.346"
                        transform="translate(332.426 411.355)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h-24.125v-57.255H0"
                        transform="translate(361.065 347.322)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h-22.346"
                        transform="translate(359.287 318.694)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0s-10.369 8.715-22.595 5.032C-33.822 1.65-35.392-11.295-27.27-16.59c0 0 7.97-3.556 16.81-6.817 21.279-7.849 12.113-28.435-5.018-28.435-8.578 0-15.778 3.757-20.135 8.565"
                        transform="translate(147.534 434.57)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h31.911"
                        transform="translate(167.374 440.51)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0v-55.937"
                        transform="translate(183.264 438.665)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h31.911"
                        transform="translate(258.933 440.51)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0v-55.937"
                        transform="translate(274.824 438.665)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h31.911"
                        transform="translate(439.552 347.85)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0v-55.937"
                        transform="translate(455.443 346.004)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0c-33.059 0-59.858-26.799-59.858-59.858v-84.934A201.39 201.39 0 0 1 0-288.064a201.39 201.39 0 0 1 59.858 143.272v84.934C59.858-26.799 33.059 0 0 0"
                        transform="translate(67.36 354.32)"
                        fill="#ffe077"
                        data-original="#ffe077"
                      ></path>
                      <path
                        d="M0 0c0-53.839 8.492-105.439 23.582-143.273A201.402 201.402 0 0 0-36.272 0v84.933c0 33.062 26.799 59.861 59.853 59.861C10.563 144.794 0 117.995 0 84.933Z"
                        transform="translate(43.774 209.527)"
                        fill="#ffd05b"
                        data-original="#ffd05b"
                      ></path>
                      <path
                        d="M0 0a201.328 201.328 0 0 0-48.98 131.64v84.93c0 33.06 26.8 59.86 59.86 59.86s59.86-26.8 59.86-59.86v-84.93c0-21.82-3.54-43.27-10.3-63.59"
                        transform="translate(56.48 77.89)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0a201.4 201.4 0 0 1 27.11 40.38"
                        transform="translate(78.24 77.89)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0c0-48.397-5.027-95.616-14.539-141.186C-24.051-95.616-29.078-48.397-29.078 0c0 48.398 5.027 95.616 14.539 141.186C-5.027 95.616 0 48.398 0 0"
                        transform="translate(81.9 149.092)"
                        fill="#818181"
                        data-original="#818181"
                      ></path>
                      <path
                        d="M0 0v-282.372c-9.512 45.57-14.539 92.789-14.539 141.186C-14.539-92.788-9.512-45.57 0 0"
                        transform="translate(67.362 290.278)"
                        fill="#595959"
                        data-original="#595959"
                      ></path>
                      <path
                        d="M0 0c9.513 45.572 14.54 92.79 14.54 141.186S9.513 236.799 0 282.372c-9.512-45.573-14.54-92.79-14.54-141.186S-9.512 45.572 0 0Z"
                        transform="translate(67.36 7.906)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                    </g>
                  </g>
                </svg>
              </span>
              <h3 className="text-xl font-semibold my-4">
                Automatic Statement Generation
              </h3>
              <p className="text-gray-600">
                Officer's pro automates the process of generating detailed
                statements from complaints, allowing officers to create reports
                quickly without starting from scratch.
              </p>
            </div>
            <div className="p-8 bg-white shadow-md rounded-lg">
              <span aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  width="30"
                  height="30"
                  x="0"
                  y="0"
                  viewBox="0 0 512 512"
                >
                  <g>
                    <path
                      d="M423.998 17.5v477c0 5.523-4.477 10-10 10H98.002c-5.523 0-10-4.477-10-10V98.461a43.251 43.251 0 0 1 12.668-30.585l47.708-47.709A43.255 43.255 0 0 1 178.963 7.5h235.035c5.523 0 10 4.477 10 10z"
                      fill="#eaf6ff"
                      data-original="#eaf6ff"
                    ></path>
                    <path
                      d="M413.998 7.5h-26c5.523 0 10 4.477 10 10v477c0 5.523-4.477 10-10 10h26c5.523 0 10-4.477 10-10v-477c0-5.523-4.477-10-10-10zM192.387 7.5c-12.119 0-21.952 9.834-21.952 21.952v49.201c0 6.229-5.05 11.279-11.279 11.279h-49.201c-12.119 0-21.952 9.834-21.952 21.952V98.461a43.253 43.253 0 0 1 12.668-30.585l47.708-47.709A43.253 43.253 0 0 1 178.963 7.5h13.424z"
                      fill="#c4e2ff"
                      data-original="#c4e2ff"
                    ></path>
                    <path
                      d="M313.88 43.349h2.695c14.372 0 26.023 11.651 26.023 26.023v17.115h-54.741V69.372c0-14.372 11.651-26.023 26.023-26.023z"
                      fill="#596c76"
                      data-original="#596c76"
                    ></path>
                    <path
                      d="M334.596 132.739v-31.363h-38.737v31.363a4.71 4.71 0 0 1-3.353 4.51l-26.601 8.007a12.125 12.125 0 0 0-8.63 11.61v34.466a3.69 3.69 0 0 0 3.69 3.69H369.49a3.69 3.69 0 0 0 3.69-3.69v-34.466c0-5.35-3.507-10.068-8.63-11.61l-26.601-8.007a4.71 4.71 0 0 1-3.353-4.51z"
                      fill="#fd8087"
                      data-original="#fd8087"
                    ></path>
                    <path
                      d="M311.958 157.279a4.473 4.473 0 0 0 6.539 0l18.906-20.245a4.702 4.702 0 0 1-2.807-4.296v-31.363h-38.737v31.363c0 1.88-1.121 3.55-2.807 4.296l18.906 20.245z"
                      fill="#ffbd86"
                      data-original="#ffbd86"
                    ></path>
                    <path
                      d="M342.598 82.279v19.023c0 6.448-14.162 17.899-20.255 20.009-3.36 1.166-10.867 1.166-14.227 0-6.093-2.11-20.259-13.56-20.259-20.009V73.786c26.015-11.779 27.371 18.431 54.741 8.493z"
                      fill="#fed2a4"
                      data-original="#fed2a4"
                    ></path>
                    <path
                      d="m195.227 245.86-16.632-24.722a10.776 10.776 0 0 0-8.941-4.761H59.232c-5.523 0-10 4.477-10 10V494.5c0 5.523 4.477 10 10 10h393.536c5.523 0 10-4.477 10-10V260.621c0-5.523-4.477-10-10-10h-248.6a10.776 10.776 0 0 1-8.941-4.761z"
                      fill="#5f99d7"
                      data-original="#5f99d7"
                    ></path>
                    <path
                      d="M452.768 250.621h-27c5.523 0 10 4.477 10 10V494.5c0 5.523-4.477 10-10 10h27c5.523 0 10-4.477 10-10V260.621c0-5.523-4.477-10-10-10z"
                      fill="#3c87d0"
                      data-original="#3c87d0"
                    ></path>
                    <path
                      d="M330.616 419.128h-8.912c-15.444 0-27.964-12.52-27.964-27.964v-7.399c0-.932.756-1.688 1.688-1.688h61.464c.932 0 1.688.756 1.688 1.688v7.399c0 15.444-12.52 27.964-27.964 27.964zM181.384 419.128h8.912c15.444 0 27.964-12.52 27.964-27.964v-7.399c0-.932-.756-1.688-1.688-1.688h-61.464c-.932 0-1.688.756-1.688 1.688v7.399c0 15.444 12.52 27.964 27.964 27.964zM291.259 470.712h-70.518a2.48 2.48 0 0 1-2.48-2.48v-7.715c0-11.429 9.265-20.693 20.693-20.693h34.092c11.429 0 20.693 9.265 20.693 20.693v7.715a2.48 2.48 0 0 1-2.48 2.48z"
                      fill="#fedf30"
                      data-original="#fedf30"
                    ></path>
                    <path
                      d="M88 216.38V98.46a43.25 43.25 0 0 1 12.67-30.58l47.71-47.71A43.25 43.25 0 0 1 178.96 7.5h60.82M274.78 7.5H414c5.52 0 10 4.48 10 10v233.12"
                      fill="none"
                      stroke="#000000"
                      stroke-width="15"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-miterlimit="10"
                      data-original="#000000"
                    ></path>
                    <path
                      d="M192.387 7.5c-12.119 0-21.952 9.834-21.952 21.952v49.201c0 6.229-5.05 11.279-11.279 11.279h-49.201c-12.119 0-21.952 9.834-21.952 21.952M287.859 73.788V69.37c0-14.37 11.651-26.02 26.021-26.02h2.7c14.37 0 26.02 11.65 26.02 26.02v12.909M293.052 137.035l18.906 20.245a4.473 4.473 0 0 0 6.539 0l18.906-20.245"
                      fill="none"
                      stroke="#000000"
                      stroke-width="15"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-miterlimit="10"
                      data-original="#000000"
                    ></path>
                    <path
                      d="M334.6 113.07v19.67c0 2.08 1.36 3.91 3.35 4.51l26.6 8.01c5.12 1.54 8.63 6.26 8.63 11.61v34.46c0 2.04-1.65 3.69-3.69 3.69H260.97c-2.04 0-3.69-1.65-3.69-3.69v-34.46c0-5.35 3.5-10.07 8.63-11.61l26.6-8.01c1.99-.6 3.35-2.43 3.35-4.51v-19.67"
                      fill="none"
                      stroke="#000000"
                      stroke-width="15"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-miterlimit="10"
                      data-original="#000000"
                    ></path>
                    <path
                      d="M342.6 82.279v19.022c0 6.448-14.163 17.899-20.256 20.009-3.36 1.166-10.867 1.166-14.227 0-6.093-2.11-20.257-13.56-20.257-20.009V73.788c26.014-11.779 27.369 18.43 54.74 8.491zM299.22 382.08l26.94-51.838 26.94 51.838M326.16 330.242v-13.116"
                      fill="none"
                      stroke="#000000"
                      stroke-width="15"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-miterlimit="10"
                      data-original="#000000"
                    ></path>
                    <path
                      d="M330.616 419.128h-8.912c-15.444 0-27.964-12.52-27.964-27.964v-7.399c0-.932.756-1.688 1.688-1.688h61.464c.932 0 1.688.756 1.688 1.688v7.399c0 15.444-12.52 27.964-27.964 27.964zM212.78 382.08l-26.94-51.838-26.94 51.838M185.84 330.242v-13.116"
                      fill="none"
                      stroke="#000000"
                      stroke-width="15"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-miterlimit="10"
                      data-original="#000000"
                    ></path>
                    <path
                      d="M181.384 419.128h8.912c15.444 0 27.964-12.52 27.964-27.964v-7.399c0-.932-.756-1.688-1.688-1.688h-61.464c-.932 0-1.688.756-1.688 1.688v7.399c0 15.444 12.52 27.964 27.964 27.964zM170.139 301.425c0 8.672 7.03 15.701 15.701 15.701 7.911 0 14.456-5.851 15.543-13.462.185-1.298 1.337-2.24 2.648-2.24h103.937c1.311 0 2.463.942 2.648 2.24 1.087 7.611 7.632 13.462 15.543 13.462 8.672 0 15.701-7.03 15.701-15.701M256 439.82V284.41M291.259 470.712h-70.518a2.48 2.48 0 0 1-2.48-2.48v-7.715c0-11.429 9.265-20.693 20.693-20.693h34.092c11.429 0 20.693 9.265 20.693 20.693v7.715a2.48 2.48 0 0 1-2.48 2.48z"
                      fill="none"
                      stroke="#000000"
                      stroke-width="15"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-miterlimit="10"
                      data-original="#000000"
                    ></path>
                    <path
                      d="M49.232 477.008V494.5c0 5.523 4.477 10 10 10h393.536c5.523 0 10-4.477 10-10V260.621c0-5.523-4.477-10-10-10h-248.6a10.776 10.776 0 0 1-8.941-4.761l-16.632-24.722a10.776 10.776 0 0 0-8.941-4.761H59.232c-5.523 0-10 4.477-10 10v215.63M124.987 126.241h95.303M124.987 155.238h95.303M124.987 184.235h95.303"
                      fill="none"
                      stroke="#000000"
                      stroke-width="15"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-miterlimit="10"
                      data-original="#000000"
                    ></path>
                  </g>
                </svg>
              </span>
              <h3 className="text-xl font-semibold my-4">
                FIR and NC Report Generation
              </h3>
              <p className="text-gray-600">
                The app offers the ability to register a First Information
                Report (FIR) and generate Non-Cognizable (NC) reports with ease.
              </p>
            </div>
            <div className="p-8 bg-white shadow-md rounded-lg">
              <span aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  width="35"
                  height="35"
                  x="0"
                  y="0"
                  viewBox="0 0 682.667 682.667"
                >
                  <g>
                    <defs>
                      <clipPath id="a" clipPathUnits="userSpaceOnUse">
                        <path
                          d="M0 512h512V0H0Z"
                          fill="#000000"
                          opacity="1"
                          data-original="#000000"
                        ></path>
                      </clipPath>
                    </defs>
                    <g
                      clip-path="url(#a)"
                      transform="matrix(1.33333 0 0 -1.33333 0 682.667)"
                    >
                      <path
                        d="M0 0v-345.352c0-2.76 2.239-5 5-5h256.479a5 5 0 0 1 5 5V0a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5"
                        transform="translate(120.67 415.44)"
                        fill="#e5eef9"
                        data-original="#e5eef9"
                      ></path>
                      <path
                        d="M0 0h-29a5 5 0 0 0 5-5v-345.353a5 5 0 0 0-5-4.999H0a5 5 0 0 1 5.001 5V-5A5 5 0 0 1 0 0"
                        transform="translate(382.148 420.44)"
                        fill="#c0d6f1"
                        data-original="#c0d6f1"
                      ></path>
                      <path
                        d="m0 0 141.452-51.484a4.44 4.44 0 0 0 2.652-5.689L92-200.326a4.439 4.439 0 0 0-5.687-2.653l-141.452 51.485a4.438 4.438 0 0 0-2.653 5.688L-5.688-2.653A4.438 4.438 0 0 0 0 0"
                        transform="translate(65.56 405.7)"
                        fill="#01d0fb"
                        data-original="#01d0fb"
                      ></path>
                      <path
                        d="m0 0-21.784 7.929a4.452 4.452 0 0 0 2.66-5.706l-52.094-143.127a4.45 4.45 0 0 0-5.705-2.661l21.784-7.929a4.438 4.438 0 0 1 5.688 2.652L2.652-5.688A4.438 4.438 0 0 1 0 0"
                        transform="translate(207.012 354.216)"
                        fill="#08a9f1"
                        data-original="#08a9f1"
                      ></path>
                      <path
                        d="m0 0-78.901 28.719 10.971 30.149c3.664 10.068 14.794 15.261 24.862 11.597L-.621 55.016c10.068-3.664 15.257-14.799 11.593-24.868Z"
                        transform="translate(120.6 214.102)"
                        fill="#017197"
                        data-original="#017197"
                      ></path>
                      <path
                        d="m0 0-15.845-43.532c-2.859-7.856 1.193-16.541 9.049-19.401 7.855-2.859 16.541 1.188 19.4 9.043l15.844 43.536z"
                        transform="translate(98.865 321.401)"
                        fill="#ffbd86"
                        data-original="#ffbd86"
                      ></path>
                      <path
                        d="m0 0-2.792-7.669c-5.566-15.295 2.32-32.207 17.615-37.773 15.295-5.568 32.206 2.318 37.773 17.613l2.792 7.67c5.566 15.295-2.32 32.206-17.615 37.773C22.479 23.181 5.567 15.295 0 0"
                        transform="translate(88.819 335.71)"
                        fill="#fed2a4"
                        data-original="#fed2a4"
                      ></path>
                      <path
                        d="m0 0 51.81-89.738c6.611-11.451 21.253-15.374 32.705-8.763 11.451 6.611 15.374 21.253 8.762 32.704L41.468 23.941a5.244 5.244 0 0 1-7.165 1.92L1.919 7.164A5.245 5.245 0 0 1 0 0"
                        transform="translate(408.01 139.434)"
                        fill="#528fd8"
                        data-original="#528fd8"
                      ></path>
                      <path
                        d="m0 0-51.81 89.738a5.245 5.245 0 0 1-7.165 1.92l-17.184-9.922c2.569 1.484 5.826.653 7.274-1.856l51.811-89.737c4.82-8.351 3.915-18.462-1.473-25.955a23.839 23.839 0 0 1 9.784 3.108C2.688-26.093 6.611-11.451 0 0"
                        transform="translate(501.288 73.637)"
                        fill="#0573ce"
                        data-original="#0573ce"
                      ></path>
                      <path
                        d="M0 0c-41.94-24.215-56.31-77.844-32.096-119.784 24.214-41.94 77.843-56.309 119.784-32.095 41.94 24.215 56.31 77.843 32.096 119.783C95.569 9.844 41.94 24.214 0 0"
                        transform="translate(319.953 339.836)"
                        fill="#017197"
                        data-original="#017197"
                      ></path>
                      <path
                        d="M0 0c-18.238 31.588-53.161 47.526-87.21 43.13C-60.992 39.77-36.588 24.656-22.352 0c24.214-41.94 9.845-95.569-32.095-119.784-10.353-5.977-21.417-9.593-32.574-11.034 18.375-2.356 37.641 1.056 54.924 11.035C9.844-95.568 24.214-41.94 0 0"
                        transform="translate(439.737 307.74)"
                        fill="#025f80"
                        data-original="#025f80"
                      ></path>
                      <path
                        d="M0 0c-26.922-15.543-36.146-49.969-20.603-76.891 15.544-26.922 49.969-36.145 76.891-20.602 26.922 15.544 36.147 49.969 20.603 76.89C61.348 6.319 26.923 15.544 0 0"
                        transform="translate(336.152 312.93)"
                        fill="#01d0fb"
                        data-original="#01d0fb"
                      ></path>
                      <path
                        d="M0 0v-30.006a5 5 0 0 1 5-5h110.996a5 5 0 0 1 5 5V0a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5"
                        transform="translate(193.411 435.443)"
                        fill="#017197"
                        data-original="#017197"
                      ></path>
                      <path
                        d="M0 0h-119.109"
                        transform="translate(312.52 192.74)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h-82.68"
                        transform="translate(276.09 263.93)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h-107.86"
                        transform="translate(312.64 335.12)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h67.738a5.002 5.002 0 0 0 5.001-5v-67.03"
                        transform="translate(314.41 420.44)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0v29.801c0 2.76 2.24 5 5 5h67.74"
                        transform="translate(120.67 385.64)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0v64.22"
                        transform="translate(120.67 149.86)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0v-109.261c0-2.76-2.24-5-5.001-5h-256.478c-2.76 0-5 2.24-5 5v44.772"
                        transform="translate(387.15 179.35)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="m0 0 10.972 30.149c3.659 10.07 14.792 15.257 24.861 11.597l6.999-2.548"
                        transform="translate(41.698 242.821)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="m0 0 6.999-2.552c10.06-3.67 15.262-14.797 11.592-24.867L7.619-57.567"
                        transform="translate(112.98 271.67)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="m0 0-7.83-21.501c-2.86-7.86 1.188-16.541 9.049-19.4 7.849-2.861 16.54 1.193 19.4 9.043L28.44-10.36"
                        transform="translate(90.85 299.37)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="m0 0-2.792-7.669c-5.566-15.295 2.32-32.207 17.615-37.773 15.295-5.568 32.206 2.318 37.773 17.613l2.792 7.67c5.566 15.295-2.32 32.206-17.615 37.773C22.479 23.181 5.567 15.295 0 0Z"
                        transform="translate(88.819 335.71)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="m0 0 141.452-51.484a4.44 4.44 0 0 0 2.652-5.689L92-200.326a4.439 4.439 0 0 0-5.687-2.653l-141.452 51.485a4.438 4.438 0 0 0-2.653 5.688L-5.688-2.653A4.438 4.438 0 0 0 0 0Z"
                        transform="translate(65.56 405.7)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="m0 0-18.479 32.007"
                        transform="translate(426.12 155.95)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="m0 0-14.21 24.613a5.245 5.245 0 0 1-7.165 1.92L-53.759 7.836A5.245 5.245 0 0 1-55.678.672l51.81-89.738c6.611-11.452 21.254-15.374 32.705-8.763 11.451 6.611 15.374 21.253 8.763 32.704L17.498-30.308"
                        transform="translate(463.688 138.762)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0c-26.922-15.543-36.146-49.969-20.603-76.891 15.544-26.922 49.969-36.145 76.891-20.602 26.922 15.544 36.147 49.969 20.603 76.89C61.348 6.319 26.923 15.544 0 0Z"
                        transform="translate(336.152 312.93)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0v-30.006a5 5 0 0 1 5-5h110.996a5 5 0 0 1 5 5V0a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5Z"
                        transform="translate(193.411 435.443)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0v11.423c0 12.378 10.035 22.413 22.413 22.413s22.413-10.035 22.413-22.413V0"
                        transform="translate(231.496 440.443)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0v-23.093a5 5 0 0 1 5-5h23.092a5 5 0 0 1 5 5V0a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5Z"
                        transform="translate(170.08 133.74)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0h71.432"
                        transform="translate(236.792 105.647)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                      <path
                        d="M0 0c-41.94-24.215-56.31-77.844-32.096-119.784 24.214-41.94 77.843-56.309 119.784-32.095 41.94 24.215 56.31 77.843 32.096 119.783C95.569 9.844 41.94 24.214 0 0Z"
                        transform="translate(319.953 339.836)"
                        fill="none"
                        stroke="#000000"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-dasharray="none"
                        stroke-opacity=""
                        data-original="#000000"
                      ></path>
                    </g>
                  </g>
                </svg>
              </span>
              <h3 className="text-xl font-semibold my-4">
                Daily Investigation Log
              </h3>
              <p className="text-gray-600">
                Officers can maintain a daily log of their investigation
                activities, making it easier to track progress and add detailed
                notes.
              </p>
            </div>
            <div className="p-8 bg-white shadow-md rounded-lg">
              <span aria-hidden="true">
                {' '}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  width="30"
                  height="30"
                  x="0"
                  y="0"
                  viewBox="0 0 512 512"
                >
                  <g>
                    <path
                      d="M464.5 504.5h-417c-22.091 0-40-17.909-40-40V7.5h497v457c0 22.091-17.909 40-40 40z"
                      fill="#a0cbb1"
                      data-original="#a0cbb1"
                    ></path>
                    <path
                      d="M309.5 476h-85c-8.284 0-15-6.716-15-15 0-8.284 6.716-15 15-15h85v30z"
                      fill="#fdd835"
                      data-original="#fdd835"
                    ></path>
                    <path
                      d="M491.175 274.141c-2.603-11.12-10.032-20.267-20.382-25.094l-100.451-46.851c6-10.049 8.555-21.722 7.238-33.556-1.595-14.331-8.675-27.183-19.936-36.189l-68.699-54.94L11.891 423.944l81.028 50.009A53.925 53.925 0 0 0 121.25 482h.004c16.502 0 31.875-7.388 42.177-20.269l110.86-138.621a13.927 13.927 0 0 1 10.934-5.252c2.122 0 4.173.474 6.096 1.408l.173.084 106.278 49.141a36.724 36.724 0 0 0 15.516 3.416h.002c11.305 0 21.837-5.063 28.896-13.889l41.861-52.344c7.133-8.919 9.731-20.413 7.128-31.533z"
                      fill="#83b594"
                      data-original="#83b594"
                    ></path>
                    <path
                      d="m292.5 209-24.236-73.608L41.621 418.79l61.802 38.143c14.615 9.02 33.662 5.718 44.388-7.694l18.044-22.563L137.5 401l155-192z"
                      fill="#b0bec5"
                      data-original="#b0bec5"
                    ></path>
                    <path
                      d="m268.264 135.392-14.916 18.65 16.749 50.869-160.029 198.23 43.273 39.184 12.515-15.648L137.5 401l155-192z"
                      fill="#90a4ae"
                      data-original="#90a4ae"
                    ></path>
                    <path
                      d="m462.339 267.172-123.032-57.383 11.16-13.955c11.722-14.658 9.342-36.042-5.315-47.765l-53.08-42.449-23.809 29.771L292.5 209l-155 192 28.356 25.677 92.815-116.057c9.919-12.403 27.106-16.282 41.391-9.341l106.103 49.06a16.993 16.993 0 0 0 20.401-4.81l41.861-52.344c6.874-8.597 3.887-21.361-6.088-26.013z"
                      fill="#616161"
                      data-original="#616161"
                    ></path>
                    <path
                      d="M353.5 446h-85c-8.284 0-15-6.716-15-15 0-8.284 6.716-15 15-15h85v30z"
                      fill="#fdd835"
                      data-original="#fdd835"
                    ></path>
                    <path
                      d="M464.5 483h-417c-22.091 0-40-17.909-40-40v21.5c0 22.091 17.909 40 40 40h417c22.091 0 40-17.909 40-40V443c0 22.091-17.909 40-40 40z"
                      fill="#83b594"
                      data-original="#83b594"
                    ></path>
                    <path
                      d="M268.5 466h41v-20h-72.616c5.628 11.814 17.683 20 31.616 20z"
                      fill="#fbc02d"
                      data-original="#fbc02d"
                    ></path>
                    <path
                      d="m468.427 272.507-41.861 52.344a16.992 16.992 0 0 1-20.401 4.81l-106.103-49.06c-14.285-6.941-31.472-3.062-41.391 9.341L165.856 406l-18.713-16.945L137.5 401l28.356 25.677 92.815-116.057c9.919-12.403 27.106-16.282 41.391-9.341l106.103 49.06a16.993 16.993 0 0 0 20.401-4.81l41.861-52.344c5.09-6.364 4.769-15.01.213-20.96-.072.093-.139.189-.213.282z"
                      fill="#424242"
                      data-original="#424242"
                    ></path>
                    <path
                      d="M121.228 469.488c12.248 0 24.317-5.406 32.441-15.564l77.698-97.156 2.989 2.391c11.802 9.438 25.943 14.021 39.995 14.021 18.833 0 37.504-8.235 50.154-24.053l16.514-20.649 61.997 28.667a24.44 24.44 0 0 0 29.406-6.934l41.861-52.344c4.723-5.905 6.443-13.515 4.72-20.878s-6.642-13.418-13.495-16.614l-114.387-53.351 5.203-6.505c6.92-8.654 10.057-19.484 8.832-30.497-1.226-11.013-6.666-20.889-15.32-27.809L290.9 95.079 30.473 420.723l69.012 42.593a41.3 41.3 0 0 0 21.743 6.172zm191.563-129.729c-16.922 21.161-47.905 24.608-69.066 7.686l-2.99-2.391 23.792-29.75c7.783-9.732 21.047-12.724 32.256-7.28l30.214 13.971-14.206 17.764zm-19.545-223.597 47.223 37.766c5.524 4.418 8.998 10.723 9.78 17.753.782 7.03-1.22 13.945-5.638 19.469l-17.117 21.404 131.676 61.415a9.434 9.434 0 0 1 5.229 6.439 9.435 9.435 0 0 1-1.829 8.091l-41.861 52.344a9.471 9.471 0 0 1-11.396 2.687L303.27 294.498c-17.54-8.485-38.28-3.788-50.456 11.437l-87.834 109.83-17.192-15.567 153.114-189.664-24.243-73.63 16.587-20.742zm-27.775 34.73 18.628 56.575-156.886 194.336 28.38 25.699-13.639 17.054c-8.348 10.438-23.219 13.015-34.591 5.996l-54.592-33.693 212.7-265.967z"
                      fill="#000000"
                      opacity="1"
                      data-original="#000000"
                    ></path>
                    <path
                      d="M246 431c0 2.629.458 5.153 1.29 7.5H224.5c-12.407 0-22.5 10.093-22.5 22.5s10.093 22.5 22.5 22.5H317v-30h44v-45h-92.5c-12.407 0-22.5 10.093-22.5 22.5zm56 37.5h-77.5c-4.136 0-7.5-3.364-7.5-7.5s3.364-7.5 7.5-7.5H302v15zm44-30h-77.5c-4.136 0-7.5-3.364-7.5-7.5s3.364-7.5 7.5-7.5H346v15z"
                      fill="#000000"
                      opacity="1"
                      data-original="#000000"
                    ></path>
                    <path
                      d="M0 0v464.5C0 490.691 21.309 512 47.5 512h417c26.191 0 47.5-21.309 47.5-47.5V0H0zm497 464.5c0 17.92-14.58 32.5-32.5 32.5h-417C29.58 497 15 482.42 15 464.5V15h482v449.5z"
                      fill="#000000"
                      opacity="1"
                      data-original="#000000"
                    ></path>
                    <path
                      d="M397.5 42.5h15v15h-15zM367.5 42.5h15v15h-15zM337.5 42.5h15v15h-15zM427.5 42.5h15v15h-15zM307.5 42.5h15v15h-15zM457.5 42.5h15v15h-15zM67.5 42.5h15v15h-15zM127.5 42.5h15v15h-15zM97.5 42.5h15v15h-15zM157.5 42.5h15v15h-15zM37.5 42.5h15v15h-15zM247.5 42.5h15v15h-15zM277.5 42.5h15v15h-15zM187.5 42.5h15v15h-15zM217.5 42.5h15v15h-15z"
                      fill="#000000"
                      opacity="1"
                      data-original="#000000"
                    ></path>
                    <path
                      d="M305.606 146.105h15.001v29.452h-15.001z"
                      transform="scale(-1) rotate(-51.349 -334.547 651.299)"
                      fill="#ffffff"
                      data-original="#ffffff"
                    ></path>
                    <path
                      d="M224.35 200.712h15v56.479h-15z"
                      transform="rotate(38.648 231.859 228.947)"
                      fill="#ffffff"
                      data-original="#ffffff"
                    ></path>
                    <path
                      d="M126.253 330.601h15V372.6h-15z"
                      transform="rotate(38.648 133.764 351.6)"
                      fill="#ffffff"
                      data-original="#ffffff"
                    ></path>
                    <path
                      d="M153.426 310.124h15v15h-15z"
                      transform="rotate(38.648 160.936 317.623)"
                      fill="#ffffff"
                      data-original="#ffffff"
                    ></path>
                    <path
                      d="M172.158 286.7h15v15h-15z"
                      transform="rotate(38.648 179.668 294.198)"
                      fill="#ffffff"
                      data-original="#ffffff"
                    ></path>
                    <path
                      d="M83.326 413.726h38.737v15H83.326z"
                      transform="rotate(31.679 102.68 421.226)"
                      fill="#ffffff"
                      data-original="#ffffff"
                    ></path>
                    <path
                      d="M322.053 264.196h48.002v15.001h-48.002z"
                      transform="scale(-1) rotate(-51.349 -565.161 719.834)"
                      fill="#ffffff"
                      data-original="#ffffff"
                    ></path>
                    <path
                      d="M356.258 277.475h48.002v15.001h-48.002z"
                      transform="scale(-1) rotate(-51.349 -592.782 790.985)"
                      fill="#ffffff"
                      data-original="#ffffff"
                    ></path>
                    <path
                      d="M390.464 290.733h48.002v15.001h-48.002z"
                      transform="scale(-1) rotate(-51.349 -620.36 862.136)"
                      fill="#ffffff"
                      data-original="#ffffff"
                    ></path>
                    <path
                      d="M467 464.559c0 1.346-1.122 2.441-2.5 2.441h-53v15h53c9.649 0 17.5-7.824 17.5-17.441V411h-15v53.559zM467 207h15v15h-15zM467 92h15v70h-15zM467 177h15v15h-15zM30 92h15v50H30zM30 233h15v55H30zM30 203h15v15H30zM30 173h15v15H30z"
                      fill="#ffffff"
                      data-original="#ffffff"
                    ></path>
                  </g>
                </svg>
              </span>
              <h3 className="text-xl font-semibold my-4">
                Upload and Manage Evidence
              </h3>
              <p className="text-gray-600">
                Officer's pro allows officers to upload evidence in various
                formats, including pictures, PDFs, and videos, and organize them
                all in one place for easy access.
              </p>
            </div>
            <div className="p-8 bg-white shadow-md rounded-lg">
              <span aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  width="30"
                  height="30"
                  x="0"
                  y="0"
                  viewBox="0 0 512 512"
                >
                  <g>
                    <path
                      fill="#e7ecf6"
                      d="M427.598 430.851c0-13.342 6.863-25.075 17.246-31.881H87.177c-17.607 0-31.881 14.273-31.881 31.881 0 17.607 14.273 31.88 31.881 31.88h349.718c2.547 0 3.756-3.07 1.949-4.865-6.945-6.899-11.246-16.453-11.246-27.015z"
                      opacity="1"
                      data-original="#e7ecf6"
                    ></path>
                    <path
                      fill="#d8e2f1"
                      d="M427.598 430.85c0-13.342 6.863-25.075 17.246-31.881h-26.095c-10.383 6.806-17.246 18.539-17.246 31.881v.122c.02 6.312-4.955 11.493-11.267 11.493H57.488c4.644 11.862 16.181 20.266 29.689 20.266h349.718c2.547 0 3.755-3.07 1.949-4.865-6.944-6.899-11.246-16.453-11.246-27.016z"
                      opacity="1"
                      data-original="#d8e2f1"
                    ></path>
                    <path
                      fill="#ecbe6b"
                      d="m390.119 503.781-18.795-15.912a6.993 6.993 0 0 0-9.037 0l-18.795 15.912c-1.948 1.649-4.934.264-4.934-2.287V384.891h56.494v116.602c.001 2.552-2.985 3.937-4.933 2.288z"
                      opacity="1"
                      data-original="#ecbe6b"
                    ></path>
                    <path
                      fill="#eab14d"
                      d="M374.19 384.891v105.404l15.929 13.485c1.948 1.649 4.934.265 4.934-2.287V384.891z"
                      opacity="1"
                      data-original="#eab14d"
                    ></path>
                    <path
                      fill="#e28086"
                      d="m304.961 443.978-18.795-15.912a6.993 6.993 0 0 0-9.037 0l-18.795 15.912c-1.948 1.649-4.934.265-4.934-2.287v-50.306h56.494v50.306c0 2.552-2.985 3.936-4.933 2.287z"
                      opacity="1"
                      data-original="#e28086"
                    ></path>
                    <path
                      fill="#dd636e"
                      d="M289.032 391.385v39.108l15.929 13.485c1.948 1.649 4.934.265 4.934-2.287v-50.306z"
                      opacity="1"
                      data-original="#dd636e"
                    ></path>
                    <path
                      fill="#9dc6fb"
                      d="M446.248 7.493H81.436c-14.437 0-26.14 11.703-26.14 26.14V430.85c0-17.607 14.273-31.881 31.881-31.881h359.071c5.775 0 10.456-4.681 10.456-10.456V17.949c0-5.775-4.681-10.456-10.456-10.456z"
                      opacity="1"
                      data-original="#9dc6fb"
                    ></path>
                    <path
                      fill="#80b4fb"
                      d="M446.248 7.493h-43.397v280.104c0 31.767-25.752 57.519-57.519 57.519H55.296v85.734c0-17.607 14.273-31.881 31.881-31.881h359.072c5.775 0 10.456-4.681 10.456-10.456V17.949c-.001-5.775-4.682-10.456-10.457-10.456z"
                      opacity="1"
                      data-original="#80b4fb"
                    ></path>
                    <circle
                      cx="279.625"
                      cy="237.525"
                      r="95.406"
                      fill="#b1e4f9"
                      opacity="1"
                      data-original="#b1e4f9"
                    ></circle>
                    <path
                      fill="#b1e4f9"
                      d="M55.296 158.346v158.358c25.435-17.136 42.165-46.203 42.165-79.179s-16.73-62.043-42.165-79.179z"
                      opacity="1"
                      data-original="#b1e4f9"
                    ></path>
                    <path
                      d="M456.704 282.353a7.493 7.493 0 0 0 7.493-7.493V17.949C464.197 8.052 456.145 0 446.248 0H81.436C62.891 0 47.803 15.088 47.803 33.632v28.551a7.493 7.493 0 0 0 14.986 0V33.632c0-10.282 8.365-18.647 18.647-18.647h33.329v376.492H87.177c-8.786-.017-17.509 3.021-24.388 8.483v-79.376c26.474-19.376 42.165-50.123 42.165-83.059s-15.692-63.683-42.165-83.059v-55.86a7.493 7.493 0 0 0-14.986 0V430.85c0 21.71 17.663 39.373 39.373 39.373h243.889v31.27c0 4.132 2.329 7.778 6.077 9.516 3.751 1.738 8.037 1.16 11.191-1.51l18.472-15.639 18.473 15.639c3.167 2.684 7.475 3.237 11.19 1.51 3.748-1.738 6.077-5.384 6.077-9.516v-31.27h34.349a10.26 10.26 0 0 0 9.52-6.363 10.34 10.34 0 0 0-2.291-11.31c-5.825-5.788-9.034-13.495-9.034-21.701 0-9.669 4.525-18.661 12.197-24.441 9.412-.543 16.909-8.35 16.909-17.896v-78.167a7.493 7.493 0 0 0-14.986 0v78.167a2.966 2.966 0 0 1-2.963 2.963H129.75V14.985h316.498a2.966 2.966 0 0 1 2.963 2.963V274.86a7.493 7.493 0 0 0 7.493 7.493zM89.969 237.524a87.815 87.815 0 0 1-27.18 63.554V173.971a87.811 87.811 0 0 1 27.18 63.553zm-2.792 217.714c-13.448 0-24.388-10.94-24.388-24.388s10.94-24.388 24.388-24.388h158.731v35.229c0 4.132 2.329 7.778 6.077 9.517 3.715 1.728 8.023 1.174 11.19-1.511l18.473-15.639 18.472 15.639c3.153 2.669 7.441 3.248 11.19 1.51 3.748-1.738 6.077-5.384 6.077-9.516v-35.229h13.678v48.776zm173.715-48.776h41.509v25.532l-11.395-9.647a14.441 14.441 0 0 0-18.72 0l-11.395 9.647v-25.532zm115.273 75.688a14.441 14.441 0 0 0-18.72 0l-11.395 9.647v-85.335h41.509v85.335zm50.997-26.912h-24.617v-48.776h24.62a45.482 45.482 0 0 0-7.059 24.389c-.001 8.772 2.46 17.162 7.056 24.387z"
                      fill="#000000"
                      opacity="1"
                      data-original="#000000"
                    ></path>
                    <path
                      d="M223.522 323.796c16.695 10.877 36.095 16.627 56.104 16.627 56.738 0 102.898-46.16 102.898-102.898s-46.16-102.898-102.898-102.898-102.898 46.16-102.898 102.898c0 21.59 6.614 42.257 19.128 59.767a7.493 7.493 0 1 0 12.192-8.713c-10.686-14.953-16.334-32.607-16.334-51.054 0-48.476 39.438-87.913 87.913-87.913s87.913 39.438 87.913 87.913-39.438 87.913-87.913 87.913c-17.097 0-33.668-4.909-47.923-14.197a7.492 7.492 0 0 0-10.368 2.187 7.49 7.49 0 0 0 2.186 10.368z"
                      fill="#000000"
                      opacity="1"
                      data-original="#000000"
                    ></path>
                    <path
                      d="M229.097 227.561h98.472a7.493 7.493 0 0 0 0-14.986h-98.472a7.493 7.493 0 0 0 0 14.986zM229.097 266.411h98.472a7.493 7.493 0 0 0 0-14.986h-98.472a7.493 7.493 0 0 0 0 14.986zM260.039 112.075l3.654-9.594h25.087l3.612 9.572c1.457 3.911 5.884 5.817 9.656 4.365a7.493 7.493 0 0 0 4.365-9.656l-21.851-57.9a8.792 8.792 0 0 0-8.24-5.672h-.007a8.793 8.793 0 0 0-8.226 5.653l-22.051 57.898a7.493 7.493 0 0 0 4.335 9.669 7.49 7.49 0 0 0 9.666-4.335zm16.255-42.679 6.831 18.1h-13.724zM232.265 108.54V49.815a7.493 7.493 0 0 0-14.986 0v58.725a7.493 7.493 0 0 0 14.986 0zM148.522 107.614c-.192 4.338 3.104 8.539 7.637 8.418.488-.002 11.999-.046 16.6-.126 17.327-.303 29.903-15.385 29.903-35.861 0-21.525-12.259-35.986-30.507-35.986h-16.14a7.491 7.491 0 0 0-7.493 7.506v.045zm23.633-48.57c14.402 0 15.521 16.074 15.521 21.001 0 10.259-4.694 20.694-15.18 20.877a970.76 970.76 0 0 1-8.898.086c-.021-6.715-.065-34.975-.077-41.964zM403.026 117.102h.019a7.492 7.492 0 0 0 7.492-7.474l.068-27.784 17.396-26.723a7.492 7.492 0 1 0-12.559-8.175l-12.334 18.948-12.475-19.105a7.493 7.493 0 0 0-12.547 8.193l17.534 26.852-.068 27.758a7.493 7.493 0 0 0 7.474 7.51zM365.929 66.146c0-12.547-10.595-22.754-23.618-22.754h-15.625a7.493 7.493 0 0 0-7.493 7.493v58.725a7.493 7.493 0 0 0 14.986 0V93.388l18.633 21.171a7.473 7.473 0 0 0 5.627 2.542 7.493 7.493 0 0 0 5.621-12.443l-14.764-16.775c9.624-2.876 16.633-11.532 16.633-21.737zm-23.618 7.769c-1.884 0-5.057.013-8.047.027-.015-2.913-.035-12.512-.043-15.566h8.09c4.679 0 8.633 3.558 8.633 7.769 0 4.212-3.953 7.77-8.633 7.77z"
                      fill="#000000"
                      opacity="1"
                      data-original="#000000"
                    ></path>
                  </g>
                </svg>
              </span>
              <h3 className="text-xl font-semibold my-4">
                Crime Diary Management and PDF Download
              </h3>
              <p className="text-gray-600">
                All information related to a case, such as reports and witness
                statements, is organized into a crime diary, which can be easily
                downloaded as a PDF.
              </p>
            </div>
            <div className="p-8 bg-white shadow-md rounded-lg">
              <span aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  width="35"
                  height="35"
                  x="0"
                  y="0"
                  viewBox="0 0 267 267"
                  fill-rule="evenodd"
                >
                  <g>
                    <path
                      fill="#cedcff"
                      d="M205.743 189.658c.126-.326.356-.953.522-1.567.486-1.805 1.009-4.47 1.556-7.822 4.144-25.4 9.471-89.42 8.251-121.136a2.082 2.082 0 0 1 2.575-2.104c13.414 3.271 24.279 6.168 28.629 7.655 1.473.504 2.358.973 2.644 1.216.666.568 1.278 1.561 1.644 3.04.377 1.527.552 3.721.514 6.478-.139 9.921-2.969 27.688-6.932 47.353-6.762 33.553-16.803 72.664-22.149 87.538-1.004 2.795-1.874 4.783-2.524 5.813-.615.972-1.288 1.411-1.732 1.57-1.928.687-4.24.311-7.745-1.164-6.57-2.766-18.518-9.375-44.86-15.647-14.552-3.466-29.111-5.928-40.736-7.939a2.081 2.081 0 0 1-1.613-2.737 62.251 62.251 0 0 0 2.482-9.377 2.083 2.083 0 0 1 2.109-1.712c8.136.23 16.902.603 25.719 1.32 27.268 2.22 40.217 6.972 47.203 8.725 1.321.331 2.398.553 3.308.593.428.019.802.001 1.135-.096z"
                      opacity="1"
                      data-original="#cedcff"
                    ></path>
                    <path
                      fill="#dfefff"
                      d="M90.106 103.796c1.886-33.484 3.798-66.215 4.411-69.097.171-.805.94-1.903 2.829-2.469 2.047-.614 6.125-.976 11.601-1.079 23.892-.449 75.599 3.543 96.785 6.06 3.781.449 6.607.856 8.163 1.18 1.012.211 1.65.467 1.915.63.878.543 1.785 1.737 2.427 3.681 1.056 3.192 1.715 8.888 1.999 16.271 1.228 31.934-4.131 96.392-8.303 121.967-.878 5.383-1.751 9.119-2.464 10.627-.434.919-.982 1.394-1.378 1.608-1.795.969-4.129.95-7.806.027-6.885-1.728-19.647-6.425-46.526-8.613-8.741-.711-17.433-1.08-25.499-1.308a2.08 2.08 0 0 1-1.991-2.453c1.433-7.933 1.155-15.929-1.426-23.243-3.542-10.037-2.017-34.937-1.38-43.301-2.811.315-6.215.072-9.874-.618-7.164-1.35-15.369-4.353-21.782-7.606l-.578-.296a2.085 2.085 0 0 1-1.123-1.968z"
                      opacity="1"
                      data-original="#dfefff"
                    ></path>
                    <g fill="#4c51cf">
                      <path
                        d="M108.498 102.526a2.085 2.085 0 0 1-1.92-2.235 2.085 2.085 0 0 1 2.235-1.92s51.997 3.971 60.443 2.934a2.084 2.084 0 0 1 .507 4.136c-8.56 1.051-61.265-2.915-61.265-2.915zM109.206 86.326a2.084 2.084 0 0 1-.016-4.167s69.973-.218 79.512 2.521a2.084 2.084 0 0 1-1.149 4.005c-9.399-2.698-78.347-2.359-78.347-2.359zM172.137 49.048c1.079 1.595 1.635 4.108 1.604 7.003-.042 3.862-1.061 8.448-2.669 12.023-.234.522-.648 1.049-1.304 1.509-.839.589-2.258 1.141-4.167 1.557-9.026 1.97-30.731 1.733-44.825.256-6.385-.67-11.268-1.685-13.009-2.738-1.202-.728-1.605-1.672-1.641-2.448-.146-3.156-1.083-11.395.045-16.468.677-3.047 2.203-5.057 4.293-5.564 3.904-.948 38.265-.708 53.409 1.752 2.86.464 5.078 1.03 6.381 1.643.945.444 1.55.983 1.883 1.475z"
                        fill="#4c51cf"
                        opacity="1"
                        data-original="#4c51cf"
                      ></path>
                    </g>
                    <path
                      fill="#4146a5"
                      d="M80.055 235.459c-15.128 1.117-31.812-8.176-43.828-22.103-11.98-13.886-19.272-32.294-15.998-49.146 2.363-12.16-5.585-43.968-5.585-43.968a2.083 2.083 0 0 1 2.376-2.552c2.778.478 6.537-.303 10.619-1.718 6.536-2.265 13.816-6.236 19.383-10.183 9.41-6.673 20.776-17.972 20.776-17.972a2.084 2.084 0 0 1 2.704-.2s12.902 9.508 23.19 14.727c6.086 3.087 13.87 5.946 20.669 7.227 4.245.801 8.078 1.021 10.755.14a2.082 2.082 0 0 1 2.725 2.176s-3.191 32.63.931 44.311c5.713 16.189 1.203 35.468-8.608 50.962-9.841 15.54-24.98 27.182-40.109 28.299z"
                      opacity="1"
                      data-original="#4146a5"
                    ></path>
                    <path
                      fill="#ffffff"
                      d="M29.467 126.753c8.225-2.902 17.319-7.796 24.282-12.733 5.075-3.599 10.647-8.358 15.148-12.409a2.083 2.083 0 0 1 2.545-.188c5.046 3.346 11.256 7.236 16.805 10.05 7.612 3.862 17.326 7.368 25.888 9.031a2.083 2.083 0 0 1 1.685 2.11c-.398 12.641-.345 29.741 2.59 38.056 4.667 13.226.282 28.852-7.733 41.51-7.837 12.375-19.308 22.453-31.355 23.342s-24.873-7.395-34.442-18.486c-9.787-11.343-16.419-26.156-13.744-39.924 1.682-8.656-.776-25.578-3.026-38.024a2.084 2.084 0 0 1 1.357-2.335z"
                      opacity="1"
                      data-original="#ffffff"
                    ></path>
                    <path
                      fill="#ff1c51"
                      d="M176.115 149.897c5.095-2.702 10.339-4.061 14.875-2.549 4.61 1.537 8.672 6.005 10.934 15.388a.948.948 0 0 1-1.832.493c-2.4-8.078-5.856-11.999-9.941-13.146-3.452-.969-7.237.074-10.968 2.07 3.2 3.1 3.813 6.895 3.089 9.488-.741 2.652-2.795 4.286-5.322 4.117-3.957-.292-6.864-2.349-7.959-4.848-1.146-2.615-.63-5.924 3.029-8.539l-.064-.026c-3.899-1.554-9.576-2.31-17.61-1.353-3.265.365-10.203 2.319-16.233 2.315-2.729-.003-5.277-.392-7.275-1.436a.949.949 0 0 1 .827-1.707c2.343 1.049 5.445 1.013 8.617.606 5.319-.682 10.819-2.491 13.62-2.96 10.804-1.717 17.874-.333 22.213 2.087zm-.572 4.489a59.72 59.72 0 0 0-1.088.768c-1.876 1.343-2.5 2.845-1.893 4.132.651 1.381 2.423 2.27 4.643 2.383.817.047 1.123-.87 1.19-1.833.118-1.699-.727-3.729-2.852-5.45z"
                      opacity="1"
                      data-original="#ff1c51"
                    ></path>
                    <path
                      fill="#ff7b07"
                      d="m73.635 128.555 4.838 11.742a9.276 9.276 0 0 0 11.134 5.382l12.206-3.502a2.083 2.083 0 0 1 2.225 3.274l-7.75 10.06a9.27 9.27 0 0 0-1.902 6.339 9.27 9.27 0 0 0 2.808 5.994l9.137 8.82a2.084 2.084 0 0 1-1.723 3.564l-12.588-1.682a9.276 9.276 0 0 0-10.228 6.952l-3.07 12.322a2.084 2.084 0 0 1-3.948.29l-4.837-11.742a9.278 9.278 0 0 0-11.134-5.382l-12.207 3.502a2.083 2.083 0 0 1-2.225-3.274l7.75-10.06a9.272 9.272 0 0 0-.905-12.333l-9.137-8.82a2.085 2.085 0 0 1 1.723-3.564l12.587 1.682a9.273 9.273 0 0 0 10.229-6.952l3.07-12.322a2.083 2.083 0 0 1 3.947-.29z"
                      opacity="1"
                      data-original="#ff7b07"
                    ></path>
                  </g>
                </svg>
              </span>
              <h3 className="text-xl font-semibold my-4">
                Chargesheet Preparation
              </h3>
              <p className="text-gray-600">
                Officer's pro streamlines the preparation of chargesheets,
                allowing officers to quickly gather the necessary information
                and generate a chargesheet with just a few clicks.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="mobile p-12" id="screen">
        <div className="container mx-auto p-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold">Screen shots</h3>
          </div>
          <div className="flex flex-wrap">
            <div className="w-full lg:w-1/2 pr-0 lg:pr-12">
              <div className="text-left mb-8">
                <h3 className="text-2xl font-bold mb-6">Why it's best</h3>
              </div>
              <p className="mb-6">
                Time-Saving Automation: Officer's pro automates the tedious
                process of writing statements and filling out forms, allowing
                officers to focus on solving cases instead of getting bogged
                down by paperwork.
              </p>
              <p className="mb-6">
                Security and Data Protection: With a secure login system,
                Officer's pro ensures that only authorized officers can access
                the app, and all sensitive data stays on the officer’s device,
                preventing data theft and ensuring compliance with privacy
                regulations.
              </p>
              <p className="mb-6">
                User-Friendly Interface: Officer's pro is designed with ease of
                use in mind, offering an intuitive dashboard and workflow that
                helps officers navigate their tasks smoothly, boosting
                productivity and reducing frustration.
              </p>
            </div>

            {/* carousel */}
            <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
              <div className="relative">
                <div className="relative h-56 overflow-hidden rounded-lg md:h-96">
                  {slides.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      className={`absolute block w-full transition-all duration-700 ease-in-out ${
                        activeIndex === index ? 'opacity-100' : 'opacity-0'
                      }`}
                      alt={`Slide ${index + 1}`}
                    />
                  ))}
                </div>
                {/* Slider indicators */}
                <div className="absolute z-30 flex -translate-x-1/2 space-x-3 bottom-5 left-1/2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        activeIndex === index ? 'bg-gray-500' : 'bg-gray-300'
                      }`}
                      onClick={() => setActiveIndex(index)}
                    ></button>
                  ))}
                </div>
                {/* Slider controls */}
                <button
                  onClick={handlePrev}
                  className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover:bg-white/50">
                    &larr;
                  </span>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover:bg-white/50">
                    &rarr;
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="footer py-sm-12 py-12">
        <div className="container py-xl-5 py-lg-3">
          <div className="contact_grid_left">
            <ul className="list-unstyled  flex flex-wrap justify-between text-left">
              <li className="lg:w-1/3 w-full mb-6 lg:mb-0">
                <div className="flex items-start">
                  <div className="text-lg text-center px-8">
                    <span className="text-2xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        width="30"
                        height="30"
                        x="0"
                        y="0"
                        viewBox="0 0 512 512"
                      >
                        <g>
                          <path
                            d="M256 0C161.896 0 85.333 76.563 85.333 170.667c0 28.25 7.063 56.26 20.49 81.104L246.667 506.5c1.875 3.396 5.448 5.5 9.333 5.5s7.458-2.104 9.333-5.5l140.896-254.813c13.375-24.76 20.438-52.771 20.438-81.021C426.667 76.563 350.104 0 256 0zm0 256c-47.052 0-85.333-38.281-85.333-85.333S208.948 85.334 256 85.334s85.333 38.281 85.333 85.333S303.052 256 256 256z"
                            fill="#ffffff"
                            opacity="1"
                            data-original="#000000"
                          ></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                  <div>
                    <h6 className="text-lg font-bold">Location</h6>
                    <p className="text">
                      Config Server LLP <br />
                      Office No. 303, 313, A Wing, Laxmi Horizon, HDFC Bank,
                      Mumbai Bangaluru Highway, Punawale, Pune - 411033,
                      Maharashtra, India.
                    </p>
                  </div>
                </div>
              </li>

              {/* Email Info */}
              <li className="lg:w-1/3 w-full mb-6 lg:mb-0">
                <div className="flex items-start">
                  <div className="text-lg text-center px-8">
                    <span className=" text-2xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        width="30"
                        height="30"
                        x="0"
                        y="0"
                        viewBox="0 0 512 512"
                      >
                        <g>
                          <path
                            fill-rule="evenodd"
                            d="m62.843 98.364 138.32 138.38c30.168 30.11 79.482 30.136 109.675 0l138.32-138.38a3.144 3.144 0 0 0-.426-4.814c-14.108-9.839-31.273-15.672-49.763-15.672H113.033c-18.491 0-35.656 5.834-49.764 15.672a3.144 3.144 0 0 0-.426 4.814zm-36.964 66.667a86.483 86.483 0 0 1 9.955-40.353 3.144 3.144 0 0 1 5.019-.762l136.569 136.569c43.247 43.31 113.885 43.335 157.158 0l136.569-136.569a3.144 3.144 0 0 1 5.019.762 86.498 86.498 0 0 1 9.955 40.353v181.937c0 48.093-39.121 87.154-87.154 87.154H113.033c-48.032 0-87.154-39.061-87.154-87.154z"
                            clip-rule="evenodd"
                            fill="#ffffff"
                            opacity="1"
                            data-original="#000000"
                          ></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                  <div>
                    <h6 className="text-lg font-bold">Email</h6>
                    <a
                      href="mailto:info@configserverllp.com"
                      className="text-sm text-blue-400"
                    >
                      info@configserverllp.com
                    </a>
                  </div>
                </div>
              </li>

              {/* Phone Info */}
              <li className="lg:w-1/3 w-full">
                <div className="flex items-start">
                  <div className="text-lg text-center px-8">
                    <span className="fa fa-mobile text-2xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        width="30"
                        height="30"
                        x="0"
                        y="0"
                        viewBox="0 0 51.413 51.413"
                      >
                        <g>
                          <path
                            d="M25.989 12.274c8.663.085 14.09-.454 14.823 9.148h10.564c0-14.875-12.973-16.88-25.662-16.88-12.69 0-25.662 2.005-25.662 16.88h10.482c.811-9.785 6.864-9.232 15.455-9.148zM5.291 26.204c2.573 0 4.714.154 5.19-2.377.064-.344.101-.734.101-1.185H0c0 3.765 2.369 3.562 5.291 3.562zM40.88 22.642h-.099c0 .454.039.845.112 1.185.502 2.334 2.64 2.189 5.204 2.189 2.936 0 5.316.193 5.316-3.374H40.88z"
                            fill="#ffffff"
                            data-original="#010002"
                            opacity="1"
                          ></path>
                          <path
                            d="M35.719 20.078v-1.496c0-.669-.771-.711-1.723-.711h-1.555c-.951 0-1.722.042-1.722.711V20.871h-11V18.582c0-.669-.771-.711-1.722-.711h-1.556c-.951 0-1.722.042-1.722.711v2.802C12.213 23.988 4.013 35.073 3.715 36.415l.004 8.955c0 .827.673 1.5 1.5 1.5h40c.827 0 1.5-.673 1.5-1.5v-9c-.295-1.303-8.493-12.383-11-14.987v-1.305zM19.177 37.62a1.458 1.458 0 1 1 0-2.915 1.458 1.458 0 0 1 0 2.915zm0-5a1.458 1.458 0 1 1 0-2.915 1.458 1.458 0 0 1 0 2.915zm0-4.999a1.458 1.458 0 1 1 0-2.915 1.458 1.458 0 0 1 0 2.915zm6 9.999a1.458 1.458 0 1 1 0-2.915 1.458 1.458 0 0 1 0 2.915zm0-5a1.458 1.458 0 1 1 0-2.915 1.458 1.458 0 0 1 0 2.915zm0-4.999a1.458 1.458 0 1 1 0-2.915 1.458 1.458 0 0 1 0 2.915zm6 9.999a1.457 1.457 0 1 1 0-2.916 1.457 1.457 0 1 1 0 2.916zm0-5a1.457 1.457 0 1 1 0-2.916 1.457 1.457 0 1 1 0 2.916zm0-4.999a1.457 1.457 0 1 1 0-2.916 1.458 1.458 0 1 1 0 2.916z"
                            fill="#ffffff"
                            data-original="#010002"
                            opacity="1"
                          ></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                  <div>
                    <h6 className="text-lg font-bold">Phone Number</h6>
                    <p className="text-sm">+91 9156486909</p>
                    <p className="text-sm">+91 8605386909</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div className="logo-2 text-center mt-6 text-3xl">
            <h2>
              <a className="logo" onClick={handleLogin} style={{ cursor: 'pointer' }}>
                Login with Keycloak
              </a>
            </h2>
          </div>
          <div className="mobl-footer text-center mt-4">
            {/* <ul className="list-unstyled">
              <li>
                <a href="#">
                  <span className="fa fa-facebook-f"></span>
                </a>
              </li>
              <li className="mx-1">
                <a href="#">
                  <span className="fa fa-twitter"></span>
                </a>
              </li>
              <li>
                <a href="#">
                  <span className="fa fa-dribbble"></span>
                </a>
              </li>
              <li className="ml-1">
                <a href="#">
                  <span className="fa fa-vk"></span>
                </a>
              </li>
            </ul> */}
          </div>
          <p className="copy-right-grids text-li text-center my-sm-4 my-4">
            © 2024 Officer's PRO. All Rights Reserved | Design by
            <a href="https://configserverllp.com/"> Config Server LLP </a>
          </p>
          <div className="top_move text-center ">
            <a href="#home" className="move-top">
              <span aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  width="30"
                  height="30"
                  x="0"
                  y="0"
                  viewBox="0 0 32 32"
                >
                  <g>
                    <circle
                      cx="16"
                      cy="16"
                      r="16"
                      fill="#626c73"
                      opacity="1"
                      data-original="#464646"
                    ></circle>
                    <path
                      fill="#ffffff"
                      d="M22.334 19.5 16 13.842 9.666 19.5 9 18.754l7-6.254 7 6.254z"
                      data-name="Layer 2"
                      opacity="1"
                      data-original="#dcdcdc"
                    ></path>
                  </g>
                </svg>
              </span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default IntroComponent;
