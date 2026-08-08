// src/App.jsx — Root with Firebase Auth guard + tab routing

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './lib/firebase';
import { AppProvider } from './context/AppContext';

import Sidebar from './components/Sidebar';
import AlertBanner from './components/AlertBanner';

import Login from './pages/Login';
import DashboardGerencial from './pages/DashboardGerencial';
import EscalaExcel from './pages/EscalaExcel';
import Atestados from './pages/Atestados';
import Ferias from './pages/Ferias';
import Motoristas from './pages/Motoristas';
import TokDoGuarda from './pages/TokDoGuarda';

import Logs from './pages/Logs';
import ImportExcel from './pages/ImportExcel';

import { LogOut, Loader2 } from 'lucide-react';

const PAGES = {
  dashboard_gerencial: DashboardGerencial,
  escala:              EscalaExcel,
  atestados:           Atestados,
  ferias:              Ferias,
  motoristas:          Motoristas,
  tokguarda:           TokDoGuarda,
  logs:                Logs,
  import_excel:        ImportExcel,
};

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={40} className="text-blue-400 animate-spin"/>
        <p className="text-slate-400 text-sm">Conectando ao Firebase...</p>
      </div>
    </div>
  );
}

function AppContent({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard_gerencial');
  const PageComponent = PAGES[activeTab] || DashboardGerencial;

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab}/>

      <main className="flex-1 overflow-y-auto relative">
        {/* Top bar with user info */}
        {user && (
          <div className="no-print sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 px-6 py-2.5 flex items-center justify-end gap-3">
            <span className="text-slate-500 text-xs">{user.email}</span>
            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-xs transition-colors"
            >
              <LogOut size={13}/> Sair
            </button>
          </div>
        )}

        <div className="animate-fade-in">
          <PageComponent/>
        </div>
      </main>

      <AlertBanner/>
    </div>
  );
}

export default function App() {
  const [user,        setUser]        = useState(undefined); // undefined = loading
  const [authChecked, setAuthChecked] = useState(!isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setUser(null); // bypass auth in offline mode
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  if (!authChecked) return <LoadingScreen/>;

  // In offline mode OR authenticated → show app
  const showApp = !isFirebaseConfigured || user;

  return (
    <AppProvider user={user}>
      {showApp ? <AppContent user={user}/> : <Login/>}
    </AppProvider>
  );
}
