const PDFDocument = require('pdfkit');

// Brand tokens — mirrors client/src/index.css so the PDF matches the app.
const BRAND = '#1D4ED8';
const BRAND_2 = '#0D9488';
const INK = '#101828';
const INK_SOFT = '#475467';
const MUTED = '#98A2B3';
const GROWTH = '#16A34A';
const RUST = '#DC2626';
const GOLD = '#B4830D';
const LINE = '#E4E7EC';
const PAGE_W = 595.28; // A4 points
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Draws the WealthFlow mark (ascending bars + trend line) at (x, y) with the
// given size — same geometry as client/src/components/Logo.jsx, redrawn in
// pdfkit's vector API so the PDF carries real brand identity, not just text.
function drawLogo(doc, x, y, size = 28) {
  const s = size / 40;
  doc.save();
  doc.roundedRect(x, y, size, size, 11 * s).fill(BRAND_2);
  doc.rect(x + 9 * s, y + 22 * s, 5 * s, 10 * s).fill('white');
  doc.rect(x + 17.5 * s, y + 16 * s, 5 * s, 16 * s).fill('white');
  doc.rect(x + 26 * s, y + 10 * s, 5 * s, 22 * s).fill('white');
  doc.moveTo(x + 8 * s, y + 21 * s).lineTo(x + 17 * s, y + 14 * s).lineTo(x + 25.5 * s, y + 9 * s)
    .lineWidth(1.6 * s).strokeOpacity(0.9).stroke('white');
  doc.circle(x + 25.5 * s, y + 9 * s, 2.3 * s).fill('white');
  doc.restore();
}

function sectionHeading(doc, text, y) {
  doc.fontSize(12).fillColor(INK).font('Helvetica-Bold').text(text, MARGIN, y);
  const textWidth = doc.widthOfString(text);
  doc.moveTo(MARGIN + textWidth + 10, y + 6).lineTo(MARGIN + CONTENT_W, y + 6).lineWidth(1).strokeColor(LINE).stroke();
  return y + 24;
}

function buildMonthlyReportPDF({ user, month, totals, spendingBreakdown, goals, habits, insights }) {
  const doc = new PDFDocument({ margin: MARGIN, size: 'A4', bufferPages: true });

  // PDFKit's standard (non-embedded) fonts have no glyph for ₹ (U+20B9) —
  // it silently renders as nothing, producing "65,000" instead of "₹65,000".
  // "Rs." is the standard fallback used on printed Indian financial
  // documents for exactly this reason, so it reads correctly either way.
  const currencyPrefix = user.currency === 'INR' ? 'Rs. ' : user.currency ? `${user.currency} ` : '';
  const fmt = (n) => `${currencyPrefix}${Number(n || 0).toLocaleString('en-IN')}`;

  // ---- Header band ----
  const headerH = 92;
  doc.save();
  doc.rect(0, 0, PAGE_W, headerH).fill(BRAND);
  // subtle diagonal teal wash for depth
  doc.save();
  doc.rect(0, 0, PAGE_W, headerH).clip();
  doc.circle(PAGE_W - 40, headerH - 10, 90).fillOpacity(0.18).fill(BRAND_2);
  doc.restore();
  doc.restore();

  drawLogo(doc, MARGIN, 28, 32);
  doc.fillColor('white').font('Helvetica-Bold').fontSize(18).text('WealthFlow', MARGIN + 42, 32);
  doc.font('Helvetica').fontSize(9).fillColor('#E0E7FF').text('Financial Habit Builder & Wealth Growth Tracker', MARGIN + 42, 54);

  doc.font('Helvetica-Bold').fontSize(11).fillColor('white').text(month, MARGIN, 32, { width: CONTENT_W, align: 'right' });
  doc.font('Helvetica').fontSize(9).fillColor('#E0E7FF').text(`${user.name}`, MARGIN, 50, { width: CONTENT_W, align: 'right' });
  doc.fontSize(8).fillColor('#C7D2FE').text(`Generated ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, MARGIN, 64, { width: CONTENT_W, align: 'right' });

  let y = headerH + 28;

  // ---- KPI strip (4 boxes) ----
  const kpis = [
    { label: 'Total Income', value: fmt(totals.totalIncome), color: GROWTH },
    { label: 'Total Expenses', value: fmt(totals.totalExpenses), color: RUST },
    { label: 'Total Savings', value: fmt(totals.totalSavings), color: GOLD },
    { label: 'Net Worth', value: fmt(totals.netWorth), color: BRAND },
  ];
  const boxW = (CONTENT_W - 3 * 10) / 4;
  kpis.forEach((k, i) => {
    const bx = MARGIN + i * (boxW + 10);
    doc.roundedRect(bx, y, boxW, 58, 8).fillOpacity(1).fillAndStroke('#F9FAFB', LINE);
    doc.rect(bx, y, 3, 58).fill(k.color);
    doc.fillColor(MUTED).font('Helvetica').fontSize(8).text(k.label.toUpperCase(), bx + 12, y + 10, { width: boxW - 20 });
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(13).text(k.value, bx + 12, y + 26, { width: boxW - 20 });
  });
  y += 58 + 12;
  doc.fillColor(INK_SOFT).font('Helvetica').fontSize(9).text(`Savings rate this period: ${totals.savingsRate}%`, MARGIN, y);
  y += 26;

  // ---- Top expense categories (bar-style rows) ----
  y = sectionHeading(doc, 'Top Expense Categories', y);
  const sorted = Object.entries(spendingBreakdown || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (sorted.length === 0) {
    doc.font('Helvetica').fontSize(10).fillColor(MUTED).text('No expenses recorded this period.', MARGIN, y);
    y += 20;
  } else {
    const maxAmt = Math.max(...sorted.map(([, v]) => v));
    sorted.forEach(([cat, amt], i) => {
      const rowY = y + i * 20;
      doc.font('Helvetica').fontSize(9.5).fillColor(INK_SOFT).text(cat, MARGIN, rowY + 3, { width: 130 });
      const barMaxW = CONTENT_W - 130 - 70;
      const barW = Math.max(4, (amt / maxAmt) * barMaxW);
      doc.roundedRect(MARGIN + 130, rowY, barW, 10, 3).fill(BRAND);
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(INK).text(fmt(amt), MARGIN + CONTENT_W - 65, rowY + 1, { width: 65, align: 'right' });
    });
    y += sorted.length * 20 + 10;
  }

  // ---- Goal progress ----
  y = sectionHeading(doc, 'Goal Progress', y);
  if (!goals || goals.length === 0) {
    doc.font('Helvetica').fontSize(10).fillColor(MUTED).text('No active goals.', MARGIN, y);
    y += 20;
  } else {
    goals.forEach((g, i) => {
      const rowY = y + i * 26;
      doc.font('Helvetica').fontSize(9.5).fillColor(INK_SOFT).text(g.name, MARGIN, rowY + 3, { width: 120 });
      const trackX = MARGIN + 125, trackW = CONTENT_W - 125 - 175;
      doc.roundedRect(trackX, rowY + 2, trackW, 8, 4).fill(LINE);
      doc.roundedRect(trackX, rowY + 2, Math.max(4, (Math.min(g.percentage, 100) / 100) * trackW), 8, 4).fill(GROWTH);
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(INK).text(`${fmt(g.currentAmount)} / ${fmt(g.targetAmount)} (${g.percentage}%)`, MARGIN + CONTENT_W - 170, rowY + 1, { width: 170, align: 'right' });
    });
    y += goals.length * 26 + 10;
  }

  // ---- Habit performance ----
  y = sectionHeading(doc, 'Habit Performance', y);
  if (!habits || habits.length === 0) {
    doc.font('Helvetica').fontSize(10).fillColor(MUTED).text('No active habits.', MARGIN, y);
    y += 20;
  } else {
    habits.forEach((h, i) => {
      const rowY = y + i * 18;
      if (i % 2 === 0) doc.rect(MARGIN, rowY - 2, CONTENT_W, 18).fill('#F9FAFB');
      doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(h.title, MARGIN + 6, rowY + 1, { width: CONTENT_W - 220 });
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(GOLD).text(`${h.currentStreak}-streak`, MARGIN + CONTENT_W - 210, rowY + 1, { width: 100, align: 'right' });
      doc.font('Helvetica').fontSize(9.5).fillColor(INK_SOFT).text(`${h.completionRate}% completion`, MARGIN + CONTENT_W - 104, rowY + 1, { width: 104, align: 'right' });
    });
    y += habits.length * 18 + 12;
  }

  // Page-break guard before insights
  if (y > 680) { doc.addPage(); y = MARGIN; }

  // ---- Insights ----
  y = sectionHeading(doc, 'Insights', y);
  if (!insights || insights.length === 0) {
    doc.font('Helvetica').fontSize(10).fillColor(MUTED).text('No insights yet — check back after a bit more activity.', MARGIN, y);
    y += 20;
  } else {
    insights.forEach((ins) => {
      const dotColor = ins.tone === 'warning' ? RUST : ins.tone === 'positive' ? GROWTH : INK_SOFT;
      doc.circle(MARGIN + 3, y + 5, 2.5).fill(dotColor);
      const h = doc.font('Helvetica').fontSize(9.5).fillColor(INK_SOFT).heightOfString(ins.text, { width: CONTENT_W - 16 });
      doc.text(ins.text, MARGIN + 14, y, { width: CONTENT_W - 16 });
      y += Math.max(16, h + 6);
    });
  }

  // ---- Footer on every page ----
  // Drawing this close to the page bottom trips PDFKit's own auto-pagination
  // (it silently inserts a blank page if a text call's computed bottom edge
  // passes page.height - margins.bottom) — so the bottom margin is zeroed
  // just for this draw, the standard PDFKit workaround for footers.
  const range = doc.bufferedPageRange();
  const savedBottom = doc.page.margins.bottom;
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.page.margins.bottom = 0;
    doc.moveTo(MARGIN, 785).lineTo(PAGE_W - MARGIN, 785).lineWidth(0.5).strokeColor(LINE).stroke();
    doc.font('Helvetica').fontSize(7.5).fillColor(MUTED)
      .text('This report reflects your own tracked data and is not financial advice.', MARGIN, 792, { width: CONTENT_W - 60, lineBreak: false });
    doc.text(`Page ${i - range.start + 1} of ${range.count}`, MARGIN, 792, { width: CONTENT_W, align: 'right', lineBreak: false });
    doc.page.margins.bottom = savedBottom;
  }

  return doc;
}

module.exports = { buildMonthlyReportPDF };
