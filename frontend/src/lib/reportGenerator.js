/**
 * Premium 5-Page Leadership Report Generator · WladBot Leader OS
 * Generates professional downloadable HTML reports with full German support
 */
export async function downloadHTMLReport({ title, subtitle, date, sections, scores, footer, analysis, challenge, userName }) {
  const now = new Date();
  const dateStr = date || now.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

  const scoreHTML = scores?.length ? `
    <div class="scores-grid">
      ${scores.map(s => `
        <div class="score-card">
          <div class="score-value" style="color: ${s.color || '#6B8A00'}">${s.value}</div>
          <div class="score-bar"><div class="score-fill" style="width: ${Math.min(typeof s.value === 'number' ? s.value : parseInt(s.value) || 50, 100)}%; background: ${s.color || '#6B8A00'}"></div></div>
          <div class="score-label">${s.label}</div>
        </div>
      `).join('')}
    </div>` : '';

  const sectionsHTML = sections?.map(s => {
    let content = '';
    if (typeof s.content === 'string') {
      content = `<p>${s.content.replace(/\n/g, '<br>')}</p>`;
    } else if (Array.isArray(s.content)) {
      content = `<ul>${s.content.map(item => `<li>${typeof item === 'string' ? item : JSON.stringify(item)}</li>`).join('')}</ul>`;
    }
    const colorClass = s.type === 'success' ? 'section-success' : s.type === 'warning' ? 'section-warning' : s.type === 'info' ? 'section-info' : '';
    return `<div class="section ${colorClass}"><h3>${s.title}</h3>${content}</div>`;
  }).join('') || '';

  // Build extended analysis sections if available
  let extendedHTML = '';
  if (analysis) {
    // Page 2: Framework Deep-Dive
    if (analysis.framework_feedback) {
      extendedHTML += `
        <div class="page-break"></div>
        <div class="page-header">Seite 2 · Framework-Analyse</div>
        <h2>Wlads 3-Säulen-Bewertung</h2>
        <div class="framework-grid">
          ${[
            { name: 'Logos (Logik)', score: analysis.logos_score, desc: 'Fakten, Daten, logische Argumentation' },
            { name: 'Ethos (Glaubwürdigkeit)', score: analysis.ethos_score, desc: 'Kompetenz, Vertrauen, Autorität' },
            { name: 'Pathos (Emotion)', score: analysis.pathos_score, desc: 'Emotionale Verbindung, Storytelling' },
          ].map(f => `
            <div class="framework-card">
              <div class="fw-name">${f.name}</div>
              <div class="fw-score" style="color: ${f.score >= 70 ? '#10B981' : f.score >= 40 ? '#F59E0B' : '#EF4444'}">${f.score || 0}/100</div>
              <div class="fw-desc">${f.desc}</div>
              <div class="score-bar"><div class="score-fill" style="width: ${f.score || 0}%; background: ${f.score >= 70 ? '#10B981' : f.score >= 40 ? '#F59E0B' : '#EF4444'}"></div></div>
            </div>
          `).join('')}
        </div>
        ${analysis.framework_feedback.drei_saeulen ? `<div class="section section-info"><h3>3-Säulen-Analyse</h3><p>${analysis.framework_feedback.drei_saeulen}</p></div>` : ''}
        ${analysis.framework_feedback.kommunikationsquadrant ? `<div class="section"><h3>Kommunikationsquadrant</h3><p>${analysis.framework_feedback.kommunikationsquadrant}</p></div>` : ''}
      `;
    }

    // Page 3: Speech Analysis
    if (analysis.speech_analysis) {
      const sa = analysis.speech_analysis;
      extendedHTML += `
        <div class="page-break"></div>
        <div class="page-header">Seite 3 · Sprachanalyse</div>
        <h2>Detaillierte Sprachanalyse</h2>
        <div class="speech-stats">
          <div class="stat-item"><span class="stat-label">Sprechtempo</span><span class="stat-value">${sa.speech_pace || 'N/A'}</span></div>
          <div class="stat-item"><span class="stat-label">Satzlänge</span><span class="stat-value">${sa.avg_sentence_length || 'N/A'}</span></div>
          <div class="stat-item"><span class="stat-label">Füllwörter</span><span class="stat-value">${sa.filler_count || 0} gefunden</span></div>
        </div>
        ${sa.filler_words?.length ? `<div class="section section-warning"><h3>Erkannte Füllwörter</h3><p>${sa.filler_words.join(', ')}</p><p class="tip">Tipp: Ersetze Füllwörter durch bewusste Pausen. Eine Pause wirkt souveräner als "ähm".</p></div>` : ''}
        ${sa.key_phrases?.length ? `<div class="section section-success"><h3>Starke Formulierungen</h3><ul>${sa.key_phrases.map(p => `<li>"${p}"</li>`).join('')}</ul></div>` : ''}
      `;
    }

    // Page 4: Rewrite + Exercises
    extendedHTML += `
      <div class="page-break"></div>
      <div class="page-header">Seite 4 · Optimierte Version & Übungen</div>
    `;
    if (analysis.rewrite_suggestion) {
      extendedHTML += `<div class="section section-info"><h3>So hätte deine Rede klingen können</h3><p class="rewrite">"${analysis.rewrite_suggestion}"</p></div>`;
    }
    if (analysis.practice_exercises?.length) {
      extendedHTML += `<div class="section"><h3>Deine persönlichen Übungen</h3><ul>${analysis.practice_exercises.map((e, i) => `<li><strong>Übung ${i + 1}:</strong> ${e}</li>`).join('')}</ul></div>`;
    }

    // Page 5: Personal Development Plan
    extendedHTML += `
      <div class="page-break"></div>
      <div class="page-header">Seite 5 · Dein persönlicher Entwicklungsplan</div>
      <h2>Nächste Schritte</h2>
      <div class="section"><h3>Wlads Assessment</h3><p>${analysis.wlad_assessment || 'Keine Bewertung verfügbar.'}</p></div>
      ${analysis.improvement_vs_previous ? `<div class="section section-info"><h3>Fortschritt vs. vorherige Versuche</h3><p>${analysis.improvement_vs_previous}</p></div>` : ''}
      <div class="section">
        <h3>Dein 7-Tage-Aktionsplan</h3>
        <ul>
          <li><strong>Tag 1-2:</strong> Wiederhole die Mission und fokussiere auf deine Schwächen.</li>
          <li><strong>Tag 3-4:</strong> Übe die vorgeschlagene Rewrite-Version vor dem Spiegel.</li>
          <li><strong>Tag 5:</strong> Nimm eine neue Version auf und vergleiche mit dieser Analyse.</li>
          <li><strong>Tag 6-7:</strong> Wende das Gelernte in einem echten Gespräch an.</li>
        </ul>
      </div>
      <div class="cta-box">
        <h3>Bereit für das nächste Level?</h3>
        <p>Buche ein 1:1 Coaching mit Wlads Team für persönliches Feedback.</p>
        <p><strong>wladbot.com/coaching</strong></p>
      </div>
    `;
  }

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} · WladBot Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, sans-serif; background: #FAFAFA; color: #1A1A2E; line-height: 1.7; }
  .container { max-width: 720px; margin: 0 auto; padding: 48px 40px; }
  .cover { background: #0A0A0A; color: white; padding: 80px 40px; text-align: center; margin: -48px -40px 40px; }
  .cover h1 { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 8px; }
  .cover .subtitle { font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 24px; }
  .cover .badge { display: inline-block; background: #BFFF00; color: #0A0A0A; font-size: 10px; font-weight: 800; padding: 4px 16px; border-radius: 999px; text-transform: uppercase; letter-spacing: 1.5px; }
  .cover .meta { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 24px; }
  .page-header { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #BFFF00; background: #0A0A0A; display: inline-block; padding: 4px 12px; border-radius: 4px; margin-bottom: 20px; }
  h2 { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 16px; letter-spacing: -0.3px; }
  .scores-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin: 24px 0; }
  .score-card { background: white; border: 1px solid #E8E8E8; border-radius: 12px; padding: 16px; text-align: center; }
  .score-value { font-size: 32px; font-weight: 900; }
  .score-bar { height: 4px; background: #F0F0F0; border-radius: 2px; margin: 8px 0; overflow: hidden; }
  .score-fill { height: 100%; border-radius: 2px; transition: width 0.5s; }
  .score-label { font-size: 11px; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .section { background: white; border: 1px solid #E8E8E8; border-radius: 12px; padding: 20px; margin: 16px 0; }
  .section h3 { font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 10px; }
  .section p { font-size: 13px; color: #444; }
  .section ul { padding-left: 20px; }
  .section ul li { font-size: 13px; color: #444; margin-bottom: 6px; }
  .section-success { border-left: 4px solid #10B981; }
  .section-warning { border-left: 4px solid #F59E0B; }
  .section-info { border-left: 4px solid #6B8A00; }
  .framework-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
  .framework-card { background: white; border: 1px solid #E8E8E8; border-radius: 12px; padding: 16px; text-align: center; }
  .fw-name { font-size: 12px; font-weight: 700; margin-bottom: 4px; }
  .fw-score { font-size: 28px; font-weight: 900; }
  .fw-desc { font-size: 10px; color: #888; margin: 4px 0 8px; }
  .speech-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
  .stat-item { background: white; border: 1px solid #E8E8E8; border-radius: 12px; padding: 16px; text-align: center; }
  .stat-label { font-size: 11px; color: #888; display: block; font-weight: 600; text-transform: uppercase; }
  .stat-value { font-size: 16px; font-weight: 800; display: block; margin-top: 4px; }
  .rewrite { font-style: italic; background: #F5FBE0; padding: 16px; border-radius: 8px; border-left: 3px solid #6B8A00; }
  .tip { font-size: 11px; color: #F59E0B; font-weight: 600; margin-top: 8px; }
  .cta-box { background: #0A0A0A; color: white; border-radius: 16px; padding: 32px; text-align: center; margin-top: 24px; }
  .cta-box h3 { color: #BFFF00; font-family: 'Outfit', sans-serif; margin-bottom: 8px; }
  .cta-box p { font-size: 13px; color: rgba(255,255,255,0.6); }
  .cta-box strong { color: #BFFF00; }
  .footer { text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #E8E8E8; font-size: 10px; color: #AAA; }
  .page-break { page-break-before: always; margin-top: 40px; padding-top: 20px; border-top: 2px solid #E8E8E8; }
  @media print { .page-break { page-break-before: always; } body { background: white; } }
</style>
</head>
<body>
<div class="container">
  <div class="cover">
    <div class="badge">WladBot Leader OS</div>
    <h1 style="margin-top: 20px">${title}</h1>
    <div class="subtitle">${subtitle || ''}</div>
    <div class="meta">${userName ? `${userName} · ` : ''}${dateStr} · Powered by Wlad Jachtchenko Methodik</div>
  </div>

  <div class="page-header">Seite 1 · Performance-Übersicht</div>
  <h2>Deine Scores</h2>
  ${scoreHTML}
  ${sectionsHTML}
  ${extendedHTML}

  <div class="footer">
    ${footer || `WladBot Leader OS · ${dateStr} · Basierend auf der Methodik von Wlad Jachtchenko · wladbot.com`}
  </div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
  const dateSuffix = now.toISOString().split('T')[0];
  return generatePDFFromHTML(html, `WladBot_Report_${safeTitle}_${dateSuffix}.pdf`, blob);
}


/**
 * Render the given HTML in a hidden iframe, snapshot it via html2canvas,
 * and return a multi-page PDF download via jsPDF. Async · falls back to
 * the legacy .html download on any error so users always get *something*.
 */
async function generatePDFFromHTML(html, filename, fallbackBlob) {
  let iframe;
  try {
    const [{ jsPDF }, html2canvasMod] = await Promise.all([
      import('jspdf'),
      import('html2canvas'),
    ]);
    const html2canvas = html2canvasMod.default || html2canvasMod;

    iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:auto;border:0;visibility:hidden;';
    // Using srcdoc (instead of legacy iframe injection methods) · safer, future-proof, no parser blocking.
    iframe.srcdoc = html;
    document.body.appendChild(iframe);

    // Wait for srcdoc parsing + fonts/layout
    await new Promise((resolve) => {
      const onLoad = () => { iframe.removeEventListener('load', onLoad); resolve(); };
      iframe.addEventListener('load', onLoad);
      // Hard timeout in case load never fires
      setTimeout(resolve, 1500);
    });
    await new Promise((r) => setTimeout(r, 200));

    const target = iframe.contentDocument.querySelector('.container') || iframe.contentDocument.body;
    const canvas = await html2canvas(target, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/jpeg', 0.92);

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;

    let heightLeft = imgH;
    let position = 0;
    pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position = heightLeft - imgH;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
      heightLeft -= pageH;
    }
    pdf.save(filename);
    return true;
  } catch (e) {
    console.error('PDF generation failed, falling back to HTML download:', e);
    // Fallback: serve the original HTML so the user still gets the report
    if (fallbackBlob) {
      const url = URL.createObjectURL(fallbackBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.replace(/\.pdf$/i, '.html');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    return false;
  } finally {
    if (iframe?.parentNode) iframe.parentNode.removeChild(iframe);
  }
}

export { generatePDFFromHTML };
