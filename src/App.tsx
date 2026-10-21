import { assetUrl as resolveFigureSrc } from "./asset-url";
import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { archiveNavigation, navigation, pageOrder, pages } from "./site-data";
import { dryLabMenuGroups } from "./content/dry-lab";
import { ihpNavigation } from "./content/integrated-human-practices";
import { ArticleBlocks } from './ArticleBlocks';
import { renderInlineText } from './inline-text';
import { DocumentText } from './DocumentText';
import type { DocumentTextRun } from './content/types';
import { pageBibliography } from './bibliography';
import { CitationNumbers } from './citation-numbers';
import { ReferenceList } from './ReferenceList';

const PixelWorld = lazy(() => import("./PixelWorld").then((module) => ({ default: module.PixelWorld })));
const MODELING_PATHS = ['/dry-lab', '/transcriptomics', '/metabolomics', '/protein', '/model', '/safety-and-security'];
const HUMAN_PRACTICES_PATHS = ['/integrated-human-practices', '/background-research', '/integrated-human-practices/stakeholder-analysis', '/project-improvement', '/education', '/cooperation'];
const ARTICLE_GROUP_HEROES: Record<string, string> = {
  Project: '/images/great-salt-lake-iss063-e-40184.jpg',
  'Dry Lab': '/images/heroes/dry-lab.webp',
  'Human Practices': '/images/heroes/human-practices.webp',
  Lab: '/images/heroes/lab.webp',
  Team: '/images/heroes/people.webp',
};

function normalizePath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "");
  return normalized || "/";
}


function BrandMark() {
  return <img className="brand-mark" src={resolveFigureSrc('images/brand/panda-icon.webp')} alt="" aria-hidden="true" width={256} height={256} decoding="async" />;
}

function BootLoadingScreen() {
  return <main id="main-content" tabIndex={-1} className="px-loading px-loading--boot" role="status" aria-live="polite">
    <p className="px-loading-title">DUNATERP</p>
    <div className="px-loader-scene" aria-hidden="true"><i /><b /><span /></div>
    <p className="px-loading-sub">Surveying the salt flats…</p>
  </main>;
}

function Header({ light = false }: { light?: boolean }) {
  const header = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const currentPath = normalizePath(pathname);
  useEffect(() => {
    const node = header.current;
    if (!node) return;
    const close = () => node.querySelectorAll("details[open]").forEach((item) => item.removeAttribute("open"));
    const outside = (event: PointerEvent) => { if (!node.contains(event.target as Node)) close(); };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const active = document.activeElement?.closest("details[open]");
      close();
      active?.querySelector("summary")?.focus();
    };
    close();
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [pathname]);
  return <header ref={header} className={`site-header${light ? " site-header--light" : ""}`}>
    <Link className="brand" to="/" aria-label="DunaTerp home"><BrandMark /><span>DunaTerp<small>SCU–CHINA · 2026</small></span></Link>
    <nav className="desktop-nav" aria-label="Primary navigation">
      <Link className={`nav-home${currentPath === "/" ? " is-current" : ""}`} to="/" aria-current={currentPath === "/" ? "page" : undefined}>Home</Link>
      {navigation.map((group) => <details key={group.label} name="desktop-navigation">
        <summary className={group.items.some(([, href]) => href === currentPath) || (group.label === 'Dry Lab' && MODELING_PATHS.includes(currentPath)) || (group.label === 'Human Practices' && HUMAN_PRACTICES_PATHS.includes(currentPath)) ? "is-current" : undefined}>{group.label}<span aria-hidden="true">⌄</span></summary>
        <div className={`nav-popover${group.label === 'Dry Lab' ? ' nav-popover--dry-lab' : ''}${group.label === 'Human Practices' ? ' nav-popover--human-practices' : ''}`}>
          {group.label === 'Dry Lab' ? <>
            <p>{group.label}</p>
            <Link to="/dry-lab" aria-current={currentPath === '/dry-lab' ? "page" : undefined}>Overview<span aria-hidden="true">↗</span></Link>
            {dryLabMenuGroups.map((section) => <section className="nav-popover-section" key={section.label}>
              <h3>{section.label}</h3>
              {section.items.map(([label, href]) => <Link key={href} to={href} aria-current={currentPath === href ? "page" : undefined}>{label}<span aria-hidden="true">↗</span></Link>)}
            </section>)}
          </> : group.label === 'Human Practices' ? <>
            <p>{group.label}</p>
            <details className="nav-nested-group">
              <summary className={ihpNavigation.some(([, href]) => href === currentPath) || currentPath === '/integrated-human-practices' ? 'is-current' : undefined}>Integrated Human Practices<span aria-hidden="true">›</span></summary>
              <div className="nav-nested-popover">
                {ihpNavigation.map(([label, href]) => <Link key={href} to={href} aria-current={currentPath === href ? 'page' : undefined}>{label}<span aria-hidden="true">↗</span></Link>)}
              </div>
            </details>
            <Link to="/education" aria-current={currentPath === '/education' ? 'page' : undefined}>Education<span aria-hidden="true">↗</span></Link>
            <Link to="/cooperation" aria-current={currentPath === '/cooperation' ? 'page' : undefined}>Cooperation<span aria-hidden="true">↗</span></Link>
          </> : <>
            <p>{group.label}</p>
            {group.items.map(([label, href]) => <Link key={href} to={href} aria-current={currentPath === href ? "page" : undefined}>{label}<span aria-hidden="true">↗</span></Link>)}
          </>}
        </div>
      </details>)}
      <Link className="nav-index" to="/wiki-map" aria-current={currentPath === "/wiki-map" ? "page" : undefined}>Explore Wiki <span aria-hidden="true">↗</span></Link>
    </nav>
    <details className="mobile-menu"><summary>Menu <span aria-hidden="true">☰</span></summary><nav aria-label="Mobile navigation">
      <Link className="mobile-home-link" to="/" aria-current={currentPath === "/" ? "page" : undefined}>Home</Link>
      {navigation.map((group) => <div className="mobile-nav-group" key={group.label}><p>{group.label}</p>{group.label === 'Dry Lab' ? <>
        <Link to="/dry-lab" aria-current={currentPath === '/dry-lab' ? "page" : undefined}>Overview</Link>
        {dryLabMenuGroups.map((section) => <section className="mobile-nav-subgroup" key={section.label}><p>{section.label}</p>{section.items.map(([label, href]) => <Link key={href} to={href} aria-current={currentPath === href ? "page" : undefined}>{label}</Link>)}</section>)}
      </> : group.label === 'Human Practices' ? <>
        <details className="mobile-nav-nested"><summary>Integrated Human Practices <span aria-hidden="true">⌄</span></summary><div>{ihpNavigation.map(([label, href]) => <Link key={href} to={href} aria-current={currentPath === href ? 'page' : undefined}>{label}</Link>)}</div></details>
        <Link to="/education" aria-current={currentPath === '/education' ? 'page' : undefined}>Education</Link>
        <Link to="/cooperation" aria-current={currentPath === '/cooperation' ? 'page' : undefined}>Cooperation</Link>
      </> : group.items.map(([label, href]) => <Link key={href} to={href} aria-current={currentPath === href ? "page" : undefined}>{label}</Link>)}</div>)}
      <Link className="mobile-map-link" to="/wiki-map">Explore Wiki ↗</Link>
    </nav></details>
  </header>;
}

function Footer() {
  return <footer className="site-footer">
    <div className="footer-main">
      <section className="footer-acknowledgement" aria-labelledby="footer-acknowledgement-title">
        <h2 id="footer-acknowledgement-title">ACKNOWLEDGEMENT</h2>
        <div className="footer-marks">
          <img src="https://static.igem.wiki/teams/5810/scu/scu11.webp" alt="Sichuan University emblem" loading="lazy" decoding="async" />
          <img src="https://static.igem.wiki/teams/5810/scu/scu12.webp" alt="College of Life Sciences, Sichuan University emblem" loading="lazy" decoding="async" />
          <div className="footer-project-mark">
            <img className="footer-project-logo" src={resolveFigureSrc('images/brand/panda-wordmark.webp')} alt="DunaTerp — SCU-China iGEM 2026" width={528} height={264} loading="lazy" decoding="async" />
          </div>
        </div>
      </section>
      <section className="footer-contact" aria-labelledby="footer-contact-title">
        <h2 id="footer-contact-title">Contact Us</h2>
        <address>
          <a href="tel:+8613308049545">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 2.8 9.4 7 7.8 9.1c1.3 2.7 3.4 4.8 6.1 6.1l2.1-1.6 4.2 2.8-.8 3.3c-.2.8-.9 1.4-1.7 1.4C9.5 21.1 2.9 14.5 2.9 6.3c0-.8.6-1.5 1.4-1.7l2.3-.8Z" /></svg>
            <span>+86 133 0804 9545</span>
          </a>
          <a href="mailto:scu_igem@163.com">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5h18v13H3z" /><path d="m4 7 8 6 8-6" /></svg>
            <span>scu_igem@163.com</span>
          </a>
          <p>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-6.2 6-12a6 6 0 1 0-12 0c0 5.8 6 12 6 12Z" /><circle cx="12" cy="9" r="2" /></svg>
            <span>College of Life Sciences, Sichuan University<br />No. 29 Wangjiang Road, Chengdu, Sichuan, China</span>
          </p>
        </address>
      </section>
    </div>
    <div className="footer-bottom">
      <p>© 2026 — Content on this site is licensed under a <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International license</a>.<br />The repository used to create this website is available at <a href="https://gitlab.igem.org/2026/scu-china">gitlab.igem.org/2026/scu-china</a>.</p>
      <nav className="footer-links" aria-label="Site information"><Link to="/attributions">Attributions</Link></nav>
    </div>
  </footer>;
}

function firstPageFigure(page: (typeof pages)[string]) {
  if (page.figure) return page.figure.src;
  for (const section of page.sections) {
    for (const block of section.blocks ?? []) {
      if (block.kind === "figure") return block.src;
      if (block.kind === "figure-grid" && block.figures[0]) return block.figures[0].src;
    }
  }
  return "/figures/project/salt-strata.svg";
}

function renderCitations(text: string, referenceNumbers: Map<string, number>, citationNumbers: ReadonlyMap<number, number>) {
  if (referenceNumbers.size === 0) return renderInlineText(text);
  const parts = text.split(/\[(\d+)\]/g);
  return parts.map((part, index) => {
    if (index % 2 === 0) return renderInlineText(part, index);
    const number = citationNumbers.get(Number(part)) ?? Number(part);
    return number > 0 && number <= referenceNumbers.size
      ? <a className="inline-citation" href={`#reference-${number}`} key={`${index}-${number}`}>[{number}]</a>
      : `[${part}]`;
  });
}

type TocSection = { id: string; title: string; titleRuns?: DocumentTextRun[]; children: Array<{ id: string; title: string; titleRuns?: DocumentTextRun[] }> };

type TocChapterDefinition = { title: string; start: number; end: number };

/**
 * Long technical pages read more clearly when the contents panel describes a
 * few real chapters instead of repeating every on-page heading at the same
 * level. These ranges only affect the contents panel: every section and anchor
 * remains present in the article.
 */
const TOC_CHAPTERS: Record<string, TocChapterDefinition[]> = {
  results: [
    { title: "Platform Results", start: 0, end: 2 },
    { title: "Biosafety Experiments", start: 3, end: 6 },
    { title: "Computational Evidence", start: 7, end: 7 },
    { title: "Discussion & Next Steps", start: 8, end: 9 },
  ],
  experiments: [
    { title: "Experiment Overview", start: 0, end: 0 },
    { title: "Experiment Documents", start: 1, end: 5 },
  ],
  transcriptomics: [
    { title: "Pathway & Dataset", start: 0, end: 1 },
    { title: "Sequence & Count Analysis", start: 2, end: 3 },
    { title: "Results & Model Handoff", start: 4, end: 5 },
  ],
  metabolomics: [
    { title: "Chassis & Method", start: 0, end: 2 },
    { title: "Product Pathways", start: 3, end: 5 },
    { title: "Branch Dynamics", start: 6, end: 8 },
    { title: "Conclusions", start: 9, end: 9 },
  ],
  model: [
    { title: "Model Construction", start: 0, end: 2 },
    { title: "Simulation & Results", start: 3, end: 4 },
    { title: "Sensitivity & Validation", start: 5, end: 6 },
  ],
  protein: [
    { title: "LCYB Design & Screening", start: 0, end: 6 },
    { title: "CPP2146–DNA Recognition", start: 7, end: 10 },
    { title: "Constructs & Docking Scope", start: 11, end: 12 },
  ],
  hardware: [
    { title: "Overview & Optics", start: 0, end: 1 },
    { title: "Cultivation Strategy", start: 2, end: 3 },
    { title: "Light, Scale & Energy", start: 4, end: 5 },
    { title: "Interactive Tool & Scope", start: 6, end: 7 },
  ],
  "safety-and-security": [
    { title: "Concept & Response", start: 0, end: 1 },
    { title: "Results & Assumptions", start: 2, end: 3 },
    { title: "Parameters & Formulation", start: 4, end: 5 },
    { title: "Project Implications", start: 6, end: 6 },
  ],
  "integrated-human-practices/stakeholder-analysis": [
    { title: "Stakeholder Framework", start: 0, end: 0 },
    { title: "Public & Industry", start: 1, end: 3 },
    { title: "Regulation & Research", start: 4, end: 5 },
    { title: "Summary", start: 6, end: 6 },
  ],
};

type TocChapter = {
  id: string;
  title: string;
  titleRuns?: DocumentTextRun[];
  links: Array<{ id: string; title: string; titleRuns?: DocumentTextRun[]; activeIds: Set<string> }>;
  activeIds: Set<string>;
};

function tocChapters(slug: string, sections: TocSection[]): TocChapter[] {
  const configured = TOC_CHAPTERS[slug];
  const definitions = configured ?? (sections.length > 6
    ? Array.from({ length: Math.ceil(sections.length / 3) }, (_, index) => {
        const start = index * 3;
        return { title: sections[start].title, start, end: Math.min(start + 2, sections.length - 1) };
      })
    : sections.map((section, index) => ({ title: section.title, start: index, end: index })));

  return definitions.flatMap((definition) => {
    const members = sections.slice(definition.start, definition.end + 1);
    if (members.length === 0) return [];
    const allIds = new Set(members.flatMap((section) => [section.id, ...section.children.map((child) => child.id)]));
    const links = members.length === 1
      ? members[0].children.map((child) => ({ ...child, activeIds: new Set([child.id]) }))
      : members.map((section) => ({
          id: section.id,
          title: section.title,
          titleRuns: section.titleRuns,
          activeIds: new Set([section.id, ...section.children.map((child) => child.id)]),
        }));
    return [{ id: members[0].id, title: definition.title, titleRuns: definition.title === members[0].title ? members[0].titleRuns : undefined, links, activeIds: allIds }];
  });
}

type PageProgressStop = { id: string; title: string };

function PageProgress({ pathname, stops, accent }: { pathname: string; stops: PageProgressStop[]; accent: string }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const next = Math.max(0, Math.min(100, (window.scrollY / maximum) * 100));
        setProgress((current) => Math.abs(current - next) < .1 ? current : next);
      });
    };
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(document.body);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  if (stops.length === 0) return null;
  const stopPosition = (index: number) => stops.length === 1 ? 0 : (index / (stops.length - 1)) * 100;
  const activeIndex = stops.reduce((active, _stop, index) => progress + 1 >= stopPosition(index) ? index : active, 0);
  return <nav className="page-progress" aria-label="Page progress" style={{ "--page-progress": `${progress}%`, "--page-progress-accent": accent } as CSSProperties}>
    <div className="page-progress__meter" role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
      <span className="page-progress__fill" aria-hidden="true" />
      <i className="page-progress__traveller" aria-hidden="true" />
    </div>
    {stops.map((stop, index) => <Link
      key={stop.id}
      className={`page-progress__stop${index === activeIndex ? " is-active" : ""}${index <= activeIndex ? " is-passed" : ""}`}
      style={{ left: `${stopPosition(index)}%` }}
      to={{ pathname, hash: `#${stop.id}` }}
      aria-label={`Go to ${stop.title}`}
      aria-current={index === activeIndex ? "location" : undefined}
      title={stop.title}
    ><span aria-hidden="true" /></Link>)}
  </nav>;
}

function ArticleToc({ slug, sections, hasReferences }: { slug: string; sections: TocSection[]; hasReferences: boolean }) {
  const nav = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState("section-1");
  const items = [
    ...sections.flatMap((section) => [{ id: section.id, title: section.title }, ...section.children]),
    ...(hasReferences ? [{ id: "references", title: "References" }] : []),
  ];
  const itemKey = items.map((item) => `${item.id}\u0000${item.title}`).join("\u0001");

  useEffect(() => {
    const currentItems = itemKey ? itemKey.split("\u0001").map((item) => {
      const [id, title] = item.split("\u0000");
      return { id, title };
    }) : [];
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Anchor scrolling combines root scroll-padding and section scroll-margin.
        // Include that landing position so clicking a heading highlights that heading.
        const firstSection = document.getElementById(currentItems[0]?.id ?? '');
        const anchorOffset = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
          + (firstSection ? parseFloat(getComputedStyle(firstSection).scrollMarginTop) || 0 : 0);
        const marker = Math.max(Math.min(220, window.innerHeight * 0.3), anchorOffset + 2);
        let next = currentItems[0]?.id ?? "";
        for (const item of currentItems) {
          const section = document.getElementById(item.id);
          if (!section) continue;
          if (section.getBoundingClientRect().top <= marker) next = item.id;
          else break;
        }
        setActiveId((current) => current === next ? current : next);
        const scrollport = nav.current;
        const link = scrollport?.querySelector<HTMLElement>(`[data-toc-id="${next}"]`);
        if (scrollport && link) {
          const port = scrollport.getBoundingClientRect();
          const target = link.getBoundingClientRect();
          const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (target.top < port.top) scrollport.scrollTo({ top: scrollport.scrollTop - (port.top - target.top) - 8, behavior: reduceMotion ? "auto" : "smooth" });
          else if (target.bottom > port.bottom) scrollport.scrollTo({ top: scrollport.scrollTop + (target.bottom - port.bottom) + 8, behavior: reduceMotion ? "auto" : "smooth" });
        }
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [slug, itemKey]);

  const chapters = tocChapters(slug, sections);
  return <aside className="article-toc"><p>Contents</p><nav ref={nav} aria-label="Contents">
    {chapters.map((chapter) => {
      const isOpen = chapter.activeIds.has(activeId);
      return <div className={`toc-group${isOpen ? " is-open" : ""}`} key={chapter.id}>
        <Link data-toc-id={chapter.id} className={`toc-parent${activeId === chapter.id ? " is-active" : ""}`} aria-current={activeId === chapter.id ? "location" : undefined} to={{ pathname: `/${slug}`, hash: `#${chapter.id}` }}><span>{chapter.titleRuns ? <DocumentText runs={chapter.titleRuns} /> : renderInlineText(chapter.title)}</span>{chapter.links.length > 0 && <b aria-hidden="true">⌄</b>}</Link>
        {chapter.links.length > 0 && <div className="toc-sublist">{chapter.links.map((link) => {
          const isActive = link.activeIds.has(activeId);
          return <Link key={link.id} data-toc-id={link.id} className={isActive ? "is-active" : undefined} aria-current={isActive ? "location" : undefined} to={{ pathname: `/${slug}`, hash: `#${link.id}` }}>{link.titleRuns ? <span><DocumentText runs={link.titleRuns} /></span> : renderInlineText(link.title)}</Link>;
        })}</div>}
      </div>;
    })}
    {hasReferences && <Link data-toc-id="references" className={`toc-references${activeId === "references" ? " is-active" : ""}`} aria-current={activeId === "references" ? "location" : undefined} to={{ pathname: `/${slug}`, hash: "#references" }}>References</Link>}
  </nav></aside>;
}

const groupDescriptions = [
  "From the biological idea to experiments and evidence.",
  "Understand the system, its constraints and its possibilities.",
  "Connect project decisions with people and the environment.",
  "Keep lab practice organized with safety notes and notebook records.",
  "Meet the team and discover the work behind the project.",
];

function WikiMap() {
  const progressStops = archiveNavigation.map((group, index) => ({ id: `map-group-${index + 1}`, title: group.label }));
  return <><Header /><PageProgress pathname="/wiki-map" stops={progressStops} accent="#c9f66b" /><main id="main-content" tabIndex={-1} className="map-page">
    <header className="map-heading"><div><p className="page-eyebrow">DUNATERP / PROJECT INDEX</p><h1>Explore the<br /><em>whole spectrum.</em></h1></div><p className="map-intro">Follow the science, explore the evidence, and meet the people behind DunaTerp. Every chapter starts here.</p></header>
    <div className="map-grid">{archiveNavigation.map((group, index) => <section id={`map-group-${index + 1}`} key={group.label} className={`map-group map-group--${index}`}><header><span className="map-number">0{index + 1}</span></header><h2>{group.label}</h2><p className="map-description">{groupDescriptions[index]}</p><div className="map-links">{group.items.map(([label, href]) => <Link key={href} to={href}><span>{label}</span><b aria-hidden="true">↗</b></Link>)}</div></section>)}</div>
    <div className="map-return"><span>Start with the story.</span><Link to="/">Return to the salt route <span aria-hidden="true">↗</span></Link></div>
    <nav className="related-wiki-pages" aria-label="Project-wide pages"><Link to="/dry-lab">Modeling overview</Link><Link to="/alternative-platform">Alternative Platform</Link></nav>
  </main><Footer /></>;
}

function Article({ slug }: { slug: string }) {
  const page = pages[slug];
  if (!page) return <Navigate to="/wiki-map" replace />;
  const group = navigation.find((item) => item.items.some(([, href]) => href === `/${slug}`))
    ?? (MODELING_PATHS.includes(`/${slug}`) ? navigation.find((item) => item.label === 'Dry Lab') : undefined)
    ?? (HUMAN_PRACTICES_PATHS.includes(`/${slug}`) ? navigation.find((item) => item.label === 'Human Practices') : undefined);
  const groupIndex = Math.max(0, navigation.findIndex((item) => item === group));
  const articleAccent = ["#cdf558", "#7de2ff", "#e9c43a", "#91e6b0", "#c4a8ff"][groupIndex];
  const figureSrc = page.figure ? resolveFigureSrc(page.figure.src) : "";
  const hasContent = page.sections.length > 0;
  const isModeling = MODELING_PATHS.includes(`/${slug}`);
  const { references, referenceNumbers, citationNumbers } = pageBibliography(page);
  const isWetLab = group?.label === 'Project';
  const navigationLabel = group?.items.find(([, href]) => href === `/${slug}`)?.[0];
  const heroTitle = navigationLabel ?? page.title;
  const heroImage = resolveFigureSrc(page.heroImage ?? (slug === 'team' ? firstPageFigure(page) : (ARTICLE_GROUP_HEROES[group?.label ?? ''] ?? firstPageFigure(page))));
  const tocSections: TocSection[] = page.sections.map((section, sectionIndex) => ({
    id: `section-${sectionIndex + 1}`,
    title: section.tocTitle ?? section.title,
    titleRuns: section.tocTitle ? undefined : section.titleRuns,
    children: (section.blocks ?? []).flatMap((block, blockIndex) => {
      if (block.kind === 'heading') return [{ id: `section-${sectionIndex + 1}-heading-${blockIndex + 1}`, title: block.text }];
      if (block.kind === 'document-heading' && block.level !== 4) return [{ id: `section-${sectionIndex + 1}-heading-${blockIndex + 1}`, title: block.text, titleRuns: block.runs }];
      if (block.kind === 'wet-lab-method') return block.headings;
      return [];
    }),
  }));
  const progressStops = [
    ...tocChapters(slug, tocSections).map((chapter) => ({ id: chapter.id, title: chapter.title })),
    ...(references.length > 0 ? [{ id: "references", title: "References" }] : []),
  ];
  const articleClassName = [
    "article-page",
    isWetLab ? ' article-page--wet-lab' : '',
    isWetLab || group?.label === 'Lab' ? ' article-page--light' : '',
    group?.label === 'Dry Lab' || slug === 'dry-lab' ? ' article-page--dry-lab' : '',
    group?.label === 'Human Practices' ? ' article-page--human-practices' : '',
    slug === 'collaboration' ? ' article-page--collaboration' : '',
    isModeling ? ' article-page--modeling' : '',
    slug === 'dry-lab' ? ' article-page--overview' : '',
    slug === 'hardware' ? ' article-page--hardware' : '',
    slug === 'safety-and-security' ? ' article-page--safety' : '',
    slug === 'experiments' ? ' article-page--experiments' : '',
    slug === 'lab-notebook' ? ' article-page--notebook' : '',
    slug === 'team' ? ' article-page--team' : '',
    slug === 'parts' ? ' article-page--parts' : '',
    slug === 'attributions' ? ' article-page--attributions' : '',
    slug === 'project-description' ? ' article-page--description' : '',
    slug === 'design' ? ' article-page--design' : '',
    slug === 'engineering' ? ' article-page--engineering' : '',
  ].join("");
  return <><Header /><PageProgress pathname={`/${slug}`} stops={progressStops} accent={articleAccent} /><main id="main-content" tabIndex={-1} style={{ "--article-accent": articleAccent, "--article-hero-image": `url("${heroImage}")` } as CSSProperties} className={articleClassName}>
    <header className="article-hero"><div><h1>{renderInlineText(heroTitle)}</h1></div></header>
    {slug === "attributions" && page.intro && <p className="attributions-introduction">{renderInlineText(page.intro)}</p>}
    {slug === 'team' && page.intro && <p className="team-introduction">{renderInlineText(page.intro)}</p>}
    {hasContent && <CitationNumbers.Provider value={citationNumbers}>
    <div className="article-layout"><ArticleToc slug={slug} sections={tocSections} hasReferences={references.length > 0} />
      <div className="article-body">{page.figure && <figure className="feature-figure"><img src={figureSrc} alt={page.figure.alt} loading="lazy" decoding="async" /><figcaption>{renderInlineText(page.figure.caption)}</figcaption></figure>}
        <div className="article-sections">{page.sections.map((section, i) => <section id={`section-${i + 1}`} tabIndex={-1} key={`${i}-${section.title}`}><div className="section-number">{String(i + 1).padStart(2, "0")}</div><div><h2>{section.titleRuns ? <DocumentText runs={section.titleRuns} /> : renderInlineText(section.title)}</h2>{section.body && <p>{renderCitations(section.body, referenceNumbers, citationNumbers)}</p>}{section.blocks && <ArticleBlocks blocks={section.blocks} referenceNumbers={referenceNumbers} sectionId={`section-${i + 1}`} />}{section.items && <ul>{section.items.map((item) => <li key={item}>{renderCitations(item, referenceNumbers, citationNumbers)}</li>)}</ul>}{section.note && <aside>{renderInlineText(section.note)}</aside>}</div></section>)}</div>
        {references.length > 0 && <section id="references" tabIndex={-1} className="article-references"><h2>References</h2><ReferenceList references={references} /></section>}

      </div>
    </div>
    </CitationNumbers.Provider>}
  </main><Footer /></>;
}

function ScrollAndTitle() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const slug = normalizePath(pathname).replace(/^\//, "");
    const route = `/${slug}`;
    const leafTitle = navigation
      .flatMap((group) => group.items)
      .find(([, href]) => href === route)?.[0]
      ?? (slug === "dry-lab" ? "Dry Lab" : slug === "wiki-map" ? "Wiki Map" : slug ? pages[slug]?.eyebrow : "DunaTerp");
    document.title = `SCU-China 2026 | ${leafTitle || "DunaTerp"}`;
    const frame = requestAnimationFrame(() => {
      if (hash) {
        let id = hash.slice(1);
        try { id = decodeURIComponent(id); } catch { /* Keep the raw id when a malformed URL hash is supplied. */ }
        const target = document.getElementById(id);
        if (target) {
          const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
          target.focus({ preventScroll: true });
        }
      } else {
        window.scrollTo(0, 0);
        document.getElementById("main-content")?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const { pathname, search } = useLocation();
  return <><Link className="skip-link" to={{ pathname, search, hash: "#main-content" }}>Skip to content</Link><ScrollAndTitle /><Routes>
    <Route path="/" element={<><Suspense fallback={<BootLoadingScreen />}><PixelWorld Header={Header} /></Suspense><Footer /></>} />
    <Route path="/wiki-map" element={<WikiMap />} />
    <Route path="/stakeholder-analysis" element={<Navigate to="/integrated-human-practices/stakeholder-analysis" replace />} />
    {pageOrder.map((slug) => <Route key={slug} path={`/${slug}`} element={<Article slug={slug} />} />)}
    <Route path="*" element={<Navigate to="/wiki-map" replace />} />
  </Routes></>;
}
