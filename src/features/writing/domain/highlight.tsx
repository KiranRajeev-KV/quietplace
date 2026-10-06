import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import type { ReactNode } from 'react';

export const highlighter = createLowlight({
  javascript,
  typescript,
  python,
  bash,
  css,
  html: xml,
  json,
  sql,
});
export const codeLanguages = [
  'text',
  'typescript',
  'javascript',
  'python',
  'bash',
  'css',
  'html',
  'json',
  'sql',
] as const;
type SyntaxNode = {
  type: string;
  value?: string;
  properties?: { className?: string[] };
  children?: SyntaxNode[];
};
function renderToken(node: SyntaxNode, key: number): ReactNode {
  if (node.type === 'text') return node.value;
  return (
    <span key={key} className={node.properties?.className?.join(' ')}>
      {node.children?.map(renderToken)}
    </span>
  );
}
export function highlightedCode(code: string, language: string): ReactNode {
  if (!highlighter.registered(language)) return code;
  try {
    return highlighter.highlight(language, code).children.map(renderToken);
  } catch {
    return code;
  }
}
