import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ingredientImages, uiImages } from '../assets';

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showReward, setShowReward] = useState(false);
  
  // Demo params passed via state or URL, default to success
  const isSuccess = location.state?.success ?? true;
  const rewardItem = location.state?.reward ?? { imageSrc: ingredientImages.holyTomato, name: '神聖番茄' };

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => setShowReward(true), 1500);
    }
  }, [isSuccess]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#0D0F1A]">
      
      {/* Dynamic Background */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${isSuccess ? 'bg-[#166534]/20' : 'bg-[#991b1b]/20'}`}></div>
      
      {isSuccess && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Confetti or particles effect */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i}
              className="absolute w-3 h-3 rounded-sm bg-gradient-to-br from-[#FBBF24] to-[#F472B6] animate-drop"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 2 + 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        
        {isSuccess ? (
          <>
             <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4ADE80] to-[#22c55e] mb-2 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-bounce">
               CHALLENGE CLEARED!
             </h1>
             <p className="text-gray-300 font-bold mb-12">太棒了！解開了謎題！</p>
             
             {/* Reward Card */}
             <div className={`w-48 aspect-square rounded-[2rem] bg-gradient-to-br from-[#1A1D2E] to-[#2D314A] border-4 border-[#FBBF24] shadow-[0_0_30px_rgba(251,191,36,0.5)] flex flex-col items-center justify-center transform transition-all duration-1000 ${showReward ? 'scale-100 rotate-0 opacity-100' : 'scale-50 rotate-[360deg] opacity-0'}`}>
                <img src={rewardItem.imageSrc || ingredientImages.holyTomato} alt={rewardItem.name} className="w-20 h-20 mb-4 object-contain drop-shadow-xl" />
                <div className="text-[#FBBF24] font-bold text-lg">{rewardItem.name}</div>
             </div>
             
             <div className={`mt-12 transition-all duration-500 delay-500 ${showReward ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
               <button 
                 onClick={() => navigate('/dashboard')}
                 className="px-10 py-4 rounded-2xl font-bold text-xl text-gray-900 bg-gradient-to-r from-[#FBBF24] to-yellow-500 border-b-4 border-yellow-700 active:translate-y-1 active:border-b-0 shadow-xl"
               >
                 收進背包 🎒
               </button>
             </div>
          </>
        ) : (
          <>
             <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#EF4444] to-[#b91c1c] mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
               WASTED
             </h1>
             
             <div className="w-48 h-48 bg-gray-900 rounded-full border-4 border-gray-700 flex items-center justify-center mb-6 grayscale opacity-50 p-5">
               <img src={uiImages.burgerVillain} alt="漢堡魔王" className="w-full h-full object-contain" />
             </div>

             <div className="bg-[#4c0519] border border-[#be185d] p-4 rounded-xl text-[#F472B6] font-bold mb-8 w-full shadow-inner">
               「連這種程度都解不開嗎？真是太沒有 Sigma 精神了！」
             </div>
             
             <div className="mt-4">
               <button 
                 onClick={() => navigate(-1)} // Go back to level
                 className="px-10 py-4 w-full rounded-2xl font-bold text-lg text-white bg-gray-800 border-b-4 border-gray-950 active:translate-y-1 active:border-b-0 shadow-xl mb-4"
               >
                 🔄 再試一次
               </button>
               <button 
                 onClick={() => navigate('/dashboard')}
                 className="text-gray-500 font-bold underline"
               >
                 先去別的地方看看
               </button>
             </div>
          </>
        )}

      </div>

    </div>
  );
}
