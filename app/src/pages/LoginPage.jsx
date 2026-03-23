import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uiImages } from '../assets';
import { useAppSession } from '../contexts/AppSessionContext';
import { requestAppFullscreen } from '../services/fullscreenService';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LoginPage() {
  const [teamName, setTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const navigate = useNavigate();
  const { bindTeamProfile } = useAppSession();
  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    const safeTeamName = teamName.trim();
    if (!safeTeamName) return;

    setIsSubmitting(true);
    setErrorText('');

    try {
      await bindTeamProfile(safeTeamName);
      await requestAppFullscreen();
      navigate('/dashboard');
    } catch (error) {
      console.error('[login] bindTeamProfile failed', {
        code: error?.code,
        message: error?.message
      });
      setErrorText(error?.message || t('login.loginFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      <LanguageSwitcher />
      {/* Two-tone Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
        <img src={uiImages.loginBackground} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/5 animate-float"
            style={{
              width: `${Math.random() * 40 + 20}px`,
              height: `${Math.random() * 40 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 4 + 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Logo Area */}
        <div className="w-48 h-48 mb-6 relative animate-bounce" style={{ animationDuration: '3s' }}>
          <div className="absolute inset-0 bg-[#F59E0B] rounded-full blur-2xl opacity-35"></div>
          <div className="w-full h-full bg-[#1E293B] border-4 border-[#F59E0B] rounded-full shadow-[0_0_30px_rgba(245,158,11,0.45)] flex items-center justify-center overflow-hidden">
            <img src={uiImages.logo} alt="義次元腦洞大開 Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#F59E0B] drop-shadow-sm leading-tight">
          {t('login.titleLine1')}<br />{t('login.titleLine2')}
        </h1>
        <p className="text-center text-[#F59E0B] mb-12 font-bold tracking-widest drop-shadow-md">
          {t('login.subtitle')}
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full bg-[#1E293B]/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
          <div className="mb-6">
            <label htmlFor="teamName" className="block text-sm font-bold text-[#F59E0B] mb-2">
              {t('login.inputLabel')}
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder={t('login.inputPlaceholder')}
              className="w-full bg-[#0F172A] border-2 border-gray-600 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/30 transition-all text-lg font-bold text-center"
              required
            />
          </div>

          {errorText ? (
            <p className="text-sm text-pink-300 bg-pink-900/30 border border-pink-500/40 rounded-xl px-3 py-2 mb-4">
              {errorText}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full relative group overflow-hidden rounded-2xl bg-[#F59E0B] border-b-4 border-[#B45309] active:border-b-0 active:translate-y-1 transition-all duration-150 py-4 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
            <span className="relative text-white font-bold text-xl drop-shadow-md flex items-center justify-center gap-2">
              {isSubmitting ? t('login.loggingIn') : t('login.submitBtn')}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
