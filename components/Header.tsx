import React from 'react';

interface HeaderProps {
  currentView?: 'form' | 'history' | 'clients' | 'dashboard';
  onNavigate?: (view: 'form' | 'history' | 'clients' | 'dashboard') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const handleNav = (e: React.MouseEvent, view: 'form' | 'history' | 'clients' | 'dashboard') => {
    e.preventDefault();
    if (onNavigate) onNavigate(view);
  };

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg relative z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-5 cursor-pointer group" onClick={(e) => handleNav(e, 'dashboard')}>
          <div className="bg-white p-2.5 rounded-xl shadow-xl border-2 border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ease-out">
             <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Sebrae_logo.svg/1200px-Sebrae_logo.svg.png" 
                alt="Sebrae" 
                className="h-10 w-auto object-contain"
             />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight leading-none">SALA DO EMPREENDEDOR</h1>
            <p className="text-[10px] font-bold text-blue-200 tracking-[0.2em] uppercase mt-1">Sistema Integrado de Gestão</p>
          </div>
        </div>
        <nav className="hidden md:flex gap-1 bg-blue-900/30 p-1 rounded-lg backdrop-blur-sm">
          <a 
            href="#" 
            onClick={(e) => handleNav(e, 'dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all duration-200 flex items-center gap-2 ${currentView === 'dashboard' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
          >
            <i className="fa-solid fa-chart-line"></i> DASHBOARD
          </a>
          <a 
            href="#" 
            onClick={(e) => handleNav(e, 'form')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all duration-200 flex items-center gap-2 ${currentView === 'form' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
          >
            <i className="fa-solid fa-plus"></i> NOVO
          </a>
           <a 
            href="#" 
            onClick={(e) => handleNav(e, 'clients')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all duration-200 flex items-center gap-2 ${currentView === 'clients' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
          >
            <i className="fa-solid fa-users"></i> CLIENTES
          </a>
          <a 
            href="#" 
            onClick={(e) => handleNav(e, 'history')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all duration-200 flex items-center gap-2 ${currentView === 'history' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
          >
            <i className="fa-solid fa-list"></i> HISTÓRICO
          </a>
        </nav>
      </div>
      <div className="bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 h-1.5 w-full shadow-md"></div>
    </header>
  );
};