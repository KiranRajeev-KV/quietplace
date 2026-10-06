import { useCallback, useRef, useState } from 'react';
import { Plate, PlateContent, usePlateEditor, type PlateEditor } from 'platejs/react';
import { RangeApi, type Value, type TRange } from 'platejs';
import { toggleList } from '@platejs/list';
import { upsertLink, unwrapLink } from '@platejs/link';
import { CodeBlockPlugin } from '@platejs/code-block/react';
import { editorPlugins } from './plugins';
import { DeskDialog } from '../studio/dialog';
import { uploadMedia } from './media-upload';
import { safeLink } from '../domain/model';
import { Instrument } from './instruments';
import { MarkdownPlugin } from '@platejs/markdown';
import { downloadText } from '../studio/download';
interface Props {
  id: string;
  value: Value;
  onChange: (value: Value) => void;
  disabled?: boolean;
}
export function ManuscriptEditor({ id, value, onChange, disabled = false }: Props) {
  const [link, setLink] = useState<{ url: string; resolve: (value: string | null) => void } | null>(
      null,
    ),
    [selection, setSelection] = useState<TRange | null>(null),
    [image, setImage] = useState(false),
    [file, setFile] = useState<File | null>(null),
    [alt, setAlt] = useState(''),
    [progress, setProgress] = useState<number | null>(null),
    [error, setError] = useState('');
  const rememberedSelection = useRef<TRange | null>(null);
  const requestLink = useCallback(
    (url: string | null) =>
      new Promise<string | null>((resolve) => setLink({ url: url ?? '', resolve })),
    [],
  );
  const editor = usePlateEditor({ id, plugins: editorPlugins(requestLink), value });
  const closeLink = () => {
    link?.resolve(null);
    setLink(null);
    editor.tf.focus();
  };
  function format(action: (editor: PlateEditor) => void) {
    if (selection) editor.tf.select(selection);
    action(editor);
    editor.tf.focus();
  }
  function insertImage() {
    rememberedSelection.current = editor.selection;
    setImage(true);
    setError('');
  }
  function connect() {
    rememberedSelection.current = editor.selection;
    setError('');
    setLink({
      url: '',
      resolve: (url) => {
        if (url && rememberedSelection.current) {
          editor.tf.select(rememberedSelection.current);
          upsertLink(editor, { url, skipValidation: true });
        }
        editor.tf.focus();
      },
    });
  }
  async function upload() {
    if (!file || !alt.trim()) return;
    setError('');
    setProgress(0);
    try {
      const media = await uploadMedia(id, file, alt.trim(), setProgress);
      if (rememberedSelection.current) editor.tf.select(rememberedSelection.current);
      editor.tf.insertNodes([
        {
          type: 'img',
          mediaId: media.id,
          url: media.url,
          width: media.width,
          height: media.height,
          alt: media.alt,
          caption: [{ text: '' }],
          children: [{ text: '' }],
        },
        { type: 'p', children: [{ text: '' }] },
      ]);
      setImage(false);
      setFile(null);
      setAlt('');
      editor.tf.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The image could not be uploaded.');
    } finally {
      setProgress(null);
    }
  }
  return (
    <Plate
      editor={editor}
      onValueChange={({ value: next }) => onChange(next)}
      onSelectionChange={({ selection: next }) => {
        if (next) setSelection(next);
        else setSelection(null);
      }}
      readOnly={disabled}
    >
      <div className="editor-instruments">
        <details className="editor-insert">
          <summary>
            Insert <span aria-hidden="true">＋</span>
          </summary>
          <div aria-label="Insert a block" className="editor-block-menu">
            {[
              ['p', 'Paragraph'],
              ['h2', 'Section heading'],
              ['h3', 'Subheading'],
              ['blockquote', 'Quotation'],
            ].map(([type, label]) => (
              <Instrument
                key={type}
                label={label!}
                disabled={disabled}
                onClick={() => format((e) => e.tf.setNodes({ type }))}
              >
                {label}
              </Instrument>
            ))}
            <Instrument
              label="Bulleted list"
              disabled={disabled}
              onClick={() => format((e) => toggleList(e, { listStyleType: 'disc' }))}
            >
              Bulleted list
            </Instrument>
            <Instrument
              label="Numbered list"
              disabled={disabled}
              onClick={() => format((e) => toggleList(e, { listStyleType: 'decimal' }))}
            >
              Numbered list
            </Instrument>
            <Instrument
              label="Code block"
              disabled={disabled}
              onClick={() => format((e) => e.getTransforms(CodeBlockPlugin).code_block.toggle())}
            >
              Code block
            </Instrument>
            <Instrument
              label="Horizontal rule"
              disabled={disabled}
              onClick={() =>
                format((e) =>
                  e.tf.insertNodes([
                    { type: 'hr', children: [{ text: '' }] },
                    { type: 'p', children: [{ text: '' }] },
                  ]),
                )
              }
            >
              Divider
            </Instrument>
            <Instrument label="Insert image" disabled={disabled} onClick={insertImage}>
              Image & caption
            </Instrument>
            <Instrument
              label="Export Markdown"
              onClick={() =>
                downloadText(
                  'manuscript.md',
                  editor.getApi(MarkdownPlugin).markdown.serialize(),
                  'text/markdown',
                )
              }
            >
              Export Markdown ↓
            </Instrument>
          </div>
        </details>
        <span className="editor-keyboard-hint">MARKDOWN WELCOME</span>
        <div className="editor-history">
          <Instrument label="Undo" disabled={disabled} onClick={() => editor.undo()}>
            ↶
          </Instrument>
          <Instrument label="Redo" disabled={disabled} onClick={() => editor.redo()}>
            ↷
          </Instrument>
        </div>
        {selection && RangeApi.isExpanded(selection) && (
          <div
            className="editor-selection-tools"
            role="toolbar"
            tabIndex={-1}
            aria-label="Text formatting"
            onKeyDown={(e) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
              const buttons = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('button')],
                index = buttons.indexOf(document.activeElement as HTMLButtonElement);
              e.preventDefault();
              buttons[
                e.key === 'Home'
                  ? 0
                  : e.key === 'End'
                    ? buttons.length - 1
                    : (index + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length
              ]?.focus();
            }}
          >
            <Instrument
              label="Bold"
              disabled={disabled}
              onClick={() => format((e) => e.tf.toggleMark('bold'))}
            >
              B
            </Instrument>
            <Instrument
              label="Italic"
              disabled={disabled}
              onClick={() => format((e) => e.tf.toggleMark('italic'))}
            >
              I
            </Instrument>
            <Instrument
              label="Inline code"
              disabled={disabled}
              onClick={() => format((e) => e.tf.toggleMark('code'))}
            >
              〈/〉
            </Instrument>
            <Instrument label="Link" disabled={disabled} onClick={connect}>
              Link ↗
            </Instrument>
            <Instrument
              label="Remove link"
              disabled={disabled}
              onClick={() =>
                format((e) => {
                  unwrapLink(e);
                })
              }
            >
              Unlink
            </Instrument>
          </div>
        )}
      </div>
      <PlateContent
        className="manuscript manuscript-editable"
        aria-label="Manuscript body"
        placeholder="Give the thought a little room…"
        spellCheck
        disabled={disabled}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            connect();
          }
        }}
        onPaste={(e) => {
          const pasted = e.clipboardData.files[0];
          if (pasted?.type.startsWith('image/')) {
            e.preventDefault();
            setFile(pasted);
            insertImage();
          }
        }}
        onDrop={(e) => {
          const dropped = e.dataTransfer.files[0];
          if (dropped?.type.startsWith('image/')) {
            e.preventDefault();
            setFile(dropped);
            insertImage();
          }
        }}
      />
      {link && (
        <DeskDialog title="A connection" onClose={closeLink}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!safeLink(link.url)) {
                setError('Use an https, http, mailto, or internal address.');
                return;
              }
              link.resolve(link.url);
              setLink(null);
              setError('');
            }}
          >
            <label className="desk-field">
              LINK ADDRESS
              <input
                type="text"
                value={link.url}
                placeholder="https://…"
                onChange={(e) => setLink({ ...link, url: e.target.value })}
                required
              />
            </label>
            {error && <p role="alert">{error}</p>}
            <button className="desk-primary" type="submit">
              Connect ↗
            </button>
          </form>
        </DeskDialog>
      )}
      {image && (
        <DeskDialog
          title="An image, considered"
          onClose={() => {
            if (progress === null) setImage(false);
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void upload();
            }}
          >
            <label className="desk-field">
              IMAGE
              <input
                aria-label="Choose image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                disabled={progress !== null}
                required={!file}
              />
              {file && <span>{file.name}</span>}
            </label>
            <label className="desk-field">
              DESCRIBE IT FOR SOMEONE WHO CANNOT SEE IT
              <textarea
                aria-label="Alt text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                maxLength={600}
                required
                disabled={progress !== null}
              />
            </label>
            <p className="desk-help">
              Images are resized to 2400 px and stored as WebP. A caption can be added on the page.
            </p>
            {progress !== null && (
              <div role="status">
                <progress value={progress} max={100} />
                <span>Preparing & storing · {progress}%</span>
              </div>
            )}
            {error && (
              <p role="alert" className="desk-error">
                {error}
              </p>
            )}
            <button
              className="desk-primary"
              type="submit"
              disabled={!file || !alt.trim() || progress !== null}
            >
              {error ? 'Try again ↗' : progress !== null ? 'Placing the image…' : 'Place image ↗'}
            </button>
          </form>
        </DeskDialog>
      )}
    </Plate>
  );
}
