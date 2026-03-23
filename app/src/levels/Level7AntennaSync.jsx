import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NumericKeypad from '../components/NumericKeypad';
import Modal from '../components/Modal';
import { uiImages } from '../assets';
import useLevelCooldown, { formatCooldownTime } from '../hooks/useLevelCooldown';
import { useAppSession } from '../contexts/AppSessionContext';
import { saveLevelProgress, getSessionProgress, getValidPartnerPasscodes } from '../services/progressService';

export default function Level7AntennaSync() {
  const navigate = useNavigate();
  const [syncCode, setSyncCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { isCoolingDown, remainingMs, triggerCooldown } = useLevelCooldown('level7');
  const { teamId, activeChallenge, loading: sessionLoading } = useAppSession();
  
  const [level7State, setLevel7State] = useState({ loading: true, antennaColor: null, passCode: null, missingFragment: false });

  React.useEffect(() => {
    if (sessionLoading) return;
    if (!teamId || !activeChallenge?.id) {
      setLevel7State({ loading: false, missingFragment: true });
      return;
    }
    
    getSessionProgress({ teamId, sessionId: activeChallenge.id }).then(progressMap => {
      const l6 = progressMap['level6'];
      if (l6?.status === 'completed' && l6?.antennaColor) {
        setLevel7State({
          loading: false,
          antennaColor: l6.antennaColor,
          passCode: l6.passCode,
          missingFragment: false
        });
      } else {
        setLevel7State({ loading: false, missingFragment: true });
      }
    }).catch(() => {
      setLevel7State({ loading: false, missingFragment: true });
    });
  }, [teamId, activeChallenge?.id, sessionLoading]);

  const handleKeyPress = (key) => {
    if (syncCode.length < 6) {
      setSyncCode(prev => prev + key);
    }
  };

  const handleDelete = () => {
    setSyncCode(prev => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (isCoolingDown || submitting || level7State.loading || level7State.missingFragment) return;
    setSubmitting(true);

    const partnerColor = level7State.antennaColor === 'red' ? 'blue' : 'red';
    
    // Check if prefix is own password
    if (syncCode.startsWith(level7State.passCode)) {
      const partnerCode = syncCode.slice(3, 6);
      const validCodes = await getValidPartnerPasscodes({ teamId, partnerColor });
      
      if (validCodes.includes(partnerCode)) {
        if (teamId && activeChallenge?.id) {
          saveLevelProgress({
            teamId,
            sessionId: activeChallenge.id,
            levelId: 'level7',
            status: 'completed'
          }).catch(() => {});
        }
        setShowSuccess(true);
        setSubmitting(false);
        return;
      }
    }

    if (teamId && activeChallenge?.id) {
      saveLevelProgress({
        teamId,
        sessionId: activeChallenge.id,
        levelId: 'level7',
        status: 'failed'
      }).catch(() => {});
    }
    triggerCooldown();
    setShowError(true);
    setSyncCode('');
    setSubmitting(false);
  };

  const formatDisplay = () => {
    const padded = syncCode.padEnd(6, '_');
    return `${padded.slice(0,3)} - ${padded.slice(3,6)}`;
  };

  const currentLevelColor = "#EF4444";
  const myColorHex = level7State.antennaColor === 'red' ? '#EF4444' : '#3B82F6';
  const myColorName = level7State.antennaColor === 'red' ? '紅色' : '藍色';
  const partnerColorName = level7State.antennaColor === 'red' ? '藍色' : '紅色';
  const myCodePart = level7State.passCode || '---';

  if (level7State.loading) return <div className="text-white flex-1 flex items-center justify-center">Loading...</div>;

  return (
    <div className="w-full flex-1 flex flex-col justify-center animate-in slide-in-from-bottom duration-500">
      
      {level7State.missingFragment && (
        <Modal 
          isOpen={true} 
          onClose={() => navigate('/dashboard')}
          title="尚未獲得天線"
          type="warning"
          showCloseButton={true}
        >
          <p className="text-white">現在還沒有天線的碎片！必須先完成前面的關卡找到碎片才能通訊。</p>
        </Modal>
      )}

      <div className="bg-[#1A1D2E]/80 backdrop-blur-md p-6 rounded-[2rem] border-2 shadow-2xl mb-8" style={{ borderColor: `${currentLevelColor}50`, opacity: level7State.missingFragment ? 0.3 : 1 }}>
        
        <h2 className="text-[#FBBF24] font-bold text-xl text-center mb-4">潮鞋防衛戰（雙人合作）</h2>
        
        <div className="flex flex-col items-center mb-6">
           <div className="text-sm text-gray-400 mb-1">你的天線裝置</div>
           <div 
             className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-4 animate-pulse mb-2 shadow-[0_0_15px_currentColor]"
             style={{ borderColor: myColorHex, color: myColorHex }}
           >
             <img src={level7State.antennaColor === 'red' ? uiImages.wifiRed : uiImages.wifiBlue} alt="Antenna" className="w-9 h-9 object-contain" />
           </div>
           <div className="font-bold text-lg" style={{ color: myColorHex }}>
             {myColorName}訊號
           </div>
        </div>

        <div className="bg-[#0D0F1A] border-l-4 p-4 rounded-r-xl mb-6 shadow-md text-sm text-gray-200" style={{ borderColor: myColorHex }}>
          <p className="mb-2">1. 請尋找擁有<span className="font-bold">{partnerColorName}天線</span>的友隊</p>
          <p className="mb-2">2. 你的密碼片段是：<span className="text-2xl font-mono block text-center my-2 font-bold tracking-widest">{myCodePart} _ _ _</span></p>
          <p>3. 交換情報，組成完整的 6 碼！</p>
        </div>
        
        {/* Passcode Display */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-900 border-2 border-gray-600 rounded-xl px-4 py-3 text-3xl font-mono text-white tracking-widest shadow-inner text-center w-full max-w-[280px]">
            {formatDisplay()}
          </div>
        </div>

        <NumericKeypad 
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          currentValue={syncCode}
          maxLength={6}
        />
      </div>

      <Modal 
        isOpen={showSuccess && !isCoolingDown} 
        onClose={() => navigate('/synthesis')}
        title="防護罩破解成功"
        type="success"
      >
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 mb-4 rounded-2xl bg-[#0B1224] border border-white/20 p-2 shadow-[0_0_20px_rgba(124,92,252,0.45)]">
            <img src={uiImages.wifiFragments} alt="Wi-Fi 權限" className="w-full h-full object-cover rounded-xl" />
          </div>
          <p className="text-white font-bold mb-2">啦啦鯊成功揍扁了魔王！</p>
          <div className="bg-[#166534] text-green-100 p-3 rounded-xl border border-green-500 text-sm w-full font-bold">
            獲得完整 Wi-Fi 權限！<br/>快前往「合成協作站」完成材料加工！
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={showError} 
        onClose={() => { setShowError(false); navigate('/dashboard'); }}
        title="通訊失敗，進入冷卻"
        type="error"
        showCloseButton={true}
      >
        <p className="text-white">防護罩依然堅固！請跟友隊確認密碼順序是否正確。</p>
        <p className="text-sm text-pink-200 mt-2">冷卻時間：{formatCooldownTime(remainingMs)}</p>
      </Modal>

      <Modal
        isOpen={isCoolingDown && !showError}
        onClose={() => navigate('/dashboard')}
        title="關卡冷卻中"
        type="warning"
        showCloseButton={true}
      >
        <p className="text-white">這關暫時鎖定，先找其他隊伍交換情報吧。</p>
        <p className="text-[#FBBF24] font-bold mt-2">剩餘時間：{formatCooldownTime(remainingMs)}</p>
      </Modal>

    </div>
  );
}
