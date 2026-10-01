import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const LanguageSelecter = () => {
  const languages = [
    { code: 'en', lang: 'English' },
    { code: 'hn', lang: 'Hindi' },
    { code: 'mr', lang: 'Marathi' },
  ];
  const { i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);

  const { t } = useTranslation();

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    document.body.dir = i18n.dir();
  }, [i18n, i18n.language]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="relative">
      <Link
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        to="#"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          width="30"
          height="30"
          className="fill-current"
          x="0"
          y="0"
          viewBox="0 0 512 512"
        >
          <g>
            <path
              d="m195.708 268.059-30-150.001A14.999 14.999 0 0 0 151 106h-30a14.999 14.999 0 0 0-14.708 12.058l-30 150c-1.625 8.124 3.644 16.026 11.767 17.65 8.123 1.625 16.026-3.644 17.65-11.767L115.297 226h41.406l9.588 47.942c1.625 8.127 9.531 13.392 17.65 11.767 8.123-1.625 13.392-9.527 11.767-17.65zM121.297 196l12-60h5.406l12 60h-29.406zM436 226h-45v-15c0-8.284-6.716-15-15-15s-15 6.716-15 15v15h-45c-8.284 0-15 6.716-15 15s6.716 15 15 15h3.63c8.547 27.612 21.415 48.806 35.575 65.79-11.525 10.542-23.187 19.187-33.575 27.497-6.469 5.175-7.518 14.614-2.342 21.083 5.178 6.472 14.618 7.515 21.083 2.342 10.446-8.357 22.967-17.644 35.629-29.264 12.671 11.628 25.215 20.932 35.629 29.264 6.469 5.176 15.909 4.126 21.083-2.342 5.175-6.469 4.126-15.909-2.342-21.083-10.361-8.291-22.038-16.945-33.575-27.497 14.16-16.984 27.028-38.178 35.575-65.79H436c8.284 0 15-6.716 15-15s-6.716-15-15-15zm-60 73.745c-9.575-12.02-18.189-26.367-24.683-43.845h49.365c-6.493 17.478-15.107 31.825-24.682 43.845z"
              fill=""
              opacity="1"
            ></path>
            <path
              d="M467 91H250.599l-6.43-51.582C241.36 16.946 222.164 0 199.517 0H45C20.187 0 0 20.187 0 45v331c0 24.813 20.187 45 45 45h126.483l6.348 51.582c2.804 22.427 22 39.418 44.653 39.418H467c24.813 0 45-20.187 45-45V136c0-24.813-20.187-45-45-45zM45 391c-8.271 0-15-6.729-15-15V45c0-8.271 6.729-15 15-15h154.517c7.549 0 13.948 5.648 14.883 13.134L257.764 391H45zm161.724 70.75L201.709 421h40.244l-35.229 40.75zM482 467c0 8.271-6.729 15-15 15H228.874l57.104-66.053a14.976 14.976 0 0 0 3.629-12.024L254.339 121H467c8.271 0 15 6.729 15 15v331z"
              fill=""
              opacity="1"
            ></path>
          </g>
        </svg>
      </Link>
      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-2 flex w-40 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${
          dropdownOpen === true ? 'block' : 'hidden'
        }`}
      >
        {languages.map((lng) => {
          return (
            <div
              className={lng.code === i18n.language ? 'selected' : ''}
              key={lng.code}
              onClick={() => changeLanguage(lng.code)}
            >
              <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-3 dark:border-strokedark">
                <li
                  onClick={() => setDropdownOpen(false)}
                  className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    lng.code === i18n.language
                      ? 'font-semibold text-blue-600'
                      : ''
                  }`}
                >
                  {t(`header.${lng.lang}`)}
                </li>
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSelecter;
