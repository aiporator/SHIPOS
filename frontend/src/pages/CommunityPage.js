import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import logger from '../lib/logger';
import { Users, Loader2 } from 'lucide-react';
import { CommunityCompose } from '../components/community/CommunityCompose';
import { CommunityFilters } from '../components/community/CommunityFilters';
import { CommunityPost } from '../components/community/CommunityPost';
import { CommunityLeaderboard } from '../components/community/CommunityLeaderboard';

export default function CommunityPage() {
  const { lang } = useLanguage();
  const { user: me } = useAuth();
  const de = lang === 'de';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [draft, setDraft] = useState('');
  const [draftCategory, setDraftCategory] = useState('general');
  const [posting, setPosting] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState({});
  const [commentDraft, setCommentDraft] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [feedRes, lbRes] = await Promise.all([
        api.get('/community/feed', { params: { category } }),
        api.get('/admin/community/leaderboard', { params: { limit: 10 } }).catch(() => ({ data: [] })),
      ]);
      setPosts(feedRes.data || []);
      setLeaderboard(lbRes.data || []);
    } catch (err) { logger.error(err); }
    finally { setLoading(false); }
  }, [category]);

  useEffect(() => { load(); }, [load]);

  const createPost = async () => {
    if (!draft.trim() || posting) return;
    setPosting(true);
    try {
      const res = await api.post('/community/posts', { content: draft.trim(), category: draftCategory });
      setPosts([res.data, ...posts]);
      setDraft(''); setDraftCategory('general');
    } catch (err) { logger.error(err); }
    finally { setPosting(false); }
  };

  const toggleLike = async (postId) => {
    try {
      const res = await api.post(`/community/posts/${postId}/like`);
      setPosts(prev => prev.map(p => p.post_id === postId ? { ...p, liked_by_me: res.data.liked, likes_count: res.data.likes_count } : p));
    } catch (err) { logger.error(err); }
  };

  const loadComments = async (postId) => {
    try {
      const res = await api.get(`/community/posts/${postId}/comments`);
      setComments(prev => ({ ...prev, [postId]: res.data }));
    } catch (err) { logger.error(err); }
  };

  const toggleComments = (postId) => {
    if (expandedPost === postId) setExpandedPost(null);
    else { setExpandedPost(postId); if (!comments[postId]) loadComments(postId); }
  };

  const addComment = async (postId) => {
    const text = (commentDraft[postId] || '').trim();
    if (!text) return;
    try {
      const res = await api.post(`/community/posts/${postId}/comments`, { content: text });
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res.data] }));
      setCommentDraft(prev => ({ ...prev, [postId]: '' }));
      setPosts(prev => prev.map(p => p.post_id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p));
    } catch (err) { logger.error(err); }
  };

  const deletePost = async (postId) => {
    if (!window.confirm(de ? 'Post wirklich löschen?' : 'Delete this post?')) return;
    try {
      await api.delete(`/community/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.post_id !== postId));
    } catch (err) { logger.error(err); }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-6xl mx-auto" data-testid="community-page">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#BFFF00] to-[#9ACC00] flex items-center justify-center shadow-lg shadow-[#BFFF00]/20">
              <Users size={20} className="text-[#0A0A0A]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{de ? 'Community' : 'Community'}</h1>
              <p className="text-sm text-muted-foreground">{de ? 'Teile Wins, frage nach Feedback, hilf anderen Leadern.' : 'Share wins, ask for feedback, help other leaders.'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-5 min-w-0">
            <CommunityCompose
              me={me} de={de}
              draft={draft} setDraft={setDraft}
              draftCategory={draftCategory} setDraftCategory={setDraftCategory}
              posting={posting} onSubmit={createPost}
            />

            <CommunityFilters category={category} setCategory={setCategory} de={de} />

            {loading ? (
              <div className="text-center py-16"><Loader2 size={24} className="mx-auto animate-spin text-[#BFFF00]" /></div>
            ) : posts.length === 0 ? (
              <Card><CardContent className="p-10 text-center space-y-2">
                <Users size={32} className="mx-auto text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{de ? 'Noch keine Posts. Sei die Erste, die etwas teilt!' : 'No posts yet. Be the first to share!'}</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">
                {posts.map(p => (
                  <CommunityPost
                    key={p.post_id}
                    post={p}
                    me={me}
                    de={de}
                    onLike={toggleLike}
                    onToggleComments={toggleComments}
                    onDelete={deletePost}
                    expanded={expandedPost === p.post_id}
                    comments={comments}
                    commentDraft={commentDraft}
                    setCommentDraft={setCommentDraft}
                    onAddComment={addComment}
                  />
                ))}
              </div>
            )}
          </div>

          <CommunityLeaderboard leaderboard={leaderboard} postsCount={posts.length} de={de} />
        </div>
      </div>
    </DashboardLayout>
  );
}
