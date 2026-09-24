/**
 * choiceLocalization.ts
 *
 * All i18n lookup logic for a choice's display text lives here, separate from
 * the chapter/act navigation rules in chapterFlowMachine.ts. There is exactly
 * one lookup order, shared by title/subtitle, instead of separate copies of
 * the same four steps:
 *
 *   1. An explicit <field>Key set directly on the choice config
 *   2. A world/chapter/choice-specific i18n key, e.g. "eldorado_act0_choice1_title"
 *   3. A legacy fallback key for the original Atlantis Chapter 1 tale, e.g. "choice1_title"
 *   4. A hardcoded fallback string baked into the choice config itself
 */
import { Language } from '../types';
import { Translations, TRANSLATIONS } from './i18n';
import { ChapterChoiceConfig } from './chapterTypes';

type ChoiceTextField = 'title' | 'subtitle';

const FIELD_KEY_PROP: Record<ChoiceTextField, 'titleKey' | 'subtitleKey'> = {
  title: 'titleKey',
  subtitle: 'subtitleKey',
};

function getLocalizedChoiceText(
  field: ChoiceTextField,
  choice: ChapterChoiceConfig,
  lang: Language | string = 'EN',
  world?: string,
  chapterNumber?: number
): string | undefined {
  const dict = TRANSLATIONS[(lang as Language) || 'EN'];

  // No dictionary at all: title still falls back to the raw config value;
  // subtitle simply has nothing to show.
  if (!dict) return field === 'title' ? choice.title?.trim() || undefined : undefined;

  // 1. Explicit key set directly on this choice (e.g. choice.titleKey)
  const explicitKey = choice[FIELD_KEY_PROP[field]];
  const explicitVal = explicitKey && dict[explicitKey]?.trim();
  if (explicitVal) return explicitVal;

  // 2. World/chapter/choice-specific key, e.g. "eldorado_act0_choice1_title"
  if (world) {
    const worldActKey = `${world.toLowerCase()}_act${chapterNumber ?? 0}_${choice.id}_${field}` as keyof Translations;
    const worldVal = dict[worldActKey]?.trim();
    if (worldVal) return worldVal;
  }

  // 3. Legacy fallback for the original Atlantis Chapter 1 tale, e.g. "choice1_title"
  if ((world === 'Atlantis' || !world) && (chapterNumber === 1 || chapterNumber === undefined)) {
    const defaultKey = `${choice.id}_${field}` as keyof Translations;
    const defaultVal = dict[defaultKey]?.trim();
    if (defaultVal) return defaultVal;
  }

  // 4. Hardcoded fallback baked into the choice config
  return choice[field]?.trim() || undefined;
}

export function getChoiceLocalizedTitle(
  choice: ChapterChoiceConfig,
  lang: Language | string = 'EN',
  world?: string,
  chapterNumber?: number
): string | undefined {
  return getLocalizedChoiceText('title', choice, lang, world, chapterNumber);
}

export function getChoiceLocalizedSubtitle(
  choice: ChapterChoiceConfig,
  lang: Language | string = 'EN',
  world?: string,
  chapterNumber?: number
): string | undefined {
  return getLocalizedChoiceText('subtitle', choice, lang, world, chapterNumber);
}

const FALLBACK_FEEDBACK_TEXTS: Record<string, Record<Language, string[]>> = {
  'atlantis-ch2-choice1': {
    EN: [
      'Many hands make light work. By uniting the citizens and coordinating their efforts, the sea gates were fortified in record time.',
      'Your deliberate planning and collaborative leadership turned what seemed like an impossible crisis into a shared triumph.',
      'Atlantis stands resilient when every citizen plays their part in the grand plan.'
    ],
    ES: [
      'Muchas manos aligeran el trabajo. Al unir a los ciudadanos y coordinar sus esfuerzos, las compuertas se reforzaron en tiempo récord.',
      'Tu planificación deliberada y liderazgo colaborativo convirtieron una crisis imposible en un triunfo compartido.',
      'Atlántida se mantiene firme cuando cada ciudadano cumple su función dentro del gran plan.'
    ],
    IT: [
      'Molte mani rendono il lavoro leggero. Unendo i cittadini e coordinando i loro sforzi, le paratoie sono state fortificate a tempo di record.',
      'La tua pianificazione e leadership collaborativa hanno trasformato una crisi impossibile in un trionfo condiviso.',
      'Atlantide resiste quando ogni cittadino fa la sua parte nel grande piano.'
    ],
    PT: [
      'Muitas mãos tornam o fardo leve. Ao unir os cidadãos e coordenar os esforços, os portões marítimos foram fortificados em tempo recorde.',
      'Seu planejamento estratégico e liderança colaborativa transformaram uma crise impossível em uma vitória compartilhada.',
      'Atlântida resiste quando cada cidadão faz a sua parte no grande plano.'
    ],
    NL: [
      'Vele handen maken licht werk. Door de burgers te verenigen en hun inspanningen te coördineren, werden de waterpoorten in recordtijd versterkt.',
      'Jouw doordachte planning en gezamenlijke leiding maakten van een schijnbaar onmogelijke crisis een gezamenlijke overwinning.',
      'Atlantis blijft overeind wanneer elke burger zijn steentje bijdraagt aan het grote plan.'
    ],
  },
  'atlantis-ch2-choice2': {
    EN: [
      'Diving straight into the floodwaters was courageous, but rushing without a coordinated plan left rescuers scattered and exhausted.',
      'Raw bravery cannot conquer the deluge without a shared strategy. Regroup and plan with the community.'
    ],
    ES: [
      'Lanzarse directamente a la inundación fue valiente, pero actuar sin un plan coordinado dispersó y agotó al equipo de rescate.',
      'La valentía sola no puede frenar el diluvio sin una estrategia compartida. Reagúpate y planifica con la comunidad.'
    ],
    IT: [
      'Tuffarsi direttamente nell\'inondazione è stato coraggioso, ma agire senza un piano ha disperso ed esausto i soccorritori.',
      'Il coraggio da solo non può vincere la furia dell\'acqua senza una strategia comune. Riorganizzati e pianifica.'
    ],
    PT: [
      'Mergulhar nas águas foi corajoso, mas agir sem um plano coordenado dispersou e exauriu a equipe de resgate.',
      'A coragem sozinha não consegue conter o dilúvio sem estratégia compartilhada. Reagrupe-se e planeje com a comunidade.'
    ],
    NL: [
      'Recht de vloed in duiken was moedig, maar zonder plan raakten de redders verspreid en uitgeput.',
      'Moed alleen kan de vloed niet tegenhouden zonder een gezamenlijke strategie. Hergroepeer en maak een plan.'
    ],
  },
  'atlantis-ch2-choice3': {
    EN: [
      'Making the painful decision to sacrifice the lower sectors protected the core archives, but the social cost was heavy.',
      'A difficult sacrifice demands immediate contingency planning and emergency relief for those affected.'
    ],
    ES: [
      'Tomar la dolorosa decisión de sacrificar los sectores bajos protegió los archivos centrales, pero el costo social fue inmenso.',
      'Un sacrificio difícil requiere planificación de contingencia inmediata y auxilio para los afectados.'
    ],
    IT: [
      'Prendere la dolorosa decisione di sacrificare i settori bassi ha protetto gli archivi centrali, ma il costo sociale è stato pesante.',
      'Un sacrificio difficile richiede una pianificazione immediata dei soccorsi per chi è stato colpito.'
    ],
    PT: [
      'Tomar a difícil decisão de sacrificar os setores inferiores protegeu os arquivos centrais, mas o custo social foi pesado.',
      'Um sacrifício difícil exige plano de contingência imediato e socorro para os afetados.'
    ],
    NL: [
      'De pijnlijke beslissing om de lagere sectoren op te offeren beschermde de kernarchieven, maar de sociale tol was zwaar.',
      'Een moeilijk offer vraagt om onmiddellijke noodhulp en herstelplanning voor de getroffenen.'
    ],
  },
};

export function getFallbackChoiceFeedback(
  world = 'Atlantis',
  chapterNumber = 2,
  choiceId = 'choice1',
  lang: Language | string = 'EN'
): string[] | undefined {
  const normalizedLang = ((lang as Language) || 'EN').toUpperCase() as Language;
  const key = `${world.toLowerCase()}-ch${chapterNumber}-${choiceId}`;
  const match = FALLBACK_FEEDBACK_TEXTS[key];
  if (!match) return undefined;
  return match[normalizedLang] || match['EN'];
}
