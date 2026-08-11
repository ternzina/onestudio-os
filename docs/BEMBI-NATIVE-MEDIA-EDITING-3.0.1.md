# BEMBI Native Media Editing 3.0.1

## Outcome

The original BEMBI home-template images now participate in the Site Editor media workflow instead of remaining hard-coded demo assets.

## Editable native media

- hero image;
- interest navigator images;
- task, workbook, experiment and journal images;
- approach and programs imagery;
- teacher portraits;
- gallery images.

Each fixed template slot supports a direct URL, media-library replacement and restoration of its original demo image. The selected native block also supports visible media size, image fit, focal point, opacity and mobile fit/focal overrides.

## Compatibility

Native media settings are sparse and opt-in. An untouched BEMBI block follows the exact pre-3.0.1 rendering path, so existing demos do not change automatically. Replacements and layout values live inside the existing `template_content.premium-kids-center.blocks[].props.native_media` namespace and use the already deployed generic template-content persistence boundary; no database migration is required.

## Verification

- 239 Node tests pass.
- TypeScript passes.
- Production build passes with 67 generated routes/pages.
- ESLint reports zero errors and the same seven pre-existing repository warnings.

The BEMBI-only inspector widget described by this milestone was superseded by the OneStudio-owned shared media field in Site Editor 3.0.2; its persisted data and runtime behavior remain compatible.
