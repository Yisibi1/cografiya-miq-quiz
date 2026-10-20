export const FRAMEWORK_SECTIONS = [
  {
    id: '1',
    num: '1. COĞRAFİ MƏKAN',
    officialQuestions: 10,
    officialPoints: 20,
    desc: 'Coğrafi kəşflər, məkanın miqyası, kartoqrafik təsvirlər, CİS, Kainat və Yerin hərəkətləri'
  },
  {
    id: '2',
    num: '2. TƏBİƏT',
    officialQuestions: 15,
    officialPoints: 30,
    desc: 'Litosfer, Atmosfer, Hidrosfer, Biosfer və Azərbaycanın fiziki coğrafiyası'
  },
  {
    id: '3',
    num: '3. CƏMİYYƏT',
    officialQuestions: 15,
    officialPoints: 30,
    desc: 'Dünya ölkələri, demoqrafiya, dünya və Azərbaycan iqtisadiyyatı, qlobal problemlər, Türk dünyası'
  }
];

export const TOPICS_CATALOG = [
  // =========================================================================
  // 1. COĞRAFİ MƏKAN (10 SUAL = 20 BAL)
  // =========================================================================
  {
    id: '1.1',
    sectionId: '1',
    sectionNum: 'MƏZMUN SAHƏSİ 1 • 10 SUAL (20 BAL)',
    sectionTitle: 'COĞRAFİ MƏKAN',
    topicCode: 'Mövzu 1.1',
    title: 'Coğrafi kəşflər və tədqiqatlar, coğrafiya elminin inkişafı',
    subtitle: 'Tam Konspekt (8 Fəsil) + Səsli İzah + 65 Yaddaş Kartı + 340 Test Sualı',
    description:
      'Coğrafi kəşflər və tədqiqatlar. Azərbaycanda coğrafiya elminin inkişafı. Coğrafiya elminin sahələri və müasir coğrafi biliklərin əldə edilməsi (6–11-ci sinif dərslikləri və metodik vəsaitlər əsasında).',
    questionCount: 340,
    flashcardCount: 65,
    grades: '6, 7, 8, 9, 10, 11-ci siniflər',
    active: true
  },
  {
    id: '1.2',
    sectionId: '1',
    sectionNum: 'MƏZMUN SAHƏSİ 1 • 10 SUAL (20 BAL)',
    sectionTitle: 'COĞRAFİ MƏKAN',
    topicCode: 'Mövzu 1.2',
    title: 'Məkan və Məkanın Miqyası',
    subtitle: 'Məkan anlayışı, üfüqün cəhətləri, azimut, məsafə və miqyas hesablamaları',
    description: 'Məkan. Məkanın miqyası. Ədədi, izahlı və xətti miqyas, sahə və məsafə məsələləri.',
    questionCount: 0,
    grades: '6, 7, 8-ci siniflər',
    active: false,
    badge: 'Növbəti mərhələdə'
  },
  {
    id: '1.3',
    sectionId: '1',
    sectionNum: 'MƏZMUN SAHƏSİ 1 • 10 SUAL (20 BAL)',
    sectionTitle: 'COĞRAFİ MƏKAN',
    topicCode: 'Mövzu 1.3',
    title: 'Kartoqrafik Təsvirlər: Plan, Xəritə, Qlobus, Yerin Forması və CİS',
    subtitle: 'Horizontallar, dərəcə toru, kartoqrafik proyeksiyalar, təhriflər və CİS',
    description: 'Plan. Xəritə. Qlobus. Yerin forması və ölçüləri. Coğrafi İnformasiya Sistemləri (CİS).',
    questionCount: 0,
    grades: '6, 7, 8, 10, 11-ci siniflər',
    active: false,
    badge: 'Növbəti mərhələdə'
  },
  {
    id: '1.4',
    sectionId: '1',
    sectionNum: 'MƏZMUN SAHƏSİ 1 • 10 SUAL (20 BAL)',
    sectionTitle: 'COĞRAFİ MƏKAN',
    topicCode: 'Mövzu 1.4',
    title: 'Kainat və Günəş Sistemi, Yerin Hərəkətləri',
    subtitle: 'Günəşin düşmə bucağı, saat qurşaqları, yerli vaxt və işıqlanma qurşaqları',
    description:
      'Kainatın yaranması və inkişafı. Günəş sistemi. Yer maqnetizmi. Yerin sutkalıq, illik hərəkətləri və onların coğrafi nəticələri.',
    questionCount: 0,
    grades: '6, 7, 8, 10, 11-ci siniflər',
    active: false,
    badge: 'Növbəti mərhələdə'
  },

  // =========================================================================
  // 2. TƏBİƏT (15 SUAL = 30 BAL)
  // =========================================================================
  {
    id: '2.1',
    sectionId: '2',
    sectionNum: 'MƏZMUN SAHƏSİ 2 • 15 SUAL (30 BAL)',
    sectionTitle: 'TƏBİƏT',
    topicCode: 'Mövzu 2.1',
    title: 'Litosfer',
    subtitle: 'Geoxronologiya, süxurlar, tektonika, relyef və Azərbaycanın geologiyası',
    description:
      'Yerin inkişaf mərhələləri. Yerin daxili quruluşu və süxurlar. Tektonik proseslər. Relyef. Azərbaycanın geoloji və geomorfoloji quruluşu, mineral ehtiyatları.',
    questionCount: 0,
    grades: '6, 7, 8, 9, 10, 11-ci siniflər',
    active: false,
    badge: 'Növbəti mərhələdə'
  },
  {
    id: '2.2',
    sectionId: '2',
    sectionNum: 'MƏZMUN SAHƏSİ 2 • 15 SUAL (30 BAL)',
    sectionTitle: 'TƏBİƏT',
    topicCode: 'Mövzu 2.2',
    title: 'Atmosfer',
    subtitle: 'Radiasiya, temperatur, təzyiq, küləklər, rütubət, iqlim və Azərbaycanın iqlimi',
    description:
      'Atmosferin tərkibi və quruluşu. Günəş radiasiyası və havanın temperaturu. Atmosfer təzyiqi, küləklər. Atmosferdə su. İqlim. Qlobal iqlim dəyişmələri. Azərbaycanın iqlimi.',
    questionCount: 0,
    grades: '6, 7, 8, 9, 10, 11-ci siniflər',
    active: false,
    badge: 'Növbəti mərhələdə'
  },
  {
    id: '2.3',
    sectionId: '2',
    sectionNum: 'MƏZMUN SAHƏSİ 2 • 15 SUAL (30 BAL)',
    sectionTitle: 'TƏBİƏT',
    topicCode: 'Mövzu 2.3',
    title: 'Hidrosfer',
    subtitle: 'Dünya okeanı, cərəyanlar, quru suları, Azərbaycanın daxili suları və Xəzər',
    description:
      'Yer kürəsində suyun mənşəyi. Dünya okeanı və onun hissələri, fiziki, kimyəvi və dinamik proseslər. Quru suları. Azərbaycanın daxili suları. Xəzər dənizi.',
    questionCount: 0,
    grades: '6, 7, 8, 9, 10, 11-ci siniflər',
    active: false,
    badge: 'Növbəti mərhələdə'
  },
  {
    id: '2.4',
    sectionId: '2',
    sectionNum: 'MƏZMUN SAHƏSİ 2 • 15 SUAL (30 BAL)',
    sectionTitle: 'TƏBİƏT',
    topicCode: 'Mövzu 2.4',
    title: 'Biosfer',
    subtitle: 'Coğrafi təbəqə, torpaq, təbii zonalar, Azərbaycanın landşaft və fiziki-coğrafi rayonlaşması',
    description:
      'Biosferin yaranması. Coğrafi təbəqə. Torpaq. Təbii kompleks, təbii zona və landşaftlar. Azərbaycanın torpaq örtüyü, biomüxtəlifliyi, təbiətin mühafizəsi və fiziki-coğrafi rayonlaşdırılması.',
    questionCount: 0,
    grades: '6, 7, 8, 9, 10, 11-ci siniflər',
    active: false,
    badge: 'Növbəti mərhələdə'
  },

  // =========================================================================
  // 3. CƏMİYYƏT (15 SUAL = 30 BAL)
  // =========================================================================
  {
    id: '3.1',
    sectionId: '3',
    sectionNum: 'MƏZMUN SAHƏSİ 3 • 15 SUAL (30 BAL)',
    sectionTitle: 'CƏMİYYƏT',
    topicCode: 'Mövzu 3.1',
    title: 'Dünya Ölkələri',
    subtitle: 'Siyasi xəritə, təsnifat, beynəlxalq təşkilatlar, Azərbaycanın İCM və inzibati quruluşu',
    description:
      'Dünyanın siyasi xəritəsi. Dövlətlərin geosiyasi mövqeyi. Dünya ölkələrinin təsnifatı. Beynəlxalq təşkilatlar. Sivilizasiyalar. Azərbaycanın iqtisadi-coğrafi mövqeyi, inzibati ərazi quruluşu.',
    questionCount: 0,
    grades: '7, 8, 9, 10, 11-ci siniflər',
    active: false,
    badge: 'Növbəti mərhələdə'
  },
  {
    id: '3.2',
    sectionId: '3',
    sectionNum: 'MƏZMUN SAHƏSİ 3 • 15 SUAL (30 BAL)',
    sectionTitle: 'CƏMİYYƏT',
    topicCode: 'Mövzu 3.2',
    title: 'Dünya Əhalisi və Dünyanın Demoqrafik Mənzərəsi',
    subtitle: 'Təbii artım, miqrasiya, urbanizasiya, əhali təsnifatı və Azərbaycanın əhalisi',
    description:
      'Dünya əhalisinin inkişaf dinamikası. Dünya əhalisinin təsnifatı. Azərbaycanın əhalisi.',
    questionCount: 0,
    grades: '7, 8, 9, 10, 11-ci siniflər',
    active: false,
    badge: 'Növbəti mərhələdə'
  },
  {
    id: '3.3',
    sectionId: '3',
    sectionNum: 'MƏZMUN SAHƏSİ 3 • 15 SUAL (30 BAL)',
    sectionTitle: 'CƏMİYYƏT',
    topicCode: 'Mövzu 3.3',
    title: 'Dünyanın İqtisadi və Sosial Mənzərəsi',
    subtitle: 'Resurslar, sənaye, k/t, nəqliyyat, Azərbaycanın iqtisadi rayonları və Qarabağ',
    description:
      'Təbii resurslar. Hasilat və emaledici sənaye, kənd təsərrüfatı, nəqliyyat, turizm. Azərbaycanın iqtisadi coğrafiyası, iqtisadi rayonlaşdırılması, Qarabağ müharibəsinin coğrafi nəticələri.',
    questionCount: 0,
    grades: '8, 9, 10, 11-ci siniflər',
    active: false,
    badge: 'Növbəti mərhələdə'
  },
  {
    id: '3.4',
    sectionId: '3',
    sectionNum: 'MƏZMUN SAHƏSİ 3 • 15 SUAL (30 BAL)',
    sectionTitle: 'CƏMİYYƏT',
    topicCode: 'Mövzu 3.4',
    title: 'Qlobal Problemlər və Onların Həlli Yolları',
    subtitle: 'Ekoloji, demoqrafik, ərzaq, enerji problemləri və dayanıqlı inkişaf',
    description: 'Qlobal problemlər və onların həlli yolları.',
    questionCount: 0,
    grades: '9, 10, 11-ci siniflər',
    active: false,
    badge: 'Növbəti mərhələdə'
  },
  {
    id: '3.5',
    sectionId: '3',
    sectionNum: 'MƏZMUN SAHƏSİ 3 • 15 SUAL (30 BAL)',
    sectionTitle: 'CƏMİYYƏT',
    topicCode: 'Mövzu 3.5',
    title: 'Türk Xalqları',
    subtitle: 'Türk dövlətləri və qurumları, fiziki, iqtisadi və sosial hadisələr',
    description:
      'Türk dövlətləri və qurumları. Türk xalqlarının yaşadıqları ərazilərdə baş verən fiziki, iqtisadi, sosial hadisələr və onların coğrafi nəticələri.',
    questionCount: 0,
    grades: '6–11-ci siniflər',
    active: false,
    badge: 'Növbəti mərhələdə'
  }
];
