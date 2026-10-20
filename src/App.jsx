import React, { useState, useEffect, useMemo } from 'react';
import { QUIZ_QUESTIONS } from './data/quizQuestions';
import { FRAMEWORK_SECTIONS, TOPICS_CATALOG } from './data/topicsData';
import { teacherQuizzesTopic1 } from './data/teacherQuizzes';
import { GUVEN_QUIZZES } from './data/guvenQuizzes';
import { TOPIC_1_AUDIO, TOPIC_1_CHAPTERS } from './data/topic1StudyData';
import { TOPIC_1_FLASHCARDS } from './data/topic1Flashcards';

const ALL_TEACHER_QUESTIONS = teacherQuizzesTopic1.flatMap((qGroup) => qGroup.questions);
const ALL_GUVEN_QUESTIONS = GUVEN_QUIZZES.flatMap((qGroup) => qGroup.questions);
const ALL_COMBINED_QUESTIONS = [...QUIZ_QUESTIONS, ...ALL_TEACHER_QUESTIONS, ...ALL_GUVEN_QUESTIONS];

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
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  // Tabs: 'study' | 'flashcards' | 'textbook' | 'guven' | 'teacher' | 'analytics'
  const [hubTab, setHubTab] = useState('guven');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mode, setMode] = useState('study'); // 'study' | 'exam'
  const [questions, setQuestions] = useState(QUIZ_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Saved quiz answers
  const [userAnswers, setUserAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('miq_user_answers_1_1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Study module state
  const [activeChapterId, setActiveChapterId] = useState('ALL');
  const [studySearch, setStudySearch] = useState('');

  // Flashcards state
  const [fcCategory, setFcCategory] = useState('ALL');
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const [fcStatus, setFcStatus] = useState(() => {
    try {
      const saved = localStorage.getItem('miq_flashcards_1_1');
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
  const isGuvenVariant = selectedVariant && selectedVariant.startsWith('GV-');

  useEffect(() => {
    try {
      localStorage.setItem('miq_user_answers_1_1', JSON.stringify(userAnswers));
    } catch (e) {
      console.error(e);
    }
  }, [userAnswers]);

  useEffect(() => {
    try {
      localStorage.setItem('miq_flashcards_1_1', JSON.stringify(fcStatus));
    } catch (e) {
      console.error(e);
    }
  }, [fcStatus]);

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
    if (varCode === 'GV-ALL') return ALL_GUVEN_QUESTIONS;
    if (varCode === 'WRONG-ALL') {
      return ALL_COMBINED_QUESTIONS.filter((q) => userAnswers[q.id] && userAnswers[q.id] !== q.correct);
    }
    if (varCode.startsWith('GF-')) {
      const found = teacherQuizzesTopic1.find((tq) => tq.shortCode === varCode);
      return found ? found.questions : ALL_TEACHER_QUESTIONS;
    }
    if (varCode.startsWith('GV-')) {
      const found = GUVEN_QUIZZES.find((gq) => gq.shortCode === varCode);
      return found ? found.questions : ALL_GUVEN_QUESTIONS;
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
    } else if (varCode === 'GV-ALL') {
      setQuestions(ALL_GUVEN_QUESTIONS);
      setTimeLeft(110 * 60);
    } else if (varCode === 'GV-MEGA') {
      setQuestions(shuffleArray(ALL_GUVEN_QUESTIONS).slice(0, 25));
      setTimeLeft(30 * 60);
    } else if (varCode.startsWith('GV-')) {
      const found = GUVEN_QUIZZES.find((gq) => gq.shortCode === varCode);
      const list = found ? found.questions : ALL_GUVEN_QUESTIONS;
      setQuestions(list);
      setTimeLeft(Math.max(25, list.length) * 60);
    } else if (varCode === 'WRONG-ALL') {
      const wrongList = ALL_COMBINED_QUESTIONS.filter(
        (q) => userAnswers[q.id] && userAnswers[q.id] !== q.correct
      );
      setQuestions(wrongList.length > 0 ? wrongList : QUIZ_QUESTIONS);
      setTimeLeft(Math.max(20, wrongList.length) * 60);
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

  // Official MİQ stats calculation (4 wrong cancels 1 right)
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
    const total = questions.length;
    const rawPercentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const netCorrect = Math.max(0, correct - wrong / 4);
    const miqScore80 = total > 0 ? ((netCorrect / total) * 80).toFixed(1) : '0.0';
    return {
      correct,
      wrong,
      unanswered,
      percentage: rawPercentage,
      netCorrect: netCorrect.toFixed(2),
      miqScore80
    };
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

  const guvenStats = useMemo(() => {
    const res = {};
    GUVEN_QUIZZES.forEach((gq) => {
      const ansCount = gq.questions.filter((q) => userAnswers[q.id]).length;
      const corCount = gq.questions.filter((q) => userAnswers[q.id] === q.correct).length;
      res[gq.shortCode] = { answered: ansCount, correct: corCount, total: gq.questionCount };
    });
    return res;
  }, [userAnswers]);

  const allWrongQuestions = useMemo(() => {
    return ALL_COMBINED_QUESTIONS.filter((q) => userAnswers[q.id] && userAnswers[q.id] !== q.correct);
  }, [userAnswers]);

  const globalMiqSummary = useMemo(() => {
    let answered = 0;
    let correct = 0;
    let wrong = 0;
    ALL_COMBINED_QUESTIONS.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans) {
        answered++;
        if (ans === q.correct) correct++;
        else wrong++;
      }
    });
    const netCorrect = Math.max(0, correct - wrong / 4);
    const miqEquiv80 = answered > 0 ? ((netCorrect / answered) * 80).toFixed(1) : '0.0';
    return {
      total: ALL_COMBINED_QUESTIONS.length,
      answered,
      correct,
      wrong,
      netCorrect: netCorrect.toFixed(2),
      miqEquiv80
    };
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

  // Filtered chapters for Study view
  const filteredChapters = useMemo(() => {
    return TOPIC_1_CHAPTERS.filter((ch) => {
      const matchId = activeChapterId === 'ALL' || ch.id === activeChapterId;
      const matchQuery =
        !studySearch.trim() ||
        ch.title.toLowerCase().includes(studySearch.toLowerCase()) ||
        ch.html.toLowerCase().includes(studySearch.toLowerCase());
      return matchId && matchQuery;
    });
  }, [activeChapterId, studySearch]);

  // Filtered flashcards
  const filteredFlashcards = useMemo(() => {
    return TOPIC_1_FLASHCARDS.filter((fc) => {
      if (fcCategory === 'ALL') return true;
      if (fcCategory === 'REVIEW') return fcStatus[fc.id] === 'review';
      if (fcCategory === 'KNOWN') return fcStatus[fc.id] === 'known';
      return fc.category === fcCategory;
    });
  }, [fcCategory, fcStatus]);

  const currentFlashcard = filteredFlashcards[fcIndex] || filteredFlashcards[0] || null;
  const knownFlashcardsCount = Object.values(fcStatus).filter((v) => v === 'known').length;
  const reviewFlashcardsCount = Object.values(fcStatus).filter((v) => v === 'review').length;

  const totalTextbookAnswered = QUIZ_QUESTIONS.filter((q) => userAnswers[q.id]).length;
  const totalTeacherAnswered = ALL_TEACHER_QUESTIONS.filter((q) => userAnswers[q.id]).length;
  const totalGuvenAnswered = ALL_GUVEN_QUESTIONS.filter((q) => userAnswers[q.id]).length;

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
    if (selectedVariant === 'GV-ALL') return 'Güvən 2025 Tam Baza (95 Sual)';
    if (selectedVariant === 'GV-MEGA') return 'Güvən 2025 Qarışıq Sınaq (25 Sual)';
    if (selectedVariant === 'WRONG-ALL') return `Səhv Dəftəri Təkrarı (${questions.length} Sual)`;
    if (selectedVariant && selectedVariant.startsWith('GF-')) {
      const found = teacherQuizzesTopic1.find((tq) => tq.shortCode === selectedVariant);
      return found ? found.title : selectedVariant;
    }
    if (selectedVariant && selectedVariant.startsWith('GV-')) {
      const found = GUVEN_QUIZZES.find((gq) => gq.shortCode === selectedVariant);
      return found ? found.title : selectedVariant;
    }
    return `Variant ${selectedVariant}`;
  };

  return (
    <div className="app-container">
      {/* Header */}
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
                {selectedVariant !== null ? '← Mövzu Menyusuna Qayıt' : '← Rəsmi Çərçivə Siyahısına Qayıt'}
              </button>
            ) : (
              <span className="badge-academic">MİQ Coğrafiya «90+ Hədəf» Mərkəzi • Rəsmi Çərçivə (40 Sual = 80 Bal)</span>
            )}
            <h1 className="header-title">
              {!selectedTopicId
                ? 'Rəsmi MİQ Qiymətləndirmə Çərçivəsi üzrə Mövzu Kataloqu'
                : selectedVariant === null
                ? 'Mövzu 1.1: Coğrafi kəşflər və tədqiqatlar, coğrafiya elminin inkişafı'
                : getActiveQuizTitle()}
            </h1>
          </div>

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
                width: `${(questions.filter((q) => userAnswers[q.id]).length / questions.length) * 100}%`
              }}
            />
          </div>
        )}
      </header>

      <main className="content-wrap">
        {/* ======================================================== */}
        {/* SCREEN 1: OFFICIAL MİQ FRAMEWORK TOPIC CATALOG           */}
        {/* ======================================================== */}
        {!selectedTopicId ? (
          <div className="catalog-screen">
            <div className="framework-summary-banner">
              {FRAMEWORK_SECTIONS.map((sec) => (
                <div key={sec.id} className="fw-summary-card">
                  <div className="fw-summary-top">
                    <span className="fw-sec-title">{sec.num}</span>
                    <span className="fw-sec-points">{sec.officialQuestions} Sual • {sec.officialPoints} Bal</span>
                  </div>
                  <p className="fw-sec-desc">{sec.desc}</p>
                </div>
              ))}
            </div>

            <div className="catalog-grid">
              {TOPICS_CATALOG.map((top) => (
                <div
                  key={top.id}
                  className={`topic-card ${top.active ? 'topic-card-active' : 'topic-card-disabled'}`}
                >
                  <div className="topic-card-header">
                    <span className="topic-code-badge">{top.topicCode}</span>
                    {top.active ? (
                      <span className="topic-status-pill status-ready">Aktiv • 340 Sual + Konspekt</span>
                    ) : (
                      <span className="topic-status-pill status-soon">Növbəti Mərhələdə</span>
                    )}
                  </div>

                  <h3 className="topic-title">{top.title}</h3>
                  <p className="topic-desc">{top.sectionNum}: {top.sectionTitle}</p>
                  <p className="topic-sub-detail">{top.description}</p>

                  {top.id === '1.1' && (
                    <div className="simple-topic-stats">
                      <span>Güvən 2025: <strong>{totalGuvenAnswered}/95</strong></span>
                      <span>•</span>
                      <span>Dərslik: <strong>{totalTextbookAnswered}/80</strong></span>
                      <span>•</span>
                      <span>Müəllim: <strong>{totalTeacherAnswered}/165</strong></span>
                      <span>•</span>
                      <span>Kartlar: <strong>{knownFlashcardsCount}/65</strong></span>
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
                        Mövzu 1.1 Hazırlıq Mərkəzinə Daxil Ol →
                      </button>
                    ) : (
                      <button className="btn-topic-disabled" disabled>
                        Mövzu 1.1 Tamamlandıqdan Sonra Açılacaq
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : selectedVariant === null ? (
          /* ======================================================== */
          /* SCREEN 2: TOPIC 1.1 6-TAB MASTERY HUB                    */
          /* ======================================================== */
          <div className="simple-menu-screen">
            <div className="clean-tabs">
              <button
                className={`clean-tab ${hubTab === 'study' ? 'active' : ''}`}
                onClick={() => setHubTab('study')}
              >
                Konspekt və Səsli Dərs
              </button>
              <button
                className={`clean-tab ${hubTab === 'flashcards' ? 'active' : ''}`}
                onClick={() => setHubTab('flashcards')}
              >
                Yaddaş Kartları (65)
              </button>
              <button
                className={`clean-tab ${hubTab === 'guven' ? 'active' : ''}`}
                onClick={() => setHubTab('guven')}
              >
                Güvən 2025 (95 Sual)
              </button>
              <button
                className={`clean-tab ${hubTab === 'textbook' ? 'active' : ''}`}
                onClick={() => setHubTab('textbook')}
              >
                Dərslik Testləri (80)
              </button>
              <button
                className={`clean-tab ${hubTab === 'teacher' ? 'active' : ''}`}
                onClick={() => setHubTab('teacher')}
              >
                Müəllim Sınaqları (165)
              </button>
              <button
                className={`clean-tab ${hubTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setHubTab('analytics')}
              >
                Səhv Dəftəri ({allWrongQuestions.length})
              </button>
            </div>

            {/* ---------------------------------------------------- */}
            {/* TAB 1: KONSPEKT VƏ SƏSLİ DƏRS                        */}
            {/* ---------------------------------------------------- */}
            {hubTab === 'study' && (
              <div className="study-hub-container">
                <div className="audio-lessons-bar">
                  <div className="audio-bar-header">
                    <div>
                      <h2 className="clean-section-title">Səsli Dərs və Tam Akademik Konspekt (6–11-ci Siniflər)</h2>
                      <p className="clean-section-sub">
                        Rəsmi MİQ Çərçivəsinin Mövzu 1.1 bloku üzrə bütün dərslik və metodik vəsait materialları
                      </p>
                    </div>
                    <a
                      href="/Movzu_1_1_Konspekt.pdf"
                      download="Movzu_1_1_Cografi_Kesfler_Konspekt.pdf"
                      className="btn-download-pdf"
                    >
                      PDF Konspekti Endir (16 səh.)
                    </a>
                  </div>

                  <div className="audio-cards-grid">
                    {TOPIC_1_AUDIO.map((aud) => (
                      <div key={aud.id} className="audio-player-card">
                        <div className="audio-card-info">
                          <strong>{aud.title}</strong>
                          <span>{aud.desc}</span>
                        </div>
                        <audio controls preload="none" className="audio-element">
                          <source src={aud.src} type="audio/mpeg" />
                        </audio>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="study-filter-bar">
                  <input
                    type="text"
                    className="study-search-input"
                    placeholder="Konspekt daxilində axtar (məs: Biruni, Merkator, ştanger, Worldmapper, CİS)..."
                    value={studySearch}
                    onChange={(e) => setStudySearch(e.target.value)}
                  />
                  <div className="chapter-pills-row">
                    <button
                      className={`chapter-pill ${activeChapterId === 'ALL' ? 'active' : ''}`}
                      onClick={() => setActiveChapterId('ALL')}
                    >
                      Bütün Fəsillər (1.1–1.8)
                    </button>
                    {TOPIC_1_CHAPTERS.map((ch) => (
                      <button
                        key={ch.id}
                        className={`chapter-pill ${activeChapterId === ch.id ? 'active' : ''}`}
                        onClick={() => setActiveChapterId(ch.id)}
                      >
                        Fəsil {ch.code}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="study-chapters-list">
                  {filteredChapters.map((ch) => (
                    <article key={ch.id} className="study-chapter-card">
                      <div className="study-chapter-meta">
                        <span className="study-fw-badge">{ch.frameworkGroup}</span>
                        <span className="study-code-badge">Fəsil {ch.code}</span>
                      </div>
                      <div
                        className="study-html-content"
                        dangerouslySetInnerHTML={{ __html: ch.html }}
                      />
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 2: YADDAŞ KARTLARI (65 FLASHCARDS)               */}
            {/* ---------------------------------------------------- */}
            {hubTab === 'flashcards' && (
              <div className="clean-list-container">
                <div className="clean-list-header">
                  <div>
                    <h2 className="clean-section-title">Aktiv Yaddaş Kartları (65 Suallıq Sürətli Əzbərləmə Bazası)</h2>
                    <p className="clean-section-sub">
                      Əzbərlədiyiniz kartlar: <strong>{knownFlashcardsCount}</strong> • Təkrar soruşulacaq kartlar: <strong>{reviewFlashcardsCount}</strong>
                    </p>
                  </div>
                  <div className="clean-quick-actions">
                    <button
                      className="btn-quick-outline"
                      onClick={() => {
                        if (window.confirm('Yaddaş kartları üzrə işarələmələri sıfırlamaq istəyirsiniz?')) {
                          setFcStatus({});
                          setFcIndex(0);
                        }
                      }}
                    >
                      Kartları Sıfırla
                    </button>
                  </div>
                </div>

                <div className="chapter-pills-row" style={{ marginBottom: '16px' }}>
                  {[
                    { id: 'ALL', label: `Hamısı (${TOPIC_1_FLASHCARDS.length})` },
                    { id: '1. Coğrafi kəşflər və tədqiqatlar', label: '1. Coğrafi kəşflər (25)' },
                    { id: '2. Azərbaycanda coğrafiya elminin inkişafı', label: '2. Azərbaycanda coğrafiya (20)' },
                    { id: '3. Coğrafiya elminin sahələri və müasir coğrafi biliklərin əldə edilməsi', label: '3. Sahələr, Metodlar və CİS (20)' },
                    { id: 'REVIEW', label: `Təkrar Soruşulanlar (${reviewFlashcardsCount})` },
                    { id: 'KNOWN', label: `Bilirəm (${knownFlashcardsCount})` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className={`chapter-pill ${fcCategory === tab.id ? 'active' : ''}`}
                      onClick={() => {
                        setFcCategory(tab.id);
                        setFcIndex(0);
                        setFcFlipped(false);
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {currentFlashcard ? (
                  <div className="flashcard-stage">
                    <div
                      className={`flashcard-box ${fcFlipped ? 'is-flipped' : ''}`}
                      onClick={() => setFcFlipped(!fcFlipped)}
                    >
                      <div className="fc-top-bar">
                        <span className="fc-cat-tag">{currentFlashcard.category}</span>
                        <span className="fc-grade-tag">{currentFlashcard.grade} • Kart {fcIndex + 1} / {filteredFlashcards.length}</span>
                      </div>

                      <div className="fc-body-content">
                        <span className="fc-side-label">{fcFlipped ? 'DƏRSLİK CAVABI:' : 'SUAL:'}</span>
                        <p className="fc-main-text" style={{ whiteSpace: 'pre-line' }}>
                          {fcFlipped ? currentFlashcard.back : currentFlashcard.front}
                        </p>
                      </div>

                      <div className="fc-bottom-hint">
                        <span>{fcFlipped ? 'Suala qayıtmaq üçün karta toxunun' : 'Cavabı görmək üçün karta toxunun'}</span>
                      </div>
                    </div>

                    <div className="fc-controls-row">
                      <button
                        className="btn-nav"
                        disabled={fcIndex === 0}
                        onClick={() => {
                          setFcIndex((i) => Math.max(0, i - 1));
                          setFcFlipped(false);
                        }}
                      >
                        ← Əvvəlki Kart
                      </button>

                      <div className="fc-Verdict-buttons">
                        <button
                          className="btn-fc-review"
                          onClick={() => {
                            setFcStatus((prev) => ({ ...prev, [currentFlashcard.id]: 'review' }));
                            setFcFlipped(false);
                            if (fcIndex < filteredFlashcards.length - 1) setFcIndex((i) => i + 1);
                          }}
                        >
                          Təkrar Soruş
                        </button>
                        <button
                          className="btn-fc-known"
                          onClick={() => {
                            setFcStatus((prev) => ({ ...prev, [currentFlashcard.id]: 'known' }));
                            setFcFlipped(false);
                            if (fcIndex < filteredFlashcards.length - 1) setFcIndex((i) => i + 1);
                          }}
                        >
                          Bilirəm (Əzbərlədim)
                        </button>
                      </div>

                      <button
                        className="btn-nav btn-nav-primary"
                        disabled={fcIndex >= filteredFlashcards.length - 1}
                        onClick={() => {
                          setFcIndex((i) => Math.min(filteredFlashcards.length - 1, i + 1));
                          setFcFlipped(false);
                        }}
                      >
                        Növbəti Kart →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state-box">
                    <p>Bu kateqoriyada hazırda kart yoxdur.</p>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 3: GÜVƏN 2025 TEST BANKI (95 SUAL)               */}
            {/* ---------------------------------------------------- */}
            {hubTab === 'guven' && (
              <div className="clean-list-container">
                <div className="clean-list-header">
                  <div>
                    <h2 className="clean-section-title">Güvən Nəşrləri 2025 — Test Bankı (95 Sual)</h2>
                    <p className="clean-section-sub">
                      «Coğrafiya Tapşırıqlar Toplusu 2025» kitabının 1-ci mövzusu üzrə bütün A, B, C qrup və açıq test tapşırıqları (17 xəritə, klaster və Venn diaqramı ilə)
                    </p>
                  </div>
                  <div className="clean-quick-actions">
                    <button className="btn-quick-outline" onClick={() => handleSelectVariant('GV-MEGA', 'exam')}>
                      Qarışıq Sınaq (25 Sual)
                    </button>
                    <button className="btn-quick-outline" onClick={() => handleSelectVariant('GV-ALL', 'study')}>
                      Tam Güvən Bazası (95 Sual)
                    </button>
                  </div>
                </div>

                <div className="clean-rows">
                  {GUVEN_QUIZZES.map((gq) => {
                    const st = guvenStats[gq.shortCode];
                    return (
                      <div key={gq.id} className="clean-row-card">
                        <div className="clean-row-main">
                          <span className="clean-row-badge badge-indigo">{gq.code}</span>
                          <div className="clean-row-text">
                            <h3 className="clean-row-title">{gq.title}</h3>
                            <span className="clean-row-meta">
                              {gq.questionCount} sual ({gq.imageCount} sxem/xəritəli) • İşlənilib: <strong>{st.answered}/{gq.questionCount}</strong> (Düzgün: {st.correct})
                            </span>
                          </div>
                        </div>
                        <div className="clean-row-buttons">
                          <button
                            className="btn-row-study"
                            onClick={() => handleSelectVariant(gq.shortCode, 'study')}
                          >
                            Təlim (İzahlı)
                          </button>
                          <button
                            className="btn-row-exam"
                            onClick={() => handleSelectVariant(gq.shortCode, 'exam')}
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

            {/* ---------------------------------------------------- */}
            {/* TAB 4: DƏRSLİK TESTLƏRİ (80 SUAL)                    */}
            {/* ---------------------------------------------------- */}
            {hubTab === 'textbook' && (
              <div className="clean-list-container">
                <div className="clean-list-header">
                  <div>
                    <h2 className="clean-section-title">Əsas Dərslik Bazası (Variant A, B, C, D)</h2>
                    <p className="clean-section-sub">6–11-ci sinif dərslikləri və metodik vəsaitlər əsasında hazırlanmış 80 sual</p>
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

            {/* ---------------------------------------------------- */}
            {/* TAB 5: MÜƏLLİM SINAQLARI (165 SUAL)                  */}
            {/* ---------------------------------------------------- */}
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

            {/* ---------------------------------------------------- */}
            {/* TAB 6: SƏHV DƏFTƏRİ VƏ RƏSMİ MİQ DİAQNOSTİKASI       */}
            {/* ---------------------------------------------------- */}
            {hubTab === 'analytics' && (
              <div className="clean-list-container">
                <div className="clean-list-header">
                  <div>
                    <h2 className="clean-section-title">Səhv Dəftəri və Rəsmi MİQ Bal Hesablayıcısı (4 Səhv = -1 Düz)</h2>
                    <p className="clean-section-sub">
                      Ümumi Baza: {globalMiqSummary.answered}/{globalMiqSummary.total} sual işlənilib • Düzgün: {globalMiqSummary.correct} • Səhv: {globalMiqSummary.wrong}
                    </p>
                  </div>
                  {allWrongQuestions.length > 0 && (
                    <div className="clean-quick-actions">
                      <button
                        className="btn-row-study"
                        onClick={() => handleSelectVariant('WRONG-ALL', 'study')}
                      >
                        Bütün Səhvləri Təkrar İşlə ({allWrongQuestions.length} Sual)
                      </button>
                    </div>
                  )}
                </div>

                {/* Official MİQ Formula Summary Box */}
                <div className="miq-formula-banner">
                  <div className="miq-stat-item">
                    <span className="miq-stat-lbl">İşlənilən Suallar</span>
                    <strong className="miq-stat-val">{globalMiqSummary.answered} / 340</strong>
                  </div>
                  <div className="miq-stat-item">
                    <span className="miq-stat-lbl">Düzgün Cavablar</span>
                    <strong className="miq-stat-val text-green">{globalMiqSummary.correct}</strong>
                  </div>
                  <div className="miq-stat-item">
                    <span className="miq-stat-lbl">Səhv Cavablar (-1/4 cərimə)</span>
                    <strong className="miq-stat-val text-red">{globalMiqSummary.wrong}</strong>
                  </div>
                  <div className="miq-stat-item">
                    <span className="miq-stat-lbl">Xalis Düzgün Cavab</span>
                    <strong className="miq-stat-val">{globalMiqSummary.netCorrect}</strong>
                  </div>
                  <div className="miq-stat-item">
                    <span className="miq-stat-lbl">80 İxtisas Balı Ekvivalenti</span>
                    <strong className="miq-stat-val text-blue">{globalMiqSummary.miqEquiv80} / 80</strong>
                  </div>
                </div>

                {/* Mistake Bank List */}
                {allWrongQuestions.length > 0 && (
                  <div className="mistake-notebook-section">
                    <h3 className="clean-section-title" style={{ marginBottom: '12px' }}>
                      Səhv Cavablandırdığınız Suallar ({allWrongQuestions.length})
                    </h3>
                    <div className="mistake-cards-list">
                      {allWrongQuestions.map((wq, i) => (
                        <div key={wq.id} className="mistake-item-card">
                          <div className="mistake-item-top">
                            <span className="q-badge">{wq.id}</span>
                            <span className="mistake-ans-tags">
                              Seçiminiz: <strong className="text-red">{userAnswers[wq.id]}</strong> • Düzgün Cavab: <strong className="text-green">{wq.correct}</strong>
                            </span>
                          </div>
                          <p className="mistake-q-text" style={{ whiteSpace: 'pre-line' }}>{wq.question}</p>
                          <p className="mistake-exp-text">{wq.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="clean-section-title" style={{ margin: '24px 0 12px' }}>
                  Dərslik Alt-Bölmələri üzrə Mənimsəmə Diaqnostikası
                </h3>
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
          /* SCREEN 3: ACTIVE QUIZ VIEW                               */
          /* ======================================================== */
          <>
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
                  <button className="btn-close" onClick={() => setShowQuestionDrawer(false)}>X</button>
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

            {mode === 'exam' && examSubmitted ? (
              <div className="results-card">
                <div className="results-header">
                  <span className="results-pill">Rəsmi MİQ Sınaq Nəticəsi (4 Səhv = -1 Düz)</span>
                  <h2 className="results-score">{stats.miqScore80} / 80 Bal</h2>
                  <p className="results-subtitle">
                    {questions.length} sualdan <strong>{stats.correct} düz</strong>, <strong>{stats.wrong} səhv</strong> • Xalis düz: <strong>{stats.netCorrect}</strong> ({stats.percentage}%)
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
                    Mövzu Menyusuna Qayıt
                  </button>
                </div>
              </div>
            ) : (
              currentQ && (
                <div className="question-card">
                  <div className="q-meta-row">
                    <span className="q-badge">
                      {isGuvenVariant
                        ? `Güvən 2025 • Sual ${currentQ.num || currentIndex + 1}`
                        : isTeacherVariant
                        ? 'Müəllim Sınağı'
                        : `Variant ${currentQ.variant}`}
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

                  {mode === 'study' && (showExplanation[currentQ.id] || userAnswers[currentQ.id]) && (
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
