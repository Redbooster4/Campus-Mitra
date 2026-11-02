import { useRef, useState } from "react";
import "./SpotlightCard.css";

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(234, 88, 12, 0.18)",
  borderColor = "rgba(234, 88, 12, 0.4)",
  onClick,
  style,
  ...props
}) {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`spotlight-card ${className}`.trim()}
      style={{
        "--spotlight-x": `${position.x}px`,
        "--spotlight-y": `${position.y}px`,
        "--spotlight-color": spotlightColor,
        "--spotlight-border-color": borderColor,
        "--spotlight-opacity": opacity,
        ...style,
      }}
      {...props}
    >
      <div className="spotlight-card-border" aria-hidden="true" />
      <div className="spotlight-card-glow" aria-hidden="true" />
      <div className="spotlight-card-content">{children}</div>
    </div>
  );
}
