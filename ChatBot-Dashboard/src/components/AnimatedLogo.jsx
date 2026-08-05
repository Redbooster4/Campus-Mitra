import { useRef } from 'react';
import logoAnimation from '../assets/chatbot.mp4'; 

export default function AnimatedLogo({ className="w-32 h-32 mx-auto" }) {
  const videoRef=useRef(null);
  const handleMouseEnter=()=>{
    if(videoRef.current){
      videoRef.current.currentTime = 0; 
      videoRef.current.play();
    }
  };

  return(
    <div 
      className={`flex items-center justify-center rounded-full overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}>
      <video
        ref={videoRef}
        src={logoAnimation}
        className="w-full h-full object-cover cursor-default"
        muted
        playsInline
        disablePictureInPicture
      />
    </div>
  );
}