import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "./i18n";
import { LanguageSwitcher } from "./language-switcher";

export const metadata: Metadata = {
  title: "TEHKNÉ STORYFORGE — Story Lab",
  description: "Forje uma ideia em um universo."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <I18nProvider>
          <LanguageSwitcher />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
