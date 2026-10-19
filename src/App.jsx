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
    subtitle: 'Baza və Tarixi Kəşflər',
    qCount: 20
  },
  {
    code: 'B',
    name: 'Variant B',
    subtitle: 'Alimlər, Xəritələr və Şəhərsalma',
    qCount: 20
  },
  {
    code: 'C',
    name: 'Variant C',
    subtitle: 'Çöl Cihazları, QMS və Metodlar',
    qCount: 20
  },
  {
    code: 'D',
    name: 'Variant D',
    subtitle: 'Modelləşdirmə, Anamorfoz və CİS',
    qCount: 20
  }
];

export default function App() {
  // Navigation state:
  // 1) selectedTopicId === null -> Mövzular Siyahısı
  // 2) selectedTopicId !== null && selectedVariant === null -> Sınaq / Variant Menyusu
  // 3) selectedVariant !== null -> Aktiv Test Ekranı
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [hubTab, setHubTab] = useState('textbook'); // 'textbook' | 'teacher' | 'analytics'
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mode, setMode] = useState('study'); // 'study' | 'exam'
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

  const isTeacherVariant = selectedVariant && selectedVariant.startsWith('GF-');

  useEffect(() => {
    try {
      localStorage.setItem('miq_user_answers_1_1', JSON.stringify(userAnswers));
    } catch (e) {
      console.error(e);
    }
  }, [userAnswers]);

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
    setShowExplanation({});
    setShowQuestionDrawer(false);

    if (varCode === 'ALL') {
      setQuestions(QUIZ_QUESTIONS);
      setTimeLeft(100 * 60);
    } else if (varCode === 'MEGA') {
      const qA = shuffleArray(QUIZ_QUESTIONS.filter((q) => q.variant === 'A')).slice(0, 5);
      const qB = shuffleArray(QUIZ_QUESTIONS.filter((q) => q.variant === 'B')).slice(0, 5);
      const qC = shuffleArray(QUIZ_QUESTIONS.filter((q) => q.variant === 'C')).slice(0, 5);
      const qD = shuffleArray(QUIZ_QUESTIONS.filter((q) => q.variant === 'D')).slice(0, 5);
      setQuestions(shuffleArray([...qA, ...qB, ...qC, ...qD]));
      setTimeLeft(25 * 60);
    } else if (varCode === 'GF-ALL') {
      setQuestions(ALL_TEACHER_QUESTIONS);
      setTimeLeft(180 * 60);
    } else if (varCode === 'GF-MEGA') {
      setQuestions(shuffleArray(ALL_TEACHER_QUESTIONS).slice(0, 25));
      setTimeLeft(30 * 60);
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
    setQuestions(shuffleArray(baseList));
    setCurrentIndex(0);
    setShowExplanation({});
    setExamSubmitted(false);
  };

  const handleResetCurrent = () => {
    if (window.confirm('Cari sınaqdakı cavablarınızı sıfırlamaq istəyirsiniz?')) {
      const currentIds = new Set(questions.map((q) => q.id));
      setUserAnswers((prev) => {
        const next = { ...prev };
        currentIds.forEach((id) => delete next[id]);
        return next;
      });
      setShowExplanation({});
      setExamSubmitted(false);
      setCurrentIndex(0);
    }
  };

  const handleRetestWrong = () => {
    const wrongQs = questions.filter((q) => userAnswers[q.id] && userAnswers[q.id] !== q.correct);
    if (wrongQs.length === 0) return;
    setQuestions(wrongQs);
    setCurrentIndex(0);
    setExamSubmitted(false);
    setMode('study');
  };

  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (!ans) unanswered++;
      else if (ans === q.correct) correct++;
      else wrong++;
    });
    const percentage = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    return { correct, wrong, unanswered, percentage };
  }, [questions, userAnswers]);

  const variantStats = useMemo(() => {
    const res = {};
    ['A', 'B', 'C', 'D'].forEach((v) => {
      const vQs = QUIZ_QUESTIONS.filter((q) => q.variant === v);
      const ansCount = vQs.filter((q) => userAnswers[q.id]).length;
      const corCount = vQs.filter((q) => userAnswers[q.id] === q.correct).length;
      res[v] = { answered: ansCount, correct: corCount };
    });
    return res;
  }, [userAnswers]);

  const teacherStats = useMemo(() => {
    const res = {};
    teacherQuizzesTopic1.forEach((tq) => {
      const ansCount = tq.questions.filter((q) => userAnswers[q.id]).length;
      const corCount = tq.questions.filter((q) => userAnswers[q.id] === q.correct).length;
      res[tq.shortCode] = { answered: ansCount, correct: corCount, total: tq.questionCount };
    });
    return res;
  }, [userAnswers]);

  const categoryAnalytics = useMemo(() => {
    const catMap = {};
    QUIZ_QUESTIONS.forEach((q) => {
      if (!catMap[q.category]) {
        catMap[q.category] = { name: q.category, total: 0, answered: 0, correct: 0, wrong: 0, remedyBooks: new Set() };
      }
      catMap[q.category].total += 1;
      const ans = userAnswers[q.id];
      if (ans) {
        catMap[q.category].answered += 1;
        if (ans === q.correct) catMap[q.category].correct += 1;
        else {
          catMap[q.category].wrong += 1;
          if (q.remedyBook) catMap[q.category].remedyBooks.add(q.remedyBook);
        }
      }
    });
    return Object.values(catMap).map((cat) => {
      const pct = cat.answered > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
      return { ...cat, percentage: pct, remedyList: Array.from(cat.remedyBooks) };
    });
  }, [userAnswers]);

  const totalTextbookAnswered = QUIZ_QUESTIONS.filter((q) => userAnswers[q.id]).length;
  const totalTeacherAnswered = ALL_TEACHER_QUESTIONS.filter((q) => userAnswers[q.id]).length;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getActiveQuizTitle = () => {
    if (selectedVariant === 'ALL') return 'Dərslik Bazası (80 Sual)';
    if (selectedVariant === 'MEGA') return 'Dərslik Qarışıq Sınaq (20 Sual)';
    if (selectedVariant === 'GF-ALL') return 'Müəllim Bazası (165 Sual)';
    if (selectedVariant === 'GF-MEGA') return 'Müəllim Qarışıq Sınaq (25 Sual)';
    if (selectedVariant && selectedVariant.startsWith('GF-')) {
      const found = teacherQuizzesTopic1.find((tq) => tq.shortCode === selectedVariant);
      return found ? found.title : selectedVariant;
    }
    return `Variant ${selectedVariant}`;
  };

  return (
    <div className="app-container">
      {/* Minimal Header */}
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
                {selectedVariant !== null ? '← Sınaq Menyusuna Qayıt' : '← Mövzulara Qayıt'}
              </button>
            ) : (
              <span className="badge-academic">MİQ Coğrafiya Portalı • Yusif Vahabzadə</span>
            )}
            <h1 className="header-title">
              {!selectedTopicId
                ? 'Mövzu Seçimi'
                : selectedVariant === null
                ? 'Mövzu 1.1: Coğrafi Kəşflər və Tədqiqatlar'
                : getActiveQuizTitle()}
            </h1>
          </div>

          {/* Show mode switch / timer ONLY inside active quiz */}
          {selectedTopicId && selectedVariant && (
            <div className="header-actions">
              <div className="mode-toggle">
                <button
                  className={`mode-btn ${mode === 'study' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('study');
                    setExamSubmitted(false);
                  }}
                >
                  Təlim
                </button>
                <button
                  className={`mode-btn ${mode === 'exam' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('exam');
                    setExamSubmitted(false);
                  }}
                >
                  Sınaq
                </button>
              </div>

              {mode === 'exam' && !examSubmitted && (
                <div className={`timer-box ${timeLeft < 300 ? 'timer-urgent' : ''}`}>
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

      <main className="content-wrap">
        {/* ======================================================== */}
        {/* SCREEN 1: CLEAN TOPIC CATALOG                            */}
        {/* ======================================================== */}
        {!selectedTopicId ? (
          <div className="catalog-screen">
            <div className="catalog-grid">
              {TOPICS_CATALOG.map((top) => (
                <div
                  key={top.id}
                  className={`topic-card ${top.active ? 'topic-card-active' : 'topic-card-disabled'}`}
                >
                  <div className="topic-card-header">
                    <span className="topic-code-badge">{top.topicCode}</span>
                    {top.active ? (
                      <span className="topic-status-pill status-ready">Aktiv • 245 Sual</span>
                    ) : (
                      <span className="topic-status-pill status-soon">Tezliklə</span>
                    )}
                  </div>

                  <h3 className="topic-title">{top.title}</h3>
                  <p className="topic-desc">{top.sectionNum}: {top.sectionTitle}</p>

                  {top.id === '1.1' && (
                    <div className="simple-topic-stats">
                      <span>Dərslik Bazası: <strong>{totalTextbookAnswered}/80</strong></span>
                      <span>•</span>
                      <span>Müəllim Sınaqları: <strong>{totalTeacherAnswered}/165</strong></span>
                    </div>
                  )}

                  <div className="topic-actions-single">
                    {top.active ? (
                      <button
                        className="btn-topic-primary"
                        onClick={() => {
                          setSelectedTopicId(top.id);
                          setSelectedVariant(null);
                        }}
                      >
                        Mövzuya Daxil Ol →
                      </button>
                    ) : (
                      <button className="btn-topic-disabled" disabled>
                        Hazırlanır
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : selectedVariant === null ? (
          /* ======================================================== */
          /* SCREEN 2: SIMPLIFIED MENU FOR TOPIC 1.1                  */
          /* ======================================================== */
          <div className="simple-menu-screen">
            {/* Simple 3-Tab Navigation */}
            <div className="clean-tabs">
              <button
                className={`clean-tab ${hubTab === 'textbook' ? 'active' : ''}`}
                onClick={() => setHubTab('textbook')}
              >
                Dərslik Testləri (80 Sual)
              </button>
              <button
                className={`clean-tab ${hubTab === 'teacher' ? 'active' : ''}`}
                onClick={() => setHubTab('teacher')}
              >
                Müəllim Sınaqları (165 Sual)
              </button>
              <button
                className={`clean-tab ${hubTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setHubTab('analytics')}
              >
                Diaqnostika
              </button>
            </div>

            {/* TAB 1: TEXTBOOK VARIANTS (A, B, C, D) */}
            {hubTab === 'textbook' && (
              <div className="clean-list-container">
                <div className="clean-list-header">
                  <div>
                    <h2 className="clean-section-title">Əsas Dərslik Bazası (Variant A, B, C, D)</h2>
                    <p className="clean-section-sub">6–11-ci sinif dərslikləri əsasında hazırlanmış 80 sual</p>
                  </div>
                  <div className="clean-quick-actions">
                    <button className="btn-quick-outline" onClick={() => handleSelectVariant('MEGA', 'exam')}>
                      Qarışıq Sınaq (20 Sual)
                    </button>
                    <button className="btn-quick-outline" onClick={() => handleSelectVariant('ALL', 'study')}>
                      Hamısını İşlə (80 Sual)
                    </button>
                  </div>
                </div>

                <div className="clean-rows">
                  {VARIANTS_META.map((vm) => {
                    const st = variantStats[vm.code];
                    return (
                      <div key={vm.code} className="clean-row-card">
                        <div className="clean-row-main">
                          <span className="clean-row-badge">{vm.name}</span>
                          <div className="clean-row-text">
                            <h3 className="clean-row-title">{vm.subtitle}</h3>
                            <span className="clean-row-meta">
                              {vm.qCount} sual • İşlənilib: <strong>{st.answered}/{vm.qCount}</strong> (Düzgün: {st.correct})
                            </span>
                          </div>
                        </div>
                        <div className="clean-row-buttons">
                          <button
                            className="btn-row-study"
                            onClick={() => handleSelectVariant(vm.code, 'study')}
                          >
                            Təlim (İzahlı)
                          </button>
                          <button
                            className="btn-row-exam"
                            onClick={() => handleSelectVariant(vm.code, 'exam')}
                          >
                            Sınaq (Vaxtlı)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: TEACHER GOOGLE FORMS QUIZZES */}
            {hubTab === 'teacher' && (
              <div className="clean-list-container">
                <div className="clean-list-header">
                  <div>
                    <h2 className="clean-section-title">Müəllim Sınaqları (Google Forms Bazası)</h2>
                    <p className="clean-section-sub">Dərs qrupunda paylaşılan 4 sınaq • 165 sual • 35 xəritə və sxem</p>
                  </div>
                  <div className="clean-quick-actions">
                    <button className="btn-quick-outline" onClick={() => handleSelectVariant('GF-MEGA', 'exam')}>
                      Qarışıq Sınaq (25 Sual)
                    </button>
                    <button className="btn-quick-outline" onClick={() => handleSelectVariant('GF-ALL', 'study')}>
                      Hamısını İşlə (165 Sual)
                    </button>
                  </div>
                </div>

                <div className="clean-rows">
                  {teacherQuizzesTopic1.map((tq, idx) => {
                    const st = teacherStats[tq.shortCode];
                    return (
                      <div key={tq.id} className="clean-row-card">
                        <div className="clean-row-main">
                          <span className="clean-row-badge badge-teal">Sınaq {idx + 1}</span>
                          <div className="clean-row-text">
                            <h3 className="clean-row-title">{tq.title}</h3>
                            <span className="clean-row-meta">
                              {tq.questionCount} sual ({tq.imageCount} şəkilli) • İşlənilib: <strong>{st.answered}/{tq.questionCount}</strong> (Düzgün: {st.correct})
                            </span>
                          </div>
                        </div>
                        <div className="clean-row-buttons">
                          <button
                            className="btn-row-study btn-teal"
                            onClick={() => handleSelectVariant(tq.shortCode, 'study')}
                          >
                            Təlim (İzahlı)
                          </button>
                          <button
                            className="btn-row-exam"
                            onClick={() => handleSelectVariant(tq.shortCode, 'exam')}
                          >
                            Sınaq (Vaxtlı)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: SIMPLE DIAGNOSTICS */}
            {hubTab === 'analytics' && (
              <div className="clean-list-container">
                <div className="clean-list-header">
                  <div>
                    <h2 className="clean-section-title">Mövzu 1.1 üzrə Nəticə və Diaqnostika</h2>
                    <p className="clean-section-sub">
                      Dərslik bazası: {totalTextbookAnswered}/80 işlənilib • Müəllim bazası: {totalTeacherAnswered}/165 işlənilib
                    </p>
                  </div>
                </div>

                <div className="category-list">
                  {categoryAnalytics.map((cat) => (
                    <div key={cat.name} className="cat-card">
                      <div className="cat-header">
                        <div>
                          <h4 className="cat-title">{cat.name}</h4>
                          <span className="cat-meta">
                            {cat.total} sual • {cat.answered} işlənilib ({cat.correct} düz, {cat.wrong} səhv)
                          </span>
                        </div>
                        <span className="cat-pct">{cat.percentage}%</span>
                      </div>
                      <div className="cat-bar-bg">
                        <div className="cat-bar-fill fill-mastered" style={{ width: `${cat.percentage}%` }} />
                      </div>
                      {cat.remedyList.length > 0 && (
                        <div className="cat-prescription">
                          <span className="presc-label">Oxunmalı dərslik:</span>
                          {cat.remedyList.map((bk, i) => (
                            <span key={i} className="presc-book">{bk}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* SCREEN 3: CLEAN ACTIVE QUIZ VIEW                         */
          /* ======================================================== */
          <>
            {/* Compact Quiz Control Bar */}
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
                  Suallar Cədvəli
                </button>
                <button className="btn-secondary" onClick={handleShuffle}>
                  Qarışdır
                </button>
                <button className="btn-secondary" onClick={handleResetCurrent}>
                  Sıfırla
                </button>
              </div>
            </div>

            {showQuestionDrawer && (
              <div className="drawer-card">
                <div className="drawer-header">
                  <span>Suala Keçid:</span>
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
                    return (
                      <button
                        key={q.id}
                        className={`q-grid-btn ${statusClass} ${idx === currentIndex ? 'current' : ''}`}
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

            {/* Exam Results or Active Question */}
            {mode === 'exam' && examSubmitted ? (
              <div className="results-card">
                <div className="results-header">
                  <span className="results-pill">Sınaq Nəticəsi</span>
                  <h2 className="results-score">{stats.percentage}%</h2>
                  <p className="results-subtitle">
                    {questions.length} sualdan <strong>{stats.correct}</strong> düzgün cavab.
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

                <div className="results-actions">
                  {stats.wrong > 0 && (
                    <button className="btn-primary" onClick={handleRetestWrong}>
                      Səhvləri Təkrar İşlə ({stats.wrong})
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
                    İzahlara Bax
                  </button>
                  <button className="btn-secondary" onClick={() => setSelectedVariant(null)}>
                    Sınaq Menyusuna Qayıt
                  </button>
                </div>
              </div>
            ) : (
              currentQ && (
                <div className="question-card">
                  <div className="q-meta-row">
                    <span className="q-badge">
                      {isTeacherVariant ? 'Müəllim Sınağı' : `Variant ${currentQ.variant}`}
                    </span>
                    <span className="q-index-tag">Sual {currentIndex + 1} / {questions.length}</span>
                  </div>

                  <h2 className="question-text" style={{ whiteSpace: 'pre-line' }}>
                    {currentQ.question}
                  </h2>

                  {currentQ.image && (
                    <div className="q-image-container">
                      <img
                        src={currentQ.image}
                        alt={`Sual ${currentIndex + 1}`}
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
                        Bitir
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
    </div>
  );
}
