import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { Terminal, Shield, ChevronRight, Loader2 } from 'lucide-react';

interface AuthScreenProps {
  onSuccess: () => void;
  onAdminLogin: () => void;
}

export default function AuthScreen({ onSuccess, onAdminLogin }: AuthScreenProps) {
  const { t, toggleLanguage, language } = useLanguage();
  const [passkey, setPasskey] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const res = await fetch('/api/auth/captcha', { method: 'POST' });
      const data = await res.json();
      setCaptchaId(data.id);
      setCaptchaQuestion(data.question);
    } catch (err) {
      console.error('Failed to fetch captcha', err);
    }
  };

  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey, captchaId, captchaAnswer }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'ACCESS_DENIED');
        fetchCaptcha();
        setCaptchaAnswer('');
      }
    } catch (err) {
      setError('CONNECTION_REFUSED');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUser, password: adminPass }),
      });

      if (res.ok) {
        onAdminLogin();
      } else {
        setError('INVALID_CREDENTIALS');
      }
    } catch (err) {
      setError('CONNECTION_REFUSED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] font-mono flex flex-col items-center justify-center p-6 relative selection:bg-white selection:text-black overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20 z-0" />

      {/* Header / Language */}
      <div className="absolute top-8 right-8 flex items-center gap-4 z-20">
        <button
          onClick={toggleLanguage}
          className="text-xs font-bold tracking-widest hover:text-white transition-colors opacity-60 hover:opacity-100"
        >
          {language === 'en' ? 'EN / RO' : 'RO / EN'}
        </button>
      </div>

      {/* Admin Toggle */}
      <button
        onClick={() => setShowAdmin(!showAdmin)}
        className="absolute top-8 left-8 opacity-20 hover:opacity-100 transition-opacity z-20"
      >
        <Terminal size={20} />
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tighter mb-2 uppercase">
            {t('welcome')}
          </h1>
          <div className="h-px w-12 bg-white mx-auto opacity-20" />
        </div>

        <AnimatePresence mode="wait">
          {showAdmin ? (
            <motion.form
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleAdminSubmit}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="relative group">
                  <input
                    type="text"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    className="w-full bg-transparent border-b border-[#333] py-3 text-sm focus:outline-none focus:border-white transition-colors placeholder-transparent"
                    placeholder="ID"
                  />
                  <label className="absolute left-0 top-3 text-xs text-[#666] transition-all group-focus-within:-top-3 group-focus-within:text-[10px] group-focus-within:text-white pointer-events-none">
                    {adminUser ? '' : 'ID'}
                  </label>
                </div>
                <div className="relative group">
                  <input
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    className="w-full bg-transparent border-b border-[#333] py-3 text-sm focus:outline-none focus:border-white transition-colors placeholder-transparent"
                    placeholder="KEY"
                  />
                  <label className="absolute left-0 top-3 text-xs text-[#666] transition-all group-focus-within:-top-3 group-focus-within:text-[10px] group-focus-within:text-white pointer-events-none">
                    {adminPass ? '' : 'KEY'}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black h-12 text-xs font-bold tracking-widest uppercase hover:bg-[#ccc] transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : t('login')}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="user"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handlePasskeySubmit}
              className="space-y-8"
            >
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#666] block mb-2">
                  {t('enterPasskey')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={8}
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333] p-4 text-center text-xl tracking-[0.2em] focus:outline-none focus:border-white transition-colors placeholder-[#333]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest text-[#666]">
                    {t('captcha')}
                  </label>
                  <span className="text-xs font-bold text-[#888]">{captchaQuestion} = ?</span>
                </div>
                <input
                  type="text"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333] p-3 text-sm focus:outline-none focus:border-white transition-colors text-center"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black h-12 text-xs font-bold tracking-widest uppercase hover:bg-[#ccc] transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : (
                  <>
                    {t('submit')} <ChevronRight size={14} />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center"
          >
            <span className="inline-block px-3 py-1 bg-red-900/20 text-red-500 text-[10px] tracking-widest uppercase border border-red-900/30">
              {error}
            </span>
          </motion.div>
        )}
      </motion.div>

      <div className="absolute bottom-8 flex flex-col items-center gap-1 text-[10px] text-[#333] uppercase tracking-widest z-10">
        <span className="text-[#555] font-bold">Powered by ReddTweaks</span>
      </div>
    </div>
  );
}
