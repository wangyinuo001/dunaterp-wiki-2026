export type ContentBlock =
  | { kind: 'paragraph' | 'heading'; text: string }
  | { kind: 'document-paragraph'; runs: DocumentTextRun[]; id?: string }
  | { kind: 'document-heading'; text: string; runs: DocumentTextRun[]; level?: 3 | 4 }
  | { kind: 'document-list'; items: DocumentTextRun[][]; ordered?: boolean }
  | { kind: 'details'; summary: string; blocks: ContentBlock[]; open?: boolean }
  | { kind: 'equation'; text: string; label: string }
  | { kind: 'code'; text: string; label: string }
  | { kind: 'figure'; src: string; alt: string; caption: string; captionRuns?: DocumentTextRun[]; width?: number; height?: number; rotation?: 90 }
  | { kind: 'figure-grid'; figures: { src: string; alt: string; caption: string; width?: number; height?: number }[]; caption?: string; captionRuns?: DocumentTextRun[]; className?: string }
  | { kind: 'member-grid'; members: TeamMember[] }
  | { kind: 'chapter-grid'; items: { index: string; title: string; text: string; href: string }[] }
  | { kind: 'table'; caption: string; captionRuns?: DocumentTextRun[]; columns: string[]; rows: string[][]; columnRuns?: DocumentTextRun[][]; cellRuns?: DocumentTextRun[][][]; collapsed?: boolean }
  | { kind: 'links'; links: { label: string; href: string }[] }
  | { kind: 'attribution-list'; entries: AttributionEntry[] }
  | { kind: 'official-attributions' }
  | { kind: 'wet-lab-overview' }
  | { kind: 'wet-lab-method'; id: string; introHtml: string; html: string; protocolTitle: string; headings: { id: string; title: string }[] }
  | { kind: 'download'; src: string; label: string }
  | { kind: 'pdf'; src: string; downloadSrc: string; label: string; downloadLabel?: string }
  | { kind: 'pbr-widget' | 'docking-viewer' }
  | { kind: 'safety-overview' | 'safety-results' };

export type DocumentTextRun = {
  text: string;
  italic?: boolean;
  bold?: boolean;
  verticalAlign?: 'subscript' | 'superscript';
  href?: string;
};

export type TeamMember = {
  givenName: string;
  familyName: string;
  major: string;
  src: string;
};

export type WikiReference = {
  label: string;
  href?: string;
  labelRuns?: DocumentTextRun[];
  kind?: 'Article' | 'Dataset' | 'Database' | 'Software' | 'Image' | 'Web resource';
};

export type AttributionEntry = {
  name: string;
  role?: string;
  contribution: string;
};
