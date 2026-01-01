import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext/useTheme';
import './PersonalizeMenu.css';

const PersonalizeMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="personalize-menu" ref={menuRef}>
            <button
                className="personalize-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Personalize settings"
                aria-expanded={isOpen}
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="personalize-icon"
                >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span className="personalize-label">Settings</span>
            </button>

            {isOpen && (
                <div className="personalize-dropdown">
                    <div className="personalize-header">
                        <h3>Personalize</h3>
                    </div>

                    <div className="personalize-content">
                        <div className="theme-toggle-container">
                            <div className="theme-toggle-label">
                                <span className="theme-icon">{theme === 'light' ? '☀️' : '🌙'}</span>
                                <span className="theme-text">
                                    {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                                </span>
                            </div>

                            <button
                                className={`theme-toggle ${theme === 'dark' ? 'active' : ''}`}
                                onClick={toggleTheme}
                                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            >
                                <span className="theme-toggle-slider"></span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalizeMenu;
