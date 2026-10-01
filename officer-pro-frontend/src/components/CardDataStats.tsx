import React, { ReactNode } from 'react';

interface CardDataStatsProps {
  title: string;
  total: string;
  children: ReactNode;
  color: string;
  text: string;
  onClick?: () => void;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  title,
  total,
  children,
  color,
  text,
  onClick,
}) => {
  return (
    <div
      className={`rounded-xl border border-stroke ${color} py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark ${
        onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-300 hover:scale-105 transform' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
        {children}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className={`text-title-xl font-bold ${text} dark:text-white`}>
            {total}
          </h4>
          <span className={` ${text} dark:text-white text-md font-medium`}>
            {title}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CardDataStats;
