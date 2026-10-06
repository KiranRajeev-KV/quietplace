// Both Plate registries and boundary validation use this vocabulary. Adding a
// node requires an editable and static component, plus a serialization fixture.
export const writingSchema = {
  version: 1,
  blocks: ['p', 'h2', 'h3', 'h4', 'blockquote', 'hr', 'code_block', 'code_line', 'img'],
  inline: ['a'],
  marks: ['bold', 'italic', 'code'],
} as const;
export const documentTypes = new Set<string>([...writingSchema.blocks, ...writingSchema.inline]);
