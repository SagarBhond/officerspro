import React from 'react';
import classnames from 'classnames';
import { usePagination, DOTS } from './Usepagination';
import './pagination.css';

interface PaginationProps {
  onPageChange: (page: number) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = (props) => {
  const {
    onPageChange,
    totalCount,
    siblingCount = 1,
    currentPage,
    pageSize,
    className = '', // Ensure className is always a string
  } = props;

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  let lastPage = paginationRange[paginationRange.length - 1] as number;

  return (
    <div className="container flex justify-center">
      <ul className={classnames('pagination-container flex py-2 dark:bg-boxdark dark:border-strokedark', className)}>
        <li
          className={classnames('pagination-item ', {
            disabled: currentPage === 1,
          })}
          onClick={onPrevious}
        >
          <div className="arrow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path
                d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                fill="white"
              />
            </svg>
          </div>
        </li>
        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === DOTS) {
            return (
              <li key={index} className="pagination-item dots dark:text-white">
                &#8230;
              </li>
            );
          }

          return (
            <li
              key={index}
              className={classnames('pagination-item dark:text-white', {
                selected: pageNumber === currentPage,
              })}
              onClick={() => onPageChange(pageNumber as number)}
            >
              {pageNumber}
            </li>
          );
        })}
        <li
          className={classnames('pagination-item', {
            disabled: currentPage === lastPage,
          })}
          onClick={onNext}
        >
          <div className="arrow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path
                d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"
                fill="white"
              />
            </svg>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
