/**
 * GreenPulse PDF Report Generator — v3
 * Times New Roman font, professional multi-page layout
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RATE_GBP     = 0.28;
const CARBON_KG    = 0.233;
const WASTE_KG_CO2 = 0.5;
const FONT         = 'times';   // Times New Roman (built-in jsPDF)

const C = {
  green:      [5,   150, 105],
  teal:       [13,  148, 136],
  greenLight: [240, 253, 244],
  greenDim:   [167, 243, 208],
  charcoal:   [17,  24,  39],
  darkGray:   [31,  41,  55],
  midGray:    [107, 114, 128],
  lightGray:  [156, 163, 175],
  border:     [229, 231, 235],
  bgGray:     [249, 250, 251],
  white:      [255, 255, 255],
  red:        [220, 38,  38],
  amber:      [245, 158, 11],
  blue:       [59,  130, 246],
  indigo:     [99,  102, 241],
  orange:     [249, 115, 22],
};

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtGBP(v) {
  if (v == null || isNaN(v)) return '—';
  if (v >= 1000000) return `\u00a3${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000)    return `\u00a3${(v / 1000).toFixed(1)}k`;
  return `\u00a3${Number(v).toLocaleString('en-GB')}`;
}
function fmtNum(v, dp = 0) {
  if (v == null || isNaN(v)) return '\u2014';
  return Number(v).toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}
function trunc(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1) + '\u2026' : str;
}

// pendingInsights: raw insight objects from /insights?status=PENDING
// insightsLog: actioned insights from /reports/insights-log (applied/dismissed only)
export function generateReport({ performance, insightsLog = [], pendingInsights = [], dashStats, wasteBreakdown = [], user }) {
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PAGE_W = 210;
  const M      = 14;
  const CW     = PAGE_W - M * 2;
  let y = 0;

  // ── Data extraction ──────────────────────────────────────────────────────────
  const totalRealized  = performance?.total_realized_savings  ?? performance?.realized_savings  ?? 0;
  const totalPotential = performance?.total_potential_savings ?? performance?.potential_savings ?? performance?.pending_savings ?? 0;
  const appliedCount   = performance?.insights_applied ?? performance?.applied_count ?? 0;
  const totalCount     = performance?.insights_total   ?? performance?.total_count;
  const co2Reduced     = performance?.co2e_reduced_tons ?? performance?.co2_reduced ?? 0;
  const trend          = performance?.savings_trend ?? [];
  const cats           = performance?.category_breakdown ?? [];

  const companyName = user?.company_name?.trim()
    || user?.organization_name?.trim()
    || `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()
    || 'Your Organisation';
  const reportedBy = user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '';
  const userTitle  = user?.job_title ?? '';
  const reportDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const periodStart = trend.length > 0 ? (trend[0].month ?? '') : '';
  const periodEnd   = trend.length > 0 ? (trend[trend.length - 1].month ?? '') : '';
  const period      = periodStart && periodEnd ? `${periodStart} \u2013 ${periodEnd}` : 'Last 6 months';

  const co2SavedKg     = co2Reduced ? Math.round(co2Reduced * 1000) : 0;
  const co2PotentialKg = totalPotential ? Math.round(totalPotential / RATE_GBP * CARBON_KG) : 0;
  const totalOpKg      = co2SavedKg + co2PotentialKg;
  const netZeroPct     = totalOpKg > 0 ? Math.min(100, Math.round(co2SavedKg / totalOpKg * 100)) : null;

  // Pending insights from dedicated fetch (not insightsLog which is actioned-only)
  const pending = pendingInsights.length > 0
    ? pendingInsights
    : insightsLog.filter(r => (r.status ?? r.action ?? '').toLowerCase() === 'pending');
  const applied = insightsLog.filter(r => {
    const s = (r.status ?? r.action ?? '').toLowerCase();
    return s === 'applied' || s === 'apply';
  });

  const currentKwh  = dashStats?.current_energy_kwh;
  const carbonSaved = dashStats?.carbon_reduced_tons ?? co2Reduced;

  const totalWasteKg  = wasteBreakdown.reduce((s, b) => s + (parseFloat(b.weight_kg ?? b.weight ?? 0) || 0), 0);
  const landfillKg    = wasteBreakdown
    .filter(b => { const n = (b.stream ?? b.name ?? '').toLowerCase(); return n.includes('landfill') || n.includes('general'); })
    .reduce((s, b) => s + (parseFloat(b.weight_kg ?? b.weight ?? 0) || 0), 0);
  const diversionRate   = totalWasteKg > 0 ? Math.round((totalWasteKg - landfillKg) / totalWasteKg * 100) : null;
  const wasteKgDiverted = totalWasteKg - landfillKg;

  const pendingMonthly = pending.reduce((s, r) => s + (r.estimated_savings ?? r.potential_savings_monthly ?? r.savings ?? 0), 0);
  const annualROI    = pendingMonthly * 12;
  const threeYearROI = annualROI * 3;

  const treesEquiv    = co2SavedKg ? Math.round(co2SavedKg / 21.77)  : null;
  const carMilesEquiv = co2SavedKg ? Math.round(co2SavedKg / 0.404)  : null;
  const flightsEquiv  = co2SavedKg ? Math.round(co2SavedKg / 255)    : null;

  // ── Layout helpers ─────────────────────────────────────────────────────────
  const newPage = () => { doc.addPage(); y = M; };
  const checkBreak = (needed = 30) => { if (y + needed > 275) newPage(); };

  const sectionHeader = (title, subtitle = '') => {
    checkBreak(14);
    doc.setFillColor(...C.darkGray);
    doc.rect(M, y, CW, 11, 'F');
    doc.setFillColor(...C.green);
    doc.rect(M, y, 3.5, 11, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(9.5);
    doc.setFont(FONT, 'bold');
    doc.text(title.toUpperCase(), M + 8, y + 7.2);
    if (subtitle) {
      doc.setTextColor(...C.greenDim);
      doc.setFontSize(8);
      doc.setFont(FONT, 'normal');
      doc.text(subtitle, PAGE_W - M, y + 7.2, { align: 'right' });
    }
    y += 15;
  };

  const kv = (label, value, valColor) => {
    checkBreak(7);
    doc.setFontSize(9);
    doc.setFont(FONT, 'normal');
    doc.setTextColor(...C.midGray);
    doc.text(label, M + 4, y);
    doc.setFont(FONT, 'bold');
    doc.setTextColor(...(valColor ?? C.darkGray));
    doc.text(String(value ?? '\u2014'), M + 90, y);
    doc.setFont(FONT, 'normal');
    y += 6.5;
  };

  const smallNote = (text) => {
    checkBreak(8);
    doc.setTextColor(...C.lightGray);
    doc.setFontSize(7.5);
    doc.setFont(FONT, 'italic');
    const lines = doc.splitTextToSize(text, CW - 8);
    doc.text(lines, M + 4, y);
    y += lines.length * 4 + 2;
  };

  const kpiRow = (cards, startY) => {
    const cardW = (CW - 9) / 4;
    cards.forEach((card, i) => {
      const cx = M + i * (cardW + 3);
      const cy = startY;
      doc.setFillColor(...C.white);
      doc.roundedRect(cx, cy, cardW, 34, 2, 2, 'F');
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(cx, cy, cardW, 34, 2, 2, 'S');
      doc.setFillColor(...card.accent);
      doc.roundedRect(cx, cy, cardW, 3.5, 1, 1, 'F');
      doc.setTextColor(...C.darkGray);
      doc.setFontSize(14);
      doc.setFont(FONT, 'bold');
      doc.text(String(card.value ?? '\u2014'), cx + cardW / 2, cy + 18, { align: 'center' });
      doc.setTextColor(...C.midGray);
      doc.setFontSize(6.5);
      doc.setFont(FONT, 'normal');
      card.label.split('\n').forEach((ln, li) => {
        doc.text(ln, cx + cardW / 2, cy + 26 + li * 4, { align: 'center' });
      });
    });
  };

  // Shared autoTable defaults
  const tableDefaults = {
    styles: {
      font:      FONT,
      overflow:  'linebreak',
      lineColor: C.border,
      lineWidth: 0.2,
      fontSize:  8.5,
    },
    headStyles: {
      fillColor: C.charcoal,
      textColor: C.white,
      fontSize:  8.5,
      fontStyle: 'bold',
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
    },
    bodyStyles: {
      textColor:  C.darkGray,
      cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
    },
    alternateRowStyles: { fillColor: C.bgGray },
    margin: { left: M, right: M },
    tableWidth: CW,
    theme: 'grid',
  };

  // ══════════════════════════════════════════════════════════════════════════
  // COVER PAGE
  // ══════════════════════════════════════════════════════════════════════════
  doc.setFillColor(...C.green);
  doc.rect(0, 0, PAGE_W, 88, 'F');
  doc.setFillColor(...C.teal);
  doc.rect(0, 82, PAGE_W, 6, 'F');

  doc.setFillColor(...C.white);
  doc.roundedRect(M, 14, 22, 22, 3, 3, 'F');
  doc.setTextColor(...C.green);
  doc.setFontSize(13);
  doc.setFont(FONT, 'bold');
  doc.text('GP', M + 5.5, 27.5);

  doc.setTextColor(...C.white);
  doc.setFontSize(22);
  doc.setFont(FONT, 'bold');
  doc.text('GreenPulse Analytics', M + 29, 25);

  doc.setFontSize(10);
  doc.setFont(FONT, 'italic');
  doc.setTextColor(200, 245, 225);
  doc.text('Site Performance & Net Zero Report', M + 29, 34);

  doc.setDrawColor(...C.white);
  doc.setLineWidth(0.3);
  doc.line(M, 47, PAGE_W - M, 47);
  doc.setLineWidth(0.2);

  doc.setTextColor(...C.white);
  doc.setFontSize(9);
  doc.setFont(FONT, 'normal');
  doc.text('Reporting Period:', M, 57);
  doc.setFont(FONT, 'bold');
  doc.text(period, M + 35, 57);
  if (reportedBy) {
    doc.setFont(FONT, 'normal');
    doc.text('Prepared by:', M, 66);
    doc.setFont(FONT, 'bold');
    doc.text(`${reportedBy}${userTitle ? `  \u00b7  ${userTitle}` : ''}`, M + 35, 66);
  }
  doc.setFont(FONT, 'normal');
  doc.text('Generated:', M, 75);
  doc.setFont(FONT, 'bold');
  doc.text(reportDate, M + 35, 75);

  doc.setDrawColor(...C.white);
  doc.setLineWidth(0.5);
  doc.roundedRect(PAGE_W - M - 38, 54, 38, 10, 2, 2, 'S');
  doc.setTextColor(...C.white);
  doc.setFontSize(7.5);
  doc.setFont(FONT, 'bold');
  doc.text('CONFIDENTIAL', PAGE_W - M - 19, 60.5, { align: 'center' });
  doc.setLineWidth(0.2);

  // Company banner
  let cy = 100;
  doc.setFillColor(...C.greenLight);
  doc.roundedRect(M, cy, CW, 28, 3, 3, 'F');
  doc.setFillColor(...C.green);
  doc.rect(M, cy, 4, 28, 'F');
  doc.roundedRect(M, cy, 4, 28, 2, 2, 'F');

  doc.setTextColor(...C.darkGray);
  doc.setFontSize(17);
  doc.setFont(FONT, 'bold');
  doc.text(trunc(companyName, 42), M + 9, cy + 11);
  doc.setTextColor(...C.midGray);
  doc.setFontSize(9);
  doc.setFont(FONT, 'normal');
  doc.text(`Sustainability performance report  \u00b7  ${period}`, M + 9, cy + 22);

  cy += 36;

  // KPI scorecard row
  kpiRow([
    { label: 'Total Savings\nRealised',  value: totalRealized  ? `\u00a3${Number(totalRealized).toLocaleString('en-GB')}` : '\u2014', accent: C.green  },
    { label: 'Further\nPotential',       value: totalPotential ? `\u00a3${Number(totalPotential).toLocaleString('en-GB')}` : '\u2014', accent: C.teal   },
    { label: 'Ideas\nApplied',           value: appliedCount != null ? `${appliedCount}${totalCount ? ` / ${totalCount}` : ''}` : '\u2014', accent: C.indigo },
    { label: 'CO\u2082\nReduced',        value: co2Reduced ? `${co2Reduced.toFixed(2)} T` : '\u2014', accent: C.amber  },
  ], cy);
  cy += 42;

  // Net zero progress
  if (netZeroPct != null) {
    doc.setTextColor(...C.darkGray);
    doc.setFontSize(9);
    doc.setFont(FONT, 'bold');
    doc.text('Net Zero Progress', M, cy);
    doc.setFont(FONT, 'normal');
    doc.setTextColor(...C.midGray);
    doc.text(`${netZeroPct}% of identified carbon reduction achieved`, M + 38, cy);
    cy += 5;
    const bw = CW;
    doc.setFillColor(...C.border);
    doc.roundedRect(M, cy, bw, 9, 4.5, 4.5, 'F');
    const fc   = netZeroPct >= 75 ? C.green : netZeroPct >= 40 ? [251, 191, 36] : C.red;
    const fill = Math.max(9, bw * netZeroPct / 100);
    doc.setFillColor(...fc);
    doc.roundedRect(M, cy, fill, 9, 4.5, 4.5, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(7.5);
    doc.setFont(FONT, 'bold');
    doc.text(`${netZeroPct}%`, M + fill / 2, cy + 5.8, { align: 'center' });
    cy += 15;
  }

  // Waste diversion progress
  if (diversionRate != null) {
    doc.setTextColor(...C.darkGray);
    doc.setFontSize(9);
    doc.setFont(FONT, 'bold');
    doc.text('Waste Diversion Rate', M, cy);
    doc.setFont(FONT, 'normal');
    doc.setTextColor(...C.midGray);
    doc.text(`${diversionRate}% diverted from landfill`, M + 44, cy);
    cy += 5;
    const bw2 = CW;
    doc.setFillColor(...C.border);
    doc.roundedRect(M, cy, bw2, 9, 4.5, 4.5, 'F');
    const dFill = diversionRate >= 70 ? C.green : diversionRate >= 50 ? [251, 191, 36] : C.red;
    const fw2   = Math.max(9, bw2 * diversionRate / 100);
    doc.setFillColor(...dFill);
    doc.roundedRect(M, cy, fw2, 9, 4.5, 4.5, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(7.5);
    doc.setFont(FONT, 'bold');
    doc.text(`${diversionRate}%`, M + fw2 / 2, cy + 5.8, { align: 'center' });
    cy += 14;
  }

  // Disclaimer
  cy = Math.max(cy + 4, 255);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(M, cy, PAGE_W - M, cy);
  cy += 5;
  doc.setTextColor(...C.lightGray);
  doc.setFontSize(7.5);
  doc.setFont(FONT, 'italic');
  const disclaimer = doc.splitTextToSize(
    'This report was generated automatically by GreenPulse Analytics using energy, waste, and financial data from your connected systems. Figures are estimates only and should not be used as the sole basis for financial decisions.',
    CW
  );
  doc.text(disclaimer, M, cy);

  // Cover footer
  doc.setFillColor(...C.darkGray);
  doc.rect(0, 283, PAGE_W, 14, 'F');
  doc.setFillColor(...C.green);
  doc.rect(0, 283, 4, 14, 'F');
  doc.setTextColor(...C.white);
  doc.setFontSize(7.5);
  doc.setFont(FONT, 'normal');
  doc.text('GreenPulse Analytics Ltd  \u00b7  greenpulseanalytics.com  \u00b7  info@greenpulseanalytics.com',
    PAGE_W / 2, 291.5, { align: 'center' });

  // ── Content pages start ────────────────────────────────────────────────────
  doc.addPage();
  y = M;

  // Page 2 mini header
  doc.setFillColor(...C.greenLight);
  doc.rect(M, y, CW, 10, 'F');
  doc.setFillColor(...C.green);
  doc.rect(M, y, 3.5, 10, 'F');
  doc.setTextColor(...C.green);
  doc.setFontSize(8.5);
  doc.setFont(FONT, 'bold');
  doc.text(trunc(companyName, 45).toUpperCase(), M + 7, y + 6.8);
  doc.setTextColor(...C.midGray);
  doc.setFont(FONT, 'normal');
  doc.text(period, PAGE_W - M, y + 6.8, { align: 'right' });
  y += 16;

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 1 — EXECUTIVE SUMMARY
  // ══════════════════════════════════════════════════════════════════════════
  sectionHeader('Executive Summary');

  const bullets = [
    totalRealized  ? `\u00a3${Number(totalRealized).toLocaleString('en-GB')} in cost savings realised from applied recommendations` : null,
    totalPotential ? `\u00a3${Number(totalPotential).toLocaleString('en-GB')} in further savings identified from ${pending.length} pending recommendation${pending.length !== 1 ? 's' : ''}` : null,
    co2Reduced     ? `${co2Reduced.toFixed(2)} tonnes of CO\u2082 reduced to date` : null,
    appliedCount   ? `${appliedCount} recommendation${appliedCount !== 1 ? 's' : ''} actioned${totalCount ? ` (${totalCount} identified in total)` : ''}` : null,
    netZeroPct     != null ? `${netZeroPct}% progress toward full identified carbon reduction opportunity` : null,
    diversionRate  != null ? `${diversionRate}% waste diversion rate \u2014 ${diversionRate >= 70 ? 'exceeding' : diversionRate >= 50 ? 'approaching' : 'below'} industry benchmark of 70%` : null,
  ].filter(Boolean);

  doc.setFontSize(9);
  doc.setFont(FONT, 'normal');

  if (bullets.length > 0) {
    bullets.forEach(b => {
      checkBreak(7);
      doc.setFillColor(...C.green);
      doc.circle(M + 4.5, y - 1.5, 1.2, 'F');
      doc.setTextColor(...C.darkGray);
      doc.text(b, M + 8, y);
      y += 6.5;
    });
  } else {
    doc.setTextColor(...C.midGray);
    doc.setFont(FONT, 'italic');
    doc.text('No performance data available for this period.', M + 4, y);
    y += 8;
  }
  y += 4;

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 2 — PERFORMANCE KPIs
  // ══════════════════════════════════════════════════════════════════════════
  checkBreak(55);
  sectionHeader('Performance Summary', period);
  kpiRow([
    { label: 'Total Savings\nRealised',  value: fmtGBP(totalRealized),  accent: C.green  },
    { label: 'Further\nPotential',       value: fmtGBP(totalPotential), accent: C.teal   },
    { label: 'Ideas\nApplied',           value: appliedCount != null ? `${appliedCount}${totalCount ? ` / ${totalCount}` : ''}` : '\u2014', accent: C.indigo },
    { label: 'CO\u2082\nReduced',        value: co2Reduced ? `${co2Reduced.toFixed(2)} T` : '\u2014', accent: C.amber  },
  ], y);
  y += 42;

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 3 — ENERGY CONSUMPTION
  // ══════════════════════════════════════════════════════════════════════════
  checkBreak(40);
  sectionHeader('Energy Consumption');
  if (currentKwh != null) {
    kv('Live consumption reading:', `${fmtNum(currentKwh, 1)} kWh  (\u2248 \u00a3${(currentKwh * RATE_GBP).toFixed(2)}/hr at UK rate)`);
    const projMonthly = currentKwh * 24 * 30;
    kv('Projected monthly energy use:', `\u2248 ${fmtNum(projMonthly)} kWh  (\u2248 ${fmtGBP(projMonthly * RATE_GBP)} / month)`);
    kv('Projected monthly CO\u2082 output:', `\u2248 ${fmtNum(projMonthly * CARBON_KG)} kg CO\u2082`);
  }
  if (carbonSaved) kv('Carbon emissions reduced to date:', `${Number(carbonSaved).toFixed(2)} tonnes CO\u2082`, C.green);
  if (totalRealized) kv('Total cost savings achieved:', fmtGBP(totalRealized), C.green);
  if (!currentKwh && !carbonSaved) {
    doc.setTextColor(...C.midGray);
    doc.setFontSize(9);
    doc.setFont(FONT, 'italic');
    doc.text('No live energy data available for this period.', M + 4, y);
    y += 8;
  }
  y += 4;

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 4 — WASTE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  if (wasteBreakdown.length > 0) {
    checkBreak(55);
    sectionHeader('Waste Management', 'Last 30 days');
    kv('Total waste generated:', `${fmtNum(totalWasteKg, 1)} kg  (${(totalWasteKg / 1000).toFixed(2)} tonnes)`);
    kv('Landfill / general waste:', `${fmtNum(landfillKg, 1)} kg`);
    kv('Diverted (recycled / composted):', `${fmtNum(totalWasteKg - landfillKg, 1)} kg`);
    if (diversionRate != null) kv('Diversion rate:', `${diversionRate}%  (target: 70%)`, diversionRate >= 70 ? C.green : diversionRate >= 50 ? C.amber : C.red);
    y += 4;

    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['Waste Stream', 'Weight (kg)', 'Share', 'CO\u2082 Equivalent']],
      body: wasteBreakdown.map(b => {
        const name = b.stream ?? b.category ?? b.name ?? 'Unknown';
        const kg   = parseFloat(b.weight_kg ?? b.weight ?? 0) || 0;
        const pct  = totalWasteKg > 0 ? ((kg / totalWasteKg) * 100).toFixed(1) : '0';
        const isLF = name.toLowerCase().includes('landfill') || name.toLowerCase().includes('general');
        return [name, fmtNum(kg, 1), `${pct}%`, isLF ? `\u2248 ${fmtNum(kg * WASTE_KG_CO2)} kg` : 'Diverted'];
      }),
      columnStyles: {
        0: { cellWidth: 50 },
        1: { halign: 'right', cellWidth: 30 },
        2: { halign: 'right', cellWidth: 25 },
        3: { halign: 'right' },
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 5 — NET ZERO PROGRESS
  // ══════════════════════════════════════════════════════════════════════════
  checkBreak(50);
  sectionHeader('Net Zero Progress');
  kv('CO\u2082 reduced to date:', co2SavedKg ? `${fmtNum(co2SavedKg)} kg  (${co2Reduced.toFixed(2)} tonnes)` : '\u2014', C.green);
  kv('Remaining CO\u2082 potential (pending ideas):', co2PotentialKg ? `\u2248 ${fmtNum(co2PotentialKg)} kg` : '\u2014');
  kv('Total identified CO\u2082 opportunity:', totalOpKg ? `${fmtNum(totalOpKg)} kg` : '\u2014');
  if (netZeroPct != null) {
    kv('Progress toward full reduction:', `${netZeroPct}%`, netZeroPct >= 75 ? C.green : netZeroPct >= 40 ? C.amber : C.red);
    y += 2;
    const bw   = CW - 8;
    doc.setFillColor(...C.border);
    doc.roundedRect(M + 4, y, bw, 9, 4.5, 4.5, 'F');
    const fc   = netZeroPct >= 75 ? C.green : netZeroPct >= 40 ? [251, 191, 36] : C.red;
    const fill = Math.max(9, bw * netZeroPct / 100);
    doc.setFillColor(...fc);
    doc.roundedRect(M + 4, y, fill, 9, 4.5, 4.5, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(7.5);
    doc.setFont(FONT, 'bold');
    doc.text(`${netZeroPct}%`, M + 4 + fill / 2, y + 5.8, { align: 'center' });
    y += 14;
    smallNote(
      `Methodology: Progress = CO\u2082 already reduced \u00f7 (CO\u2082 reduced + estimated remaining potential). ` +
      `Remaining potential derived from pending insight savings \u00f7 \u00a3${RATE_GBP}/kWh \u00d7 ${CARBON_KG} kg CO\u2082/kWh (UK grid, DEFRA 2024).`
    );
  }
  y += 2;

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — MONTHLY SAVINGS TREND
  // ══════════════════════════════════════════════════════════════════════════
  if (trend.length > 0) {
    checkBreak(40);
    sectionHeader('Monthly Savings Trend', 'Realised vs. Potential');
    const totals = trend.reduce((a, t) => { a.r += t.realized ?? 0; a.p += t.potential ?? 0; return a; }, { r: 0, p: 0 });

    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['Month', 'Realised', 'Potential', 'Untapped Gap']],
      body: [
        ...trend.map(t => {
          const r = t.realized ?? 0, p = t.potential ?? 0;
          return [t.month ?? '\u2014', `\u00a3${r.toLocaleString('en-GB')}`, `\u00a3${p.toLocaleString('en-GB')}`, p > r ? `\u00a3${(p - r).toLocaleString('en-GB')}` : 'Fully realised'];
        }),
        ['TOTAL', `\u00a3${totals.r.toLocaleString('en-GB')}`, `\u00a3${totals.p.toLocaleString('en-GB')}`, totals.p > totals.r ? `\u00a3${(totals.p - totals.r).toLocaleString('en-GB')}` : 'Fully realised'],
      ],
      columnStyles: {
        0: { cellWidth: 32 },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right', textColor: C.midGray },
      },
      didParseCell: data => {
        if (data.row.index === trend.length) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = C.greenLight;
          data.cell.styles.textColor = C.darkGray;
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 7 — RECOMMENDED COST-SAVING IDEAS
  // ══════════════════════════════════════════════════════════════════════════
  checkBreak(30);
  sectionHeader('Recommended Cost-Saving Ideas', `${pending.length} pending`);

  if (pending.length === 0) {
    doc.setTextColor(...C.midGray);
    doc.setFontSize(9);
    doc.setFont(FONT, 'italic');
    doc.text('No pending recommendations at this time.', M + 4, y);
    y += 10;
  } else {
    autoTable(doc, {
      ...tableDefaults,
      headStyles: { ...tableDefaults.headStyles, fillColor: C.green },
      startY: y,
      head: [['#', 'Recommendation', 'Category', 'Monthly Saving', 'Annual ROI']],
      body: pending.map((r, i) => {
        const saving = r.estimated_savings ?? r.potential_savings_monthly ?? r.savings ?? 0;
        const cat = r.category ?? '';
        return [
          i + 1,
          trunc(r.title ?? r.name ?? 'Untitled', 55),
          cat.charAt(0).toUpperCase() + cat.slice(1),
          saving ? `\u00a3${Number(saving).toLocaleString('en-GB')}` : '\u2014',
          saving ? `\u00a3${(saving * 12).toLocaleString('en-GB')}` : '\u2014',
        ];
      }),
      columnStyles: {
        0: { halign: 'center', cellWidth: 8, fontStyle: 'bold' },
        1: { cellWidth: 80 },
        2: { cellWidth: 28 },
        3: { halign: 'right', cellWidth: 28 },
        4: { halign: 'right', fontStyle: 'bold' },
      },
    });
    y = doc.lastAutoTable.finalY + 5;
    doc.setFontSize(9);
    doc.setFont(FONT, 'bold');
    doc.setTextColor(...C.green);
    doc.text(
      `Total pending monthly savings: ${fmtGBP(pendingMonthly)}   \u00b7   Annual: ${fmtGBP(annualROI)}`,
      M + 4, y
    );
    y += 10;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 8 — APPLIED RECOMMENDATIONS
  // ══════════════════════════════════════════════════════════════════════════
  if (applied.length > 0) {
    checkBreak(30);
    sectionHeader('Applied Recommendations', `${applied.length} completed`);
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['Recommendation', 'Category', 'Monthly Saving', 'Date Applied']],
      body: applied.map(r => {
        const saving = r.estimated_savings ?? r.potential_savings_monthly ?? r.savings;
        const cat = r.category ?? '';
        return [
          trunc(r.insight_title ?? r.title ?? r.name ?? 'Untitled', 60),
          cat.charAt(0).toUpperCase() + cat.slice(1),
          saving != null ? `\u00a3${Number(saving).toLocaleString('en-GB')}` : '\u2014',
          fmtDate(r.actioned_at ?? r.timestamp ?? r.updated_at),
        ];
      }),
      columnStyles: {
        0: { cellWidth: 80 },
        2: { halign: 'right', fontStyle: 'bold', cellWidth: 30 },
        3: { cellWidth: 30 },
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 9 — IMPACT BY CATEGORY
  // ══════════════════════════════════════════════════════════════════════════
  if (cats.length > 0) {
    checkBreak(30);
    sectionHeader('Impact by Category');
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['Category', 'Total Savings', 'Share of Impact', 'Level']],
      body: cats.map(c => {
        const label = (c.label ?? c.category ?? '\u2014');
        const pct   = c.percentage ?? 0;
        const val   = c.value ?? 0;
        return [
          label.charAt(0).toUpperCase() + label.slice(1),
          fmtGBP(val),
          `${pct}%`,
          pct > 40 ? 'High impact' : pct > 20 ? 'Medium impact' : 'Low impact',
        ];
      }),
      columnStyles: {
        0: { cellWidth: 45 },
        1: { halign: 'right', fontStyle: 'bold', cellWidth: 35 },
        2: { halign: 'right', cellWidth: 30 },
        3: { textColor: C.midGray },
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 10 — CARBON EQUIVALENCES
  // ══════════════════════════════════════════════════════════════════════════
  if (co2SavedKg > 0) {
    checkBreak(45);
    sectionHeader('Carbon Equivalences', `Based on ${co2SavedKg.toLocaleString('en-GB')} kg CO\u2082 reduced`);
    const equivRows = [
      ['Trees planted (1 year of absorption)',     treesEquiv    != null ? `\u2248 ${fmtNum(treesEquiv)}`    : '\u2014', '1 tree absorbs approx. 21.77 kg CO\u2082/yr'],
      ['Car miles of driving avoided',              carMilesEquiv != null ? `\u2248 ${fmtNum(carMilesEquiv)}` : '\u2014', 'UK average: 0.404 kg CO\u2082 per mile'],
      ['London\u2013New York flights (one way)',    flightsEquiv  != null ? `\u2248 ${fmtNum(flightsEquiv)}`  : '\u2014', 'Approx. 255 kg CO\u2082 per passenger'],
    ];
    if (wasteKgDiverted > 0) {
      equivRows.push([
        'Waste CO\u2082 avoided via landfill diversion',
        `\u2248 ${fmtNum(Math.round(wasteKgDiverted * WASTE_KG_CO2))} kg`,
        'Approx. 0.5 kg CO\u2082 saved per kg diverted',
      ]);
    }
    autoTable(doc, {
      ...tableDefaults,
      headStyles: { ...tableDefaults.headStyles, fillColor: C.green },
      startY: y,
      head: [['Equivalent Impact', 'Estimate', 'Basis']],
      body: equivRows,
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: 'right', fontStyle: 'bold', cellWidth: 32 },
        2: { textColor: C.midGray },
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 11 — ROI PROJECTION
  // ══════════════════════════════════════════════════════════════════════════
  if (pendingMonthly > 0 || totalRealized) {
    checkBreak(55);
    sectionHeader('Return on Investment Projection', 'If all pending ideas are applied');
    autoTable(doc, {
      ...tableDefaults,
      headStyles: { ...tableDefaults.headStyles, fillColor: C.green },
      startY: y,
      head: [['Metric', 'Value', 'Notes']],
      body: [
        ['Monthly saving (all pending ideas)',           fmtGBP(pendingMonthly), `${pending.length} pending recommendation${pending.length !== 1 ? 's' : ''}`],
        ['Projected annual saving',                      fmtGBP(annualROI),      'Monthly \u00d7 12'],
        ['3-year cumulative saving',                     fmtGBP(threeYearROI),   'Annual \u00d7 3 (no inflation adjustment)'],
        ...(totalRealized ? [['Already realised to date', fmtGBP(totalRealized), 'From applied recommendations']] : []),
        ...(totalRealized && annualROI > 0 ? [['Total lifetime value (realised + 3yr)', fmtGBP(totalRealized + threeYearROI), 'Combined potential']] : []),
      ],
      columnStyles: {
        0: { cellWidth: 75 },
        1: { halign: 'right', fontStyle: 'bold', cellWidth: 35 },
        2: { textColor: C.midGray },
      },
      didParseCell: data => {
        const lastRow = (totalRealized && annualROI > 0) ? 4 : -1;
        if (data.row.index === lastRow) {
          data.cell.styles.fillColor = C.greenLight;
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
    y = doc.lastAutoTable.finalY + 6;
    smallNote(
      `Projection assumes consistent application of all pending recommendations. Actual savings may vary by usage patterns and tariff changes. ` +
      `UK electricity rate: \u00a3${RATE_GBP}/kWh. Carbon intensity: ${CARBON_KG} kg CO\u2082/kWh (DEFRA 2024).`
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE FOOTERS (skip cover = page 1)
  // ══════════════════════════════════════════════════════════════════════════
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...C.darkGray);
    doc.rect(0, 283, PAGE_W, 14, 'F');
    doc.setFillColor(...C.green);
    doc.rect(0, 283, 4, 14, 'F');
    doc.setTextColor(...C.lightGray);
    doc.setFontSize(7.5);
    doc.setFont(FONT, 'normal');
    doc.text(`GreenPulse Analytics  \u00b7  ${trunc(companyName, 35)}  \u00b7  greenpulseanalytics.com`, M + 4, 291.5);
    doc.setTextColor(...C.white);
    doc.setFont(FONT, 'bold');
    doc.text(`${i - 1}  /  ${totalPages - 1}`, PAGE_W - M, 291.5, { align: 'right' });
  }

  const safeName = companyName.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').toLowerCase();
  doc.save(`GreenPulse-Report-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
