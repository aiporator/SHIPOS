import { useCallback, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useTier } from '../../contexts/TierContext';
import { TierBadge } from '../shared/TierBadge';
import { Crown } from 'lucide-react';
import api from '../../lib/api';
import logger from '../../lib/logger';
import {
  IconGlobe, IconSun, IconMoon, IconLogout, IconCamera,
} from './SidebarIcons';

export const SidebarFooter = ({ theme, toggleTheme, lang, toggleLang, t, collapsed, navigate }) => {
  const { user, logout, setUser } = useAuth();
  const { isAccelerator, tier } = useTier();
  const [uploadingPic, setUploadingPic] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  const handleProfilePicUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPic(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/upload/profile-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfilePicUrl(URL.createObjectURL(file));
      const meRes = await api.get('/auth/me');
      setUser(meRes.data);
    } catch (err) {
      logger.error('Profile pic upload failed:', err);
    } finally {
      setUploadingPic(false);
    }
  }, [setUser]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="border-t border-black/[0.03] dark:border-white/[0.03] p-2 space-y-0.5">
      <button data-testid="lang-toggle-btn" onClick={toggleLang}
        className={`flex items-center gap-2.5 w-full px-3 py-[7px] rounded-[10px] text-[12px] text-gray-400 hover:text-gray-600 dark:text-muted-foreground/50 dark:hover:text-foreground/70 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors ${collapsed ? 'justify-center px-2' : ''}`}>
        <IconGlobe size={14} />
        {!collapsed && (
          <span className="flex items-center gap-1">
            <span className={`font-bold ${lang === 'de' ? 'text-[#4A6200] dark:text-[#BFFF00]' : 'text-muted-foreground/30'}`}>DE</span>
            <span className="text-[8px] text-muted-foreground/15">|</span>
            <span className={`font-bold ${lang === 'en' ? 'text-[#4A6200] dark:text-[#BFFF00]' : 'text-muted-foreground/30'}`}>EN</span>
          </span>
        )}
      </button>
      <button data-testid="theme-toggle-btn" onClick={toggleTheme}
        className={`flex items-center gap-2.5 w-full px-3 py-[7px] rounded-[10px] text-[12px] text-gray-400 hover:text-gray-600 dark:text-muted-foreground/50 dark:hover:text-foreground/70 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors ${collapsed ? 'justify-center px-2' : ''}`}>
        {theme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
        {!collapsed && <span className="font-medium">{theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}</span>}
      </button>

      {/* Upgrade CTA — hidden for OS PLUS users */}
      {user && !isAccelerator && (
        <button
          onClick={() => navigate('/coaching')}
          data-testid="sidebar-upgrade-btn"
          className={`flex items-center gap-2.5 w-full px-3 py-[7px] rounded-[10px] text-[12px] font-bold transition-all mt-1 ${
            collapsed
              ? 'justify-center px-2 bg-[#BFFF00] text-[#0A0A0A] hover:bg-[#9ACC00]'
              : 'bg-gradient-to-r from-[#BFFF00] to-[#9ACC00] text-[#0A0A0A] hover:shadow-lg hover:shadow-[#BFFF00]/20'
          }`}
          title={tier === 'free' ? 'Leadership OS aktivieren' : 'Auf OS PLUS upgraden'}
        >
          <Crown size={14} strokeWidth={2.5} />
          {!collapsed && (
            <span className="truncate">
              {tier === 'free' && 'Leadership OS holen'}
              {tier === 'standard' && 'Auf OS PLUS upgraden'}
            </span>
          )}
        </button>
      )}

      {user && !collapsed && (
        <div className="relative group">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-3 py-[7px] mt-0.5 cursor-pointer hover:bg-[#BFFF00]/[0.05] dark:hover:bg-[#BFFF00]/[0.03] rounded-lg transition-colors w-full text-left"
            data-testid="sidebar-profile-btn"
          >
            <div className="relative">
              <Avatar className="w-6 h-6 ring-1 ring-[#BFFF00]/20 dark:ring-[#BFFF00]/10">
                <AvatarImage src={profilePicUrl || (user.picture?.startsWith('http') ? user.picture : (user.picture ? `/api/files/${user.picture}` : undefined))} />
                <AvatarFallback className="text-[9px] font-bold bg-gradient-to-br from-[#BFFF00]/15 to-[#D4FF4D]/15 dark:from-[#BFFF00]/15 dark:to-[#BFFF00]/10 text-[#4A6200] dark:text-[#BFFF00]">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold truncate leading-none">{user.name}</p>
              <div className="mt-1"><TierBadge size="xs" /></div>
            </div>
          </button>
          {uploadingPic && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
              <div className="w-4 h-4 border-2 border-[#BFFF00] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
      <button data-testid="logout-btn" onClick={handleLogout}
        className={`flex items-center gap-2.5 w-full px-3 py-[7px] rounded-[10px] text-[12px] text-gray-400 hover:text-rose-500 dark:text-muted-foreground/50 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-400/5 transition-colors ${collapsed ? 'justify-center px-2' : ''}`}>
        <IconLogout size={14} />
        {!collapsed && <span className="font-medium">{t('nav.logout')}</span>}
      </button>
    </div>
  );
};
