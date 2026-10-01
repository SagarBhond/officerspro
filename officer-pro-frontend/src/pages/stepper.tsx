import React from 'react';

interface StepperProps {
  currentStep: number;
  numberOfSteps: number;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, numberOfSteps }) => {
  const activeColor = (index: number): string =>
    currentStep >= index ? 'bg-honolulublue' : 'bg-slate-300';
  // const isFinalStep = (index: number): boolean => index === numberOfSteps - 1;

  return (
    <div className="flex">
      <div className=" items-center hidden lg:flex">
        {Array.from({ length: numberOfSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <div
              className={`w-12 h-3 rounded-full px-4 mx-2 ${activeColor(
                index,
              )}`}
            ></div>
            {/* {!isFinalStep(index) && (
              <div className={`w-12 h-1 ${activeColor(index)}`}></div>
            )} */}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
