import fs from "node:fs/promises";

const read = async (path) =>
  fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [
  i18n,
  layout,
  switcher,
  home,
  idea,
  login,
  generate,
  production,
  game,
  reviewPage,
  reviewCard,
  audit,
  generateRoute
] = await Promise.all([
  read("apps/story-lab/app/i18n.tsx"),
  read("apps/story-lab/app/layout.tsx"),
  read("apps/story-lab/app/language-switcher.tsx"),
  read("apps/story-lab/app/page.tsx"),
  read("apps/story-lab/app/idea-intake.tsx"),
  read("apps/story-lab/app/login/page.tsx"),
  read("apps/story-lab/app/generate/page.tsx"),
  read("apps/story-lab/app/production/page.tsx"),
  read("apps/story-lab/app/game/page.tsx"),
  read("apps/story-lab/app/review/page.tsx"),
  read("apps/story-lab/app/review/review-card.tsx"),
  read("apps/story-lab/app/authority-audit/page.tsx"),
  read("apps/story-lab/app/api/generate/reference/route.ts")
]);

const errors = [];
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

expect(
  i18n.includes('DEFAULT_LOCALE: Locale = "pt-BR"'),
  "PT-BR must remain the default locale"
);

expect(
  i18n.includes('SUPPORTED_LOCALES: Locale[] = ["pt-BR", "en", "es"]'),
  "Official locale order must remain pt-BR -> en -> es"
);

expect(
  i18n.includes("dictionaries[DEFAULT_LOCALE][key]"),
  "Missing translations must fall back to PT-BR"
);

expect(
  i18n.includes("localStorage.setItem"),
  "Explicit language choice must persist"
);

expect(
  i18n.includes("document.documentElement.lang"),
  "Document language must follow selected locale"
);

expect(
  layout.includes('<html lang="pt-BR">'),
  "Initial document language must be pt-BR"
);

expect(
  layout.includes("<LanguageSwitcher />"),
  "Global language switcher is missing"
);

for (const [name, source] of [
  ["home", home],
  ["idea", idea],
  ["login", login],
  ["generate", generate],
  ["production", production],
  ["game", game],
  ["review-page", reviewPage],
  ["review-card", reviewCard],
  ["audit", audit]
]) {
  expect(source.includes("useI18n"), `${name} is not connected to i18n`);
}

expect(
  generate.includes('"x-storyforge-locale": locale'),
  "Provider console must send selected locale"
);

expect(
  generateRoute.includes('request.headers.get("x-storyforge-locale")'),
  "Provider route must accept Storyforge locale"
);

expect(
  generateRoute.includes(': "pt-BR"'),
  "Provider route must default unsupported/missing locale to pt-BR"
);

expect(
  generateRoute.includes("Brazilian Portuguese (pt-BR)") &&
    generateRoute.includes("English") &&
    generateRoute.includes("Spanish"),
  "Provider output language mapping is incomplete"
);

expect(
  switcher.includes("SUPPORTED_LOCALES.map"),
  "Language switcher must follow canonical locale order"
);

if (errors.length) {
  console.error("TEHKNE multilingual product policy validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("TEHKNE multilingual product policy validation passed.");
console.log(JSON.stringify({
  officialLanguage: "pt-BR",
  supportedLocales: ["pt-BR", "en", "es"],
  fallback: "pt-BR",
  localizedStoryLabScreens: 9,
  providerLocaleAware: true
}, null, 2));
