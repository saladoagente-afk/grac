import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { dbService } from '../services/dbService';

export const ClientsSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Client>({
    document: '',
    type: 'CPF',
    name: '',
    fantasyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    uf: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (viewMode === 'list') {
      loadClients();
    }
  }, [viewMode]);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await dbService.getAllClients();
      setClients(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewClient = () => {
    setFormData({
      document: '',
      type: 'CPF',
      name: '',
      fantasyName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      uf: ''
    });
    setIsEditing(false);
    setViewMode('form');
  };

  const handleEditClient = (client: Client) => {
    setFormData(client);
    setIsEditing(true);
    setViewMode('form');
  };

  const handleDeleteClient = async (document: string) => {
    if (window.confirm(`Deseja excluir o cliente ${document}?`)) {
        await dbService.deleteClient(document);
        loadClients();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.document || !formData.name) {
        alert("CPF/CNPJ e Nome são obrigatórios");
        return;
    }

    try {
        await dbService.saveClient(formData);
        alert('Cliente salvo com sucesso!');
        setViewMode('list');
    } catch (error) {
        alert('Erro ao salvar cliente.');
        console.error(error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-3 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white uppercase shadow-sm">
          <i className="fa-solid fa-users mr-2"></i> Gestão de Clientes
        </h2>
        {viewMode === 'list' && (
            <button 
                onClick={handleNewClient}
                className="bg-white text-green-700 px-4 py-1 rounded text-sm font-bold hover:bg-green-50 transition"
            >
                <i className="fa-solid fa-plus mr-1"></i> Novo Cliente
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
            // --- LISTA ---
            <div className="overflow-x-auto">
                <div className="mb-4">
                    <input 
                        type="text" 
                        placeholder="Buscar por Nome ou CPF/CNPJ..." 
                        className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 text-xs font-bold uppercase">
                            <th className="px-4 py-3 border-b">Documento</th>
                            <th className="px-4 py-3 border-b">Nome / Razão Social</th>
                            <th className="px-4 py-3 border-b">Contato</th>
                            <th className="px-4 py-3 border-b text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={4} className="text-center py-8">Carregando...</td></tr>
                        ) : clients.length > 0 ? (
                            clients.map(client => (
                                <tr key={client.document} className="hover:bg-green-50 transition">
                                    <td className="px-4 py-3 font-mono text-gray-600">
                                        {client.document}
                                        <span className="ml-2 text-xs bg-gray-200 px-1 rounded">{client.type}</span>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-800">
                                        {client.name}
                                        {client.fantasyName && <div className="text-xs text-gray-500 font-normal">{client.fantasyName}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        <div>{client.email}</div>
                                        <div className="text-xs">{client.phone}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center space-x-2">
                                        <button onClick={() => handleEditClient(client)} className="text-blue-600 hover:text-blue-800"><i className="fa-solid fa-pen"></i></button>
                                        <button onClick={() => handleDeleteClient(client.document)} className="text-red-600 hover:text-red-800"><i className="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={4} className="text-center py-8 text-gray-500">Nenhum cliente cadastrado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        ) : (
            // --- FORMULÁRIO ---
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pessoa</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="type" 
                                    value="CPF" 
                                    checked={formData.type === 'CPF'} 
                                    onChange={handleInputChange}
                                    disabled={isEditing}
                                    className="text-green-600 focus:ring-green-500"
                                />
                                <span>Pessoa Física (CPF)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="type" 
                                    value="CNPJ" 
                                    checked={formData.type === 'CNPJ'} 
                                    onChange={handleInputChange}
                                    disabled={isEditing}
                                    className="text-green-600 focus:ring-green-500"
                                />
                                <span>Pessoa Jurídica (CNPJ)</span>
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Documento (CPF/CNPJ) *</label>
                        <input 
                            type="text" 
                            name="document"
                            value={formData.document}
                            onChange={handleInputChange}
                            readOnly={isEditing}
                            required
                            className={`w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            placeholder={formData.type === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo / Razão Social *</label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none uppercase"
                        />
                    </div>

                    {formData.type === 'CNPJ' && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
                            <input 
                                type="text" 
                                name="fantasyName"
                                value={formData.fantasyName}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none uppercase"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                        <input 
                            type="text" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>

                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                        <input 
                            type="text" 
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                        <input 
                            type="text" 
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
                        <input 
                            type="text" 
                            name="uf"
                            value={formData.uf}
                            onChange={handleInputChange}
                            maxLength={2}
                            className="w-20 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none uppercase"
                        />
                    </div>

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
                        className="px-8 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold uppercase shadow-md"
                    >
                        <i className="fa-solid fa-save mr-2"></i> Salvar Cliente
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};