import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';

export default function DialogPanel({ 
  characterName, 
  avatarSrc, 
  dialogText, 
  audioSrc, 
  typingSpeed = 50,
  showAvatar = true,
  onComplete 
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Typewriter effect
  useEffect(() => {
    if (!dialogText) return;
    
    setDisplayedText('');
    setIsTyping(true);
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < dialogText.length) {
        setDisplayedText(prev => prev + dialogText.charAt(currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [dialogText, typingSpeed]);

  // Handle audio play automatically on mount if src provided
  useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
      setIsPlaying(true);
    }
  }, [audioSrc]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const replayDialog = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
    // Re-trigger typewriter
    setDisplayedText('');
    setIsTyping(true);
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < dialogText.length) {
        setDisplayedText(prev => prev + dialogText.charAt(currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, typingSpeed);
    
    // Store interval to clear on unmount could be better, but simpler for now:
    // This is just a basic implementation.
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 animate-in slide-in-from-bottom duration-500">
      <div className={`relative bg-[#151A30]/90 rounded-3xl p-5 border-4 border-[#7C5CFC] shadow-[0_10px_0_#4338CA] ${showAvatar ? 'pt-8 mt-12' : 'pt-4 mt-4'}`}>
        {/* Character Avatar */}
        {showAvatar ? (
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-[#7C5CFC] bg-[#0D0F1A] overflow-hidden shadow-lg shadow-purple-900/50 flex items-center justify-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt={characterName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-gray-500">?</span>
              )}
            </div>
            {/* Character Name Tag */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-[#FBBF24] text-[#0D0F1A] px-4 py-1 rounded-full text-sm font-bold shadow-md whitespace-nowrap">
              {characterName}
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center bg-[#FBBF24] text-[#1B1140] px-4 py-1.5 rounded-full text-sm font-bold shadow-md mb-3">
            {characterName}
          </div>
        )}

        {/* Audio Controls */}
        <div className="absolute top-3 right-3 flex gap-2">
          {audioSrc && (
            <>
              <audio 
                ref={audioRef} 
                src={audioSrc} 
                onEnded={() => setIsPlaying(false)} 
                className="hidden"
              />
              <button
                onClick={toggleAudio}
                className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Toggle audio"
              >
                {isPlaying ? <Volume2 size={16} className="text-[#FBBF24]" /> : <VolumeX size={16} className="text-gray-400" />}
              </button>
              <button 
                onClick={replayDialog}
                className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Replay"
              >
                <RotateCcw size={16} className="text-[#7C5CFC]" />
              </button>
            </>
          )}
        </div>

        {/* Dialog Text */}
        <div className="mt-4 min-h-[80px]">
          <p className="text-lg leading-relaxed text-white">
            {displayedText}
            {isTyping && <span className="inline-block w-2 h-5 ml-1 bg-[#FBBF24] animate-pulse align-middle"></span>}
          </p>
        </div>
      </div>
    </div>
  );
}
