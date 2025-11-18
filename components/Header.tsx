import React from 'react';

interface HeaderProps {
  currentView?: 'form' | 'history';
  onNavigate?: (view: 'form' | 'history') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const handleNav = (e: React.MouseEvent, view: 'form' | 'history') => {
    e.preventDefault();
    if (onNavigate) onNavigate(view);
  };

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer" onClick={(e) => handleNav(e, 'form')}>
          <div className="bg-white p-2 rounded-full shadow-md text-blue-800">
            <i className="fa-solid fa-building-columns text-2xl w-8 h-8 flex items-center justify-center"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SALA DO EMPREENDEDOR</h1>
            <p className="text-xs text-blue-100 tracking-wider">SISTEMA INTEGRADO DE GESTÃO</p>
          </div>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <a 
            href="#" 
            onClick={(e) => handleNav(e, 'form')}
            className={`hover:text-blue-200 transition flex items-center gap-2 ${currentView === 'form' ? 'text-white border-b-2 border-orange-400 pb-1' : 'text-blue-100'}`}
          >
            <i className="fa-solid fa-plus"></i> NOVO
          </a>
          <a 
            href="#" 
            onClick={(e) => handleNav(e, 'history')}
            className={`hover:text-blue-200 transition flex items-center gap-2 ${currentView === 'history' ? 'text-white border-b-2 border-orange-400 pb-1' : 'text-blue-100'}`}
          >
            <i className="fa-solid fa-list"></i> HISTÓRICO
          </a>
          <a href="#" className="hover:text-blue-200 transition flex items-center gap-2 text-blue-100">
             <i className="fa-solid fa-gear"></i> CONFIGURAÇÕES
          </a>
        </nav>
      </div>
      <div className="bg-orange-500 h-2 w-full"></div>
    </header>
  );
};
