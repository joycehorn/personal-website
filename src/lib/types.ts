export type Locale = 'en' | 'pt';

export interface LocalizedString {
  en: string;
  pt: string;
}

export type StringOrLocalized = string | LocalizedString;

export interface MetaData {
  name: string;
  domain: string;
  email: string;
  email_academic?: string;
  location: LocalizedString;
  links: {
    scholar?: string;
    github?: string;
    linkedin?: string;
    orcid?: string;
    [key: string]: string | undefined;
  };
  portrait?: string;
}

export interface ResearchTheme {
  id: string;
  tag: string;
  title: LocalizedString;
  text: LocalizedString;
  key_papers?: string[];
}

export interface Project {
  id: string;
  theme?: string;
  featured: boolean;
  period: StringOrLocalized;
  title: LocalizedString;
  context: string;
  role?: LocalizedString;
  summary: LocalizedString;
  tags: string[];
  publications: string[];
}

export interface Lane {
  id: string;
  en: string;
  pt: string;
}

export interface TimelineItem {
  id: string;
  lane: string;
  start?: string;
  end?: string;
  end_expected?: string;
  date?: string;
  org?: StringOrLocalized;
  role?: StringOrLocalized;
  place?: string;
  summary?: LocalizedString;
  tags?: string[];
  advisor?: string;
  thesis?: LocalizedString;
  links_to?: string;
  hidden?: boolean;
}

export type PublicationType = 'journal' | 'conference' | 'workshop' | 'under_review' | 'preprint';

export interface Publication {
  id: string;
  year: number;
  type: PublicationType;
  title: string;
  authors: string;
  venue: string;
  status?: StringOrLocalized;
  doi?: string;
  url?: string;
  first_author?: boolean;
  featured?: boolean;
  award?: LocalizedString;
  tags: string[];
}

export interface ContentData {
  meta: MetaData;
  headline: LocalizedString;
  now: LocalizedString;
  affiliation?: LocalizedString;
  about: LocalizedString;
  bridge: {
    title: LocalizedString;
    text: LocalizedString;
  };
  tags: Record<string, LocalizedString>;
  research_themes: ResearchTheme[];
  projects: Project[];
  lanes: Lane[];
  timeline: TimelineItem[];
  publications: Publication[];
  ui: Record<string, LocalizedString>;
}
