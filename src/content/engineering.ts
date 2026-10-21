import type { WikiPage } from '../site-data';
import generated from './engineering.generated.json';

// Imported DOCX text/runs with the reviewed figure-reference revisions.
// See docs/engineering-revision-sources.json and the Wiki review record.
export const engineering = generated as unknown as WikiPage;
