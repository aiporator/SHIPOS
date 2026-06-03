import { Brain, Target, HeartHandshake, Star } from 'lucide-react';

export const WLAD_AVATAR = 'https://customer-assets.emergentagent.com/job_dd3457c0-3be5-4c4c-bc34-5b0e823b9278/artifacts/4knvn6cs_WladProfilbild.jpg';

export const getLayers = (de) => [
  { number: '01', title: de ? 'KI-Kompetenz' : 'AI Competency', description: de ? 'KI als strategischen Hebel nutzen, um schnellere und bessere Entscheidungen zu treffen.' : 'Use AI as a strategic lever for faster, better decisions.', features: de ? ['Entscheidungen beschleunigen', 'Prozesse automatisieren', 'Wettbewerbsvorteile schaffen'] : ['Accelerate decisions', 'Automate processes', 'Create competitive edge'], gradient: '#6366F1, #8B5CF6', icon: Brain },
  { number: '02', title: de ? 'Boardroom-Rhetorik' : 'Boardroom Rhetoric', description: de ? 'Autorität und Überzeugungskraft zeigen, wenn es darauf ankommt.' : 'Show authority and persuasion when it matters most.', features: de ? ['Argumentationsstruktur', 'Klare Kommunikation', 'Souveräne Präsenz'] : ['Argumentation structure', 'Clear communication', 'Confident presence'], gradient: '#EC4899, #F43F5E', icon: Target },
  { number: '03', title: de ? 'Strategisches EQ' : 'Strategic EQ', description: de ? 'Empathie als Führungskraft-Verstärker einsetzen.' : 'Use empathy as a leadership amplifier.', features: de ? ['Teamdynamiken verstehen', 'Vertrauen aufbauen', 'Konflikte strategisch lösen'] : ['Understand team dynamics', 'Build trust', 'Resolve conflicts strategically'], gradient: '#10B981, #14B8A6', icon: HeartHandshake },
];

export const getCoachingPaths = (de, navigate, handleCheckout) => [
  { id: 'personal', icon: Star, gradient: 'from-[#BFFF00] to-[#9ACC00]', title: de ? '1:1 Coaching mit Wlads Expertenteam' : '1:1 Coaching with Wlad’s Expert Team', subtitle: de ? 'Persönliche Transformation' : 'Personal transformation', description: de ? 'Nichts ersetzt einen echten Experten. Wlads Expertenteam — von ihm persönlich ausgebildet — begleitet dich durch deine spezifischen Herausforderungen.' : 'Nothing replaces a real expert. Wlad’s expert team — trained by him personally — guides you through your specific challenges.', cta: de ? 'Strategiegespräch buchen' : 'Book Strategy Call', action: () => handleCheckout('accelerator'), badge: de ? 'PREMIUM' : 'PREMIUM', badgeColor: 'bg-[#7B3FE4]' },
];

export const getPremiumFeatures = (de) => de
  ? ['12 Wochen Intensiv-Coaching mit Wlads Expertenteam', 'Maßgeschneiderte Leadership-Strategie', 'Wöchentliche 1:1 Sessions (60 Min.)', 'Zugang zu allen Premium-KI-Features', 'Alle Frameworks aus Wlads Methodik', 'Prioritäts-Support & Accountability', 'Persönliche Advice Reports', 'Exklusiver Zugang zur Leader-Community']
  : ['12 weeks intensive coaching with Wlad', 'Custom leadership strategy', 'Weekly 1:1 sessions (60 min)', 'Access to all premium AI features', "All frameworks from Wlad's methodology", 'Priority support & accountability', 'Personal advice reports', 'Exclusive access to leader community'];

export const getFaqs = (de) => de ? [
  { q: 'Was ist der Unterschied zwischen WladBot und dem persönlichen Coaching?', a: 'WladBot ist dein KI-Coach, der rund um die Uhr verfügbar ist und dir bei täglichen Führungsherausforderungen hilft. Das persönliche Coaching mit Wlads Expertenteam geht tiefer: maßgeschneiderte Strategien, Accountability und persönliche Begleitung durch komplexe Transformationen.' },
  { q: 'Was erhalte ich bei der Leadership-Diagnose?', a: 'Du erhältst einen detaillierten Report mit deinem 3-Layer Score (KI-Kompetenz, Boardroom-Rhetorik, Strategisches EQ), einer Analyse deiner 5+1 Führungsdimensionen, einem personalisierten 30-Tage-Aktionsplan und einer ROI-Prognose.' },
  { q: 'Wie funktioniert das Strategiegespräch?', a: 'Das 15-minütige Strategiegespräch ist unverbindlich. Wlad analysiert deine aktuelle Situation, identifiziert deine größten Hebel und zeigt dir, wie du in 90 Tagen messbare Ergebnisse erzielst.' },
  { q: 'Kann ich meine WladHub-Diagnose mit WladBot verbinden?', a: 'Ja! Deine Diagnose-Ergebnisse fließen direkt in dein WladBot-Profil ein. Der KI-Coach kennt deine Stärken und Schwächen und gibt dir personalisierte Empfehlungen basierend auf deinem Leadership-Profil.' },
  { q: 'Für wen ist das Premium-Programm geeignet?', a: 'Das 12-Wochen-Programm ist ideal für Führungskräfte, die eine gezielte Transformation wollen. Typische Teilnehmer: Team-Leads die zum Director aufsteigen wollen, Manager die ihre Kommunikation transformieren wollen, oder Executives die ihre strategische Wirkung maximieren wollen.' },
] : [
  { q: "What's the difference between WladBot and personal coaching?", a: 'WladBot is your 24/7 AI coach for daily leadership challenges. Personal coaching with Wlad goes deeper: custom strategies, accountability, and personal guidance through complex transformations.' },
  { q: 'What do I get with the Leadership Diagnosis?', a: 'A detailed report with your 3-Layer Score, analysis of 5+1 leadership dimensions, a personalized 30-day action plan, and ROI forecast.' },
  { q: 'How does the Strategy Call work?', a: 'The 15-minute call comes with no obligation. Wlad analyzes your situation, identifies leverage points, and shows how to achieve measurable results in 90 days.' },
  { q: 'Can I connect my WladHub diagnosis with WladBot?', a: 'Yes! Your diagnosis results flow into your WladBot profile. The AI coach knows your strengths and areas for improvement.' },
  { q: 'Who is the Premium program for?', a: 'Ideal for leaders seeking targeted transformation: team leads becoming directors, managers improving communication, or executives maximizing strategic impact.' },
];
