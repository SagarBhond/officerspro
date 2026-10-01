import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const OfficerContext = createContext();

export const OfficerProvider = ({ children }) => {
  const imagekey = import.meta.env.VITE_IMAGE_API;
  const [officer, setOfficer] = useState({});
  const [passportFileUrl, setPassportFileUrl] = useState(null);

  // Get officer data from localStorage instead of API call
  const getOfficerFromStorage = () => {
    // Get officer email - check both 'officerEmail' and 'officer' object
    let officerEmail = localStorage.getItem('officerEmail');
    let officerData = null;
    
    console.log('Getting officer data from localStorage...');
    
    // Try to get officer data from localStorage
    try {
      const officerStr = localStorage.getItem('officer');
      if (officerStr) {
        officerData = JSON.parse(officerStr);
        console.log('Officer data from localStorage:', officerData);
        
        // If no email found, try to get it from officer object
        if (!officerEmail && officerData?.email) {
          officerEmail = officerData.email;
          localStorage.setItem('officerEmail', officerEmail); // Store for future use
          console.log('Email extracted from officer object:', officerEmail);
        }
      }
    } catch (e) {
      console.error('Failed to parse officer data from localStorage:', e);
    }
    
    // Map Keycloak profile data to officer structure expected by components
    const officer = {
      // Map firstName + lastName to officerName for DropdownUser
      officerName: officerData?.firstName && officerData?.lastName 
        ? `${officerData.firstName} ${officerData.lastName}`.trim()
        : officerData?.username || 'Officer',
      
      // Map to officerPost (default since Keycloak doesn't provide this)
      officerPost: officerData?.designation || 'Officer',
      
      // Keep original fields for other components
      officerId: officerData?.id || null,
      email: officerData?.email || officerEmail || 'test@example.com',
      username: officerData?.username || '',
      firstName: officerData?.firstName || '',
      lastName: officerData?.lastName || '',
      
      // Additional fields with defaults
      stationId: officerData?.stationId || null,
      stationName: officerData?.stationName || null,
      designation: officerData?.designation || 'Officer',
      
      // Include passportFile if it exists
      passportFile: officerData?.passportFile || null
    };
    
    console.log('Final mapped officer data:', officer);
    return officer;
  };

  useEffect(() => {
    // Get officer data from localStorage instead of making API call
    const officerData = getOfficerFromStorage();
    setOfficer(officerData);
    
    // Set default profile image if no passport file
    if (!officerData.passportFile) {
      // Use a default avatar image
      setPassportFileUrl('https://ui-avatars.com/api/?name=' + encodeURIComponent(officerData.officerName || 'Officer') + '&background=3C50E0&color=fff');
    }
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
