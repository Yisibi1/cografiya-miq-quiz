import React, { useState, useEffect, useMemo } from 'react';
import { QUIZ_QUESTIONS } from './data/quizQuestions';
import { TOPICS_CATALOG } from './data/topicsData';
import { teacherQuizzesTopic1 } from './data/teacherQuizzes';

const ALL_TEACHER_QUESTIONS = teacherQuizzesTopic1.flatMap((qGroup) => qGroup.questions);

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const VARIANTS_META = [
  {
    code: 'A',
    name: 'Variant A',
    subtitle: 'Baza və Tarixi Kəşflər (Suallar 1–20)',
    description: 'İmago Mundi, Eratosfen, Ptolemey, Merkator xəritələri, Magellan, Humboldt, Biruni, Kaşğari, Piri Rəis, Tusi, Bakuvi, Platon fiqurları, Ştanger, Silometr, Kartoqram, Anamorfoz və CİS aeroport layihələndirməsi.',
    stripClass: 'strip-a',
    pillClass: 'pill-a',
    qRange: '1 – 20'
  },
  {
    code: 'B',
    name: 'Variant B',
    subtitle: 'Alimlər, Xəritələr və Şəhərsalma (Suallar 21–40)',
    description: 'Aristotel Ay tutulması, Strabon 17 cildlik, Leyf Eriksson Vinland, Kolumb və passatlar, Vasko da Qama, Ameriqo Vespuççi 1507, Avstraliyanın kəşfi (Yanson, Tasman, Kuk), Dejnyov, Xarəzmi, Qobustan qayıqları və Heyerdal, Aktau «Dərbəndnamə», Şirvani, Bakıxanov, Zərdabi, Mirzəzadə ilk 18 dərslik, Sovet akademikləri, Ağalı Ağıllı kənd.',
    stripClass: 'strip-b',
    pillClass: 'pill-b',
    qRange: '21 – 40'
  },
  {
    code: 'C',
    name: 'Variant C',
    subtitle: 'Çöl Cihazları, QMS və Tədqiqat Metodları (Suallar 41–60)',
    description: 'Radiozond 35 km, Külək torbası knot, Plüviometr vs Anemometr, Nivelir vs Eklimetr, QMS 20200 km 6 orbit və 4-cü peyk atom saatı, Düzbucaqlı koordinatlar (6233 / 625333), Rotterdam, Sinqapur, Hörmüz boğazı, Balans metodu, Analoji və Kontrast müqayisə, Riyazi-statistik və aerokosmik metodlar, Çöl tədqiqatının 5 mərhələsi və formaları.',
    stripClass: 'strip-c',
    pillClass: 'pill-c',
    qRange: '41 – 60'
  },
  {
    code: 'D',
    name: 'Variant D',
    subtitle: 'MİQ Tələləri, Modelləşdirmə və CİS (Suallar 61–80)',
    description: 'Platonun Kubu Torpaqla və Dodekaedri Kainatla eyniləşdirməsi, Coğrafiyanın fərqi və tamlığı, Mussonun fiziki zənciri, Rekultivasiya coğrafiyası, Kosmik geomorfologiya, Tibbi coğrafiya, Telluri və modelləşdirmənin 3 növü, Kartoqrafik təhlilin 3 metodu və prinsipləri, Relyef profilində horizontallar, Worldmapper anamorfozu, Rocer Tomlinson, Digitayzer/Plotter, Overlay analizi, VR Niderland, Yanğınların peyk CİS monitorinqi.',
    stripClass: 'strip-d',
    pillClass: 'pill-d',
    qRange: '61 – 80'
  }
];

export default function App() {
  // Topic selection: null = Catalog; '1.1' = Mövzu 1.1
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  // Active tab in Hub: 'textbook' (80 Qs) | 'teacher' (165 Google Forms Qs)
  const [hubTab, setHubTab] = useState('textbook');
  // Variant selection: null = Variant Selection Screen;
  // Textbook: 'A' | 'B' | 'C' | 'D' | 'ALL' | 'MEGA'
  // Teacher Google Forms: 'GF-1' | 'GF-2' | 'GF-3' | 'GF-4' | 'GF-ALL' | 'GF-MEGA'
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mode, setMode] = useState('study'); // 'study' | 'exam' | 'analytics'
  const [questions, setQuestions] = useState(QUIZ_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('miq_user_answers_1_1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [showExplanation, setShowExplanation] = useState({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [showQuestionDrawer, setShowQuestionDrawer] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  const isTeacherVariant = selectedVariant && selectedVariant.startsWith('GF-');

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('miq_user_answers_1_1', JSON.stringify(userAnswers));
    } catch (e) {
      console.error(e);
    }
  }, [userAnswers]);

  // Exam timer
  useEffect(() => {
    let timer = null;
    if (selectedTopicId && selectedVariant && mode === 'exam' && !examSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setExamSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [selectedTopicId, selectedVariant, mode, examSubmitted, timeLeft]);

  const currentQ = questions[currentIndex];

  const getBaseListForVariant = (varCode) => {
    if (!varCode) return QUIZ_QUESTIONS;
    if (varCode === 'ALL') return QUIZ_QUESTIONS;
    if (varCode === 'GF-ALL') return ALL_TEACHER_QUESTIONS;
    if (varCode.startsWith('GF-')) {
      const found = teacherQuizzesTopic1.find((tq) => tq.shortCode === varCode);
      return found ? found.questions : ALL_TEACHER_QUESTIONS;
    }
    return QUIZ_QUESTIONS.filter((q) => q.variant === varCode);
  };

  const handleSelectVariant = (varCode, requestedMode = 'study') => {
    setSelectedVariant(varCode);
    setMode(requestedMode);
    setCurrentIndex(0);
    setExamSubmitted(false);
    setActiveCategoryFilter('all');
    setShowExplanation({});

    if (varCode.startsWith('GF-')) {
      setHubTab('teacher');
    } else {
      setHubTab('textbook');
    }

    if (varCode === 'ALL') {
      setQuestions(QUIZ_QUESTIONS);
      setTimeLeft(100 * 60);
    } else if (varCode === 'MEGA') {
      const qA = shuffleArray(QUIZ_QUESTIONS.filter((q) => q.variant === 'A')).slice(0, 5);
      const qB = shuffleArray(QUIZ_QUESTIONS.filter((q) => q.variant === 'B')).slice(0, 5);
      const qC = shuffleArray(QUIZ_QUESTIONS.filter((q) => q.variant === 'C')).slice(0, 5);
      const qD = shuffleArray(QUIZ_QUESTIONS.filter((q) => q.variant === 'D')).slice(0, 5);
      const mega = shuffleArray([...qA, ...qB, ...qC, ...qD]);
      setQuestions(mega);
      setTimeLeft(25 * 60);
      setMode('exam');
    } else if (varCode === 'GF-ALL') {
      setQuestions(ALL_TEACHER_QUESTIONS);
      setTimeLeft(180 * 60);
    } else if (varCode === 'GF-MEGA') {
      const mixed = shuffleArray(ALL_TEACHER_QUESTIONS).slice(0, 25);
      setQuestions(mixed);
      setTimeLeft(30 * 60);
      setMode('exam');
    } else if (varCode.startsWith('GF-')) {
      const found = teacherQuizzesTopic1.find((tq) => tq.shortCode === varCode);
      const list = found ? found.questions : ALL_TEACHER_QUESTIONS;
      setQuestions(list);
      setTimeLeft(Math.max(30, list.length) * 60);
    } else {
      const varQs = QUIZ_QUESTIONS.filter((q) => q.variant === varCode);
      setQuestions(varQs);
      setTimeLeft(25 * 60);
    }
  };

  const handleSelectOption = (qId, optionLetter) => {
    if (mode === 'exam' && examSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionLetter }));
    if (mode === 'study') {
      setShowExplanation((prev) => ({ ...prev, [qId]: true }));
    }
  };

  const handleShuffle = () => {
    const baseList = getBaseListForVariant(selectedVariant);
    const shuffled = shuffleArray(baseList);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setShowExplanation({});
    setExamSubmitted(false);
    setTimeLeft(25 * 60);
    setActiveCategoryFilter('all');
  };

  const handleReset = () => {
    if (window.confirm('Mövzu 1.1 üzrə bütün cavablarınızı və statistikanızı sıfırlamaq istəyirsiniz?')) {
      setUserAnswers({});
      setShowExplanation({});
      setExamSubmitted(false);
      setTimeLeft(25 * 60);
      setCurrentIndex(0);
      setQuestions(getBaseListForVariant(selectedVariant));
      setActiveCategoryFilter('all');
      localStorage.removeItem('miq_user_answers_1_1');
    }
  };

  const handleRetestWrong = () => {
    const sourceList = getBaseListForVariant(selectedVariant);
    const wrongQs = sourceList.filter((q) => userAnswers[q.id] && userAnswers[q.id] !== q.correct);
    if (wrongQs.length === 0) return;
    setQuestions(wrongQs);
    setCurrentIndex(0);
    setExamSubmitted(false);
    setMode('study');
    setTimeLeft(25 * 60);
  };

  const handleFilterByCategory = (categoryName) => {
    const filtered = QUIZ_QUESTIONS.filter((q) => q.category === categoryName);
    setQuestions(filtered);
    setCurrentIndex(0);
    setMode('study');
    setActiveCategoryFilter(categoryName);
  };

  const handleResetFilter = () => {
    setQuestions(getBaseListForVariant(selectedVariant));
    setCurrentIndex(0);
    setActiveCategoryFilter('all');
  };

  // Exam stats for current question list
  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (!ans) {
        unanswered++;
      } else if (ans === q.correct) {
        correct++;
      } else {
        wrong++;
      }
    });
    const percentage = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    return { correct, wrong, unanswered, percentage };
  }, [questions, userAnswers]);

  // Topic 1.1 Category Analytics across all 80 textbook questions
  const categoryAnalytics = useMemo(() => {
    const catMap = {};
    QUIZ_QUESTIONS.forEach((q) => {
      if (!catMap[q.category]) {
        catMap[q.category] = {
          name: q.category,
          total: 0,
          answered: 0,
          correct: 0,
          wrong: 0,
          remedyBooks: new Set(),
        };
      }
      catMap[q.category].total += 1;
      const ans = userAnswers[q.id];
      if (ans) {
        catMap[q.category].answered += 1;
        if (ans === q.correct) {
          catMap[q.category].correct += 1;
        } else {
          catMap[q.category].wrong += 1;
          if (q.remedyBook) catMap[q.category].remedyBooks.add(q.remedyBook);
        }
      }
    });

    return Object.values(catMap).map((cat) => {
      const pct = cat.answered > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
      let status = 'not_started';
      let statusLabel = 'İşlənməyib';
      if (cat.answered > 0) {
        if (pct >= 80) {
          status = 'mastered';
          statusLabel = 'Mükəmməl Mənimsənilib';
        } else if (pct >= 50) {
          status = 'moderate';
          statusLabel = 'Orta — Təkrar Lazımdır';
        } else {
          status = 'weak';
          statusLabel = 'Təhlükəli Zəif Nöqtə!';
        }
      }
      return {
        ...cat,
        percentage: pct,
        status,
        statusLabel,
        remedyList: Array.from(cat.remedyBooks),
      };
    });
  }, [userAnswers]);

  const weakCategories = useMemo(() => {
    return categoryAnalytics.filter((c) => c.answered > 0 && c.percentage < 60);
  }, [categoryAnalytics]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Textbook Variant stats (A, B, C, D)
  const variantStats = useMemo(() => {
    const res = {};
    ['A', 'B', 'C', 'D'].forEach((v) => {
      const vQs = QUIZ_QUESTIONS.filter((q) => q.variant === v);
      const ansCount = vQs.filter((q) => userAnswers[q.id]).length;
      const corCount = vQs.filter((q) => userAnswers[q.id] === q.correct).length;
      const pct = ansCount > 0 ? Math.round((corCount / 20) * 100) : 0;
      res[v] = { answered: ansCount, correct: corCount, pct };
    });
    return res;
  }, [userAnswers]);

  // Teacher Google Forms stats (GF-1, GF-2, GF-3, GF-4)
  const teacherStats = useMemo(() => {
    const res = {};
    teacherQuizzesTopic1.forEach((tq) => {
      const ansCount = tq.questions.filter((q) => userAnswers[q.id]).length;
      const corCount = tq.questions.filter((q) => userAnswers[q.id] === q.correct).length;
      const pct = ansCount > 0 ? Math.round((corCount / tq.questionCount) * 100) : 0;
      res[tq.shortCode] = { answered: ansCount, correct: corCount, pct, total: tq.questionCount };
    });
    return res;
  }, [userAnswers]);

  // Overall Textbook 1.1 progress (80 Qs)
  const totalAnsweredCount = QUIZ_QUESTIONS.filter((q) => userAnswers[q.id]).length;
  const totalCorrectCount = QUIZ_QUESTIONS.filter((q) => userAnswers[q.id] === q.correct).length;
  const totalAccuracyPct = totalAnsweredCount > 0 ? Math.round((totalCorrectCount / QUIZ_QUESTIONS.length) * 100) : 0;

  // Overall Teacher 1.1 progress (165 Qs)
  const teacherAnsweredCount = ALL_TEACHER_QUESTIONS.filter((q) => userAnswers[q.id]).length;
  const teacherCorrectCount = ALL_TEACHER_QUESTIONS.filter((q) => userAnswers[q.id] === q.correct).length;
  const teacherAccuracyPct = teacherAnsweredCount > 0 ? Math.round((teacherCorrectCount / ALL_TEACHER_QUESTIONS.length) * 100) : 0;

  const getHeaderSubtitle = () => {
    if (!selectedTopicId) return 'MİQ Coğrafiya Mövzu Portalı';
    if (selectedVariant === null) return 'Mövzu 1.1: Coğrafi Kəşflər və Tədqiqatlar';
    if (selectedVariant === 'ALL') return 'Mövzu 1.1 • Dərslik Bazası (Bütün 80 Sual)';
    if (selectedVariant === 'MEGA') return 'Mövzu 1.1 • Dərslik Mega Sınaq (20 Sual)';
    if (selectedVariant === 'GF-ALL') return 'Mövzu 1.1 • Müəllim Bazası (Bütün 165 Sual)';
    if (selectedVariant === 'GF-MEGA') return 'Mövzu 1.1 • Qarışıq Müəllim Sınağı (25 Sual)';
    if (selectedVariant.startsWith('GF-')) {
      const found = teacherQuizzesTopic1.find((tq) => tq.shortCode === selectedVariant);
      return found ? `Müəllim Sınağı • ${found.title}` : `Müəllim Sınağı • ${selectedVariant}`;
    }
    return `Mövzu 1.1 • Variant ${selectedVariant}`;
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="main-header">
        <div className="header-inner">
          <div className="brand-block">
            {selectedTopicId ? (
              <button
                className="btn-back-catalog"
                onClick={() => {
                  if (selectedVariant !== null) {
                    setSelectedVariant(null);
                  } else {
                    setSelectedTopicId(null);
                  }
                }}
              >
                {selectedVariant !== null ? '← Sınaq və Variant Seçiminə Qayıt' : '← Mövzu Seçiminə Qayıt'}
              </button>
            ) : (
              <span className="badge-academic">MİQ Coğrafiya • Tədris Portalı</span>
            )}
            <h1 className="header-title">{getHeaderSubtitle()}</h1>
            <p className="author-tag">
              Müəllif: <strong>Yusif Vahabzadə</strong> • 6–11-ci Sinif Dərslik Bazası (80 Sual) + Müəllim Google Forms Bazası (165 Sual)
            </p>
          </div>

          {selectedTopicId && (
            <div className="header-actions">
              <div className="mode-toggle">
                <button
                  className={`mode-btn ${mode === 'study' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('study');
                    setExamSubmitted(false);
                    if (selectedVariant === null) {
                      handleSelectVariant(hubTab === 'teacher' ? 'GF-1' : 'A', 'study');
                    }
                  }}
                >
                  Təlim
                </button>
                <button
                  className={`mode-btn ${mode === 'exam' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('exam');
                    setExamSubmitted(false);
                    if (selectedVariant === null) {
                      handleSelectVariant(hubTab === 'teacher' ? 'GF-1' : 'A', 'exam');
                    }
                  }}
                >
                  Sınaq
                </button>
                <button
                  className={`mode-btn ${mode === 'analytics' ? 'active' : ''}`}
                  onClick={() => setMode('analytics')}
                >
                  Diaqnostika {weakCategories.length > 0 ? `(${weakCategories.length})` : ''}
                </button>
              </div>

              {mode === 'exam' && selectedVariant && !examSubmitted && (
                <div className={`timer-box ${timeLeft < 300 ? 'timer-urgent' : ''}`}>
                  <span className="timer-label">Qalan Vaxt:</span>
                  <span className="timer-val">{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedTopicId && selectedVariant && (
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${(questions.filter((q) => userAnswers[q.id]).length / questions.length) * 100}%`,
              }}
            />
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="content-wrap">
        {/* ======================================================== */}
        {/* SCREEN 1: TOPIC SELECTION / CATALOG                      */}
        {/* ======================================================== */}
        {!selectedTopicId ? (
          <div className="catalog-screen">
            <div className="catalog-hero">
              <span className="badge-pill">MİQ Qiymətləndirmə Çərçivəsi</span>
              <h2 className="catalog-main-title">İşləmək İstədiyiniz Mövzunu Seçin</h2>
              <p className="catalog-subtitle">
                Hər mövzu üzrə həm bizim dərslik əsaslı 80 suallıq 4 Variant bazamız, həm də ayrıca bölmədə
                Müəllimin Google Forms sınaqları (şəkilli xəritə və sxem sualları ilə birlikdə) yerləşdirilmişdir.
              </p>
            </div>

            {/* Catalog Grid */}
            <div className="catalog-grid">
              {TOPICS_CATALOG.map((top) => (
                <div
                  key={top.id}
                  className={`topic-card ${top.active ? 'topic-card-active' : 'topic-card-disabled'}`}
                >
                  <div className="topic-card-header">
                    <div className="topic-meta-left">
                      <span className="topic-sec-num">{top.sectionNum}: {top.sectionTitle}</span>
                      <span className="topic-code-badge">{top.topicCode}</span>
                    </div>
                    {top.active ? (
                      <span className="topic-status-pill status-ready">Hazır • 80 Dərslik + 165 Müəllim Sualı</span>
                    ) : (
                      <span className="topic-status-pill status-soon">{top.badge || 'Tezliklə'}</span>
                    )}
                  </div>

                  <h3 className="topic-title">{top.title}</h3>
                  <p className="topic-desc">{top.description}</p>
                  <div className="topic-grades">Mənbə: {top.grades}</div>

                  {/* If topic 1.1 has answers */}
                  {top.id === '1.1' && (
                    <>
                      <div className="variant-chips-row">
                        <div className="v-chip">
                          <span className="v-chip-label">Dərslik (A-D)</span>
                          <span className="v-chip-val">{totalAnsweredCount}/80</span>
                        </div>
                        <div className="v-chip">
                          <span className="v-chip-label">Sınaq 1 (Dərs)</span>
                          <span className="v-chip-val">{teacherStats['GF-1'].answered}/50</span>
                        </div>
                        <div className="v-chip">
                          <span className="v-chip-label">I Hissə</span>
                          <span className="v-chip-val">{teacherStats['GF-2'].answered}/43</span>
                        </div>
                        <div className="v-chip">
                          <span className="v-chip-label">II–III Hissə</span>
                          <span className="v-chip-val">{teacherStats['GF-3'].answered + teacherStats['GF-4'].answered}/72</span>
                        </div>
                      </div>

                      {(totalAnsweredCount > 0 || teacherAnsweredCount > 0) && (
                        <div className="topic-user-progress">
                          <div className="progress-label-row">
                            <span>Cəmi İşlənən: <strong>{totalAnsweredCount + teacherAnsweredCount} / 245</strong> sual</span>
                            <span className="progress-pct-bold">
                              Dərslik: {totalAccuracyPct}% • Müəllim: {teacherAccuracyPct}%
                            </span>
                          </div>
                          <div className="progress-mini-bar">
                            <div
                              className="progress-mini-fill"
                              style={{ width: `${((totalAnsweredCount + teacherAnsweredCount) / 245) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Actions */}
                  <div className="topic-actions">
                    {top.active ? (
                      <>
                        <button
                          className="btn-topic-primary"
                          onClick={() => {
                            setSelectedTopicId(top.id);
                            setHubTab('textbook');
                            setSelectedVariant(null);
                          }}
                        >
                          Əsas Baza (80 Sual) →
                        </button>
                        <button
                          className="btn-topic-teacher"
                          onClick={() => {
                            setSelectedTopicId(top.id);
                            setHubTab('teacher');
                            setSelectedVariant(null);
                          }}
                        >
                          Müəllim Sınaqları (165 Sual) →
                        </button>
                      </>
                    ) : (
                      <button className="btn-topic-disabled" disabled>
                        Mövzu Hazırlanır (Tezliklə)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : mode === 'analytics' ? (
          /* ======================================================== */
          /* SCREEN: DIAGNOSTIC ANALYTICS VIEW                        */
          /* ======================================================== */
          <div className="analytics-card">
            <div className="analytics-hero">
              <span className="badge-pill">Fərdi MİQ Diaqnostika Mərkəzi</span>
              <h2 className="analytics-title">Mövzu 1.1 üzrə Biliklərinizin Dəqiq Xəritəsi</h2>
              <p className="analytics-desc">
                Sistem dərslik bazasındakı 80 testin və Müəllimin 165 Google Forms sualının nəticələrini təhlil edərək
                MİQ imtahanında ən çox hansı hissədən bal itirmə təhlükənizin olduğunu göstərir.
              </p>
            </div>

            <div className="analytics-summary-grid">
              <div className="summary-box">
                <span className="summary-val">{totalAnsweredCount} / 80</span>
                <span className="summary-lbl">Əsas Dərslik Bazası</span>
              </div>
              <div className="summary-box">
                <span className="summary-val">{teacherAnsweredCount} / 165</span>
                <span className="summary-lbl">Müəllim Sınaqları (GF)</span>
              </div>
              <div className="summary-box">
                <span className="summary-val text-emerald">
                  {totalCorrectCount + teacherCorrectCount}
                </span>
                <span className="summary-lbl">Cəmi Düzgün Cavab</span>
              </div>
              <div className="summary-box">
                <span className="summary-val text-primary">
                  {weakCategories.length}
                </span>
                <span className="summary-lbl">Zəif Alt-mövzu</span>
              </div>
            </div>

            {weakCategories.length > 0 ? (
              <div className="alert-box alert-warning">
                <div className="alert-header">
                  <strong>DİQQƏT: {weakCategories.length} mövzuda təhlükəli zəiflik aşkar edildi!</strong>
                </div>
                <p>MİQ imtahanında maksimum bal yığmaq üçün aşağıdakı dərslik səhifələrini mütləq təkrar oxuyun:</p>
                <ul className="remedy-bullets">
                  {weakCategories.map((wc) => (
                    <li key={wc.name}>
                      <strong>{wc.name} ({wc.percentage}%):</strong>
                      <div className="remedy-tags">
                        {wc.remedyList.length > 0 ? (
                          wc.remedyList.map((r, idx) => (
                            <span key={idx} className="remedy-pill">Kitab: {r}</span>
                          ))
                        ) : (
                          <span className="remedy-pill">Bu mövzudan olan sualları təkrar işləyin</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : totalAnsweredCount >= 20 ? (
              <div className="alert-box alert-success">
                <strong>ƏLA NƏTİCƏ!</strong> Mövzular üzrə nəticələriniz yüksəkdir. Zəif boşluq qalmayıb.
              </div>
            ) : (
              <div className="alert-box alert-info">
                Analizin tam dəqiq olması üçün ən azı 20 sualı cavablandırmağınız tövsiyə olunur.
              </div>
            )}

            <h3 className="section-subtitle">Alt-mövzular üzrə İncəliklərinə Qədər Analiz</h3>
            <div className="category-list">
              {categoryAnalytics.map((cat) => (
                <div key={cat.name} className={`cat-card cat-status-${cat.status}`}>
                  <div className="cat-header">
                    <div>
                      <h4 className="cat-title">{cat.name}</h4>
                      <span className="cat-meta">
                        {cat.total} sual • {cat.answered} işlənilib ({cat.correct} düz, {cat.wrong} səhv)
                      </span>
                    </div>
                    <div className="cat-score-badge">
                      <span className="cat-pct">{cat.percentage}%</span>
                      <span className="cat-badge-lbl">{cat.statusLabel}</span>
                    </div>
                  </div>

                  <div className="cat-bar-bg">
                    <div
                      className={`cat-bar-fill fill-${cat.status}`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>

                  {cat.remedyList.length > 0 && (
                    <div className="cat-prescription">
                      <span className="presc-label">Tövsiyə edilən dərslik:</span>
                      {cat.remedyList.map((bk, i) => (
                        <span key={i} className="presc-book">{bk}</span>
                      ))}
                    </div>
                  )}

                  <div className="cat-actions">
                    <button
                      className="btn-drill"
                      onClick={() => handleFilterByCategory(cat.name)}
                    >
                      Bu Alt-mövzunu Təkrar Məşq Et ({cat.total} Sual) →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="analytics-footer-actions">
              <button
                className="btn-primary"
                onClick={() => {
                  setMode('study');
                  if (selectedVariant === null) {
                    handleSelectVariant(hubTab === 'teacher' ? 'GF-1' : 'A', 'study');
                  }
                }}
              >
                Testləri İşləməyə Qayıt
              </button>
              <button className="btn-secondary" onClick={handleReset}>
                Statistikanı Sıfırla
              </button>
            </div>
          </div>
        ) : selectedVariant === null ? (
          /* ======================================================== */
          /* SCREEN 2: VARIANT & TEACHER QUIZ SELECTION HUB           */
          /* ======================================================== */
          <div className="variant-hub-screen">
            {/* Base Switcher Tabs */}
            <div className="hub-base-tabs">
              <button
                className={`hub-tab-btn ${hubTab === 'textbook' ? 'active' : ''}`}
                onClick={() => setHubTab('textbook')}
              >
                <span className="hub-tab-title">Əsas Dərslik Bazası (Bizim Suallar)</span>
                <span className="hub-tab-sub">4 Variant • 80 Sual ({totalAnsweredCount}/80 işlənilib)</span>
              </button>
              <button
                className={`hub-tab-btn hub-tab-teacher ${hubTab === 'teacher' ? 'active' : ''}`}
                onClick={() => setHubTab('teacher')}
              >
                <span className="hub-tab-title">Müəllim Sınaqları (Google Forms)</span>
                <span className="hub-tab-sub">4 Sınaq • 165 Sual • 35 Şəkil ({teacherAnsweredCount}/165 işlənilib)</span>
              </button>
            </div>

            {hubTab === 'textbook' ? (
              <>
                <div className="variant-hub-header">
                  <span className="badge-pill">Mövzu 1.1 • Əsas Dərslik Bazası • 80 Sual</span>
                  <h2 className="variant-hub-title">Dərslik və Metodik Vəsait Variantları (A, B, C, D)</h2>
                  <p className="variant-hub-desc">
                    Hər biri 20 sualdan ibarət 4 müstəqil variant və ya 80 suallıq tam baza ilə 6–11-ci sinif dərsliklərinin bütün incəliklərini mənimsəyin.
                  </p>
                </div>

                {/* Overall Progress Card */}
                <div className="variant-overall-progress">
                  <div className="variant-overall-row">
                    <span>Əsas Dərslik Bazası üzrə Mənimsəmə:</span>
                    <span className="variant-overall-stats">
                      {totalAnsweredCount} / 80 sual işlənilib ({totalAccuracyPct}% Düzgün)
                    </span>
                  </div>
                  <div className="progress-mini-bar">
                    <div
                      className="progress-mini-fill"
                      style={{ width: `${(totalAnsweredCount / 80) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Mega Exam & Full Base Card */}
                <div className="mega-variant-card">
                  <div className="mega-info">
                    <span className="mega-badge">Qarışıq Mega Sınaq</span>
                    <h3 className="mega-title">Bütün Mövzudan Qarışıq Sınaq və ya Tam Baza</h3>
                    <p className="mega-desc">
                      İmtahan formatında 4 variantın hər birindən 5 sual seçilərək 20 suallıq real vaxt sınağı (25 dəqiqə),
                      və ya 80 sualın hamısını ardıcıl öyrənmək üçün Tam Tədris Rejimi.
                    </p>
                  </div>
                  <div className="mega-actions">
                    <button
                      className="btn-mega-exam"
                      onClick={() => handleSelectVariant('MEGA', 'exam')}
                    >
                      Mega Sınaq (20 Sual • 25 Dəq)
                    </button>
                    <button
                      className="btn-mega-all"
                      onClick={() => handleSelectVariant('ALL', 'study')}
                    >
                      Bütün 80 Sualı İşlə
                    </button>
                  </div>
                </div>

                {/* 4 Variant Cards Grid */}
                <div className="variants-grid">
                  {VARIANTS_META.map((vm) => {
                    const curStats = variantStats[vm.code];
                    return (
                      <div key={vm.code} className="variant-card">
                        <div className={`variant-card-strip ${vm.stripClass}`} />
                        <div>
                          <div className="variant-top-row">
                            <span className={`variant-badge-pill ${vm.pillClass}`}>{vm.name}</span>
                            <span className="variant-q-count">20 Sual • Q {vm.qRange}</span>
                          </div>
                          <h3 className="variant-title">{vm.subtitle}</h3>
                          <p className="variant-summary-text">{vm.description}</p>
                        </div>

                        <div>
                          <div className="variant-card-progress">
                            <div className="variant-progress-info">
                              <span>İrəliləyiş: <strong>{curStats.answered} / 20</strong></span>
                              <span>Düzgün: <strong>{curStats.correct}</strong> ({curStats.pct}%)</span>
                            </div>
                            <div className="progress-mini-bar">
                              <div
                                className="progress-mini-fill"
                                style={{ width: `${(curStats.answered / 20) * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="variant-actions">
                            <button
                              className="btn-variant-study"
                              onClick={() => handleSelectVariant(vm.code, 'study')}
                            >
                              Təlim Rejimi →
                            </button>
                            <button
                              className="btn-variant-exam"
                              onClick={() => handleSelectVariant(vm.code, 'exam')}
                            >
                              Sınaq (25 Dəq)
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* TEACHER GOOGLE FORMS TAB */
              <>
                <div className="variant-hub-header">
                  <span className="badge-pill badge-pill-teacher">Müəllim Sınaqları • Google Forms Bazası • 165 Sual</span>
                  <h2 className="variant-hub-title">Mövzu 1.1 üzrə Müəllimin 4 Google Forms Sınağı</h2>
                  <p className="variant-hub-desc">
                    WhatsApp dərs qrupunda paylaşılan 4 Google Forms sınağının bütün 165 sualı, 35 xəritə/sxem/cədvəl təsviri,
                    düzgün cavab açarları və müəllimin dərs qeydlərinə əsaslanan ətraflı izahları.
                  </p>
                </div>

                {/* Overall Progress Card for Teacher Quizzes */}
                <div className="variant-overall-progress">
                  <div className="variant-overall-row">
                    <span>Müəllim Sınaqları üzrə Mənimsəmə:</span>
                    <span className="variant-overall-stats">
                      {teacherAnsweredCount} / 165 sual işlənilib ({teacherAccuracyPct}% Düzgün)
                    </span>
                  </div>
                  <div className="progress-mini-bar">
                    <div
                      className="progress-mini-fill"
                      style={{ width: `${(teacherAnsweredCount / 165) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Teacher Mega Card */}
                <div className="mega-variant-card mega-teacher-card">
                  <div className="mega-info">
                    <span className="mega-badge">Google Forms Tam Baza</span>
                    <h3 className="mega-title">4 Google Forms Sınağının Hamısı (165 Sual) və ya Qarışıq Sınaq</h3>
                    <p className="mega-desc">
                      Müəllimin Mövzu 1.1 üzrə tərtib etdiyi bütün 165 sualı ardıcıl təlim rejimində işləyin və ya təsadüfi seçilmiş
                      25 suallıq vaxtlı sınaq imtahanında özünüzü yoxlayın.
                    </p>
                  </div>
                  <div className="mega-actions">
                    <button
                      className="btn-mega-exam"
                      onClick={() => handleSelectVariant('GF-MEGA', 'exam')}
                    >
                      Qarışıq Sınaq (25 Sual • 30 Dəq)
                    </button>
                    <button
                      className="btn-mega-all"
                      onClick={() => handleSelectVariant('GF-ALL', 'study')}
                    >
                      Bütün 165 Sualı İşlə
                    </button>
                  </div>
                </div>

                {/* 4 Google Forms Cards Grid */}
                <div className="variants-grid">
                  {teacherQuizzesTopic1.map((tq, idx) => {
                    const curStats = teacherStats[tq.shortCode];
                    const stripClasses = ['strip-a', 'strip-b', 'strip-c', 'strip-d'];
                    const pillClasses = ['pill-a', 'pill-b', 'pill-c', 'pill-d'];
                    return (
                      <div key={tq.id} className="variant-card">
                        <div className={`variant-card-strip ${stripClasses[idx % 4]}`} />
                        <div>
                          <div className="variant-top-row">
                            <span className={`variant-badge-pill ${pillClasses[idx % 4]}`}>{tq.badge}</span>
                            <span className="variant-q-count">{tq.questionCount} Sual • {tq.imageCount} Şəkilli</span>
                          </div>
                          <h3 className="variant-title">{tq.title}</h3>
                          <p className="variant-summary-text">{tq.subtitle}</p>
                        </div>

                        <div>
                          <div className="variant-card-progress">
                            <div className="variant-progress-info">
                              <span>İrəliləyiş: <strong>{curStats.answered} / {tq.questionCount}</strong></span>
                              <span>Düzgün: <strong>{curStats.correct}</strong> ({curStats.pct}%)</span>
                            </div>
                            <div className="progress-mini-bar">
                              <div
                                className="progress-mini-fill"
                                style={{ width: `${(curStats.answered / tq.questionCount) * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="variant-actions">
                            <button
                              className="btn-variant-study"
                              onClick={() => handleSelectVariant(tq.shortCode, 'study')}
                            >
                              Təlim Rejimi →
                            </button>
                            <button
                              className="btn-variant-exam"
                              onClick={() => handleSelectVariant(tq.shortCode, 'exam')}
                            >
                              Sınaq Rejimi
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* SCREEN 3: ACTIVE QUIZ VIEW                               */
          /* ======================================================== */
          <>
            {/* Quick Variant Switcher Bar */}
            <div className="quiz-variant-bar">
              {!isTeacherVariant ? (
                <>
                  <span className="quiz-variant-label">Dərslik Bazası:</span>
                  {['A', 'B', 'C', 'D'].map((v) => (
                    <button
                      key={v}
                      className={`btn-variant-pill ${selectedVariant === v ? 'active' : ''}`}
                      onClick={() => handleSelectVariant(v, mode)}
                    >
                      Variant {v} ({variantStats[v].answered}/20)
                    </button>
                  ))}
                  <button
                    className={`btn-variant-pill ${selectedVariant === 'ALL' ? 'active' : ''}`}
                    onClick={() => handleSelectVariant('ALL', mode)}
                  >
                    Bütün 80 Sual
                  </button>
                  <button
                    className="btn-variant-pill btn-switch-base"
                    onClick={() => handleSelectVariant('GF-1', 'study')}
                  >
                    Müəllim Sınaqlarına Keç (165) →
                  </button>
                </>
              ) : (
                <>
                  <span className="quiz-variant-label">Müəllim Sınaqları:</span>
                  {teacherQuizzesTopic1.map((tq) => (
                    <button
                      key={tq.shortCode}
                      className={`btn-variant-pill ${selectedVariant === tq.shortCode ? 'active' : ''}`}
                      onClick={() => handleSelectVariant(tq.shortCode, mode)}
                    >
                      {tq.shortCode} ({teacherStats[tq.shortCode].answered}/{tq.questionCount})
                    </button>
                  ))}
                  <button
                    className={`btn-variant-pill ${selectedVariant === 'GF-ALL' ? 'active' : ''}`}
                    onClick={() => handleSelectVariant('GF-ALL', mode)}
                  >
                    Bütün 165 Sual
                  </button>
                  <button
                    className="btn-variant-pill btn-switch-base"
                    onClick={() => handleSelectVariant('A', 'study')}
                  >
                    ← Əsas Dərslik Bazasına Keç (80)
                  </button>
                </>
              )}
            </div>

            {/* Category Filter Banner if active */}
            {activeCategoryFilter !== 'all' && (
              <div className="filter-active-banner">
                <span>Fokus Rejimi: <strong>{activeCategoryFilter}</strong> ({questions.length} sual)</span>
                <button className="btn-filter-reset" onClick={handleResetFilter}>
                  Bütün Suallara Qayıt
                </button>
              </div>
            )}

            {/* Quiz Control Strip */}
            <div className="control-strip">
              <div className="q-nav-status">
                <span>Sual <strong>{currentIndex + 1}</strong> / {questions.length}</span>
                <span className="status-dot">•</span>
                <span>Cavablanan: {questions.filter((q) => userAnswers[q.id]).length}</span>
              </div>

              <div className="action-buttons">
                <button
                  className="btn-secondary"
                  onClick={() => setShowQuestionDrawer(!showQuestionDrawer)}
                >
                  Suallar Siyahısı
                </button>
                <button className="btn-secondary" onClick={handleShuffle}>
                  Qarışdır
                </button>
                <button className="btn-secondary" onClick={handleReset}>
                  Sıfırla
                </button>
              </div>
            </div>

            {/* Drawer */}
            {showQuestionDrawer && (
              <div className="drawer-card">
                <div className="drawer-header">
                  <span>Cari Testlər üzrə Naviqasiya:</span>
                  <button className="btn-close" onClick={() => setShowQuestionDrawer(false)}>✕</button>
                </div>
                <div className="q-grid">
                  {questions.map((q, idx) => {
                    const ans = userAnswers[q.id];
                    let statusClass = 'unanswered';
                    if (ans) {
                      if (mode === 'study' || examSubmitted) {
                        statusClass = ans === q.correct ? 'correct' : 'wrong';
                      } else {
                        statusClass = 'answered';
                      }
                    }
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        key={q.id}
                        className={`q-grid-btn ${statusClass} ${isCurrent ? 'current' : ''}`}
                        onClick={() => {
                          setCurrentIndex(idx);
                          setShowQuestionDrawer(false);
                        }}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Exam Results Card */}
            {mode === 'exam' && examSubmitted ? (
              <div className="results-card">
                <div className="results-header">
                  <span className="results-pill">Sınaq Nəticəsi</span>
                  <h2 className="results-score">{stats.percentage}%</h2>
                  <p className="results-subtitle">
                    {questions.length} testdən <strong>{stats.correct}</strong> düzgün cavab topladınız.
                  </p>
                </div>

                <div className="stats-row">
                  <div className="stat-box stat-correct">
                    <span className="stat-num">{stats.correct}</span>
                    <span className="stat-lbl">Düzgün</span>
                  </div>
                  <div className="stat-box stat-wrong">
                    <span className="stat-num">{stats.wrong}</span>
                    <span className="stat-lbl">Səhv</span>
                  </div>
                  <div className="stat-box stat-empty">
                    <span className="stat-num">{stats.unanswered}</span>
                    <span className="stat-lbl">Boş</span>
                  </div>
                </div>

                <div className="exam-diagnostic-banner">
                  <span className="diag-heading">Diaqnostik İpucu:</span>
                  <p>
                    {stats.wrong > 0
                      ? `${stats.wrong} səhviniz qeydə alındı. Səhv etdiyiniz sualları təkrar işləyə və ya izahlarına baxa bilərsiniz.`
                      : 'Mükəmməl nəticə! Bütün suallara tam doğru cavab verdiniz!'}
                  </p>
                </div>

                <div className="results-actions">
                  {stats.wrong > 0 && (
                    <button className="btn-primary" onClick={handleRetestWrong}>
                      Yalnız Səhvləri Təkrar İşlə ({stats.wrong})
                    </button>
                  )}
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setExamSubmitted(false);
                      setCurrentIndex(0);
                      setMode('study');
                    }}
                  >
                    İzahları Addım-addım Oxu
                  </button>
                  <button className="btn-secondary" onClick={() => setSelectedVariant(null)}>
                    Digər Sınaq / Varianta Keç
                  </button>
                </div>
              </div>
            ) : (
              currentQ && (
                <div className="question-card">
                  <div className="q-meta-row">
                    <div className="q-meta-left">
                      <span className="q-badge">
                        {isTeacherVariant ? `Google Forms • ${currentQ.variant}` : `MİQ Çərçivəsi • Var ${currentQ.variant}`}
                      </span>
                      <span className="q-category-tag">{currentQ.category}</span>
                    </div>
                    <span className="q-index-tag">Sual #{currentIndex + 1} / {questions.length}</span>
                  </div>

                  <h2 className="question-text" style={{ whiteSpace: 'pre-line' }}>
                    {currentQ.question}
                  </h2>

                  {currentQ.image && (
                    <div className="q-image-container">
                      <img
                        src={currentQ.image}
                        alt={`Sual ${currentIndex + 1} sxemi`}
                        className="q-attached-image"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="options-list">
                    {currentQ.options.map((opt) => {
                      const letter = opt.substring(0, 1);
                      const isSelected = userAnswers[currentQ.id] === letter;
                      const isCorrect = letter === currentQ.correct;

                      let optClass = 'opt-default';
                      if (isSelected) optClass += ' opt-selected';

                      if (mode === 'study' && isSelected) {
                        optClass += isCorrect ? ' opt-correct' : ' opt-wrong';
                      } else if (mode === 'study' && userAnswers[currentQ.id] && isCorrect) {
                        optClass += ' opt-revealed-correct';
                      }

                      return (
                        <button
                          key={letter}
                          className={`option-btn ${optClass}`}
                          onClick={() => handleSelectOption(currentQ.id, letter)}
                        >
                          <span className="opt-letter">{letter}</span>
                          <span className="opt-text">{opt.substring(3)}</span>
                        </button>
                      );
                    })}
                  </div>

                  {(mode === 'study' && (showExplanation[currentQ.id] || userAnswers[currentQ.id])) && (
                    <div className={`explanation-box ${userAnswers[currentQ.id] === currentQ.correct ? 'exp-pass' : 'exp-fail'}`}>
                      <div className="exp-status-line">
                        <span className="exp-badge">
                          {userAnswers[currentQ.id] === currentQ.correct
                            ? 'Düzgün Cavab: ' + currentQ.correct
                            : 'Düzgün Cavab: ' + currentQ.correct + ' (Seçiminiz: ' + (userAnswers[currentQ.id] || 'Yoxdur') + ')'}
                        </span>
                      </div>
                      <p className="exp-body">{currentQ.explanation}</p>
                      <div className="exp-source">
                        <strong>Mənbə:</strong> {currentQ.source}
                      </div>
                      {currentQ.remedyBook && userAnswers[currentQ.id] !== currentQ.correct && (
                        <div className="exp-remedy-note">
                          <strong>MİQ İpucu:</strong> Bu sualda səhv etdinizsə, <em>{currentQ.remedyBook}</em> hissəsini dərhal təkrar oxuyun.
                        </div>
                      )}
                    </div>
                  )}

                  <div className="q-footer-nav">
                    <button
                      className="btn-nav"
                      disabled={currentIndex === 0}
                      onClick={() => {
                        setCurrentIndex((prev) => Math.max(0, prev - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      ← Əvvəlki
                    </button>

                    {mode === 'exam' && (
                      <button
                        className="btn-finish-exam"
                        onClick={() => {
                          if (window.confirm('İmtahanı bitirmək istədiyinizdən əminsiniz?')) {
                            setExamSubmitted(true);
                          }
                        }}
                      >
                        İmtahanı Bitir
                      </button>
                    )}

                    <button
                      className="btn-nav btn-nav-primary"
                      disabled={currentIndex === questions.length - 1}
                      onClick={() => {
                        setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Növbəti →
                    </button>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <p>© 2026 Yusif Vahabzadə • Coğrafiya MİQ Hazırlığı üzrə Ağıllı Analiz və Test Portalı</p>
        <p className="footer-sub">
          Mənbələr: 6–11-ci sinif Coğrafiya dərslikləri və Metodik vəsaitləri + Müəllim Google Forms Sınaq Bazası.
        </p>
      </footer>
    </div>
  );
}
