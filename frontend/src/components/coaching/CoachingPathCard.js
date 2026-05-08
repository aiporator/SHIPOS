import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowRight } from 'lucide-react';

export const CoachingPathCard = ({ path }) => (
  <Card className="group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border-black/[0.05] dark:border-white/[0.06]" data-testid={`coaching-path-${path.id}`}>
    <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${path.gradient} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <path.icon size={24} className="text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-black">{path.title}</h3>
          <Badge className={`${path.badgeColor} text-white border-0 text-[9px] font-bold px-2 py-0.5`}>{path.badge}</Badge>
        </div>
        <p className="text-xs text-muted-foreground font-medium mb-1">{path.subtitle}</p>
        <p className="text-sm text-muted-foreground">{path.description}</p>
      </div>
      <Button className={`bg-gradient-to-r ${path.gradient} text-white font-bold px-5 shadow-lg shrink-0`}
        onClick={path.action}>
        {path.cta} <ArrowRight size={14} className="ml-1.5" />
      </Button>
    </CardContent>
  </Card>
);
