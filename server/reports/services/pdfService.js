import MarkdownIt from 'markdown-it';
import puppeteer from 'puppeteer';

// Pdf service helpers.

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildHtml = ({ title, markdown, meta }) => {
  const contentHtml = md.render(markdown || '');
  const createdAt = meta?.createdAt ? new Date(meta.createdAt).toLocaleString() : 'N/A';
  const totalAnalyzed = meta?.totalAnalyzed ?? 'N/A';
  const sentiment = meta?.sentiment?.overall || 'N/A';
  const safeTitle = escapeHtml(title);
  const safeSentiment = escapeHtml(sentiment);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
    <style>
      :root {
        color-scheme: light;
      }
      @page {
        margin: 1in 0.9in 1in 0.9in;
      }
      * {
        box-sizing: border-box;
      }
      body {
        font-family: "Georgia", "Times New Roman", serif;
        font-size: 12.5pt;
        line-height: 1.55;
        color: #111;
        margin: 0;
      }
      .header {
        border-bottom: 2px solid #222;
        padding-bottom: 12px;
        margin-bottom: 20px;
      }
      .title {
        font-size: 24pt;
        margin: 0 0 6px 0;
        letter-spacing: 0.2px;
      }
      .meta {
        font-family: "Helvetica Neue", Arial, sans-serif;
        font-size: 10.5pt;
        color: #444;
        display: flex;
        flex-wrap: wrap;
        gap: 10px 18px;
      }
      .meta span {
        white-space: nowrap;
      }
      h1, h2, h3, h4 {
        font-family: "Helvetica Neue", Arial, sans-serif;
        color: #111;
        margin: 22px 0 10px;
      }
      h1 { font-size: 20pt; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
      h2 { font-size: 16pt; }
      h3 { font-size: 13.5pt; }
      h4 { font-size: 12.5pt; text-transform: uppercase; letter-spacing: 0.06em; }
      p { margin: 10px 0; }
      ul, ol {
        margin: 10px 0 10px 20px;
        padding: 0;
      }
      li { margin: 6px 0; }
      blockquote {
        margin: 12px 0;
        padding: 8px 16px;
        border-left: 3px solid #333;
        background: #f6f6f6;
      }
      code {
        font-family: "SFMono-Regular", Menlo, Consolas, monospace;
        font-size: 11pt;
        background: #f3f3f3;
        padding: 1px 4px;
        border-radius: 3px;
      }
      pre {
        background: #f3f3f3;
        padding: 12px;
        border-radius: 6px;
        overflow-wrap: anywhere;
        white-space: pre-wrap;
      }
      hr {
        border: none;
        border-top: 1px solid #ddd;
        margin: 18px 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 6px 8px;
        text-align: left;
      }
      .content {
        page-break-inside: auto;
      }
      .content h1, .content h2, .content h3 {
        page-break-after: avoid;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1 class="title">${safeTitle}</h1>
      <div class="meta">
        <span><strong>Generated:</strong> ${createdAt}</span>
        <span><strong>Overall sentiment:</strong> ${safeSentiment}</span>
        <span><strong>Total analyzed:</strong> ${totalAnalyzed}</span>
      </div>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
  </body>
</html>`;
};

export const generateReportPdf = async ({ title, markdown, meta }) => {
  const html = buildHtml({ title, markdown, meta });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    return buffer;
  } finally {
    await browser.close();
  }
};
