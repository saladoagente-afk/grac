import React, { useState, useEffect, useCallback } from 'react';
import { AttendanceRecord, ThemeOption } from '../types';
import { fetchEntityData, fetchGuidance } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { FormSectionTitle } from './FormSectionTitle';

export const ServiceForm: React.FC = () => {
  const generateId = () => Math.floor(10000 + Math.random() * 90000).toString();
  const getTodayDate = () => new Date().toLocaleDateString('pt-BR');
  const getNowTime = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const [formData, setFormData] = useState<AttendanceRecord>({
    id: '',
    startDate: '',
    startTime: '',
    document: '',
    name: '',
    theme: '',
    subtheme: '',
    description: '',
    emailGuidance: ''
  });

  const [themesList, setThemesList] = useState<ThemeOption[]>([]);
  const [isLoadingEntity, setIsLoadingEntity] = useState(false);
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption | null>(null);
  const [availableSubthemes, setAvailableSubthemes] = useState<string[]>([]);

  // Initialize auto-filled fields and load themes on mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      id: generateId(),
      startDate: getTodayDate(),
      startTime: getNowTime()
    }));

    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const themes = await dbService.getAllThemes();
      setThemesList(themes);
    } catch (error) {
      console.error("Failed to load themes", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeId = e.target.value;
    const theme = themesList.find(t => t.id === themeId) || null;
    
    setSelectedTheme(theme);
    setAvailableSubthemes(theme ? theme.subthemes : []);
    setFormData(prev => ({ 
      ...prev, 
      theme: themeId, 
      subtheme: '' // Reset subtheme when theme changes
    }));
  };

  const handleSearchEntity = async () => {
    if (!formData.document) return;
    
    setIsLoadingEntity(true);
    
    try {
        // 1. Tenta buscar no DB local primeiro
        const localClient = await dbService.getClient(formData.document);
        
        if (localClient) {
            setFormData(prev => ({ ...prev, name: localClient.name }));
            setIsLoadingEntity(false);
            return;
        }

        // 2. Se não achar, busca via IA (Simulação)
        const result = await fetchEntityData(formData.document);
        if (result.isValid) {
            setFormData(prev => ({ ...prev, name: result.name }));
        } else {
            alert('Documento não encontrado. Cadastre-o na aba "Clientes" ou verifique a digitação.');
        }
    } catch (error) {
        console.error("Erro na busca:", error);
        alert('Erro ao buscar dados.');
    } finally {
        setIsLoadingEntity(false);
    }
  };

  const handleFetchGuidance = async () => {
    if (!formData.theme || !formData.subtheme) {
      alert('Selecione um Tema e Subtema primeiro.');
      return;
    }

    setIsLoadingGuidance(true);
    const themeLabel = themesList.find(t => t.id === formData.theme)?.label || formData.theme;
    const guidance = await fetchGuidance(themeLabel, formData.subtheme, formData.name || 'Empreendedor');
    
    setFormData(prev => ({
      ...prev,
      description: guidance.description,
      emailGuidance: guidance.emailTemplate
    }));
    setIsLoadingGuidance(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.document || !formData.theme) {
        alert('Preencha os campos obrigatórios (CNPJ/CPF e Tema).');
        return;
    }

    setIsSaving(true);
    try {
        await dbService.addAttendance(formData);
        alert('Atendimento registrado com sucesso no Banco de Dados!');
        
        // Reset form
        setFormData({
            id: generateId(),
            startDate: getTodayDate(),
            startTime: getNowTime(),
            document: '',
            name: '',
            theme: '',
            subtheme: '',
            description: '',
            emailGuidance: ''
        });
        setSelectedTheme(null);
        setAvailableSubthemes([]);

    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar atendimento. Tente novamente.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleClear = () => {
      if(window.confirm('Tem certeza que deseja limpar o formulário?')) {
        setFormData({
            id: generateId(),
            startDate: getTodayDate(),
            startTime: getNowTime(),
            document: '',
            name: '',
            theme: '',
            subtheme: '',
            description: '',
            emailGuidance: ''
        });
        setSelectedTheme(null);
        setAvailableSubthemes([]);
      }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
      
      {/* Form Header / Title Bar */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-3 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white uppercase shadow-sm">
          <i className="fa-solid fa-file-pen mr-2"></i> 11 - Formulário de Registro de Atendimento
        </h2>
        <span className="bg-white/20 px-3 py-1 rounded text-white text-sm font-mono">
          ID: {formData.id}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8">
        
        {/* Dados Iniciais */}
        <FormSectionTitle title="Dados do Registro" icon="fa-clock" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID (Auto)</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              readOnly
              className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-600 font-mono cursor-not-allowed focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
            <div className="relative">
              <i className="fa-regular fa-calendar absolute left-3 top-3 text-gray-400"></i>
              <input
                type="text"
                name="startDate"
                value={formData.startDate}
                readOnly
                className="w-full pl-10 bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-600 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicial</label>
            <div className="relative">
              <i className="fa-regular fa-clock absolute left-3 top-3 text-gray-400"></i>
              <input
                type="text"
                name="startTime"
                value={formData.startTime}
                readOnly
                className="w-full pl-10 bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-600 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Cliente */}
        <FormSectionTitle title="Identificação do Cliente" icon="fa-user-tie" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-2">
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF ou CNPJ (Busca)</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="document"
                value={formData.document}
                onChange={handleChange}
                placeholder="000.000.000-00"
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <button
                type="button"
                onClick={handleSearchEntity}
                disabled={isLoadingEntity || !formData.document}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                title="Buscar na Base Local ou Receita (Simulado)"
              >
                {isLoadingEntity ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-search"></i>}
              </button>
            </div>
          </div>
          <div className="md:col-span-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome ou Razão Social</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              readOnly
              placeholder="Preenchimento automático após busca..."
              className="w-full bg-blue-50 border border-blue-200 text-blue-800 rounded px-3 py-2 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Classificação */}
        <FormSectionTitle title="Classificação do Atendimento" icon="fa-tags" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
            <select
              name="theme"
              value={formData.theme}
              onChange={handleThemeChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Selecione um Tema...</option>
              {themesList.map(theme => (
                <option key={theme.id} value={theme.id}>{theme.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtema</label>
            <select
              name="subtheme"
              value={formData.subtheme}
              onChange={handleChange}
              disabled={!formData.theme}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:bg-gray-100"
            >
              <option value="">Selecione um Subtema...</option>
              {availableSubthemes.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Detalhamento Inteligente */}
        <div className="flex items-center justify-between mt-6 mb-2 pb-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-wand-magic-sparkles text-purple-600"></i>
            <h3 className="text-lg font-semibold text-gray-700 uppercase">Detalhamento e Orientação</h3>
          </div>
          <button
            type="button"
            onClick={handleFetchGuidance}
            disabled={isLoadingGuidance || !formData.subtheme}
            className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded border border-purple-200 hover:bg-purple-200 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isLoadingGuidance ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Gerando...</>
            ) : (
              <><i className="fa-solid fa-bolt"></i> Gerar com IA</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Atendimento</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva o que foi realizado ou clique em 'Gerar com IA'..."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orientação por E-mail (Modelo)</label>
            <textarea
              name="emailGuidance"
              rows={5}
              value={formData.emailGuidance}
              onChange={handleChange}
              placeholder="Modelo de e-mail para o cliente..."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm bg-yellow-50 border-yellow-200 text-gray-800"
            ></textarea>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mt-8 flex flex-col md:flex-row gap-4 justify-end border-t pt-6">
           <button
            type="button"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition flex items-center justify-center gap-2"
            onClick={handleClear}
          >
            <i className="fa-solid fa-eraser"></i> Limpar
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium transition flex items-center justify-center gap-2"
            onClick={() => window.print()}
          >
            <i className="fa-solid fa-print"></i> Imprimir
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold uppercase tracking-wide shadow-md transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
               <><i className="fa-solid fa-spinner fa-spin"></i> Salvando...</>
            ) : (
               <><i className="fa-solid fa-save"></i> Registrar Atendimento</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};