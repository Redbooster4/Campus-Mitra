import AnimatedLogo from "./AnimatedLogo";
import logo from "../assets/logo.png";
import styles from "./BrandLogos.module.css";

export default function BrandLogos({ className = "", onLogoClick }){
  const handleMascotClick = (e) => {
    e.stopPropagation();
    if (onLogoClick) {
      onLogoClick(e);
      return;
    }
    window.dispatchEvent(new CustomEvent("toggle-menu"));
  };

  return (
    <div className={`${styles.logos} ${className}`.trim()}>
      <button
        type="button"
        className={styles.mascotBtn}
        onClick={handleMascotClick}
        title="Open navigation menu"
        aria-label="Open navigation menu">
        <AnimatedLogo />
      </button>
      <span className={styles.divider} aria-hidden="true" />
      <a
        href="http://sbmp.ac.in/"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.sbmpLink}
        title="Visit SVKM's SBMP Official Website"
        aria-label="SBMP Official Website"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={logo} alt="SBMP Logo" className={styles.sbmpLogo} />
      </a>
    </div>
  );
}

