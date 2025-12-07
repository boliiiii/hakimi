import React from 'react';
import { HakimiMood } from '../types';

interface HakimiAvatarProps {
  mood: HakimiMood;
  message?: string;
}

const HakimiAvatar: React.FC<HakimiAvatarProps> = ({ mood, message }) => {
  
  // Dynamic styles based on mood
  const getAnimation = () => {
    switch (mood) {
      case HakimiMood.HAPPY: return 'animate-bounce'; 
      case HakimiMood.ANGRY: return 'animate-wiggle'; 
      case HakimiMood.DEVIL: return 'animate-pulse'; 
      case HakimiMood.THINKING: return 'animate-float';
      default: return 'animate-float';
    }
  };

  // Cute filter specifically for Ghibli/Soft vibe
  // Increased saturation and brightness for that "blooming" look
  const cuteFilter = "sepia(20%) saturate(140%) contrast(110%) brightness(110%) hue-rotate(-10deg)";

  // 使用网络上稳定的 Happy Cat (哈基米) 动图资源
  // 如果您想使用本地图片，请将图片放入 public 目录并在此处引用，例如 "/your-image.jpg"
  const hakimiImageSrc = "https://media1.tenor.com/m/t1k5kfXjW-IAAAAC/happy-cat-cat.gif";

  return (
    <div className="flex flex-col items-center justify-center w-full relative z-10 my-2">
      <div className={`relative w-32 h-32 sm:w-40 sm:h-40 transition-all duration-500 ${getAnimation()}`}>
        
        {/* Container for the image with hand-drawn border masking */}
        <div className="w-full h-full overflow-hidden rounded-full border-4 border-ghibli-wood shadow-xl bg-[#FCE8B2] relative">
           {/* Scale and positioning to center the face perfectly from the source GIF */}
           <img 
              src={hakimiImageSrc}
              alt="Hakimi Happy Cat"
              className="w-full h-full object-cover object-center transform scale-110 translate-y-1"
              style={{ filter: cuteFilter }}
           />

           {/* Mood Overlays (Visual cues on top of the image) */}
           {mood === HakimiMood.ANGRY && (
             <div className="absolute inset-0 bg-red-500 mix-blend-overlay opacity-50"></div>
           )}
           {mood === HakimiMood.DEVIL && (
             <div className="absolute inset-0 bg-purple-600 mix-blend-color-burn opacity-60"></div>
           )}
        </div>

        {/* Devil Horns (CSS Shapes) - Only show when angry/devil */}
        {(mood === HakimiMood.DEVIL || mood === HakimiMood.ANGRY) && (
             <>
               <div className="absolute -top-2 left-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[28px] border-b-red-500 transform -rotate-[25deg] filter drop-shadow-md"></div>
               <div className="absolute -top-2 right-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[28px] border-b-red-500 transform rotate-[25deg] filter drop-shadow-md"></div>
             </>
        )}
      </div>
      
      {/* Speech Bubble */}
      {message && (
        <div className="mt-3 bg-white px-4 py-2 rounded-2xl shadow-[2px_2px_0px_0px_rgba(47,79,79,0.15)] border border-ghibli-green max-w-[90%] relative animate-fade-in z-20">
           {/* Little triangle for speech bubble */}
           <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white"></div>
           <div className="absolute -top-[9px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[9px] border-b-ghibli-green -z-10"></div>
           
           <p className="text-ghibli-dark font-cute text-lg text-center leading-tight">{message}</p>
        </div>
      )}
    </div>
  );
};

export default HakimiAvatar;