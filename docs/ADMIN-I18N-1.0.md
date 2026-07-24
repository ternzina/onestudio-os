# Admin i18n 1.0

Admin i18n 1.0 gives the protected OneStudio OS administration interface an independent Russian and English language layer.

## Scope

- `RU / EN` switcher on sign-in, first-owner registration, bootstrap and the admin header;
- Russian as the default administration language;
- one typed message catalog in `lib/i18n/admin.ts`;
- a client provider for immediate switching without a page reload;
- a one-year preference cookie plus local-storage fallback;
- route-scoped language boundaries for `/login`, `/register` and `/admin`;
- translated shell, overview, workspace, modules, catalog, media, portfolio and settings screens;
- localized catalog enums, validation messages, confirmations and notices;
- locale-aware price formatting in Catalog Core.

## Separation rule

The administration language is stored in `onestudio_admin_locale`. It does not change `businesses.default_locale`, public-site content, public routes or the languages offered by a client website.

## Adding interface text

1. Use the English source phrase as the key in `lib/i18n/admin.ts`.
2. Add its Russian value to `ruMessages`.
3. Read it through `const { t } = useAdminI18n()` in a client component.
4. Use placeholders such as `{count}` for dynamic values instead of concatenating translated fragments.

Example:

```tsx
const { t } = useAdminI18n();
return <p>{t("Selected: {count}", { count: selectedIds.length })}</p>;
```

## Deliberately not included

- translation tables for customer-authored service, category, project or page content;
- public website locale routing;
- machine translation;
- Ukrainian, Polish or other admin dictionaries;
- database migrations.

Admin i18n is an interface layer only. The workspace default locale remains a separate business setting.
