import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Company from './pages/Company';
import Compare from './pages/Compare';
import Research from './pages/Research';
import About from './pages/About';
import Reports from './pages/Reports';
import Sectors from './pages/Sectors';
import SectorDetail from './pages/SectorDetail';
import ApiDocs from './pages/ApiDocs';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Outlet /></Layout>}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="company/:id" element={<Company />} />
        <Route path="sectors" element={<Sectors />} />
        <Route path="sector/:name" element={<SectorDetail />} />
        <Route path="reports" element={<Reports />} />
        <Route path="research" element={<Research />} />
        <Route path="compare" element={<Compare />} />
        <Route path="about" element={<About />} />
        <Route path="api/docs" element={<ApiDocs />} />
        <Route path="*" element={
          <div className="p-16 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-4 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
              Module unlinked
            </div>
            <h2 className="text-3xl font-light text-white mb-4">Surface Not Configured</h2>
            <p className="max-w-sm mx-auto text-zinc-500 text-sm">
              This route is not part of the active illustrative prototype content. Please navigate back to the main surfaces using the navigation bar.
            </p>
          </div>
        } />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
