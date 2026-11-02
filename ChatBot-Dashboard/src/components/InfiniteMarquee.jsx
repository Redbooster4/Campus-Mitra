import "./InfiniteMarquee.css";

export default function InfiniteMarquee({
  items = [],
  speed = 35,
  direction = "left",
  pauseOnHover = true,
  className = "",
}) {
  return (
    <div
      className={`marquee-container ${pauseOnHover ? "marquee-pause-hover" : ""} ${className}`.trim()}
      style={{
        "--marquee-duration": `${speed}s`,
        "--marquee-direction": direction === "right" ? "reverse" : "normal",
      }}
    >
      <div className="marquee-content">
        {items.map((item, idx) => (
          <div key={`m1-${idx}`} className="marquee-item">
            {typeof item === "string" ? (
              <span className="marquee-tag">{item}</span>
            ) : (
              item
            )}
          </div>
        ))}
      </div>
      <div className="marquee-content" aria-hidden="true">
        {items.map((item, idx) => (
          <div key={`m2-${idx}`} className="marquee-item">
            {typeof item === "string" ? (
              <span className="marquee-tag">{item}</span>
            ) : (
              item
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
