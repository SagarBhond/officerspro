import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Loader from './common/Loader';
import keycloak from './Service/keycloak-config';
import { OfficerProvider } from './components/Header/OfficerContext';
import Popup from './common/PopUp/Popup';
import Dashboard from './pages/Dashboard/Dashboard';
import Registerstatement from './pages/Registerstatement';
import Ferristtable from './pages/Ferristtable';
import Viewwitness from './pages/Viewwitness';
import Witnessdetails from './pages/Witnessdetails';
import Evidencefiles from './pages/Evidencefiles';
import Viewallcases from './pages/Viewallcases';
import Witness from './pages/Caseforms/witness';
import Viewwitnesscase from './pages/Viewwitnesscase';
import Viewalloffender from './pages/Viewalloffender';
import Viewallvictims from './pages/Viewallvictims';
import Offenderdetails from './pages/Offenderdetails';
import Victimdetails from './pages/Victimdetails';
import Allstatements from './pages/Allstatements';
import Newinvestigation from './pages/Newinvestigation';
import Chargesheet from './pages/Chargesheet';
import CasediaryPreview from './pages/CasediaryPreview';
import Ferrist from './pages/Ferrist';
import Registeredcases from './pages/Registeredcases';
import Casediary from './pages/Casediary';
import Viewevidence from './pages/Viewevidence';
import Ncpage from './pages/Ncpage';
import Profile from './pages/Profile';
import HelpAndSupportPage from './pages/HelpAndSupport/HelpAndSupport';
import Feedback from './pages/Feedback/Feedback';
import Firpopup from './pages/Firpopup';
import IntroComponent from './IntroComponent'; // Import the intro component

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [showIntro, setShowIntro] = useState<boolean>(
    !localStorage.getItem('introDismissed'),
  ); // Check localStorage
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupCallback, setPopupCallback] = useState<(() => void) | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Set loading state
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Initialize Keycloak after intro is dismissed
  useEffect(() => {
    if (!showIntro) {
      const initializeKeycloak = async () => {
        try {
          if (!keycloak.authenticated) {
            const authenticated = await keycloak
              .init({
                onLoad: 'login-required',
                checkLoginIframe: false,
                pkceMethod: 'S256',
              })
              .catch((error) => {
                console.error('Keycloak authentication failed:', error);
              });

            if (authenticated) {
              console.info('Authenticated');
              localStorage.setItem('token', keycloak.token ?? '');

              try {
                const userProfile = await keycloak.loadUserProfile();
                const email = userProfile.email;
                localStorage.setItem('officerEmail', email ?? '');
              } catch (error) {
                console.error('Failed to load user profile:', error);
              }

              const onTokenExpired = () => {
                setShowPopup(true);
                setPopupCallback(() => refreshToken);
              };

              const refreshToken = async () => {
                try {
                  const refreshed = await keycloak.updateToken(1800);
                  if (refreshed) {
                    localStorage.setItem('token', keycloak.token ?? '');
                    setShowPopup(false);
                  } else {
                    keycloak.login();
                  }
                } catch (error) {
                  console.error('Token refresh failed:', error);
                  keycloak.login();
                }
              };
              keycloak.onTokenExpired = onTokenExpired;
              await keycloak.updateToken(1800);
            } else {
              console.error('Authentication Failed');
            }
          }
        } catch (error) {
          console.error('Keycloak initialization failed:', error);
        }
      };

      initializeKeycloak();
    }
  }, [showIntro]);

  const handleLogout = async () => {
    try {
      await keycloak.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('introDismissed');
      localStorage.removeItem('officerEmail');
      setShowIntro(true);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleContinue = () => {
    setShowPopup(false);
    const callback = popupCallback;
    if (callback) callback();
  };

  // After the intro is dismissed, show the rest of the app
  const dismissIntro = () => {
    setShowIntro(false); // Dismiss the intro
    localStorage.setItem('introDismissed', 'true'); // Save intro dismissal
  };

  if (loading) {
    return <Loader fullScreen={true} />;
  }

  return showIntro ? (
    <IntroComponent dismissIntro={dismissIntro} />
  ) : (
    <>
      <OfficerProvider>
        <Popup
          isOpen={showPopup}
          onContinue={handleContinue}
          onLogout={handleLogout}
        />
        <Routes>
          <Route index element={<Dashboard handleLogout={handleLogout} />} />
          <Route
            path="/Registerstatement"
            element={<Registerstatement handleLogout={handleLogout} />}
          />
          <Route
            path="/ferristtable/:victimId"
            element={<Ferristtable handleLogout={handleLogout} />}
          />
          <Route
            path="/viewwitness/:victimId"
            element={<Viewwitness handleLogout={handleLogout} />}
          />
          <Route
            path="/witnessdetails/:witnessId"
            element={<Witnessdetails handleLogout={handleLogout} />}
          />
          <Route
            path="/evidencefiles/:victimId"
            element={<Evidencefiles handleLogout={handleLogout} />}
          />
          <Route
            path="/viewallcases"
            element={<Viewallcases handleLogout={handleLogout} />}
          />
          <Route
            path="/register-statement/:victimId"
            element={<Registerstatement handleLogout={handleLogout} />}
          />
          <Route
            path="/witness/:victimId"
            element={<Witness handleLogout={handleLogout} />}
          />
          <Route
            path="/viewwitnesscase"
            element={<Viewwitnesscase handleLogout={handleLogout} />}
          />
          <Route
            path="/Viewalloffender"
            element={<Viewalloffender handleLogout={handleLogout} />}
          />
          <Route
            path="/Viewallvictim"
            element={<Viewallvictims handleLogout={handleLogout} />}
          />
          <Route
            path="/offenderdetails/:offenderId"
            element={<Offenderdetails handleLogout={handleLogout} />}
          />
          <Route
            path="/victimdetails/:victimId"
            element={<Victimdetails handleLogout={handleLogout} />}
          />
          <Route
            path="/allstatements"
            element={<Allstatements handleLogout={handleLogout} />}
          />
          <Route
            path="/newinvestigation/:victimId"
            element={<Newinvestigation handleLogout={handleLogout} />}
          />
          <Route
            path="/chargesheet/:victimId"
            element={<Chargesheet handleLogout={handleLogout} />}
          />
          <Route
            path="/casediarypreview/:victimId"
            element={<CasediaryPreview handleLogout={handleLogout} />}
          />
          <Route
            path="/Firpopup"
            element={
              <Firpopup isOpen={false} onClose={() => {}} onSave={() => {}} />
            }
          />
          <Route
            path="/registeredCases"
            element={<Registeredcases handleLogout={handleLogout} />}
          />
          <Route
            path="/casediary"
            element={<Casediary handleLogout={handleLogout} />}
          />
          <Route
            path="/ferrist"
            element={<Ferrist handleLogout={handleLogout} />}
          />
          <Route
            path="/viewevidence"
            element={<Viewevidence handleLogout={handleLogout} />}
          />
          <Route
            path="/Ncpage"
            element={<Ncpage handleLogout={handleLogout} />}
          />
          <Route
            path="/profile"
            element={<Profile handleLogout={handleLogout} />}
          />
          <Route
            path="/help&Support"
            element={<HelpAndSupportPage handleLogout={handleLogout} />}
          />
          <Route
            path="/feedback"
            element={<Feedback handleLogout={handleLogout} />}
          />
        </Routes>
      </OfficerProvider>
    </>
  );
}

export default App;
