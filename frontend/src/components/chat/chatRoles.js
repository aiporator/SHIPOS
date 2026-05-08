import {
  MessageSquareText, HeartHandshake, Users, Gavel, Target,
} from 'lucide-react';

/* Die 5 Rollen nach Wlad Jachtchenko */
export const FIVE_ROLES = [
  {
    value: 'Kommunikator', label: { de: 'Kommunikator', en: 'Communicator' },
    icon: MessageSquareText, gradient: 'from-[#0A0A0A] to-[#111]',
    bg: 'bg-sky-50 dark:bg-sky-500/10',
    desc: { de: 'Charismatisch auftreten und überzeugen', en: 'Charismatic presence and persuasion' },
    scenarios: {
      de: ['Hilf mir, eine schwierige Botschaft überzeugend zu vermitteln', 'Wie bereite ich eine Präsentation vor dem Vorstand vor?', 'Coaching für mein nächstes Feedbackgespräch'],
      en: ['Help me deliver a difficult message persuasively', 'How do I prepare a board presentation?', 'Coach me for my next feedback conversation']
    }
  },
  {
    value: 'Manager', label: { de: 'Manager', en: 'Manager' },
    icon: Target, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    desc: { de: 'Effektiver und effizienter arbeiten', en: 'Work more effectively and efficiently' },
    scenarios: {
      de: ['Hilf mir, meine Prioritäten richtig zu setzen', 'Wie delegiere ich effektiver?', 'Meine Meetings sind zu lang und unproduktiv'],
      en: ['Help me set my priorities right', 'How do I delegate more effectively?', 'My meetings are too long and unproductive']
    }
  },
  {
    value: 'Team-Leader', label: { de: 'Team-Leader', en: 'Team Leader' },
    icon: Users, gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-50 dark:bg-orange-500/10',
    desc: { de: 'Nachhaltig motivieren und besser delegieren', en: 'Motivate sustainably and delegate better' },
    scenarios: {
      de: ['Mein Team ist demotiviert — was kann ich tun?', 'Wie baue ich eine High-Performance-Kultur auf?', 'Ein Mitarbeiter will kündigen — wie halte ich ihn?'],
      en: ['My team is demotivated — what can I do?', 'How do I build a high-performance culture?', 'An employee wants to quit — how do I retain them?']
    }
  },
  {
    value: 'Psychologe', label: { de: 'Psychologe', en: 'Psychologist' },
    icon: HeartHandshake, gradient: 'from-pink-500 to-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10',
    desc: { de: 'Jedem Mitarbeiter individuell und empathisch begegnen', en: 'Meet each employee individually with empathy' },
    scenarios: {
      de: ['Ein Mitarbeiter wirkt ausgebrannt — wie spreche ich ihn an?', 'Wie zeige ich mehr Empathie als Führungskraft?', 'Jemand in meinem Team hat eine persönliche Krise'],
      en: ['An employee seems burned out — how do I approach them?', 'How do I show more empathy as a leader?', 'Someone on my team has a personal crisis']
    }
  },
  {
    value: 'Problemlöser', label: { de: 'Problemlöser', en: 'Problem Solver' },
    icon: Gavel, gradient: 'from-[#BFFF00] to-[#9ACC00]', bg: 'bg-purple-50 dark:bg-[#7B3FE4]/10',
    desc: { de: 'Konflikte managen und Veränderungen durchsetzen', en: 'Manage conflicts and drive change' },
    scenarios: {
      de: ['Zwei Teammitglieder streiten sich ständig', 'Wie kommuniziere ich eine große Veränderung an mein Team?', 'Ich muss eine unpopuläre Entscheidung durchsetzen'],
      en: ['Two team members are constantly arguing', 'How do I communicate a big change to my team?', 'I need to push through an unpopular decision']
    }
  },
];
