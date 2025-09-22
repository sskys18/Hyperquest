import "./index.css";
import Layout from "./components/Layout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ChallengesPage from "./pages/ChallengesPage";
import Profile from "./pages/Profile";
import { WalletProvider } from "./context/WalletContext";

export default function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <Layout>
          <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:address" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </WalletProvider>
    </BrowserRouter>
  );
}
