import { useEffect, useState } from 'react';
import useClickOutside from '../../customHooks/useClickOutside';
import Button from '../Button/Button';

const ChangeTheme = ({ showThemePicker, toggleThemePicker }) => {
  const dropdownRef = useClickOutside(() => {
    if (showThemePicker) toggleThemePicker(); // only toggle if open
  });
  const [currentTheme, setCurrentTheme] = useState('azure'); // default to azure (blue)

  const brandPalettes = {
    amber: {
      '--color-primary': '#f59e0b',
      '--color-primary-light': '#fbbf24',
      '--color-primary-dark': '#d97706',
      '--color-primary-darker': '#92400e',
      '--shadow-primary': '0 4px 12px rgba(245, 158, 11, 0.15)',
      '--shadow-primary-lg': '0 8px 20px rgba(245, 158, 11, 0.2)',
      '--shadow-primary-xl': '0 12px 32px rgba(245, 158, 11, 0.18)',
    },
    azure: {
      '--color-primary': '#3b82f6',
      '--color-primary-light': '#60a5fa',
      '--color-primary-dark': '#1d4ed8',
      '--color-primary-darker': '#1e3a8a',
      '--shadow-primary': '0 4px 12px rgba(59, 130, 246, 0.15)',
      '--shadow-primary-lg': '0 8px 20px rgba(59, 130, 246, 0.2)',
      '--shadow-primary-xl': '0 12px 32px rgba(59, 130, 246, 0.18)',
    },
    emerald: {
      '--color-primary': '#10b981',
      '--color-primary-light': '#34d399',
      '--color-primary-dark': '#047857',
      '--color-primary-darker': '#064e3b',
      '--shadow-primary': '0 4px 12px rgba(16, 185, 129, 0.15)',
      '--shadow-primary-lg': '0 8px 20px rgba(16, 185, 129, 0.2)',
      '--shadow-primary-xl': '0 12px 32px rgba(16, 185, 129, 0.18)',
    },
    violet: {
      '--color-primary': '#7c3aed',
      '--color-primary-light': '#a78bfa',
      '--color-primary-dark': '#5b21b6',
      '--color-primary-darker': '#4c1d95',
      '--shadow-primary': '0 4px 12px rgba(124, 58, 237, 0.15)',
      '--shadow-primary-lg': '0 8px 20px rgba(124, 58, 237, 0.2)',
      '--shadow-primary-xl': '0 12px 32px rgba(124, 58, 237, 0.18)',
    },
    crimson: {
      '--color-primary': '#ef4444',
      '--color-primary-light': '#f87171',
      '--color-primary-dark': '#dc2626',
      '--color-primary-darker': '#991b1b',
      '--shadow-primary': '0 4px 12px rgba(239, 68, 68, 0.15)',
      '--shadow-primary-lg': '0 8px 20px rgba(239, 68, 68, 0.2)',
      '--shadow-primary-xl': '0 12px 32px rgba(239, 68, 68, 0.18)',
    },
    rose: {
      '--color-primary': '#f43f5e',
      '--color-primary-light': '#fb7185',
      '--color-primary-dark': '#e11d48',
      '--color-primary-darker': '#be123c',
      '--shadow-primary': '0 4px 12px rgba(244, 63, 94, 0.15)',
      '--shadow-primary-lg': '0 8px 20px rgba(244, 63, 94, 0.2)',
      '--shadow-primary-xl': '0 12px 32px rgba(244, 63, 94, 0.18)',
    },
    teal: {
      '--color-primary': '#14b8a6',
      '--color-primary-light': '#5eead4',
      '--color-primary-dark': '#0f766e',
      '--color-primary-darker': '#134e4a',
      '--shadow-primary': '0 4px 12px rgba(20, 184, 166, 0.15)',
      '--shadow-primary-lg': '0 8px 20px rgba(20, 184, 166, 0.2)',
      '--shadow-primary-xl': '0 12px 32px rgba(20, 184, 166, 0.18)',
    },
    slate: {
      '--color-primary': '#64748b',
      '--color-primary-light': '#94a3b8',
      '--color-primary-dark': '#475569',
      '--color-primary-darker': '#334155',
      '--shadow-primary': '0 4px 12px rgba(100, 116, 139, 0.15)',
      '--shadow-primary-lg': '0 8px 20px rgba(100, 116, 139, 0.2)',
      '--shadow-primary-xl': '0 12px 32px rgba(100, 116, 139, 0.18)',
    },
  };

  // Theme display information
  const themeInfo = {
    amber: { name: 'Amber', description: 'Warm & Energetic' },
    azure: { name: 'Azure', description: 'Professional & Trust' },
    emerald: { name: 'Emerald', description: 'Fresh & Growth' },
    violet: { name: 'Violet', description: 'Creative & Premium' },
    crimson: { name: 'Crimson', description: 'Bold & Dynamic' },
    rose: { name: 'Rose', description: 'Modern & Elegant' },
    teal: { name: 'Teal', description: 'Sophisticated & Unique' },
    slate: { name: 'Slate', description: 'Neutral & Professional' },
  };

  // Load saved theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && brandPalettes[savedTheme]) {
      setCurrentTheme(savedTheme);
      applyThemeStyles(savedTheme);
    } else {
      // Apply default theme if no saved theme exists
      applyThemeStyles('azure');
    }
  }, []);

  const applyThemeStyles = (themeName) => {
    const theme = brandPalettes[themeName];
    if (!theme) return;

    Object.entries(theme).forEach(([variable, value]) => {
      document.documentElement.style.setProperty(variable, value);
    });
  };

  const applyTheme = (themeName) => {
    // Save to localStorage
    localStorage.setItem('selectedTheme', themeName);

    // Update current theme state
    setCurrentTheme(themeName);

    // Apply the theme styles
    applyThemeStyles(themeName);

    // Close the dropdown after selecting a theme
    toggleThemePicker();
  };

  // Get color preview for theme button
  const getThemePreview = (themeName) => {
    return brandPalettes[themeName]['--color-primary'];
  };

  // Color orb component using CSS
  const ColorOrb = ({ color, size = '12px', isActive = false }) => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-full)',
        background: `radial-gradient(circle at 30% 30%, ${color}cc, ${color})`,
        border: isActive
          ? `2px solid ${color}44`
          : '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: isActive
          ? `0 0 8px ${color}33, inset 0 1px 2px rgba(255, 255, 255, 0.2)`
          : `inset 0 1px 2px rgba(255, 255, 255, 0.15)`,
        flexShrink: 0,
        transition: 'var(--transition-all)',
      }}
    />
  );

  return (
    <div className="theme-picker-container">
      <Button
        onClick={toggleThemePicker}
        size="md"
        text={'Theme'}
        variant="outline"
        startIcon={
          <ColorOrb
            color={getThemePreview(currentTheme)}
            size="14px"
            isActive={true}
          />
        }
      />

      {showThemePicker && (
        <div className="theme-picker-dropdown" ref={dropdownRef}>
          {/* Header */}
          <div className="theme-picker-header">
            <h3 className="theme-picker-title">Choose Your Brand</h3>
            <div className="theme-picker-description">
              {themeInfo[currentTheme]?.description}
            </div>
          </div>

          {/* Theme Grid */}
          <div className="theme-picker-grid">
            {Object.entries(themeInfo).map(([themeKey, info]) => (
              <button
                key={themeKey}
                className={`theme-option-btn ${
                  currentTheme === themeKey ? 'active' : ''
                }`}
                onClick={() => applyTheme(themeKey)}
              >
                <ColorOrb
                  color={getThemePreview(themeKey)}
                  size="16px"
                  isActive={currentTheme === themeKey}
                />

                <div className="theme-option-content">
                  <span className="theme-option-name">{info.name}</span>
                  <span className="theme-option-description">
                    {info.description}
                  </span>
                </div>

                {currentTheme === themeKey && (
                  <div className="theme-option-check">✓</div>
                )}

                {/* Active theme gradient overlay */}
                {currentTheme === themeKey && (
                  <div
                    className="theme-option-overlay"
                    style={{
                      background: `linear-gradient(90deg, ${getThemePreview(
                        themeKey
                      )}08, transparent)`,
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="theme-picker-footer">
            Theme applies across your entire experience
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeTheme;
