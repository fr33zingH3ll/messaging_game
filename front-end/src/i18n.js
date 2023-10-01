// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          password_label_text: 'Enter your password',
          email_label_text: 'Enter your E-mail',
        },
      },
      fr: {
        translation: {
          password_label_text: 'Entrez votre mot de passe',
          email_label_text: 'Entrez votre E-mail',
        },
      },
      // Ajoutez d'autres langues et traductions selon vos besoins
    },
    lng: 'en', // Langue par défaut
    fallbackLng: 'en', // Langue de secours si la traduction n'est pas disponible
    interpolation: {
      escapeValue: false, // Ne pas échapper les valeurs HTML
    },
  });

export default i18n;
