import { createContext, useContext, useEffect, useState } from 'react';

const DarkModeContext = createContext();

/**
 * Dark mode provider component.
 * Manages dark mode state and applies it to the document root.
 */
export const DarkModeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        // Check localStorage, default to false
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        // Apply dark class to root element
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // Save preference to localStorage
        localStorage.setItem('darkMode', JSON.stringify(isDark));
    }, [isDark]);

    const toggleDarkMode = () => {
        setIsDark(prev => !prev);
    };

    return (
        <DarkModeContext.Provider value={{ isDark, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};

/**
 * Hook to use dark mode context
 */
export const useDarkMode = () => {
    const context = useContext(DarkModeContext);
    if (!context) {
        throw new Error('useDarkMode must be used within DarkModeProvider');
    }
    return context;
};
