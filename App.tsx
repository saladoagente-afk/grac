import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ServiceForm } from './components/ServiceForm';
import { HistorySection } from './components/HistorySection';
import { ClientsSection } from './components/ClientsSection';
import { ThemesSection } from './components/ThemesSection';
import { DashboardSection } from './components/DashboardSection';
import { dbService } from './services/dbService';

type ViewState = 'form' | 'history' | 'clients' | 'themes' | 'dashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('form');
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    // Inicializa o Banco de Dados
    const init = async () => {
      try {
        await dbService.init();
        console.log('Banco de dados inicializado com sucesso.');
        setIsDbReady(true);
      } catch (error) {
        console.error('Falha ao iniciar banco de dados:', error);
      }
    };
    init();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 pb-12">
      <Header currentView={currentView as any} onNavigate={(v) => setCurrentView(v as ViewState)} />
      
      <main className="flex-grow container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Menu */}
          <div className="hidden lg:block lg:col-span-3 xl:col-span-2">
             <div className="bg-white rounded-lg shadow p-4 sticky top-8">
                <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Navegação</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <button 
                      onClick={() => setCurrentView('dashboard')}
                      className={`w-full flex items-center gap-3 px-3 py-2 font-semibold rounded border-l-4 transition ${
                        currentView === 'dashboard' 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-600' 
                        : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <i className="fa-solid fa-chart-line w-5 text-center"></i> Dashboard
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setCurrentView('form')}
                      className={`w-full flex items-center gap-3 px-3 py-2 font-semibold rounded border-l-4 transition ${
                        currentView === 'form' 
                        ? 'bg-blue-50 text-blue-700 border-blue-600' 
                        : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <i className="fa-solid fa-pen-to-square w-5 text-center"></i> Cadastro
                    </button>
                  </li>
                   <li>
                    <button 
                      onClick={() => setCurrentView('clients')}
                      className={`w-full flex items-center gap-3 px-3 py-2 font-semibold rounded border-l-4 transition ${
                        currentView === 'clients' 
                        ? 'bg-blue-50 text-blue-700 border-blue-600' 
                        : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <i className="fa-solid fa-users w-5 text-center"></i> Clientes
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setCurrentView('history')}
                      className={`w-full flex items-center gap-3 px-3 py-2 font-semibold rounded border-l-4 transition ${
                        currentView === 'history' 
                        ? 'bg-blue-50 text-blue-700 border-blue-600' 
                        : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <i className="fa-solid fa-table-list w-5 text-center"></i> Consultas
                    </button>
                  </li>
                  <div className="border-t border-gray-100 my-2"></div>
                  <li>
                    <button 
                      onClick={() => setCurrentView('themes')}
                      className={`w-full flex items-center gap-3 px-3 py-2 font-semibold rounded border-l-4 transition ${
                        currentView === 'themes' 
                        ? 'bg-purple-50 text-purple-700 border-purple-600' 
                        : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <i className="fa-solid fa-sliders w-5 text-center"></i> Configurações
                    </button>
                  </li>
                </ul>

                <div className="mt-8 p-4 bg-blue-900 rounded text-white text-center shadow-lg">
                  <div className="text-3xl font-bold mb-1">DB</div>
                  <div className="text-xs opacity-80">{isDbReady ? 'Conectado' : 'Conectando...'}</div>
                </div>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 xl:col-span-10">
             {currentView === 'dashboard' && <DashboardSection />}
             {currentView === 'form' && <ServiceForm />}
             {currentView === 'clients' && <ClientsSection />}
             {currentView === 'history' && <HistorySection />}
             {currentView === 'themes' && <ThemesSection />}
          </div>

        </div>
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Sala do Empreendedor Digital. Todos os direitos reservados.</p>
          <p className="text-xs mt-1">Desenvolvido com React & Gemini AI</p>
        </div>
      </footer>
    </div>
  );
};

export default App;