import {
  PlateElement,
  PlateLeaf,
  type PlateElementProps,
  type PlateLeafProps,
} from 'platejs/react';
import { CaptionTextarea } from '@platejs/caption/react';
import { codeLanguages } from '../domain/highlight';
export function Paragraph(props: PlateElementProps) {
  return <PlateElement {...props} as={props.element.listStyleType ? 'div' : 'p'} />;
}
export function H2(props: PlateElementProps) {
  return <PlateElement {...props} as="h2" />;
}
export function H3(props: PlateElementProps) {
  return <PlateElement {...props} as="h3" />;
}
export function H4(props: PlateElementProps) {
  return <PlateElement {...props} as="h4" />;
}
export function Quote(props: PlateElementProps) {
  return <PlateElement {...props} as="blockquote" />;
}
export function Rule(props: PlateElementProps) {
  return (
    <PlateElement {...props} as="div">
      <div contentEditable={false}>
        <hr />
      </div>
      {props.children}
    </PlateElement>
  );
}
export function LinkElement(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="a"
      attributes={{ ...props.attributes, href: String(props.element.url ?? '') }}
    />
  );
}
export function Strong(props: PlateLeafProps) {
  return <PlateLeaf {...props} as="strong" />;
}
export function Emphasis(props: PlateLeafProps) {
  return <PlateLeaf {...props} as="em" />;
}
export function InlineCode(props: PlateLeafProps) {
  return <PlateLeaf {...props} as="code" />;
}
export function Syntax(props: PlateLeafProps) {
  return <PlateLeaf {...props} as="span" className={String(props.leaf.className ?? '')} />;
}
export function CodeLine(props: PlateElementProps) {
  return <PlateElement {...props} as="div" className="editor-code-line" />;
}
export function CodeBlock(props: PlateElementProps) {
  const { element, editor, path } = props;
  return (
    <PlateElement {...props} as="figure" className="manuscript-code editor-code">
      <figcaption contentEditable={false}>
        <input
          aria-label="Code filename"
          placeholder="Optional filename"
          value={String(element.filename ?? '')}
          onChange={(e) => editor.tf.setNodes({ filename: e.target.value }, { at: path })}
        />
        <select
          aria-label="Code language"
          value={String(element.lang ?? 'text')}
          onChange={(e) => editor.tf.setNodes({ lang: e.target.value }, { at: path })}
        >
          {codeLanguages.map((lang) => (
            <option key={lang}>{lang}</option>
          ))}
        </select>
      </figcaption>
      <pre>
        <code>{props.children}</code>
      </pre>
    </PlateElement>
  );
}
export function ImageElement(props: PlateElementProps) {
  const { element, editor, path } = props;
  return (
    <PlateElement {...props} as="figure" className="manuscript-image editor-image">
      <div contentEditable={false}>
        <img
          src={`${import.meta.env.BASE_URL}media/${String(element.mediaId)}`}
          alt={String(element.alt ?? '')}
          width={Number(element.width)}
          height={Number(element.height)}
          decoding="async"
        />
        <details className="image-description">
          <summary>Image description</summary>
          <label>
            ALT TEXT
            <input
              aria-label="Image alt text"
              value={String(element.alt ?? '')}
              maxLength={600}
              onChange={(e) => editor.tf.setNodes({ alt: e.target.value }, { at: path })}
            />
          </label>
        </details>
        <figcaption>
          <CaptionTextarea
            aria-label="Image caption"
            placeholder="A caption, if it adds something."
          />
        </figcaption>
      </div>
      {props.children}
    </PlateElement>
  );
}
