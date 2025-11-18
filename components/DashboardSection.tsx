import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { ThemeOption } from '../types';

interface MonthlyStats {
  label: string; // MM/YYYY
  count: number;
  month: number;
  year: number;
}

interface CategoryStats {
  id: string;
  label: string;
  count: number;
  percentage: number;
}

interface HourStats {
  hour: string;
  count: number;
  percentage: number;
}

export const DashboardSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [dailyAverage, setDailyAverage] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryStats[]>([]);
  const [hourlyData, setHourlyData] = useState<HourStats[]>([]);
  const [yearStats, setYearStats] = useState<{year: string, count: number}[]>([]);

  useEffect(() => {
    calculateMetrics();
  }, []);

  const calculateMetrics = async () => {
    setIsLoading(true);
    try {
      const [records, themes] = await Promise.all([
        dbService.getAllAttendances(),
        dbService.getAllThemes()
      ]);

      if (records.length === 0) {
        setIsLoading(false);
        return;
      }

      // 1. Total
      setTotalRecords(records.length);

      // 2. Daily Average
      const uniqueDates = new Set(records.map(r => r.startDate));
      const daysCount = uniqueDates.size || 1;
      setDailyAverage(parseFloat((records.length / daysCount).toFixed(1)));

      // 3. By Month & Year
      const monthMap: Record<string, { count: number, month: number, year: number }> = {};
      const yearMap: Record<string, number> = {};

      records.forEach(r => {
        // r.startDate is DD/MM/YYYY
        const parts = r.startDate.split('/');
        if (parts.length === 3) {
          const month = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          const key = `${month.toString().padStart(2, '0')}/${year}`;
          
          if (!monthMap[key]) monthMap[key] = { count: 0, month, year };
          monthMap[key].count++;

          const yearKey = year.toString();
          yearMap[yearKey] = (yearMap[yearKey] || 0) + 1;
        }
      });

      const sortedMonths = Object.entries(monthMap)
        .map(([label, data]) => ({ label, ...data }))
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        })
        .slice(-12); // Last 12 months

      setMonthlyData(sortedMonths);
      setYearStats(Object.entries(yearMap).map(([year, count]) => ({ year, count })).sort((a,b) => b.year.localeCompare(a.year)));

      // 4. By Category
      const themeCounts: Record<string, number> = {};
      records.forEach(r => {
        themeCounts[r.theme] = (themeCounts[r.theme] || 0) + 1;
      });

      const catStats: CategoryStats[] = themes.map(t => {
        const count = themeCounts[t.id] || 0;
        return {
          id: t.id,
          label: t.label,
          count,
          percentage: records.length > 0 ? (count / records.length) * 100 : 0
        };
      }).sort((a, b) => b.count - a.count);

      setCategoryData(catStats);

      // 5. By Hour
      const hourCounts: Record<string, number> = {};
      records.forEach(r => {
        // r.startTime is HH:MM
        const hour = r.startTime.split(':')[0];
        if (hour) {
           hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      });

      // Create array for hours 08 to 18 (business hours usually)
      const businessHours = Array.from({ length: 11 }, (_, i) => (i + 8).toString().padStart(2, '0'));
      const hStats = businessHours.map(h => {
        const count = hourCounts[h] || 0;
        return {
          hour: h,
          count,
          percentage: records.length > 0 ? (count / Math.max(...Object.values(hourCounts))) * 100 : 0
        };
      });

      setHourlyData(hStats);

    } catch (error) {
      console.error("Error calculating metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fa-solid fa-chart-pie fa-spin text-4xl text-blue-500 mb-3"></i>
          <p className="text-gray-500">Calculando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">
          <i className="fa-solid fa-chart-line mr-2 text-blue-600"></i> Dashboard Gerencial
        </h2>
        <button onClick={calculateMetrics} className="text-sm text-blue-600 hover:underline">
          <i className="fa-solid fa-rotate-right mr-1"></i> Atualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Total Atendimentos</p>
            <p className="text-3xl font-extrabold text-gray-800">{totalRecords}</p>
          </div>
          <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
            <i className="fa-solid fa-users text-xl"></i>
          </div>
        </div>

        {/* Média Diária */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Média Diária</p>
            <p className="text-3xl font-extrabold text-gray-800">{dailyAverage}</p>
          </div>
          <div className="bg-green-100 text-green-600 p-3 rounded-full">
            <i className="fa-solid fa-calculator text-xl"></i>
          </div>
        </div>

        {/* Ano Atual */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Neste Ano ({new Date().getFullYear()})</p>
            <p className="text-3xl font-extrabold text-gray-800">
                {yearStats.find(y => y.year === new Date().getFullYear().toString())?.count || 0}
            </p>
          </div>
          <div className="bg-purple-100 text-purple-600 p-3 rounded-full">
            <i className="fa-solid fa-calendar-check text-xl"></i>
          </div>
        </div>

        {/* Categoria Top */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500 flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-gray-400 uppercase">Principal Demanda</p>
            <p className="text-lg font-bold text-gray-800 truncate" title={categoryData[0]?.label || '-'}>
                {categoryData[0]?.label || '-'}
            </p>
             <p className="text-xs text-orange-600 font-bold">{categoryData[0]?.count || 0} registros</p>
          </div>
          <div className="bg-orange-100 text-orange-600 p-3 rounded-full shrink-0">
            <i className="fa-solid fa-star text-xl"></i>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico de Barras Mensal */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">Atendimentos por Mês (Últimos 12)</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {monthlyData.length > 0 ? monthlyData.map((data, idx) => {
                const maxCount = Math.max(...monthlyData.map(m => m.count));
                const heightPercent = (data.count / maxCount) * 100;
                return (
                    <div key={idx} className="flex flex-col items-center flex-1 group cursor-pointer">
                        <div className="relative w-full flex items-end justify-center h-full">
                            <div 
                                style={{ height: `${heightPercent}%` }} 
                                className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all relative group-hover:shadow-lg"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {data.count}
                                </div>
                            </div>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-2 font-medium rotate-0 md:rotate-0">{data.label}</span>
                    </div>
                )
            }) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Sem dados suficientes</div>
            )}
          </div>
        </div>

        {/* Categorias */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">Demandas por Categoria</h3>
            <div className="space-y-4 overflow-y-auto max-h-64 pr-2">
                {categoryData.map((cat) => (
                    <div key={cat.id}>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                            <span className="text-xs font-bold text-gray-500">{cat.count} ({cat.percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-orange-500 h-2.5 rounded-full transition-all duration-500" 
                                style={{ width: `${cat.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
                {categoryData.length === 0 && <p className="text-gray-400 text-center">Sem dados</p>}
            </div>
        </div>

        {/* Atendimentos por Hora */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">Fluxo de Atendimento por Hora (08h - 18h)</h3>
            <div className="flex items-end justify-between h-40 gap-1">
                {hourlyData.map((h, idx) => {
                     // Normalize simpler for visibility (relative to max hour)
                     const maxH = Math.max(...hourlyData.map(x => x.count)) || 1;
                     const height = (h.count / maxH) * 100;
                     
                     return (
                        <div key={idx} className="flex-1 flex flex-col items-center group">
                             <div className="text-xs font-bold text-gray-600 mb-1 opacity-0 group-hover:opacity-100 transition">{h.count}</div>
                             <div className="w-full bg-gray-100 rounded-t-md h-full flex items-end relative overflow-hidden">
                                 <div 
                                    style={{ height: `${height}%` }} 
                                    className={`w-full transition-all duration-500 ${height > 80 ? 'bg-red-400' : height > 40 ? 'bg-blue-400' : 'bg-green-300'}`}
                                 ></div>
                             </div>
                             <div className="text-xs text-gray-500 mt-2 font-mono">{h.hour}h</div>
                        </div>
                     )
                })}
            </div>
        </div>

      </div>
    </div>
  );
};