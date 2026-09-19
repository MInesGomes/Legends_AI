import { Language } from '../types';

export interface Translations {
  // Navigation & Header
  appTitle: string;
  profileProgress: string;
  installApp: string;
  talesReadToday: string;
  toggleTheme: string;
  selectLanguage: string;

  // Realms
  realm_work: string;
  realm_marriage: string;
  realm_dad_mom: string;
  realm_atlantis: string;
  realm_el_dorado: string;
  realm_future_land: string;
  audience_child: string;
  audience_adult: string;

  // Dashboard
  futureTagline: string;
  feedbackBtn: string;
  feedbackDesc: string;
  dashboardFeedbackTitle: string;

  // Tales Page
  talesTitleSuffix: string;
  underReview: string;
  approvedTale: string;
  unlockedToday: string;
  userCommentsTooltip: string;
  dailyLimitReachedTitle: string;
  dailyLimitReachedDesc: string;
  dailyTalesGoal: string;
  youthProtectionRule: string;
  adultLimitRule: string;
  adjustLimitProfile: string;
  returnToTales: string;

  // Act Page
  clickToPause: string;
  clickToPlay: string;
  closeAct: string;
  comments: string;
  autoplayOn: string;
  autoplayOff: string;
  muteAudio: string;
  unmuteAudio: string;
  selectVoiceMp3: string;
  selectSubtitlesVtt: string;
  previousAct: string;
  nextAct: string;
  comingSoon: string;
  comingSoonDesc: string;
  actCompleted: string;
  commentBtn: string;
  replayBtn: string;
  skipBtn: string;
  skipMediaBtn: string;
  finishBtn: string;
  chooseYourPath: string;
  choice1_title: string;
  choice1_subtitle: string;
  choice1_description: string;
  choice2_title: string;
  choice2_subtitle: string;
  choice2_description: string;
  choice3_title: string;
  choice3_subtitle: string;
  choice3_description: string;
  choice4_title: string;
  choice4_subtitle: string;
  choice4_description: string;

  // El Dorado Act 0 Choices
  eldorado_act0_choice1_description: string;
  eldorado_act0_choice2_description: string;
  readAloudEarnPoints: string;

  // Comments Drawer
  commentsTitle: string;
  myComments: string;
  privateToYou: string;
  dailyLimitStatus: string;
  commentsLeftToday: string;
  dailyCommentLimit: string;
  noCommentsYet: string;
  noCommentsSub: string;
  youLabel: string;
  editComment: string;
  deleteComment: string;
  leaveCommentPlaceholder: string;
  limitReached: string;
  commentPlaceholder: string;
  commentLimitReached: string;
  postComment: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;

  // Profile Drawer
  travelerProfile: string;
  changeAvatar: string;
  femaleTab: string;
  maleTab: string;
  languageLabel: string;
  skillPointsLabel: string;
  dailyTalesLimitLabel: string;
  signOut: string;
  saveChanges: string;
  skillsProgress: string;
  readAloudSkillViews: string;
  readAloudSkillViewsDesc: string;
  languagesTitle: string;
  chaptersSeen: string;
  totalPts: string;
  chapterUnit: string;
  chaptersUnit: string;
  activeStatus: string;
  hideAvatarChoices: string;
  changeAvatarChoices: string;

  // Bottom Hub (Accessibility)
  textSizeReadability: string;
  standardSize: string;
  largeSize: string;
  xlargeSize: string;
  sizeLabel: string;
  openHub: string;
  decreaseSize: string;
  increaseSize: string;

  // Auth Screen
  signIn: string;
  createAccount: string;
  continueWithGoogle: string;
  instantDemoLogins: string;
  orWithEmail: string;
  emailAddress: string;
  password: string;
  signInToDashboard: string;
  yourFullName: string;
  dateOfBirth: string;

  // Skills
  skill_Leader: string;
  skill_Plan: string;
  skill_Win4All: string;
  skill_Listen: string;
  skill_Recharge: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  EN: {
    appTitle: 'Legends',
    profileProgress: 'Profile & Progress',
    installApp: 'Install App',
    talesReadToday: 'Tales read today',
    toggleTheme: 'Toggle theme',
    selectLanguage: 'Select Language',

    realm_work: 'WORK',
    realm_marriage: 'MARRIAGE',
    realm_dad_mom: 'DAD & MOM',
    realm_atlantis: 'ATLANTIS',
    realm_el_dorado: 'EL DORADO',
    realm_future_land: 'FUTURE LAND',
    audience_child: 'Child',
    audience_adult: 'Adult',

    futureTagline: 'To be ready for the future with AI.',
    feedbackBtn: 'Feedback & Comments',
    feedbackDesc: 'Share your thoughts, suggestions, or feedback',
    dashboardFeedbackTitle: 'Dashboard & App Feedback',

    talesTitleSuffix: 'TALES',
    underReview: 'Under Review (Only You)',
    approvedTale: 'Approved Traveler Tale',
    unlockedToday: 'Unlocked Today',
    userCommentsTooltip: 'Your comments on this tale',
    dailyLimitReachedTitle: 'Daily Limit Reached',
    dailyLimitReachedDesc: 'You have reached your daily reading quota of {limit} tales for today ({count} explored).',
    dailyTalesGoal: 'Daily Tales Goal:',
    youthProtectionRule: 'Youth Protection Rule: Under 18 accounts are limited to a maximum of 5 tales per day.',
    adultLimitRule: 'Adult accounts are capped at a maximum of 10 tales per day to encourage meaningful reflection between decisions.',
    adjustLimitProfile: 'Adjust Limit in Profile',
    returnToTales: 'Return to Tales',

    clickToPause: 'Click to pause video',
    clickToPlay: 'Click to play video',
    closeAct: 'Close Act',
    comments: 'Comments',
    autoplayOn: 'Autoplay is ON — Click to pause',
    autoplayOff: 'Autoplay is OFF — Click to play automatically',
    muteAudio: 'Mute Audio',
    unmuteAudio: 'Unmute Audio',
    selectVoiceMp3: 'Select Audio Voice (MP3) & Play',
    selectSubtitlesVtt: 'Select Subtitles (VTT) & Play',
    previousAct: 'Previous Act',
    nextAct: 'Next Act',
    comingSoon: 'Coming Soon',
    comingSoonDesc: '{title} is currently in production and will be available soon.',
    actCompleted: 'Act completed',
    commentBtn: 'Comment',
    replayBtn: 'Replay',
    skipBtn: 'Skip',
    skipMediaBtn: 'Skip',
    finishBtn: 'Finish',
    chooseYourPath: 'Choose Your Path',
    choice1_title: 'Organize the Evacuation',
    choice1_subtitle: 'Community Leadership',
    choice1_description: "Don’t ask for permission and risk losing everything.",
    choice2_title: 'Try to Solve Everything Alone',
    choice2_subtitle: 'Cautious Heroism',
    choice2_description: 'Attempt to stabilize the central reactor yourself before alarming the public.',
    choice3_title: 'Wait for the Council',
    choice3_subtitle: 'Passive Compliance',
    choice3_description: 'Delay action until the High Council issues formal evacuation orders.',
    choice4_title: 'Force the System',
    choice4_subtitle: 'Act immediately',
    choice4_description: 'Override security safeguards by force, so all can be saved quickly.',
    eldorado_act0_choice1_description: 'Give his light',
    eldorado_act0_choice2_description: 'Afraid to lose his light',
    readAloudEarnPoints: 'Train articulation for {lang} and earn points. Drastically over-pronouncing every single syllable. Move your jaw, lips, and tongue with theatrical exaggeration. This builds muscle memory',

    commentsTitle: 'Comments',
    myComments: 'My Comments',
    privateToYou: 'Private to you',
    dailyLimitStatus: 'Daily Limit Status',
    commentsLeftToday: '{count} of {limit} left today',
    dailyCommentLimit: 'Daily limit: {remaining} of 10 comments remaining today',
    noCommentsYet: 'No comments yet. Be the first to share your thoughts!',
    noCommentsSub: 'Your private reflections and insights for each act will appear here.',
    youLabel: 'YOU',
    editComment: 'Edit Comment',
    deleteComment: 'Delete Comment',
    leaveCommentPlaceholder: 'Share your personal thoughts or reflection...',
    limitReached: 'Daily comment limit reached (10 comments/day max).',
    commentPlaceholder: 'Write your comment (max 280 characters)...',
    commentLimitReached: 'You have reached your daily limit of 10 comments.',
    postComment: 'Post',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',

    travelerProfile: 'Traveler Profile',
    changeAvatar: 'Change Avatar',
    femaleTab: 'Female',
    maleTab: 'Male',
    languageLabel: 'Language',
    skillPointsLabel: 'Skill Points',
    dailyTalesLimitLabel: 'Daily Tale Limit',
    signOut: 'Sign Out',
    saveChanges: 'Save',
    skillsProgress: 'Skills Progress',
    readAloudSkillViews: 'Read Aloud / Skill Views',
    readAloudSkillViewsDesc: 'Views incremented whenever you read aloud ANY choice for a skill in that language',
    languagesTitle: 'Languages',
    chaptersSeen: 'Chapters Seen',
    totalPts: 'Total: {pts} pts',
    chapterUnit: 'chapter',
    chaptersUnit: 'chapters',
    activeStatus: 'Active',
    hideAvatarChoices: 'Hide Avatar Choices',
    changeAvatarChoices: 'Change Avatar (8 Choices)',

    textSizeReadability: 'Text Size & Readability',
    standardSize: 'Standard',
    largeSize: 'Large',
    xlargeSize: 'X-Large',
    sizeLabel: 'Size',
    openHub: 'Open Text Size & Readability Hub',
    decreaseSize: 'Decrease size',
    increaseSize: 'Increase size',

    signIn: 'Sign In',
    createAccount: 'Create Account',
    continueWithGoogle: 'Continue with Google',
    instantDemoLogins: 'Instant Demo Logins',
    orWithEmail: 'Or with email',
    emailAddress: 'Email Address',
    password: 'Password',
    signInToDashboard: 'Sign In to Dashboard',
    yourFullName: 'Your Full Name',
    dateOfBirth: 'Date of Birth',

    skill_Leader: 'Leadership',
    skill_Plan: 'Planning',
    skill_Win4All: 'Win4All',
    skill_Listen: 'Listening',
    skill_Recharge: 'Recharge',
  },

  ES: {
    appTitle: 'Leyendas',
    profileProgress: 'Perfil y progreso',
    installApp: 'Instalar app',
    talesReadToday: 'Historias leídas hoy',
    toggleTheme: 'Cambiar tema',
    selectLanguage: 'Seleccionar idioma',

    realm_work: 'TRABAJO',
    realm_marriage: 'MATRIMONIO',
    realm_dad_mom: 'PAPÁ Y MAMÁ',
    realm_atlantis: 'ATLÁNTIDA',
    realm_el_dorado: 'EL DORADO',
    realm_future_land: 'TIERRA DEL FUTURO',
    audience_child: 'Niños',
    audience_adult: 'Adultos',

    futureTagline: 'Para estar listo para el futuro con IA.',
    feedbackBtn: 'Comentarios y sugerencias',
    feedbackDesc: 'Comparte tus pensamientos, sugerencias o comentarios',
    dashboardFeedbackTitle: 'Comentarios de la aplicación',

    talesTitleSuffix: 'HISTORIAS',
    underReview: 'En revisión (Solo tú)',
    approvedTale: 'Historia de viajero aprobada',
    unlockedToday: 'Desbloqueado hoy',
    userCommentsTooltip: 'Tus comentarios en esta historia',
    dailyLimitReachedTitle: 'Límite diario alcanzado',
    dailyLimitReachedDesc: 'Has alcanzado tu cuota diaria de lectura de {limit} historias para hoy ({count} exploradas).',
    dailyTalesGoal: 'Meta diaria de historias:',
    youthProtectionRule: 'Regla de protección juvenil: menores de 18 años tienen un límite de 5 historias al día.',
    adultLimitRule: 'Las cuentas de adultos tienen un límite de 10 historias al día para fomentar la reflexión.',
    adjustLimitProfile: 'Ajustar límite en perfil',
    returnToTales: 'Volver a las historias',

    clickToPause: 'Clic para pausar el video',
    clickToPlay: 'Clic para reproducir el video',
    closeAct: 'Cerrar acto',
    comments: 'Comentarios',
    autoplayOn: 'Reproducción automática activada — Clic para pausar',
    autoplayOff: 'Reproducción automática desactivada — Clic para reproducir',
    muteAudio: 'Silenciar audio',
    unmuteAudio: 'Activar audio',
    selectVoiceMp3: 'Seleccionar voz de audio (MP3) y reproducir',
    selectSubtitlesVtt: 'Seleccionar subtítulos (VTT) y reproducir',
    previousAct: 'Acto anterior',
    nextAct: 'Siguiente acto',
    comingSoon: 'Próximamente',
    comingSoonDesc: '{title} está actualmente en producción y estará disponible pronto.',
    actCompleted: 'Acto completado',
    commentBtn: 'Comentar',
    replayBtn: 'Repetir',
    skipBtn: 'Saltar',
    skipMediaBtn: 'Saltar',
    finishBtn: 'Finalizar',
    chooseYourPath: 'Elige tu camino',
    choice1_title: 'Organizar la evacuación',
    choice1_subtitle: 'Liderazgo comunitario',
    choice1_description: 'No pidas permiso y arriésgate a perderlo todo.',
    choice2_title: 'Intentar resolver todo solo',
    choice2_subtitle: 'Heroísmo cauteloso',
    choice2_description: 'Intenta estabilizar el reactor central tú mismo antes de alarmar al público.',
    choice3_title: 'Esperar al Consejo',
    choice3_subtitle: 'Cumplimiento pasivo',
    choice3_description: 'Retrasa la acción hasta que el Alto Consejo emita órdenes formales de evacuación.',
    choice4_title: 'Forzar el sistema',
    choice4_subtitle: 'Actúa de inmediato',
    choice4_description: 'Anula las medidas de seguridad por la fuerza para salvar a todos rápidamente.',
    eldorado_act0_choice1_description: 'Da su luz',
    eldorado_act0_choice2_description: 'Miedo a perder su luz',
    readAloudEarnPoints: 'Entrena la articulación para {lang} y gana puntos. Exagera drásticamente la pronunciación de cada sílaba. Mueve la mandíbula, los labios y la lengua con exageración teatral. Esto crea memoria muscular',

    commentsTitle: 'Comentarios',
    myComments: 'Mis Comentarios',
    privateToYou: 'Privado para ti',
    dailyLimitStatus: 'Estado del límite diario',
    commentsLeftToday: 'Quedan {count} de {limit} hoy',
    dailyCommentLimit: 'Límite diario: quedan {remaining} de 10 comentarios hoy',
    noCommentsYet: 'Aún no hay comentarios. ¡Sé el primero en comentar!',
    noCommentsSub: 'Tus reflexiones privadas para cada acto aparecerán aquí.',
    youLabel: 'TÚ',
    editComment: 'Editar Comentario',
    deleteComment: 'Eliminar Comentario',
    leaveCommentPlaceholder: 'Comparte tus reflexiones o pensamientos...',
    limitReached: 'Límite diario de comentarios alcanzado (máx. 10 por día).',
    commentPlaceholder: 'Escribe tu comentario (máx. 280 caracteres)...',
    commentLimitReached: 'Has alcanzado tu límite diario de 10 comentarios.',
    postComment: 'Publicar',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',

    travelerProfile: 'Perfil del viajero',
    changeAvatar: 'Cambiar avatar',
    femaleTab: 'Femenino',
    maleTab: 'Masculino',
    languageLabel: 'Idioma',
    skillPointsLabel: 'Puntos de habilidad',
    dailyTalesLimitLabel: 'Límite diario de historias',
    signOut: 'Cerrar sesión',
    saveChanges: 'Guardar',
    skillsProgress: 'Progreso de habilidades',
    readAloudSkillViews: 'Lectura en voz alta / Vistas de habilidad',
    readAloudSkillViewsDesc: 'Vistas aumentadas cada vez que lees en voz alta CUALQUIER opción para una habilidad en ese idioma',
    languagesTitle: 'Idiomas',
    chaptersSeen: 'Capítulos vistos',
    totalPts: 'Total: {pts} pts',
    chapterUnit: 'capítulo',
    chaptersUnit: 'capítulos',
    activeStatus: 'Activo',
    hideAvatarChoices: 'Ocultar opciones de avatar',
    changeAvatarChoices: 'Cambiar avatar (8 opciones)',

    textSizeReadability: 'Tamaño de texto y legibilidad',
    standardSize: 'Estándar',
    largeSize: 'Grande',
    xlargeSize: 'Extra grande',
    sizeLabel: 'Tamaño',
    openHub: 'Abrir panel de tamaño y legibilidad',
    decreaseSize: 'Reducir tamaño',
    increaseSize: 'Aumentar tamaño',

    signIn: 'Iniciar sesión',
    createAccount: 'Crear cuenta',
    continueWithGoogle: 'Continuar con Google',
    instantDemoLogins: 'Accesos demo instantáneos',
    orWithEmail: 'O con correo electrónico',
    emailAddress: 'Correo electrónico',
    password: 'Contraseña',
    signInToDashboard: 'Entrar al panel',
    yourFullName: 'Tu nombre completo',
    dateOfBirth: 'Fecha de nacimiento',

    skill_Leader: 'Liderazgo',
    skill_Plan: 'Planificación',
    skill_Win4All: 'Win4All',
    skill_Listen: 'Escucha activa',
    skill_Recharge: 'Recarga',
  },

  IT: {
    appTitle: 'Leggende',
    profileProgress: 'Profilo e progressi',
    installApp: 'Installa app',
    talesReadToday: 'Storie lette oggi',
    toggleTheme: 'Cambia tema',
    selectLanguage: 'Seleziona lingua',

    realm_work: 'LAVORO',
    realm_marriage: 'MATRIMONIO',
    realm_dad_mom: 'PAPÀ E MAMMA',
    realm_atlantis: 'ATLANTE',
    realm_el_dorado: 'EL DORADO',
    realm_future_land: 'TERRA DEL FUTURO',
    audience_child: 'Bambini',
    audience_adult: 'Adulti',

    futureTagline: "Per essere pronti per il futuro con l'IA.",
    feedbackBtn: 'Commenti e suggerimenti',
    feedbackDesc: 'Condividi i tuoi pensieri, suggerimenti o feedback',
    dashboardFeedbackTitle: "Feedback sull'app",

    talesTitleSuffix: 'STORIE',
    underReview: 'In revisione (Solo tu)',
    approvedTale: 'Storia del viaggiatore approvata',
    unlockedToday: 'Sbloccato oggi',
    userCommentsTooltip: 'I tuoi commenti su questa storia',
    dailyLimitReachedTitle: 'Limite giornaliero raggiunto',
    dailyLimitReachedDesc: 'Hai raggiunto la quota giornaliera di {limit} storie per oggi ({count} esplorate).',
    dailyTalesGoal: 'Obiettivo storie giornaliero:',
    youthProtectionRule: 'Protezione giovani: gli under 18 hanno un limite di 5 storie al giorno.',
    adultLimitRule: 'Gli account adulti hanno un limite di 10 storie al giorno per favorire la riflessione.',
    adjustLimitProfile: 'Modifica limite nel profilo',
    returnToTales: 'Torna alle storie',

    clickToPause: 'Clicca per mettere in pausa il video',
    clickToPlay: 'Clicca per riprodurre il video',
    closeAct: 'Chiudi atto',
    comments: 'Commenti',
    autoplayOn: 'Riproduzione automatica attiva — Clicca per mettere in pausa',
    autoplayOff: 'Riproduzione automatica disattiva — Clicca per riprodurre',
    muteAudio: 'Disattiva audio',
    unmuteAudio: 'Attiva audio',
    selectVoiceMp3: 'Seleziona voce audio (MP3) e riproduci',
    selectSubtitlesVtt: 'Seleziona sottotitoli (VTT) e riproduci',
    previousAct: 'Atto precedente',
    nextAct: 'Atto successivo',
    comingSoon: 'Prossimamente',
    comingSoonDesc: '{title} è attualmente in produzione e sarà presto disponibile.',
    actCompleted: 'Atto completato',
    commentBtn: 'Commenta',
    replayBtn: 'Rivedi',
    skipBtn: 'Salta',
    skipMediaBtn: 'Salta',
    finishBtn: 'Termina',
    chooseYourPath: 'Scegli il tuo percorso',
    choice1_title: "Organizzare l'evacuazione",
    choice1_subtitle: 'Leadership comunitaria',
    choice1_description: 'Non chiedere il permesso e rischia di perdere tutto.',
    choice2_title: 'Tentare di risolvere tutto da solo',
    choice2_subtitle: 'Eroismo cauto',
    choice2_description: 'Tenta di stabilizzare il reattore centrale da solo prima di allarmare la popolazione.',
    choice3_title: 'Attendere il Consiglio',
    choice3_subtitle: 'Conformità passiva',
    choice3_description: "Ritarda l'azione finché l'Alto Consiglio non emette ordini formali di evacuazione.",
    choice4_title: 'Forzare il sistema',
    choice4_subtitle: 'Agisci immediatamente',
    choice4_description: 'Bypassa i sistemi di sicurezza con la forza per salvare tutti rapidamente.',
    eldorado_act0_choice1_description: 'Dà la sua luce',
    eldorado_act0_choice2_description: 'Ha paura di perdere la sua luce',
    readAloudEarnPoints: "Allena l'articolazione per {lang} e guadagna punti. Pronuncia drasticamente ogni singola sillaba in modo esagerato. Muovi la mandibola, le labbra e la lingua con esagerazione teatrale. Questo sviluppa la memoria muscolare",

    commentsTitle: 'Commenti',
    myComments: 'I miei commenti',
    privateToYou: 'Privato per te',
    dailyLimitStatus: 'Stato limite giornaliero',
    commentsLeftToday: 'Rimasti {count} di {limit} oggi',
    dailyCommentLimit: 'Limite giornaliero: restano {remaining} di 10 commenti oggi',
    noCommentsYet: 'Nessun commento finora. Sii il primo a condividere i tuoi pensieri!',
    noCommentsSub: 'Le tue riflessioni private per ogni atto appariranno qui.',
    youLabel: 'TU',
    editComment: 'Modifica commento',
    deleteComment: 'Elimina commento',
    leaveCommentPlaceholder: 'Condividi i tuoi pensieri o riflessioni...',
    limitReached: 'Limite giornaliero di commenti raggiunto (max 10 al giorno).',
    commentPlaceholder: 'Scrivi il tuo commento (max 280 caratteri)...',
    commentLimitReached: 'Hai raggiunto il tuo limite giornaliero di 10 commenti.',
    postComment: 'Pubblica',
    save: 'Salva',
    cancel: 'Annulla',
    edit: 'Modifica',
    delete: 'Elimina',

    travelerProfile: 'Profilo del viaggiatore',
    changeAvatar: 'Cambia avatar',
    femaleTab: 'Femminile',
    maleTab: 'Maschile',
    languageLabel: 'Lingua',
    skillPointsLabel: 'Punti abilità',
    dailyTalesLimitLabel: 'Limite giornaliero storie',
    signOut: 'Disconnetti',
    saveChanges: 'Salva',
    skillsProgress: 'Progresso abilità',
    readAloudSkillViews: 'Lettura ad alta voce / Visualizzazioni abilità',
    readAloudSkillViewsDesc: 'Visualizzazioni incrementate ogni volta che leggi ad alta voce QUALSIASI scelta per un\'abilità in quella lingua',
    languagesTitle: 'Lingue',
    chaptersSeen: 'Capitoli visti',
    totalPts: 'Totale: {pts} pt',
    chapterUnit: 'capitolo',
    chaptersUnit: 'capitoli',
    activeStatus: 'Attivo',
    hideAvatarChoices: 'Nascondi opzioni avatar',
    changeAvatarChoices: 'Cambia avatar (8 scelte)',

    textSizeReadability: 'Dimensione testo e leggibilità',
    standardSize: 'Standard',
    largeSize: 'Grande',
    xlargeSize: 'Molto grande',
    sizeLabel: 'Dimensione',
    openHub: 'Apri il pannello di dimensione del testo e leggibilità',
    decreaseSize: 'Riduci dimensione',
    increaseSize: 'Aumenta dimensione',

    signIn: 'Accedi',
    createAccount: 'Crea account',
    continueWithGoogle: 'Continua con Google',
    instantDemoLogins: 'Accessi demo istantanei',
    orWithEmail: 'Oppure con email',
    emailAddress: 'Indirizzo email',
    password: 'Password',
    signInToDashboard: 'Accedi alla dashboard',
    yourFullName: 'Il tuo nome completo',
    dateOfBirth: 'Data di nascita',

    skill_Leader: 'Leadership',
    skill_Plan: 'Pianificazione',
    skill_Win4All: 'Win4All',
    skill_Listen: 'Ascolto',
    skill_Recharge: 'Ricarica',
  },

  'PT': {
    appTitle: 'Lendas',
    profileProgress: 'Perfil e progresso',
    installApp: 'Instalar aplicação',
    talesReadToday: 'Histórias lidas hoje',
    toggleTheme: 'Alternar tema',
    selectLanguage: 'Selecionar idioma',

    realm_work: 'TRABALHO',
    realm_marriage: 'CASAMENTO',
    realm_dad_mom: 'PAI E MÃE',
    realm_atlantis: 'ATLÂNTIDA',
    realm_el_dorado: 'EL DORADO',
    realm_future_land: 'TERRA DO FUTURO',
    audience_child: 'Crianças',
    audience_adult: 'Adultos',

    futureTagline: 'Para estar preparado para o futuro com IA.',
    feedbackBtn: 'Comentários e sugestões',
    feedbackDesc: 'Partilhe as suas ideias, sugestões ou comentários',
    dashboardFeedbackTitle: 'Feedback da aplicação',

    talesTitleSuffix: 'HISTÓRIAS',
    underReview: 'Em revisão (Apenas você)',
    approvedTale: 'História de viajante aprovada',
    unlockedToday: 'Desbloqueado hoje',
    userCommentsTooltip: 'Os seus comentários nesta história',
    dailyLimitReachedTitle: 'Limite diário atingido',
    dailyLimitReachedDesc: 'Atingiu a sua quota diária de leitura de {limit} histórias para hoje ({count} exploradas).',
    dailyTalesGoal: 'Meta diária de histórias:',
    youthProtectionRule: 'Proteção de menores: contas de menores de 18 anos limitadas a 5 histórias por dia.',
    adultLimitRule: 'Contas de adultos têm um limite de 10 histórias por dia para incentivar a reflexão.',
    adjustLimitProfile: 'Ajustar limite no perfil',
    returnToTales: 'Voltar às histórias',

    clickToPause: 'Clique para pausar o vídeo',
    clickToPlay: 'Clique para reproduzir o vídeo',
    closeAct: 'Fechar ato',
    comments: 'Comentários',
    autoplayOn: 'Reprodução automática ativada — Clique para pausar',
    autoplayOff: 'Reprodução automática desativada — Clique para reproduzir',
    muteAudio: 'Silenciar áudio',
    unmuteAudio: 'Ativar áudio',
    selectVoiceMp3: 'Selecionar voz de áudio (MP3) e reproduzir',
    selectSubtitlesVtt: 'Selecionar legendas (VTT) e reproduzir',
    previousAct: 'Ato anterior',
    nextAct: 'Próximo ato',
    comingSoon: 'Em breve',
    comingSoonDesc: '{title} está atualmente em produção e estará disponível em breve.',
    actCompleted: 'Ato concluído',
    commentBtn: 'Comentar',
    replayBtn: 'Repetir',
    skipBtn: 'Pular',
    skipMediaBtn: 'Pular',
    finishBtn: 'Concluir',
    chooseYourPath: 'Escolha o seu caminho',
    choice1_title: 'Organizar a evacuação',
    choice1_subtitle: 'Liderança comunitária',
    choice1_description: 'Não peça permissão e arrisque perder tudo.',
    choice2_title: 'Tentar resolver tudo sozinho',
    choice2_subtitle: 'Heroísmo cauteloso',
    choice2_description: 'Tente estabilizar o reator central sozinho antes de alarmar a população.',
    choice3_title: 'Aguardar o Conselho',
    choice3_subtitle: 'Conformidade passiva',
    choice3_description: 'Atrase a ação até que o Alto Conselho emita ordens formais de evacuação.',
    choice4_title: 'Forçar o sistema',
    choice4_subtitle: 'Age imediatamente',
    choice4_description: 'Subverta os sistemas de segurança pela força para que todos possam ser salvos rapidamente.',
    eldorado_act0_choice1_description: 'Dá a sua luz',
    eldorado_act0_choice2_description: 'Com medo de perder a sua luz',
    readAloudEarnPoints: 'Treina a articulação para {lang} e ganha pontos. Exagera drasticamente a pronúncia de cada sílaba. Move o maxilar, os lábios e a língua com exagero teatral. Isto desenvolve a memória muscular',

    commentsTitle: 'Comentários',
    myComments: 'Os Meus Comentários',
    privateToYou: 'Privado para si',
    dailyLimitStatus: 'Estado do limite diário',
    commentsLeftToday: 'Restam {count} de {limit} hoje',
    dailyCommentLimit: 'Limite diário: restam {remaining} de 10 comentários hoje',
    noCommentsYet: 'Ainda sem comentários. Seja o primeiro a partilhar as suas ideias!',
    noCommentsSub: 'As suas reflexões privadas para cada ato aparecerão aqui.',
    youLabel: 'VOCÊ',
    editComment: 'Editar Comentário',
    deleteComment: 'Eliminar Comentário',
    leaveCommentPlaceholder: 'Partilhe os seus pensamentos ou reflexões...',
    limitReached: 'Limite diário de comentários atingido (máx. 10 por dia).',
    commentPlaceholder: 'Escreva o seu comentário (máx. 280 caracteres)...',
    commentLimitReached: 'Atingiu o seu limite diário de 10 comentários.',
    postComment: 'Publicar',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',

    travelerProfile: 'Perfil do viajante',
    changeAvatar: 'Alterar avatar',
    femaleTab: 'Feminino',
    maleTab: 'Masculino',
    languageLabel: 'Idioma',
    skillPointsLabel: 'Pontos de competência',
    dailyTalesLimitLabel: 'Limite diário de histórias',
    signOut: 'Terminar sessão',
    saveChanges: 'Guardar',
    skillsProgress: 'Progresso de competências',
    readAloudSkillViews: 'Leitura em voz alta / Visualizações de competência',
    readAloudSkillViewsDesc: 'Visualizações aumentadas sempre que lê em voz alta QUALQUER escolha para uma competência nesse idioma',
    languagesTitle: 'Idiomas',
    chaptersSeen: 'Capítulos vistos',
    totalPts: 'Total: {pts} pts',
    chapterUnit: 'capítulo',
    chaptersUnit: 'capítulos',
    activeStatus: 'Ativo',
    hideAvatarChoices: 'Ocultar opções de avatar',
    changeAvatarChoices: 'Alterar avatar (8 opções)',

    textSizeReadability: 'Tamanho de texto e legibilidade',
    standardSize: 'Padrão',
    largeSize: 'Grande',
    xlargeSize: 'Extra grande',
    sizeLabel: 'Tamanho',
    openHub: 'Abrir painel de tamanho de texto e legibilidade',
    decreaseSize: 'Diminuir tamanho',
    increaseSize: 'Aumentar tamanho',

    signIn: 'Iniciar Sessão',
    createAccount: 'Criar Conta',
    continueWithGoogle: 'Continuar com o Google',
    instantDemoLogins: 'Início de sessão demo instantâneo',
    orWithEmail: 'Ou com email',
    emailAddress: 'Endereço de email',
    password: 'Palavra-passe',
    signInToDashboard: 'Entrar no painel',
    yourFullName: 'O seu nome completo',
    dateOfBirth: 'Data de nascimento',

    skill_Leader: 'Liderança',
    skill_Plan: 'Planeamento',
    skill_Win4All: 'Win4All',
    skill_Listen: 'Escuta',
    skill_Recharge: 'Recarregar',
  },

  NL: {
    appTitle: 'Legenden',
    profileProgress: 'Profiel & voortgang',
    installApp: 'App installeren',
    talesReadToday: 'Vandaag gelezen verhalen',
    toggleTheme: 'Thema wisselen',
    selectLanguage: 'Taal selecteren',

    realm_work: 'WERK',
    realm_marriage: 'HUWELIJK',
    realm_dad_mom: 'VADER & MOEDER',
    realm_atlantis: 'ATLANTIS',
    realm_el_dorado: 'EL DORADO',
    realm_future_land: 'TOEKOMSTLAND',
    audience_child: 'Kinderen',
    audience_adult: 'Volwassenen',

    futureTagline: 'Klaar voor de toekomst met AI.',
    feedbackBtn: 'Feedback & reacties',
    feedbackDesc: 'Deel je gedachten, suggesties of feedback',
    dashboardFeedbackTitle: 'Dashboard & app-feedback',

    talesTitleSuffix: 'VERHALEN',
    underReview: 'In behandeling (Alleen jij)',
    approvedTale: 'Goedgekeurd reizigersverhaal',
    unlockedToday: 'Vandaag ontgrendeld',
    userCommentsTooltip: 'Jouw reacties op dit verhaal',
    dailyLimitReachedTitle: 'Dagelijkse limiet bereikt',
    dailyLimitReachedDesc: 'Je hebt je dagelijkse leesquotum van {limit} verhalen voor vandaag bereikt ({count} verkend).',
    dailyTalesGoal: 'Dagelijks verhalendoel:',
    youthProtectionRule: 'Jeugdbescherming: accounts onder 18 jaar zijn beperkt tot maximaal 5 verhalen per dag.',
    adultLimitRule: 'Volwassen accounts hebben een limiet van 10 verhalen per dag om reflectie te stimuleren.',
    adjustLimitProfile: 'Limiet aanpassen in profiel',
    returnToTales: 'Terug naar verhalen',

    clickToPause: 'Klik om video te pauzeren',
    clickToPlay: 'Klik om video af te spelen',
    closeAct: 'Akte sluiten',
    comments: 'Reacties',
    autoplayOn: 'Automatisch afspelen staat AAN — Klik om te pauzeren',
    autoplayOff: 'Automatisch afspelen staat UIT — Klik om af te spelen',
    muteAudio: 'Geluid dempen',
    unmuteAudio: 'Geluid aanzetten',
    selectVoiceMp3: 'Selecteer audiostem (MP3) en speel af',
    selectSubtitlesVtt: 'Selecteer ondertitels (VTT) en speel af',
    previousAct: 'Vorige akte',
    nextAct: 'Volgende akte',
    comingSoon: 'Binnenkort beschikbaar',
    comingSoonDesc: '{title} is momenteel in productie en zal binnenkort beschikbaar zijn.',
    actCompleted: 'Akte voltooid',
    commentBtn: 'Reageren',
    replayBtn: 'Opnieuw afspelen',
    skipBtn: 'Overslaan',
    skipMediaBtn: 'Overslaan',
    finishBtn: 'Voltooien',
    chooseYourPath: 'Kies je pad',
    choice1_title: 'Organiseer de evacuatie',
    choice1_subtitle: 'Gemeenschapsleiderschap',
    choice1_description: 'Vraag niet om toestemming en riskeer alles te verliezen.',
    choice2_title: 'Probeer alles alleen op te lossen',
    choice2_subtitle: 'Voorzichtige heldenmoed',
    choice2_description: 'Probeer de centrale reactor zelf te stabiliseren voordat je paniek veroorzaakt.',
    choice3_title: 'Wacht op de Raad',
    choice3_subtitle: 'Passieve volgzaamheid',
    choice3_description: 'Wacht met handelen totdat de Hoge Raad formele evacuatiebevelen uitvaardigt.',
    choice4_title: 'Forceer het systeem',
    choice4_subtitle: 'Handel onmiddellijk',
    choice4_description: 'Omzeil beveiligingssystemen met geweld, zodat iedereen snel kan worden gered.',
    eldorado_act0_choice1_description: 'Geeft zijn licht',
    eldorado_act0_choice2_description: 'Bang om zijn licht te verliezen',
    readAloudEarnPoints: 'Train articulatie voor {lang} en verdien punten. Overdrijf de uitspraak van elke afzonderlijke lettergreep drastisch. Beweeg je kaak, lippen en tong met theatrale overdrijving. Dit bouwt spiergeheugen op',

    commentsTitle: 'Reacties',
    myComments: 'Mijn reacties',
    privateToYou: 'Privé voor jou',
    dailyLimitStatus: 'Dagelijkse limietstatus',
    commentsLeftToday: 'Nog {count} van {limit} vandaag',
    dailyCommentLimit: 'Dagelijkse limiet: nog {remaining} van 10 reacties vandaag over',
    noCommentsYet: 'Nog geen reacties. Deel als eerste je gedachten!',
    noCommentsSub: 'Jouw privé-inzichten en gedachten over elke akte verschijnen hier.',
    youLabel: 'JIJ',
    editComment: 'Reactie bewerken',
    deleteComment: 'Reactie verwijderen',
    leaveCommentPlaceholder: 'Deel je persoonlijke gedachten of reflecties...',
    limitReached: 'Dagelijkse reactielimiet bereikt (max. 10 reacties per dag).',
    commentPlaceholder: 'Schrijf je reactie (max. 280 tekens)...',
    commentLimitReached: 'Je hebt je dagelijkse limiet van 10 reacties bereikt.',
    postComment: 'Plaatsen',
    save: 'Opslaan',
    cancel: 'Annuleren',
    edit: 'Bewerken',
    delete: 'Verwijderen',

    travelerProfile: 'Reizigersprofiel',
    changeAvatar: 'Avatar wijzigen',
    femaleTab: 'Vrouwelijk',
    maleTab: 'Mannelijk',
    languageLabel: 'Taal',
    skillPointsLabel: 'Vaardigheidspunten',
    dailyTalesLimitLabel: 'Dagelijkse verhalenlimiet',
    signOut: 'Uitloggen',
    saveChanges: 'Opslaan',
    skillsProgress: 'Vaardigheidsvoortgang',
    readAloudSkillViews: 'Hardop lezen / Vaardigheidsweergaven',
    readAloudSkillViewsDesc: 'Weergaven verhoogd telkens wanneer je EEN willekeurige keuze hardop leest voor een vaardigheid in die taal',
    languagesTitle: 'Talen',
    chaptersSeen: 'Hoofdstukken bekeken',
    totalPts: 'Totaal: {pts} ptn',
    chapterUnit: 'hoofdstuk',
    chaptersUnit: 'hoofdstukken',
    activeStatus: 'Actief',
    hideAvatarChoices: 'Avataropties verbergen',
    changeAvatarChoices: 'Avatar wijzigen (8 opties)',

    textSizeReadability: 'Tekengrootte & leesbaarheid',
    standardSize: 'Standaard',
    largeSize: 'Groot',
    xlargeSize: 'Extra groot',
    sizeLabel: 'Grootte',
    openHub: 'Open tekengrootte & leesbaarheid',
    decreaseSize: 'Grootte verkleinen',
    increaseSize: 'Grootte vergroten',

    signIn: 'Inloggen',
    createAccount: 'Account aanmaken',
    continueWithGoogle: 'Doorgaan met Google',
    instantDemoLogins: 'Directe demo-aanmeldingen',
    orWithEmail: 'Of via e-mail',
    emailAddress: 'E-mailadres',
    password: 'Wachtwoord',
    signInToDashboard: 'Inloggen op dashboard',
    yourFullName: 'Je volledige naam',
    dateOfBirth: 'Geboortedatum',

    skill_Leader: 'Leiderschap',
    skill_Plan: 'Planning',
    skill_Win4All: 'Win4All',
    skill_Listen: 'Luisteren',
    skill_Recharge: 'Opladen',
  },
};

export function t(
  key: keyof Translations,
  lang: Language | string = 'EN',
  params?: Record<string, string | number>
): string {
  const dictionary = TRANSLATIONS[lang as Language] || TRANSLATIONS.EN;
  let text = dictionary[key] || TRANSLATIONS.EN[key] || String(key);
  if (params) {
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    });
  }
  return text;
}