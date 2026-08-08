// src/pages/Login.jsx
// Firebase Email/Password authentication screen

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Bus, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function Login() {
  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const errorMessages = {
    'auth/user-not-found':   'Usuário não encontrado.',
    'auth/wrong-password':   'Senha incorreta.',
    'auth/invalid-email':    'E-mail inválido.',
    'auth/email-already-in-use': 'Este e-mail já está em uso.',
    'auth/weak-password':    'A senha deve ter pelo menos 6 caracteres.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(errorMessages[err.code] || `Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-black/50">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4">
              <Bus size={30} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">ScalaOp</h1>
            <p className="text-slate-400 text-sm mt-1">Gestão de Escalas e Motoristas</p>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-slate-700/50 rounded-xl p-1 mb-6">
            {[['login', 'Entrar', LogIn], ['register', 'Criar Conta', UserPlus]].map(([m, label, Icon]) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500/60 focus:bg-slate-700 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl pl-10 pr-10 py-3 outline-none focus:border-blue-500/60 focus:bg-slate-700 transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : mode === 'login' ? <LogIn size={16}/> : <UserPlus size={16}/>}
              {mode === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>

          <p className="text-slate-600 text-xs text-center mt-6">
            ScalaOp v2.0 · escala-f2f7f · Firebase
          </p>
        </div>
      </div>
    </div>
  );
}
