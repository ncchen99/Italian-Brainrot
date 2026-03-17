import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDropContainer from '../components/DragDropContainer';
import Modal from '../components/Modal';
import { ingredientImages, uiImages } from '../assets';
import { useAppSession } from '../contexts/AppSessionContext';
import { getSynthesisSupportPlan } from '../services/progressService';

const INGREDIENT_META = [
  { id: 'flour', imageSrc: ingredientImages.premiumFlour, label: '陳年特級麵粉', color: '#FBBF24' },
  { id: 'water', imageSrc: ingredientImages.pureSpringWater, label: '純淨山泉水', color: '#38BDF8' },
  { id: 'tomato', imageSrc: ingredientImages.holyTomato, label: '神聖番茄', color: '#EF4444' },
  { id: 'cheese', imageSrc: ingredientImages.richParmesanCheese, label: '濃郁帕瑪森起司', color: '#FBBF24' },
  { id: 'basil', imageSrc: ingredientImages.magicBasilLeaf, label: '魔法羅勒葉', color: '#4ADE80' }
];

const INGREDIENT_NAME_MAP = INGREDIENT_META.reduce((acc, item) => {
  acc[item.id] = item.label;
  return acc;
}, {});

function formatTeamName(candidate, index = 0) {
  if (candidate?.teamName) return candidate.teamName;
  if (candidate?.teamId) return `第 ${candidate.teamId.slice(-4)} 隊`;
  return `第 ${index + 1} 隊`;
}

export default function SynthesisRoom() {
  const navigate = useNavigate();
  const [showEnding, setShowEnding] = useState(false);
  const { teamId, activeChallenge } = useAppSession();
  const [loading, setLoading] = useState(true);
  const [supportPlan, setSupportPlan] = useState({
    myIngredients: [],
    missingIngredients: [],
    complementaryTeams: [],
    rescueTeam: null,
    globalMissingIngredients: []
  });
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let alive = true;
    if (!teamId || !activeChallenge?.id) {
      setSupportPlan({
        myIngredients: [],
        missingIngredients: INGREDIENT_META.map((item) => item.id),
        complementaryTeams: [],
        rescueTeam: null,
        globalMissingIngredients: []
      });
      setLoading(false);
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    getSynthesisSupportPlan({
      teamId,
      sessionId: activeChallenge.id
    }).then((plan) => {
      if (!alive) return;
      setSupportPlan(plan);
      setLoading(false);
    }).catch(() => {
      if (!alive) return;
      setSupportPlan({
        myIngredients: [],
        missingIngredients: INGREDIENT_META.map((item) => item.id),
        complementaryTeams: [],
        rescueTeam: null,
        globalMissingIngredients: []
      });
      setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, [teamId, activeChallenge?.id, refreshToken]);

  const collectedItems = useMemo(
    () => INGREDIENT_META.filter((item) => supportPlan.myIngredients.includes(item.id)),
    [supportPlan.myIngredients]
  );
  const missingNames = supportPlan.missingIngredients.map((id) => INGREDIENT_NAME_MAP[id] || id);
  const globalMissingNames = supportPlan.globalMissingIngredients.map((id) => INGREDIENT_NAME_MAP[id] || id);
  const suggestedAlly = supportPlan.complementaryTeams[0] || null;
  const canSynthesize = supportPlan.missingIngredients.length === 0;

  const handleSynthesis = (slots) => {
    if (!canSynthesize) return;

    const filledCount = slots.filter((s) => s !== null).length;
    if (filledCount === 5) {
      setTimeout(() => setShowEnding(true), 1500);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#0D0F1A] pb-8 relative overflow-hidden">
      
      {/* Mystical Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#7C5CFC]/20 via-[#1A1D2E] to-[#0D0F1A] z-0 pointer-events-none border-t-4 border-[#7C5CFC]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] aspect-square bg-[#7C5CFC]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>

      <div className="relative z-10 w-full pt-12 pb-6 px-4 flex flex-col items-center">
         <h1 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#4ADE80] to-[#38BDF8] drop-shadow-md">
           合成協作站
         </h1>
         <p className="text-gray-400 text-sm text-center mb-4">僅顯示你們小隊實際持有的食材，集齊五種才能合成！</p>
         <button
           type="button"
           className="text-xs rounded-lg bg-[#7C5CFC]/20 border border-[#7C5CFC]/40 px-3 py-1.5 text-[#E9D5FF]"
           onClick={() => setRefreshToken((value) => value + 1)}
         >
           重新檢查合作狀態
         </button>
      </div>

      <div className="flex-1 w-full max-w-sm mx-auto px-4 flex flex-col relative z-10">
        {loading ? (
          <div className="mb-4 rounded-2xl border border-white/10 bg-[#151A30]/80 px-4 py-3 text-sm text-gray-300">
            正在檢查你的小隊食材與可合作隊伍...
          </div>
        ) : null}

        {!loading && !canSynthesize ? (
          <div className="mb-4 rounded-2xl border border-amber-400/40 bg-amber-900/20 px-4 py-3 text-sm text-amber-100">
            目前持有 {collectedItems.length}/5 種食材，缺少：{missingNames.join('、')}
          </div>
        ) : null}

        {!loading && !canSynthesize && suggestedAlly ? (
          <div className="mb-4 rounded-2xl border border-[#4ADE80]/40 bg-[#14532d]/25 px-4 py-3 text-sm text-green-100">
            發現盟友！請找 <span className="font-bold">{formatTeamName(suggestedAlly, 0)}</span> 合作，
            他們可補上：{suggestedAlly.provides.map((id) => INGREDIENT_NAME_MAP[id] || id).join('、')}
          </div>
        ) : null}

        {!loading && !canSynthesize && !suggestedAlly && supportPlan.rescueTeam ? (
          <div className="mb-4 rounded-2xl border border-pink-400/50 bg-pink-900/25 px-4 py-3 text-sm text-pink-100">
            保底救援啟動！快去找 <span className="font-bold">{formatTeamName(supportPlan.rescueTeam, 0)}</span>，
            他們有多餘食材可以協助你們完成披薩加工。
          </div>
        ) : null}

        {!loading && !canSynthesize && globalMissingNames.length > 0 ? (
          <div className="mb-4 rounded-2xl border border-sky-400/50 bg-sky-900/20 px-4 py-3 text-sm text-sky-100">
            全體合作提示：目前看起來全場都缺少 {globalMissingNames.join('、')}，請向關主回報並啟動全體大合作解謎。
          </div>
        ) : null}

        {/* The Pizza Pan Area */}
        <div className="bg-[#1A1D2E]/50 backdrop-blur-md rounded-[3rem] border border-[#7C5CFC]/30 p-6 shadow-[0_0_50px_rgba(124,92,252,0.15)] flex flex-col items-center">
          
          <div className="w-48 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border-8 border-gray-700 shadow-inner flex flex-col items-center justify-center mb-8 relative">
             <img src={uiImages.synthesizer} alt="神聖烤盤" className="w-24 h-24 opacity-30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain" />
             <p className="text-gray-500 font-bold z-10 text-sm">神聖烤盤</p>
          </div>

          <div className="w-full">
            <DragDropContainer 
              items={collectedItems}
              slotsCount={5}
              onComplete={handleSynthesis}
            />
          </div>

        </div>

      </div>

      <Modal 
        isOpen={showEnding} 
        onClose={() => navigate('/victory')}
        title="✨ 合成完成！"
        type="info"
        showCloseButton={false}
      >
        <div className="flex flex-col items-center p-4">
          <div className="w-44 h-44 mb-6 rounded-[2rem] border-2 border-white/20 bg-gradient-to-b from-[#111827] to-[#1F2937] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
            <div className="w-full h-full rounded-[1.3rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_45%),linear-gradient(135deg,#334155,#0F172A)] p-2 overflow-hidden">
              <img src={uiImages.ultimatePizza} alt="終極瑪格麗特披薩" className="w-full h-full object-cover rounded-[1rem]" />
            </div>
          </div>
          <p className="text-xl text-white font-bold mb-2 tracking-widest text-[#FBBF24]">終極瑪格麗特披薩</p>
          <p className="text-sm text-gray-300 mb-8">五種食材已完成加工，下一步可以前往最終挑戰！</p>
          
          <button 
             onClick={() => navigate('/victory')}
             className="w-full px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#4ADE80] to-[#16a34a] border-b-4 border-[#14532d] active:border-b-0 active:translate-y-1 shadow-lg"
          >
             前往下一階段
          </button>
        </div>
      </Modal>

    </div>
  );
}
