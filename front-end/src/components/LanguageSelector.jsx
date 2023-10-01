import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSelector() {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
    setSelectedLanguage(newLanguage);
  };

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    // Ajoutez d'autres langues et labels au besoin
  ];

  return (
    <div className="language-selector">
      <label htmlFor="language-select">Select Language:</label>
      <select
        id="language-select"
        value={selectedLanguage}
        onChange={handleLanguageChange}
      >
        {languageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;