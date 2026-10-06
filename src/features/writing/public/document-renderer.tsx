import { useMemo, useState } from 'react';
import {
  createStaticEditor,
  PlateStatic,
  SlateElement,
  SlateLeaf,
  type SlateElementProps,
  type SlateLeafProps,
} from 'platejs/static';
import { BaseParagraphPlugin, type Value } from 'platejs';
import {
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseCodePlugin,
} from '@platejs/basic-nodes';
import { BaseLinkPlugin } from '@platejs/link';
import { BaseImagePlugin } from '@platejs/media';
import { BaseCodeBlockPlugin, BaseCodeLinePlugin } from '@platejs/code-block';
import { captionText, codeText, headings } from '../domain/document';
import { highlightedCode } from '../domain/highlight';
import { safeLink } from '../domain/model';
import { Link } from '@tanstack/react-router';

function Paragraph(props: SlateElementProps) {
  const list = props.element.listStyleType;
  if (list) {
    const ordered = list !== 'disc' && list !== 'circle' && list !== 'square';
    const Tag = ordered ? 'ol' : 'ul';
    return (
      <Tag
        className="manuscript-list"
        start={ordered ? Number(props.element.listStart ?? 1) : undefined}
        style={{
          marginInlineStart: `${Math.max(0, Math.min(6, Number(props.element.indent ?? 1)) - 1) * 1.2}em`,
        }}
      >
        <SlateElement {...props} as="li" />
      </Tag>
    );
  }
  return <SlateElement {...props} as="p" />;
}
function H2(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      as="h2"
      attributes={{ ...props.attributes, id: String(props.element.id) }}
    />
  );
}
function H3(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      as="h3"
      attributes={{ ...props.attributes, id: String(props.element.id) }}
    />
  );
}
function H4(props: SlateElementProps) {
  return <SlateElement {...props} as="h4" />;
}
function Quote(props: SlateElementProps) {
  return <SlateElement {...props} as="blockquote" />;
}
function Rule(props: SlateElementProps) {
  return (
    <SlateElement {...props} as="div">
      <hr />
      {props.children}
    </SlateElement>
  );
}
function LinkElement(props: SlateElementProps) {
  const url = String(props.element.url ?? '');
  if ((url.startsWith('/') && !url.startsWith('//')) || url.startsWith('#')) {
    const [path, hash] = url.split('#'),
      base = import.meta.env.BASE_URL;
    const to = path
      ? base !== '/' && path.startsWith(base)
        ? `/${path.slice(base.length)}`
        : path
      : '.';
    return (
      <SlateElement {...props} as="span">
        <Link to={to} hash={hash} resetScroll={!hash}>
          {props.children}
        </Link>
      </SlateElement>
    );
  }
  return (
    <SlateElement
      {...props}
      as="a"
      attributes={{
        ...props.attributes,
        href: safeLink(url) ? url : undefined,
        rel: /^https?:/.test(url) ? 'noreferrer' : undefined,
      }}
    />
  );
}
function Strong(props: SlateLeafProps) {
  return <SlateLeaf {...props} as="strong" />;
}
function Emphasis(props: SlateLeafProps) {
  return <SlateLeaf {...props} as="em" />;
}
function InlineCode(props: SlateLeafProps) {
  return <SlateLeaf {...props} as="code" />;
}
function ImageElement(props: SlateElementProps) {
  const e = props.element,
    caption = captionText(e);
  return (
    <SlateElement {...props} as="figure" className="manuscript-image">
      <img
        src={`${import.meta.env.BASE_URL}media/${String(e.mediaId)}`}
        alt={String(e.alt ?? '')}
        width={Number(e.width)}
        height={Number(e.height)}
        loading="lazy"
        decoding="async"
      />
      {caption && <figcaption>{caption}</figcaption>}
      <span hidden>{props.children}</span>
    </SlateElement>
  );
}
function CodeBlock(props: SlateElementProps) {
  const [copied, setCopied] = useState(false),
    [failed, setFailed] = useState(false);
  const code = codeText(props.element),
    language = String(props.element.lang ?? 'text'),
    filename = String(props.element.filename ?? '');
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setFailed(false);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setFailed(true);
    }
  }
  // A named overflow region must be focusable for keyboard horizontal scrolling.
  // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
  return (
    <SlateElement {...props} as="figure" className="manuscript-code">
      <figcaption>
        <span>
          {filename || language}
          <span className="code-language">{filename ? language : ''}</span>
        </span>
        <button type="button" onClick={() => void copy()} aria-label="Copy code">
          {copied ? 'Copied ✓' : failed ? 'Select to copy' : 'Copy ↗'}
        </button>
      </figcaption>
      <pre
        // Keyboard readers must be able to scroll an overflowing code example.
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="region"
        aria-label={`${language} code${filename ? ` in ${filename}` : ''}`}
      >
        <code>{highlightedCode(code, language)}</code>
      </pre>
      <span hidden>{props.children}</span>
      <span className="sr-only" role="status">
        {copied
          ? 'Code copied.'
          : failed
            ? 'Clipboard unavailable. Select the code to copy it.'
            : ''}
      </span>
    </SlateElement>
  );
}
const staticPlugins = [
  BaseParagraphPlugin.withComponent(Paragraph),
  BaseH2Plugin.withComponent(H2),
  BaseH3Plugin.withComponent(H3),
  BaseH4Plugin.withComponent(H4),
  BaseBlockquotePlugin.withComponent(Quote),
  BaseHorizontalRulePlugin.withComponent(Rule),
  BaseBoldPlugin.withComponent(Strong),
  BaseItalicPlugin.withComponent(Emphasis),
  BaseCodePlugin.withComponent(InlineCode),
  BaseLinkPlugin.withComponent(LinkElement),
  BaseImagePlugin.withComponent(ImageElement),
  BaseCodeBlockPlugin.withComponent(CodeBlock),
  BaseCodeLinePlugin,
];
export function DocumentRenderer({ content }: { content: Value }) {
  const editor = useMemo(() => {
    const ids = headings(content);
    const value = content.map((node, index) => ({
      ...node,
      ...(ids.find((h) => h.index === index) ? { id: ids.find((h) => h.index === index)!.id } : {}),
    }));
    return createStaticEditor({ plugins: staticPlugins, value });
  }, [content]);
  return <PlateStatic editor={editor} className="manuscript" />;
}
