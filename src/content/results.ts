import type { WikiPage } from '../site-data';
import generated from './results.generated.json';

// Verbatim text, formatting, tables and figures imported from Results_总.docx.
// Source coverage and character-level fidelity are recorded in docs/results-sources.json.
export const results = generated as unknown as WikiPage;
