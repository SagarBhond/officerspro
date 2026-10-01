import React from 'react';

interface StepperProps {
  currentStep: number;
  numberOfSteps: number;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, numberOfSteps }) => {
  return (
    <div className="flex items-center justify-center space-x-4">
      {Array.from({ length: numberOfSteps }, (_, index) => (
        <React.Fragment key={index}>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium ${
              index <= currentStep
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-white border-gray-300 text-gray-500'
            }`}
          >
            {index + 1}
          </div>
          {index < numberOfSteps - 1 && (
            <div
              className={`w-12 h-0.5 ${
                index < currentStep ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Stepper;
