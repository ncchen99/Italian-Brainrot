import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh-TW' ? 'en' : 'zh-TW';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="absolute top-4 right-4 z-50 flex items-center justify-center gap-2 px-3 py-2 bg-[#1E293B]/80 backdrop-blur-md rounded-full border border-white/20 shadow-lg text-white hover:bg-[#F59E0B]/20 transition-all font-bold text-sm"
    >
      <Globe className="w-4 h-4" />
      <span>{i18n.language === 'zh-TW' ? 'EN' : '中文'}</span>
    </button>
  );
}
