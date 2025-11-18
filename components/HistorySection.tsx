import React, { useState, useEffect } from 'react';
import { AttendanceRecord, ThemeOption } from '../types';
import { dbService } from '../services/dbService';

export const HistorySection: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [themesMap, setThemesMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [records, themes] = await Promise.all([
        dbService.getAllAttendances(),
        dbService.getAllThemes()
      ]);
      
      // Create a map for faster lookup: id -> label
      const map: Record<string, string> = {};
      themes.forEach(t => map[t.id] = t.label);
      setThemesMap(map);

      setAllRecords(records);
      setFilteredData(records);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    if (!startDate && !endDate) {
      setFilteredData(allRecords);
      return;
    }

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (end) end.setHours(23, 59, 59, 999);
    if (start) start.setHours(0, 0, 0, 0);

    const filtered = allRecords.filter(item => {
      const [day, month, year] = item.startDate.split('/');
      const itemDate = new Date(Number(year), Number(month) - 1, Number(day));
      
      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;
      return true;
    });

    setFilteredData(filtered);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setFilteredData(allRecords);
  };

  const getThemeLabel = (id: string) => themesMap[id] || id;

  // Modal Helpers
  const openModal = (record: AttendanceRecord) => setSelectedRecord(record);
  const closeModal = () => setSelectedRecord(null);

  const printRecord = () => {
    const printContent = document.getElementById('modal-print-area');
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore React state/events after body replacement
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 relative">
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-3 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white uppercase shadow-sm">
          <i className="fa-solid fa-list mr-2"></i> Histórico de Atendimentos
        </h2>
        <div className="text-xs text-blue-100 bg-blue-800/30 px-2 py-1 rounded flex items-center gap-2">
          {isLoading ? (
             <i className="fa-solid fa-spinner fa-spin"></i>
          ) : (
             <span>{filteredData.length} Registros</span>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Filter Bar */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
            <i className="fa-solid fa-filter text-blue-500"></i> Filtro por Período
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-xs font-medium text-gray-600 mb-1">Data Inicial</label>
              <div className="relative">
                <i className="fa-regular fa-calendar absolute left-3 top-2.5 text-gray-400"></i>
                <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-xs font-medium text-gray-600 mb-1">Data Final</label>
              <div className="relative">
                <i className="fa-regular fa-calendar absolute left-3 top-2.5 text-gray-400"></i>
                <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={handleFilter}
                className="flex-1 md:flex-none bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-search"></i> Filtrar
              </button>
              <button 
                onClick={handleClear}
                className="flex-1 md:flex-none bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-50 transition flex items-center justify-center"
                title="Limpar Filtros"
              >
                <i className="fa-solid fa-eraser"></i>
              </button>
               <button 
                onClick={loadData}
                className="flex-1 md:flex-none bg-gray-200 text-gray-600 px-4 py-2 rounded hover:bg-gray-300 transition flex items-center justify-center"
                title="Atualizar Dados"
              >
                <i className="fa-solid fa-rotate"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
                <th className="px-4 py-3 border-b">Data/Hora</th>
                <th className="px-4 py-3 border-b">ID</th>
                <th className="px-4 py-3 border-b">Cliente</th>
                <th className="px-4 py-3 border-b">Tema/Subtema</th>
                <th className="px-4 py-3 border-b text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500 mb-2"></i>
                    <p className="text-gray-500">Carregando base de dados...</p>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((record) => (
                  <tr key={record.id} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{record.startDate}</div>
                      <div className="text-xs text-gray-500">{record.startTime}</div>
                    </td>
                    <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded text-xs font-mono">{record.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-blue-900">{record.name}</div>
                      <div className="text-xs text-gray-500">{record.document}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-bold text-gray-600 uppercase mb-0.5">
                        {getThemeLabel(record.theme)}
                      </div>
                      <div className="text-gray-600 text-xs">{record.subtheme}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => openModal(record)}
                        className="text-blue-600 hover:text-blue-800 transition p-2 bg-blue-50 rounded-full hover:bg-blue-100" 
                        title="Ver Detalhes Completos"
                      >
                        <i className="fa-regular fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                        <i className="fa-regular fa-folder-open text-4xl mb-2"></i>
                        <p className="text-sm">Nenhum atendimento encontrado.</p>
                        <button onClick={() => window.location.reload()} className="mt-2 text-blue-600 text-xs hover:underline">Recarregar</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALHES */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-in-out]">
            
            {/* Header Modal */}
            <div className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <i className="fa-solid fa-file-lines"></i> Detalhes do Atendimento
                </h3>
                <p className="text-xs text-blue-200">ID Registro: {selectedRecord.id}</p>
              </div>
              <button onClick={closeModal} className="text-white/80 hover:text-white hover:bg-blue-600 p-2 rounded-full transition">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            {/* Body Modal - Printable Area */}
            <div id="modal-print-area" className="p-6 overflow-y-auto flex-grow space-y-6">
              
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Data</label>
                    <p className="text-gray-800 font-medium">{selectedRecord.startDate}</p>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Hora</label>
                    <p className="text-gray-800 font-medium">{selectedRecord.startTime}</p>
                 </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-blue-700 uppercase mb-2 border-b border-blue-100 pb-1">
                   <i className="fa-solid fa-user mr-1"></i> Cliente
                </h4>
                <div className="bg-blue-50 p-3 rounded border border-blue-100">
                   <p className="font-bold text-lg text-blue-900">{selectedRecord.name}</p>
                   <p className="font-mono text-sm text-blue-700">{selectedRecord.document}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-2 border-b border-gray-100 pb-1">
                   <i className="fa-solid fa-tag mr-1"></i> Classificação
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500">Tema</label>
                        <p className="font-medium text-gray-800">{getThemeLabel(selectedRecord.theme)}</p>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">Subtema</label>
                        <p className="font-medium text-gray-800">{selectedRecord.subtheme}</p>
                    </div>
                </div>
              </div>

              <div>
                 <h4 className="text-sm font-bold text-gray-700 uppercase mb-2 border-b border-gray-100 pb-1">
                   <i className="fa-solid fa-align-left mr-1"></i> Descrição do Serviço
                </h4>
                 <div className="bg-gray-50 p-4 rounded text-gray-700 text-sm leading-relaxed border border-gray-200 whitespace-pre-wrap">
                   {selectedRecord.description || "Nenhuma descrição informada."}
                 </div>
              </div>

              <div>
                 <h4 className="text-sm font-bold text-gray-700 uppercase mb-2 border-b border-gray-100 pb-1">
                   <i className="fa-solid fa-envelope mr-1"></i> Orientação (Modelo E-mail)
                </h4>
                 <div className="bg-yellow-50 p-4 rounded text-gray-800 text-sm font-mono border border-yellow-200 whitespace-pre-wrap">
                   {selectedRecord.emailGuidance || "Nenhuma orientação gerada."}
                 </div>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="bg-gray-50 border-t p-4 flex justify-end gap-3">
              <button 
                onClick={printRecord}
                className="px-4 py-2 text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 rounded font-medium transition flex items-center gap-2"
              >
                <i className="fa-solid fa-print"></i> Imprimir
              </button>
              <button 
                onClick={closeModal}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded font-medium transition"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};