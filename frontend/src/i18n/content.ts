import type { LanguageCode } from "../state/useSurveyStore";

interface LanguageContent {
  label: string;
  continueLabel: string;
  invitationHeader: string;
  invitation: string[];
  questions: {
    q1Header: string;
    q1: string;
    q1Options: { value: "yes" | "no"; label: string }[];
    q2Header: string;
    q2: string;
    q2Options: { value: "yes" | "no"; label: string }[];
    q3Header: string;
    q3Intro: string;
    q3Options: { value: string; label: string }[];
    q3Other: string;
  };
  thankYou: string;
  thankYouNewSurveyLabel: string;
  thankYouReportsLabel: string;
  selectKesbHeader: string;
  kesbLabel: string;
  nameLabel: string;
  roleLabel: string;
  kesbPlaceholder: string;
  submitLabel: string;
  reviewLabel: string;
}

export const languageMap: Record<LanguageCode, LanguageContent> = {
  de: {
    label: "Deutsch",
    continueLabel: "Weiter",
    invitationHeader: "Einführung",
    selectKesbHeader:
      "Bitte wählen Sie Ihre KESB (Gericht / Behörde) aus und geben Sie Ihren Namen sowie Ihre Funktion im Gericht / in der Behörde an.",
    kesbLabel: "KESB:",
    kesbPlaceholder: "Bitte auswählen",
    nameLabel: "Name: *",
    roleLabel: "Funktion: *",
    invitation: [
      "Sehr geehrte Damen und Herren",
      "Für Ihre Teilnahme an dieser kurzen Erhebung möchte ich mich zunächst herzlich bedanken. Mir ist bewusst, dass ich Ihre Zeit beanspruche und dass Ihr Entgegenkommen einer Teilnahme nicht selbstverständlich ist.",
      "Ich arbeite derzeit an einer juristischen Dissertation zur Thematik der Kindeswohlgewährleistung durch institutionalisierte Konfliktlösungsverfahren an der Universität Basel. Im Rahmen der Dissertation ist es mir wichtig, eine Bestandsaufnahme sämtlicher kantonaler Kindes- und Erwachsenenschutzbehörden – in allen Landesteilen – vorzunehmen.",
      "Diese Bestandsaufnahme erfolgt mit Blick auf das in der Vergangenheit in Fachkreisen viel diskutierte Thema der „angeordneten Beratung“, wozu die kantonalen Kindes- und Erwachsenenschutzbehörden (KESB) entweder bereits tradiert eine eigene Verfahrensweise entwickelt haben oder seit geraumer Zeit neue „Modellprojekte“ bzw. ähnliche Verfahrensweisen initiiert haben.",
      "Mein Anliegen war, den diesbezüglichen Fragenkatalog auf ein Minimum zu reduzieren. Dies war eine Gratwanderung zwischen der für meine Arbeit notwendigen Detailschärfe und dem Ihnen, als KESB, im Arbeitsalltag aller Vermutung nach nur beschränkt zur Verfügung stehenden Zeitkontingent.",
      "Ich wäre Ihnen, nach alledem, überaus dankbar, wenn Sie mir – in aller (vorgesehenen) Kürze – aus Ihrer Praxis berichten könnten.",
      "Für Zwecke meiner Dissertation geht es bei dieser Erhebung nur um die Frage, ob – und wenn ja – wie Sie mit dem Instrument der „angeordneten Beratung“ (oder ähnlichen Instrumenten) im Rahmen des geltenden Art. 307 ZGB derzeit verfahren.",
      "Die seit langer Zeit in Fachkreisen geführten Diskussionen um eine Fortentwicklung des Instituts sowie die nunmehr durch den Bundesrat angeregte und für eine Vernehmlassung vorgesehene Novellierung des Familienverfahrensrechts mit Blick auf die Stärkung der Kinderbelange sind – ausdrücklich – nicht Gegenstand dieser Erhebung.",
      "In der Hoffnung auf Ihre Teilnahme bedanke ich mich bereits jetzt sehr herzlich. Bei allfälligen Rückfragen können Sie mich entweder unter meiner E-Mail-Adresse jonas.schuette@unibas.ch oder unter meiner Telefonnummer +41 76 450 65 50 erreichen.",
      "Ich verbleibe mit freundlichen Grüssen",
      "Jonas Schütte",
    ],
    questions: {
      q1Header:
        "Ordnen Sie derzeit auf Basis des geltenden Art. 307 ZGB eine «angeordnete Beratung» an?",
      q1: "Ordnen Sie derzeit auf Basis des geltenden Art. 307 ZGB eine «angeordnete Beratung» an?",
      q1Options: [
        { value: "yes", label: "Ja" },
        { value: "no", label: "Nein" },
      ],
      q2Header:
        "Gehen Sie – aus einer rein subjektiven Perspektive und unter Einbezug Ihrer Erfahrungen aus der Vergangenheit – eher davon aus, dass eine solche Beratung zu einer Lösung der kindesbezogenen Konflikte führen kann, oder eher nicht?",
      q2:
        "Gehen Sie – aus einer rein subjektiven Perspektive und unter Einbezug Ihrer Erfahrungen aus der Vergangenheit – eher davon aus, dass eine solche Beratung zu einer Lösung der kindesbezogenen Konflikte führen kann, oder eher nicht?",
      q2Options: [
        {
          value: "yes",
          label:
            "Ja, eine solche „angeordnete Beratung“ führt nach meiner Einschätzung eher zu einer Lösung der kindesbezogenen Konflikte.",
        },
        {
          value: "no",
          label:
            "Nein, eine solche „angeordnete Beratung“ führt nach meiner Einschätzung eher nicht zu einer Lösung der kindesbezogenen Konflikte.",
        },
      ],
      q3Header:
        "Weshalb erfolgt seitens Ihres Gerichts / Ihrer Behörde derzeit keine Anordnung einer «angeordneten Beratung» auf Basis des geltenden Art. 307 ZGB?",
      q3Intro:
        "Weshalb erfolgt seitens Ihres Gerichts / Ihrer Behörde derzeit keine Anordnung einer «angeordneten Beratung» auf Basis des geltenden Art. 307 ZGB?",
      q3Options: [
        {
          value: "hopeless",
          label: "Eine solche Anordnung ist – aus meiner subjektiven Perspektive – in der Regel aussichtlos.",
        },
        {
          value: "costs",
          label:
            "Eine solche Anordnung ist – aus meiner subjektiven Perspektive – in der Regel nicht aussichtslos, aber die Kosten für eine solche Beratung werden entweder vom Kanton prima facie nicht getragen oder die Einbringung der Verfahrenskosten seitens der Parteien ist von vorneherein aussichtslos.",
        },
        { value: "no_comment", label: "Ich möchte hierzu keine Angaben tätigen." },
      ],
      q3Other:
        "Die Anordnung einer «angeordneten Beratung» auf Basis des geltenden Art. 307 ZGB kann aus folgenden Gründen nicht erfolgen: *",
    },
    thankYou: "Herzlichen Dank für Ihre Teilnahme!",
    thankYouNewSurveyLabel: "Neue Erhebung starten",
    thankYouReportsLabel: "Auswertungen ansehen",
    submitLabel: "Antworten einreichen",
    reviewLabel: "Antworten überprüfen",
  },
  fr: {
    label: "Français",
    continueLabel: "Continuer",
    invitationHeader: "Introduction",
    selectKesbHeader:
      "Veuillez sélectionner votre APEA (tribunal / autorité) et indiquer votre nom ainsi que votre fonction au sein du tribunal / de l'autorité.",
    kesbLabel: "APEA :",
    kesbPlaceholder: "Veuillez sélectionner",
    nameLabel: "Nom : *",
    roleLabel: "Fonction : *",
    invitation: [
      "Chers responsables administratifs, Mesdames et Messieurs,",
      "Je tiens tout d'abord à vous remercier chaleureusement de votre participation à cette brève enquête. Je suis conscient que je vous demande de consacrer du temps à cette tâche et que votre participation ne va pas de soi.",
      "Je travaille actuellement à une thèse de doctorat en droit sur le thème de la garantie du bien-être des enfants par des procédures institutionnalisées de résolution des conflits à l'Université de Bâle. Dans le cadre de cette thèse, il est important pour moi de dresser un inventaire de toutes les autorités cantonales de protection de l'enfant et de l'adulte, dans toutes les régions du pays.",
      "Cet inventaire est réalisé dans le contexte du thème très discuté dans les milieux spécialisés de la « consultation ordonnée », pour lequel les autorités cantonales de protection de l'enfance et de l'adulte (APEA) ont soit déjà développé leur propre procédure traditionnelle, soit lancé depuis un certain temps de nouveaux « projets modèles » ou des procédures similaires.",
      "Mon objectif était de réduire au minimum le questionnaire à ce sujet. Il s'agissait là d'un exercice délicat, entre la précision nécessaire à mon travail et le temps dont vous disposez probablement de manière limitée, en tant qu'APEA, dans votre travail quotidien.",
      "Au vu de tout cela, je vous serais extrêmement reconnaissant de bien vouloir me faire part, de manière concise (comme prévu), de votre expérience pratique.",
      "Aux fins de ma thèse, cette enquête porte uniquement sur la question de savoir si – et, le cas échéant, comment – vous utilisez l'instrument de la « consultation ordonnée » (ou des instruments similaires) dans le cadre de l'art. 307 du Code civil suisse (CC).",
      "La discussion qui anime depuis longtemps les milieux spécialisés au sujet de l'évolution de cette institution, ainsi que la révision du droit de la procédure familiale proposée par le Conseil fédéral et soumise à consultation en vue de renforcer la protection des enfants, ne font explicitement pas l'objet de cette enquête.",
      "Dans l'espoir de votre participation, je vous remercie d'avance très sincèrement. Pour toute question, vous pouvez me contacter soit à mon adresse e-mail jonas.schuette@unibas.ch, soit à mon numéro de téléphone +41 76 450 65 50.",
      "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
      "Jonas Schütte",
    ],
    questions: {
      q1Header: "Ordonnez-vous actuellement une «consultation ordonnée» sur la base de l'art. 307 CC en vigueur ?",
      q1: "Ordonnez-vous actuellement une «consultation ordonnée» sur la base de l'art. 307 CC en vigueur ?",
      q1Options: [
        { value: "yes", label: "Oui" },
        { value: "no", label: "Non" },
      ],
      q2Header:
        "D'un point de vue purement subjectif et en vous basant sur votre expérience passée, pensez-vous plutôt qu'une telle consultation peut mener à une résolution des conflits liés aux enfants, ou plutôt pas ?",
      q2: "D'un point de vue purement subjectif et en vous basant sur votre expérience passée, pensez-vous plutôt qu'une telle consultation peut mener à une résolution des conflits liés aux enfants, ou plutôt pas ?",
      q2Options: [
        {
          value: "yes",
          label:
            "Oui, selon moi, une telle «consultation ordonnée» est plutôt susceptible de résoudre les conflits liés aux enfants.",
        },
        {
          value: "no",
          label:
            "Non, selon moi, une telle «consultation ordonnée» n'est plutôt pas susceptible de résoudre les conflits liés aux enfants.",
        },
      ],
      q3Header:
        "Pourquoi votre tribunal / votre autorité n'ordonne-t-il/elle pas actuellement une «consultation ordonnée» sur la base de l'art. 307 CC en vigueur ?",
      q3Intro:
        "Pourquoi votre tribunal / votre autorité n'ordonne-t-il/elle pas actuellement une «consultation ordonnée» sur la base de l'art. 307 CC en vigueur ?",
      q3Options: [
        {
          value: "hopeless",
          label: "Une telle disposition est, de mon point de vue subjectif, généralement vouée à l'échec.",
        },
        {
          value: "costs",
          label:
            "Une telle décision n'est généralement pas sans espoir, de mon point de vue subjectif, mais les frais d'une telle consultation ne sont soit pas pris en charge par le canton à première vue, soit le recouvrement des frais de procédure par les parties est d'emblée voué à l'échec.",
        },
        { value: "no_comment", label: "Je ne souhaite pas donner d'informations à ce sujet." },
      ],
      q3Other:
        "La décision d'une «consultation ordonnée» sur la base de l'art. 307 CC en vigueur ne peut être prise pour les raisons suivantes: *",
    },
    thankYou: "Merci beaucoup pour votre participation !",
    thankYouNewSurveyLabel: "Commencer une nouvelle enquête",
    thankYouReportsLabel: "Consulter les rapports",
    submitLabel: "Soumettre les réponses",
    reviewLabel: "Vérifier les réponses",
  },
  it: {
    label: "Italiano",
    continueLabel: "Continua",
    invitationHeader: "Introduzione",
    selectKesbHeader:
      "Selezionate il vostro KESB (tribunale / autorità) e indicate il vostro nome e la vostra funzione all'interno del tribunale / dell'autorità.",
    kesbLabel: "APMA:",
    kesbPlaceholder: "Selezionate",
    nameLabel: "Nome: *",
    roleLabel: "Funzione: *",
    invitation: [
      "Egregi responsabili, Gentili signore e signori,",
      "vorrei innanzitutto ringraziarvi sentitamente per la vostra partecipazione a questa breve indagine. Sono consapevole che vi sto rubando del tempo e che la vostra disponibilità a partecipare non è scontata.",
      "Attualmente sto lavorando a una tesi di dottorato in giurisprudenza sul tema della garanzia del benessere dei minori attraverso procedure istituzionalizzate di risoluzione dei conflitti presso l'Università di Basilea. Nell'ambito della tesi, ritengo importante effettuare un inventario di tutte le autorità cantonali di protezione dei minori e degli adulti in tutte le regioni del Paese.",
      "Questo inventario viene effettuato in considerazione del tema molto discusso in passato negli ambienti specialistici della «consulenza ordinata», per la quale le autorità cantonali di protezione dei minori e degli adulti (KESB) hanno già sviluppato una propria procedura tradizionale o hanno avviato da tempo nuovi «progetti modello» o procedure simili.",
      "Il mio obiettivo era quello di ridurre al minimo il questionario relativo a questo argomento. Si è trattato di un delicato equilibrio tra la precisione necessaria per il mio lavoro e il tempo a vostra disposizione, come KESB, che presumibilmente è limitato nella vostra routine lavorativa quotidiana.",
      "Alla luce di tutto ciò, vi sarei estremamente grato se poteste fornirmi, in modo sintetico (come previsto), informazioni sulla vostra pratica.",
      "Ai fini della mia tesi di dottorato, questa indagine verte esclusivamente sulla questione se – e, in caso affermativo, come – procediate con lo strumento della «consulenza disposta» (o strumenti simili) nell'ambito dell'art. 307 CC.",
      "La discussione in corso da tempo negli ambienti specialistici sullo sviluppo dell'istituto, così come la revisione del diritto di procedura familiare ora proposta dal Consiglio federale e prevista per una consultazione con l'obiettivo di rafforzare la tutela dei minori, non sono esplicitamente oggetto della presente indagine.",
      "Spero vivamente nella vostra partecipazione e vi ringrazio sin d'ora. Per eventuali domande potete contattarmi al mio indirizzo e-mail jonas.schuette@unibas.ch o al mio numero di telefono +41 76 450 65 50.",
      "Cordiali saluti",
      "Jonas Schütte",
    ],
    questions: {
      q1Header: "Attualmente ordina una «consulenza disposta» sulla base dell'articolo 307 CC vigente?",
      q1: "Attualmente ordina una «consulenza disposta» sulla base dell'articolo 307 CC vigente?",
      q1Options: [
        { value: "yes", label: "Sì" },
        { value: "no", label: "No" },
      ],
      q2Header:
        "Da un punto di vista puramente soggettivo e sulla base delle sue esperienze passate, ritiene che una consulenza di questo tipo possa portare a una soluzione dei conflitti relativi ai figli o piuttosto no?",
      q2:
        "Da un punto di vista puramente soggettivo e sulla base delle sue esperienze passate, ritiene che una consulenza di questo tipo possa portare a una soluzione dei conflitti relativi ai figli o piuttosto no?",
      q2Options: [
        {
          value: "yes",
          label:
            "Sì, a mio avviso una «consulenza obbligatoria» di questo tipo porta piuttosto a una soluzione dei conflitti relativi ai figli.",
        },
        {
          value: "no",
          label:
            "No, a mio avviso una «consulenza obbligatoria» di questo tipo non porta piuttosto a una soluzione dei conflitti relativi ai figli.",
        },
      ],
      q3Header:
        "Perché il vostro tribunale / la vostra autorità non emette attualmente un'ordinanza di «consulenza obbligatoria» sulla base dell'articolo 307 CC vigente?",
      q3Intro:
        "Perché il vostro tribunale / la vostra autorità non emette attualmente un'ordinanza di «consulenza obbligatoria» sulla base dell'articolo 307 CC vigente?",
      q3Options: [
        {
          value: "hopeless",
          label: "A mio parere, una disposizione di questo tipo è solitamente inutile.",
        },
        {
          value: "costs",
          label:
            "A mio avviso, una richiesta di questo tipo non è solitamente destinata al fallimento, ma i costi di tale consulenza non vengono sostenuti dal Cantone prima facie oppure il contributo alle spese processuali da parte delle parti è destinato al fallimento sin dall'inizio.",
        },
        { value: "no_comment", label: "Non desidero fornire alcuna informazione al riguardo." },
      ],
      q3Other:
        "L'ordinanza di una «consulenza disposta» sulla base dell'articolo 307 del Codice civile svizzero (CC) non può essere emessa per i seguenti motivi: *",
    },
    thankYou: "Grazie mille per la vostra partecipazione!",
    thankYouNewSurveyLabel: "Avviare una nuova rilevazione",
    thankYouReportsLabel: "Visualizzare le valutazioni",
    submitLabel: "Invia le risposte",
    reviewLabel: "Rivedi le risposte",
  },
};

export const headers = {
  landingTitle: "Sprachauswahl / Sélection de la langue / Selezione della lingua",
  languages: [
    { path: "/survey/de", label: "Deutsch" },
    { path: "/survey/fr", label: "Français" },
    { path: "/survey/it", label: "Italiano" },
  ],
};

