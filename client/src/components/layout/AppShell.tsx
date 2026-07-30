import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PageTransition from '../shared/PageTransition';
import AntigravityCanvasBackground from '../shared/AntigravityCanvasBackground';

export default function AppShell() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'transparent', position: 'relative' }}>
      {/* Global Antigravity Live Canvas Background across all pages */}
      <AntigravityCanvasBackground />

      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 10 }}>
        <TopBar />
        <main style={{ flex: 1, padding: '28px', overflowY: 'scroll', overflowX: 'hidden', position: 'relative' }}>
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              {outlet}
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
