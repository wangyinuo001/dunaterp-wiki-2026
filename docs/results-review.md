# Project Results document import

The Results page is built strictly from `D:/IGEM/result/Results_总.docx`.
It replaces the earlier editorial summaries. No scientific prose, conclusions,
statistics, references or future plans were added or rewritten.

The native article contains six modules in Word order: CPP2146, β-Ionone,
Crocetin, Astaxanthin, β-Citraurin and Biosafety. All 42 figure numbers,
46 image panels, ten tables, captions, source heading text and body paragraphs
are retained. Short module names are used only in the contents navigation.
The shared Project hero, typography, reading column, footer, figure links and
responsive table scrolling are reused. Word panels described as top/bottom
are stacked; Figure 3 is displayed as A/B panels.

`tools/import-results.py` records the source document hash, source body indices,
resolved run formatting and image hashes in `docs/results-sources.json`.
Its fidelity check compares 53,241 non-whitespace characters and their bold,
italic, subscript/superscript and hyperlink properties against Word. All
46 exported panels preserve the original pixels after the two crops already
stored in the document. Original primer identifiers, including DsTF2146-F,
are retained as supplied.

The document contains an internal inconsistency between the CPP2146 transcript
interpretations in its source paragraphs 22 and 26. Both paragraphs are kept
verbatim under the user's strict document-following instruction. Scientific
review should resolve this in the source document before any requested rewrite.

All 46 panel occurrences use official iGEM CDN URLs. The 40 newly mapped
panel exports were downloaded and verified against their lossless SHA-256.
Six existing panel mappings reuse the official asset manifest. The source
DOCX remains outside Git.

## Verification

TypeScript, the production build, ESLint and the Results fidelity check pass.
The site-wide bibliography command passes its source-format and citation-order
checks, then fails the existing TF2146 naming assertion for `model` on the
current main branch. That unrelated source wording is preserved. The same
assertion is exempted only for Results, whose source primer identifiers must
remain verbatim. The prior assertion that Results must be absent is updated
because the user explicitly requested restoring this page.
