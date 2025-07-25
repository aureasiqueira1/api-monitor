'use client';

import { motion } from 'framer-motion';
import { Globe, Plus } from 'lucide-react';
import { useState } from 'react';

interface ApiFormProps {
  onAdd: (api: {
    name: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    expectedStatus?: number;
    timeout?: number;
  }) => void;
}

export function ApiForm({ onAdd }: ApiFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    method: 'GET' as const,
    expectedStatus: 200,
    timeout: 10000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) return;

    onAdd(formData);
    setFormData({
      name: '',
      url: '',
      method: 'GET',
      expectedStatus: 200,
      timeout: 10000,
    });
    setIsOpen(false);
  };

  return (
    <div className="glass-morphism rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Adicionar API</h2>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isOpen ? 'Cancelar' : 'Nova API'}
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nome da API</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: API Principal"
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Método HTTP</label>
              <select
                value={formData.method}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    method: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE',
                  }))
                }
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL da API</label>
            <input
              type="url"
              value={formData.url}
              onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://api.exemplo.com/health"
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status Esperado
              </label>
              <input
                type="number"
                value={formData.expectedStatus}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    expectedStatus: parseInt(e.target.value),
                  }))
                }
                placeholder="200"
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (ms)</label>
              <input
                type="number"
                value={formData.timeout}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    timeout: parseInt(e.target.value),
                  }))
                }
                placeholder="10000"
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Adicionar API
          </button>
        </form>
      </motion.div>
    </div>
  );
}
