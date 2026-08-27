import { useRef } from 'react';
import logoAnimation from '../assets/chatbot.mp4'; 

export default function AnimatedLogo({ className="w-32 h-32 mx-auto" }) {
  const videoRef=useRef(null);
  const handleMouseEnter=()=>{
    if(videoRef.current){
      videoRef.current.currentTime = 0; 
      videoRef.current.play().catch(()=>{});
    }
  };

  return(
    <div 
      className={`animated-logo ${className}`}
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