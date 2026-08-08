import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Upload, CheckCircle } from 'lucide-react';

export default function ImportExcel() {
  const { isAdmin } = useApp();
  const [loading, setLoading] = useState(false);

  if (!isAdmin) {
    return (
      <div className="p-6">
        <h2 className="text-xl text-red-500">Acesso Negado</h2>
      </div>
    );
  }

  const handleImport = async () => {
    // A ser implementado
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Importar Dados da Escala</h2>
          <p className="text-slate-400 text-sm mt-1">Ferramenta restrita para inicialização e migração de dados do Excel.</p>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 max-w-xl">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
          <Database size={18} className="text-green-400"/>
          Processar "Escala 07.08.26.xlsx"
        </h3>
        
        <p className="text-slate-400 text-sm mb-6">
          Esta ação irá ler o arquivo Excel localizado no servidor, extrair as linhas e a grade completa dos dias do mês (incluindo finais de semana) e salvar diretamente no Firebase.
        </p>

        <button
          onClick={handleImport}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? <Upload size={18} className="animate-bounce"/> : <CheckCircle size={18}/>}
          {loading ? 'Processando...' : 'Iniciar Importação Completa'}
        </button>
      </div>
    </div>
  );
}
