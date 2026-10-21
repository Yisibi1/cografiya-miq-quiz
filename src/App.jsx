import React, { useState, useEffect, useMemo, useRef } from 'react';
import { QUIZ_QUESTIONS } from './data/quizQuestions';
import { FRAMEWORK_SECTIONS, TOPICS_CATALOG } from './data/topicsData';
import { teacherQuizzesTopic1 } from './data/teacherQuizzes';
import { GUVEN_QUIZZES } from './data/guvenQuizzes';
import { TOPIC_1_AUDIO, TOPIC_1_CHAPTERS } from './data/topic1StudyData';
import { TOPIC_1_FLASHCARDS } from './data/topic1Flashcards';
import {
  loginCloudAccount,
  registerCloudAccount,
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
  // Top-level portal navigation when logged in:
  // 'dashboard' | 'topics' | 'topic_detail' | 'mistakes'
  const [portalView, setPortalView] = useState('dashboard');
  const [selectedTopicId, setSelectedTopicId] = useState('1.1');
  // Tabs inside Topic 1.1: 'guven' | 'textbook' | 'teacher' | 'study' | 'flashcards' | 'analytics'
  const [hubTab, setHubTab] = useState('guven');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mode, setMode] = useState('study'); // 'study' | 'exam'
  const [questions, setQuestions] = useState(QUIZ_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Dashboard filter for 12 test packs: 'ALL' | 'in_progress' | 'completed' | 'not_started'
  const [dashPackFilter, setDashPackFilter] = useState('ALL');

  // Mandatory Authentication & Cloud Profile state
  const [profileCreds, setProfileCreds] = useState(() => {
    try {
      const saved = localStorage.getItem('miq_profile_creds');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [fullNameInput, setFullNameInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState('MİQ Namizədi (90+ Hədəf)');
  const [authError, setAuthError] = useState('');
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'
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

  // Subscribe to real-time Cloud Profile updates when logged in
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
    }, 500);
    return () => clearTimeout(timer);
  }, [userAnswers, quizProgress, fcStatus, examHistory, lastActiveQuiz, profileCreds]);

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const u = usernameInput.trim();
    const p = passwordInput.trim();
    if (u.length < 2) {
      setAuthError('İstifadəçi adını daxil edin (ən azı 2 simvol).');
      return;
    }
    if (p.length < 4 || p.length > 12) {
      setAuthError('Şifrə 4–12 simvol arasında olmalıdır.');
      return;
    }
    setSyncStatus('syncing');
    try {
      const result = await loginCloudAccount(u, p);
      const mergedAnswers = { ...(result.data.userAnswers || {}), ...userAnswers };
      const mergedProgress = { ...(result.data.quizProgress || {}), ...quizProgress };
      const mergedFc = { ...(result.data.fcStatus || {}), ...fcStatus };
      const mergedHistory =
        (result.data.examHistory || []).length >= examHistory.length
          ? result.data.examHistory || []
          : examHistory;
      const mergedLastActive = result.data.lastActiveQuiz || lastActiveQuiz || null;

      setUserAnswers(mergedAnswers);
      setQuizProgress(mergedProgress);
      setFcStatus(mergedFc);
      setExamHistory(mergedHistory);
      setLastActiveQuiz(mergedLastActive);

      const creds = {
        profileKey: result.profileKey,
        username: result.username,
        displayName: result.data.displayName || u,
        pin: p
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
      setPortalView('dashboard');
    } catch (err) {
      setSyncStatus('idle');
      if (err.message === 'USER_NOT_FOUND') {
        setAuthError('Bu istifadəçi adı tapılmadı. İlk dəfə daxil olursunuzsa «Qeydiyyat» bölməsindən hesab yaradın.');
      } else if (err.message === 'WRONG_PASSWORD') {
        setAuthError('Daxil etdiyiniz şifrə yanlışdır.');
      } else {
        setAuthError('Bağlantı xətası baş verdi. İnternet bağlantınızı yoxlayın.');
      }
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const fn = fullNameInput.trim();
    const u = usernameInput.trim();
    const p = passwordInput.trim();
    if (fn.length < 2) {
      setAuthError('Ad və soyadınızı daxil edin.');
      return;
    }
    if (u.length < 2) {
      setAuthError('İstifadəçi adı ən azı 2 simvol olmalıdır.');
      return;
    }
    if (p.length < 4 || p.length > 12) {
      setAuthError('Şifrə 4–12 simvol arasında olmalıdır.');
      return;
    }
    setSyncStatus('syncing');
    try {
      const displayWithRole = `${fn} (${roleInput})`.slice(0, 60);
      const result = await registerCloudAccount(displayWithRole, u, p, {
        userAnswers,
        quizProgress,
        fcStatus,
        examHistory,
        lastActiveQuiz
      });
      const creds = {
        profileKey: result.profileKey,
        username: result.username,
        displayName: displayWithRole,
        pin: p
      };
      setProfileCreds(creds);
      localStorage.setItem('miq_profile_creds', JSON.stringify(creds));
      setSyncStatus('synced');
      setPortalView('dashboard');
    } catch (err) {
      setSyncStatus('idle');
      if (err.message === 'USERNAME_EXISTS') {
        setAuthError('Bu istifadəçi adı artıq mövcuddur. «Daxil Ol» bölməsindən öz şifrənizlə giriş edin.');
      } else {
        setAuthError('Qeydiyyat zamanı xəta baş verdi. Yenidən cəhd edin.');
      }
    }
  };

  const handleProfileLogout = () => {
    if (window.confirm('Hesabınızdan çıxmaq istəyirsiniz? (Nəticələriniz buludda qorunur)')) {
      setProfileCreds(null);
      localStorage.removeItem('miq_profile_creds');
      setSelectedVariant(null);
      setSyncStatus('idle');
      setAuthError('');
    }
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
    if (!selectedVariant) return;
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
  }, [selectedVariant, currentIndex, mode, questions.length]);

  useEffect(() => {
    let timer = null;
    if (selectedVariant && mode === 'exam' && !examSubmitted && timeLeft > 0) {
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
  }, [selectedVariant, mode, examSubmitted, timeLeft]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    let statusType = 'not_started';
    let statusLabel = 'Başlanmayıb';
    if (answered >= total && total > 0) {
      statusType = 'completed';
      statusLabel = 'Tamamlanıb (100%)';
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
    const accuracyPct = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    return {
      total: ALL_COMBINED_QUESTIONS.length,
      answered,
      correct,
      wrong,
      accuracyPct,
      netCorrect: netCorrect.toFixed(2),
      miqEquiv80
    };
  }, [userAnswers]);

  const allTopic1PacksSummary = useMemo(() => {
    const packs = [
      ...GUVEN_QUIZZES.map((gq) => ({
        code: gq.shortCode,
        bankName: 'Güvən 2025',
        badgeText: gq.code,
        badgeClass: 'badge-indigo',
        title: gq.title,
        subtitleExtra: `${gq.questionCount} sual (${gq.imageCount} sxemli)`,
        questions: gq.questions
      })),
      ...VARIANTS_META.map((vm) => ({
        code: vm.code,
        bankName: 'Dərslik Bazası',
        badgeText: vm.name,
        badgeClass: '',
        title: `${vm.name} — ${vm.subtitle}`,
        subtitleExtra: `${vm.qCount} sual`,
        questions: QUIZ_QUESTIONS.filter((q) => q.variant === vm.code)
      })),
      ...teacherQuizzesTopic1.map((tq, idx) => ({
        code: tq.shortCode,
        bankName: 'Müəllim Sınağı',
        badgeText: `Sınaq ${idx + 1}`,
        badgeClass: 'badge-teal',
        title: tq.title,
        subtitleExtra: `${tq.questionCount} sual (${tq.imageCount} şəkilli)`,
        questions: tq.questions
      }))
    ];
    return packs.map((p) => ({
      ...p,
      ...computeQuizRowStatus(p.code, p.questions)
    }));
  }, [userAnswers, quizProgress]);

  const completedPacksCount = allTopic1PacksSummary.filter((p) => p.statusType === 'completed').length;
  const inProgressPacks = allTopic1PacksSummary.filter((p) => p.statusType === 'in_progress');
  const notStartedPacksCount = allTopic1PacksSummary.filter((p) => p.statusType === 'not_started').length;

  const filteredDashboardPacks = useMemo(() => {
    if (dashPackFilter === 'ALL') return allTopic1PacksSummary;
    return allTopic1PacksSummary.filter((p) => p.statusType === dashPackFilter);
  }, [allTopic1PacksSummary, dashPackFilter]);

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

  // ==========================================================
  // MANDATORY AUTH GATE: NO TESTS ACCESSIBLE WITHOUT LOGIN
  // ==========================================================
  if (!profileCreds) {
    return (
      <div className="auth-gate-wrapper">
        <div className="auth-gate-container">
          <div className="auth-info-panel">
            <span className="auth-brand-pill">MİQ COĞRAFİYA • 90+ HƏDƏF PLATFORMASI</span>
            <h1 className="auth-hero-title">
              Rəsmi MİQ Qiymətləndirmə Çərçivəsi üzrə İnteraktiv Sınaq və Hazırlıq Mərkəzi
            </h1>
            <p className="auth-hero-desc">
              Bütün sınaq testlərinə, Güvən 2025 tapşırıqlarına, izahlı dərslik konspektlərinə və şəxsi nəticə tarixçənizə daxil olmaq üçün hesabınıza giriş edin.
            </p>

            <div className="auth-features-list">
              <div className="auth-feature-item">
                <strong>340 İnteraktiv Test Sualı (Mövzu 1.1)</strong>
                <span>Güvən 2025 (95 sual), Dərslik Bazası (80 sual) və Müəllim Sınaqları (165 sual)</span>
              </div>
              <div className="auth-feature-item">
                <strong>Yarıda Qalan Testdən Davam Etmə</strong>
                <span>Hansı testi işlədiyiniz, neçənci sualda qaldığınız və düz/səhv sayınız avtomatik qorunur</span>
              </div>
              <div className="auth-feature-item">
                <strong>Cihazlararası Bulud Sinxronizasiyası</strong>
                <span>Həm telefonunuzdan, həm də kompüterinizdən eyni hesabla daxil olub qaldığınız yerdən davam edin</span>
              </div>
              <div className="auth-feature-item">
                <strong>Rəsmi MİQ Bal Düsturu (4 Səhv = -1 Düz) və Səhv Dəftəri</strong>
                <span>İmtahan standartına uyğun 80 bal üzərindən xalis hesablama və səhvlərin təkrar işlənməsi</span>
              </div>
            </div>
          </div>

          <div className="auth-form-panel">
            <div className="auth-tabs-bar">
              <button
                type="button"
                className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setAuthTab('login');
                  setAuthError('');
                }}
              >
                Daxil Ol (Giriş)
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${authTab === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setAuthTab('register');
                  setAuthError('');
                }}
              >
                Qeydiyyatdan Keç
              </button>
            </div>

            {authTab === 'login' ? (
              <form className="auth-form-body" onSubmit={handleLoginSubmit}>
                <h2 className="auth-form-title">Şəxsi Kabinetə Giriş</h2>
                <p className="auth-form-sub">
                  Qeydiyyatdan keçdiyiniz istifadəçi adı və şifrənizi daxil edin.
                </p>

                <div className="auth-input-group">
                  <label>İstifadəçi adı (və ya E-poçt)</label>
                  <input
                    type="text"
                    placeholder="Məsələn: yusif"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <label>Şifrə (4–12 simvol)</label>
                  <input
                    type="password"
                    placeholder="Şifrənizi daxil edin"
                    maxLength={12}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                  />
                </div>

                {authError && <div className="auth-error-box">{authError}</div>}

                <button type="submit" className="btn-auth-submit" disabled={syncStatus === 'syncing'}>
                  {syncStatus === 'syncing' ? 'Yoxlanılır...' : 'Kabinetə Daxil Ol →'}
                </button>

                <div className="auth-switch-footer">
                  <span>Hesabınız yoxdur?</span>
                  <button
                    type="button"
                    className="btn-link-inline"
                    onClick={() => {
                      setAuthTab('register');
                      setAuthError('');
                    }}
                  >
                    Yeni Hesab Yaradın
                  </button>
                </div>
              </form>
            ) : (
              <form className="auth-form-body" onSubmit={handleRegisterSubmit}>
                <h2 className="auth-form-title">Yeni İstifadəçi Qeydiyyatı</h2>
                <p className="auth-form-sub">
                  Test nəticələrinizin və yarıda qalan sınaqlarınızın yadda saxlanılması üçün hesab yaradın.
                </p>

                <div className="auth-input-group">
                  <label>Ad və Soyadınız</label>
                  <input
                    type="text"
                    placeholder="Məsələn: Yusif Vahabzadə"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <label>İstifadəçi adı (Giriş üçün)</label>
                  <input
                    type="text"
                    placeholder="Məsələn: yusif"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <label>Şifrə təyin edin (4–12 simvol)</label>
                  <input
                    type="password"
                    placeholder="Ən azı 4 simvol"
                    maxLength={12}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <label>Hazırlıq İstiqaməti</label>
                  <select value={roleInput} onChange={(e) => setRoleInput(e.target.value)}>
                    <option value="MİQ Namizədi (90+ Hədəf)">MİQ Namizədi (90+ Hədəf)</option>
                    <option value="Sertifikasiya">Sertifikasiya İmtahanı</option>
                    <option value="Müəllim">Coğrafiya Müəllimi</option>
                    <option value="Abituriyent / Şagird">Abituriyent / Şagird</option>
                  </select>
                </div>

                {authError && <div className="auth-error-box">{authError}</div>}

                <button type="submit" className="btn-auth-submit" disabled={syncStatus === 'syncing'}>
                  {syncStatus === 'syncing' ? 'Hesab Yaradılır...' : 'Qeydiyyatı Tamamla və Başla →'}
                </button>

                <div className="auth-switch-footer">
                  <span>Artıq hesabınız var?</span>
                  <button
                    type="button"
                    className="btn-link-inline"
                    onClick={() => {
                      setAuthTab('login');
                      setAuthError('');
                    }}
                  >
                    Daxil Olun
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Quiz Platform Navigation Header */}
      <header className="main-header">
        <div className="header-inner">
          <div className="brand-block">
            {selectedVariant !== null ? (
              <button
                className="btn-back-catalog"
                onClick={() => setSelectedVariant(null)}
              >
                ← Sınaqdan Çıx (Nəticə Yadda Saxlanılıb)
              </button>
            ) : (
              <span className="badge-academic">MİQ Coğrafiya «90+ Hədəf» Quiz Platforması</span>
            )}
            <h1 className="header-title">
              {selectedVariant !== null
                ? getQuizTitleByCode(selectedVariant)
                : portalView === 'dashboard'
                ? 'Şəxsi Kabinet və Test İzləmə Paneli'
                : portalView === 'topics'
                ? 'Rəsmi MİQ Qiymətləndirmə Çərçivəsi (Mövzu Kataloqu)'
                : portalView === 'mistakes'
                ? `Səhv Dəftərim (${allWrongQuestions.length} Sual)`
                : 'Mövzu 1.1: Coğrafi kəşflər və tədqiqatlar'}
            </h1>
          </div>

          <div className="header-actions">
            {selectedVariant === null ? (
              <nav className="portal-top-nav">
                <button
                  className={`portal-nav-btn ${portalView === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setPortalView('dashboard')}
                >
                  Kabinetim ({completedPacksCount}/12)
                </button>
                <button
                  className={`portal-nav-btn ${portalView === 'topic_detail' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTopicId('1.1');
                    setPortalView('topic_detail');
                  }}
                >
                  Mövzu 1.1 Testləri
                </button>
                <button
                  className={`portal-nav-btn ${portalView === 'topics' ? 'active' : ''}`}
                  onClick={() => setPortalView('topics')}
                >
                  Rəsmi Çərçivə
                </button>
                <button
                  className={`portal-nav-btn ${portalView === 'mistakes' ? 'active' : ''}`}
                  onClick={() => setPortalView('mistakes')}
                >
                  Səhv Dəftəri ({allWrongQuestions.length})
                </button>
              </nav>
            ) : (
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

            <div className="user-account-pill">
              <span className={`sync-dot dot-${syncStatus}`} title="Bulud sinxronizasiyası aktivdir" />
              <span className="user-pill-name">{profileCreds.displayName.split(' (')[0]}</span>
              <button className="btn-logout-mini" onClick={handleProfileLogout}>
                Çıxış
              </button>
            </div>
          </div>
        </div>

        {selectedVariant !== null && (
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
        {/* ACTIVE QUIZ VIEW                                         */}
        {/* ======================================================== */}
        {selectedVariant !== null ? (
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
                    Kabinetə / Menyuya Qayıt
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
        ) : portalView === 'dashboard' ? (
          /* ======================================================== */
          /* VIEW 1: PERSONAL USER DASHBOARD (ŞƏXSİ KABİNETİM)        */
          /* ======================================================== */
          <div className="dashboard-screen">
            <div className="dash-welcome-card">
              <div className="dash-welcome-left">
                <span className="dash-sync-tag">
                  {syncStatus === 'syncing' ? 'Buludla sinxronlaşdırılır...' : 'Bulud Sinxronizasiyası Aktivdir'}
                </span>
                <h2 className="dash-welcome-title">Xoş gəldiniz, {profileCreds.displayName}</h2>
                <p className="dash-welcome-sub">
                  İşlədiyiniz bütün testlər, yarıda qaldığınız sual nömrələri və səhvləriniz hesabınızda avtomatik yadda saxlanılır.
                </p>
              </div>
              <div className="dash-welcome-actions">
                <button
                  className="btn-topic-primary"
                  onClick={() => {
                    setSelectedTopicId('1.1');
                    setPortalView('topic_detail');
                  }}
                >
                  Mövzu 1.1 Sınaqları və Konspektə Keç →
                </button>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="dash-kpi-grid">
              <div className="dash-kpi-card">
                <span className="dash-kpi-label">Tamamlanan Test Paketləri</span>
                <strong className="dash-kpi-val text-green">{completedPacksCount} / 12 Paket</strong>
                <span className="dash-kpi-sub">100% bitirilmiş sınaqlar</span>
              </div>
              <div className="dash-kpi-card">
                <span className="dash-kpi-label">Yarıda Qalan Testlər</span>
                <strong className="dash-kpi-val" style={{ color: '#d97706' }}>{inProgressPacks.length} Paket</strong>
                <span className="dash-kpi-sub">Başlanmayan: {notStartedPacksCount} paket</span>
              </div>
              <div className="dash-kpi-card">
                <span className="dash-kpi-label">Cəmi İşlənilən Sual</span>
                <strong className="dash-kpi-val text-blue">{globalMiqSummary.answered} / 340</strong>
                <span className="dash-kpi-sub">Düz: {globalMiqSummary.correct} • Səhv: {globalMiqSummary.wrong} ({globalMiqSummary.accuracyPct}%)</span>
              </div>
              <div className="dash-kpi-card">
                <span className="dash-kpi-label">Rəsmi MİQ Xalis Bal Ekvivalenti</span>
                <strong className="dash-kpi-val">{globalMiqSummary.miqEquiv80} / 80 Bal</strong>
                <span className="dash-kpi-sub">4 səhv = -1 düz düsturu ilə</span>
              </div>
            </div>

            {/* Instant Resume Banner */}
            {renderResumeBanner()}

            {/* In-Progress Tests Section */}
            {inProgressPacks.length > 0 && (
              <div className="clean-list-container" style={{ marginBottom: '20px' }}>
                <div className="clean-list-header">
                  <div>
                    <h2 className="clean-section-title">Yarıda Qalan Testləriniz ({inProgressPacks.length})</h2>
                    <p className="clean-section-sub">
                      Yarımçıq qoyduğunuz sınaqları birbaşa qaldığınız sualdan davam etdirin
                    </p>
                  </div>
                </div>
                <div className="clean-rows">
                  {inProgressPacks.map((p) =>
                    renderQuizPackRow(
                      p.code,
                      p.badgeText,
                      p.badgeClass,
                      p.title,
                      p.subtitleExtra,
                      p.questions
                    )
                  )}
                </div>
              </div>
            )}

            {/* Complete 12 Test Packs Progress Table */}
            <div className="clean-list-container">
              <div className="clean-list-header">
                <div>
                  <h2 className="clean-section-title">Mövzu 1.1 üzrə Bütün Test Paketlərinin İzləmə Cədvəli (12 Paket • 340 Sual)</h2>
                  <p className="clean-section-sub">
                    Hansı testləri bitirdiyinizi, hansılarda neçənci sualda qaldığınızı və hansılara başlamadığınızı buradan izləyin
                  </p>
                </div>
                <div className="chapter-pills-row">
                  {[
                    { id: 'ALL', label: `Hamısı (12)` },
                    { id: 'in_progress', label: `Yarıda Qalanlar (${inProgressPacks.length})` },
                    { id: 'completed', label: `Tamamlananlar (${completedPacksCount})` },
                    { id: 'not_started', label: `Başlanmayanlar (${notStartedPacksCount})` }
                  ].map((f) => (
                    <button
                      key={f.id}
                      className={`chapter-pill ${dashPackFilter === f.id ? 'active' : ''}`}
                      onClick={() => setDashPackFilter(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="clean-rows">
                {filteredDashboardPacks.length > 0 ? (
                  filteredDashboardPacks.map((p) =>
                    renderQuizPackRow(
                      p.code,
                      p.badgeText,
                      p.badgeClass,
                      p.title,
                      `${p.bankName} • ${p.subtitleExtra}`,
                      p.questions
                    )
                  )
                ) : (
                  <p className="clean-section-sub" style={{ padding: '16px 0', textAlign: 'center' }}>
                    Bu filtr üzrə test paketi yoxdur.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : portalView === 'topics' ? (
          /* ======================================================== */
          /* VIEW 2: OFFICIAL MİQ FRAMEWORK TOPIC CATALOG             */
          /* ======================================================== */
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
                        Aktiv • Tamamlanıb: {completedPacksCount}/12 Test • Yarıda: {inProgressPacks.length}
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
                          setPortalView('topic_detail');
                        }}
                      >
                        Mövzu 1.1 Sınaqları və Konspektə Daxil Ol →
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
        ) : portalView === 'mistakes' ? (
          /* ======================================================== */
          /* VIEW 3: DEDICATED MISTAKE NOTEBOOK (SƏHV DƏFTƏRİM)       */
          /* ======================================================== */
          <div className="clean-list-container">
            <div className="clean-list-header">
              <div>
                <h2 className="clean-section-title">Səhv Dəftərim və Rəsmi MİQ Bal Hesablayıcısı (4 Səhv = -1 Düz)</h2>
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

            {allWrongQuestions.length > 0 ? (
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
            ) : (
              <p className="clean-section-sub" style={{ textAlign: 'center', padding: '24px 0' }}>
                Hazırda Səhv Dəftərinizdə sual yoxdur.
              </p>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW 4: TOPIC 1.1 6-TAB MASTERY HUB                      */
          /* ======================================================== */
          <div className="simple-menu-screen">
            {renderResumeBanner()}

            <div className="clean-tabs">
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
                className={`clean-tab ${hubTab === 'study' ? 'active' : ''}`}
                onClick={() => setHubTab('study')}
              >
                Konspekt və Səsli Dərs
              </button>
              <button
                className={`clean-tab ${hubTab === 'flashcards' ? 'active' : ''}`}
                onClick={() => setHubTab('flashcards')}
              >
                Kartlar ({knownFlashcardsCount}/65)
              </button>
              <button
                className={`clean-tab ${hubTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setHubTab('analytics')}
              >
                Diaqnostika
              </button>
            </div>

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

            {hubTab === 'analytics' && (
              <div className="clean-list-container">
                <h3 className="clean-section-title" style={{ marginBottom: '12px' }}>
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
        )}
      </main>
    </div>
  );
}
