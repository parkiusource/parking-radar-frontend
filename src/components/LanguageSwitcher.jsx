import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { LuGlobe } from 'react-icons/lu';

// Constante con los idiomas disponibles para facilitar la matenibilidad
const AVAILABLE_LANGUAGES = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' }
];

const LanguageSwitcher = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'es');

  // Actualiza el estado cuando el idioma cambie externamente
  useEffect(() => {
    setCurrentLanguage(i18n.language || 'es');

    // Escuchar cambios de idioma
    const handleLanguageChanged = (lang) => {
      setCurrentLanguage(lang);
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const changeLanguage = (lng) => {
    if (lng !== currentLanguage) {
      console.log('Cambiando idioma a:', lng); // Para debug
      i18n.changeLanguage(lng);
      localStorage.setItem('preferredLanguage', lng);
    }
  };

  return (
    <div className={`flex items-center ${className}`} role="region" aria-label="Selector de idioma">
      <div className="mr-2 text-current opacity-70">
        <LuGlobe className="h-4 w-4" />
      </div>
      <div className="flex rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 p-0.5 bg-white/10 backdrop-blur-sm shadow-sm">
        {AVAILABLE_LANGUAGES.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => changeLanguage(code)}
            className={`
              px-2 py-0.5 text-xs font-medium transition-all duration-200
              ${currentLanguage === code
                ? 'bg-primary text-white rounded-full shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 rounded-full'
              }
            `}
            aria-pressed={currentLanguage === code}
            title={code === 'es' ? 'Cambiar a Español' : 'Switch to English'}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

LanguageSwitcher.propTypes = {
  className: PropTypes.string
};

export default LanguageSwitcher;
