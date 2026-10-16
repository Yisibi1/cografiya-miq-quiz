import React, { useState, useEffect, useMemo } from 'react';
import { QUIZ_QUESTIONS } from './data/quizQuestions';

// Utility to shuffle array
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  const [mode, setMode] = useState('study'); // 'study' | 'exam'
  const [questions, setQuestions] = useState(QUIZ_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: selectedOptLetter }
  const [showExplanation, setShowExplanation] = useState({}); // { [qId]: boolean }
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [filterWrongOnly, setFilterWrongOnly] = useState(false);
  const [showQuestionDrawer, setShowQuestionDrawer] = useState(false);

  // Timer for exam mode
  useEffect(() => {
    let timer = null;
    if (mode === 'exam' && !examSubmitted && timeLeft > 0) {
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
  }, [mode, examSubmitted, timeLeft]);

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
  };

  const handleReset = () => {
    setUserAnswers({});
    setShowExplanation({});
    setExamSubmitted(false);
    setTimeLeft(25 * 60);
    setCurrentIndex(0);
  };

  const handleRetestWrong = () => {
    const wrongQs = questions.filter((q) => userAnswers[q.id] && userAnswers[q.id] !== q.correct);
    if (wrongQs.length === 0) return;
    setQuestions(wrongQs);
    setCurrentIndex(0);
    setUserAnswers({});
    setShowExplanation({});
    setExamSubmitted(false);
    setMode('study');
    setTimeLeft(25 * 60);
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

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="main-header">
        <div className="header-inner">
          <div className="brand-block">
            <span className="badge-academic">MİQ Hazırlıq • Mövzu 1.1</span>
            <h1 className="header-title">Coğrafi Kəşflər və Tədqiqatlar</h1>
            <p className="author-tag">
              Müəllif: <strong>Yusif Vahabzadə</strong> • 20 Elmi Situasiya və Uyğunluq Testi
            </p>
          </div>

          <div className="header-actions">
            {/* Mode Switcher */}
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
                }}
              >
                Sınaq Rejimi
              </button>
            </div>

            {mode === 'exam' && (
              <div className={`timer-box ${timeLeft < 300 ? 'timer-urgent' : ''}`}>
                <span className="timer-label">Qalan Vaxt:</span>
                <span className="timer-val">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Global Progress Line */}
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{
              width: `${((Object.keys(userAnswers).length) / questions.length) * 100}%`,
            }}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="content-wrap">
        {/* Navigation Quick Bar */}
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
              Sualların Siyahısı
            </button>
            <button className="btn-secondary" onClick={handleShuffle}>
              Qarışdır
            </button>
            <button className="btn-secondary" onClick={handleReset}>
              Sıfırla
            </button>
          </div>
        </div>

        {/* Question Selector Drawer (Collapsible) */}
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

        {/* Exam Result View */}
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
              <button className="btn-secondary" onClick={handleShuffle}>
                Yeni İmtahana Başla
              </button>
            </div>
          </div>
        ) : (
          /* Active Question View */
          currentQ && (
            <div className="question-card">
              <div className="q-meta-row">
                <span className="q-badge">MİQ Qiymətləndirmə Çərçivəsi</span>
                <span className="q-index-tag">Sual #{currentIndex + 1}</span>
              </div>

              <h2 className="question-text">{currentQ.question}</h2>

              {/* Options List */}
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

              {/* Explanation Card (Study mode on answer, or button click) */}
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
                </div>
              )}

              {/* Footer Controls */}
              <div className="q-footer-nav">
                <button
                  className="btn-nav"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
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
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                >
                  Növbəti →
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <p>© 2026 Yusif Vahabzadə • Coğrafiya MİQ Hazırlığı üzrə İnteraktiv Tədris Sistemi</p>
        <p className="footer-sub">
          Mənbələr: 6, 7, 8, 9, 10 və 11-ci sinif Coğrafiya dərslikləri və Metodik vəsaitləri əsasında hazırlanmışdır.
        </p>
      </footer>
    </div>
  );
}
