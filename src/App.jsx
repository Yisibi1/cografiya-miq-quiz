import React, { useState, useEffect, useMemo } from 'react';
import { QUIZ_QUESTIONS } from './data/quizQuestions';
import { TOPICS_CATALOG } from './data/topicsData';

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  // Topic selection: null = Topic Selection Screen (Catalog); '1.1' = Active topic
  const [selectedTopicId, setSelectedTopicId] = useState(null);
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
    if (selectedTopicId && mode === 'exam' && !examSubmitted && timeLeft > 0) {
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
  }, [selectedTopicId, mode, examSubmitted, timeLeft]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (qId, optionLetter) => {
    if (mode === 'exam' && examSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionLetter }));
    if (mode === 'study') {
      setShowExplanation((prev) => ({ ...prev, [qId]: true }));
    }
  };

  const handleShuffle = () => {
    const shuffled = shuffleArray(QUIZ_QUESTIONS);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setUserAnswers({});
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
      setQuestions(QUIZ_QUESTIONS);
      setActiveCategoryFilter('all');
      localStorage.removeItem('miq_user_answers_1_1');
    }
  };

  const handleRetestWrong = () => {
    const wrongQs = QUIZ_QUESTIONS.filter((q) => userAnswers[q.id] && userAnswers[q.id] !== q.correct);
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
    setQuestions(QUIZ_QUESTIONS);
    setCurrentIndex(0);
    setActiveCategoryFilter('all');
  };

  // Exam stats
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

  // Topic 1.1 Category Analytics
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

  // 1.1 completion percentage for catalog card
  const topic1AnsweredCount = Object.keys(userAnswers).length;
  const topic1CorrectCount = QUIZ_QUESTIONS.filter((q) => userAnswers[q.id] === q.correct).length;
  const topic1Pct = Math.round((topic1CorrectCount / QUIZ_QUESTIONS.length) * 100);

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="main-header">
        <div className="header-inner">
          <div className="brand-block">
            {selectedTopicId ? (
              <button
                className="btn-back-catalog"
                onClick={() => setSelectedTopicId(null)}
              >
                ← Mövzu Seçiminə Qayıt
              </button>
            ) : (
              <span className="badge-academic">MİQ Coğrafiya • Tədris Kataloqu</span>
            )}
            <h1 className="header-title">
              {selectedTopicId ? 'Mövzu 1.1: Coğrafi Kəşflər və Tədqiqatlar' : 'MİQ Coğrafiya Mövzu Portalı'}
            </h1>
            <p className="author-tag">
              Müəllif: <strong>Yusif Vahabzadə</strong> • 6–11-ci Sinif Dərslik və Metodik İzah Sistemi
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
                  }}
                >
                  Təlim Rejimi
                </button>
                <button
                  className={`mode-btn ${mode === 'exam' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('exam');
                    setExamSubmitted(false);
                    setQuestions(QUIZ_QUESTIONS);
                    setActiveCategoryFilter('all');
                  }}
                >
                  Sınaq Rejimi
                </button>
                <button
                  className={`mode-btn ${mode === 'analytics' ? 'active' : ''}`}
                  onClick={() => setMode('analytics')}
                >
                  Diaqnostika {weakCategories.length > 0 ? `(${weakCategories.length})` : ''}
                </button>
              </div>

              {mode === 'exam' && (
                <div className={`timer-box ${timeLeft < 300 ? 'timer-urgent' : ''}`}>
                  <span className="timer-label">Qalan Vaxt:</span>
                  <span className="timer-val">{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedTopicId && (
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${(Object.keys(userAnswers).length / QUIZ_QUESTIONS.length) * 100}%`,
              }}
            />
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="content-wrap">
        {/* ======================================================== */}
        {/* SCREEN 1: TOPIC SELECTION / CATALOG (Mövzu Seçim Ekranı) */}
        {/* ======================================================== */}
        {!selectedTopicId ? (
          <div className="catalog-screen">
            <div className="catalog-hero">
              <span className="badge-pill">MİQ Qiymətləndirmə Çərçivəsi</span>
              <h2 className="catalog-main-title">İşləmək İstədiyiniz Mövzunu Seçin</h2>
              <p className="catalog-subtitle">
                MİQ imtahanında ən yüksək nəticə əldə etmək üçün mövzuları ardıcıllıqla işləyin. Hər mövzuda
                dərsliklərin ən incə detallarını əhatə edən testlər və fərdi zəif nöqtələr diaqnostikası mövcuddur.
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
                      <span className="topic-status-pill status-ready">Hazır • {top.questionCount} Sual</span>
                    ) : (
                      <span className="topic-status-pill status-soon">{top.badge || 'Tezliklə'}</span>
                    )}
                  </div>

                  <h3 className="topic-title">{top.title}</h3>
                  <p className="topic-desc">{top.description}</p>
                  <div className="topic-grades">Mənbə: {top.grades}</div>

                  {/* If topic 1.1 has answers */}
                  {top.id === '1.1' && topic1AnsweredCount > 0 && (
                    <div className="topic-user-progress">
                      <div className="progress-label-row">
                        <span>Fəaliyyət: <strong>{topic1AnsweredCount} / 20</strong> sual işlənib</span>
                        <span className="progress-pct-bold">{topic1Pct}% Düzgün</span>
                      </div>
                      <div className="progress-mini-bar">
                        <div
                          className="progress-mini-fill"
                          style={{ width: `${(topic1AnsweredCount / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="topic-actions">
                    {top.active ? (
                      <>
                        <button
                          className="btn-topic-primary"
                          onClick={() => {
                            setSelectedTopicId(top.id);
                            setMode('study');
                            setCurrentIndex(0);
                          }}
                        >
                          Testlərə Başla ({top.questionCount} Sual) →
                        </button>
                        <button
                          className="btn-topic-secondary"
                          onClick={() => {
                            setSelectedTopicId(top.id);
                            setMode('analytics');
                          }}
                        >
                          Diaqnostik Analiz
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
        ) : (
          /* ======================================================== */
          /* SCREEN 2: ACTIVE TOPIC 1.1 (Quiz & Analytics)             */
          /* ======================================================== */
          <>
            {/* Category Filter Banner if active */}
            {activeCategoryFilter !== 'all' && (
              <div className="filter-active-banner">
                <span>Fokus Rejimi: <strong>{activeCategoryFilter}</strong> ({questions.length} sual)</span>
                <button className="btn-filter-reset" onClick={handleResetFilter}>
                  Bütün Suallara Qayıt (20)
                </button>
              </div>
            )}

            {/* DIAGNOSTIC ANALYTICS VIEW */}
            {mode === 'analytics' ? (
              <div className="analytics-card">
                <div className="analytics-hero">
                  <span className="badge-pill">Fərdi MİQ Diaqnostika Mərkəzi</span>
                  <h2 className="analytics-title">Mövzu 1.1 üzrə Biliklərinizin Dəqiq Xəritəsi</h2>
                  <p className="analytics-desc">
                    Sistem 20 testin alt-mövzularını təhlil edərək MİQ imtahanında ən çox hansı hissədən bal
                    itirmə təhlükənizin olduğunu və hansı dərslik səhifələrini oxumalı olduğunuzu müəyyən edir.
                  </p>
                </div>

                <div className="analytics-summary-grid">
                  <div className="summary-box">
                    <span className="summary-val">{Object.keys(userAnswers).length} / {QUIZ_QUESTIONS.length}</span>
                    <span className="summary-lbl">İşlənən Suallar</span>
                  </div>
                  <div className="summary-box">
                    <span className="summary-val text-emerald">
                      {QUIZ_QUESTIONS.filter((q) => userAnswers[q.id] === q.correct).length}
                    </span>
                    <span className="summary-lbl">Düzgün Cavab</span>
                  </div>
                  <div className="summary-box">
                    <span className="summary-val text-rose">
                      {QUIZ_QUESTIONS.filter((q) => userAnswers[q.id] && userAnswers[q.id] !== q.correct).length}
                    </span>
                    <span className="summary-lbl">Səhv Cavab</span>
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
                ) : Object.keys(userAnswers).length >= 10 ? (
                  <div className="alert-box alert-success">
                    <strong>ƏLA NƏTİCƏ!</strong> Mövzular üzrə nəticələriniz yüksəkdir. Zəif boşluq qalmayıb.
                  </div>
                ) : (
                  <div className="alert-box alert-info">
                    Analizin tam dəqiq olması üçün 20 sualın ən azı 10-nu cavablandırmağınız tövsiyə olunur.
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
                      setQuestions(QUIZ_QUESTIONS);
                      setActiveCategoryFilter('all');
                    }}
                  >
                    Testləri İşləməyə Qayıt
                  </button>
                  <button className="btn-secondary" onClick={handleReset}>
                    Statistikanı Sıfırla
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE QUIZ / EXAM INTERFACE */
              <>
                <div className="control-strip">
                  <div className="q-nav-status">
                    <span>Sual <strong>{currentIndex + 1}</strong> / {questions.length}</span>
                    <span className="status-dot">•</span>
                    <span>Cavablanan: {Object.keys(userAnswers).length}</span>
                  </div>

                  <div className="action-buttons">
                    <button
                      className="btn-secondary"
                      onClick={() => setShowQuestionDrawer(!showQuestionDrawer)}
                    >
                      Suallar
                    </button>
                    <button className="btn-secondary" onClick={handleShuffle}>
                      Qarışdır
                    </button>
                    <button className="btn-secondary" onClick={handleReset}>
                      Sıfırla
                    </button>
                  </div>
                </div>

                {showQuestionDrawer && (
                  <div className="drawer-card">
                    <div className="drawer-header">
                      <span>Bütün Suallar üzrə Naviqasiya:</span>
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

                {mode === 'exam' && examSubmitted ? (
                  <div className="results-card">
                    <div className="results-header">
                      <span className="results-pill">Sınaq Nəticəsi</span>
                      <h2 className="results-score">{stats.percentage}%</h2>
                      <p className="results-subtitle">
                        20 testdən <strong>{stats.correct}</strong> düzgün cavab topladınız.
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
                          ? `${stats.wrong} səhviniz qeydə alındı. Dərslik boşluqlarınızı görmək üçün «Diaqnostika» bölməsinə keçin.`
                          : 'Mükəmməl nəticə! 20-də 20 doğru cavab verdiniz!'}
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
                        onClick={() => setMode('analytics')}
                      >
                        Zəif Mövzular Analizinə Bax
                      </button>
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
                      <button className="btn-secondary" onClick={handleShuffle}>
                        Yeni İmtahana Başla
                      </button>
                    </div>
                  </div>
                ) : (
                  currentQ && (
                    <div className="question-card">
                      <div className="q-meta-row">
                        <div className="q-meta-left">
                          <span className="q-badge">MİQ Qiymətləndirmə Çərçivəsi</span>
                          <span className="q-category-tag">{currentQ.category}</span>
                        </div>
                        <span className="q-index-tag">Sual #{currentIndex + 1}</span>
                      </div>

                      <h2 className="question-text">{currentQ.question}</h2>

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
                            <strong>Rəsmi Dərslik Mənbəsi:</strong> {currentQ.source}
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
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <p>© 2026 Yusif Vahabzadə • Coğrafiya MİQ Hazırlığı üzrə Ağıllı Analiz və Test Sistemi</p>
        <p className="footer-sub">
          Mənbələr: 6, 7, 8, 9, 10 və 11-ci sinif Coğrafiya dərslikləri və Metodik vəsaitləri əsasında hazırlanmışdır.
        </p>
      </footer>
    </div>
  );
}
