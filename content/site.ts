// Set NEXT_PUBLIC_SITE_URL to the deployed origin for canonical and social URLs.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  'https://kr-quiet-systems.kiranrajeevkv.chatgpt.site'
).replace(/\/$/, '');
