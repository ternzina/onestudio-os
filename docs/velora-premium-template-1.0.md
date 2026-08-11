# VELORA HOUSE — Premium Template Package 1.0

`velora-event-venue` — третий универсальный premium package OneStudio OS для площадки свадеб, частных событий и корпоративных мероприятий.

## Регистрация и границы

Единственная ручная регистрация находится в `lib/public-site/premium-template-package-source.mjs`. Она содержит сериализуемый manifest и bindings; `npm run generate:premium-templates` создаёт catalog, seed, contract, editor, public-home и custom-page registries. Центральные capability maps вручную не изменяются. Каталог `/demos` зависит только от manifest и не импортирует seed, editor или runtime implementations.

Public home и custom pages загружаются через `next/dynamic`. Editor schema не попадает в public runtime, а seed не попадает в `/demos` catalog graph. BEMBI остаётся отдельным protected template.

## Реализация

- `velora-premium-template-seed.ts` и `velora-premium-template-content.ts`: namespaced seed, defensive normalization, две custom pages и editor-state-safe replacement.
- `velora-premium-template-contract.ts`: 13 native sections с pinned hero/footer.
- `velora-editor-schema.ts` и `velora-premium-template-editor-adapter.ts`: отдельные поля для всего публичного copy, ссылок и каждого свойства item; rich text использует общий OneStudio editor/runtime, а hero, три зала и шесть gallery slots — общий media picker. Pipe-delimited сериализации нет. Palette связывает `theme_dark`, `theme_accent`, `theme_surface` и namespaced plum с CSS variables; reset/restore возвращают defaults.
- `velora-premium-template-runtime-adapter.ts` и `velora-premium-template-custom-page-runtime-adapter.ts`: lazy public capabilities.
- `components/public/velora/*`: server-rendered home/custom-page renderers и небольшая client boundary для формы, CTA и lightbox.
- `app/demos/velora-event-venue/[[...templatePath]]/page.tsx`: route-aware metadata и canonical demo home, `/venues` и `/packages`; системный `/p/...` alias получает тот же чистый canonical.

## Контент и взаимодействия

Home включает hero, проверку даты, три зала, пять форматов, три пакета, editorial gallery, catering, event planner, цифры, отзывы, FAQ, контакты и footer. Форма требует дату (не ранее текущего дня), формат, гостей, зал, пакет, имя, email и телефон. CTA конкретного зала или пакета выбирает его, прокручивает к форме и переводит фокус. Заявка использует фактический business slug и существующий RPC `create_public_request`; pending блокирует повторную отправку, а результат сообщается через `aria-live`. Ошибка RPC не маскируется успехом.

Custom pages `/venues` и `/packages` определяются стабильными встроенными page IDs, поэтому изменение slug не меняет тип сравнения. Произвольная custom page не получает список пакетов и выводит свои blocks через общий `PublicCustomBlock` runtime. Навигация строится из редактируемых page/navigation данных.

## SEO и assets

Seed задаёт title, description, keywords и image через существующую модель public content; custom pages имеют отдельные SEO title/description/image. Demo `generateMetadata` вызывает route-aware resolver: home, venues и packages получают собственные title, description, image, canonical, Open Graph и Twitter; неизвестные/скрытые slugs fail closed.

Все изображения — локальные оптимизированные SVG-композиции в `public/templates/velora/`. Они являются понятными media slots и заменяются через Site Editor. Внешние URL и assets GLOSS/NOIR/BEMBI не используются.

## Accessibility и performance

Использованы semantic landmarks, последовательная иерархия заголовков, видимый `:focus-visible`, alt-тексты, нативные form controls и `details`. Lightbox имеет modal dialog semantics, focus trap, Escape/ArrowLeft/ArrowRight и возврат фокуса opener; пустая gallery безопасна. CSS отключает motion при `prefers-reduced-motion`; изображения проходят item-level fallback normalization, имеют intrinsic dimensions и responsive `sizes`. Тяжёлые библиотеки не добавлены.

## Проверка

Package-тест `tests/velora-premium-template-1.0.test.ts` проверяет canonical registration, manifest/generated lookups, 13 sections, editor paths, rich text/media fields, palette CSS variables, item normalization, сохранение Unicode и `|`, layout/custom blocks, полный payload формы, CTA selection markers, поведенческий metadata resolver, stable custom-page identity, lightbox focus/keyboard behavior и lazy/import boundaries. Общая матрица дополнительно проверяется repository-wide тестами.
