import StaggeredMenu from "../StaggeredMenu";
import AnimatedLogo from "../AnimatedLogo";
import { Bell } from "lucide-react";
import styles from "../../pages/styles/Dashboard.module.css";

export default function DashboardLayout({
  menuItems,
  socialItems = [],
  greeting = "Welcome,",
  displayName,
  children,
}) {
  return (
    <div className={styles.dashboard}>
      <StaggeredMenu
        position="left"
        items={menuItems}
        socialItems={socialItems}
        displaySocials={socialItems.length > 0}
        displayItemNumbering
        menuButtonColor="var(--text)"
        openMenuButtonColor="var(--text)"
        changeMenuColorOnOpen
        colors={["var(--border)", "var(--primary)"]}
        logoUrl={
          <div className={styles.logo}>
            <AnimatedLogo />
          </div>
        }
        accentColor="var(--primary)"
      />
      <div className={styles.bg} />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.topPanel}>
            <h1>
              {greeting} <span>{displayName}</span>
            </h1>
          </div>

          <button className={styles.notificationButton} aria-label="Alerts">
            <Bell size={20} />
            <span className={styles.notificationDot} />
          </button>
        </header>

        {/* 3. Role-Specific Content Injected Here */}
        <section className={styles.contentGrid}>
          {children}
        </section>
      </main>
    </div>
  );
}

