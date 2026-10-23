import { Language } from '../types';

export interface ChoiceTitleItem {
  Id: string;
  url: string; // The title string as specified in the "Id, url" structure
  title: string;
}

export type StoryChoiceTitles = Record<string, ChoiceTitleItem>;
export type WorldChoiceTitles = Record<string, StoryChoiceTitles>;
export type LocalizedChoiceTitles = Record<Language, Record<string, WorldChoiceTitles>>;

/**
 * Localized Choice and Chapter Titles for ATLANTIS / "5 Crystals" across all 5 languages.
 * Structure: Id, url (with title alias)
 */
export const ChoiceTitles: Record<Language, { ATLANTIS: { '5 Crystals': Record<string, ChoiceTitleItem> } }> = {
  EN: {
    ATLANTIS: {
      '5 Crystals': {
        Chapter0: { Id: 'Chapter0', url: 'The 5 Crystals', title: 'The 5 Crystals' },
        Chapter1: { Id: 'Chapter1', url: 'The Celebration', title: 'The Celebration' },
        Chapter1Choice1: { Id: 'Chapter1Choice1', url: 'When It Matters', title: 'When It Matters' },
        Chapter1Choice2: { Id: 'Chapter1Choice2', url: 'Step Back', title: 'Step Back' },
        Chapter1Choice3: { Id: 'Chapter1Choice3', url: 'Set Things Right', title: 'Set Things Right' },
        Chapter2: { Id: 'Chapter2', url: 'The Archives', title: 'The Archives' },
        Chapter2Choice1: { Id: 'Chapter2Choice1', url: 'Make Room', title: 'Make Room' },
        Chapter2Choice2: { Id: 'Chapter2Choice2', url: 'Just a Moment', title: 'Just a Moment' },
        Chapter2Choice3: { Id: 'Chapter2Choice3', url: 'Hold It Together', title: 'Hold It Together' },
        Chapter3: { Id: 'Chapter3', url: 'The Project', title: 'The Project' },
        Chapter3Choice1: { Id: 'Chapter3Choice1', url: 'Shift the Ground', title: 'Shift the Ground' },
        Chapter3Choice2: { Id: 'Chapter3Choice2', url: 'Let It Go', title: 'Let It Go' },
        Chapter3Choice3: { Id: 'Chapter3Choice3', url: 'Take Control', title: 'Take Control' },
        Chapter4: { Id: 'Chapter4', url: 'The Sound Beneath the Deep', title: 'The Sound Beneath the Deep' },
        Chapter4Choice1: { Id: 'Chapter4Choice1', url: 'Find the Signal', title: 'Find the Signal' },
        Chapter4Choice2: { Id: 'Chapter4Choice2', url: 'STAND FIRM', title: 'STAND FIRM' },
        Chapter4Choice3: { Id: 'Chapter4Choice3', url: 'Make the Move', title: 'Make the Move' },
        Chapter5: { Id: 'Chapter5', url: 'THE PUZZLE OF ATLANTIS', title: 'THE PUZZLE OF ATLANTIS' },
        Chapter5Choice1: { Id: 'Chapter5Choice1', url: 'THE QUIET PATH', title: 'THE QUIET PATH' },
        Chapter5Choice2: { Id: 'Chapter5Choice2', url: 'THE TURNING TIDE', title: 'THE TURNING TIDE' },
        Chapter5Choice3: { Id: 'Chapter5Choice3', url: 'THE SHATTERED MIRROR', title: 'THE SHATTERED MIRROR' },
      },
    },
  },
  ES: {
    ATLANTIS: {
      '5 Crystals': {
        Chapter0: { Id: 'Chapter0', url: 'Los 5 Cristales', title: 'Los 5 Cristales' },
        Chapter1: { Id: 'Chapter1', url: 'La Celebración', title: 'La Celebración' },
        Chapter1Choice1: { Id: 'Chapter1Choice1', url: 'Cuando Importa', title: 'Cuando Importa' },
        Chapter1Choice2: { Id: 'Chapter1Choice2', url: 'Dar un Paso Atrás', title: 'Dar un Paso Atrás' },
        Chapter1Choice3: { Id: 'Chapter1Choice3', url: 'Arreglar las Cosas', title: 'Arreglar las Cosas' },
        Chapter2: { Id: 'Chapter2', url: 'Los Archivos', title: 'Los Archivos' },
        Chapter2Choice1: { Id: 'Chapter2Choice1', url: 'Hacer Espacio', title: 'Hacer Espacio' },
        Chapter2Choice2: { Id: 'Chapter2Choice2', url: 'Solo un Momento', title: 'Solo un Momento' },
        Chapter2Choice3: { Id: 'Chapter2Choice3', url: 'Mantener la Calma', title: 'Mantener la Calma' },
        Chapter3: { Id: 'Chapter3', url: 'El Proyecto', title: 'El Proyecto' },
        Chapter3Choice1: { Id: 'Chapter3Choice1', url: 'Cambiar el Terreno', title: 'Cambiar el Terreno' },
        Chapter3Choice2: { Id: 'Chapter3Choice2', url: 'Dejarlo Ir', title: 'Dejarlo Ir' },
        Chapter3Choice3: { Id: 'Chapter3Choice3', url: 'Tomar el Control', title: 'Tomar el Control' },
        Chapter4: { Id: 'Chapter4', url: 'El Sonido Bajo el Abismo', title: 'El Sonido Bajo el Abismo' },
        Chapter4Choice1: { Id: 'Chapter4Choice1', url: 'Encontrar la Señal', title: 'Encontrar la Señal' },
        Chapter4Choice2: { Id: 'Chapter4Choice2', url: 'MANTENERSE FIRME', title: 'MANTENERSE FIRME' },
        Chapter4Choice3: { Id: 'Chapter4Choice3', url: 'Dar el Paso', title: 'Dar el Paso' },
        Chapter5: { Id: 'Chapter5', url: 'EL ENIGMA DE LA ATLÁNTIDA', title: 'EL ENIGMA DE LA ATLÁNTIDA' },
        Chapter5Choice1: { Id: 'Chapter5Choice1', url: 'EL CAMINO SILENCIOSO', title: 'EL CAMINO SILENCIOSO' },
        Chapter5Choice2: { Id: 'Chapter5Choice2', url: 'LA MAREA CAMBIANTE', title: 'LA MAREA CAMBIANTE' },
        Chapter5Choice3: { Id: 'Chapter5Choice3', url: 'EL ESPEJO ROTO', title: 'EL ESPEJO ROTO' },
      },
    },
  },
  IT: {
    ATLANTIS: {
      '5 Crystals': {
        Chapter0: { Id: 'Chapter0', url: 'I 5 Cristalli', title: 'I 5 Cristalli' },
        Chapter1: { Id: 'Chapter1', url: 'La Celebrazione', title: 'La Celebrazione' },
        Chapter1Choice1: { Id: 'Chapter1Choice1', url: 'Quando Conta', title: 'Quando Conta' },
        Chapter1Choice2: { Id: 'Chapter1Choice2', url: 'Fai un Passo Indietro', title: 'Fai un Passo Indietro' },
        Chapter1Choice3: { Id: 'Chapter1Choice3', url: 'Rimettere le Cose a Posto', title: 'Rimettere le Cose a Posto' },
        Chapter2: { Id: 'Chapter2', url: 'Gli Archivi', title: 'Gli Archivi' },
        Chapter2Choice1: { Id: 'Chapter2Choice1', url: 'Fai Spazio', title: 'Fai Spazio' },
        Chapter2Choice2: { Id: 'Chapter2Choice2', url: 'Solo un Momento', title: 'Solo un Momento' },
        Chapter2Choice3: { Id: 'Chapter2Choice3', url: 'Tieni Duro', title: 'Tieni Duro' },
        Chapter3: { Id: 'Chapter3', url: 'Il Progetto', title: 'Il Progetto' },
        Chapter3Choice1: { Id: 'Chapter3Choice1', url: 'Cambia la Prospettiva', title: 'Cambia la Prospettiva' },
        Chapter3Choice2: { Id: 'Chapter3Choice2', url: 'Lascia Andare', title: 'Lascia Andare' },
        Chapter3Choice3: { Id: 'Chapter3Choice3', url: 'Prendi il Controllo', title: 'Prendi il Controllo' },
        Chapter4: { Id: 'Chapter4', url: 'Il Suono negli Abissi', title: 'Il Suono negli Abissi' },
        Chapter4Choice1: { Id: 'Chapter4Choice1', url: 'Trova il Segnale', title: 'Trova il Segnale' },
        Chapter4Choice2: { Id: 'Chapter4Choice2', url: 'RESTA SALDO', title: 'RESTA SALDO' },
        Chapter4Choice3: { Id: 'Chapter4Choice3', url: 'Fai la Mossa', title: 'Fai la Mossa' },
        Chapter5: { Id: 'Chapter5', url: "L'ENIGMA DI ATLANTIDE", title: "L'ENIGMA DI ATLANTIDE" },
        Chapter5Choice1: { Id: 'Chapter5Choice1', url: 'IL SENTIERO SILENZIOSO', title: 'IL SENTIERO SILENZIOSO' },
        Chapter5Choice2: { Id: 'Chapter5Choice2', url: 'LA MAREA CRESCENTE', title: 'LA MAREA CRESCENTE' },
        Chapter5Choice3: { Id: 'Chapter5Choice3', url: 'LO SPECCHIO INFRANTO', title: 'LO SPECCHIO INFRANTO' },
      },
    },
  },
  PT: {
    ATLANTIS: {
      '5 Crystals': {
        Chapter0: { Id: 'Chapter0', url: 'Os 5 Cristais', title: 'Os 5 Cristais' },
        Chapter1: { Id: 'Chapter1', url: 'A Celebração', title: 'A Celebração' },
        Chapter1Choice1: { Id: 'Chapter1Choice1', url: 'Quando Importa', title: 'Quando Importa' },
        Chapter1Choice2: { Id: 'Chapter1Choice2', url: 'Dar um Passo Atrás', title: 'Dar um Passo Atrás' },
        Chapter1Choice3: { Id: 'Chapter1Choice3', url: 'Acertar as Coisas', title: 'Acertar as Coisas' },
        Chapter2: { Id: 'Chapter2', url: 'Os Arquivos', title: 'Os Arquivos' },
        Chapter2Choice1: { Id: 'Chapter2Choice1', url: 'Abrir Espaço', title: 'Abrir Espaço' },
        Chapter2Choice2: { Id: 'Chapter2Choice2', url: 'Só um Momento', title: 'Só um Momento' },
        Chapter2Choice3: { Id: 'Chapter2Choice3', url: 'Manter a Calma', title: 'Manter a Calma' },
        Chapter3: { Id: 'Chapter3', url: 'O Projeto', title: 'O Projeto' },
        Chapter3Choice1: { Id: 'Chapter3Choice1', url: 'Mudar o Rumo', title: 'Mudar o Rumo' },
        Chapter3Choice2: { Id: 'Chapter3Choice2', url: 'Deixar Ir', title: 'Deixar Ir' },
        Chapter3Choice3: { Id: 'Chapter3Choice3', url: 'Assumir o Controle', title: 'Assumir o Controle' },
        Chapter4: { Id: 'Chapter4', url: 'O Som Sob as Profundezas', title: 'O Som Sob as Profundezas' },
        Chapter4Choice1: { Id: 'Chapter4Choice1', url: 'Encontrar o Sinal', title: 'Encontrar o Sinal' },
        Chapter4Choice2: { Id: 'Chapter4Choice2', url: 'MANTER-SE FIRME', title: 'MANTER-SE FIRME' },
        Chapter4Choice3: { Id: 'Chapter4Choice3', url: 'Fazer o Movimento', title: 'Fazer o Movimento' },
        Chapter5: { Id: 'Chapter5', url: 'O ENIGMA DE ATLÂNTIDA', title: 'O ENIGMA DE ATLÂNTIDA' },
        Chapter5Choice1: { Id: 'Chapter5Choice1', url: 'O CAMINHO SILENCIOSO', title: 'O CAMINHO SILENCIOSO' },
        Chapter5Choice2: { Id: 'Chapter5Choice2', url: 'A MARÉ MUDANDO', title: 'A MARÉ MUDANDO' },
        Chapter5Choice3: { Id: 'Chapter5Choice3', url: 'O ESPELHO QUEBRADO', title: 'O ESPELHO QUEBRADO' },
      },
    },
  },
  NL: {
    ATLANTIS: {
      '5 Crystals': {
        Chapter0: { Id: 'Chapter0', url: 'De 5 Kristallen', title: 'De 5 Kristallen' },
        Chapter1: { Id: 'Chapter1', url: 'De Viering', title: 'De Viering' },
        Chapter1Choice1: { Id: 'Chapter1Choice1', url: 'Wanneer Het Erop Aankomt', title: 'Wanneer Het Erop Aankomt' },
        Chapter1Choice2: { Id: 'Chapter1Choice2', url: 'Doe een Stap Terug', title: 'Doe een Stap Terug' },
        Chapter1Choice3: { Id: 'Chapter1Choice3', url: 'Zet de Zaken Recht', title: 'Zet de Zaken Recht' },
        Chapter2: { Id: 'Chapter2', url: 'De Archieven', title: 'De Archieven' },
        Chapter2Choice1: { Id: 'Chapter2Choice1', url: 'Maak Ruimte', title: 'Maak Ruimte' },
        Chapter2Choice2: { Id: 'Chapter2Choice2', url: 'Even Geduld', title: 'Even Geduld' },
        Chapter2Choice3: { Id: 'Chapter2Choice3', url: 'Houd Het Bijeen', title: 'Houd Het Bijeen' },
        Chapter3: { Id: 'Chapter3', url: 'Het Project', title: 'Het Project' },
        Chapter3Choice1: { Id: 'Chapter3Choice1', url: 'Verschuif het Terrein', title: 'Verschuif het Terrein' },
        Chapter3Choice2: { Id: 'Chapter3Choice2', url: 'Laat Het Los', title: 'Laat Het Los' },
        Chapter3Choice3: { Id: 'Chapter3Choice3', url: 'Neem de Controle', title: 'Neem de Controle' },
        Chapter4: { Id: 'Chapter4', url: 'Het Geluid Onder de Diepte', title: 'Het Geluid Onder de Diepte' },
        Chapter4Choice1: { Id: 'Chapter4Choice1', url: 'Vind het Signaal', title: 'Vind het Signaal' },
        Chapter4Choice2: { Id: 'Chapter4Choice2', url: 'STA STEVIG', title: 'STA STEVIG' },
        Chapter4Choice3: { Id: 'Chapter4Choice3', url: 'Zet de Stap', title: 'Zet de Stap' },
        Chapter5: { Id: 'Chapter5', url: 'HET RAADSEL VAN ATLANTIS', title: 'HET RAADSEL VAN ATLANTIS' },
        Chapter5Choice1: { Id: 'Chapter5Choice1', url: 'HET STILLE PAD', title: 'HET STILLE PAD' },
        Chapter5Choice2: { Id: 'Chapter5Choice2', url: 'HET KEREND TIJ', title: 'HET KEREND TIJ' },
        Chapter5Choice3: { Id: 'Chapter5Choice3', url: 'DE GEBROKEN SPIEGEL', title: 'DE GEBROKEN SPIEGEL' },
      },
    },
  },
};

/**
 * Convenience flat map of Atlantis English choice titles for backwards compatibility.
 */
export const ATLANTIS_CHOICE_TITLES: Record<string, string> = {
  '1:choice1': ChoiceTitles.EN.ATLANTIS['5 Crystals'].Chapter1Choice1.title,
  '1:choice2': ChoiceTitles.EN.ATLANTIS['5 Crystals'].Chapter1Choice2.title,
  '1:choice3': ChoiceTitles.EN.ATLANTIS['5 Crystals'].Chapter1Choice3.title,
  '2:choice1': ChoiceTitles.EN.ATLANTIS['5 Crystals'].Chapter2Choice1.title,
  '2:choice2': ChoiceTitles.EN.ATLANTIS['5 Crystals'].Chapter2Choice2.title,
  '2:choice3': ChoiceTitles.EN.ATLANTIS['5 Crystals'].Chapter2Choice3.title,
  '3:choice1': ChoiceTitles.EN.ATLANTIS['5 Crystals'].Chapter3Choice1.title,
  '3:choice2': ChoiceTitles.EN.ATLANTIS['5 Crystals'].Chapter3Choice2.title,
  '3:choice3': ChoiceTitles.EN.ATLANTIS['5 Crystals'].Chapter3Choice3.title,
  '4:choice1': ChoiceTitles.EN.ATLANTIS['5 Crystals'].Chapter4Choice1.title,
  '4:choice2': ChoiceTitles.EN.ATLANTIS['5 Crystals'].Chapter4Choice2.title,
  '4:choice3': ChoiceTitles.EN.ATLANTIS['5 Crystals'].Chapter4Choice3.title,
  '5:choice1': ChoiceTitles.EN.ATLANTIS['5 Crystals'].Chapter5Choice1.title,
  '5:choice2': ChoiceTitles.EN.ATLANTIS['5 Crystals'].Chapter5Choice2.title,
  '5:choice3': ChoiceTitles.EN.ATLANTIS['5 Crystals'].Chapter5Choice3.title,
};

/**
 * Retrieve a localized choice or chapter title from ChoiceTitles.
 */
export function getLocalizedChoiceTitle(
  world: string = 'ATLANTIS',
  story: string = '5 Crystals',
  key: string,
  lang: Language | string = 'EN'
): string | undefined {
  const normLang = (String(lang).toUpperCase() as Language) || 'EN';
  const langTable = ChoiceTitles[normLang] || ChoiceTitles.EN;
  const worldKey = world.toUpperCase() === 'ATLANTIS' ? 'ATLANTIS' : world;
  const storyTable = langTable[worldKey as 'ATLANTIS']?.['5 Crystals'];
  if (!storyTable) return undefined;

  // Direct match by Id (e.g. 'Chapter2Choice1', 'Chapter0', 'Chapter1')
  if (storyTable[key]) {
    return storyTable[key].title || storyTable[key].url;
  }

  // Handle format like '2:choice1' -> 'Chapter2Choice1'
  if (key.includes(':')) {
    const [ch, chId] = key.split(':');
    const choiceNum = chId.replace(/\D/g, '');
    const mappedKey = `Chapter${ch}Choice${choiceNum}`;
    if (storyTable[mappedKey]) {
      return storyTable[mappedKey].title || storyTable[mappedKey].url;
    }
  }

  return undefined;
}
