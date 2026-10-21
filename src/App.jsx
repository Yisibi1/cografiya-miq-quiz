import React, { useState, useEffect, useMemo, useRef } from 'react';
import { QUIZ_QUESTIONS } from './data/quizQuestions';
import { FRAMEWORK_SECTIONS, TOPICS_CATALOG } from './data/topicsData';
import { teacherQuizzesTopic1 } from './data/teacherQuizzes';
import { GUVEN_QUIZZES } from './data/guvenQuizzes';
import { TOPIC_1_AUDIO, TOPIC_1_CHAPTERS } from './data/topic1StudyData';
import { TOPIC_1_FLASHCARDS } from './data/topic1Flashcards';
import { QUIZ_QUESTIONS_1_2 } from './data/topic1_2TextbookQuizzes';
import { teacherQuizzesTopic1_2 } from './data/topic1_2TeacherQuizzes';
import { GUVEN_QUIZZES_1_2 } from './data/topic1_2GuvenQuizzes';
import { TOPIC_1_2_AUDIO, TOPIC_1_2_CHAPTERS } from './data/topic1_2StudyData';
import { TOPIC_1_2_FLASHCARDS } from './data/topic1_2Flashcards';
import {
  loginCloudAccount,
  registerCloudAccount,
  syncProfileToCloud,
  subscribeToCloudProfile
} from './firebase';

const ALL_TEACHER_QUESTIONS = teacherQuizzesTopic1.flatMap((qGroup) => qGroup.questions);
const ALL_GUVEN_QUESTIONS = GUVEN_QUIZZES.flatMap((qGroup) => qGroup.questions);
const ALL_TEACHER_QUESTIONS_1_2 = teacherQuizzesTopic1_2.flatMap((qGroup) => qGroup.questions);
const ALL_GUVEN_QUESTIONS_1_2 = GUVEN_QUIZZES_1_2.flatMap((qGroup) => qGroup.questions);

const ALL_TOPIC_1_1_QUESTIONS = [...QUIZ_QUESTIONS, ...ALL_TEACHER_QUESTIONS, ...ALL_GUVEN_QUESTIONS];
const ALL_TOPIC_1_2_QUESTIONS = [...QUIZ_QUESTIONS_1_2, ...ALL_TEACHER_QUESTIONS_1_2, ...ALL_GUVEN_QUESTIONS_1_2];
const ALL_COMBINED_QUESTIONS = [...ALL_TOPIC_1_1_QUESTIONS, ...ALL_TOPIC_1_2_QUESTIONS];

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

const VARIANTS_META_1_2 = [
  {
    code: 'T2-A',
    name: 'Variant A (1.2)',
    subtitle: 'Məkanın 3 Növü, 5 Xüsusiyyəti, Ağdam və Bakı',
    qCount: 20
  },
  {
    code: 'T2-B',
    name: 'Variant B (1.2)',
    subtitle: 'Məkanın Miqyası, 5 Pilləli Regionlar və Dəhlizlər',
    qCount: 20
  },
  {
    code: 'T2-C',
    name: 'Variant C (1.2)',
    subtitle: 'Coğrafi Mövqe, 4-lü və 6-lı Şəbəkə, QMS və Boğazlar',
    qCount: 20
  },
  {
    code: 'T2-D',
    name: 'Variant D (1.2)',
    subtitle: 'Miqyas, Plan, Şərti İşarələr, Azimut, Paletka və Horizontallar',
    qCount: 20
  }
];

const ICON_PATHS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  layers: 'M12 3 2 8l10 5 10-5-10-5zM2 12.5l10 5 10-5M2 17l10 5 10-5',
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
  notebook: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  arrowLeft: 'M19 12H5M12 19l-7-7 7-7',
  arrowRight: 'M5 12h14M12 5l7 7-7 7',
  clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  shuffle: 'M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
  reset: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  x: 'M18 6 6 18M6 6l12 12',
  flag: 'M4 22V4M4 4h13l-2 4 2 4H4'
};

function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

function ProgressRing({ value, max, size = 72, stroke = 7, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div className="m-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="m-ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle
          className="m-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="m-ring-label">{children}</div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Kabinet', icon: 'home' },
  { id: 'topic_1_1', label: 'Mövzu 1.1', icon: 'layers' },
  { id: 'topic_1_2', label: 'Mövzu 1.2', icon: 'layers' },
  { id: 'topics', label: 'Çərçivə', icon: 'map' },
  { id: 'mistakes', label: 'Səhvlər', icon: 'notebook' }
];

const BANKS = [
  { name: 'Güvən 2025', tone: 'indigo' },
  { name: 'Dərslik Bazası', tone: 'sky' },
  { name: 'Müəllim Sınağı', tone: 'teal' }
];

const BANK_TONE = Object.fromEntries(BANKS.map((b) => [b.name, b.tone]));

const STATUS_TEXT = {
  completed: 'Bitib',
  in_progress: 'Davam edir',
  not_started: 'Yeni'
};

export default function App() {
  // Top-level portal navigation when logged in:
  // 'dashboard' | 'topics' | 'topic_detail' | 'mistakes'
  const [portalView, setPortalView] = useState('dashboard');
  const [selectedTopicId, setSelectedTopicId] = useState('1.2');
  // Tabs inside Topic Hub: 'guven' | 'textbook' | 'teacher' | 'study' | 'flashcards' | 'analytics'
  const [hubTab, setHubTab] = useState('guven');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mode, setMode] = useState('study'); // 'study' | 'exam'
  const [questions, setQuestions] = useState(QUIZ_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Dashboard filter for test packs: 'ALL' | 'in_progress' | 'completed' | 'not_started'
  const [dashPackFilter, setDashPackFilter] = useState('ALL');
  // Dashboard topic filter: 'ALL' | '1.1' | '1.2'
  const [dashTopicFilter, setDashTopicFilter] = useState('ALL');

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

  const isTeacherVariant =
    selectedVariant && (selectedVariant.startsWith('GF-') || selectedVariant.startsWith('T2-GF-'));
  const isGuvenVariant =
    selectedVariant && (selectedVariant.startsWith('GV-') || selectedVariant.startsWith('T2-GV-'));

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
    if (varCode === 'ALL') return 'Mövzu 1.1 • Dərslik Bazası (80 Sual)';
    if (varCode === 'MEGA') return 'Mövzu 1.1 • Dərslik Qarışıq Sınaq (20 Sual)';
    if (varCode === 'GF-ALL') return 'Mövzu 1.1 • Müəllim Bazası (165 Sual)';
    if (varCode === 'GF-MEGA') return 'Mövzu 1.1 • Müəllim Qarışıq Sınaq (25 Sual)';
    if (varCode === 'GV-ALL') return 'Mövzu 1.1 • Güvən 2025 Tam Baza (95 Sual)';
    if (varCode === 'GV-MEGA') return 'Mövzu 1.1 • Güvən 2025 Qarışıq Sınaq (25 Sual)';
    if (varCode === 'T2-ALL') return 'Mövzu 1.2 • Dərslik Bazası (80 Sual)';
    if (varCode === 'T2-MEGA') return 'Mövzu 1.2 • Dərslik Qarışıq Sınaq (20 Sual)';
    if (varCode === 'T2-GF-ALL') return 'Mövzu 1.2 • Müəllim Bazası (70 Sual)';
    if (varCode === 'T2-GF-MEGA') return 'Mövzu 1.2 • Müəllim Qarışıq Sınaq (25 Sual)';
    if (varCode === 'T2-GV-ALL') return 'Mövzu 1.2 • Güvən 2025 Tam Baza (212 Sual)';
    if (varCode === 'T2-GV-MEGA') return 'Mövzu 1.2 • Güvən 2025 Qarışıq Sınaq (30 Sual)';
    if (varCode === 'WRONG-ALL') return 'Səhv Dəftəri Təkrarı';
    if (varCode.startsWith('T2-GF-')) {
      const found = teacherQuizzesTopic1_2.find((tq) => tq.shortCode === varCode);
      return found ? found.title : varCode;
    }
    if (varCode.startsWith('T2-GV-')) {
      const found = GUVEN_QUIZZES_1_2.find((gq) => gq.shortCode === varCode);
      return found ? found.title : varCode;
    }
    if (varCode.startsWith('T2-')) {
      const found = VARIANTS_META_1_2.find((vm) => vm.code === varCode);
      return found ? `${found.name} — ${found.subtitle}` : `Mövzu 1.2 — ${varCode}`;
    }
    if (varCode.startsWith('GF-')) {
      const found = teacherQuizzesTopic1.find((tq) => tq.shortCode === varCode);
      return found ? found.title : varCode;
    }
    if (varCode.startsWith('GV-')) {
      const found = GUVEN_QUIZZES.find((gq) => gq.shortCode === varCode);
      return found ? found.title : varCode;
    }
    return `Mövzu 1.1 • Dərslik — Variant ${varCode}`;
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
    if (varCode === 'T2-ALL') return QUIZ_QUESTIONS_1_2;
    if (varCode === 'T2-GF-ALL') return ALL_TEACHER_QUESTIONS_1_2;
    if (varCode === 'T2-GV-ALL') return ALL_GUVEN_QUESTIONS_1_2;
    if (varCode === 'WRONG-ALL') {
      return ALL_COMBINED_QUESTIONS.filter((q) => userAnswers[q.id] && userAnswers[q.id] !== q.correct);
    }
    if (varCode.startsWith('T2-GF-')) {
      const found = teacherQuizzesTopic1_2.find((tq) => tq.shortCode === varCode);
      return found ? found.questions : ALL_TEACHER_QUESTIONS_1_2;
    }
    if (varCode.startsWith('T2-GV-')) {
      const found = GUVEN_QUIZZES_1_2.find((gq) => gq.shortCode === varCode);
      return found ? found.questions : ALL_GUVEN_QUESTIONS_1_2;
    }
    if (varCode.startsWith('T2-')) {
      return QUIZ_QUESTIONS_1_2.filter((q) => q.variant === varCode);
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
    const isTopic2 = varCode && varCode.startsWith('T2-');
    if (varCode !== 'WRONG-ALL') {
      setSelectedTopicId(isTopic2 ? '1.2' : '1.1');
    }
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
    } else if (varCode === 'T2-ALL') {
      targetList = QUIZ_QUESTIONS_1_2;
      setTimeLeft(100 * 60);
    } else if (varCode === 'T2-MEGA') {
      const qA = shuffleArray(QUIZ_QUESTIONS_1_2.filter((q) => q.variant === 'T2-A')).slice(0, 5);
      const qB = shuffleArray(QUIZ_QUESTIONS_1_2.filter((q) => q.variant === 'T2-B')).slice(0, 5);
      const qC = shuffleArray(QUIZ_QUESTIONS_1_2.filter((q) => q.variant === 'T2-C')).slice(0, 5);
      const qD = shuffleArray(QUIZ_QUESTIONS_1_2.filter((q) => q.variant === 'T2-D')).slice(0, 5);
      targetList = shuffleArray([...qA, ...qB, ...qC, ...qD]);
      setTimeLeft(25 * 60);
    } else if (varCode === 'T2-GF-ALL') {
      targetList = ALL_TEACHER_QUESTIONS_1_2;
      setTimeLeft(85 * 60);
    } else if (varCode === 'T2-GF-MEGA') {
      targetList = shuffleArray(ALL_TEACHER_QUESTIONS_1_2).slice(0, 25);
      setTimeLeft(30 * 60);
    } else if (varCode.startsWith('T2-GF-')) {
      const found = teacherQuizzesTopic1_2.find((tq) => tq.shortCode === varCode);
      targetList = found ? found.questions : ALL_TEACHER_QUESTIONS_1_2;
      setTimeLeft(Math.max(20, targetList.length) * 60);
    } else if (varCode === 'T2-GV-ALL') {
      targetList = ALL_GUVEN_QUESTIONS_1_2;
      setTimeLeft(220 * 60);
    } else if (varCode === 'T2-GV-MEGA') {
      targetList = shuffleArray(ALL_GUVEN_QUESTIONS_1_2).slice(0, 30);
      setTimeLeft(35 * 60);
    } else if (varCode.startsWith('T2-GV-')) {
      const found = GUVEN_QUIZZES_1_2.find((gq) => gq.shortCode === varCode);
      targetList = found ? found.questions : ALL_GUVEN_QUESTIONS_1_2;
      setTimeLeft(Math.max(25, targetList.length) * 60);
    } else if (varCode.startsWith('T2-')) {
      targetList = QUIZ_QUESTIONS_1_2.filter((q) => q.variant === varCode);
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
        topicId: '1.1',
        code: gq.shortCode,
        bankName: 'Güvən 2025',
        badgeText: `M1.1 • ${gq.code}`,
        badgeClass: 'badge-indigo',
        title: gq.title,
        subtitleExtra: `${gq.questionCount} sual (${gq.imageCount} sxemli)`,
        questions: gq.questions
      })),
      ...VARIANTS_META.map((vm) => ({
        topicId: '1.1',
        code: vm.code,
        bankName: 'Dərslik Bazası',
        badgeText: `M1.1 • ${vm.name}`,
        badgeClass: '',
        title: vm.subtitle,
        subtitleExtra: `${vm.qCount} sual`,
        questions: QUIZ_QUESTIONS.filter((q) => q.variant === vm.code)
      })),
      ...teacherQuizzesTopic1.map((tq, idx) => ({
        topicId: '1.1',
        code: tq.shortCode,
        bankName: 'Müəllim Sınağı',
        badgeText: `M1.1 • Sınaq ${idx + 1}`,
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

  const allTopic1_2PacksSummary = useMemo(() => {
    const packs = [
      ...GUVEN_QUIZZES_1_2.map((gq) => ({
        topicId: '1.2',
        code: gq.shortCode,
        bankName: 'Güvən 2025',
        badgeText: `M1.2 • ${gq.code}`,
        badgeClass: 'badge-indigo',
        title: gq.title,
        subtitleExtra: `${gq.questionCount} sual (${gq.imageCount} sxemli)`,
        questions: gq.questions
      })),
      ...VARIANTS_META_1_2.map((vm) => ({
        topicId: '1.2',
        code: vm.code,
        bankName: 'Dərslik Bazası',
        badgeText: vm.name,
        badgeClass: '',
        title: vm.subtitle,
        subtitleExtra: `${vm.qCount} sual`,
        questions: QUIZ_QUESTIONS_1_2.filter((q) => q.variant === vm.code)
      })),
      ...teacherQuizzesTopic1_2.map((tq, idx) => ({
        topicId: '1.2',
        code: tq.shortCode,
        bankName: 'Müəllim Sınağı',
        badgeText: `M1.2 • Sınaq ${idx + 1}`,
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

  const allPacksSummary = useMemo(
    () => [...allTopic1_2PacksSummary, ...allTopic1PacksSummary],
    [allTopic1_2PacksSummary, allTopic1PacksSummary]
  );

  const activeTopicPacksSummary = selectedTopicId === '1.2' ? allTopic1_2PacksSummary : allTopic1PacksSummary;

  const dashTopicScopedPacks = useMemo(() => {
    if (dashTopicFilter === '1.1') return allTopic1PacksSummary;
    if (dashTopicFilter === '1.2') return allTopic1_2PacksSummary;
    return allPacksSummary;
  }, [dashTopicFilter, allTopic1PacksSummary, allTopic1_2PacksSummary, allPacksSummary]);

  const completedPacksCount = dashTopicScopedPacks.filter((p) => p.statusType === 'completed').length;
  const inProgressPacks = dashTopicScopedPacks.filter((p) => p.statusType === 'in_progress');
  const notStartedPacksCount = dashTopicScopedPacks.filter((p) => p.statusType === 'not_started').length;

  const filteredDashboardPacks = useMemo(() => {
    if (dashPackFilter === 'ALL') return dashTopicScopedPacks;
    return dashTopicScopedPacks.filter((p) => p.statusType === dashPackFilter);
  }, [dashTopicScopedPacks, dashPackFilter]);

  const currentTopicTextbookQuestions = selectedTopicId === '1.2' ? QUIZ_QUESTIONS_1_2 : QUIZ_QUESTIONS;
  const currentTopicChapters = selectedTopicId === '1.2' ? TOPIC_1_2_CHAPTERS : TOPIC_1_CHAPTERS;
  const currentTopicAudio = selectedTopicId === '1.2' ? TOPIC_1_2_AUDIO : TOPIC_1_AUDIO;
  const currentTopicFlashcards = selectedTopicId === '1.2' ? TOPIC_1_2_FLASHCARDS : TOPIC_1_FLASHCARDS;

  const categoryAnalytics = useMemo(() => {
    const catMap = {};
    currentTopicTextbookQuestions.forEach((q) => {
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
  }, [userAnswers, currentTopicTextbookQuestions]);

  const filteredChapters = useMemo(() => {
    return currentTopicChapters.filter((ch) => {
      const matchId = activeChapterId === 'ALL' || ch.id === activeChapterId;
      const matchQuery =
        !studySearch.trim() ||
        ch.title.toLowerCase().includes(studySearch.toLowerCase()) ||
        ch.html.toLowerCase().includes(studySearch.toLowerCase());
      return matchId && matchQuery;
    });
  }, [activeChapterId, studySearch, currentTopicChapters]);

  const filteredFlashcards = useMemo(() => {
    return currentTopicFlashcards.filter((fc) => {
      if (fcCategory === 'ALL') return true;
      if (fcCategory === 'REVIEW') return fcStatus[fc.id] === 'review';
      if (fcCategory === 'KNOWN') return fcStatus[fc.id] === 'known';
      return fc.category === fcCategory;
    });
  }, [fcCategory, fcStatus, currentTopicFlashcards]);

  const currentFlashcard = filteredFlashcards[fcIndex] || filteredFlashcards[0] || null;
  const knownFlashcardsCount1_1 = TOPIC_1_FLASHCARDS.filter((fc) => fcStatus[fc.id] === 'known').length;
  const reviewFlashcardsCount1_1 = TOPIC_1_FLASHCARDS.filter((fc) => fcStatus[fc.id] === 'review').length;
  const knownFlashcardsCount1_2 = TOPIC_1_2_FLASHCARDS.filter((fc) => fcStatus[fc.id] === 'known').length;
  const reviewFlashcardsCount1_2 = TOPIC_1_2_FLASHCARDS.filter((fc) => fcStatus[fc.id] === 'review').length;

  const knownFlashcardsCount = selectedTopicId === '1.2' ? knownFlashcardsCount1_2 : knownFlashcardsCount1_1;
  const reviewFlashcardsCount = selectedTopicId === '1.2' ? reviewFlashcardsCount1_2 : reviewFlashcardsCount1_1;

  const totalTextbookAnswered1_1 = QUIZ_QUESTIONS.filter((q) => userAnswers[q.id]).length;
  const totalTeacherAnswered1_1 = ALL_TEACHER_QUESTIONS.filter((q) => userAnswers[q.id]).length;
  const totalGuvenAnswered1_1 = ALL_GUVEN_QUESTIONS.filter((q) => userAnswers[q.id]).length;

  const totalTextbookAnswered1_2 = QUIZ_QUESTIONS_1_2.filter((q) => userAnswers[q.id]).length;
  const totalTeacherAnswered1_2 = ALL_TEACHER_QUESTIONS_1_2.filter((q) => userAnswers[q.id]).length;
  const totalGuvenAnswered1_2 = ALL_GUVEN_QUESTIONS_1_2.filter((q) => userAnswers[q.id]).length;

  const totalTextbookAnswered = selectedTopicId === '1.2' ? totalTextbookAnswered1_2 : totalTextbookAnswered1_1;
  const totalTeacherAnswered = selectedTopicId === '1.2' ? totalTeacherAnswered1_2 : totalTeacherAnswered1_1;
  const totalGuvenAnswered = selectedTopicId === '1.2' ? totalGuvenAnswered1_2 : totalGuvenAnswered1_1;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Picks what the "continue" card should offer: the last opened quiz,
  // otherwise the first unfinished pack, otherwise the first new one.
  const getContinueTarget = () => {
    if (lastActiveQuiz?.variant) {
      const st = computeQuizRowStatus(lastActiveQuiz.variant, getBaseListForVariant(lastActiveQuiz.variant));
      if (st.statusType !== 'completed') {
        return {
          code: lastActiveQuiz.variant,
          mode: lastActiveQuiz.mode || 'study',
          index: lastActiveQuiz.index || 0,
          title: lastActiveQuiz.title || getQuizTitleByCode(lastActiveQuiz.variant),
          eyebrow: 'Qaldığın yerdən davam et',
          ...st
        };
      }
    }
    const pool = portalView === 'topic_detail' ? activeTopicPacksSummary : allPacksSummary;
    const next =
      pool.find((p) => p.statusType === 'in_progress') ||
      pool.find((p) => p.statusType === 'not_started');
    if (!next) return null;
    return {
      code: next.code,
      mode: 'study',
      index: next.resumeIdx,
      title: next.title,
      eyebrow: next.statusType === 'in_progress' ? 'Yarımçıq test' : 'Növbəti test',
      ...next
    };
  };

  const renderContinueCard = (compact = false) => {
    const t = getContinueTarget();
    if (!t) return null;
    const started = t.answered > 0 || t.index > 0;
    return (
      <section className={`m-continue ${compact ? 'is-compact' : ''}`}>
        <div className="m-continue-body">
          <span className="m-eyebrow m-eyebrow-light">{t.eyebrow}</span>
          <h2 className="m-continue-title">{t.title}</h2>
          <div className="m-continue-meta">
            <span>
              Sual {Math.min(t.index + 1, t.total)} / {t.total}
            </span>
            <span>•</span>
            <span>{t.pct}% cavablanıb</span>
            {t.answered > 0 && (
              <>
                <span>•</span>
                <span>
                  {t.correct} düz, {t.wrong} səhv
                </span>
              </>
            )}
          </div>
          <div className="m-bar m-bar-light">
            <div className="m-bar-fill" style={{ width: `${t.pct}%` }} />
          </div>
        </div>
        <button className="m-btn m-btn-white m-btn-lg" onClick={() => handleSelectVariant(t.code, t.mode, t.index)}>
          {started ? 'Davam et' : 'Başla'}
          <Icon name="arrowRight" size={18} />
        </button>
      </section>
    );
  };

  const renderPackCard = (p) => {
    const tone = BANK_TONE[p.bankName] || 'sky';
    const primaryLabel =
      p.statusType === 'in_progress'
        ? `Davam et · ${p.resumeIdx + 1}`
        : p.statusType === 'completed'
        ? 'Nəticəyə bax'
        : 'Başla';
    return (
      <article key={p.code} className={`m-pack is-${p.statusType}`}>
        <div className="m-pack-head">
          <span className={`m-chip tone-${tone}`}>{p.badgeText}</span>
          <span className={`m-status is-${p.statusType}`}>{STATUS_TEXT[p.statusType]}</span>
        </div>
        <h3 className="m-pack-title">{p.title}</h3>
        <p className="m-pack-meta">{p.subtitleExtra}</p>

        <div className="m-pack-progress">
          <div className="m-bar">
            <div className={`m-bar-fill is-${p.statusType}`} style={{ width: `${p.pct}%` }} />
          </div>
          <span className="m-pack-count">
            {p.answered}/{p.total}
          </span>
        </div>
        <div className="m-pack-score">
          {p.answered > 0 ? (
            <>
              <span className="m-good">{p.correct} düz</span>
              <span className="m-bad">{p.wrong} səhv</span>
              <span>{p.unanswered} boş</span>
            </>
          ) : (
            <span>Hələ başlanmayıb</span>
          )}
        </div>

        <div className="m-pack-actions">
          <button
            className={`m-btn ${p.statusType === 'in_progress' ? 'm-btn-amber' : 'm-btn-primary'}`}
            onClick={() => handleSelectVariant(p.code, 'study', p.statusType === 'in_progress' ? p.resumeIdx : 0)}
          >
            {primaryLabel}
          </button>
          <button
            className="m-btn m-btn-ghost"
            title="Vaxtlı sınaq rejimində başla"
            onClick={() => handleSelectVariant(p.code, 'exam', 0)}
          >
            <Icon name="clock" size={15} />
            Sınaq
          </button>
          {p.answered > 0 && (
            <button
              className="m-icon-btn m-icon-danger"
              title="Bu testin cavablarını sıfırla"
              aria-label="Sıfırla"
              onClick={() => handleResetSpecificVariant(p.code, p.questions)}
            >
              <Icon name="reset" size={16} />
            </button>
          )}
        </div>
      </article>
    );
  };

  const renderPackGrid = (packs) =>
    packs.length > 0 ? (
      <div className="m-pack-grid">{packs.map(renderPackCard)}</div>
    ) : (
      <div className="m-empty">Bu filtr üzrə test yoxdur.</div>
    );

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
                <strong>702 İnteraktiv Test Sualı (Mövzu 1.1 və Mövzu 1.2)</strong>
                <span>Güvən 2025 (307 sual), Dərslik Bazası (160 sual) və Osman Müəllim Sınaqları (235 sual)</span>
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


  const displayFirstName = profileCreds.displayName.split(' (')[0];
  const answeredInQuiz = questions.filter((q) => userAnswers[q.id]).length;
  const syncLabel =
    syncStatus === 'syncing' ? 'Sinxronlaşır…' : syncStatus === 'error' ? 'Bağlantı xətası' : 'Yadda saxlanılıb';

  const switchTopic = (topId) => {
    setSelectedTopicId(topId);
    setActiveChapterId('ALL');
    setStudySearch('');
    setFcCategory('ALL');
    setFcIndex(0);
    setFcFlipped(false);
  };

  const goTo = (view) => {
    if (view === 'topic_1_1') {
      switchTopic('1.1');
      setPortalView('topic_detail');
    } else if (view === 'topic_1_2') {
      switchTopic('1.2');
      setPortalView('topic_detail');
    } else {
      setPortalView(view);
    }
    window.scrollTo({ top: 0 });
  };

  const isNavItemActive = (itemId) => {
    if (itemId === 'topic_1_1') return portalView === 'topic_detail' && selectedTopicId === '1.1';
    if (itemId === 'topic_1_2') return portalView === 'topic_detail' && selectedTopicId === '1.2';
    return portalView === itemId;
  };

  const PAGE_HEADINGS = {
    dashboard: {
      title: `Salam, ${displayFirstName.split(' ')[0]}`,
      sub: 'Mövzu 1.1 (340 sual) və Mövzu 1.2 (362 sual) üzrə hazırlığının ümumi görünüşü'
    },
    topic_detail:
      selectedTopicId === '1.2'
        ? {
            title: 'Mövzu 1.2',
            sub: 'Məkan, Miqyas, Plan, Azimut, Paletka və Horizontallar (362 sual • 8 fəsil • 70 kart)'
          }
        : {
            title: 'Mövzu 1.1',
            sub: 'Coğrafi kəşflər və tədqiqatlar, coğrafiya elminin inkişafı (340 sual • 8 fəsil • 65 kart)'
          },
    topics: { title: 'Rəsmi çərçivə', sub: 'MİQ qiymətləndirmə çərçivəsi üzrə mövzular' },
    mistakes: { title: 'Səhv dəftəri', sub: `${allWrongQuestions.length} sual təkrar gözləyir` }
  };
  const heading = PAGE_HEADINGS[portalView] || PAGE_HEADINGS.dashboard;

  const totalCompletedAllPacks = allPacksSummary.filter((p) => p.statusType === 'completed').length;
  const completed1_1Packs = allTopic1PacksSummary.filter((p) => p.statusType === 'completed').length;
  const completed1_2Packs = allTopic1_2PacksSummary.filter((p) => p.statusType === 'completed').length;

  const navBadge = (id) => {
    if (id === 'dashboard') return `${totalCompletedAllPacks}/${allPacksSummary.length}`;
    if (id === 'topic_1_1') return `${completed1_1Packs}/12`;
    if (id === 'topic_1_2') return `${completed1_2Packs}/13`;
    if (id === 'mistakes' && allWrongQuestions.length > 0) return allWrongQuestions.length;
    return null;
  };

  const guvenTotalForTopic = selectedTopicId === '1.2' ? 212 : 95;
  const teacherTotalForTopic = selectedTopicId === '1.2' ? 70 : 165;
  const fcTotalForTopic = selectedTopicId === '1.2' ? TOPIC_1_2_FLASHCARDS.length : TOPIC_1_FLASHCARDS.length;

  const HUB_TABS = [
    { id: 'guven', label: 'Güvən 2025', count: `${totalGuvenAnswered}/${guvenTotalForTopic}` },
    { id: 'textbook', label: 'Dərslik', count: `${totalTextbookAnswered}/80` },
    { id: 'teacher', label: 'Müəllim', count: `${totalTeacherAnswered}/${teacherTotalForTopic}` },
    { id: 'study', label: 'Konspekt', count: '8 fəsil' },
    { id: 'flashcards', label: 'Kartlar', count: `${knownFlashcardsCount}/${fcTotalForTopic}` },
    { id: 'analytics', label: 'Diaqnostika' }
  ];

  const BANK_TABS =
    selectedTopicId === '1.2'
      ? {
          guven: {
            bank: 'Güvən 2025',
            title: 'Güvən 2025 test bankı (Mövzu 1.2)',
            sub: 'Bölmə 2 (Miqyas və Plan • 115 sual) + Bölmə 3 (Azimut və Horizontallar • 97 sual)',
            mega: { code: 'T2-GV-MEGA', label: 'Qarışıq sınaq · 30' },
            all: { code: 'T2-GV-ALL', label: 'Hamısı · 212' }
          },
          textbook: {
            bank: 'Dərslik Bazası',
            title: 'Dərslik bazası (Mövzu 1.2)',
            sub: '6, 7, 8, 9, 10 və 11-ci sinif dərslikləri və metodik vəsaitlər əsasında (Variant A, B, C, D)',
            mega: { code: 'T2-MEGA', label: 'Qarışıq sınaq · 20' },
            all: { code: 'T2-ALL', label: 'Hamısı · 80' }
          },
          teacher: {
            bank: 'Müəllim Sınağı',
            title: 'Osman müəllim sınaqları (Plan bölməsi)',
            sub: 'Dərs qrupunda paylaşılan 3 Google Forms sınağı (50 + 10 + 10 sual)',
            mega: { code: 'T2-GF-MEGA', label: 'Qarışıq sınaq · 25' },
            all: { code: 'T2-GF-ALL', label: 'Hamısı · 70' }
          }
        }
      : {
          guven: {
            bank: 'Güvən 2025',
            title: 'Güvən 2025 test bankı (Mövzu 1.1)',
            sub: '«Tapşırıqlar Toplusu 2025» — A, B, C qrup və açıq tapşırıqlar',
            mega: { code: 'GV-MEGA', label: 'Qarışıq sınaq · 25' },
            all: { code: 'GV-ALL', label: 'Hamısı · 95' }
          },
          textbook: {
            bank: 'Dərslik Bazası',
            title: 'Dərslik bazası (Mövzu 1.1)',
            sub: '6–11-ci sinif dərslikləri və metodik vəsaitlər əsasında',
            mega: { code: 'MEGA', label: 'Qarışıq sınaq · 20' },
            all: { code: 'ALL', label: 'Hamısı · 80' }
          },
          teacher: {
            bank: 'Müəllim Sınağı',
            title: 'Osman müəllim sınaqları (Mövzu 1.1)',
            sub: 'Dərs qrupunda paylaşılan 4 sınaq',
            mega: { code: 'GF-MEGA', label: 'Qarışıq sınaq · 25' },
            all: { code: 'GF-ALL', label: 'Hamısı · 165' }
          }
        };

  const PACK_FILTERS = [
    { id: 'ALL', label: 'Hamısı', count: dashTopicScopedPacks.length },
    { id: 'in_progress', label: 'Davam edən', count: inProgressPacks.length },
    { id: 'completed', label: 'Bitmiş', count: completedPacksCount },
    { id: 'not_started', label: 'Yeni', count: notStartedPacksCount }
  ];

  const FLASHCARD_CATEGORY_TABS =
    selectedTopicId === '1.2'
      ? [
          { id: 'ALL', label: 'Hamısı', count: TOPIC_1_2_FLASHCARDS.length },
          { id: '1. Məkan və Məkanın Miqyası (6–8-ci siniflər)', label: 'Məkan və Miqyas', count: 25 },
          { id: '2. Coğrafi Mövqe və 4-lü/6-lı Şəbəkə (7-ci sinif)', label: 'Mövqe və Şəbəkə', count: 20 },
          {
            id: '3. Kartoqrafik Miqyas, Plan, Azimut, Paletka və Horizontallar',
            label: 'Plan, Azimut, Horizontal',
            count: 25
          },
          { id: 'REVIEW', label: 'Təkrar', count: reviewFlashcardsCount },
          { id: 'KNOWN', label: 'Bilirəm', count: knownFlashcardsCount }
        ]
      : [
          { id: 'ALL', label: 'Hamısı', count: TOPIC_1_FLASHCARDS.length },
          { id: '1. Coğrafi kəşflər və tədqiqatlar', label: 'Kəşflər', count: 25 },
          { id: '2. Azərbaycanda coğrafiya elminin inkişafı', label: 'Azərbaycan', count: 20 },
          {
            id: '3. Coğrafiya elminin sahələri və müasir coğrafi biliklərin əldə edilməsi',
            label: 'Sahələr və CİS',
            count: 20
          },
          { id: 'REVIEW', label: 'Təkrar', count: reviewFlashcardsCount },
          { id: 'KNOWN', label: 'Bilirəm', count: knownFlashcardsCount }
        ];

  return (
    <div className={`m-app ${selectedVariant !== null ? 'is-quiz' : ''}`}>
      {/* ======================== SIDEBAR (desktop) ======================== */}
      {selectedVariant === null && (
        <aside className="m-sidebar">
          <div className="m-brand">
            <span className="m-brand-mark">M</span>
            <div>
              <strong>MİQ Coğrafiya</strong>
              <span>90+ hədəf</span>
            </div>
          </div>

          <nav className="m-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`m-nav-item ${isNavItemActive(item.id) ? 'active' : ''}`}
                onClick={() => goTo(item.id)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {navBadge(item.id) !== null && <em className="m-nav-badge">{navBadge(item.id)}</em>}
              </button>
            ))}
          </nav>

          <div className="m-user">
            <span className="m-avatar">{displayFirstName.charAt(0).toUpperCase()}</span>
            <div className="m-user-text">
              <strong>{displayFirstName}</strong>
              <span>
                <i className={`m-dot dot-${syncStatus}`} />
                {syncLabel}
              </span>
            </div>
            <button className="m-icon-btn" title="Çıxış" aria-label="Çıxış" onClick={handleProfileLogout}>
              <Icon name="logout" size={16} />
            </button>
          </div>
        </aside>
      )}

      <div className="m-main">
        {selectedVariant !== null ? (
          /* ======================== QUIZ TOP BAR ======================== */
          <header className="m-quizbar">
            <div className="m-quizbar-inner">
              <button className="m-btn m-btn-ghost" onClick={() => setSelectedVariant(null)} title="Nəticə yadda saxlanılır">
                <Icon name="arrowLeft" size={16} />
                <span className="m-hide-sm">Çıx</span>
              </button>
              <div className="m-quizbar-title">
                <span className="m-eyebrow">{mode === 'exam' ? 'Vaxtlı sınaq' : 'Təlim rejimi'}</span>
                <strong>{getQuizTitleByCode(selectedVariant)}</strong>
              </div>
              <div className="m-seg">
                <button
                  className={mode === 'study' ? 'active' : ''}
                  onClick={() => {
                    setMode('study');
                    setExamSubmitted(false);
                  }}
                >
                  Təlim
                </button>
                <button
                  className={mode === 'exam' ? 'active' : ''}
                  onClick={() => {
                    setMode('exam');
                    setExamSubmitted(false);
                  }}
                >
                  Sınaq
                </button>
              </div>
              {mode === 'exam' && !examSubmitted && (
                <span className={`m-timer ${timeLeft < 300 ? 'is-urgent' : ''}`}>
                  <Icon name="clock" size={15} />
                  {formatTime(timeLeft)}
                </span>
              )}
            </div>
            <div className="m-quiz-progress">
              <div style={{ width: `${questions.length ? (answeredInQuiz / questions.length) * 100 : 0}%` }} />
            </div>
          </header>
        ) : (
          /* ======================== PAGE TOP BAR ======================== */
          <header className="m-topbar">
            <div>
              <h1 className="m-page-title">{heading.title}</h1>
              <p className="m-page-sub">{heading.sub}</p>
            </div>
            <div className="m-topbar-right">
              <span className="m-sync-chip">
                <i className={`m-dot dot-${syncStatus}`} />
                {syncLabel}
              </span>
              <button className="m-icon-btn m-show-sm" title="Çıxış" aria-label="Çıxış" onClick={handleProfileLogout}>
                <Icon name="logout" size={16} />
              </button>
            </div>
          </header>
        )}

        <main className="m-content">
          {selectedVariant !== null ? (
            /* ======================== ACTIVE QUIZ ======================== */
            <div className="m-quiz">
              <div className="m-quiz-tools">
                <div className="m-quiz-stats">
                  <span>
                    Sual <b>{currentIndex + 1}</b> / {questions.length}
                  </span>
                  {(mode === 'study' || examSubmitted) && (
                    <>
                      <span className="m-good">{stats.correct} düz</span>
                      <span className="m-bad">{stats.wrong} səhv</span>
                    </>
                  )}
                  {mode === 'exam' && !examSubmitted && <span>{answeredInQuiz} cavablanıb</span>}
                </div>
                <div className="m-tool-btns">
                  <button
                    className={`m-btn m-btn-ghost ${showQuestionDrawer ? 'is-on' : ''}`}
                    onClick={() => setShowQuestionDrawer(!showQuestionDrawer)}
                  >
                    <Icon name="grid" size={15} />
                    <span className="m-hide-sm">Suallar</span>
                  </button>
                  <button className="m-icon-btn" title="Qarışdır" aria-label="Qarışdır" onClick={handleShuffle}>
                    <Icon name="shuffle" size={16} />
                  </button>
                  <button
                    className="m-icon-btn m-icon-danger"
                    title="Cavabları sıfırla"
                    aria-label="Sıfırla"
                    onClick={handleResetCurrent}
                  >
                    <Icon name="reset" size={16} />
                  </button>
                </div>
              </div>

              {showQuestionDrawer && (
                <div className="m-panel m-drawer">
                  <div className="m-drawer-head">
                    <div className="m-legend">
                      <span><i className="lg-correct" />Düz</span>
                      <span><i className="lg-wrong" />Səhv</span>
                      <span><i className="lg-empty" />Boş</span>
                    </div>
                    <button className="m-icon-btn" aria-label="Bağla" onClick={() => setShowQuestionDrawer(false)}>
                      <Icon name="x" size={16} />
                    </button>
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
                <div className="m-panel m-results">
                  <span className="m-eyebrow">MİQ qaydası ilə nəticə (4 səhv = 1 düz)</span>
                  <ProgressRing value={Number(stats.miqScore80)} max={80} size={132} stroke={11}>
                    <strong>{stats.miqScore80}</strong>
                    <span>/ 80 bal</span>
                  </ProgressRing>
                  <p className="m-results-sub">
                    {questions.length} sualdan xalis düz: <b>{stats.netCorrect}</b> ({stats.percentage}%)
                  </p>
                  <div className="m-results-stats">
                    <div className="is-good">
                      <strong>{stats.correct}</strong>
                      <span>Düz</span>
                    </div>
                    <div className="is-bad">
                      <strong>{stats.wrong}</strong>
                      <span>Səhv</span>
                    </div>
                    <div>
                      <strong>{stats.unanswered}</strong>
                      <span>Boş</span>
                    </div>
                  </div>
                  <div className="m-results-actions">
                    {stats.wrong > 0 && (
                      <button className="m-btn m-btn-primary" onClick={handleRetestWrong}>
                        Səhvləri təkrar işlə ({stats.wrong})
                      </button>
                    )}
                    <button
                      className="m-btn m-btn-ghost"
                      onClick={() => {
                        setExamSubmitted(false);
                        setCurrentIndex(0);
                        setMode('study');
                      }}
                    >
                      İzahlara bax
                    </button>
                    <button className="m-btn m-btn-ghost" onClick={() => setSelectedVariant(null)}>
                      Kabinetə qayıt
                    </button>
                  </div>
                </div>
              ) : (
                currentQ && (
                  <div className="m-panel m-question">
                    <div className="m-question-meta">
                      <span className="m-chip tone-sky">
                        {isGuvenVariant
                          ? `Güvən 2025 · Sual ${currentQ.num || currentIndex + 1}`
                          : isTeacherVariant
                          ? 'Müəllim sınağı'
                          : `Variant ${currentQ.variant}`}
                      </span>
                      <span className="m-muted">
                        {currentIndex + 1} / {questions.length}
                      </span>
                    </div>

                    <h2 className="m-question-text">{currentQ.question}</h2>

                    {currentQ.image && (
                      <div className="m-question-image">
                        <img src={currentQ.image} alt={`Sual ${currentIndex + 1}`} loading="lazy" />
                      </div>
                    )}

                    <div className="m-options">
                      {currentQ.options.map((opt) => {
                        const letter = opt.substring(0, 1);
                        const chosen = userAnswers[currentQ.id];
                        const isSelected = chosen === letter;
                        const isCorrect = letter === currentQ.correct;

                        let optClass = '';
                        if (mode === 'study' && chosen) {
                          if (isSelected) optClass = isCorrect ? 'is-correct' : 'is-wrong';
                          else if (isCorrect) optClass = 'is-revealed';
                          else optClass = 'is-dim';
                        } else if (isSelected) {
                          optClass = 'is-selected';
                        }

                        return (
                          <button
                            key={letter}
                            className={`m-option ${optClass}`}
                            onClick={() => handleSelectOption(currentQ.id, letter)}
                          >
                            <span className="m-option-letter">{letter}</span>
                            <span className="m-option-text">{opt.substring(3)}</span>
                          </button>
                        );
                      })}
                    </div>

                    {mode === 'study' && (showExplanation[currentQ.id] || userAnswers[currentQ.id]) && (
                      <div
                        className={`m-explain ${userAnswers[currentQ.id] === currentQ.correct ? 'is-pass' : 'is-fail'}`}
                      >
                        <strong>
                          {userAnswers[currentQ.id] === currentQ.correct
                            ? `Düzdür — cavab ${currentQ.correct}`
                            : `Səhvdir — düzgün cavab ${currentQ.correct}${
                                userAnswers[currentQ.id] ? ` (seçimin: ${userAnswers[currentQ.id]})` : ''
                              }`}
                        </strong>
                        <p>{currentQ.explanation}</p>
                      </div>
                    )}

                    <div className="m-question-nav">
                      <button
                        className="m-btn m-btn-ghost"
                        disabled={currentIndex === 0}
                        onClick={() => {
                          setCurrentIndex((prev) => Math.max(0, prev - 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <Icon name="arrowLeft" size={16} />
                        Əvvəlki
                      </button>

                      {mode === 'exam' && (
                        <button
                          className="m-btn m-btn-danger"
                          onClick={() => {
                            if (window.confirm('İmtahanı bitirmək istədiyinizdən əminsiniz?')) {
                              handleFinishExam();
                            }
                          }}
                        >
                          <Icon name="flag" size={15} />
                          Bitir
                        </button>
                      )}

                      <button
                        className="m-btn m-btn-primary"
                        disabled={currentIndex === questions.length - 1}
                        onClick={() => {
                          setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        Növbəti
                        <Icon name="arrowRight" size={16} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : portalView === 'dashboard' ? (
            /* ======================== DASHBOARD ======================== */
            <div className="m-stack">
              {renderContinueCard()}

              <div className="m-stats">
                <div className="m-stat m-stat-ring">
                  <ProgressRing value={Number(globalMiqSummary.miqEquiv80)} max={80}>
                    <strong>{globalMiqSummary.miqEquiv80}</strong>
                  </ProgressRing>
                  <div>
                    <span className="m-stat-label">Təxmini MİQ balı</span>
                    <strong className="m-stat-title">80 bal üzərindən</strong>
                    <span className="m-stat-sub">4 səhv 1 düzü silir</span>
                  </div>
                </div>
                <div className="m-stat">
                  <span className="m-stat-label">Dəqiqlik</span>
                  <strong className="m-stat-value">{globalMiqSummary.accuracyPct}%</strong>
                  <span className="m-stat-sub">
                    <span className="m-good">{globalMiqSummary.correct} düz</span> ·{' '}
                    <span className="m-bad">{globalMiqSummary.wrong} səhv</span>
                  </span>
                </div>
                <div className="m-stat">
                  <span className="m-stat-label">İşlənən suallar</span>
                  <strong className="m-stat-value">
                    {globalMiqSummary.answered}
                    <small> / {globalMiqSummary.total}</small>
                  </strong>
                  <div className="m-bar">
                    <div
                      className="m-bar-fill"
                      style={{ width: `${(globalMiqSummary.answered / globalMiqSummary.total) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="m-stat">
                  <span className="m-stat-label">Bitmiş testlər</span>
                  <strong className="m-stat-value">
                    {completedPacksCount}
                    <small> / {dashTopicScopedPacks.length}</small>
                  </strong>
                  <span className="m-stat-sub">{inProgressPacks.length} test yarımçıqdır</span>
                </div>
              </div>

              <section className="m-section">
                <div className="m-section-head">
                  <div>
                    <h2 className="m-section-title">Test paketləri</h2>
                    <p className="m-section-sub">
                      {dashTopicScopedPacks.length} paket ·{' '}
                      {dashTopicFilter === '1.1'
                        ? `${ALL_TOPIC_1_1_QUESTIONS.length} sual (Mövzu 1.1)`
                        : dashTopicFilter === '1.2'
                        ? `${ALL_TOPIC_1_2_QUESTIONS.length} sual (Mövzu 1.2)`
                        : `${globalMiqSummary.total} sual (Mövzu 1.1 + 1.2)`}
                    </p>
                  </div>
                  <div className="m-filter">
                    {[
                      { id: 'ALL', label: 'Bütün mövzular', count: allPacksSummary.length },
                      { id: '1.2', label: 'Mövzu 1.2 (Miqyas və Plan)', count: allTopic1_2PacksSummary.length },
                      { id: '1.1', label: 'Mövzu 1.1 (Kəşflər)', count: allTopic1PacksSummary.length }
                    ].map((tf) => (
                      <button
                        key={tf.id}
                        className={dashTopicFilter === tf.id ? 'active' : ''}
                        onClick={() => setDashTopicFilter(tf.id)}
                      >
                        {tf.label}
                        <em>{tf.count}</em>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="m-filter" style={{ marginBottom: '14px' }}>
                  {PACK_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      className={dashPackFilter === f.id ? 'active' : ''}
                      onClick={() => setDashPackFilter(f.id)}
                    >
                      {f.label}
                      <em>{f.count}</em>
                    </button>
                  ))}
                </div>

                {filteredDashboardPacks.length === 0 ? (
                  <div className="m-empty">Bu filtr üzrə test yoxdur.</div>
                ) : (
                  BANKS.map((bank) => {
                    const packs = filteredDashboardPacks.filter((p) => p.bankName === bank.name);
                    if (packs.length === 0) return null;
                    return (
                      <div key={bank.name} className="m-group">
                        <h3 className="m-group-title">
                          <i className={`m-group-dot tone-${bank.tone}`} />
                          {bank.name}
                          <span>{packs.length}</span>
                        </h3>
                        {renderPackGrid(packs)}
                      </div>
                    );
                  })
                )}
              </section>
            </div>
          ) : portalView === 'topics' ? (
            /* ======================== FRAMEWORK CATALOG ======================== */
            <div className="m-stack">
              <div className="m-fw-grid">
                {FRAMEWORK_SECTIONS.map((sec) => (
                  <div key={sec.id} className="m-panel m-fw-card">
                    <div className="m-fw-top">
                      <strong>{sec.num}</strong>
                      <span className="m-chip tone-sky">
                        {sec.officialQuestions} sual · {sec.officialPoints} bal
                      </span>
                    </div>
                    <p>{sec.desc}</p>
                  </div>
                ))}
              </div>

              <div className="m-topic-list">
                {TOPICS_CATALOG.map((top) => (
                  <div key={top.id} className={`m-panel m-topic ${top.active ? '' : 'is-locked'}`}>
                    <div className="m-topic-head">
                      <span className="m-chip">{top.topicCode}</span>
                      {top.active ? (
                        <span className="m-status is-completed">Aktiv</span>
                      ) : (
                        <span className="m-status is-not_started">Tezliklə</span>
                      )}
                    </div>
                    <h3 className="m-topic-title">{top.title}</h3>
                    <p className="m-topic-sec">
                      {top.sectionNum}: {top.sectionTitle}
                    </p>
                    <p className="m-topic-desc">{top.description}</p>

                    {top.id === '1.1' && (
                      <div className="m-topic-stats">
                        <span>Güvən <b>{totalGuvenAnswered1_1}/95</b></span>
                        <span>Dərslik <b>{totalTextbookAnswered1_1}/80</b></span>
                        <span>Müəllim <b>{totalTeacherAnswered1_1}/165</b></span>
                        <span>Kartlar <b>{knownFlashcardsCount1_1}/65</b></span>
                      </div>
                    )}

                    {top.id === '1.2' && (
                      <div className="m-topic-stats">
                        <span>Güvən <b>{totalGuvenAnswered1_2}/212</b></span>
                        <span>Dərslik <b>{totalTextbookAnswered1_2}/80</b></span>
                        <span>Müəllim <b>{totalTeacherAnswered1_2}/70</b></span>
                        <span>Kartlar <b>{knownFlashcardsCount1_2}/70</b></span>
                      </div>
                    )}

                    {top.active && (
                      <button
                        className="m-btn m-btn-primary"
                        onClick={() => {
                          switchTopic(top.id);
                          setSelectedVariant(null);
                          setPortalView('topic_detail');
                          window.scrollTo({ top: 0 });
                        }}
                      >
                        Mövzuya keç
                        <Icon name="arrowRight" size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : portalView === 'mistakes' ? (
            /* ======================== MISTAKE NOTEBOOK ======================== */
            <div className="m-stack">
              <div className="m-stats">
                <div className="m-stat">
                  <span className="m-stat-label">İşlənən</span>
                  <strong className="m-stat-value">
                    {globalMiqSummary.answered}
                    <small> / {globalMiqSummary.total}</small>
                  </strong>
                </div>
                <div className="m-stat">
                  <span className="m-stat-label">Düz</span>
                  <strong className="m-stat-value m-good">{globalMiqSummary.correct}</strong>
                </div>
                <div className="m-stat">
                  <span className="m-stat-label">Səhv</span>
                  <strong className="m-stat-value m-bad">{globalMiqSummary.wrong}</strong>
                </div>
                <div className="m-stat">
                  <span className="m-stat-label">Təxmini MİQ balı</span>
                  <strong className="m-stat-value">
                    {globalMiqSummary.miqEquiv80}
                    <small> / 80</small>
                  </strong>
                  <span className="m-stat-sub">Xalis düz: {globalMiqSummary.netCorrect}</span>
                </div>
              </div>

              <section className="m-section">
                <div className="m-section-head">
                  <div>
                    <h2 className="m-section-title">Səhv cavabladığın suallar</h2>
                    <p className="m-section-sub">Hər birinin düzgün cavabı və izahı ilə</p>
                  </div>
                  {allWrongQuestions.length > 0 && (
                    <button className="m-btn m-btn-primary" onClick={() => handleSelectVariant('WRONG-ALL', 'study', 0)}>
                      Hamısını təkrar işlə ({allWrongQuestions.length})
                    </button>
                  )}
                </div>

                {allWrongQuestions.length > 0 ? (
                  <div className="m-mistakes">
                    {allWrongQuestions.map((wq) => (
                      <div key={wq.id} className="m-panel m-mistake">
                        <div className="m-mistake-head">
                          <span className="m-chip">{wq.id}</span>
                          <span className="m-mistake-ans">
                            <span className="m-bad">Sən: {userAnswers[wq.id]}</span>
                            <span className="m-good">Düz: {wq.correct}</span>
                          </span>
                        </div>
                        <p className="m-mistake-q">{wq.question}</p>
                        <p className="m-mistake-exp">{wq.explanation}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="m-empty">Səhv dəftərində hələ sual yoxdur. Əla!</div>
                )}
              </section>
            </div>
          ) : (
            /* ======================== TOPIC HUB (1.1 & 1.2) ======================== */
            <div className="m-stack">
              <div className="m-filter m-filter-scroll">
                <button
                  className={selectedTopicId === '1.2' ? 'active' : ''}
                  onClick={() => switchTopic('1.2')}
                >
                  Mövzu 1.2 · Məkan, Miqyas və Plan
                  <em>362 sual</em>
                </button>
                <button
                  className={selectedTopicId === '1.1' ? 'active' : ''}
                  onClick={() => switchTopic('1.1')}
                >
                  Mövzu 1.1 · Kəşflər və Tədqiqatlar
                  <em>340 sual</em>
                </button>
              </div>

              {renderContinueCard(true)}

              <div className="m-tabs" role="tablist">
                {HUB_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={hubTab === tab.id}
                    className={hubTab === tab.id ? 'active' : ''}
                    onClick={() => setHubTab(tab.id)}
                  >
                    {tab.label}
                    {tab.count && <em>{tab.count}</em>}
                  </button>
                ))}
              </div>

              {BANK_TABS[hubTab] && (
                <section className="m-section">
                  <div className="m-section-head">
                    <div>
                      <h2 className="m-section-title">{BANK_TABS[hubTab].title}</h2>
                      <p className="m-section-sub">{BANK_TABS[hubTab].sub}</p>
                    </div>
                    <div className="m-head-actions">
                      <button
                        className="m-btn m-btn-ghost"
                        onClick={() => handleSelectVariant(BANK_TABS[hubTab].mega.code, 'exam', 0)}
                      >
                        <Icon name="shuffle" size={15} />
                        {BANK_TABS[hubTab].mega.label}
                      </button>
                      <button
                        className="m-btn m-btn-ghost"
                        onClick={() => handleSelectVariant(BANK_TABS[hubTab].all.code, 'study')}
                      >
                        {BANK_TABS[hubTab].all.label}
                      </button>
                    </div>
                  </div>
                  {renderPackGrid(activeTopicPacksSummary.filter((p) => p.bankName === BANK_TABS[hubTab].bank))}
                </section>
              )}

              {hubTab === 'study' && (
                <div className="study-hub-container">
                  <section className="m-section">
                    <div className="m-section-head">
                      <div>
                        <h2 className="m-section-title">Səsli dərslər və Konspekt</h2>
                        <p className="m-section-sub">
                          Mövzu {selectedTopicId} üzrə 6–11-ci sinif dərslikləri, metodik vəsaitlər və müəllim materialları
                        </p>
                      </div>
                      <a
                        href={selectedTopicId === '1.2' ? '/Movzu_1_2_Konspekt.pdf' : '/Movzu_1_1_Konspekt.pdf'}
                        download={
                          selectedTopicId === '1.2'
                            ? 'Movzu_1_2_Mekan_Miqyas_Plan_Konspekt.pdf'
                            : 'Movzu_1_1_Cografi_Kesfler_Konspekt.pdf'
                        }
                        className="m-btn m-btn-primary"
                      >
                        PDF konspekt endir
                      </a>
                    </div>

                    <div className="audio-cards-grid">
                      {currentTopicAudio.map((aud) => (
                        <div key={aud.id} className="audio-player-card">
                          <div className="audio-card-info">
                            <strong>{aud.title}</strong>
                            <span>{aud.desc}</span>
                          </div>
                          <audio key={aud.src} controls preload="none" className="audio-element">
                            <source src={aud.src} type="audio/mpeg" />
                          </audio>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="m-study-filter">
                    <input
                      type="search"
                      className="m-input"
                      placeholder={
                        selectedTopicId === '1.2'
                          ? 'Konspektdə axtar: paletka, azimut, 4-lü şəbəkə, kəsmə yüksəklik…'
                          : 'Konspektdə axtar: Biruni, Merkator, CİS…'
                      }
                      value={studySearch}
                      onChange={(e) => setStudySearch(e.target.value)}
                    />
                    <div className="m-filter m-filter-scroll">
                      <button
                        className={activeChapterId === 'ALL' ? 'active' : ''}
                        onClick={() => setActiveChapterId('ALL')}
                      >
                        Hamısı
                      </button>
                      {currentTopicChapters.map((ch) => (
                        <button
                          key={ch.id}
                          className={activeChapterId === ch.id ? 'active' : ''}
                          onClick={() => setActiveChapterId(ch.id)}
                        >
                          {ch.code}
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
                        <div className="study-html-content" dangerouslySetInnerHTML={{ __html: ch.html }} />
                      </article>
                    ))}
                    {filteredChapters.length === 0 && <div className="m-empty">Axtarışa uyğun fəsil tapılmadı.</div>}
                  </div>
                </div>
              )}

              {hubTab === 'flashcards' && (
                <section className="m-section">
                  <div className="m-section-head">
                    <div>
                      <h2 className="m-section-title">Yaddaş kartları (Mövzu {selectedTopicId})</h2>
                      <p className="m-section-sub">
                        <span className="m-good">{knownFlashcardsCount} bilirəm</span> ·{' '}
                        <span className="m-warn">{reviewFlashcardsCount} təkrar</span> · {currentTopicFlashcards.length} kart
                      </p>
                    </div>
                    <button
                      className="m-btn m-btn-ghost"
                      onClick={() => {
                        if (window.confirm('Cari mövzunun yaddaş kartları üzrə işarələmələri sıfırlamaq istəyirsiniz?')) {
                          const ids = new Set(currentTopicFlashcards.map((c) => c.id));
                          setFcStatus((prev) => {
                            const next = { ...prev };
                            ids.forEach((id) => delete next[id]);
                            return next;
                          });
                          setFcIndex(0);
                        }
                      }}
                    >
                      <Icon name="reset" size={15} />
                      Sıfırla
                    </button>
                  </div>

                  <div className="m-filter m-filter-scroll">
                    {FLASHCARD_CATEGORY_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        className={fcCategory === tab.id ? 'active' : ''}
                        onClick={() => {
                          setFcCategory(tab.id);
                          setFcIndex(0);
                          setFcFlipped(false);
                        }}
                      >
                        {tab.label}
                        <em>{tab.count}</em>
                      </button>
                    ))}
                  </div>

                  {currentFlashcard ? (
                    <div className="m-fc">
                      <button
                        className={`m-fc-card ${fcFlipped ? 'is-flipped' : ''}`}
                        onClick={() => setFcFlipped(!fcFlipped)}
                      >
                        <span className="m-fc-top">
                          <span className="m-chip tone-teal">{currentFlashcard.category.replace(/^\d+\.\s*/, '')}</span>
                          <span className="m-muted">
                            {fcIndex + 1} / {filteredFlashcards.length}
                          </span>
                        </span>
                        <span className="m-eyebrow">{fcFlipped ? 'Cavab' : 'Sual'}</span>
                        <span className="m-fc-text">{fcFlipped ? currentFlashcard.back : currentFlashcard.front}</span>
                        <span className="m-fc-hint">{fcFlipped ? 'Suala qayıtmaq üçün toxun' : 'Cavabı görmək üçün toxun'}</span>
                      </button>

                      <div className="m-fc-controls">
                        <button
                          className="m-icon-btn"
                          aria-label="Əvvəlki kart"
                          disabled={fcIndex === 0}
                          onClick={() => {
                            setFcIndex((i) => Math.max(0, i - 1));
                            setFcFlipped(false);
                          }}
                        >
                          <Icon name="arrowLeft" size={16} />
                        </button>
                        <button
                          className="m-btn m-btn-amber"
                          onClick={() => {
                            setFcStatus((prev) => ({ ...prev, [currentFlashcard.id]: 'review' }));
                            setFcFlipped(false);
                            if (fcIndex < filteredFlashcards.length - 1) setFcIndex((i) => i + 1);
                          }}
                        >
                          Təkrar soruş
                        </button>
                        <button
                          className="m-btn m-btn-green"
                          onClick={() => {
                            setFcStatus((prev) => ({ ...prev, [currentFlashcard.id]: 'known' }));
                            setFcFlipped(false);
                            if (fcIndex < filteredFlashcards.length - 1) setFcIndex((i) => i + 1);
                          }}
                        >
                          Bilirəm
                        </button>
                        <button
                          className="m-icon-btn"
                          aria-label="Növbəti kart"
                          disabled={fcIndex >= filteredFlashcards.length - 1}
                          onClick={() => {
                            setFcIndex((i) => Math.min(filteredFlashcards.length - 1, i + 1));
                            setFcFlipped(false);
                          }}
                        >
                          <Icon name="arrowRight" size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="m-empty">Bu kateqoriyada hazırda kart yoxdur.</div>
                  )}
                </section>
              )}

              {hubTab === 'analytics' && (
                <section className="m-section">
                  <div className="m-section-head">
                    <div>
                      <h2 className="m-section-title">Mənimsəmə diaqnostikası</h2>
                      <p className="m-section-sub">Dərslik bazasının alt-bölmələri üzrə</p>
                    </div>
                  </div>
                  <div className="m-diag">
                    {categoryAnalytics.map((cat) => (
                      <div key={cat.name} className="m-panel m-diag-row">
                        <div className="m-diag-head">
                          <div>
                            <h4>{cat.name}</h4>
                            <span className="m-muted">
                              {cat.answered}/{cat.total} işlənib · {cat.correct} düz · {cat.wrong} səhv
                            </span>
                          </div>
                          <strong>{cat.percentage}%</strong>
                        </div>
                        <div className="m-bar">
                          <div className="m-bar-fill is-completed" style={{ width: `${cat.percentage}%` }} />
                        </div>
                        {cat.remedyList.length > 0 && (
                          <div className="m-diag-remedy">
                            <span>Oxu:</span>
                            {cat.remedyList.map((bk, i) => (
                              <span key={i} className="m-chip">
                                {bk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ======================== BOTTOM NAV (mobile) ======================== */}
      {selectedVariant === null && (
        <nav className="m-bottomnav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={isNavItemActive(item.id) ? 'active' : ''}
              onClick={() => goTo(item.id)}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
              {item.id === 'mistakes' && allWrongQuestions.length > 0 && <em>{allWrongQuestions.length}</em>}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
