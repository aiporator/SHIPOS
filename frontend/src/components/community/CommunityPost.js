import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Heart, MessageCircle, Trash2, Send, Crown } from 'lucide-react';
import { getCategoryConfig, timeAgo } from './communityConstants';

const CommentList = ({ postId, list, de, draft, setDraft, onAdd }) => (
  <div className="space-y-2 pt-3 border-t border-black/[0.04] dark:border-white/[0.04]" data-testid={`comments-${postId}`}>
    {list.map(c => (
      <div key={c.comment_id} className="flex gap-2 items-start">
        <Avatar className="w-7 h-7 shrink-0">
          {c.author_picture && <AvatarImage src={c.author_picture} />}
          <AvatarFallback className="text-[9px] font-bold bg-gray-100 dark:bg-muted">
            {(c.author_name || 'L')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-gray-50 dark:bg-muted/30">
          <p className="text-[11px] font-bold">{c.author_name} <span className="text-[9px] font-normal text-muted-foreground ml-1">· {timeAgo(c.created_at, de)}</span></p>
          <p className="text-[12px] mt-0.5 leading-relaxed">{c.content}</p>
        </div>
      </div>
    ))}
    <div className="flex gap-2 pt-1">
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onAdd(); } }}
        placeholder={de ? 'Kommentieren...' : 'Comment...'}
        className="resize-none min-h-[36px] max-h-20 text-[11.5px] rounded-lg bg-white dark:bg-card"
        rows={1}
        data-testid="comment-textarea"
      />
      <Button onClick={onAdd} size="sm" className="bg-[#0A0A0A] text-white hover:bg-[#1A1A2E] self-end" data-testid="comment-submit-btn">
        <Send size={11} />
      </Button>
    </div>
  </div>
);

export const CommunityPost = ({
  post, me, de, onLike, onToggleComments, onDelete,
  expanded, comments, commentDraft, setCommentDraft, onAddComment,
}) => {
  const cc = getCategoryConfig(post.category);
  const CatIcon = cc.icon;
  const isMe = post.user_id === me?.user_id;

  return (
    <Card className="border-black/[0.06] dark:border-white/[0.06] animate-fade-in" data-testid={`post-${post.post_id}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 shrink-0">
            {post.author_picture && <AvatarImage src={post.author_picture} />}
            <AvatarFallback className="bg-gray-100 dark:bg-muted text-xs font-black">
              {(post.author_name || 'L')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[13px] font-bold truncate">{post.author_name}</p>
              {post.author_tier === 'accelerator' && <Crown size={10} className="text-[#BFFF00]" />}
              {post.author_tier && post.author_tier !== 'free' && (
                <span className="text-[8px] font-black uppercase tracking-wider text-[#4A6200] dark:text-[#BFFF00]">{post.author_tier}</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">{post.author_level} · {timeAgo(post.created_at, de)}</p>
          </div>
          <Badge variant="outline" className="text-[9px] font-bold shrink-0">
            <CatIcon size={9} className={`mr-0.5 ${cc.color || ''}`} /> {de ? cc.label_de : cc.label_en}
          </Badge>
          {isMe && (
            <button onClick={() => onDelete(post.post_id)}
              className="text-muted-foreground/40 hover:text-rose-500 transition-colors"
              data-testid="delete-post-btn">
              <Trash2 size={12} />
            </button>
          )}
        </div>

        <p className="text-[13px] whitespace-pre-wrap leading-relaxed">{post.content}</p>

        <div className="flex items-center gap-1 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
          <button onClick={() => onLike(post.post_id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${post.liked_by_me
              ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10'
              : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10'}`}
            data-testid="like-btn">
            <Heart size={13} fill={post.liked_by_me ? 'currentColor' : 'none'} />
            {post.likes_count > 0 ? post.likes_count : ''}
          </button>
          <button onClick={() => onToggleComments(post.post_id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
            data-testid="comments-btn">
            <MessageCircle size={13} /> {post.comment_count || 0}
          </button>
        </div>

        {expanded && (
          <CommentList
            postId={post.post_id}
            list={comments[post.post_id] || []}
            de={de}
            draft={commentDraft[post.post_id] || ''}
            setDraft={(val) => setCommentDraft(prev => ({ ...prev, [post.post_id]: val }))}
            onAdd={() => onAddComment(post.post_id)}
          />
        )}
      </CardContent>
    </Card>
  );
};
