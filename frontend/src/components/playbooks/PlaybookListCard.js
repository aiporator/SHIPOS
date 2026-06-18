import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Play, ChevronRight } from 'lucide-react';

export const PlaybookListCard = ({ pb, onStart, loading, de }) => (
  <Card className="group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border-black/[0.04] dark:border-white/[0.06] overflow-hidden" data-testid={`playbook-${pb.playbook_id}`}>
    <div className="h-1.5 bg-gradient-to-r from-[#BFFF00] to-[#9ACC00] opacity-0 group-hover:opacity-100 transition-opacity" />
    <CardContent className="p-5 space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="font-bold text-[15px] leading-tight">{pb.title}</h3>
        <Badge variant="outline" className="text-[9px] font-semibold shrink-0 ml-2">{pb.category}</Badge>
      </div>
      <p className="text-[12px] text-muted-foreground line-clamp-2">{pb.description}</p>
      <div className="flex items-center gap-1 flex-wrap">
        {pb.steps?.map((s, stepIdx) => (
          <span key={`${pb.playbook_id}-step-${stepIdx}`} className="flex items-center gap-0.5 text-[10px] text-muted-foreground/60">
            <span className="w-4 h-4 rounded-full bg-[#BFFF00]/[0.06] dark:bg-[#BFFF00]/10 flex items-center justify-center text-[8px] font-bold text-[#4A6200] dark:text-[#BFFF00]">{stepIdx + 1}</span>
            {s.title}
            {stepIdx < pb.steps.length - 1 && <ChevronRight size={8} className="mx-0.5" />}
          </span>
        ))}
      </div>
      <Button size="sm" onClick={() => onStart(pb)} disabled={loading}
        className="bg-gradient-to-r from-[#BFFF00] to-[#9ACC00] text-[#0A0A0A] font-semibold shadow-sm" data-testid={`start-playbook-${pb.playbook_id}`}>
        <Play size={12} className="mr-1.5" /> {de ? 'Starten' : 'Start'}
      </Button>
    </CardContent>
  </Card>
);
