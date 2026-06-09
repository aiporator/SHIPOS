import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50 last:border-0" data-testid="faq-item">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full py-4 text-left group">
        <span className="text-sm font-semibold group-hover:text-[#4A6200] dark:group-hover:text-[#BFFF00] transition-colors">{question}</span>
        {open ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
      </button>
      {open && <p className="text-sm text-muted-foreground pb-4 leading-relaxed">{answer}</p>}
    </div>
  );
};
