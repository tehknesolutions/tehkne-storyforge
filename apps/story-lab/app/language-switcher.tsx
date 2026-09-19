"use client";

import { SUPPORTED_LOCALES, useI18n } from "./i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className="language-switcher"
      aria-label={t("language.label")}
      role="group"
    >
      {SUPPORTED_LOCALES.map((item) => (
        <button
          key={item}
          type="button"
          className={locale === item ? "active" : ""}
          aria-pressed={locale === item}
          onClick={() => setLocale(item)}
        >
          {t(`language.${item}` as
            | "language.pt-BR"
            | "language.en"
            | "language.es")}
        </button>
      ))}
    </div>
  );
}
