import React, { useState, useEffect } from 'react';
import { AttendanceRecord } from '../types';
import { THEMES } from '../constants';
import { dbService } from '../services/dbService';

export const HistorySection: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await dbService.getAllAttendances();
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

  const getThemeLabel = (id: string) => THEMES.find(t => t.id === id)?.label || id;

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
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
                      <button className="text-blue-600 hover:text-blue-800 transition p-2 bg-blue-50 rounded-full hover:bg-blue-100" title="Ver Detalhes">
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
    </div>
  );
};
