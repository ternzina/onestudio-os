# Premium Native Action Priority 3.2.5

Premium template CTA styles can use selectors with higher CSS specificity than
the shared native-action selector. This made saved button appearance overrides
visible in the editor controls but not on the rendered preview.

Only explicitly saved native-action declarations now receive `!important`.
Untouched buttons continue to use the original template CSS exactly as before.

This is shared behavior for premium native actions and is not VELORA-specific.
No database migration is required.
