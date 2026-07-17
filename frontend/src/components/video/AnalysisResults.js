import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Trophy, Target, ArrowLeft, ArrowRight, Star, Download,
  CheckCircle2, Lightbulb, TrendingUp
} from 'lucide-react';
import VoicePlayButton from '../shared/VoicePlayButton';

export const AnalysisResults = ({
  analysis, activeChallenge, resetChallenge, handleDownloadReport,
  setShowUpsell, lang
}) => {
  const de = lang === 'de';

  return (
    <div className="space-y-6 animate-fade-in" data-testid="video-results">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={resetChallenge} className="font-semibold">
          <ArrowLeft size={16} className="mr-1" /> {de ? 'Zurück zur Video Analyse' : 'Back to Video Analysis'}
        </Button>
        <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 text-xs font-bold px-3 py-1">
          {de ? 'MISSION ABGESCHLOSSEN' : 'MISSION COMPLETE'}
        </Badge>
      </div>

      {/* Score Hero */}
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
          <Trophy size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-black">{activeChallenge?.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{de ? 'Deine persönliche Performance-Analyse nach Wlad Jachtchenko' : 'Your personal performance analysis by Wlad Jachtchenko'}</p>
      </div>

      {/* Overall + Category Scores */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3" data-testid="video-scores">
        {[
          { label: de ? 'Gesamt' : 'Overall', score: analysis.overall_score, gradient: 'from-amber-500 to-orange-500', color: '#F59E0B' },
          { label: de ? 'Klarheit' : 'Clarity', score: analysis.clarity_score, gradient: 'from-[#00AAFF] to-[#0088DD]', color: '#00AAFF' },
          { label: de ? 'Selbstvertrauen' : 'Confidence', score: analysis.confidence_score, gradient: 'from-[#BFFF00] to-[#9ACC00]', color: '#7C3AED' },
          { label: de ? 'Empathie' : 'Empathy', score: analysis.empathy_score, gradient: 'from-pink-500 to-rose-500', color: '#EC4899' },
          { label: de ? 'Struktur' : 'Structure', score: analysis.structure_score, gradient: 'from-green-500 to-emerald-500', color: '#10B981' },
        ].map((s) => (
          <Card key={s.label} className="bg-white/60 dark:bg-card/50 border-black/[0.04] dark:border-white/[0.06]">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.score || 0}</p>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-muted mt-2 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${s.gradient} transition-all duration-1000`} style={{ width: `${s.score || 0}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-semibold">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3 Pillars */}
      {(analysis.logos_score || analysis.ethos_score || analysis.pathos_score) && (
        <Card className="bg-gradient-to-r from-[#BFFF00]/[0.06] to-[#BFFF00]/[0.04] dark:from-[#BFFF00]/[0.04] dark:to-[#BFFF00]/[0.03] border-[#BFFF00]/20 dark:border-[#BFFF00]/10">
          <CardContent className="p-5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#4A6200] dark:text-[#BFFF00] mb-3">
              {de ? '3 Säulen der Überzeugung (Wlad-Framework)' : '3 Pillars of Persuasion (Wlad Framework)'}
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Logos', desc: de ? 'Logik & Daten' : 'Logic & Data', score: analysis.logos_score, color: '#6366F1' },
                { label: 'Ethos', desc: de ? 'Glaubwuerdigkeit' : 'Credibility', score: analysis.ethos_score, color: '#8B5CF6' },
                { label: 'Pathos', desc: de ? 'Emotion' : 'Emotion', score: analysis.pathos_score, color: '#A78BFA' },
              ].map((p) => (
                <div key={p.label} className="text-center">
                  <p className="text-2xl font-black" style={{ color: p.color }}>{p.score || 0}</p>
                  <p className="text-xs font-bold mt-1">{p.label}</p>
                  <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wlad's Assessment */}
      {analysis.wlad_assessment && (
        <Card className="overflow-hidden border-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white" data-testid="wlad-assessment">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=WladJachtchenko&backgroundColor=6366F1" alt="Wlad"
                className="w-12 h-12 rounded-full ring-2 ring-white/20 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                  <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Wlad Jachtchenkos Einschätzung</p>
                  <div className="flex items-center gap-2">
                    {/* Iter 92.6: VoiceSpeedToggle removed · after a passed
                        video test the user is in flow-state, we don't want
                        to tempt them into a slower playback. Wlad's voice
                        plays at the saved preferred speed (1.25× default). */}
                    <VoicePlayButton
                      text={analysis.wlad_assessment}
                      persona="wlad"
                      size="sm"
                      variant="pill"
                      label={de ? 'Anhören' : 'Listen'}
                      testId="wlad-assessment-play"
                      showWave
                    />
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-white/90">{analysis.wlad_assessment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Framework Feedback */}
      {analysis.framework_feedback && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.framework_feedback.drei_saeulen && (
            <Card className="border-[#BFFF00]/20 dark:border-[#BFFF00]/10">
              <CardContent className="p-5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#4A6200] dark:text-[#BFFF00] mb-2">
                  {de ? '3 Säulen Analyse' : '3 Pillars Analysis'}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{analysis.framework_feedback.drei_saeulen}</p>
              </CardContent>
            </Card>
          )}
          {analysis.framework_feedback.kommunikationsquadrant && (
            <Card className="border-emerald-200/30 dark:border-emerald-500/10">
              <CardContent className="p-5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                  {de ? 'Kommunikationsquadrant' : 'Communication Quadrant'}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{analysis.framework_feedback.kommunikationsquadrant}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Transcript */}
      {analysis.transcript && (
        <Card className="bg-white/80 dark:bg-card/80 border-black/[0.04] dark:border-white/[0.06]">
          <CardContent className="p-5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{de ? 'Dein Transkript' : 'Your Transcript'}</h4>
            <p className="text-sm italic text-muted-foreground leading-relaxed">"{analysis.transcript}"</p>
          </CardContent>
        </Card>
      )}

      {/* Speech Analysis */}
      {analysis.speech_analysis && (
        <Card className="bg-white/80 dark:bg-card/80 border-black/[0.04] dark:border-white/[0.06]">
          <CardContent className="p-5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{de ? 'Rede-Analyse' : 'Speech Analysis'}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {analysis.speech_analysis.filler_count !== undefined && (
                <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-muted">
                  <p className="text-xl font-black text-amber-500">{analysis.speech_analysis.filler_count}</p>
                  <p className="text-[10px] text-muted-foreground font-bold">{de ? 'Fuellwoerter' : 'Filler Words'}</p>
                </div>
              )}
              {analysis.speech_analysis.avg_sentence_length && (
                <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-muted">
                  <p className="text-sm font-bold capitalize">{analysis.speech_analysis.avg_sentence_length}</p>
                  <p className="text-[10px] text-muted-foreground font-bold">{de ? 'Satzlaenge' : 'Sentence Length'}</p>
                </div>
              )}
              {analysis.speech_analysis.speech_pace && (
                <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-muted">
                  <p className="text-sm font-bold capitalize">{analysis.speech_analysis.speech_pace}</p>
                  <p className="text-[10px] text-muted-foreground font-bold">{de ? 'Tempo' : 'Pace'}</p>
                </div>
              )}
              {analysis.speech_analysis.key_phrases?.length > 0 && (
                <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-500/10 col-span-2 sm:col-span-1">
                  <p className="text-sm font-bold text-green-600">{analysis.speech_analysis.key_phrases.length}</p>
                  <p className="text-[10px] text-muted-foreground font-bold">{de ? 'Starke Phrasen' : 'Strong Phrases'}</p>
                </div>
              )}
            </div>
            {analysis.speech_analysis.filler_words?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {analysis.speech_analysis.filler_words.map((w, wIdx) => (
                  <span key={`filler-${w}-${wIdx}`} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">"{w}"</span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {analysis.strengths?.length > 0 && (
          <Card className="border-l-[3px] border-l-green-500 bg-white/80 dark:bg-card/80 border-black/[0.04] dark:border-white/[0.06]">
            <CardContent className="p-5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-3">{de ? 'Stärken' : 'Strengths'}</h4>
              <ul className="space-y-2">
                {analysis.strengths.map((s, sIdx) => (
                  <li key={`strength-${sIdx}`} className="flex gap-2 text-sm"><CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {analysis.improvements?.length > 0 && (
          <Card className="border-l-[3px] border-l-amber-500 bg-white/80 dark:bg-card/80 border-black/[0.04] dark:border-white/[0.06]">
            <CardContent className="p-5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3">{de ? 'Verbesserungspotenzial' : 'Areas to Improve'}</h4>
              <ul className="space-y-2">
                {analysis.improvements.map((s, iIdx) => (
                  <li key={`improve-${iIdx}`} className="flex gap-2 text-sm"><Target size={14} className="text-amber-500 shrink-0 mt-0.5" />{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Practice Exercises */}
      {analysis.practice_exercises?.length > 0 && (
        <Card className="border-[#BFFF00]/20 dark:border-[#BFFF00]/10 bg-[#BFFF00]/[0.06] dark:bg-[#BFFF00]/5">
          <CardContent className="p-5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#4A6200] dark:text-[#BFFF00] mb-3">
              <Lightbulb size={11} className="inline mr-1" /> {de ? 'Übungen für morgen' : 'Practice for Tomorrow'}
            </h4>
            <ul className="space-y-2">
              {analysis.practice_exercises.map((ex, exIdx) => (
                <li key={`ex-${exIdx}`} className="flex gap-2 text-sm">
                  <span className="text-xs font-black text-[#6B8A00] dark:text-[#BFFF00] w-5 shrink-0">{exIdx + 1}.</span>
                  {ex}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Improvement vs Previous */}
      {analysis.improvement_vs_previous && analysis.improvement_vs_previous !== 'null' && (
        <Card className="bg-gradient-to-r from-gray-50 to-[#BFFF00]/[0.04] dark:from-white/[0.02] dark:to-[#BFFF00]/[0.03] border-sky-200/30 dark:border-white/[0.06]">
          <CardContent className="p-5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-2">
              <TrendingUp size={11} className="inline mr-1" /> {de ? 'Vergleich mit vorherigen Versuchen' : 'Compared to Previous Attempts'}
            </h4>
            <p className="text-sm leading-relaxed">{analysis.improvement_vs_previous}</p>
          </CardContent>
        </Card>
      )}

      {/* Rewrite Suggestion */}
      {analysis.rewrite_suggestion && (
        <Card className="bg-white/80 dark:bg-card/80 border-black/[0.04] dark:border-white/[0.06]">
          <CardContent className="p-5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{de ? 'Vorgeschlagene Überarbeitung (Wlad-Style)' : 'Suggested Rewrite (Wlad-Style)'}</h4>
            <p className="text-sm p-4 rounded-xl bg-gradient-to-r from-gray-50 to-[#BFFF00]/[0.04] dark:from-white/[0.02] dark:to-[#BFFF00]/[0.03] border border-sky-200/30 dark:border-white/[0.06] italic leading-relaxed">
              "{analysis.rewrite_suggestion}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Download Report */}
      <Button variant="outline" onClick={handleDownloadReport} className="w-full border-black/10 dark:border-white/10 font-semibold h-11" data-testid="download-mission-report-btn">
        <Download size={14} className="mr-2" /> {de ? 'Vollständigen Mission-Report herunterladen' : 'Download Full Mission Report'}
      </Button>

      {/* Upsell */}
      <div className="upsell-border">
        <div className="p-5 flex items-center gap-4" data-testid="mission-upsell-banner">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A0A0A] to-[#1A1A2E] flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
            <Star size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold">{de ? 'Perfektioniere deine Executive Presence' : 'Perfect your executive presence'}</p>
            <p className="text-[12px] text-muted-foreground">{de ? '1:1 Video-Coaching mit Wlads Team' : "1:1 video coaching with Wlad's team"}</p>
          </div>
          <Button onClick={() => setShowUpsell(true)} className="bg-gradient-to-r from-[#0A0A0A] to-[#1A1A2E] text-white font-bold shadow-sm shrink-0" data-testid="mission-upsell-btn">
            4.977 EUR <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
