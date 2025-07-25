import React, { useEffect, useState } from 'react';

const ChangeTheme = ({ showThemePicker, toggleThemePicker }) => {
  const [currentTheme, setCurrentTheme] = useState('blue'); // default theme
  const colorThemes = {
    orange: {
      '--color-primary': '#ff7a00',
      '--color-primary-light': '#ffb266',
      '--color-primary-dark': '#cc6200',
      '--color-primary-darker': '#994a00',
      '--shadow-primary': '0 4px 10px rgba(255, 122, 0, 0.2)',
      '--shadow-primary-lg': '0 6px 14px rgba(255, 122, 0, 0.3)',
      '--shadow-primary-xl': '0 10px 20px rgba(255, 122, 0, 0.25)',
    },
    blue: {
      '--color-primary': '#007bff',
      '--color-primary-light': '#66b2ff',
      '--color-primary-dark': '#0056b3',
      '--color-primary-darker': '#003d80',
      '--shadow-primary': '0 4px 10px rgba(0, 123, 255, 0.2)',
      '--shadow-primary-lg': '0 6px 14px rgba(0, 123, 255, 0.3)',
      '--shadow-primary-xl': '0 10px 20px rgba(0, 123, 255, 0.25)',
    },
    green: {
      '--color-primary': '#28a745',
      '--color-primary-light': '#6fdc8c',
      '--color-primary-dark': '#1e7e34',
      '--color-primary-darker': '#155d27',
      '--shadow-primary': '0 4px 10px rgba(40, 167, 69, 0.2)',
      '--shadow-primary-lg': '0 6px 14px rgba(40, 167, 69, 0.3)',
      '--shadow-primary-xl': '0 10px 20px rgba(40, 167, 69, 0.25)',
    },
  };

  // Load saved theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && colorThemes[savedTheme]) {
      setCurrentTheme(savedTheme);
      applyThemeStyles(savedTheme);
    } else {
      // Apply default theme if no saved theme exists
      applyThemeStyles('blue');
    }
  }, []);

  const applyThemeStyles = (themeName) => {
    const theme = colorThemes[themeName];
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

  return (
    <div className="theme-picker-container">
      <button className="theme-picker-btn" onClick={toggleThemePicker}>
        Theme
      </button>

      {showThemePicker && (
        <div className="theme-picker-dropdown">
          <h3
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)',
              marginBottom: '0.75rem',
              fontWeight: '600',
            }}
          >
            Pick your theme
          </h3>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
          >
            <button
              className={`theme-option-btn ${
                currentTheme === 'orange' ? 'active' : ''
              }`}
              onClick={() => applyTheme('orange')}
            >
              🟠 Orange Theme {currentTheme === 'orange' && '✓'}
            </button>
            <button
              className={`theme-option-btn ${
                currentTheme === 'green' ? 'active' : ''
              }`}
              onClick={() => applyTheme('green')}
            >
              🟢 Green Theme {currentTheme === 'green' && '✓'}
            </button>
            <button
              className={`theme-option-btn ${
                currentTheme === 'blue' ? 'active' : ''
              }`}
              onClick={() => applyTheme('blue')}
            >
              🔵 Blue Theme {currentTheme === 'blue' && '✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeTheme;
