import React, { useState, useEffect, useMemo, useRef } from 'react';
import { QUIZ_QUESTIONS } from './data/quizQuestions';
import { FRAMEWORK_SECTIONS, TOPICS_CATALOG } from './data/topicsData';
import { teacherQuizzesTopic1 } from './data/teacherQuizzes';
import { GUVEN_QUIZZES } from './data/guvenQuizzes';
import { TOPIC_1_AUDIO, TOPIC_1_CHAPTERS } from './data/topic1StudyData';
import { TOPIC_1_FLASHCARDS } from './data/topic1Flashcards';
import {
  fetchOrCreateCloudProfile,
  syncProfileToCloud,
  subscribeToCloudProfile
} from './firebase';

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
  // Tabs: 'study' | 'flashcards' | 'guven' | 'textbook' | 'teacher' | 'analytics'
  const [hubTab, setHubTab] = useState('guven');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mode, setMode] = useState('study'); // 'study' | 'exam'
  const [questions, setQuestions] = useState(QUIZ_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User Profile & Cloud Sync state
  const [profileCreds, setProfileCreds] = useState(() => {
    try {
      const saved = localStorage.getItem('miq_profile_creds');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'
  const [syncMessage, setSyncMessage] = useState('');
  const isApplyingRemoteRef = useRef(false);

  // Saved quiz answers
  const [userAnswers, setUserAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('miq_user_answers_1_1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Per-quiz progress (last question index, updated timestamp)
  const [quizProgress, setQuizProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('miq_quiz_progress_1_1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Last active quiz session for instant resume
  const [lastActiveQuiz, setLastActiveQuiz] = useState(() => {
    try {
      const saved = localStorage.getItem('miq_last_active_quiz_1_1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Completed exam attempts history
  const [examHistory, setExamHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('miq_exam_history_1_1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
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

  // Local storage persistence
  useEffect(() => {
    try {
      localStorage.setItem('miq_user_answers_1_1', JSON.stringify(userAnswers));
    } catch (e) {
      console.error(e);
    }
  }, [userAnswers]);

  useEffect(() => {
    try {
      localStorage.setItem('miq_quiz_progress_1_1', JSON.stringify(quizProgress));
    } catch (e) {
      console.error(e);
    }
  }, [quizProgress]);

  useEffect(() => {
    try {
      localStorage.setItem('miq_last_active_quiz_1_1', JSON.stringify(lastActiveQuiz));
    } catch (e) {
      console.error(e);
    }
  }, [lastActiveQuiz]);

  useEffect(() => {
    try {
      localStorage.setItem('miq_exam_history_1_1', JSON.stringify(examHistory));
    } catch (e) {
      console.error(e);
    }
  }, [examHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('miq_flashcards_1_1', JSON.stringify(fcStatus));
    } catch (e) {
      console.error(e);
    }
  }, [fcStatus]);

  // Subscribe to real-time Cloud Profile updates if logged in
  useEffect(() => {
    if (!profileCreds?.profileKey) return;
    setSyncStatus('syncing');
    const unsub = subscribeToCloudProfile(profileCreds.profileKey, (remoteData) => {
      isApplyingRemoteRef.current = true;
      if (remoteData.userAnswers) {
        setUserAnswers((prev) => ({ ...prev, ...remoteData.userAnswers }));
      }
      if (remoteData.quizProgress) {
        setQuizProgress((prev) => ({ ...prev, ...remoteData.quizProgress }));
      }
      if (remoteData.fcStatus) {
        setFcStatus((prev) => ({ ...prev, ...remoteData.fcStatus }));
      }
      if (Array.isArray(remoteData.examHistory) && remoteData.examHistory.length > 0) {
        setExamHistory(remoteData.examHistory);
      }
      if (remoteData.lastActiveQuiz) {
        setLastActiveQuiz(remoteData.lastActiveQuiz);
      }
      setSyncStatus('synced');
      setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 150);
    });
    return () => unsub();
  }, [profileCreds?.profileKey]);

  // Debounced auto-save to Cloud Profile whenever user state changes
  useEffect(() => {
    if (!profileCreds?.profileKey || isApplyingRemoteRef.current) return;
    const timer = setTimeout(() => {
      setSyncStatus('syncing');
      syncProfileToCloud(profileCreds.profileKey, {
        displayName: profileCreds.displayName,
        pin: profileCreds.pin,
        userAnswers,
        quizProgress,
        fcStatus,
        examHistory,
        lastActiveQuiz
      })
        .then(() => setSyncStatus('synced'))
        .catch(() => setSyncStatus('error'));
    }, 600);
    return () => clearTimeout(timer);
  }, [userAnswers, quizProgress, fcStatus, examHistory, lastActiveQuiz, profileCreds]);

  // Handle login / profile creation
  const handleProfileLogin = async (e) => {
    e.preventDefault();
    const trimmedName = loginName.trim();
    const trimmedPin = loginPin.trim();
    if (trimmedName.length < 2) {
      setSyncMessage('Zəhmət olmasa adınızı daxil edin (ən azı 2 hərf).');
      return;
    }
    if (trimmedPin.length < 4 || trimmedPin.length > 12) {
      setSyncMessage('PIN-kod 4–12 simvol arasında olmalıdır (məsələn: 1234).');
      return;
    }
    setSyncStatus('syncing');
    setSyncMessage('Bulud bazası ilə əlaqə qurulur...');
    try {
      const result = await fetchOrCreateCloudProfile(trimmedName, trimmedPin, {
        userAnswers,
        quizProgress,
        fcStatus,
        examHistory,
        lastActiveQuiz
      });

      const mergedAnswers = { ...(result.data.userAnswers || {}), ...userAnswers };
      const mergedProgress = { ...(result.data.quizProgress || {}), ...quizProgress };
      const mergedFc = { ...(result.data.fcStatus || {}), ...fcStatus };
      const mergedHistory =
        examHistory.length >= (result.data.examHistory || []).length
          ? examHistory
          : result.data.examHistory || [];
      const mergedLastActive = lastActiveQuiz || result.data.lastActiveQuiz || null;

      setUserAnswers(mergedAnswers);
      setQuizProgress(mergedProgress);
      setFcStatus(mergedFc);
      setExamHistory(mergedHistory);
      setLastActiveQuiz(mergedLastActive);

      const creds = {
        profileKey: result.profileKey,
        displayName: result.data.displayName || trimmedName,
        pin: trimmedPin
      };
      setProfileCreds(creds);
      localStorage.setItem('miq_profile_creds', JSON.stringify(creds));

      await syncProfileToCloud(result.profileKey, {
        displayName: creds.displayName,
        pin: creds.pin,
        userAnswers: mergedAnswers,
        quizProgress: mergedProgress,
        fcStatus: mergedFc,
        examHistory: mergedHistory,
        lastActiveQuiz: mergedLastActive
      });

      setSyncStatus('synced');
      setSyncMessage(
        result.isNew
          ? 'Yeni bulud profili yaradıldı və bütün nəticələriniz yadda saxlanıldı.'
          : 'Profiliniz bərpa edildi və cihazlararası sinxronlaşdırıldı.'
      );
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
      setSyncMessage('Bulud sinxronizasiyası zamanı xəta baş verdi. İnternet bağlantısını yoxlayın.');
    }
  };

  const handleProfileLogout = () => {
    setProfileCreds(null);
    localStorage.removeItem('miq_profile_creds');
    setSyncStatus('idle');
    setSyncMessage('');
  };

  const getQuizTitleByCode = (varCode) => {
    if (!varCode) return '';
    if (varCode === 'ALL') return 'Dərslik Bazası (80 Sual)';
    if (varCode === 'MEGA') return 'Dərslik Qarışıq Sınaq (20 Sual)';
    if (varCode === 'GF-ALL') return 'Müəllim Bazası (165 Sual)';
    if (varCode === 'GF-MEGA') return 'Müəllim Qarışıq Sınaq (25 Sual)';
    if (varCode === 'GV-ALL') return 'Güvən 2025 Tam Baza (95 Sual)';
    if (varCode === 'GV-MEGA') return 'Güvən 2025 Qarışıq Sınaq (25 Sual)';
    if (varCode === 'WRONG-ALL') return 'Səhv Dəftəri Təkrarı';
    if (varCode.startsWith('GF-')) {
      const found = teacherQuizzesTopic1.find((tq) => tq.shortCode === varCode);
      return found ? found.title : varCode;
    }
    if (varCode.startsWith('GV-')) {
      const found = GUVEN_QUIZZES.find((gq) => gq.shortCode === varCode);
      return found ? found.title : varCode;
    }
    return `Dərslik — Variant ${varCode}`;
  };

  // Track currentIndex changes inside active quiz so user can resume from exact question
  useEffect(() => {
    if (!selectedTopicId || !selectedVariant) return;
    const title = getQuizTitleByCode(selectedVariant);
    const nowIso = new Date().toISOString();
    setQuizProgress((prev) => ({
      ...prev,
      [selectedVariant]: {
        ...(prev[selectedVariant] || {}),
        lastIndex: currentIndex,
        total: questions.length,
        updatedAt: nowIso
      }
    }));
    setLastActiveQuiz({
      variant: selectedVariant,
      mode,
      index: currentIndex,
      title,
      updatedAt: nowIso
    });
  }, [selectedTopicId, selectedVariant, currentIndex, mode, questions.length]);

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

  // Find first unanswered question index or saved lastIndex for smart resume
  const getSmartResumeIndex = (varCode, list) => {
    const savedIdx = quizProgress[varCode]?.lastIndex;
    if (typeof savedIdx === 'number' && savedIdx >= 0 && savedIdx < list.length) {
      return savedIdx;
    }
    const firstUnanswered = list.findIndex((q) => !userAnswers[q.id]);
    return firstUnanswered >= 0 ? firstUnanswered : 0;
  };

  const handleSelectVariant = (varCode, requestedMode = 'study', explicitStartIndex = null) => {
    setSelectedTopicId('1.1');
    setSelectedVariant(varCode);
    setMode(requestedMode);
    setExamSubmitted(false);
    setShowExplanation({});
    setShowQuestionDrawer(false);

    let targetList = QUIZ_QUESTIONS;
    if (varCode === 'ALL') {
      targetList = QUIZ_QUESTIONS;
      setTimeLeft(100 * 60);
    } else if (varCode === 'MEGA') {
      const qA = shuffleArray(QUIZ_QUESTIONS.filter((q) => q.variant === 'A')).slice(0, 5);
      const qB = shuffleArray(QUIZ_QUESTIONS.filter((q) => q.variant === 'B')).slice(0, 5);
      const qC = shuffleArray(QUIZ_QUESTIONS.filter((q) => q.variant === 'C')).slice(0, 5);
      const qD = shuffleArray(QUIZ_QUESTIONS.filter((q) => q.variant === 'D')).slice(0, 5);
      targetList = shuffleArray([...qA, ...qB, ...qC, ...qD]);
      setTimeLeft(25 * 60);
    } else if (varCode === 'GF-ALL') {
      targetList = ALL_TEACHER_QUESTIONS;
      setTimeLeft(180 * 60);
    } else if (varCode === 'GF-MEGA') {
      targetList = shuffleArray(ALL_TEACHER_QUESTIONS).slice(0, 25);
      setTimeLeft(30 * 60);
    } else if (varCode.startsWith('GF-')) {
      const found = teacherQuizzesTopic1.find((tq) => tq.shortCode === varCode);
      targetList = found ? found.questions : ALL_TEACHER_QUESTIONS;
      setTimeLeft(Math.max(30, targetList.length) * 60);
    } else if (varCode === 'GV-ALL') {
      targetList = ALL_GUVEN_QUESTIONS;
      setTimeLeft(110 * 60);
    } else if (varCode === 'GV-MEGA') {
      targetList = shuffleArray(ALL_GUVEN_QUESTIONS).slice(0, 25);
      setTimeLeft(30 * 60);
    } else if (varCode.startsWith('GV-')) {
      const found = GUVEN_QUIZZES.find((gq) => gq.shortCode === varCode);
      targetList = found ? found.questions : ALL_GUVEN_QUESTIONS;
      setTimeLeft(Math.max(25, targetList.length) * 60);
    } else if (varCode === 'WRONG-ALL') {
      const wrongList = ALL_COMBINED_QUESTIONS.filter(
        (q) => userAnswers[q.id] && userAnswers[q.id] !== q.correct
      );
      targetList = wrongList.length > 0 ? wrongList : QUIZ_QUESTIONS;
      setTimeLeft(Math.max(20, targetList.length) * 60);
    } else {
      targetList = QUIZ_QUESTIONS.filter((q) => q.variant === varCode);
      setTimeLeft(25 * 60);
    }

    setQuestions(targetList);
    const startIdx =
      explicitStartIndex !== null ? explicitStartIndex : getSmartResumeIndex(varCode, targetList);
    setCurrentIndex(Math.min(Math.max(0, startIdx), Math.max(0, targetList.length - 1)));
  };

  const handleResetSpecificVariant = (varCode, list) => {
    if (window.confirm(`${getQuizTitleByCode(varCode)} üzrə cavablarınızı sıfırlamaq istəyirsiniz?`)) {
      const ids = new Set(list.map((q) => q.id));
      setUserAnswers((prev) => {
        const next = { ...prev };
        ids.forEach((id) => delete next[id]);
        return next;
      });
      setQuizProgress((prev) => {
        const next = { ...prev };
        delete next[varCode];
        return next;
      });
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
      if (selectedVariant) {
        setQuizProgress((prev) => {
          const next = { ...prev };
          delete next[selectedVariant];
          return next;
        });
      }
      setShowExplanation({});
      setExamSubmitted(false);
      setCurrentIndex(0);
    }
  };

  const handleFinishExam = () => {
    setExamSubmitted(true);
    // Record in examHistory
    let correct = 0;
    let wrong = 0;
    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans) {
        if (ans === q.correct) correct++;
        else wrong++;
      }
    });
    const total = questions.length;
    const netCorrect = Math.max(0, correct - wrong / 4);
    const miqScore80 = total > 0 ? ((netCorrect / total) * 80).toFixed(1) : '0.0';
    const entry = {
      id: Date.now().toString(),
      variant: selectedVariant || 'QUIZ',
      title: getQuizTitleByCode(selectedVariant),
      total,
      correct,
      wrong,
      miqScore80,
      date: new Date().toLocaleString('az-AZ')
    };
    setExamHistory((prev) => [entry, ...prev].slice(0, 50));
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

  // Helper to compute detailed progress status for any quiz row
  const computeQuizRowStatus = (varCode, qList) => {
    const total = qList.length;
    let answered = 0;
    let correct = 0;
    let wrong = 0;
    qList.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans) {
        answered++;
        if (ans === q.correct) correct++;
        else wrong++;
      }
    });
    const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
    const savedLastIdx = quizProgress[varCode]?.lastIndex;
    const firstUnanswered = qList.findIndex((q) => !userAnswers[q.id]);
    const resumeIdx =
      typeof savedLastIdx === 'number' && savedLastIdx >= 0 && savedLastIdx < total
        ? savedLastIdx
        : firstUnanswered >= 0
        ? firstUnanswered
        : 0;

    let statusType = 'not_started'; // 'completed' | 'in_progress' | 'not_started'
    let statusLabel = 'Başlanmayıb';
    if (answered >= total && total > 0) {
      statusType = 'completed';
      statusLabel = `Tamamlanıb (100%)`;
    } else if (answered > 0 || (typeof savedLastIdx === 'number' && savedLastIdx > 0)) {
      statusType = 'in_progress';
      statusLabel = `Yarıda qalıb • Sual ${resumeIdx + 1}/${total} (${pct}%)`;
    }

    return {
      total,
      answered,
      correct,
      wrong,
      unanswered: total - answered,
      pct,
      resumeIdx,
      statusType,
      statusLabel
    };
  };

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

  // All 12 individual test packs in Topic 1.1 to summarize completed vs in-progress
  const allTopic1PacksSummary = useMemo(() => {
    const packs = [
      ...GUVEN_QUIZZES.map((gq) => ({
        code: gq.shortCode,
        title: gq.title,
        questions: gq.questions
      })),
      ...VARIANTS_META.map((vm) => ({
        code: vm.code,
        title: `${vm.name}: ${vm.subtitle}`,
        questions: QUIZ_QUESTIONS.filter((q) => q.variant === vm.code)
      })),
      ...teacherQuizzesTopic1.map((tq) => ({
        code: tq.shortCode,
        title: tq.title,
        questions: tq.questions
      }))
    ];
    return packs.map((p) => ({
      ...p,
      ...computeQuizRowStatus(p.code, p.questions)
    }));
  }, [userAnswers, quizProgress]);

  const completedPacksCount = allTopic1PacksSummary.filter((p) => p.statusType === 'completed').length;
  const inProgressPacksCount = allTopic1PacksSummary.filter((p) => p.statusType === 'in_progress').length;

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

  // Reusable Resume Banner component
  const renderResumeBanner = () => {
    if (!lastActiveQuiz || !lastActiveQuiz.variant) return null;
    const baseList = getBaseListForVariant(lastActiveQuiz.variant);
    const st = computeQuizRowStatus(lastActiveQuiz.variant, baseList);
    return (
      <div className="resume-session-banner">
        <div className="resume-banner-left">
          <span className="resume-tag">SON QALDIĞINIZ SINAQ</span>
          <h3 className="resume-title">{lastActiveQuiz.title || getQuizTitleByCode(lastActiveQuiz.variant)}</h3>
          <p className="resume-meta">
            Qaldığınız yer: <strong>Sual {(lastActiveQuiz.index || 0) + 1} / {st.total}</strong> • Cavablanıb: <strong>{st.answered}/{st.total} ({st.pct}%)</strong> • Düz: {st.correct} • Səhv: {st.wrong}
          </p>
        </div>
        <div className="resume-banner-right">
          <button
            className="btn-resume-now"
            onClick={() =>
              handleSelectVariant(
                lastActiveQuiz.variant,
                lastActiveQuiz.mode || 'study',
                lastActiveQuiz.index || 0
              )
            }
          >
            Qaldığım Sualdan Davam Et (Sual {(lastActiveQuiz.index || 0) + 1}) →
          </button>
        </div>
      </div>
    );
  };

  // Reusable Quiz Row Card with Status Pill + Progress Bar + Resume Button
  const renderQuizPackRow = (code, badgeText, badgeClass, title, subtitleExtra, qList, btnClass = '') => {
    const st = computeQuizRowStatus(code, qList);
    return (
      <div key={code} className={`clean-row-card status-border-${st.statusType}`}>
        <div className="clean-row-main">
          <span className={`clean-row-badge ${badgeClass}`}>{badgeText}</span>
          <div className="clean-row-text">
            <div className="row-title-with-status">
              <h3 className="clean-row-title">{title}</h3>
              <span className={`quiz-status-pill pill-${st.statusType}`}>{st.statusLabel}</span>
            </div>
            <span className="clean-row-meta">
              {subtitleExtra} • Cavablanıb: <strong>{st.answered}/{st.total}</strong> (Düz: <strong className="text-green">{st.correct}</strong>, Səhv: <strong className="text-red">{st.wrong}</strong>, Boş: {st.unanswered})
            </span>
            <div className="row-progress-track">
              <div
                className={`row-progress-fill fill-${st.statusType}`}
                style={{ width: `${st.pct}%` }}
              />
            </div>
          </div>
        </div>
        <div className="clean-row-buttons">
          {st.statusType === 'in_progress' ? (
            <button
              className={`btn-row-study btn-resume-highlight ${btnClass}`}
              onClick={() => handleSelectVariant(code, 'study', st.resumeIdx)}
            >
              Davam Et (Sual {st.resumeIdx + 1}) →
            </button>
          ) : (
            <button
              className={`btn-row-study ${btnClass}`}
              onClick={() => handleSelectVariant(code, 'study', 0)}
            >
              {st.statusType === 'completed' ? 'İzahlara Bax' : 'Təlimə Başla'}
            </button>
          )}
          <button
            className="btn-row-exam"
            onClick={() => handleSelectVariant(code, 'exam', 0)}
          >
            Sınaq (Vaxtlı)
          </button>
          {st.answered > 0 && (
            <button
              className="btn-row-reset"
              title="Bu testin cavablarını sıfırla"
              onClick={() => handleResetSpecificVariant(code, qList)}
            >
              Sıfırla
            </button>
          )}
        </div>
      </div>
    );
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
                : getQuizTitleByCode(selectedVariant)}
            </h1>
          </div>

          <div className="header-actions">
            {/* Cloud Profile Button */}
            <button
              className={`btn-profile-trigger ${profileCreds ? 'profile-connected' : ''}`}
              onClick={() => {
                if (profileCreds) {
                  setLoginName(profileCreds.displayName);
                  setLoginPin(profileCreds.pin);
                }
                setShowProfileModal(true);
              }}
            >
              <span className={`sync-dot dot-${profileCreds ? syncStatus : 'offline'}`} />
              <span>
                {profileCreds
                  ? `${profileCreds.displayName} (${completedPacksCount}/12 Tamamlanıb)`
                  : 'Şəxsi Profil (Bulud Sinxron)'}
              </span>
            </button>

            {selectedTopicId && selectedVariant && (
              <>
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
              </>
            )}
          </div>
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

      {/* ======================================================== */}
      {/* CLOUD PROFILE & PROGRESS TRACKER MODAL                   */}
      {/* ======================================================== */}
      {showProfileModal && (
        <div className="profile-modal-backdrop" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div>
                <span className="badge-academic">Bulud Sinxronizasiyalı Şəxsi Kabinet</span>
                <h2 className="clean-section-title" style={{ marginTop: '4px' }}>
                  {profileCreds
                    ? `Xoş gəldiniz, ${profileCreds.displayName}`
                    : 'Şəxsi Profilə Giriş və Cihazlararası Sinxronizasiya'}
                </h2>
              </div>
              <button className="btn-close" onClick={() => setShowProfileModal(false)}>X</button>
            </div>

            {!profileCreds ? (
              <form className="profile-login-form" onSubmit={handleProfileLogin}>
                <p className="clean-section-sub" style={{ marginBottom: '12px' }}>
                  Adınızı və özünüz üçün təyin etdiyiniz 4 rəqəmli PIN-kodu daxil edin. Həm telefonunuzda, həm də kompüterinizdə eyni Ad və PIN-kodla daxil olduqda bütün işlədiyiniz testlər, yarıda qaldığınız suallar və səhv dəftəriniz avtomatik eyni olacaq.
                </p>
                <div className="profile-inputs-row">
                  <div className="profile-field">
                    <label>Adınız</label>
                    <input
                      type="text"
                      placeholder="Məs: Yusif"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="profile-field">
                    <label>4 Rəqəmli PIN-kod</label>
                    <input
                      type="text"
                      placeholder="Məs: 1990"
                      maxLength={12}
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {syncMessage && <div className="profile-sync-msg">{syncMessage}</div>}
                <button type="submit" className="btn-topic-primary" style={{ width: '100%', marginTop: '10px' }}>
                  {syncStatus === 'syncing' ? 'Sinxronlaşdırılır...' : 'Profilə Daxil Ol və Buludda Saxla'}
                </button>
              </form>
            ) : (
              <div className="profile-connected-box">
                <div className="profile-creds-strip">
                  <div>
                    <span>Aktiv Bulud Profili: <strong>{profileCreds.displayName}</strong> (PIN: <strong>{profileCreds.pin}</strong>)</span>
                    <span className="sync-badge-live">
                      {syncStatus === 'syncing' ? 'Buluda yazılır...' : 'Buludla Tam Sinxron'}
                    </span>
                  </div>
                  <button className="btn-quick-outline" onClick={handleProfileLogout}>
                    Profildən Çıx
                  </button>
                </div>
                {syncMessage && <div className="profile-sync-msg">{syncMessage}</div>}
              </div>
            )}

            {/* Overview of all 12 Test Packs in Mövzu 1.1 */}
            <div className="profile-packs-overview">
              <div className="profile-summary-counters">
                <div className="p-counter-box">
                  <span>Tamamlanan Testlər</span>
                  <strong className="text-green">{completedPacksCount} / 12</strong>
                </div>
                <div className="p-counter-box">
                  <span>Yarıda Qalan Testlər</span>
                  <strong style={{ color: '#d97706' }}>{inProgressPacksCount}</strong>
                </div>
                <div className="p-counter-box">
                  <span>Cəmi İşlənilən Sual</span>
                  <strong className="text-blue">{globalMiqSummary.answered} / 340</strong>
                </div>
                <div className="p-counter-box">
                  <span>Xalis MİQ Ekvivalenti</span>
                  <strong>{globalMiqSummary.miqEquiv80} / 80 Bal</strong>
                </div>
              </div>

              <h3 className="clean-section-title" style={{ fontSize: '14.5px', margin: '14px 0 8px' }}>
                Mövzu 1.1 üzrə Bütün Sınaqların Cari Vəziyyəti (12 Test Paketi)
              </h3>
              <div className="profile-packs-list">
                {allTopic1PacksSummary.map((item) => (
                  <div key={item.code} className="profile-pack-item">
                    <div className="profile-pack-info">
                      <strong>{item.title}</strong>
                      <span className={`quiz-status-pill pill-${item.statusType}`}>{item.statusLabel}</span>
                    </div>
                    <div className="profile-pack-actions">
                      <span className="pack-mini-score">
                        Düz: {item.correct} • Səhv: {item.wrong}
                      </span>
                      <button
                        className="btn-pack-jump"
                        onClick={() => {
                          setShowProfileModal(false);
                          handleSelectVariant(item.code, 'study', item.resumeIdx);
                        }}
                      >
                        {item.statusType === 'in_progress'
                          ? `Davam Et (Sual ${item.resumeIdx + 1})`
                          : item.statusType === 'completed'
                          ? 'Bax'
                          : 'Başla'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="content-wrap">
        {/* ======================================================== */}
        {/* SCREEN 1: OFFICIAL MİQ FRAMEWORK TOPIC CATALOG           */}
        {/* ======================================================== */}
        {!selectedTopicId ? (
          <div className="catalog-screen">
            {renderResumeBanner()}

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
                      <span className="topic-status-pill status-ready">
                        Aktiv • Tamamlanıb: {completedPacksCount}/12 Test • Yarıda: {inProgressPacksCount}
                      </span>
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
            {renderResumeBanner()}

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
                Yaddaş Kartları ({knownFlashcardsCount}/65)
              </button>
              <button
                className={`clean-tab ${hubTab === 'guven' ? 'active' : ''}`}
                onClick={() => setHubTab('guven')}
              >
                Güvən 2025 ({totalGuvenAnswered}/95)
              </button>
              <button
                className={`clean-tab ${hubTab === 'textbook' ? 'active' : ''}`}
                onClick={() => setHubTab('textbook')}
              >
                Dərslik ({totalTextbookAnswered}/80)
              </button>
              <button
                className={`clean-tab ${hubTab === 'teacher' ? 'active' : ''}`}
                onClick={() => setHubTab('teacher')}
              >
                Müəllim ({totalTeacherAnswered}/165)
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
                      «Coğrafiya Tapşırıqlar Toplusu 2025» kitabının 1-ci mövzusu üzrə A, B, C qrup və açıq test tapşırıqları • Cəmi işlənilib: <strong>{totalGuvenAnswered}/95</strong>
                    </p>
                  </div>
                  <div className="clean-quick-actions">
                    <button className="btn-quick-outline" onClick={() => handleSelectVariant('GV-MEGA', 'exam', 0)}>
                      Qarışıq Sınaq (25 Sual)
                    </button>
                    <button className="btn-quick-outline" onClick={() => handleSelectVariant('GV-ALL', 'study')}>
                      Tam Güvən Bazası (95 Sual)
                    </button>
                  </div>
                </div>

                <div className="clean-rows">
                  {GUVEN_QUIZZES.map((gq) =>
                    renderQuizPackRow(
                      gq.shortCode,
                      gq.code,
                      'badge-indigo',
                      gq.title,
                      `${gq.questionCount} sual (${gq.imageCount} sxem/xəritəli)`,
                      gq.questions
                    )
                  )}
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
                    <p className="clean-section-sub">
                      6–11-ci sinif dərslikləri və metodik vəsaitlər əsasında 80 sual • Cəmi işlənilib: <strong>{totalTextbookAnswered}/80</strong>
                    </p>
                  </div>
                  <div className="clean-quick-actions">
                    <button className="btn-quick-outline" onClick={() => handleSelectVariant('MEGA', 'exam', 0)}>
                      Qarışıq Sınaq (20 Sual)
                    </button>
                    <button className="btn-quick-outline" onClick={() => handleSelectVariant('ALL', 'study')}>
                      Hamısını İşlə (80 Sual)
                    </button>
                  </div>
                </div>

                <div className="clean-rows">
                  {VARIANTS_META.map((vm) =>
                    renderQuizPackRow(
                      vm.code,
                      vm.name,
                      '',
                      vm.subtitle,
                      `${vm.qCount} sual`,
                      QUIZ_QUESTIONS.filter((q) => q.variant === vm.code)
                    )
                  )}
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
                    <p className="clean-section-sub">
                      Dərs qrupunda paylaşılan 4 sınaq • 165 sual • Cəmi işlənilib: <strong>{totalTeacherAnswered}/165</strong>
                    </p>
                  </div>
                  <div className="clean-quick-actions">
                    <button className="btn-quick-outline" onClick={() => handleSelectVariant('GF-MEGA', 'exam', 0)}>
                      Qarışıq Sınaq (25 Sual)
                    </button>
                    <button className="btn-quick-outline" onClick={() => handleSelectVariant('GF-ALL', 'study')}>
                      Hamısını İşlə (165 Sual)
                    </button>
                  </div>
                </div>

                <div className="clean-rows">
                  {teacherQuizzesTopic1.map((tq, idx) =>
                    renderQuizPackRow(
                      tq.shortCode,
                      `Sınaq ${idx + 1}`,
                      'badge-teal',
                      tq.title,
                      `${tq.questionCount} sual (${tq.imageCount} şəkilli)`,
                      tq.questions,
                      'btn-teal'
                    )
                  )}
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
                        onClick={() => handleSelectVariant('WRONG-ALL', 'study', 0)}
                      >
                        Bütün Səhvləri Təkrar İşlə ({allWrongQuestions.length} Sual)
                      </button>
                    </div>
                  )}
                </div>

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

                {examHistory.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 className="clean-section-title" style={{ marginBottom: '10px' }}>
                      Tamamlanmış Vaxtlı Sınaqların Tarixçəsi ({examHistory.length})
                    </h3>
                    <div className="clean-rows">
                      {examHistory.slice(0, 10).map((eh) => (
                        <div key={eh.id} className="clean-row-card">
                          <div className="clean-row-main">
                            <span className="clean-row-badge">{eh.miqScore80} / 80 Bal</span>
                            <div className="clean-row-text">
                              <h4 className="clean-row-title">{eh.title}</h4>
                              <span className="clean-row-meta">
                                Tarix: {eh.date} • Düz: <strong className="text-green">{eh.correct}</strong> • Səhv: <strong className="text-red">{eh.wrong}</strong> (Cəmi: {eh.total})
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {allWrongQuestions.length > 0 && (
                  <div className="mistake-notebook-section">
                    <h3 className="clean-section-title" style={{ marginBottom: '12px' }}>
                      Səhv Cavablandırdığınız Suallar ({allWrongQuestions.length})
                    </h3>
                    <div className="mistake-cards-list">
                      {allWrongQuestions.map((wq) => (
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
                <span>Cavablanan: <strong>{questions.filter((q) => userAnswers[q.id]).length}/{questions.length}</strong></span>
                <span className="status-dot">•</span>
                <span className="text-green">Düz: <strong>{stats.correct}</strong></span>
                <span className="status-dot">•</span>
                <span className="text-red">Səhv: <strong>{stats.wrong}</strong></span>
              </div>

              <div className="action-buttons">
                <button
                  className="btn-secondary"
                  onClick={() => setShowQuestionDrawer(!showQuestionDrawer)}
                >
                  Suallar Cədvəli ({questions.filter((q) => userAnswers[q.id]).length}/{questions.length})
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
                  <span>Suala Keçid (Yaşıl = Düz, Qırmızı = Səhv, Boz = Boş):</span>
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
                            handleFinishExam();
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
