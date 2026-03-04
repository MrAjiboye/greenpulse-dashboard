/**
 * GreenPulse PDF Report Generator
 *
 * Sections:
 *   1  Cover / Header
 *   2  Executive Summary
 *   3  Performance KPIs
 *   4  Energy Consumption Summary
 *   5  Waste Management Summary
 *   6  Net Zero Progress
 *   7  Savings Trend (6 months)
 *   8  Recommended Cost-Saving Ideas (pending)
 *   9  Applied Recommendations Log
 *   10 Impact by Category
 *   11 Carbon Equivalences
 *   12 ROI Projection
 *   -- Page footers
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Constants ────────────────────────────────────────────────────────────────
const RATE_GBP  = 0.28;    // UK average electricity rate £/kWh
const CARBON_KG = 0.233;   // UK grid average kg CO2/kWh
const WASTE_KG_TO_CO2 = 0.5; // rough kg CO2 per kg landfill waste avoided

// ── Colour palette ───────────────────────────────────────────────────────────
const C = {
  green:    [16, 185, 129],
  teal:     [13, 148, 136],
  darkGray: [31, 41, 55],
  midGray:  [107, 114, 128],
  lightGray:[156, 163, 175],
  lightBg:  [249, 250, 251],
  border:   [229, 231, 235],
  white:    [255, 255, 255],
  red:      [239, 68, 68],
  amber:    [217, 119, 6],
  blue:     [59, 130, 246],
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function fmtGBP(val) {
  if (val == null || isNaN(val)) return '—';
  if (val >= 1000000) return `£${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000)    return `£${(val / 1000).toFixed(1)}k`;
  return `£${Number(val).toLocaleString('en-GB')}`;
}

function fmtNum(val, dp = 0) {
  if (val == null || isNaN(val)) return '—';
  return Number(val).toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

/**
 * @param {object} params
 * @param {object}  params.performance    reportsAPI.getPerformance()
 * @param {Array}   params.insightsLog    reportsAPI.getInsightsLog()
 * @param {object}  params.dashStats      dashboardAPI.getStats()
 * @param {Array}   params.wasteBreakdown wasteAPI.getBreakdown()
 * @param {object}  params.user           logged-in user from AuthContext
 */
export function generateReport({ performance, insightsLog = [], dashStats, wasteBreakdown = [], user }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PAGE_W  = 210;
  const M       = 14;
  const CONT_W  = PAGE_W - M * 2;
  let y = 0;

  // ── Extract performance fields ─────────────────────────────────────────────
  const totalRealized  = performance?.total_realized_savings ?? performance?.realized_savings;
  const totalPotential = performance?.potential_savings ?? performance?.pending_savings;
  const appliedCount   = performance?.insights_applied ?? performance?.applied_count;
  const totalCount     = performance?.insights_total ?? performance?.total_count;
  const co2Reduced     = performance?.co2e_reduced_tons ?? performance?.co2_reduced;
  const trend          = performance?.savings_trend ?? [];
  const cats           = performance?.category_breakdown ?? [];

  // ── Company / site identity ────────────────────────────────────────────────
  const companyName = user?.company_name?.trim()
    || user?.department?.trim()
    || `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()
    || 'Your Organisation';
  const reportedBy  = user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '';
  const userTitle   = user?.job_title ?? '';
  const reportDate  = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const periodStart = trend.length > 0 ? (trend[0].month ?? trend[0].period ?? '') : '';
  const periodEnd   = trend.length > 0 ? (trend[trend.length - 1].month ?? trend[trend.length - 1].period ?? '') : '';
  const period      = periodStart && periodEnd ? `${periodStart} – ${periodEnd}` : 'Last 6 months';

  // ── Net Zero calculation ───────────────────────────────────────────────────
  const co2SavedKg     = co2Reduced != null ? Math.round(co2Reduced * 1000) : null;
  const co2PotentialKg = totalPotential != null ? Math.round(totalPotential / RATE_GBP * CARBON_KG) : null;
  const totalOpKg      = (co2SavedKg ?? 0) + (co2PotentialKg ?? 0);
  const netZeroPct     = totalOpKg > 0 && co2SavedKg != null
    ? Math.min(100, Math.round((co2SavedKg / totalOpKg) * 100))
    : null;

  // ── Insight splits ─────────────────────────────────────────────────────────
  const pending  = insightsLog.filter(r => (r.status ?? '').toLowerCase() === 'pending');
  const applied  = insightsLog.filter(r => (r.status ?? '').toLowerCase() === 'applied');

  // ── Energy stats from dashStats ────────────────────────────────────────────
  const currentKwh   = dashStats?.current_energy_kwh;
  const totalSavings = dashStats?.total_savings ?? totalRealized;
  const carbonSaved  = dashStats?.carbon_reduced_tons ?? co2Reduced;

  // ── Waste stats ────────────────────────────────────────────────────────────
  const totalWasteKg  = wasteBreakdown.reduce((s, b) => s + (parseFloat(b.weight_kg ?? b.weight ?? b.amount_kg ?? 0) || 0), 0);
  const landfillKg    = wasteBreakdown
    .filter(b => { const n = (b.stream ?? b.category ?? b.type ?? b.name ?? '').toLowerCase(); return n.includes('general') || n.includes('landfill') || n.includes('residual'); })
    .reduce((s, b) => s + (parseFloat(b.weight_kg ?? b.weight ?? b.amount_kg ?? 0) || 0), 0);
  const diversionRate = totalWasteKg > 0 ? Math.round(((totalWasteKg - landfillKg) / totalWasteKg) * 100) : null;
  const wasteKgDiverted = totalWasteKg - landfillKg;

  // ── ROI projection ─────────────────────────────────────────────────────────
  const pendingSavingsMonthly = pending.reduce((s, r) => s + (r.potential_savings_monthly ?? r.savings_monthly ?? 0), 0);
  const annualROI = pendingSavingsMonthly * 12;
  const threeYearROI = annualROI * 3;

  // ── Carbon equivalences (from co2SavedKg) ─────────────────────────────────
  const treesEquiv      = co2SavedKg != null ? Math.round(co2SavedKg / 21.77) : null; // 1 tree absorbs ~21.77 kg CO2/yr
  const carMilesEquiv   = co2SavedKg != null ? Math.round(co2SavedKg / 0.404) : null; // 0.404 kg CO2 per car mile (UK avg)
  const flightsEquiv    = co2SavedKg != null ? Math.round(co2SavedKg / 255)   : null; // ~255 kg CO2 per London-NY flight

  // ── Page / layout helpers ──────────────────────────────────────────────────
  const checkPageBreak = (needed = 30) => {
    if (y + needed > 272) { doc.addPage(); y = 14; }
  };

  const sectionHeader = (title, subtitle) => {
    checkPageBreak(14);
    doc.setFillColor(...C.lightBg);
    doc.rect(M, y, CONT_W, 8, 'F');
    doc.setFillColor(...C.green);
    doc.rect(M, y, 2.5, 8, 'F');
    doc.setTextColor(...C.green);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), M + 5, y + 5.3);
    if (subtitle) {
      doc.setTextColor(...C.midGray);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, PAGE_W - M, y + 5.3, { align: 'right' });
    }
    y += 11;
  };

  const kv = (label, value, valColor, indent = 0) => {
    checkPageBreak(7);
    doc.setTextColor(...C.midGray);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(label, M + 3 + indent, y);
    doc.setTextColor(...(valColor ?? C.darkGray));
    doc.setFont('helvetica', 'bold');
    doc.text(String(value ?? '—'), M + 80, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
  };

  const smallNote = (text) => {
    checkPageBreak(8);
    doc.setTextColor(...C.lightGray);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    const lines = doc.splitTextToSize(text, CONT_W - 6);
    doc.text(lines, M + 3, y);
    y += lines.length * 3.8 + 2;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 0 — COVER HEADER
  // ═══════════════════════════════════════════════════════════════════════════
  // Green header bar
  doc.setFillColor(...C.green);
  doc.rect(0, 0, PAGE_W, 28, 'F');

  // Subtle teal gradient band
  doc.setFillColor(...C.teal);
  doc.rect(0, 22, PAGE_W, 6, 'F');

  // Logo box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(M, 6, 14, 14, 2.5, 2.5, 'F');
  doc.setTextColor(...C.green);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('GP', M + 3.5, 15);

  // Brand name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GreenPulse Analytics', M + 20, 13);

  // Report subtitle
  doc.setTextColor(200, 245, 225);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Site Performance & Net Zero Report', M + 20, 20);

  // Date + confidential on right
  doc.setTextColor(200, 245, 225);
  doc.setFontSize(8);
  doc.text(`Generated: ${reportDate}`, PAGE_W - M, 13, { align: 'right' });
  doc.text('Confidential', PAGE_W - M, 20, { align: 'right' });

  y = 32;

  // ── Company / site banner ─────────────────────────────────────────────────
  doc.setFillColor(240, 253, 244); // very light green
  doc.rect(M, y, CONT_W, 18, 'F');
  doc.setDrawColor(...C.green);
  doc.setLineWidth(0.3);
  doc.rect(M, y, CONT_W, 18, 'S');

  doc.setTextColor(...C.darkGray);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, M + 5, y + 7);

  doc.setTextColor(...C.midGray);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  const subLine = [
    period ? `Reporting period: ${period}` : null,
    reportedBy ? `Prepared by: ${reportedBy}${userTitle ? `, ${userTitle}` : ''}` : null,
  ].filter(Boolean).join('   ·   ');
  doc.text(subLine, M + 5, y + 14);

  y += 22;

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 1 — EXECUTIVE SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  sectionHeader('Executive Summary');

  const savingsLine  = totalRealized != null ? `£${Number(totalRealized).toLocaleString('en-GB')} in savings realised` : null;
  const potentialLine= totalPotential != null ? `£${Number(totalPotential).toLocaleString('en-GB')} in further savings identified` : null;
  const co2Line      = co2Reduced != null ? `${co2Reduced.toFixed(2)} tonnes of CO\u2082 reduced` : null;
  const insightLine  = appliedCount != null ? `${appliedCount} recommendation${appliedCount !== 1 ? 's' : ''} applied` : null;
  const progressLine = netZeroPct != null ? `${netZeroPct}% progress toward full identified carbon reduction` : null;
  const wasteLines   = diversionRate != null ? `${diversionRate}% waste diversion rate (last 30 days)` : null;

  const summaryBullets = [savingsLine, potentialLine, co2Line, insightLine, progressLine, wasteLines].filter(Boolean);

  doc.setTextColor(...C.darkGray);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');

  if (summaryBullets.length > 0) {
    summaryBullets.forEach(bullet => {
      checkPageBreak(6);
      doc.setFillColor(...C.green);
      doc.circle(M + 4, y - 1.2, 1, 'F');
      doc.setTextColor(...C.darkGray);
      doc.text(bullet, M + 7, y);
      y += 5.5;
    });
    y += 3;
  } else {
    doc.setTextColor(...C.midGray);
    doc.text('No performance data available for this period.', M + 3, y);
    y += 8;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 2 — PERFORMANCE KPIs
  // ═══════════════════════════════════════════════════════════════════════════
  sectionHeader('Performance Summary', period);

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    tableWidth: CONT_W,
    head: [['Total Savings\nRealised', 'Further\nPotential', 'Ideas\nApplied', 'CO\u2082\nReduced']],
    body: [[
      totalRealized  != null ? `£${Number(totalRealized).toLocaleString('en-GB')}` : '—',
      totalPotential != null ? `£${Number(totalPotential).toLocaleString('en-GB')}` : '—',
      appliedCount   != null ? `${appliedCount}${totalCount ? ` of ${totalCount}` : ''}` : '—',
      co2Reduced     != null ? `${co2Reduced.toFixed(2)} T` : '—',
    ]],
    headStyles: {
      fillColor: C.green, textColor: 255, fontSize: 7.5,
      fontStyle: 'bold', halign: 'center', cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 14, fontStyle: 'bold', halign: 'center',
      textColor: C.darkGray, cellPadding: { top: 5, bottom: 5 },
    },
    theme: 'grid',
    styles: { lineColor: C.border, lineWidth: 0.2 },
  });
  y = doc.lastAutoTable.finalY + 9;

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 3 — ENERGY CONSUMPTION SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  checkPageBreak(35);
  sectionHeader('Energy Consumption Summary');

  if (currentKwh != null) {
    kv('Current consumption:', `${fmtNum(currentKwh, 1)} kWh   (\u2248 \u00a3${(currentKwh * RATE_GBP).toFixed(2)} / hr at UK rate)`);
  }
  if (totalSavings != null) {
    kv('Total cost savings achieved:', fmtGBP(totalSavings));
  }
  if (carbonSaved != null) {
    kv('Carbon emissions reduced:', `${Number(carbonSaved).toFixed(2)} tonnes CO\u2082`);
  }
  if (currentKwh != null) {
    const projMonthlyKwh = currentKwh * 24 * 30;
    kv('Projected monthly energy use:', `\u2248 ${fmtNum(projMonthlyKwh)} kWh   (\u2248 ${fmtGBP(projMonthlyKwh * RATE_GBP)} / month)`);
    kv('Projected monthly CO\u2082 output:', `\u2248 ${fmtNum(projMonthlyKwh * CARBON_KG)} kg CO\u2082`);
  }
  if (currentKwh == null && totalSavings == null) {
    doc.setTextColor(...C.midGray);
    doc.setFontSize(8.5);
    doc.text('No live energy data available.', M + 3, y);
    y += 8;
  }
  y += 2;

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 4 — WASTE MANAGEMENT SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  if (wasteBreakdown.length > 0) {
    checkPageBreak(35);
    sectionHeader('Waste Management Summary', 'Last 30 days');

    kv('Total waste generated:', `${fmtNum(totalWasteKg, 1)} kg  (${(totalWasteKg / 1000).toFixed(2)} tonnes)`);
    kv('Landfill / general waste:', `${fmtNum(landfillKg, 1)} kg`);
    kv('Diverted (recycled / composted):', `${fmtNum(wasteKgDiverted, 1)} kg`);
    if (diversionRate != null) {
      kv('Diversion rate:', `${diversionRate}%`, diversionRate >= 70 ? C.green : diversionRate >= 50 ? C.amber : C.red);
    }

    y += 3;
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      tableWidth: CONT_W,
      head: [['Waste Stream', 'Weight (kg)', 'Share (%)', 'CO\u2082 Equivalent']],
      body: wasteBreakdown.map(b => {
        const name   = b.stream ?? b.category ?? b.type ?? b.name ?? 'Unknown';
        const kg     = parseFloat(b.weight_kg ?? b.weight ?? b.amount_kg ?? 0) || 0;
        const pct    = totalWasteKg > 0 ? ((kg / totalWasteKg) * 100).toFixed(1) : '—';
        const isLandfill = name.toLowerCase().includes('general') || name.toLowerCase().includes('landfill');
        const co2e   = isLandfill ? `\u2248 ${fmtNum(kg * WASTE_KG_TO_CO2)} kg` : 'Diverted';
        return [name, fmtNum(kg, 1), `${pct}%`, co2e];
      }),
      headStyles: { fillColor: [55, 65, 81], textColor: 255, fontSize: 8, cellPadding: 2.5 },
      bodyStyles: { fontSize: 8.5, textColor: C.darkGray },
      alternateRowStyles: { fillColor: C.lightBg },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
      styles: { lineColor: C.border, lineWidth: 0.2 },
      theme: 'grid',
    });
    y = doc.lastAutoTable.finalY + 9;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 5 — NET ZERO PROGRESS
  // ═══════════════════════════════════════════════════════════════════════════
  checkPageBreak(55);
  sectionHeader('Net Zero Progress');

  kv('CO\u2082 reduced to date:', co2SavedKg != null ? `${fmtNum(co2SavedKg)} kg  (${co2Reduced.toFixed(2)} tonnes)` : '—');
  kv('Remaining identified CO\u2082 potential:', co2PotentialKg != null ? `\u2248 ${fmtNum(co2PotentialKg)} kg  (if all pending ideas applied)` : '—');
  kv('Total identified CO\u2082 opportunity:', totalOpKg > 0 ? `${fmtNum(totalOpKg)} kg` : '—');
  if (netZeroPct != null) {
    kv('Progress toward full reduction:', `${netZeroPct}%`, C.green);
    y += 2;

    // Progress bar
    const barW   = CONT_W - 6;
    doc.setFillColor(...C.border);
    doc.roundedRect(M + 3, y, barW, 7, 3.5, 3.5, 'F');

    const fillClr = netZeroPct >= 75 ? C.green : netZeroPct >= 40 ? [251, 191, 36] : C.red;
    const fillW   = Math.max(7, barW * netZeroPct / 100);
    doc.setFillColor(...fillClr);
    doc.roundedRect(M + 3, y, fillW, 7, 3.5, 3.5, 'F');

    if (netZeroPct > 10) {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(`${netZeroPct}%`, M + 3 + fillW / 2, y + 4.8, { align: 'center' });
    }
    y += 12;

    smallNote(
      `Methodology: Progress = CO\u2082 already reduced \u00f7 (CO\u2082 reduced + estimated remaining potential). ` +
      `Remaining potential derived from pending insight savings \u00f7 \u00a3${RATE_GBP}/kWh \u00d7 ${CARBON_KG} kg CO\u2082/kWh (UK grid average). ` +
      `100% = all identified reduction opportunities unlocked.`
    );
  } else {
    y += 4;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — SAVINGS TREND
  // ═══════════════════════════════════════════════════════════════════════════
  if (trend.length > 0) {
    checkPageBreak(25);
    sectionHeader('Monthly Savings Trend', 'Realised vs. Potential');

    const trendTotals = trend.reduce((acc, t) => {
      acc.realized  += t.realized  ?? t.realized_savings  ?? 0;
      acc.potential += t.potential ?? t.potential_savings ?? 0;
      return acc;
    }, { realized: 0, potential: 0 });

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      tableWidth: CONT_W,
      head: [['Month', 'Realised Savings', 'Potential Savings', 'Untapped']],
      body: [
        ...trend.map(t => {
          const real = t.realized ?? t.realized_savings ?? 0;
          const pot  = t.potential ?? t.potential_savings ?? 0;
          const gap  = pot - real;
          return [
            t.month ?? t.period ?? '—',
            `£${real.toLocaleString('en-GB')}`,
            `£${pot.toLocaleString('en-GB')}`,
            gap > 0 ? `£${gap.toLocaleString('en-GB')}` : 'Fully realised',
          ];
        }),
        // Totals row
        [
          'TOTAL',
          `£${trendTotals.realized.toLocaleString('en-GB')}`,
          `£${trendTotals.potential.toLocaleString('en-GB')}`,
          trendTotals.potential > trendTotals.realized
            ? `£${(trendTotals.potential - trendTotals.realized).toLocaleString('en-GB')}`
            : 'Fully realised',
        ],
      ],
      headStyles: { fillColor: [55, 65, 81], textColor: 255, fontSize: 8, cellPadding: 2.5 },
      bodyStyles: { fontSize: 8.5, textColor: C.darkGray },
      alternateRowStyles: { fillColor: C.lightBg },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right', textColor: C.midGray } },
      styles: { lineColor: C.border, lineWidth: 0.2 },
      theme: 'grid',
      didParseCell: (data) => {
        if (data.row.index === trend.length) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 253, 244];
        }
      },
    });
    y = doc.lastAutoTable.finalY + 9;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 7 — RECOMMENDED COST-SAVING IDEAS
  // ═══════════════════════════════════════════════════════════════════════════
  checkPageBreak(20);
  sectionHeader('Recommended Cost-Saving Ideas', `${pending.length} pending`);

  if (pending.length === 0) {
    doc.setTextColor(...C.midGray);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'italic');
    doc.text('All identified recommendations have been actioned — no pending ideas.', M + 3, y);
    y += 10;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      tableWidth: CONT_W,
      head: [['#', 'Recommendation', 'Category', 'Saving / month', 'CO\u2082 / month', 'Annual ROI']],
      body: pending.map((r, i) => {
        const saving  = r.potential_savings_monthly ?? r.savings_monthly ?? r.savings ?? 0;
        const co2Est  = saving > 0 ? `\u2248 ${Math.round(saving / RATE_GBP * CARBON_KG)} kg` : '—';
        const annualR = saving > 0 ? `£${(saving * 12).toLocaleString('en-GB')}` : '—';
        return [
          i + 1,
          r.title ?? r.name ?? 'Untitled',
          r.category ?? '—',
          saving > 0 ? `£${saving.toLocaleString('en-GB')}` : '—',
          co2Est,
          annualR,
        ];
      }),
      headStyles: { fillColor: C.green, textColor: 255, fontSize: 7.5, cellPadding: 2.5 },
      bodyStyles: { fontSize: 8, textColor: C.darkGray },
      alternateRowStyles: { fillColor: C.lightBg },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        3: { halign: 'right' },
        4: { halign: 'right', textColor: C.midGray },
        5: { halign: 'right', fontStyle: 'bold' },
      },
      styles: { lineColor: C.border, lineWidth: 0.2 },
      theme: 'grid',
    });
    y = doc.lastAutoTable.finalY + 4;

    // Total row
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.green);
    doc.text(
      `Total pending monthly savings: £${pendingSavingsMonthly.toLocaleString('en-GB')}   ·   Annual: £${annualROI.toLocaleString('en-GB')}`,
      M + 3, y
    );
    y += 8;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 8 — APPLIED RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  if (applied.length > 0) {
    checkPageBreak(20);
    sectionHeader('Applied Recommendations', `${applied.length} completed`);

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      tableWidth: CONT_W,
      head: [['Recommendation', 'Category', 'Saving / month', 'Date Applied']],
      body: applied.map(r => {
        const saving = r.potential_savings_monthly ?? r.savings_monthly ?? r.savings;
        return [
          r.title ?? r.name ?? 'Untitled',
          r.category ?? '—',
          saving != null ? `£${Number(saving).toLocaleString('en-GB')}` : '—',
          fmtDate(r.actioned_at ?? r.updated_at),
        ];
      }),
      headStyles: { fillColor: [55, 65, 81], textColor: 255, fontSize: 8, cellPadding: 2.5 },
      bodyStyles: { fontSize: 8, textColor: C.darkGray },
      alternateRowStyles: { fillColor: C.lightBg },
      columnStyles: { 2: { halign: 'right' } },
      styles: { lineColor: C.border, lineWidth: 0.2 },
      theme: 'grid',
    });
    y = doc.lastAutoTable.finalY + 9;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 9 — IMPACT BY CATEGORY
  // ═══════════════════════════════════════════════════════════════════════════
  if (cats.length > 0) {
    checkPageBreak(20);
    sectionHeader('Impact by Category');

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      tableWidth: CONT_W,
      head: [['Category', 'Share of Total Impact']],
      body: cats.map(c => [c.category ?? c.label ?? '—', `${c.percentage ?? c.value ?? 0}%`]),
      headStyles: { fillColor: [55, 65, 81], textColor: 255, fontSize: 8, cellPadding: 2.5 },
      bodyStyles: { fontSize: 8.5, textColor: C.darkGray },
      alternateRowStyles: { fillColor: C.lightBg },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      styles: { lineColor: C.border, lineWidth: 0.2 },
      theme: 'grid',
    });
    y = doc.lastAutoTable.finalY + 9;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 10 — CARBON EQUIVALENCES
  // ═══════════════════════════════════════════════════════════════════════════
  if (co2SavedKg != null && co2SavedKg > 0) {
    checkPageBreak(40);
    sectionHeader('Carbon Equivalences', `Based on ${co2SavedKg.toLocaleString('en-GB')} kg CO\u2082 reduced to date`);

    const equivRows = [
      ['Trees planted (1 year of absorption)',  treesEquiv   != null ? `\u2248 ${fmtNum(treesEquiv)}` : '—',  '1 tree absorbs \u2248 21.77 kg CO\u2082/yr'],
      ['Car miles avoided',                      carMilesEquiv != null ? `\u2248 ${fmtNum(carMilesEquiv)}` : '—', 'UK average: 0.404 kg CO\u2082/mile'],
      ['London\u2013New York flights equivalent', flightsEquiv != null ? `\u2248 ${fmtNum(flightsEquiv)}` : '—',  '\u2248 255 kg CO\u2082 per passenger (one way)'],
    ];

    if (wasteKgDiverted > 0) {
      const wasteCarbon = Math.round(wasteKgDiverted * WASTE_KG_TO_CO2);
      equivRows.push([
        'Waste CO\u2082 avoided (diversion)',
        `\u2248 ${fmtNum(wasteCarbon)} kg`,
        `\u2248 0.5 kg CO\u2082 saved per kg diverted from landfill`,
      ]);
    }

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      tableWidth: CONT_W,
      head: [['Equivalent Impact', 'Estimate', 'Basis']],
      body: equivRows,
      headStyles: { fillColor: C.green, textColor: 255, fontSize: 8, cellPadding: 2.5 },
      bodyStyles: { fontSize: 8.5, textColor: C.darkGray },
      alternateRowStyles: { fillColor: C.lightBg },
      columnStyles: {
        1: { halign: 'right', fontStyle: 'bold', cellWidth: 32 },
        2: { textColor: C.midGray, cellWidth: 65 },
      },
      styles: { lineColor: C.border, lineWidth: 0.2 },
      theme: 'grid',
    });
    y = doc.lastAutoTable.finalY + 9;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 11 — ROI PROJECTION
  // ═══════════════════════════════════════════════════════════════════════════
  if (pendingSavingsMonthly > 0 || totalRealized != null) {
    checkPageBreak(50);
    sectionHeader('Return on Investment Projection', 'If all pending ideas are applied');

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      tableWidth: CONT_W,
      head: [['Metric', 'Value', 'Notes']],
      body: [
        [
          'Monthly saving (pending ideas)',
          fmtGBP(pendingSavingsMonthly),
          `${pending.length} pending recommendation${pending.length !== 1 ? 's' : ''}`,
        ],
        [
          'Projected annual saving',
          fmtGBP(annualROI),
          'Monthly \u00d7 12',
        ],
        [
          '3-year cumulative saving',
          fmtGBP(threeYearROI),
          'Annual \u00d7 3 (no inflation adj.)',
        ],
        ...(totalRealized != null ? [[
          'Already realised (to date)',
          fmtGBP(totalRealized),
          'From applied recommendations',
        ]] : []),
        ...(totalRealized != null && annualROI > 0 ? [[
          'Total lifetime value (realised + 3yr)',
          fmtGBP((totalRealized ?? 0) + threeYearROI),
          'Combined potential',
        ]] : []),
      ],
      headStyles: { fillColor: C.green, textColor: 255, fontSize: 8, cellPadding: 2.5 },
      bodyStyles: { fontSize: 8.5, textColor: C.darkGray },
      alternateRowStyles: { fillColor: C.lightBg },
      columnStyles: {
        1: { halign: 'right', fontStyle: 'bold', cellWidth: 38 },
        2: { textColor: C.midGray },
      },
      styles: { lineColor: C.border, lineWidth: 0.2 },
      theme: 'grid',
      didParseCell: (data) => {
        // Highlight the total lifetime value row
        const lastIdx = (totalRealized != null && annualROI > 0) ? 4 : -1;
        if (data.row.index === lastIdx) {
          data.cell.styles.fillColor = [240, 253, 244];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
    y = doc.lastAutoTable.finalY + 6;

    smallNote(
      `Projection assumes consistent application of all pending recommendations. ` +
      `Figures are estimates only; actual savings may vary by usage patterns and tariff changes. ` +
      `UK electricity rate: \u00a3${RATE_GBP}/kWh. Carbon intensity: ${CARBON_KG} kg CO\u2082/kWh (DEFRA 2024).`
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE FOOTERS
  // ═══════════════════════════════════════════════════════════════════════════
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...C.lightBg);
    doc.rect(0, 286, PAGE_W, 11, 'F');
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.line(0, 286, PAGE_W, 286);
    doc.setTextColor(...C.midGray);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `GreenPulse Analytics \u00b7 ${companyName} \u00b7 greenpulseanalytics.com`,
      M, 292
    );
    doc.text(`Page ${i} of ${totalPages}`, PAGE_W - M, 292, { align: 'right' });
  }

  const safeCompany = companyName.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').toLowerCase();
  const filename = `GreenPulse-Report-${safeCompany}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
