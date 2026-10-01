import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import request from '../../Service/axios_helper';
import './feedback.css';
import { useTranslation } from 'react-i18next';

type FeedbackProps = {
  handleLogout: () => void;
};

const Feedback: React.FC<FeedbackProps> = ({ handleLogout }) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [officer, setOfficer] = useState<{officerId?: string; officerName?: string; email?: string}>({});

  const { t } = useTranslation();
  const { feedbacks } = t('breadcrumb', { returnObjects: true }) as { feedbacks: string };
  const { title, placeholder, submit } = t('feedback', { returnObjects: true }) as { title: string; placeholder: string; submit: string };

  const fetchOfficerDetails = async () => {
    try {
      // Get officer data from localStorage (matching OfficerContext pattern)
      const officerStr = localStorage.getItem('officer');
      if (officerStr) {
        const officerData = JSON.parse(officerStr);
        console.log('Officer data from localStorage:', officerData);
        
        const mappedOfficer = {
          officerId: officerData.id,
          officerName: `${officerData.firstName || ''} ${officerData.lastName || ''}`.trim() || officerData.username || 'Officer',
          email: officerData.email,
        };
        setOfficer(mappedOfficer);
        return;
      }

      // Fallback: try to get individual fields from localStorage
      const officerId = localStorage.getItem('officerId');
      const officerEmail = localStorage.getItem('officerEmail');
      
      if (officerId && officerEmail) {
        setOfficer({
          officerId: officerId,
          officerName: 'Officer',
          email: officerEmail,
        });
        return;
      }

      console.error('No officer data found in localStorage');
      setOfficer({ officerId: '1', officerName: 'Unknown Officer' });
    } catch (error) {
      console.error('Error retrieving officer details from localStorage:', error);
      setOfficer({ officerId: '1', officerName: 'Unknown Officer' });
    }
  };

  useEffect(() => {
    fetchOfficerDetails();
  }, []);

  const handleRatingChange = (newRating: number): void => {
    setRating(newRating);
  };

  const handleFeedbackChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    setFeedback(event.target.value);
  };

  const handleSubmit = async (): Promise<void> => {
    if (rating === 0) {
      Swal.fire('Error', 'Please select a rating', 'error');
      return;
    }

    try {
      // Convert UUID to hash-based integer for help-support-service compatibility
      const hashUserId = (uuid: string): number => {
        let hash = 0;
        for (let i = 0; i < uuid.length; i++) {
          const char = uuid.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
      };

      const numericUserId = hashUserId(officer.officerId || '1');

      // Submit feedback to help-support service
      const feedbackData = {
        officerId: numericUserId,
        rating: rating, // Keep 1-5 scale as expected by FeedbackRequestDTO
        feedbackDesc: feedback,
      };

      // request() returns data directly and throws on error
      const data = await request('support', 'POST', '/feedback', feedbackData);
      
      // If we reach here, the request was successful
      if (data) {
        Swal.fire('Thank You!', 'Thank you for your feedback', 'success');
        setRating(0);
        setFeedback('');
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Swal.fire('Error', 'Failed to submit feedback. Please try again.', 'error');
    }
  };

  return (
    <DefaultLayout handleLogout={handleLogout}>
      <Breadcrumb pageName={feedbacks} />
      <div className="rounded-sm border border-stroke px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark sm:px-7.5 xl:pb-7.5 flex justify-center">
        <div className="bg-black bg-opacity-80 p-10 rounded-lg max-w-lg flex flex-col items-center justify-center shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>

          <div className="feedback flex justify-center mb-4">
            <label className="angry">
              <input
                type="radio"
                value={1}
                name="feedback"
                checked={rating === 1}
                onChange={() => handleRatingChange(1)}
                className="hidden"
              />
              <div className="cursor-pointer transition-transform transform hover:scale-110">
                <svg className="eye left">
                  <use xlinkHref="#eye" />
                </svg>
                <svg className="eye right">
                  <use xlinkHref="#eye" />
                </svg>
                <svg className="mouth">
                  <use xlinkHref="#mouth" />
                </svg>
              </div>
            </label>
            <label className="sad">
              <input
                type="radio"
                value={2}
                name="feedback"
                checked={rating === 2}
                onChange={() => handleRatingChange(2)}
                className="hidden"
              />
              <div className="cursor-pointer transition-transform transform hover:scale-110">
                <svg className="eye left">
                  <use xlinkHref="#eye" />
                </svg>
                <svg className="eye right">
                  <use xlinkHref="#eye" />
                </svg>
                <svg className="mouth">
                  <use xlinkHref="#mouth" />
                </svg>
              </div>
            </label>
            <label className="ok">
              <input
                type="radio"
                value={3}
                name="feedback"
                checked={rating === 3}
                onChange={() => handleRatingChange(3)}
                className="hidden"
              />
              <div className="cursor-pointer transition-transform transform hover:scale-110"></div>
            </label>
            <label className="good">
              <input
                type="radio"
                value={4}
                name="feedback"
                checked={rating === 4}
                onChange={() => handleRatingChange(4)}
                className="hidden"
              />
              <div className="cursor-pointer transition-transform transform hover:scale-110">
                <svg className="eye left">
                  <use xlinkHref="#eye" />
                </svg>
                <svg className="eye right">
                  <use xlinkHref="#eye" />
                </svg>
                <svg className="mouth">
                  <use xlinkHref="#mouth" />
                </svg>
              </div>
            </label>
            <label className="happy">
              <input
                type="radio"
                value={5}
                name="feedback"
                checked={rating === 5}
                onChange={() => handleRatingChange(5)}
                className="hidden"
              />
              <div className="cursor-pointer transition-transform transform hover:scale-110">
                <svg className="eye left">
                  <use xlinkHref="#eye" />
                </svg>
                <svg className="eye right">
                  <use xlinkHref="#eye" />
                </svg>
              </div>
            </label>
          </div>
          <textarea
            rows={5}
            placeholder={placeholder}
            value={feedback}
            onChange={handleFeedbackChange}
            className="w-full p-4 text-lg rounded border-gray-300 focus:border-blue-500 focus:outline-none"
          ></textarea>
          <button
            className="m-6 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
            onClick={handleSubmit}
          >
            {submit}
          </button>
        </div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 4" id="eye">
          <path d="M1,1 C1.83333333,2.16666667 2.66666667,2.75 3.5,2.75 C4.33333333,2.75 5.16666667,2.16666667 6,1"></path>
        </symbol>
        <symbol
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 18 7"
          id="mouth"
        >
          <path d="M1,5.5 C3.66666667,2.5 6.33333333,1 9,1 C11.6666667,1 14.3333333,2.5 17,5.5"></path>
        </symbol>
      </svg>
    </DefaultLayout>
  );
};

export default Feedback;
