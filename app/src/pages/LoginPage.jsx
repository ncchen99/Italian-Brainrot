import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uiImages } from '../assets';

export default function LoginPage() {
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (teamName.trim().length > 0) {
      // Allow saving team name context in later implementation
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0D0F1A] via-[#1A1D2E] to-[#2D314A]">
        <img src={uiImages.loginBackground} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        {/* Floating background elements */}
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
          <div className="absolute inset-0 bg-[#7C5CFC] rounded-full blur-2xl opacity-40"></div>
          <div className="w-full h-full bg-[#1A1D2E] border-4 border-[#FBBF24] rounded-full shadow-[0_0_30px_rgba(251,191,36,0.5)] flex items-center justify-center overflow-hidden">
            <img src={uiImages.logo} alt="義次元腦洞大開 Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] to-[#F472B6] drop-shadow-sm leading-tight">
          義次元<br />腦洞大開
        </h1>
        <p className="text-center text-[#4ADE80] mb-12 font-bold tracking-widest drop-shadow-md">
          校園瑪瑪咪呀合成大戰
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full bg-[#1A1D2E]/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
          <div className="mb-6">
            <label htmlFor="teamName" className="block text-sm font-bold text-[#38BDF8] mb-2">
              👉 輸入小隊編號或名稱
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="例如：閃電特攻隊"
              className="w-full bg-[#0D0F1A] border-2 border-gray-600 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#7C5CFC] focus:ring-4 focus:ring-[#7C5CFC]/30 transition-all text-lg font-bold text-center"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-[#4ADE80] to-[#22c55e] border-b-4 border-[#166534] active:border-b-0 active:translate-y-1 transition-all duration-150 py-4 shadow-[0_0_20px_rgba(74,222,128,0.4)]"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
            <span className="relative text-white font-bold text-xl drop-shadow-md flex items-center justify-center gap-2">
              出發拯救校園！ 🚀
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
