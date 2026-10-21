import type { WikiPage, WikiSection } from '../site-data';
import type { WikiReference } from './types';
import generated from './integrated-human-practices.generated.json';
import { stakeholderAnalysis } from './stakeholder-analysis';

type GeneratedIhp = {
  background: WikiSection;
  improvement: WikiSection;
  references: WikiReference[];
};

const source = generated as unknown as GeneratedIhp;

function improvementSections(): WikiSection[] {
  const introduction = source.improvement.body?.trim();
  return (source.improvement.blocks ?? []).flatMap((block, index) => {
    if (block.kind !== 'details') return [];
    return [{
      title: block.summary,
      body: index === 0 && introduction ? introduction : '',
      blocks: block.blocks,
    }];
  });
}

export const ihpNavigation = [
  ['Background Research', '/background-research'],
  ['Stakeholder Analysis', '/integrated-human-practices/stakeholder-analysis'],
  ['Project Improvement', '/project-improvement'],
] as const;

export const integratedHumanPractices: WikiPage = {
  title: 'Integrated Human Practices',
  eyebrow: 'Human Practices',
  intro: 'DunaTerp developed through a continuous cycle of research, dialogue, reflection and redesign. The three chapters below follow that cycle from defining the problem, through listening to stakeholders, to recording how their input changed the project.',
  status: 'team-draft',
  sections: [
    {
      title: 'Background Research',
      body: 'We first examined the production landscape, the salt-adapted chassis and the people and systems connected to the project. This work defined the questions that later conversations needed to test.',
      blocks: [{ kind: 'links', links: [{ label: 'Read Background Research', href: '/background-research' }] }],
    },
    {
      title: 'Stakeholder Analysis',
      body: 'We then mapped and engaged the groups who shape, assess, regulate, use or may be affected by DunaTerp, and organized their priorities around concrete project decisions.',
      blocks: [{ kind: 'links', links: [{ label: 'Read Stakeholder Analysis', href: '/integrated-human-practices/stakeholder-analysis' }] }],
    },
    {
      title: 'Project Improvement',
      body: 'Feedback became part of the engineering process only when it changed a design choice. This chapter records those iterations, the decisions they produced and the questions that remain open.',
      blocks: [{ kind: 'links', links: [{ label: 'Read Project Improvement', href: '/project-improvement' }] }],
    },
  ],
  references: source.references,
};

export const ihpBackgroundResearch: WikiPage = {
  title: 'Background Research',
  eyebrow: 'Integrated Human Practices',
  intro: 'Background research establishes why DunaTerp is worth developing, where it could operate and which technical, industrial and social constraints must shape the project from the beginning.',
  status: 'team-draft',
  sections: [source.background],
  references: source.references,
};

export const ihpStakeholderAnalysis: WikiPage = {
  ...stakeholderAnalysis,
  eyebrow: 'Integrated Human Practices',
  intro: 'Stakeholder analysis connects the project with the people and organisations who influence it or may be affected by it. Their needs, concerns and expertise are presented openly here rather than hidden inside a collapsed overview.',
};

export const ihpProjectImprovement: WikiPage = {
  title: 'Project Improvement',
  eyebrow: 'Integrated Human Practices',
  intro: 'Each round of research and stakeholder dialogue was translated into a project decision. The chapters below show how DunaTerp moved from an initial idea toward a more practical, responsible and testable design.',
  status: 'team-draft',
  sections: improvementSections(),
  references: source.references,
};
