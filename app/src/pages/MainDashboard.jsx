import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigationBar from '../components/BottomNavigationBar';
import CountdownTimer from '../components/CountdownTimer';
import ItemCard from '../components/ItemCard';
import { ingredientImages, uiImages } from '../assets';
import { getRouteByScanCode } from '../scanCodes';

export default function MainDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('backpack');
  
  // Mock tracking context
  const targetIngredients = [
    { id: 'i1', iconSrc: ingredientImages.flour, title: '陳年特級麵粉', description: '一袋散發著金光的特級麵粉，是披薩的靈魂基礎。', imageSrc: ingredientImages.premiumFlour, activeColor: '#FBBF24', isCollected: true, collectedOrder: 1 },
    { id: 'i2', iconSrc: ingredientImages.tomato, title: '神聖番茄', description: '傳說中能讓醬汁香氣瞬間滿溢的稀有番茄。', imageSrc: ingredientImages.holyTomato, activeColor: '#F97316', isCollected: false, collectedOrder: null },
    { id: 'i3', iconSrc: ingredientImages.water, title: '純淨山泉水', description: '提拉米蘇大師加持過的涼爽泉水。', imageSrc: ingredientImages.pureSpringWater, activeColor: '#38BDF8', isCollected: true, collectedOrder: 2 },
    { id: 'i4', iconSrc: ingredientImages.cheese, title: '濃郁帕瑪森起司', description: '風味扎實、鹹香濃郁，是披薩的靈魂重擊。', imageSrc: ingredientImages.richParmesanCheese, activeColor: '#F59E0B', isCollected: false, collectedOrder: null },
    { id: 'i5', iconSrc: ingredientImages.basil, title: '魔法羅勒葉', description: '最後那一抹清香，讓終極披薩完成進化。', imageSrc: ingredientImages.magicBasilLeaf, activeColor: '#4ADE80', isCollected: false, collectedOrder: null }
  ];
  
  // Demo mock data
  const collectedItemIds = targetIngredients.filter((item) => item.isCollected).map((item) => item.id);
  const sortedIngredients = [...targetIngredients]
    .map((item, index) => ({ ...item, originalIndex: index }))
    .sort((a, b) => {
      const aCollected = a.isCollected && Number.isFinite(a.collectedOrder);
      const bCollected = b.isCollected && Number.isFinite(b.collectedOrder);

      if (aCollected && bCollected) return a.collectedOrder - b.collectedOrder;
      if (aCollected && !bCollected) return -1;
      if (!aCollected && bCollected) return 1;
      return a.originalIndex - b.originalIndex;
    });
  const collectedIngredients = sortedIngredients.filter((item) => item.isCollected);
  const teamName = "閃電特攻隊";

  const handleScanClick = () => {
    // In real app, scanner should pass QR payload into getRouteByScanCode
    const scanInput = prompt("Simulate Scan (Enter QR code or 1-8):", "1");
    const targetRoute = getRouteByScanCode(scanInput);

    if (targetRoute) {
      navigate(targetRoute);
    } else {
      alert('無效 QR Code，請重新掃描正確關卡。');
    }
  };

  return (
    <div className="relative w-full min-h-screen pb-28 pt-6 px-4 flex flex-col items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={uiImages.levelBackground} alt="" className="w-full h-full object-cover opacity-35" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0F1A]/90 via-[#131A34]/85 to-[#1B1140]/95"></div>
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#7C5CFC]/20 blur-3xl"></div>

      {/* Top Header */}
      <div className="relative z-10 w-full max-w-sm flex justify-between items-center bg-[#151A30]/90 p-4 rounded-3xl border border-white/10 shadow-lg mb-6 isolate">
        <div>
          <div className="text-xs text-gray-400 font-bold mb-1">目前小隊</div>
          <div className="text-[#FBBF24] font-bold text-lg">{teamName}</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-xs text-gray-400 font-bold mb-1">剩餘時間</div>
          <CountdownTimer initialSeconds={60 * 60} isRunning={true} />
        </div>
      </div>

      {activeTab === 'backpack' ? (
        <div className="relative z-10 w-full max-w-sm w-full animate-in fade-in duration-300">
          
          {/* Progress Icons */}
          <div className="bg-[#151A30]/90 p-4 rounded-3xl border border-white/10 shadow-lg mb-6">
            <div className="flex justify-between items-center px-1">
              {targetIngredients.map((item) => {
                const isCollected = collectedItemIds.includes(item.id);
                return (
                  <div key={item.id} className="relative">
                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCollected ? 'bg-[#1A1D2E]' : 'bg-gray-800 opacity-70 border border-gray-600'}`}>
                      {isCollected && (
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                          <rect x="2" y="2" width="44" height="44" rx="16" stroke={item.activeColor} strokeWidth="2.5" />
                          <rect x="5" y="5" width="38" height="38" rx="13" stroke={item.activeColor} strokeOpacity="0.5" strokeWidth="1.5" />
                        </svg>
                      )}
                      <span
                        className="w-7 h-7"
                        style={{
                          backgroundColor: isCollected ? item.activeColor : '#6B7280',
                          WebkitMaskImage: `url(${item.iconSrc})`,
                          maskImage: `url(${item.iconSrc})`,
                          WebkitMaskRepeat: 'no-repeat',
                          maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center',
                          maskPosition: 'center',
                          WebkitMaskSize: 'contain',
                          maskSize: 'contain',
                          filter: isCollected ? `drop-shadow(0 0 7px ${item.activeColor}99)` : 'none'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collected Items Grid */}
          <div className="grid grid-cols-2 gap-4 pb-24">
            {collectedIngredients.map((item) => (
              <ItemCard
                key={item.id}
                title={item.title}
                description={item.description}
                isCollected={item.isCollected}
                imageSrc={item.imageSrc}
                glowColor={item.activeColor}
              />
            ))}
            {collectedIngredients.length === 0 && (
              <div className="col-span-2 rounded-2xl border border-dashed border-gray-600 bg-[#151A30]/70 px-4 py-8 text-center text-gray-400 text-sm">
                目前還沒有已收集材料，請先前往關卡取得食材。
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Tasks Tab View */
        <div className="relative z-10 w-full max-w-sm w-full animate-in fade-in duration-300">
          <h2 className="text-2xl font-bold text-[#FBBF24] mb-4 drop-shadow-md">待辦任務清單</h2>
          
          <div className="space-y-3">
             <div className="bg-[#151A30]/90 p-4 rounded-2xl border-l-4 border-[#7C5CFC] shadow-md flex justify-between items-center opacity-70">
                <span className="line-through text-gray-400">幫帕塔平趕走小青蛙</span>
                <span className="bg-[#7C5CFC]/20 text-[#7C5CFC] text-xs px-2 py-1 rounded-full border border-[#7C5CFC]/50">已完成</span>
             </div>
             <div className="bg-[#151A30]/90 p-4 rounded-2xl border-l-4 border-[#FBBF24] shadow-md flex justify-between items-center">
                <span className="text-white font-bold">尋找卡布奇諾忍者的武士刀</span>
                <span className="bg-[#FBBF24]/20 text-[#FBBF24] text-xs px-2 py-1 rounded-full border border-[#FBBF24]/50 animate-pulse">進行中</span>
             </div>
             <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700 flex justify-between items-center text-gray-500">
                <span>尋找起司的線索</span>
                <span className="text-xs px-2 py-1 rounded-full border border-gray-600">未解鎖</span>
             </div>
          </div>
        </div>
      )}

      {/* Shared Navigation Component */}
      <BottomNavigationBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onScanClick={handleScanClick}
      />
    </div>
  );
}
