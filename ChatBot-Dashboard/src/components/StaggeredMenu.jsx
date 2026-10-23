import { useState, useEffect, useRef, useCallback, isValidElement } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import './StaggeredMenu.css';
import BrandLogos from './BrandLogos';
import ThemeToggle from './ThemeToggle';

export const StaggeredMenu = ({
  position = 'right',
  colors = ['#B497CF', '#5227FF'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className = '',
  logoUrl = null,
  menuButtonColor = '#fff',
  openMenuButtonColor = '#fff',
  accentColor = '#5227FF',
  changeMenuColorOnOpen = true,
  isFixed = false,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose
}) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const navigate = useNavigate();

  const handleItemClick = async (e, item) => {
    if (item.isLogout || item.link === '/logout' || item.label?.toLowerCase() === 'logout') {
      e.preventDefault();
      setOpen(false);
      try {
        await api.post('/auth/logout', {}, { withCredentials: true });
      } catch (err) {
        console.warn('Logout endpoint error:', err);
      } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
      return;
    }
    setOpen(false);
  };

  const toggleMenu = useCallback(() => {
    setOpen(prev => {
      const next = !prev;
      if (next && onMenuOpen) onMenuOpen();
      if (!next && onMenuClose) onMenuClose();
      return next;
    });
  }, [onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (open) {
      setOpen(false);
      if (onMenuClose) onMenuClose();
    }
  }, [open, onMenuClose]);

  // Close when clicking outside of the drawer panel and toggle button
  useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleOutsideClick = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [closeOnClickAway, open, closeMenu]);

  // Close on Escape key for accessibility
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeMenu]);

  const renderLogo = () => {
    if (logoUrl === null || logoUrl === undefined) {
      return <BrandLogos />;
    }
    if (isValidElement(logoUrl)) {
      return logoUrl;
    }
    if (typeof logoUrl === 'function') {
      const LogoComponent = logoUrl;
      return <LogoComponent />;
    }
    return (
      <img
        src={logoUrl}
        alt="Logo"
        className="sm-logo-img"
        draggable={false}
        width={110}
        height={32}
      />
    );
  };

  return (
    <div
      className={`staggered-menu-wrapper ${isFixed ? 'fixed-wrapper' : ''} ${className}`}
      data-position={position}
      data-open={open ? '' : undefined}
      style={accentColor ? { '--sm-accent': accentColor } : undefined}
    >
      {/* Background overlay */}
      <div
        className="sm-backdrop"
        onClick={closeMenu}
        aria-hidden="true"
      />

      <header className="staggered-menu-header" aria-label="Main navigation header">
        <div className="sm-logo" aria-label="Logo">
          {renderLogo()}
        </div>

        <div className="sm-header-actions">
          <ThemeToggle />

          <button
            ref={toggleBtnRef}
            className="sm-toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
          >
            <span className="sm-toggle-textWrap" aria-hidden="true">
              {open ? 'Close' : 'Menu'}
            </span>

            <span className="sm-icon" aria-hidden="true">
              <span className="sm-icon-line" />
              <span className="sm-icon-line sm-icon-line-v" />
            </span>
          </button>
        </div>
      </header>

      <aside
        id="staggered-menu-panel"
        ref={panelRef}
        className="staggered-menu-panel"
        aria-hidden={!open}
      >
        <div className="sm-panel-inner">
          <ul
            className="sm-panel-list"
            role="list"
            data-numbering={displayItemNumbering || undefined}
          >
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <li className="sm-panel-itemWrap" key={item.label + index}>
                  <a
                    className="sm-panel-item"
                    href={item.link}
                    aria-label={item.ariaLabel}
                    data-index={index + 1}
                    onClick={(e) => handleItemClick(e, item)}
                  >
                    <span className="sm-panel-itemLabel">{item.label}</span>
                  </a>
                </li>
              ))
            ) : (
              <li className="sm-panel-itemWrap" aria-hidden="true">
                <span className="sm-panel-item">
                  <span className="sm-panel-itemLabel">No items</span>
                </span>
              </li>
            )}
          </ul>

          {displaySocials && socialItems && socialItems.length > 0 && (
            <div className="sm-socials" aria-label="Social links">
              <h3 className="sm-socials-title">Socials</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((social, index) => (
                  <li key={social.label + index} className="sm-socials-item">
                    <a
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm-socials-link"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default StaggeredMenu;
