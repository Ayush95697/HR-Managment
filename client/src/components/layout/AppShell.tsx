import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PageTransition from '../shared/PageTransition';
import ChatWidget from '../shared/ChatWidget';

export default function AppShell() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'transparent' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <main style={{ flex: 1, padding: '28px', overflowY: 'scroll', overflowX: 'hidden', position: 'relative' }}>
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              {outlet}
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
      
      {/* Global AI Chatbot Widget */}
      <ChatWidget />
    </div>
  );
}
