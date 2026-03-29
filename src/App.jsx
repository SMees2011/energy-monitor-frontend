import { useState } from 'react';
import { DarkModeProvider } from './context/DarkModeContext';
import Sidebar from './components/layout/Sidebar';
import Overzicht from './pages/Overzicht';
import Verbruik from './pages/Verbruik';
import Historiek from './pages/Historiek';

/**
 * Root application component.
 * Manages navigation state and renders the active page.
 */
function AppContent() {
  const [activePage, setActivePage] = useState('overzicht');

  const renderPage = () => {
    switch (activePage) {
      case 'overzicht': return <Overzicht />;
      case 'verbruik': return <Verbruik />;
      case 'historiek': return <Historiek />;
      default: return (
          <div className="p-4 text-gray-400 dark:text-gray-400 text-sm">
            Pagina in aanbouw...
          </div>
      );
    }
  };

  return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {renderPage()}
        </main>
      </div>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <AppContent />
    </DarkModeProvider>
  );
}

export default App;