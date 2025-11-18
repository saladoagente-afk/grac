import React, { useState, useEffect } from 'react';
import { ThemeOption } from '../types';
import { dbService } from '../services/dbService';

export const ThemesSection: React.FC = () => {
  const [themes, setThemes] = useState<ThemeOption[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ThemeOption>({
    id: '',
    label: '',
    subthemes: []
  });
  const [newSubtheme, setNewSubtheme] = useState('');

  useEffect(() => {
    loadThemes();
  }, [viewMode]);

  const loadThemes = async () => {
    setIsLoading(true);
    try {
      const data = await dbService.getAllThemes();
      setThemes(data);
    } catch (error) {
      console.error('Erro ao carregar temas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewTheme = () => {
    setFormData({
      id: `theme_${Date.now()}`, // Simple ID generation
      label: '',
      subthemes: []
    });
    setViewMode('form');
  };

  const handleEditTheme = (theme: ThemeOption) => {
    setFormData({ ...theme });
    setViewMode('form');
  };

  const handleDeleteTheme = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este tema?')) {
      await dbService.deleteTheme(id);
      loadThemes();
    }
  };

  // --- Subtheme Logic ---
  const addSubtheme = () => {
    if (newSubtheme.trim()) {
      setFormData(prev => ({
        ...prev,
        subthemes: [...prev.subthemes, newSubtheme.trim()]
      }));
      setNewSubtheme('');
    }
  };

  const removeSubtheme = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subthemes: prev.subthemes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label) {
      alert('O nome do tema é obrigatório.');
      return;
    }
    
    try {
      await dbService.saveTheme(formData);
      alert('Tema salvo com sucesso!');
      setViewMode('list');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar tema.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-600 px-6 py-3 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white uppercase shadow-sm">
          <i className="fa-solid fa-sliders mr-2"></i> Configuração de Temas e Subtemas
        </h2>
        {viewMode === 'list' && (
            <button 
                onClick={handleNewTheme}
                className="bg-white text-indigo-700 px-4 py-1 rounded text-sm font-bold hover:bg-indigo-50 transition"
            >
                <i className="fa-solid fa-plus mr-1"></i> Novo Tema
            </button>
        )}
        {viewMode === 'form' && (
            <button 
                onClick={() => setViewMode('list')}
                className="bg-white/20 text-white px-4 py-1 rounded text-sm font-bold hover:bg-white/30 transition"
            >
                <i className="fa-solid fa-arrow-left mr-1"></i> Voltar
            </button>
        )}
      </div>

      <div className="p-6">
        {viewMode === 'list' ? (
            // --- LIST VIEW ---
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center py-12">
                         <i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-500"></i>
                    </div>
                ) : themes.length > 0 ? (
                    themes.map(theme => (
                        <div key={theme.id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition bg-gray-50 flex flex-col">
                            <div className="p-4 border-b bg-white rounded-t-lg flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">{theme.label}</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditTheme(theme)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><i className="fa-solid fa-pen"></i></button>
                                    <button onClick={() => handleDeleteTheme(theme.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><i className="fa-solid fa-trash"></i></button>
                                </div>
                            </div>
                            <div className="p-4 flex-grow">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Subtemas ({theme.subthemes.length})</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    {theme.subthemes.slice(0, 5).map((sub, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <i className="fa-solid fa-angle-right text-xs text-gray-400"></i> {sub}
                                        </li>
                                    ))}
                                    {theme.subthemes.length > 5 && (
                                        <li className="text-xs text-indigo-600 italic">+ {theme.subthemes.length - 5} outros...</li>
                                    )}
                                    {theme.subthemes.length === 0 && <li className="text-gray-400 italic">Sem subtemas cadastrados.</li>}
                                </ul>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                        Nenhum tema cadastrado.
                    </div>
                )}
            </div>
        ) : (
            // --- FORM VIEW ---
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Tema / Categoria Principal</label>
                    <input 
                        type="text" 
                        value={formData.label}
                        onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-semibold"
                        placeholder="Ex: Microempreendedor Individual (MEI)"
                        required
                    />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Subtemas (Assuntos)</label>
                    
                    <div className="flex gap-2 mb-4">
                        <input 
                            type="text" 
                            value={newSubtheme}
                            onChange={(e) => setNewSubtheme(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtheme())}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Digite um subtema e tecle Enter..."
                        />
                        <button 
                            type="button" 
                            onClick={addSubtheme}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                        >
                            <i className="fa-solid fa-plus"></i> Adicionar
                        </button>
                    </div>

                    <ul className="space-y-2">
                        {formData.subthemes.length === 0 && (
                            <li className="text-center text-gray-400 py-4">Nenhum subtema adicionado ainda.</li>
                        )}
                        {formData.subthemes.map((sub, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-white border border-gray-200 px-3 py-2 rounded shadow-sm">
                                <span className="text-gray-700">{sub}</span>
                                <button 
                                    type="button" 
                                    onClick={() => removeSubtheme(idx)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                                >
                                    <i className="fa-solid fa-times"></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button 
                        type="button" 
                        onClick={() => setViewMode('list')}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="px-8 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold uppercase shadow-md"
                    >
                        <i className="fa-solid fa-save mr-2"></i> Salvar Configurações
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};