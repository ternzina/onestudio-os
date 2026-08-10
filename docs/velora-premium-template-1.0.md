# VELORA HOUSE — Premium Template Package 1.0

`velora-event-venue` — третий универсальный premium package OneStudio OS для площадки свадеб, частных событий и корпоративных мероприятий.

## Регистрация и границы

Единственная ручная регистрация находится в `lib/public-site/premium-template-package-source.mjs`. Она содержит сериализуемый manifest и bindings; `npm run generate:premium-templates` создаёт catalog, seed, contract, editor, public-home и custom-page registries. Центральные capability maps вручную не изменяются. Каталог `/demos` зависит только от manifest и не импортирует seed, editor или runtime implementations.

Public home и custom pages загружаются через `next/dynamic`. Editor schema не попадает в public runtime, а seed не попадает в `/demos` catalog graph. BEMBI остаётся отдельным protected template.

## Реализация

- `velora-premium-template-seed.ts` и `velora-premium-template-content.ts`: namespaced seed, defensive normalization, две custom pages и editor-state-safe replacement.
- `velora-premium-template-contract.ts`: 13 native sections с pinned hero/footer.
- `velora-editor-schema.ts` и `velora-premium-template-editor-adapter.ts`: редактирование текстов, ссылок, media URL, залов, форматов, пакетов, gallery, menu, planner, facts, reviews, FAQ и контактов; visibility, reorder, reset, restore и custom blocks.
- `velora-premium-template-runtime-adapter.ts` и `velora-premium-template-custom-page-runtime-adapter.ts`: lazy public capabilities.
- `components/public/velora/*`: собственные home/custom-page renderers, responsive CSS, клавиатурный gallery viewer и форма заявки.
- `app/demos/velora-event-venue/[[...templatePath]]/page.tsx`: canonical demo home, `/p/venues` и `/p/packages`.

## Контент и взаимодействия

Home включает hero, проверку даты, три зала, пять форматов, три пакета, editorial gallery, catering, event planner, цифры, отзывы, FAQ, контакты и footer. Заявка использует существующий безопасный RPC `create_public_request`; она не меняет booking database и явно сообщает, что дата подтверждается координатором.

Custom pages `/venues` и `/packages` используют общую premium custom-page runtime и собственный VELORA renderer. Demo публикует их как `/demos/velora-event-venue/venues` и `/demos/velora-event-venue/packages` (совместим также системный `/p/...`); для tenant-сайтов сохраняется существующий системный URL `/p/venues` и `/p/packages`.

## SEO и assets

Seed задаёт title, description, keywords, OG image и robots через существующий public metadata runtime; custom pages имеют отдельные SEO title/description/image. Demo metadata задаёт canonical, locale `ru_UA`, Open Graph и Twitter card.

Все изображения — локальные оптимизированные SVG-композиции в `public/templates/velora/`. Они являются понятными media slots и заменяются через Site Editor. Внешние URL и assets GLOSS/NOIR/BEMBI не используются.

## Accessibility и performance

Использованы semantic landmarks, последовательная иерархия заголовков, видимый `:focus-visible`, alt-тексты, нативные form controls и `details`. Lightbox поддерживает Escape и стрелки. CSS отключает motion при `prefers-reduced-motion`; изображения имеют фиксированные intrinsic dimensions и responsive `sizes`. Тяжёлые библиотеки не добавлены.

## Проверка

Package-тест `tests/velora-premium-template-1.0.test.ts` проверяет canonical registration, manifest/demo metadata, все generated lookups, TemplateKey/TEMPLATE_KEYS, library choices, isolated implementations, fail-closed behavior, BEMBI boundary, seed/pages, save/reload, layout/custom-block preservation и import boundaries.
