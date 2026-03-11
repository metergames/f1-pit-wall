import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SeasonSelection from './pages/SeasonSelection';
import SeasonOverview from './pages/SeasonOverview';
import Races from './pages/Races';
import Drivers from './pages/Drivers';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/seasons" element={<SeasonSelection />} />
        
        <Route path="/overview" element={<SeasonOverview />} />
        <Route path="/races" element={<Races />} />
        <Route path="/drivers" element={<Drivers />} />
      </Routes>
    </BrowserRouter>
  );
}