import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import request from '../../Service/axios_helper';

const OfficerContext = createContext();

export const OfficerProvider = ({ children }) => {
  const imagekey = import.meta.env.VITE_IMAGE_API;
  const [officer, setOfficer] = useState({});
  const [passportFileUrl, setPassportFileUrl] = useState(null);

  useEffect(() => {
    const fetchOfficerDetails = async () => {
      let officerEmail = localStorage.getItem("officerEmail");
      const response = await request('cms', 'GET', `/getSingleOfficer/${officerEmail}`, {});
      setOfficer(response);
    };

    fetchOfficerDetails();
  }, []);

  useEffect(() => {
    const fetchPassportFile = async (fileMetadata) => {
      try {
        const sanitizedFilePath = encodeURIComponent(fileMetadata.filePath.replace(/\\/g, '/'));
        const path = `${imagekey}?filePath=${sanitizedFilePath}`;     
        const response = await axios({
          url: path,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          method: 'GET',
          responseType: 'blob',
        });
        const url = URL.createObjectURL(response.data);
        setPassportFileUrl(url);
      } catch (error) {
        console.error('Error fetching passport file:', error);
      }
    };

    if (officer.passportFile && officer.passportFile.fileId) {
      fetchPassportFile(officer.passportFile);
    }
  }, [officer]);

  return (
    <OfficerContext.Provider value={{ officer, passportFileUrl }}>
      {children}
    </OfficerContext.Provider>
  );
};

export const useOfficer = () => useContext(OfficerContext);
