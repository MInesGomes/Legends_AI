import React, { useState } from 'react';
import { Realm, SkillType, Tale, UserProfile } from '../types';
import { X, Plus, Sparkles, Feather, AlertCircle, ShieldCheck, Lock } from 'lucide-react';

interface AddTaleModalProps {
  realm: Realm;
  user?: UserProfile | null;
  onClose: () => void;
  onSubmitTale: (newTale: Tale) => void;
  darkMode?: boolean;
}

export const AddTaleModal: React.FC<AddTaleModalProps> = ({ realm, user, onClose, onSubmitTale, darkMode = false }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [skill, setSkill] = useState<SkillType>('Win4All');
  const [storyContent, setStoryContent] = useState('');

  const MAX_CHARS = 1000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !storyContent.trim()) return;

    const newTale: Tale = {
      id: `custom-tale-${Date.now()}`,
      realmId: realm.id,
      title: title.trim(),
      subtitle: subtitle.trim() || 'Custom Traveler Legend',
      coverImage: realm.bgImage,
      skill,
      viewsCount: 1,
      likesCount: 1,
      commentsCount: 0,
      isCustomUserTale: true,
      storyContent: storyContent.trim(),
      authorId: user?.user_id || 'guest',
      authorName: user?.name || 'Traveler',
      isApproved: false, // Hidden from all other users until approved by moderators
      createdAt: new Date().toISOString(),
    };

    onSubmitTale(newTale);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn ${
      darkMode ? 'bg-black/80 backdrop-blur-md' : 'bg-slate-900/60 backdrop-blur-md'
    }`}>
      <div className={`w-full max-w-xl rounded-2xl p-6 relative shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border-2 ${
        darkMode
          ? 'gold-card-frame bg-[#121824] text-slate-100 border-[#d4af37]/40'
          : 'bg-[#fbf9f4] border-[#d4af37] text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${
          darkMode ? 'border-[#d4af37]/30' : 'border-[#d4af37]/40'
        }`}>
          <div className="flex items-center gap-2">
            <Feather className={`w-5 h-5 ${darkMode ? 'text-[#d4af37]' : 'text-[#8a5d12]'}`} />
            <h3 className={`text-xl font-bold font-cinzel ${
              darkMode ? 'gold-gradient-text' : 'text-[#8a5d12]'
            }`}>
              Submit Custom Tale for Realm {realm.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${
              darkMode
                ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                : 'bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1">
          
          <div>
            <label className={`block text-xs font-semibold mb-1 font-cinzel ${
              darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
            }`}>
              Tale Title *
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Forgotten Crystal"
              className={`w-full border focus:border-[#d4af37] rounded-lg px-3.5 py-2 text-sm focus:outline-none transition-colors ${
                darkMode
                  ? 'bg-[#121824] border-slate-700 text-slate-100 placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 font-cinzel ${
              darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
            }`}>
              Subtitle / Tagline (Optional)
            </label>
            <input
              type="text"
              maxLength={120}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. A lesson in courage and trust"
              className={`w-full border focus:border-[#d4af37] rounded-lg px-3.5 py-2 text-sm focus:outline-none transition-colors ${
                darkMode
                  ? 'bg-[#121824] border-slate-700 text-slate-100 placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 font-cinzel ${
              darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
            }`}>
              Primary Skill Focus
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Leader', 'Plan', 'Win4All', 'Listen', 'Recharge'] as SkillType[]).map((sk) => (
                <button
                  key={sk}
                  type="button"
                  onClick={() => setSkill(sk)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    skill === sk
                      ? 'bg-[#d4af37] text-slate-900 border-[#b8860b] font-bold shadow-sm'
                      : darkMode
                      ? 'bg-[#121824] text-slate-300 border-slate-700 hover:border-slate-500'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-[#d4af37]'
                  }`}
                >
                  {sk}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`block text-xs font-semibold font-cinzel ${
                darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
              }`}>
                Tale Story Text (Up to 1000 characters) *
              </label>
              <span className={`text-[11px] font-mono ${
                storyContent.length > MAX_CHARS
                  ? 'text-zinc-400 font-bold'
                  : darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {storyContent.length} / {MAX_CHARS}
              </span>
            </div>
            <textarea
              required
              rows={6}
              maxLength={MAX_CHARS}
              value={storyContent}
              onChange={(e) => setStoryContent(e.target.value)}
              placeholder="Write your legendary story here... (e.g. Deep beneath the tides, a forgotten echo spoke to those willing to listen...)"
              className={`w-full border focus:border-[#d4af37] rounded-lg p-3 text-sm focus:outline-none leading-relaxed transition-colors ${
                darkMode
                  ? 'bg-[#121824] border-slate-700 text-slate-100 placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {storyContent.length >= MAX_CHARS && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <AlertCircle className="w-4 h-4 text-zinc-400" /> Maximum character limit reached (1000 chars).
            </div>
          )}

          {/* Privacy & Moderation Approval Notice */}
          <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
            darkMode
              ? 'bg-[#182130] border-[#d4af37]/30 text-slate-300'
              : 'bg-amber-50/80 border-amber-300/60 text-slate-700'
          }`}>
            <ShieldCheck className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-[#d4af37]' : 'text-[#8a5d12]'}`} />
            <div className="leading-relaxed">
              <span className="font-bold text-[#d4af37]">Approval Review: </span>
              Your submitted tale will be saved to your realm library under review. It remains strictly private to you and hidden from all other travelers until it is reviewed and approved.
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                darkMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !storyContent.trim() || storyContent.length > MAX_CHARS}
              className="flex-1 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#d4af37] text-slate-900 font-extrabold text-sm rounded-lg border border-[#b8860b] hover:brightness-110 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Submit Custom Tale
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
