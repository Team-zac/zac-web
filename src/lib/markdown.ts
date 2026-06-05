const dangerousProtocolPattern = /\b(?:javascript|data|vbscript):/gi;
const htmlTagPattern = /<\/?[^>\n]+>/g;
const controlCharacterPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeMarkdown(value: string) {
  return value
    .replace(controlCharacterPattern, "")
    .replace(dangerousProtocolPattern, "")
    .replace(htmlTagPattern, "")
    .slice(0, 100_000);
}

export function sanitizeMarkdownLine(value: string) {
  return sanitizeMarkdown(value).trim();
}
