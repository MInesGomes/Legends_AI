import React, { useState } from 'react';
import { ChapterComment, UserProfile, Language } from '../types';
import { getDailyCommentsCount } from '../lib/supabase';
import { t } from '../lib/i18n';
import { X, Send, MessageSquare, AlertCircle, Edit2, Trash2, Check, RotateCcw, Lock } from 'lucide-react';

interface CommentsDrawerProps {
  chapterId: string;
  chapterTitle: string;
  comments: ChapterComment[];
  user: UserProfile | null;
  currentLang?: Language;
  onClose: () => void;
  onAddComment: (commentText: string) => void;
  onEditComment?: (commentId: string, newText: string) => void;
  onDeleteComment?: (commentId: string) => void;
  darkMode?: boolean;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  chapterId,
  chapterTitle,
  comments,
  user,
  currentLang = 'EN',
  onClose,
  onAddComment,
  onEditComment,
  onDeleteComment,
  darkMode = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editInputText, setEditInputText] = useState('');
  
  const userId = user?.user_id || 'guest_user';
  const todayCount = getDailyCommentsCount(userId);
  const remainingComments = Math.max(0, 10 - todayCount);

  // Filter comments strictly to only show comments submitted by the current user
  const userComments = comments.filter((comment) => {
    if (!user || user.user_id === 'guest_user' || user.user_id === 'guest') {
      return !comment.user_id || comment.user_id === 'guest' || comment.user_id === 'guest_user';
    }
    return comment.user_id === user.user_id;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || remainingComments <= 0) return;
    onAddComment(inputText.trim());
    setInputText('');
  };

  const handleStartEdit = (comment: ChapterComment) => {
    setEditingCommentId(comment.id);
    setEditInputText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditInputText('');
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editInputText.trim() || !onEditComment) return;
    onEditComment(commentId, editInputText.trim());
    setEditingCommentId(null);
    setEditInputText('');
  };

  const handleDelete = (commentId: string) => {
    if (!onDeleteComment) return;
    onDeleteComment(commentId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end animate-fadeIn">
      <div className={`w-full max-w-md border-l border-[#d4af37]/50 h-full flex flex-col shadow-2xl relative ${
        darkMode ? 'bg-[#121824] text-slate-100' : 'bg-[#fbf9f4] text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`p-4 border-b border-[#d4af37]/40 flex items-center justify-between ${
          darkMode ? 'bg-[#161e2d]' : 'bg-white'
        }`}>
          <div className="flex items-center gap-2">
            <MessageSquare className={`w-5 h-5 ${darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'}`} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-bold font-cinzel uppercase tracking-wider ${
                  darkMode ? 'gold-gradient-text' : 'text-[#8a5d12]'
                }`}>
                  {t('myComments', currentLang)}
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  <Lock className="w-2.5 h-2.5" />
                  {t('privateToYou', currentLang)}
                </span>
              </div>
              <p className={`text-xs line-clamp-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{chapterTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-full ${
              darkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Daily Quota Notice */}
        <div className={`px-4 py-2 border-b border-[#d4af37]/30 flex items-center justify-between text-xs ${
          darkMode ? 'bg-[#1b2536]' : 'bg-[#f4e8c1]/60'
        }`}>
          <span className={darkMode ? 'text-slate-300' : 'text-[#8a5d12] font-semibold'}>{t('dailyLimitStatus', currentLang)}</span>
          <span className={`font-semibold font-mono px-2 py-0.5 rounded border border-[#d4af37]/50 ${
            darkMode ? 'text-[#fce0a2] bg-[#d4af37]/20' : 'text-[#8a5d12] bg-white'
          }`}>
            {t('commentsLeftToday', currentLang, { count: remainingComments, limit: 10 })}
          </span>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {userComments.length === 0 ? (
            <div className={`text-center py-12 px-6 space-y-2 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <MessageSquare className="w-5 h-5 opacity-80" />
              </div>
              <p className="font-semibold text-sm">{t('noCommentsYet', currentLang)}</p>
              <p className="text-[11px] leading-relaxed">
                {t('noCommentsSub', currentLang)}
              </p>
            </div>
          ) : (
            userComments.map((comment) => {
              const isOwner = true;
              const isEditing = editingCommentId === comment.id;

              return (
                <div
                  key={comment.id}
                  className={`border border-[#d4af37]/30 rounded-xl p-3 space-y-2 shadow-sm transition-all ${
                    darkMode ? 'bg-[#182130]' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={comment.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={comment.user_name}
                        className="w-6 h-6 rounded-full object-cover border border-[#d4af37]/50"
                        referrerPolicy="no-referrer"
                      />
                      <span className={`text-xs font-semibold ${darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'}`}>
                        {comment.user_name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        darkMode ? 'bg-[#d4af37]/20 text-[#fce0a2] border border-[#d4af37]/40' : 'bg-[#d4af37]/15 text-[#8a5d12] border border-[#d4af37]/40'
                      }`}>
                        {t('youLabel', currentLang)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!isEditing && (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            onClick={() => handleStartEdit(comment)}
                            title={t('editComment', currentLang)}
                            className={`p-1 rounded hover:bg-[#d4af37]/20 transition-colors ${
                              darkMode ? 'text-slate-400 hover:text-[#fce0a2]' : 'text-slate-500 hover:text-[#8a5d12]'
                            }`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(comment.id)}
                            title={t('deleteComment', currentLang)}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={editInputText}
                        onChange={(e) => setEditInputText(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        rows={2}
                        className={`w-full text-xs rounded-lg p-2 border focus:outline-none focus:border-[#d4af37] ${
                          darkMode
                            ? 'bg-[#121824] border-slate-700 text-slate-100 placeholder-slate-500'
                            : 'bg-[#fbf9f4] border-slate-300 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={handleCancelEdit}
                          className={`px-2.5 py-1 text-[11px] rounded font-medium flex items-center gap-1 ${
                            darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          <RotateCcw className="w-3 h-3" /> {t('cancel', currentLang)}
                        </button>
                        <button
                          onClick={() => handleSaveEdit(comment.id)}
                          disabled={!editInputText.trim()}
                          className="px-2.5 py-1 text-[11px] rounded font-medium bg-gradient-to-r from-[#d4af37] to-[#996515] text-slate-950 font-bold hover:brightness-110 flex items-center gap-1 disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" /> {t('save', currentLang)}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-sm sm:text-base leading-relaxed font-serif-display pl-8 ${
                      darkMode ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      {comment.text}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Comment Input Footer */}
        <div className={`p-4 border-t border-[#d4af37]/30 ${
          darkMode ? 'bg-[#161e2d]' : 'bg-white'
        }`}>
          {remainingComments > 0 ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder={t('leaveCommentPlaceholder', currentLang)}
                className={`flex-1 border border-slate-300 focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${
                  darkMode ? 'bg-[#121824] text-slate-100 placeholder-slate-500' : 'bg-[#fbf9f4] text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-gradient-to-r from-[#d4af37] to-[#996515] text-slate-900 font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-zinc-800 border border-zinc-600 rounded-xl text-xs text-zinc-300 font-semibold">
              <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>{t('limitReached', currentLang)}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
