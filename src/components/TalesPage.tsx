import React, { useState } from 'react';
import { Realm, Tale } from '../types';
import { AddTaleModal } from './AddTaleModal';
import { ArrowLeft, Plus, Eye, Heart, MessageSquare, Sparkles } from 'lucide-react';

interface TalesPageProps {
  realm: Realm;
  tales: Tale[];
  onBack: () => void;
  onSelectTale: (tale: Tale) => void;
  onSubmitNewTale: (newTale: Tale) => void;
  darkMode?: boolean;
}

export const TalesPage: React.FC<TalesPageProps> = ({
  realm,
  tales,
  onBack,
  onSelectTale,
  onSubmitNewTale,
  darkMode = true,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter tales belonging to this realm or custom user tales
  const realmTales = tales.filter(
    (t) => t.realmId === realm.id || t.realmId === realm.key
  );

  return (
    <div className={`min-h-[calc(100vh-65px)] transition-colors duration-300 p-4 sm:p-6 md:p-8 ${
      darkMode ? 'bg-[#0f141c] text-slate-100' : 'bg-[#fbf9f4] text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className={`p-2 rounded-full border border-[#d4af37]/50 hover:bg-[#d4af37]/20 transition-all active:scale-95 shadow-md ${
                darkMode ? 'bg-[#121824] text-[#fce0a2]' : 'bg-white text-[#8a5d12]'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className={`text-2xl sm:text-3xl font-bold font-cinzel ${
                darkMode ? 'gold-gradient-text' : 'text-[#8a5d12]'
              }`}>
                {realm.title} TALES
              </h2>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Explore choice-driven chapter legends in {realm.title}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#d4af37] text-black font-semibold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add Tale
          </button>
        </div>

        {/* Tales Cards Grid (Matching reference screenshots 2AtlantisTales, 2Dad&MomTales, 2MarriageTales, 2WorkTales) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {realmTales.map((tale) => (
            <div
              key={tale.id}
              onClick={() => onSelectTale(tale)}
              className="group relative cursor-pointer p-[3px] rounded-[18px] bg-gradient-to-b from-[#f3e5ab] via-[#d4af37] to-[#8a5d12] shadow-xl hover:shadow-2xl hover:shadow-[#d4af37]/30 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.99]"
            >
              {/* Inner Card Box with Dark Ambient Background */}
              <div className="relative h-72 sm:h-80 rounded-[15px] overflow-hidden bg-black text-left flex flex-col justify-between">
                
                {/* Background Image */}
                <img
                  src={tale.coverImage}
                  alt={tale.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95 group-hover:brightness-100"
                  referrerPolicy="no-referrer"
                />

                {/* Corner Filigree Flourish Accents (Matching exact reference borders) */}
                <div className="absolute top-1.5 left-1.5 pointer-events-none text-[#fce0a2]/80">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 10V2h8M2 2l8 8" />
                  </svg>
                </div>
                <div className="absolute top-1.5 right-1.5 pointer-events-none text-[#fce0a2]/80">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 10V2h-8M22 2l-8 8" />
                  </svg>
                </div>
                <div className="absolute bottom-1.5 left-1.5 pointer-events-none text-[#fce0a2]/80 z-10">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 14v8h8M2 22l8-8" />
                  </svg>
                </div>
                <div className="absolute bottom-1.5 right-1.5 pointer-events-none text-[#fce0a2]/80 z-10">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 14v8h-8M22 22l-8-8" />
                  </svg>
                </div>

                {/* Top Skill Badge */}
                <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#d4af37]/60 text-[10px] font-bold text-[#fce0a2] tracking-wider uppercase shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#d4af37]" /> {tale.skill}
                </div>

                {/* Dark Vignette Gradient Overlay at Bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                {/* Bottom Gold Title Banner (Matching 2Dad&MomTales.png, 2MarriageTales.png, 2WorkTales.png exactly) */}
                <div className="relative z-10 p-4 pt-8 text-center flex flex-col items-center justify-end">
                  <h3 className="text-2xl sm:text-3xl font-bold font-cinzel text-[#fce0a2] tracking-wider drop-shadow-md">
                    {tale.title}
                  </h3>
                  
                  {/* Decorative Gold Filigree Divider with Diamond */}
                  <div className="w-full max-w-[80%] flex items-center justify-center my-1.5 text-[#d4af37]">
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent flex-1" />
                    <span className="px-2 text-xs font-serif">❖</span>
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent flex-1" />
                  </div>

                  {tale.subtitle && (
                    <p className="text-xs text-slate-300 font-serif-display italic line-clamp-1 mb-1">
                      {tale.subtitle}
                    </p>
                  )}

                  {/* Social Stats */}
                  <div className="flex items-center justify-center gap-4 text-[11px] text-[#fce0a2] mt-1">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-[#fce0a2]" /> {tale.viewsCount}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-[#fce0a2]" /> {tale.likesCount}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-[#fce0a2]" /> {tale.commentsCount}</span>
                  </div>
                </div>

              </div>
            </div>
          ))}

          {/* ADD BUTTON CARD (Matching Dashboard & Tales style) */}
          <div
            onClick={() => setShowAddModal(true)}
            className="p-[3px] rounded-[18px] bg-gradient-to-b from-[#f3e5ab]/60 via-[#d4af37]/40 to-[#8a5d12]/60 hover:from-[#f3e5ab] hover:to-[#8a5d12] shadow-xl transition-all duration-300 group cursor-pointer"
          >
            <div className={`relative h-72 sm:h-80 rounded-[15px] p-6 flex flex-col items-center justify-center text-center transition-colors ${
              darkMode ? 'bg-[#0f141c]/90 text-slate-100' : 'bg-white/95 text-slate-900'
            }`}>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#996515] p-0.5 mb-3 group-hover:scale-110 transition-transform shadow-lg">
                <div className={`w-full h-full rounded-full flex items-center justify-center text-[#d4af37] ${
                  darkMode ? 'bg-[#0f141c]' : 'bg-white'
                }`}>
                  <Plus className="w-8 h-8" />
                </div>
              </div>
              <h3 className={`text-xl font-bold font-cinzel ${
                darkMode ? 'text-[#fce0a2] group-hover:text-white' : 'text-[#8a5d12]'
              }`}>
                Add Custom Tale
              </h3>
              <p className={`text-xs max-w-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Create a new choice-driven legend in realm {realm.title}.
              </p>
              <span className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#996515] text-slate-900 font-bold text-xs shadow-md group-hover:brightness-110 transition-all">
                + Create Tale
              </span>
            </div>
          </div>

        </div>

        {/* Modal for adding tale */}
        {showAddModal && (
          <AddTaleModal
            realm={realm}
            onClose={() => setShowAddModal(false)}
            onSubmitTale={(newT) => {
              onSubmitNewTale(newT);
              setShowAddModal(false);
            }}
            darkMode={darkMode}
          />
        )}

      </div>
    </div>
  );
};
