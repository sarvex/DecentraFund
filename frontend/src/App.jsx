import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ContractProvider } from "./context/ContractContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import LandingPage from "./pages/LandingPage";
import CampaignBrowser from "./pages/CampaignBrowser";
import CampaignDetails from "./pages/CampaignDetails";
import Dashboard from "./pages/Dashboard";
import CreateCampaign from "./pages/CreateCampaign";

function App() {
  return (
    <ContractProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/campaigns" element={<CampaignBrowser />} />
              <Route path="/campaigns/:id" element={<CampaignDetails />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-campaign" element={<CreateCampaign />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </ContractProvider>
  );
}

export default App;
