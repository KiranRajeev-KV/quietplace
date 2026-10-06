import { ParagraphPlugin } from 'platejs/react';
import {
  HeadingPlugin,
  H2Plugin,
  H3Plugin,
  H4Plugin,
  BlockquotePlugin,
  HorizontalRulePlugin,
  BoldPlugin,
  ItalicPlugin,
  CodePlugin,
} from '@platejs/basic-nodes/react';
import {
  HeadingRules,
  BlockquoteRules,
  HorizontalRuleRules,
  BoldRules,
  ItalicRules,
  CodeRules,
} from '@platejs/basic-nodes';
import { CodeBlockPlugin, CodeLinePlugin, CodeSyntaxPlugin } from '@platejs/code-block/react';
import { CodeBlockRules } from '@platejs/code-block';
import { LinkPlugin } from '@platejs/link/react';
import { LinkRules } from '@platejs/link';
import { IndentPlugin } from '@platejs/indent/react';
import { ListPlugin } from '@platejs/list/react';
import { BulletedListRules, OrderedListRules } from '@platejs/list';
import { ImagePlugin } from '@platejs/media/react';
import { CaptionPlugin } from '@platejs/caption/react';
import { MarkdownPlugin } from '@platejs/markdown';
import { highlighter } from '../domain/highlight';
import { safeLink } from '../domain/model';
import * as Node from './elements';
export function editorPlugins(getLinkUrl: (previous: string | null) => Promise<string | null>) {
  return [
    ParagraphPlugin.withComponent(Node.Paragraph),
    HeadingPlugin.configure({ options: { levels: [2, 3, 4] } }),
    H2Plugin.configure({ inputRules: [HeadingRules.markdown()] }).withComponent(Node.H2),
    H3Plugin.configure({ inputRules: [HeadingRules.markdown()] }).withComponent(Node.H3),
    H4Plugin.configure({ inputRules: [HeadingRules.markdown()] }).withComponent(Node.H4),
    BlockquotePlugin.configure({ inputRules: [BlockquoteRules.markdown()] }).withComponent(
      Node.Quote,
    ),
    HorizontalRulePlugin.configure({ inputRules: [HorizontalRuleRules.markdown()] }).withComponent(
      Node.Rule,
    ),
    BoldPlugin.configure({ inputRules: [BoldRules.markdown()] }).withComponent(Node.Strong),
    ItalicPlugin.configure({ inputRules: [ItalicRules.markdown()] }).withComponent(Node.Emphasis),
    CodePlugin.configure({ inputRules: [CodeRules.markdown()] }).withComponent(Node.InlineCode),
    LinkPlugin.configure({
      options: {
        getLinkUrl,
        // Automatic recognition must not consume Markdown markers such as ##.
        // The deliberate link instrument separately permits internal addresses.
        isUrl: (url) => /^(https?:\/\/|mailto:)/i.test(url) && safeLink(url),
        allowedSchemes: ['https', 'http', 'mailto'],
        triggerFloatingLinkHotkeys: '',
      },
      inputRules: [
        LinkRules.markdown(),
        LinkRules.autolink({ variant: 'paste' }),
        LinkRules.autolink({ variant: 'space' }),
      ],
    }).withComponent(Node.LinkElement),
    CodeBlockPlugin.configure({
      options: { lowlight: highlighter, defaultLanguage: 'text' },
      inputRules: [CodeBlockRules.markdown({ on: 'match' })],
    }).withComponent(Node.CodeBlock),
    CodeLinePlugin.withComponent(Node.CodeLine),
    CodeSyntaxPlugin.withComponent(Node.Syntax),
    IndentPlugin.configure({
      options: { indentMax: 6 },
      inject: { targetPlugins: ['p', 'h2', 'h3', 'h4', 'blockquote'] },
    }),
    ListPlugin.configure({
      inputRules: [BulletedListRules.markdown(), OrderedListRules.markdown()],
    }),
    ImagePlugin.configure({
      options: { disableEmbedInsert: true, disableUploadInsert: true },
    }).withComponent(Node.ImageElement),
    CaptionPlugin.configure({ options: { query: { allow: ['img'] } } }),
    MarkdownPlugin.configure({
      options: {
        disallowedNodes: [
          'img',
          'h1',
          'h5',
          'h6',
          'table',
          'media_embed',
          'audio',
          'video',
          'file',
        ],
      },
    }),
  ];
}
