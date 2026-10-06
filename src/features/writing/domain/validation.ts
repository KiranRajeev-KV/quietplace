import type { Value } from 'platejs';
import { z } from 'zod';
import { documentTypes } from './schema';
import { safeLink, writingKinds } from './model';
function validDocument(value: unknown): value is Value {
  let count = 0;
  function validNode(node: unknown, depth: number): boolean {
    if (depth > 12 || ++count > 12000 || !node || typeof node !== 'object') return false;
    const n = node as Record<string, unknown>;
    if (typeof n.text === 'string')
      return (
        n.text.length <= 100000 &&
        ['bold', 'italic', 'code'].every(
          (key) => n[key] === undefined || typeof n[key] === 'boolean',
        )
      );
    if (
      typeof n.type !== 'string' ||
      !documentTypes.has(n.type) ||
      !Array.isArray(n.children) ||
      n.children.length > 12000
    )
      return false;
    if (n.type === 'a' && (typeof n.url !== 'string' || !safeLink(n.url))) return false;
    if (
      n.indent !== undefined &&
      (!Number.isInteger(n.indent) || Number(n.indent) < 0 || Number(n.indent) > 6)
    )
      return false;
    if (
      n.listStyleType !== undefined &&
      ![
        'disc',
        'circle',
        'square',
        'decimal',
        'lower-alpha',
        'upper-alpha',
        'lower-roman',
        'upper-roman',
      ].includes(String(n.listStyleType))
    )
      return false;
    if (
      n.listStart !== undefined &&
      (!Number.isInteger(n.listStart) || Number(n.listStart) < 1 || Number(n.listStart) > 10000)
    )
      return false;
    if (n.lang !== undefined && (typeof n.lang !== 'string' || n.lang.length > 40)) return false;
    if (n.filename !== undefined && (typeof n.filename !== 'string' || n.filename.length > 180))
      return false;
    if (n.alt !== undefined && (typeof n.alt !== 'string' || n.alt.length > 600)) return false;
    if (
      n.caption !== undefined &&
      (!Array.isArray(n.caption) ||
        n.caption.length > 50 ||
        !n.caption.every(
          (leaf) =>
            leaf &&
            typeof leaf === 'object' &&
            typeof leaf.text === 'string' &&
            leaf.text.length <= 6000,
        ))
    )
      return false;
    if (
      n.type === 'img' &&
      (typeof n.mediaId !== 'string' ||
        !/^[-\w]{20,64}$/.test(n.mediaId) ||
        typeof n.width !== 'number' ||
        typeof n.height !== 'number' ||
        n.width <= 0 ||
        n.height <= 0 ||
        n.width > 2400 ||
        n.height > 2400)
    )
      return false;
    return n.children.every((child) => validNode(child, depth + 1));
  }
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 4000 &&
    value.every((node) => validNode(node, 0)) &&
    JSON.stringify(value).length <= 500000
  );
}
export const manuscriptSchema = z.object({
  title: z.string().max(180),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  subtitle: z.string().max(360),
  description: z.string().max(600),
  kind: z.enum(writingKinds),
  topics: z.array(z.string().min(1).max(40)).max(8),
  content: z.custom<Value>(validDocument, 'Unsupported or oversized document'),
  coverId: z.string().nullable(),
  seoTitle: z.string().max(180),
  seoDescription: z.string().max(360),
});
