/**
 * GreenPulse PDF Report Generator — v2
 * Professional multi-page sustainability report
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RATE_GBP       = 0.28;
const CARBON_KG      = 0.233;
const WASTE_KG_CO2   = 0.5;

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

const CAT_COLOR = {
  energy:     C.blue,
  waste:      C.green,
  operations: C.orange,
  carbon:     C.teal,
};

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtGBP(v) {
  if (v == null || isNaN(v)) return '—';
  if (v >= 1000000) return `£${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000)    return `£${(v / 1000).toFixed(1)}k`;
  return `£${Number(v).toLocaleString('en-GB')}`;
}
function fmtNum(v, dp = 0) {
  if (v == null || isNaN(v)) return '—';
  return Number(v).toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}
function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

export function generateReport({ performance, insightsLog = [], dashStats, wasteBreakdown = [], user }) {
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PAGE_W = 210;
  const M      = 14;
  const CW     = PAGE_W - M * 2;
  let y = 0;

  // ── Data extraction ──────────────────────────────────────────────────────────
  const totalRealized  = performance?.total_realized_savings ?? performance?.realized_savings ?? 0;
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
  const reportedBy  = user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '';
  const userTitle   = user?.job_title ?? '';
  const reportDate  = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const periodStart = trend.length > 0 ? (trend[0].month ?? '') : '';
  const periodEnd   = trend.length > 0 ? (trend[trend.length - 1].month ?? '') : '';
  const period      = periodStart && periodEnd ? `${periodStart} – ${periodEnd}` : 'Last 6 months';

  const co2SavedKg     = co2Reduced ? Math.round(co2Reduced * 1000) : 0;
  const co2PotentialKg = totalPotential ? Math.round(totalPotential / RATE_GBP * CARBON_KG) : 0;
  const totalOpKg      = co2SavedKg + co2PotentialKg;
  const netZeroPct     = totalOpKg > 0 ? Math.min(100, Math.round(co2SavedKg / totalOpKg * 100)) : null;

  const pending = insightsLog.filter(r => (r.status ?? '').toLowerCase() === 'pending');
  const applied = insightsLog.filter(r => (r.status ?? '').toLowerCase() === 'applied');

  const currentKwh  = dashStats?.current_energy_kwh;
  const carbonSaved = dashStats?.carbon_reduced_tons ?? co2Reduced;

  const totalWasteKg = wasteBreakdown.reduce((s, b) => s + (parseFloat(b.weight_kg ?? b.weight ?? 0) || 0), 0);
  const landfillKg   = wasteBreakdown
    .filter(b => { const n = (b.stream ?? b.name ?? '').toLowerCase(); return n.includes('landfill') || n.includes('general'); })
    .reduce((s, b) => s + (parseFloat(b.weight_kg ?? b.weight ?? 0) || 0), 0);
  const diversionRate    = totalWasteKg > 0 ? Math.round((totalWasteKg - landfillKg) / totalWasteKg * 100) : null;
  const wasteKgDiverted  = totalWasteKg - landfillKg;

  const pendingSavingsMonthly = pending.reduce((s, r) => s + (r.potential_savings_monthly ?? r.savings_monthly ?? r.savings ?? r.estimated_savings ?? 0), 0);
  const annualROI    = pendingSavingsMonthly * 12;
  const threeYearROI = annualROI * 3;

  const treesEquiv    = co2SavedKg ? Math.round(co2SavedKg / 21.77) : null;
  const carMilesEquiv = co2SavedKg ? Math.round(co2SavedKg / 0.404) : null;
  const flightsEquiv  = co2SavedKg ? Math.round(co2SavedKg / 255)   : null;

  // ── Layout helpers ────────────────────────────────────────────────────────────
  const newPage = () => { doc.addPage(); y = M; };

  const checkBreak = (needed = 30) => {
    if (y + needed > 275) newPage();
  };

  // Dark charcoal section header with green left accent
  const sectionHeader = (title, subtitle = '') => {
    checkBreak(14);
    doc.setFillColor(...C.darkGray);
    doc.rect(M, y, CW, 10, 'F');
    doc.setFillColor(...C.green);
    doc.rect(M, y, 3, 10, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), M + 7, y + 6.5);
    if (subtitle) {
      doc.setTextColor(...C.greenDim);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, PAGE_W - M, y + 6.5, { align: 'right' });
    }
    y += 14;
  };

  // Inline key → value row
  const kv = (label, value, valColor) => {
    checkBreak(7);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.midGray);
    doc.text(label, M + 4, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(valColor ?? C.darkGray));
    doc.text(String(value ?? '—'), M + 88, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
  };

  const smallNote = (text) => {
    checkBreak(8);
    doc.setTextColor(...C.lightGray);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    const lines = doc.splitTextToSize(text, CW - 8);
    doc.text(lines, M + 4, y);
    y += lines.length * 3.8 + 2;
  };

  // 4-column KPI scorecard row
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
      // Coloured top bar
      doc.setFillColor(...card.accent);
      doc.roundedRect(cx, cy, cardW, 3.5, 1, 1, 'F');
      // Big value
      doc.setTextColor(...C.darkGray);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text(String(card.value ?? '—'), cx + cardW / 2, cy + 18, { align: 'center' });
      // Label (two lines if needed)
      doc.setTextColor(...C.midGray);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      const labelLines = card.label.split('\n');
      labelLines.forEach((ln, li) => {
        doc.text(ln, cx + cardW / 2, cy + 26 + li * 4, { align: 'center' });
      });
    });
  };

  // ════════════════════════════════════════════════════════════════════════════
  // COVER PAGE
  // ════════════════════════════════════════════════════════════════════════════
  // Top green band
  doc.setFillColor(...C.green);
  doc.rect(0, 0, PAGE_W, 88, 'F');
  doc.setFillColor(...C.teal);
  doc.rect(0, 82, PAGE_W, 6, 'F');

  // GP logo
  doc.setFillColor(...C.white);
  doc.roundedRect(M, 14, 22, 22, 3, 3, 'F');
  doc.setTextColor(...C.green);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('GP', M + 5.5, 27.5);

  // Brand name
  doc.setTextColor(...C.white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('GreenPulse Analytics', M + 29, 24);

  // Report title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 245, 225);
  doc.text('Site Performance & Net Zero Report', M + 29, 33);

  // Separator line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.line(M, 46, PAGE_W - M, 46);
  doc.setLineWidth(0.2);

  // Report meta
  doc.setTextColor(...C.white);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Reporting Period:`, M, 56);
  doc.setFont('helvetica', 'bold');
  doc.text(period, M + 34, 56);
  doc.setFont('helvetica', 'normal');

  if (reportedBy) {
    doc.text('Prepared by:', M, 64);
    doc.setFont('helvetica', 'bold');
    doc.text(`${reportedBy}${userTitle ? `  ·  ${userTitle}` : ''}`, M + 34, 64);
    doc.setFont('helvetica', 'normal');
  }

  doc.text('Generated:', M, 72);
  doc.setFont('helvetica', 'bold');
  doc.text(reportDate, M + 34, 72);

  // CONFIDENTIAL badge
  doc.setDrawColor(...C.white);
  doc.setLineWidth(0.5);
  doc.roundedRect(PAGE_W - M - 38, 54, 38, 10, 2, 2, 'S');
  doc.setTextColor(...C.white);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIDENTIAL', PAGE_W - M - 19, 60.5, { align: 'center' });
  doc.setLineWidth(0.2);

  // Company name block
  let cy = 100;
  doc.setFillColor(...C.greenLight);
  doc.roundedRect(M, cy, CW, 28, 3, 3, 'F');
  doc.setFillColor(...C.green);
  doc.rect(M, cy, 4, 28, 'F');
  doc.roundedRect(M, cy, 4, 28, 2, 2, 'F');

  doc.setTextColor(...C.darkGray);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(truncate(companyName, 40), M + 9, cy + 12);

  doc.setTextColor(...C.midGray);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Sustainability performance report  ·  ${period}`, M + 9, cy + 22);

  cy += 36;

  // 4 KPI cards on cover
  kpiRow([
    {
      label: 'Total Savings\nRealised',
      value: totalRealized ? `£${Number(totalRealized).toLocaleString('en-GB')}` : '—',
      accent: C.green,
    },
    {
      label: 'Further\nPotential',
      value: totalPotential ? `£${Number(totalPotential).toLocaleString('en-GB')}` : '—',
      accent: C.teal,
    },
    {
      label: 'Ideas\nApplied',
      value: appliedCount != null ? `${appliedCount}${totalCount ? ` / ${totalCount}` : ''}` : '—',
      accent: C.indigo,
    },
    {
      label: 'CO₂\nReduced',
      value: co2Reduced ? `${co2Reduced.toFixed(2)} T` : '—',
      accent: C.amber,
    },
  ], cy);

  cy += 42;

  // Net zero progress bar
  if (netZeroPct != null) {
    doc.setTextColor(...C.darkGray);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Net Zero Progress`, M, cy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.midGray);
    doc.text(`${netZeroPct}% of identified carbon reduction achieved`, M + 38, cy);
    cy += 5;

    const bw = CW;
    doc.setFillColor(...C.border);
    doc.roundedRect(M, cy, bw, 9, 4.5, 4.5, 'F');
    const fillClr = netZeroPct >= 75 ? C.green : netZeroPct >= 40 ? [251, 191, 36] : C.red;
    const fillW   = Math.max(9, bw * netZeroPct / 100);
    doc.setFillColor(...fillClr);
    doc.roundedRect(M, cy, fillW, 9, 4.5, 4.5, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(`${netZeroPct}%`, M + fillW / 2, cy + 5.8, { align: 'center' });
    cy += 15;
  }

  // Waste diversion bar (if available)
  if (diversionRate != null) {
    doc.setTextColor(...C.darkGray);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Waste Diversion Rate', M, cy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.midGray);
    doc.text(`${diversionRate}% diverted from landfill`, M + 44, cy);
    cy += 5;

    const bw2  = CW;
    doc.setFillColor(...C.border);
    doc.roundedRect(M, cy, bw2, 9, 4.5, 4.5, 'F');
    const dFill = diversionRate >= 70 ? C.green : diversionRate >= 50 ? [251, 191, 36] : C.red;
    doc.setFillColor(...dFill);
    doc.roundedRect(M, cy, Math.max(9, bw2 * diversionRate / 100), 9, 4.5, 4.5, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(`${diversionRate}%`, M + Math.max(9, bw2 * diversionRate / 100) / 2, cy + 5.8, { align: 'center' });
    cy += 14;
  }

  // Disclaimer
  cy = Math.max(cy + 4, 255);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(M, cy, PAGE_W - M, cy);
  cy += 5;
  doc.setTextColor(...C.lightGray);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  const disclaimer = doc.splitTextToSize(
    'This report was generated automatically by GreenPulse Analytics using energy, waste and financial data from your connected systems. Figures represent estimates based on available data and should not be used as the sole basis for financial decisions.',
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
  doc.setFont('helvetica', 'normal');
  doc.text(
    'GreenPulse Analytics Ltd  ·  greenpulseanalytics.com  ·  info@greenpulseanalytics.com',
    PAGE_W / 2, 291.5, { align: 'center' }
  );

  // ── Start content pages ────────────────────────────────────────────────────
  doc.addPage();
  y = M;

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 2 HEADER — mini KPI summary bar
  // ════════════════════════════════════════════════════════════════════════════
  doc.setFillColor(...C.greenLight);
  doc.rect(M, y, CW, 10, 'F');
  doc.setFillColor(...C.green);
  doc.rect(M, y, 3, 10, 'F');
  doc.setTextColor(...C.green);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName.toUpperCase(), M + 7, y + 6.5);
  doc.setTextColor(...C.midGray);
  doc.setFont('helvetica', 'normal');
  doc.text(period, PAGE_W - M, y + 6.5, { align: 'right' });
  y += 16;

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 1 — EXECUTIVE SUMMARY
  // ════════════════════════════════════════════════════════════════════════════
  sectionHeader('Executive Summary');

  const bullets = [
    totalRealized  ? `£${Number(totalRealized).toLocaleString('en-GB')} in cost savings realised from applied recommendations` : null,
    totalPotential ? `£${Number(totalPotential).toLocaleString('en-GB')} in further savings identified from pending recommendations` : null,
    co2Reduced     ? `${co2Reduced.toFixed(2)} tonnes of CO₂ reduced to date` : null,
    appliedCount   ? `${appliedCount} recommendation${appliedCount !== 1 ? 's' : ''} actioned${totalCount ? ` out of ${totalCount} identified` : ''}` : null,
    netZeroPct     != null ? `${netZeroPct}% progress toward full identified carbon reduction opportunity` : null,
    diversionRate  != null ? `${diversionRate}% waste diversion rate — ${diversionRate >= 70 ? 'exceeding' : diversionRate >= 50 ? 'approaching' : 'below'} industry benchmark of 70%` : null,
  ].filter(Boolean);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');

  if (bullets.length > 0) {
    bullets.forEach(b => {
      checkBreak(7);
      doc.setFillColor(...C.green);
      doc.circle(M + 4.5, y - 1.5, 1.2, 'F');
      doc.setTextColor(...C.darkGray);
      doc.text(b, M + 8, y);
      y += 6;
    });
  } else {
    doc.setTextColor(...C.midGray);
    doc.setFont('helvetica', 'italic');
    doc.text('No performance data available for this period.', M + 4, y);
    y += 8;
  }
  y += 4;

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 2 — PERFORMANCE KPIs (card row)
  // ════════════════════════════════════════════════════════════════════════════
  checkBreak(55);
  sectionHeader('Performance Summary', period);

  kpiRow([
    { label: 'Total Savings\nRealised',  value: fmtGBP(totalRealized),  accent: C.green },
    { label: 'Further\nPotential',        value: fmtGBP(totalPotential), accent: C.teal },
    { label: 'Ideas\nApplied',            value: appliedCount != null ? `${appliedCount}${totalCount ? ` / ${totalCount}` : ''}` : '—', accent: C.indigo },
    { label: 'CO₂\nReduced',             value: co2Reduced ? `${co2Reduced.toFixed(2)} T` : '—', accent: C.amber },
  ], y);
  y += 42;

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 3 — ENERGY CONSUMPTION SUMMARY
  // ════════════════════════════════════════════════════════════════════════════
  checkBreak(40);
  sectionHeader('Energy Consumption');

  if (currentKwh != null) {
    kv('Live consumption reading:', `${fmtNum(currentKwh, 1)} kWh  (≈ £${(currentKwh * RATE_GBP).toFixed(2)}/hr at UK rate)`);
    const projMonthly = currentKwh * 24 * 30;
    kv('Projected monthly energy use:', `≈ ${fmtNum(projMonthly)} kWh  (≈ ${fmtGBP(projMonthly * RATE_GBP)} / month)`);
    kv('Projected monthly CO₂ output:', `≈ ${fmtNum(projMonthly * CARBON_KG)} kg CO₂`);
  }
  if (carbonSaved) {
    kv('Carbon emissions reduced to date:', `${Number(carbonSaved).toFixed(2)} tonnes CO₂`, C.green);
  }
  if (totalRealized) {
    kv('Total cost savings achieved:', fmtGBP(totalRealized), C.green);
  }
  if (!currentKwh && !carbonSaved) {
    doc.setTextColor(...C.midGray);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'italic');
    doc.text('No live energy data available for this period.', M + 4, y);
    y += 8;
  }
  y += 4;

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 4 — WASTE MANAGEMENT
  // ════════════════════════════════════════════════════════════════════════════
  if (wasteBreakdown.length > 0) {
    checkBreak(55);
    sectionHeader('Waste Management', 'Last 30 days');

    kv('Total waste generated:', `${fmtNum(totalWasteKg, 1)} kg  (${(totalWasteKg / 1000).toFixed(2)} tonnes)`);
    kv('Landfill / general waste:', `${fmtNum(landfillKg, 1)} kg`);
    kv('Diverted (recycled / composted):', `${fmtNum(wasteKgDiverted, 1)} kg`);
    if (diversionRate != null) {
      kv(
        'Diversion rate:',
        `${diversionRate}%  (target: 70%)`,
        diversionRate >= 70 ? C.green : diversionRate >= 50 ? C.amber : C.red
      );
    }
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      tableWidth: CW,
      head: [['Waste Stream', 'Weight (kg)', 'Share (%)', 'CO₂ Equivalent']],
      body: wasteBreakdown.map(b => {
        const name  = b.stream ?? b.category ?? b.name ?? 'Unknown';
        const kg    = parseFloat(b.weight_kg ?? b.weight ?? 0) || 0;
        const pct   = totalWasteKg > 0 ? ((kg / totalWasteKg) * 100).toFixed(1) : '—';
        const isLF  = name.toLowerCase().includes('landfill') || name.toLowerCase().includes('general');
        return [name, fmtNum(kg, 1), `${pct}%`, isLF ? `≈ ${fmtNum(kg * WASTE_KG_CO2)} kg` : 'Diverted'];
      }),
      headStyles:         { fillColor: C.charcoal, textColor: C.white, fontSize: 8, cellPadding: 3 },
      bodyStyles:         { fontSize: 8.5, textColor: C.darkGray, cellPadding: { top: 3, bottom: 3, left: 3, right: 3 } },
      alternateRowStyles: { fillColor: C.bgGray },
      columnStyles:       { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
      styles:             { lineColor: C.border, lineWidth: 0.2 },
      theme: 'grid',
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 5 — NET ZERO PROGRESS
  // ════════════════════════════════════════════════════════════════════════════
  checkBreak(50);
  sectionHeader('Net Zero Progress');

  kv('CO₂ reduced to date:', co2SavedKg ? `${fmtNum(co2SavedKg)} kg  (${co2Reduced.toFixed(2)} tonnes)` : '—', C.green);
  kv('Remaining CO₂ potential (pending ideas):', co2PotentialKg ? `≈ ${fmtNum(co2PotentialKg)} kg` : '—');
  kv('Total identified CO₂ opportunity:', totalOpKg ? `${fmtNum(totalOpKg)} kg` : '—');

  if (netZeroPct != null) {
    kv('Progress toward full reduction:', `${netZeroPct}%`, netZeroPct >= 75 ? C.green : netZeroPct >= 40 ? C.amber : C.red);
    y += 2;
    const bw = CW - 8;
    doc.setFillColor(...C.border);
    doc.roundedRect(M + 4, y, bw, 9, 4.5, 4.5, 'F');
    const fc   = netZeroPct >= 75 ? C.green : netZeroPct >= 40 ? [251, 191, 36] : C.red;
    const fill = Math.max(9, bw * netZeroPct / 100);
    doc.setFillColor(...fc);
    doc.roundedRect(M + 4, y, fill, 9, 4.5, 4.5, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(`${netZeroPct}%`, M + 4 + fill / 2, y + 5.8, { align: 'center' });
    y += 14;
    smallNote(
      `Methodology: Progress = CO₂ already reduced ÷ (CO₂ reduced + estimated remaining potential). ` +
      `Remaining potential derived from pending insight savings ÷ £${RATE_GBP}/kWh × ${CARBON_KG} kg CO₂/kWh (UK grid, DEFRA 2024).`
    );
  }
  y += 2;

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 6 — MONTHLY SAVINGS TREND
  // ════════════════════════════════════════════════════════════════════════════
  if (trend.length > 0) {
    checkBreak(40);
    sectionHeader('Monthly Savings Trend', 'Realised vs. Potential');

    const totals = trend.reduce((a, t) => {
      a.r += t.realized  ?? 0;
      a.p += t.potential ?? 0;
      return a;
    }, { r: 0, p: 0 });

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      tableWidth: CW,
      head: [['Month', 'Realised', 'Potential', 'Untapped Gap']],
      body: [
        ...trend.map(t => {
          const r = t.realized ?? 0;
          const p = t.potential ?? 0;
          return [t.month ?? '—', `£${r.toLocaleString('en-GB')}`, `£${p.toLocaleString('en-GB')}`, p > r ? `£${(p - r).toLocaleString('en-GB')}` : '✓ Realised'];
        }),
        ['TOTAL', `£${totals.r.toLocaleString('en-GB')}`, `£${totals.p.toLocaleString('en-GB')}`, totals.p > totals.r ? `£${(totals.p - totals.r).toLocaleString('en-GB')}` : '✓ Realised'],
      ],
      headStyles:         { fillColor: C.charcoal, textColor: C.white, fontSize: 8, cellPadding: 3 },
      bodyStyles:         { fontSize: 8.5, textColor: C.darkGray, cellPadding: { top: 3, bottom: 3, left: 3, right: 3 } },
      alternateRowStyles: { fillColor: C.bgGray },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right', textColor: C.midGray },
      },
      styles: { lineColor: C.border, lineWidth: 0.2 },
      theme: 'grid',
      didParseCell: data => {
        if (data.row.index === trend.length) {
          data.cell.styles.fontStyle  = 'bold';
          data.cell.styles.fillColor  = C.greenLight;
          data.cell.styles.textColor  = C.darkGray;
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 7 — RECOMMENDED COST-SAVING IDEAS
  // ════════════════════════════════════════════════════════════════════════════
  checkBreak(30);
  sectionHeader('Recommended Cost-Saving Ideas', `${pending.length} pending`);

  if (pending.length === 0) {
    doc.setTextColor(...C.midGray);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'italic');
    doc.text('All identified recommendations have been actioned — no pending ideas.', M + 4, y);
    y += 10;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      tableWidth: CW,
      head: [['#', 'Recommendation', 'Category', 'Monthly\nSaving', 'Annual\nROI']],
      body: pending.map((r, i) => {
        const saving = r.potential_savings_monthly ?? r.savings_monthly ?? r.savings ?? r.estimated_savings ?? 0;
        return [
          i + 1,
          r.title ?? r.name ?? 'Untitled',
          (r.category ?? '—').charAt(0).toUpperCase() + (r.category ?? '').slice(1),
          saving ? `£${Number(saving).toLocaleString('en-GB')}` : '—',
          saving ? `£${(saving * 12).toLocaleString('en-GB')}` : '—',
        ];
      }),
      headStyles:         { fillColor: C.green, textColor: C.white, fontSize: 8, cellPadding: 3 },
      bodyStyles:         { fontSize: 8.5, textColor: C.darkGray, cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 } },
      alternateRowStyles: { fillColor: C.bgGray },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8, fontStyle: 'bold' },
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold' },
      },
      styles: { lineColor: C.border, lineWidth: 0.2 },
      theme: 'grid',
    });
    y = doc.lastAutoTable.finalY + 5;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.green);
    doc.text(
      `Total pending monthly savings: ${fmtGBP(pendingSavingsMonthly)}   ·   Annual: ${fmtGBP(annualROI)}`,
      M + 4, y
    );
    y += 10;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 8 — APPLIED RECOMMENDATIONS
  // ════════════════════════════════════════════════════════════════════════════
  if (applied.length > 0) {
    checkBreak(30);
    sectionHeader('Applied Recommendations', `${applied.length} completed`);

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      tableWidth: CW,
      head: [['Recommendation', 'Category', 'Monthly Saving', 'Date Applied']],
      body: applied.map(r => {
        const saving = r.potential_savings_monthly ?? r.savings_monthly ?? r.savings ?? r.estimated_savings;
        return [
          r.title ?? r.name ?? 'Untitled',
          (r.category ?? '—').charAt(0).toUpperCase() + (r.category ?? '').slice(1),
          saving != null ? `£${Number(saving).toLocaleString('en-GB')}` : '—',
          fmtDate(r.actioned_at ?? r.updated_at),
        ];
      }),
      headStyles:         { fillColor: C.charcoal, textColor: C.white, fontSize: 8, cellPadding: 3 },
      bodyStyles:         { fontSize: 8.5, textColor: C.darkGray, cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 } },
      alternateRowStyles: { fillColor: C.bgGray },
      columnStyles:       { 2: { halign: 'right', fontStyle: 'bold' } },
      styles:             { lineColor: C.border, lineWidth: 0.2 },
      theme: 'grid',
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 9 — IMPACT BY CATEGORY
  // ════════════════════════════════════════════════════════════════════════════
  if (cats.length > 0) {
    checkBreak(30);
    sectionHeader('Impact by Category');

    const catTotal = cats.reduce((s, c) => s + (c.value ?? 0), 0) || 1;
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      tableWidth: CW,
      head: [['Category', 'Total Savings', 'Share of Impact', 'Status']],
      body: cats.map(c => {
        const cat  = (c.category ?? c.label ?? '').toLowerCase();
        const val  = c.value ?? 0;
        const pct  = c.percentage ?? Math.round(val / catTotal * 100);
        const bar  = '█'.repeat(Math.round(pct / 5));
        return [
          (c.label ?? c.category ?? '—').charAt(0).toUpperCase() + (c.label ?? c.category ?? '').slice(1),
          fmtGBP(val),
          `${pct}%  ${bar}`,
          pct > 40 ? 'High impact' : pct > 20 ? 'Medium impact' : 'Low impact',
        ];
      }),
      headStyles:         { fillColor: C.charcoal, textColor: C.white, fontSize: 8, cellPadding: 3 },
      bodyStyles:         { fontSize: 8.5, textColor: C.darkGray, cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 } },
      alternateRowStyles: { fillColor: C.bgGray },
      columnStyles:       { 1: { halign: 'right', fontStyle: 'bold' }, 3: { textColor: C.midGray } },
      styles:             { lineColor: C.border, lineWidth: 0.2 },
      theme: 'grid',
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 10 — CARBON EQUIVALENCES
  // ════════════════════════════════════════════════════════════════════════════
  if (co2SavedKg > 0) {
    checkBreak(45);
    sectionHeader('Carbon Equivalences', `Based on ${co2SavedKg.toLocaleString('en-GB')} kg CO₂ reduced`);

    const equivRows = [
      ['Trees planted (1 year absorption)',     treesEquiv    != null ? `≈ ${fmtNum(treesEquiv)}` : '—',    '1 tree absorbs ≈ 21.77 kg CO₂/yr'],
      ['Car miles of driving avoided',           carMilesEquiv != null ? `≈ ${fmtNum(carMilesEquiv)}` : '—', 'UK average: 0.404 kg CO₂/mile'],
      ['London–New York flights (one way)',       flightsEquiv  != null ? `≈ ${fmtNum(flightsEquiv)}` : '—',  '≈ 255 kg CO₂ per passenger'],
    ];
    if (wasteKgDiverted > 0) {
      equivRows.push([
        'Waste CO₂ avoided via diversion',
        `≈ ${fmtNum(Math.round(wasteKgDiverted * WASTE_KG_CO2))} kg`,
        '≈ 0.5 kg CO₂ saved per kg diverted from landfill',
      ]);
    }

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      tableWidth: CW,
      head: [['Equivalent Impact', 'Estimate', 'Basis']],
      body: equivRows,
      headStyles:         { fillColor: C.green, textColor: C.white, fontSize: 8, cellPadding: 3 },
      bodyStyles:         { fontSize: 8.5, textColor: C.darkGray, cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 } },
      alternateRowStyles: { fillColor: C.bgGray },
      columnStyles: {
        1: { halign: 'right', fontStyle: 'bold', cellWidth: 34 },
        2: { textColor: C.midGray },
      },
      styles: { lineColor: C.border, lineWidth: 0.2 },
      theme: 'grid',
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 11 — ROI PROJECTION
  // ════════════════════════════════════════════════════════════════════════════
  if (pendingSavingsMonthly > 0 || totalRealized) {
    checkBreak(55);
    sectionHeader('Return on Investment Projection', 'If all pending ideas are applied');

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      tableWidth: CW,
      head: [['Metric', 'Value', 'Notes']],
      body: [
        ['Monthly saving (all pending ideas)', fmtGBP(pendingSavingsMonthly), `${pending.length} recommendation${pending.length !== 1 ? 's' : ''} pending`],
        ['Projected annual saving', fmtGBP(annualROI), 'Monthly × 12'],
        ['3-year cumulative saving', fmtGBP(threeYearROI), 'Annual × 3 (no inflation adjustment)'],
        ...(totalRealized ? [['Already realised to date', fmtGBP(totalRealized), 'From applied recommendations']] : []),
        ...(totalRealized && annualROI > 0 ? [['Total lifetime value (realised + 3yr)', fmtGBP(totalRealized + threeYearROI), 'Combined potential']] : []),
      ],
      headStyles:         { fillColor: C.green, textColor: C.white, fontSize: 8, cellPadding: 3 },
      bodyStyles:         { fontSize: 8.5, textColor: C.darkGray, cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 } },
      alternateRowStyles: { fillColor: C.bgGray },
      columnStyles: {
        1: { halign: 'right', fontStyle: 'bold', cellWidth: 38 },
        2: { textColor: C.midGray },
      },
      styles: { lineColor: C.border, lineWidth: 0.2 },
      theme: 'grid',
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
      `UK electricity rate: £${RATE_GBP}/kWh. Carbon intensity: ${CARBON_KG} kg CO₂/kWh (DEFRA 2024).`
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE FOOTERS (skip cover page = page 1)
  // ════════════════════════════════════════════════════════════════════════════
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...C.darkGray);
    doc.rect(0, 283, PAGE_W, 14, 'F');
    doc.setFillColor(...C.green);
    doc.rect(0, 283, 4, 14, 'F');
    doc.setTextColor(...C.lightGray);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `GreenPulse Analytics  ·  ${companyName}  ·  greenpulseanalytics.com`,
      M + 4, 291.5
    );
    doc.setTextColor(...C.white);
    doc.setFont('helvetica', 'bold');
    doc.text(`${i - 1}  /  ${totalPages - 1}`, PAGE_W - M, 291.5, { align: 'right' });
  }

  const safeName = companyName.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').toLowerCase();
  doc.save(`GreenPulse-Report-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
