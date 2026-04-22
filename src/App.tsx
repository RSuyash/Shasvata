import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Company from './pages/Company';

// Placeholder components for other routes
const Sectors = () => <div className="p-8 text-center text-zinc-500">Sector Analysis Module (WIP)</div>;
const Research = () => <div className="p-8 text-center text-zinc-500">Methodology & Research Module (WIP)</div>;

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Outlet /></Layout>}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="company/:id" element={<Company />} />
        <Route path="sectors" element={<Sectors />} />
        <Route path="research" element={<Research />} />
        <Route path="*" element={<div className="p-8 text-center text-zinc-500">404 Not Found</div>} />
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
