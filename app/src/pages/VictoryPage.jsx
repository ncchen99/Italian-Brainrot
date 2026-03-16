import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uiImages } from '../assets';

export default function VictoryPage() {
  const navigate = useNavigate();
  const [showCert, setShowCert] = useState(false);
  const certRef = useRef();

  useEffect(() => {
    // Reveal certificate with slight delay
    setTimeout(() => setShowCert(true), 800);
  }, []);

  const handleDownload = () => {
    // In real app: use html2canvas or similar to save certRef.current
    alert("證書儲存功能建置中...想像你的手機裡存了一張超酷的披薩大師證書！ 📸");
  };

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center bg-[#0D0F1A] py-12 px-6 relative overflow-y-auto overflow-x-hidden">
      
      {/* Confetti Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
         {Array.from({ length: 50 }).map((_, i) => {
           const colors = ['bg-[#FBBF24]', 'bg-[#F472B6]', 'bg-[#4ADE80]', 'bg-[#38BDF8]', 'bg-[#7C5CFC]'];
           const color = colors[Math.floor(Math.random() * colors.length)];
           return (
             <div 
               key={i}
               className={`absolute w-2 h-4 rounded-sm ${color} animate-drop`}
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `-10%`,
                 animationDelay: `${Math.random() * 5}s`,
                 animationDuration: `${Math.random() * 3 + 2}s`,
                 transform: `rotate(${Math.random() * 360}deg)`
               }}
             />
           );
         })}
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FBBF24] to-[#f59e0b] mb-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] mt-4 text-center">
          WORLD SAVED!
        </h1>
        <p className="text-gray-300 font-bold mb-8 text-center bg-black/50 px-4 py-1 rounded-full border border-white/10 backdrop-blur-md">
          校園的和平被保衛了！
        </p>

        {/* Certificate Card */}
        <div 
          ref={certRef}
          className={`w-full bg-[#1A1D2E] rounded-[2rem] border-4 border-[#FBBF24] p-6 shadow-[0_0_40px_rgba(251,191,36,0.3)] flex flex-col items-center relative transition-all duration-1000 transform origin-bottom
            ${showCert ? 'opacity-100 translate-y-0 rotate-0 scale-100' : 'opacity-0 translate-y-32 rotate-[-5deg] scale-90'}
          `}
        >
           {/* Ribbon Decor */}
           <div className="absolute -top-6 bg-[#EF4444] text-white px-6 py-2 rounded-t-xl font-bold border-2 border-red-800 shadow-md">
             HERO CERTIFICATE
           </div>
           
           <div className="w-full flex justify-between items-start mt-4 mb-6">
             <img src={uiImages.ultimatePizza} alt="終極瑪格麗特披薩" className="w-16 h-16 object-contain drop-shadow-md" />
             <div className="text-right">
                <div className="text-xs text-gray-400 font-bold mb-1">認證編號</div>
                <div className="text-[#38BDF8] font-mono">PIZZA-001</div>
             </div>
           </div>

           <h2 className="text-[#FBBF24] text-xl font-bold mb-4 w-full border-b border-gray-700 pb-2">閃電特攻隊</h2>
           
           <div className="w-full space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">完成時間</span>
                <span className="text-white font-mono font-bold">45 分 23 秒</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">收集食材</span>
                <span className="text-[#4ADE80] font-bold">4 / 4 完美達成</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">智力評級</span>
                <span className="text-[#F472B6] font-bold">SSS 級大腦洞</span>
              </div>
           </div>
           
           <div className="text-xs text-center text-gray-500 font-bold border-t border-gray-800 pt-4 w-full">
             提拉米蘇大師親自認證<br/>2026 義次元腦洞大開
           </div>
        </div>

        <div className={`w-full mt-10 space-y-4 transition-all duration-500 delay-1000 ${showCert ? 'opacity-100' : 'opacity-0'}`}>
          <button 
             onClick={handleDownload}
             className="w-full py-4 rounded-xl font-bold text-white bg-[#38BDF8] border-b-4 border-[#0284c7] active:border-b-0 active:translate-y-1 shadow-lg"
          >
             📥 儲存數位證書
          </button>
          
          <button 
             onClick={() => navigate('/login')}
             className="w-full py-4 rounded-xl font-bold text-gray-400 bg-gray-900 border border-gray-700 hover:text-white transition-colors"
          >
             返回主選單
          </button>
        </div>

      </div>

    </div>
  );
}
