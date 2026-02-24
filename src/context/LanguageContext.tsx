import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ro';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  enterPasskey: { en: 'Enter Passkey', ro: 'Introduceți Parola' },
  passkeyPlaceholder: { en: '6-digit code', ro: 'Cod din 6 cifre' },
  captcha: { en: 'Security Check', ro: 'Verificare Securitate' },
  submit: { en: 'Authenticate', ro: 'Autentificare' },
  adminLogin: { en: 'Admin Access', ro: 'Acces Admin' },
  username: { en: 'ID', ro: 'ID' },
  password: { en: 'Key', ro: 'Cheie' },
  login: { en: 'Connect', ro: 'Conectare' },
  manifests: { en: 'Repository', ro: 'Depozit' },
  upload: { en: 'Add Link', ro: 'Adaugă Link' },
  dragDrop: { en: 'Enter Name & URL', ro: 'Introduceți Nume & URL' },
  addLink: { en: 'Add to Repository', ro: 'Adaugă în Depozit' },
  delete: { en: 'Delete', ro: 'Șterge' },
  open: { en: 'Open', ro: 'Deschide' },
  namePlaceholder: { en: 'Resource Name (e.g. Game Fix v1)', ro: 'Nume Resursă' },
  urlPlaceholder: { en: 'Download URL (e.g. GitHub)', ro: 'URL Descărcare' },
  logout: { en: 'Disconnect', ro: 'Deconectare' },
  welcome: { en: 'RRepoHub', ro: 'RRepoHub' },
  secureAccess: { en: 'Authorized Personnel Only', ro: 'Doar Personal Autorizat' },
  passkeyHint: { en: 'Universal Access', ro: 'Acces Universal' },
  adminPanel: { en: 'Control Panel', ro: 'Panou de Control' },
  currentPasskey: { en: 'Universal Passkey', ro: 'Parola Universală' },
  copied: { en: 'Copied', ro: 'Copiat' },
  disclaimerTitle: { en: 'LEGAL DISCLAIMER', ro: 'MENȚIUNE LEGALĂ' },
  disclaimerText: { 
    en: 'This archive contains cracked, pirated, and offline shared accounts/games. These activities condone piracy and are illegal. The administrator is not responsible for any legal consequences resulting from the use of this content.', 
    ro: 'Această arhivă conține jocuri sparte, piratate și conturi offline partajate. Aceste activități încurajează pirateria și sunt ilegale. Administratorul nu este responsabil pentru consecințele legale rezultate din utilizarea acestui conținut.' 
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ro' : 'en'));
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
