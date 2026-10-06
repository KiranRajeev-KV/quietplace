import type { Value } from 'platejs';
export const writingKinds = [
  'note',
  'weeknote',
  'essay',
  'technical',
  'build-log',
  'project-note',
  'article',
] as const;
export type WritingKind = (typeof writingKinds)[number];
export const kindLabels: Record<WritingKind, string> = {
  note: 'Note',
  weeknote: 'Weeknote',
  essay: 'Essay',
  technical: 'Technical article',
  'build-log': 'Build log',
  'project-note': 'Project note',
  article: 'Article',
};
export interface Manuscript {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  kind: WritingKind;
  topics: string[];
  content: Value;
  coverId: string | null;
  seoTitle: string;
  seoDescription: string;
}
export interface Writing extends Manuscript {
  id: string;
  revision: number;
  publishedRevision: number | null;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  lastPublishedAt: string | null;
  isSample: boolean;
  slugLocked: boolean;
}
export interface Publication extends Manuscript {
  id: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  wordCount: number;
}
export type WritingSummary = Omit<
  Publication,
  'content' | 'seoTitle' | 'seoDescription' | 'coverId'
>;
export interface AuthorSession {
  authenticated: boolean;
  authorized: boolean;
  displayName: string | null;
}
export interface MediaRecord {
  id: string;
  url: string;
  width: number;
  height: number;
  size: number;
  alt: string;
}
export function safeLink(url: string) {
  return (
    /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(url) &&
    ![...url].some((char) => char.charCodeAt(0) < 32)
  );
}
const emptyDocument: Value = [{ type: 'p', children: [{ text: '' }] }];
export function summaryOf({
  content: _,
  seoTitle: __,
  seoDescription: ___,
  coverId: ____,
  ...summary
}: Publication): WritingSummary {
  void _;
  void __;
  void ___;
  void ____;
  return summary;
}
export function toManuscript(value: Manuscript): Manuscript {
  const {
    title,
    slug,
    subtitle,
    description,
    kind,
    topics,
    content,
    coverId,
    seoTitle,
    seoDescription,
  } = value;
  return {
    title,
    slug,
    subtitle,
    description,
    kind,
    topics,
    content,
    coverId,
    seoTitle,
    seoDescription,
  };
}
export function newManuscript(id: string): Manuscript {
  return {
    title: '',
    slug: `untitled-${id.slice(0, 8)}`,
    subtitle: '',
    description: '',
    kind: 'note',
    topics: [],
    content: structuredClone(emptyDocument),
    coverId: null,
    seoTitle: '',
    seoDescription: '',
  };
}
export function slugify(title: string) {
  return (
    title
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100)
      .replace(/-$/, '') || 'untitled'
  );
}
export function plainText(content: Value): string {
  const nodeText = (node: Record<string, unknown>): string =>
    typeof node.text === 'string'
      ? node.text
      : Array.isArray(node.children)
        ? node.children
            .map((child) => nodeText(child as Record<string, unknown>))
            .join(node.type === 'code_block' ? '\n' : '')
        : '';
  return content.map((node) => nodeText(node)).join('\n\n');
}
export function readingStats(content: Value) {
  const wordCount = plainText(content).trim().split(/\s+/).filter(Boolean).length;
  return { wordCount, readingMinutes: Math.max(1, Math.ceil(wordCount / 220)) };
}
export function excerpt(manuscript: Manuscript) {
  if (manuscript.description.trim()) return manuscript.description.trim();
  const text = plainText(manuscript.content).replace(/\s+/g, ' ').trim();
  if (text.length <= 180) return text;
  const start = text.slice(0, 180),
    boundary = start.lastIndexOf(' ');
  return `${(boundary > 0 ? start.slice(0, boundary) : start).replace(/[.,;:]$/, '')}…`;
}
export function mediaIds(manuscript: Manuscript) {
  const ids = new Set<string>();
  if (manuscript.coverId) ids.add(manuscript.coverId);
  const visit = (nodes: Value) => {
    for (const node of nodes) {
      if (node.type === 'img' && typeof node.mediaId === 'string') ids.add(node.mediaId);
      if (Array.isArray(node.children)) visit(node.children as Value);
    }
  };
  visit(manuscript.content);
  return [...ids];
}
