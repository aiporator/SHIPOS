import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { CATEGORIES } from './communityConstants';

export const CommunityCompose = ({
  me, de, draft, setDraft, draftCategory, setDraftCategory,
  posting, onSubmit,
}) => (
  <Card className="mb-5 border-black/[0.06] dark:border-white/[0.06] animate-fade-in stagger-1" data-testid="compose-card">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 shrink-0">
          {me?.picture && <AvatarImage src={me.picture} />}
          <AvatarFallback className="bg-gradient-to-br from-[#BFFF00] to-[#9ACC00] text-[#0A0A0A] font-black text-xs">
            {(me?.name || 'U')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-1.5 flex-wrap">
          {CATEGORIES.filter(c => c.id !== 'all').map(c => {
            const Icon = c.icon;
            const active = draftCategory === c.id;
            return (
              <button key={c.id} onClick={() => setDraftCategory(c.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${active
                  ? 'bg-[#BFFF00] text-[#0A0A0A]'
                  : 'bg-gray-100 dark:bg-white/[0.04] text-muted-foreground hover:bg-gray-200 dark:hover:bg-white/[0.08]'}`}
                data-testid={`compose-cat-${c.id}`}>
                <Icon size={10} /> {de ? c.label_de : c.label_en}
              </button>
            );
          })}
        </div>
      </div>
      <Textarea value={draft} onChange={(e) => setDraft(e.target.value)}
        placeholder={de ? 'Was möchtest du mit der Community teilen?' : 'What do you want to share with the community?'}
        className="resize-none min-h-[80px] bg-gray-50 dark:bg-muted/30 border-black/[0.04] dark:border-white/[0.04] rounded-xl"
        data-testid="compose-textarea" />
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground">{draft.length}/4000</span>
        <Button onClick={onSubmit} disabled={!draft.trim() || posting}
          className="bg-[#0A0A0A] text-white hover:bg-[#1A1A2E] font-bold"
          data-testid="compose-submit-btn">
          {posting
            ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> ...</>
            : <><Send size={14} className="mr-1.5" /> {de ? 'Posten' : 'Post'}</>}
        </Button>
      </div>
    </CardContent>
  </Card>
);
