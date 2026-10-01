import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Loader from './common/Loader';
import { OfficerProvider } from './components/Header/OfficerContext';
import { NotificationProvider } from './common/NotificationContext';
import Popup from './common/PopUp/Popup';
import Dashboard from './pages/Dashboard/Dashboard';
import Registerstatement from './pages/Registerstatement_clean';
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
import SubscriptionPlans from './pages/subscription/SubscriptionPlans';
import PaymentHistory from './pages/subscription/PaymentHistory';
import ChargesheetPreview from './pages/ChargesheetPreview';
import Newinvestigation from './pages/Newinvestigation';
import Allstatements from './pages/Allstatements';
import ViewCase from './pages/ViewCase';
import IntroComponent from './IntroComponent';
import { useKeycloak } from './hooks/useKeycloak';
import { CourtCaseDetail, CourtCasesList } from './pages/court-cases';
// import Chargesheet from './pages/Chargesheet';

function App() {
  // ✅ Use Keycloak authentication
  const { authenticated, loading: keycloakLoading, logout, login } = useKeycloak();
  
  const [pageLoading, setPageLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setPageLoading(false), 1000);
  }, []);

  // ✅ Use Keycloak logout (returns to IntroComponent)
  const handleLogout = async () => {
    logout();
  };

  const handleContinue = () => {
    setShowPopup(false);
  };

  // ✅ Show loader while Keycloak is initializing or page is loading
  if (keycloakLoading || pageLoading) {
    return <Loader fullScreen={true} />;
  }

  // ✅ If not authenticated, show IntroComponent (landing page)
  if (!authenticated) {
    return <IntroComponent onLogin={login} />;
  }

  // ✅ User is authenticated, show the dashboard and app
  return (
    <NotificationProvider>
      <OfficerProvider>
        <Popup isOpen={showPopup} onContinue={handleContinue} onLogout={handleLogout} />
        <Routes>
          <Route index element={<Dashboard handleLogout={handleLogout} />} />
          <Route path="/Registerstatement" element={<Registerstatement handleLogout={handleLogout} />} />
          <Route path="/ferristtable/:firNo" element={<Ferristtable handleLogout={handleLogout} />} />
          <Route path="/ferristtable" element={<Ferristtable handleLogout={handleLogout} />} />

          <Route path="/viewwitness/:victimId" element={<Viewwitness handleLogout={handleLogout} />} />
          <Route path="/witnessdetails/:witnessId" element={<Witnessdetails handleLogout={handleLogout} />} />
          <Route path="/evidencefiles/:victimId" element={<Evidencefiles handleLogout={handleLogout} />} />
          <Route path="/viewallcases" element={<Viewallcases handleLogout={handleLogout} />} />
          <Route path="/register-statement/:statementId" element={<Registerstatement handleLogout={handleLogout} />} />
          <Route path="/witness/:victimId" element={<Witness handleLogout={handleLogout} />} />
          <Route path="/viewwitnesscase" element={<Viewwitnesscase handleLogout={handleLogout} />} />
          <Route path="/Viewalloffender" element={<Viewalloffender handleLogout={handleLogout} />} />
          <Route path="/Viewallvictim" element={<Viewallvictims handleLogout={handleLogout} />} />
          <Route path="/court-cases" element={<CourtCasesList handleLogout={handleLogout} />} />
          <Route path="/court-cases/:caseId/*" element={<CourtCaseDetail handleLogout={handleLogout} />} />
          <Route path="/offenderdetails/:offenderId" element={<Offenderdetails handleLogout={handleLogout} />} />
          <Route path="/victimdetails/:victimId" element={<Victimdetails handleLogout={handleLogout} />} />
          <Route path="/allstatements" element={<Allstatements handleLogout={handleLogout} />} />
          <Route path="/newinvestigation/:victimId" element={<Newinvestigation handleLogout={handleLogout} />} />
          <Route path="/viewcase/:firNo" element={<ViewCase />} />
          {/* <Route path="/chargesheet/:victimId" element={<Chargesheet handleLogout={handleLogout} />} /> */}
          <Route path="/casediarypreview/:victimId" element={<CasediaryPreview handleLogout={handleLogout} />} />
          <Route path="/Firpopup" element={<Firpopup isOpen={false} onClose={() => {}} onSave={() => {}} />} />
          <Route path="/registeredCases" element={<Registeredcases handleLogout={handleLogout} />} />
          <Route path="/casediary" element={<Casediary handleLogout={handleLogout} />} />
          <Route path="/ferrist" element={<Ferrist handleLogout={handleLogout} />} />
          <Route path="/subcription" element={<SubscriptionPlans handleLogout={handleLogout} />} />
          <Route path="/payment-history" element={<PaymentHistory handleLogout={handleLogout} />} />
          <Route path="/viewevidence" element={<Viewevidence handleLogout={handleLogout} />} />
          <Route path="/Ncpage" element={<Ncpage handleLogout={handleLogout} />} />
          <Route path="/profile" element={<Profile handleLogout={handleLogout} />} />
          <Route path="/help&Support" element={<HelpAndSupportPage handleLogout={handleLogout} />} />
          <Route path="/feedback" element={<Feedback handleLogout={handleLogout} />} />
          <Route path="/chargesheetpreview" element={<ChargesheetPreview handleLogout={handleLogout} />} />
        </Routes>
      </OfficerProvider>
    </NotificationProvider>
  );
}

export default App;
