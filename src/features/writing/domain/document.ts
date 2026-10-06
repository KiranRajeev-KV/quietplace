import type { TElement, Value } from 'platejs';
import { slugify } from './model';
function elementText(element: TElement): string {
  const visit = (node: Record<string, unknown>): string =>
    typeof node.text === 'string'
      ? node.text
      : Array.isArray(node.children)
        ? node.children.map((n) => visit(n as Record<string, unknown>)).join('')
        : '';
  return visit(element);
}
export function codeText(element: TElement) {
  return element.children.map((n) => elementText(n as TElement)).join('\n');
}
export function captionText(element: TElement) {
  return Array.isArray(element.caption)
    ? element.caption
        .map((n) => (typeof n === 'object' && n && 'text' in n ? String(n.text) : ''))
        .join('')
    : '';
}
export function headings(content: Value) {
  const counts = new Map<string, number>();
  return content.flatMap((node, index) => {
    if (node.type !== 'h2' && node.type !== 'h3') return [];
    const title = elementText(node),
      slug = slugify(title),
      count = counts.get(slug) ?? 0;
    counts.set(slug, count + 1);
    return [
      {
        index,
        title,
        level: node.type === 'h2' ? 2 : 3,
        id: `section-${slug}${count ? `-${count + 1}` : ''}`,
      },
    ];
  });
}
export function titleTransition(id: string) {
  return `writing-${id.replace(/[^a-zA-Z0-9-]/g, '')}`;
}
