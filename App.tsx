
import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameMode, HakimiMood, MathProblem, GameSession, Language, DailyLog, LayoutMode } from './types';
import HakimiAvatar from './components/HakimiAvatar';
import Numpad from './components/Numpad';
import { getHakimiFeedback } from './services/geminiService';

// --- Localization Constants ---
const TEXTS = {
  zh: {
    title: "bobo\n魔鬼特训",
    subtitle: "N-Back 脑力燃烧",
    menuMessage: "喵！快来锻炼你的脑子，人类！",
    adventureMenuMessage: "闯关模式！你的极限是第几关？",
    dailySetupMessage: "选择今天的受苦时长喵！",
    dailyBtn: "📅 每日训练",
    adventureBtn: "🚀 闯关模式",
    menuBack: "↩️ 返回",
    levelSuffix: "关",
    levelLocked: "🔒",
    calendarTitle: "特训打卡记录",
    settingsTitle: "游戏设置",
    layoutLabel: "屏幕方向",
    layoutAuto: "自动",
    layoutPortrait: "竖屏",
    layoutLandscape: "横屏",
    tutorialBtn: "新手教程",
    startBtn: "开始",
    tutorial: {
      introTitle: "bobo小课堂",
      introContent: "规则：永远输入 N 轮之前的答案。\n比如 1-Back 就是输入上一题的答案。",
      step1Note: "【记忆回合】\n看到 3+3=6\n不要输入！只要记住 6！",
      step2Note: "【答题回合 1】\n新题是 2+2=4\n输入上一题的 6！\n同时记住现在的 4！",
      step3Note: "【答题回合 2】\n新题是 5-0=5\n输入上一题的 4！\n同时记住现在的 5！",
      step4Note: "【清空回合】\n题目没了\n输入刚才记住的 5！",
      step5Content: "太棒了！这就是核心玩法：\n一边输出旧的，一边存入新的。\n去挑战吧！",
      next: "下一步",
      memorized: "记住了 (6)",
      finish: "完成教程",
      wrong: "不对喵！请看提示！",
      numpadHint: "请点击高亮的按钮"
    },
    game: {
      difficulty: "难度",
      combo: "连击",
      progress: "进度",
      time: "特训时间",
      memorize: "记住这个！",
      current: "当前题目",
      flush: "清空缓存...",
      done: "完成",
      memorizedBtn: "记住了！",
      inputPrompt: (n: number) => `输入 ${n} 轮前的答案`,
      flushPrompt: "清空大脑缓存！回答！",
      clear: "清除",
      wrong: "嘶——！错啦！",
      levelStart: (n: number) => `第 ${n} 关！集中注意力！`,
      dailyStart: (n: number) => `难度 ${n}-Back | 保持专注`,
      calculating: "bobo正在计算你的脑年龄...",
      checkIn: "连续打卡",
      days: "天",
      quit: "退出",
      stageComplete: "阶段完成！",
      levelUp: "能力提升！难度 +1 ⬆️",
      levelDown: "有点吃力？难度 -1 ⬇️",
      levelKeep: "保持节奏！难度不变 ➡️",
      accuracy: "正确率",
      nextStage: "进入下一阶段..."
    },
    daily: {
      selectTime: "训练时长",
      min: "分钟",
      start: "开始特训",
      stamp: "打卡",
      recommended: "推荐难度"
    },
    feedback: {
      title: "特训结束",
      score: "最终得分",
      maxCombo: "最大连击",
      back: "返回菜单",
      nextLevel: "进入下一关 ➡️",
      retry: "再试一次 🔄",
      checkInSuccess: "打卡成功！已连续坚持",
      adventureSuccess: "闯关成功！解锁下一关！🎉",
      adventureFail: "挑战失败，正确率未达 85%。再试一次！",
      allCleared: "太强了喵！所有关卡已通关！🏆",
      correct: "正确",
      mistake: "错误",
      total: "总题数",
      accuracy: "正确率"
    }
  },
  en: {
    title: "Bobo\nDevil Training",
    subtitle: "N-Back Brain Burn",
    menuMessage: "Meow! Come train your brain, human!",
    adventureMenuMessage: "Adventure Mode! What's your limit?",
    dailySetupMessage: "Choose your suffering duration!",
    dailyBtn: "📅 Daily Training",
    adventureBtn: "🚀 Adventure Mode",
    menuBack: "↩️ Back",
    levelSuffix: "-Bk",
    levelLocked: "🔒",
    calendarTitle: "Training Log",
    settingsTitle: "Settings",
    layoutLabel: "Orientation",
    layoutAuto: "Auto",
    layoutPortrait: "Portrait",
    layoutLandscape: "Landscape",
    tutorialBtn: "Tutorial",
    startBtn: "Start",
    tutorial: {
      introTitle: "Bobo Class",
      introContent: "Rule: Always input the answer from N turns ago.\nFor 1-Back, input the PREVIOUS answer.",
      step1Note: "[Memorize Round]\n3+3=6\nDon't type! Just memorize 6!",
      step2Note: "[Answer Round 1]\nNew: 2+2=4\nInput PREVIOUS (6)!\nMemorize CURRENT (4)!",
      step3Note: "[Answer Round 2]\nNew: 5-0=5\nInput PREVIOUS (4)!\nMemorize CURRENT (5)!",
      step4Note: "[Flush Round]\nNo more questions.\nInput the last one (5)!",
      step5Content: "Awesome! That's the loop:\nOutput the old, Store the new.\nGo challenge!",
      next: "Next",
      memorized: "Memorized (6)",
      finish: "Finish",
      wrong: "Wrong meow! Check hint!",
      numpadHint: "Tap the highlighted button"
    },
    game: {
      difficulty: "Level",
      combo: "Combo",
      progress: "Progress",
      time: "Time",
      memorize: "Memorize!",
      current: "Question",
      flush: "Flushing...",
      done: "Done",
      memorizedBtn: "Got it!",
      inputPrompt: (n: number) => `Answer from ${n} ago`,
      flushPrompt: "Empty cache! Answer!",
      clear: "Clear",
      wrong: "Hiss! Wrong!",
      levelStart: (n: number) => `Level ${n}! Focus!`,
      dailyStart: (n: number) => `Level ${n}-Back | Focus`,
      calculating: "Calculating brain age...",
      checkIn: "Streak",
      days: "Days",
      quit: "Quit",
      stageComplete: "Stage Clear!",
      levelUp: "Level Up! Difficulty +1 ⬆️",
      levelDown: "Too hard? Difficulty -1 ⬇️",
      levelKeep: "Keep going! Difficulty stays ➡️",
      accuracy: "Accuracy",
      nextStage: "Next Stage..."
    },
    daily: {
      selectTime: "Duration",
      min: "min",
      start: "Start Training",
      stamp: "Stamp",
      recommended: "Rec. Level"
    },
    feedback: {
      title: "Training Over",
      score: "Final Score",
      maxCombo: "Max Combo",
      back: "Back to Menu",
      nextLevel: "Next Level ➡️",
      retry: "Retry 🔄",
      checkInSuccess: "Check-in! Streak:",
      adventureSuccess: "Success! Next Level Unlocked! 🎉",
      adventureFail: "Failed. Need 85% accuracy to unlock.",
      allCleared: "Amazing! All Levels Cleared! 🏆",
      correct: "Correct",
      mistake: "Wrong",
      total: "Total",
      accuracy: "Accuracy"
    }
  }
};

// --- Constants ---
const ADVENTURE_MAX_LEVEL = 30;

const generateProblem = (): MathProblem => {
  const op = Math.random() > 0.5 ? '+' : '-';
  let a, b, ans;
  // Constrain result to single digit 0-9
  if (op === '+') {
      ans = Math.floor(Math.random() * 10); 
      a = Math.floor(Math.random() * (ans + 1));
      b = ans - a;
  } else {
      a = Math.floor(Math.random() * 10);
      b = Math.floor(Math.random() * (a + 1));
      ans = a - b;
  }
  return { id: crypto.randomUUID(), expression: `${a} ${op} ${b}`, answer: ans };
};

const App: React.FC = () => {
  // --- State ---
  const [language, setLanguage] = useState<Language>('zh');
  const t = TEXTS[language];

  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [menuView, setMenuView] = useState<'MAIN' | 'ADVENTURE'>('MAIN'); 
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(LayoutMode.PORTRAIT); // Default to PORTRAIT
  const [activeLayout, setActiveLayout] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');

  // --- Persistence State (Initialized Lazily from LocalStorage) ---
  // Using lazy initialization ensures we read from storage BEFORE the first render,
  // preventing any flicker or data overwrite issues.
  
  const [unlockedLevel, setUnlockedLevel] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('hakimiUnlockLevel') || '1', 10);
    } catch { return 1; }
  });

  const [dailyMaxLevel, setDailyMaxLevel] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('hakimiDailyMax') || '2', 10);
    } catch { return 2; }
  });

  const [streak, setStreak] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('hakimiStreak') || '0', 10);
    } catch { return 0; }
  });

  const [lastCheckInDate, setLastCheckInDate] = useState<string>(() => {
    return localStorage.getItem('hakimiLastDate') || '';
  });

  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => {
    try {
      const saved = localStorage.getItem('hakimiDailyLogs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // --- Auto-Save Effects (Reactive Persistence) ---
  // Whenever these states change, they automatically save to localStorage.
  
  useEffect(() => {
    localStorage.setItem('hakimiUnlockLevel', unlockedLevel.toString());
  }, [unlockedLevel]);

  useEffect(() => {
    localStorage.setItem('hakimiDailyMax', dailyMaxLevel.toString());
  }, [dailyMaxLevel]);

  useEffect(() => {
    localStorage.setItem('hakimiStreak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('hakimiLastDate', lastCheckInDate);
  }, [lastCheckInDate]);

  useEffect(() => {
    localStorage.setItem('hakimiDailyLogs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);


  // Game Config
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.ADVENTURE);
  const [nLevel, setNLevel] = useState<number>(1);
  const [gameDuration, setGameDuration] = useState<number>(3); // Minutes
  
  // Timer State for Daily Mode (Counting UP)
  const [timeElapsed, setTimeElapsed] = useState<number>(0); 

  // Hakimi/Bobo State
  const [hakimiMood, setHakimiMood] = useState<HakimiMood>(HakimiMood.NEUTRAL);
  const [hakimiMessage, setHakimiMessage] = useState<string>("");
  
  // Game Logic State
  const [problemQueue, setProblemQueue] = useState<MathProblem[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentCombo, setCurrentCombo] = useState<number>(0);
  const [dailyStageResult, setDailyStageResult] = useState<{acc: number, action: 'UP'|'DOWN'|'KEEP', nextLevel: number} | null>(null);

  // Stats
  const [sessionData, setSessionData] = useState<GameSession | null>(null);
  const [justCheckedIn, setJustCheckedIn] = useState<boolean>(false);
  const [adventureUnlockJustNow, setAdventureUnlockJustNow] = useState<boolean>(false);
  const [adventureSuccess, setAdventureSuccess] = useState<boolean>(false);
  
  // Tutorial State
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  const sessionRef = useRef<GameSession>({
    mode: GameMode.ADVENTURE, nLevel: 1, score: 0, totalQuestions: 0, maxCombo: 0, history: []
  });

  const batchStartRef = useRef<number>(0);
  
  // Track last spoken phrases to prevent immediate repetition
  const lastSpokenRef = useRef<string[]>([]);

  // --- Initialization ---
  useEffect(() => {
      setHakimiMessage(t.menuMessage);
  }, []);

  useEffect(() => {
      if (gameState === GameState.MENU) {
          if (menuView === 'MAIN') setHakimiMessage(t.menuMessage);
          else if (menuView === 'ADVENTURE') setHakimiMessage(t.adventureMenuMessage);
      }
      if (gameState === GameState.DAILY_SETUP) setHakimiMessage(t.dailySetupMessage);
  }, [language, gameState, menuView]);

  // --- Layout Logic ---
  useEffect(() => {
    const handleResize = () => {
       if (layoutMode === LayoutMode.AUTO) {
           if (window.innerWidth > window.innerHeight) {
               setActiveLayout('LANDSCAPE');
           } else {
               setActiveLayout('PORTRAIT');
           }
       } else {
           setActiveLayout(layoutMode === LayoutMode.LANDSCAPE ? 'LANDSCAPE' : 'PORTRAIT');
       }
    };
    
    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layoutMode]);

  // --- Timer Logic (Daily Mode - Count UP) ---
  useEffect(() => {
    let timerId: any;
    // Only count time during PLAYING phase of Daily Mode
    if (gameState === GameState.PLAYING && gameMode === GameMode.DAILY) {
        timerId = setInterval(() => {
          setTimeElapsed(prev => prev + 1);
        }, 1000);
    }
    return () => clearInterval(timerId);
  }, [gameState, gameMode]);


  // --- Sound Effects & TTS ---
  
  const getPreferredVoice = (lang: Language) => {
    const voices = window.speechSynthesis.getVoices();
    // Priority list for Sweet/Soft/Natural Female Voices
    const preferredCN = [
        "Xiaoxiao", // Windows - Natural Neural
        "Yaoyao",   // Windows
        "HiuGaai",  // HK
        "Meijia", 
        "Sin-Ji", 
        "Ting-Ting", // macOS
        "Google 汉语", 
        "Google 普通话" // Android
    ];
    const preferredEN = [
        "Google US English", // Android/Chrome - usually female & clear
        "Samantha", // macOS
        "Zira",     // Windows
        "Ava", 
        "Susan"
    ];

    const targetList = lang === 'zh' ? preferredCN : preferredEN;
    const langCode = lang === 'zh' ? 'zh' : 'en';

    // 1. Try exact preferred matches
    for (const name of targetList) {
        const hit = voices.find(v => v.name.includes(name));
        if (hit) return hit;
    }

    // 2. Try generic "Female" check if metadata allows and language matches
    const femaleVoice = voices.find(v => 
        v.lang.startsWith(langCode) && 
        (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("woman"))
    );
    if (femaleVoice) return femaleVoice;

    // 3. Fallback to first matching language
    return voices.find(v => v.lang.startsWith(langCode)) || null;
  };

  const speakFeedback = (isGood: boolean) => {
      // 50% Probability Check
      if (Math.random() > 0.5) return; 
      
      let pool: string[] = [];
      
      if (language === 'zh') {
          if (isGood) {
              pool = ["哈基米", "很好", "很棒", "厉害呢", "继续", "就是这样", "南北绿豆"];
          } else {
              pool = ["可惜", "曼波"];
          }
      } else {
          // English Fallback
          if (isGood) {
              pool = ["Good!", "Very Good!", "Awesome!", "OK!", "Amazing!", "Keep going!", "That's it!", "Excellent!"];
          } else {
              pool = ["Too bad!", "Mambo!", "Oh no!", "Pity!"];
          }
      }

      // Logic: Ensure no repetition in the last 2 turns
      const lookBackCount = pool.length > 2 ? 2 : 1;
      const forbidden = lastSpokenRef.current.slice(-lookBackCount);
      
      const candidates = pool.filter(p => !forbidden.includes(p));
      const finalPool = candidates.length > 0 ? candidates : pool;
      
      const phrase = finalPool[Math.floor(Math.random() * finalPool.length)];
      
      // Update history
      lastSpokenRef.current = [...lastSpokenRef.current, phrase].slice(-2);
      
      try {
          // Cancel previous speech to avoid queue buildup
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(phrase);
          
          const preferredVoice = getPreferredVoice(language);
          if (preferredVoice) utterance.voice = preferredVoice;

          utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
          utterance.rate = 1.1; // Slightly lively but natural
          utterance.pitch = 1.25; // Sweet/Soft/Younger tone
          window.speechSynthesis.speak(utterance);
      } catch (e) {
          console.warn('TTS not supported or failed', e);
      }
  };

  const speakResult = (accuracy: number) => {
      let text = "";
      if (accuracy >= 0.85) {
          text = language === 'zh' ? "你过关" : "You passed!";
      } else if (accuracy >= 0.60) {
          text = language === 'zh' ? "很不错，再试一次吧" : "Good job, try again!";
      } else {
          text = "Never gonna give you up"; 
      }
      
      try {
          // Cancel previous speech to avoid queue buildup
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          
          // Force English for Rickroll to sound authentic if possible, otherwise follow system lang
          const targetLang = text === "Never gonna give you up" ? 'en' : language;
          const preferredVoice = getPreferredVoice(targetLang);
          if (preferredVoice) utterance.voice = preferredVoice;

          utterance.lang = text === "Never gonna give you up" ? 'en-US' : (language === 'zh' ? 'zh-CN' : 'en-US');
          utterance.rate = 1.1; 
          utterance.pitch = 1.25; // Consistent sweet tone
          window.speechSynthesis.speak(utterance);
      } catch (e) {
          console.warn('TTS not supported or failed', e);
      }
  };

  const playSound = (type: 'correct' | 'wrong' | 'pop' | 'fanfare') => {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'correct') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'wrong') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'fanfare') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1); // C#
          osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2); // E
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
      } else {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
      }
  };

  // --- Game Control ---
  
  const startAdventureGame = (level: number) => {
    // Allow starting next level if user just unlocked it, even if UI state is slightly lagging
    // Safety check: ensure level is within bounds
    if (level < 1) return;
    if (level > ADVENTURE_MAX_LEVEL) return;
    if (level > unlockedLevel + 1) return; // Prevent jumping too far ahead

    setGameMode(GameMode.ADVENTURE);
    setNLevel(level); // Sync state
    
    // Explicitly pass level to ensure logic uses the selected level immediately
    initializeBatch(level, 15, GameMode.ADVENTURE);
  };

  const startDailyGame = () => {
    setGameMode(GameMode.DAILY);
    setTimeElapsed(0); // Reset timer
    
    // Start Level = Max(2, MaxReached - 1)
    const startLvl = Math.max(2, dailyMaxLevel - 1);
    
    sessionRef.current = {
      mode: GameMode.DAILY,
      nLevel: startLvl,
      score: 0,
      totalQuestions: 0,
      maxCombo: 0,
      history: [],
      durationMinutes: gameDuration,
      maxDailyLevelReached: startLvl
    };
    
    startDailyStage(startLvl);
  };

  const startDailyStage = (lvl: number) => {
      // Daily logic:
      // 2-back: 10 questions (5*2)
      // 3-back: 15 questions (5*3)
      const qCount = 5 * lvl;
      setNLevel(lvl); // Sync State
      
      // Update max reached for this session
      if (sessionRef.current.maxDailyLevelReached === undefined || lvl > sessionRef.current.maxDailyLevelReached) {
          sessionRef.current.maxDailyLevelReached = lvl;
      }

      // Initialize with new level
      initializeBatch(lvl, qCount, GameMode.DAILY);
  };

  const initializeBatch = (level: number, questionCount: number, mode: GameMode) => {
    // FIX: For Adventure, we reset history, so batch start must be 0.
    // For Daily, we continue history, so batch start is current length.
    if (mode === GameMode.ADVENTURE) {
        batchStartRef.current = 0;
        sessionRef.current = {
            mode: GameMode.ADVENTURE,
            nLevel: level,
            score: 0,
            totalQuestions: questionCount,
            maxCombo: 0,
            history: []
        };
    } else {
        batchStartRef.current = sessionRef.current.history.length;
        sessionRef.current.nLevel = level; // Update current level for daily
    }
    
    setGameState(GameState.PLAYING);
    setHakimiMood(HakimiMood.NEUTRAL);
    setHakimiMessage(mode === GameMode.DAILY ? t.game.dailyStart(level) : t.game.levelStart(level));
    setCurrentInput('');
    setCurrentIndex(0);
    setCurrentCombo(0);
    setAdventureUnlockJustNow(false);
    setAdventureSuccess(false);
    setJustCheckedIn(false);

    const problems: MathProblem[] = [];
    for(let i=0; i < questionCount; i++) {
        problems.push(generateProblem());
    }
    setProblemQueue(problems);
  };

  const startTutorial = () => {
    setGameState(GameState.TUTORIAL);
    setTutorialStep(0);
    setHakimiMood(HakimiMood.HAPPY);
    setHakimiMessage(t.tutorial.introContent);
    setCurrentInput('');
  };

  const handleInput = (num: number) => {
    // Tutorial Logic
    if (gameState === GameState.TUTORIAL) {
        if (tutorialStep === 2 && num === 6) {
             playSound('correct');
             speakFeedback(true);
             setTutorialStep(3);
             setHakimiMood(HakimiMood.HAPPY);
        } else if (tutorialStep === 3 && num === 4) {
             playSound('correct');
             speakFeedback(true);
             setTutorialStep(4);
             setHakimiMood(HakimiMood.HAPPY);
        } else if (tutorialStep === 4 && num === 5) {
             playSound('correct');
             speakFeedback(true);
             setTutorialStep(5);
             setHakimiMood(HakimiMood.HAPPY);
        } else {
             playSound('wrong');
             setHakimiMood(HakimiMood.ANGRY);
             setHakimiMessage(t.tutorial.wrong);
        }
        return;
    }

    if (gameState !== GameState.PLAYING) return;
    const newVal = currentInput + num.toString();
    setCurrentInput(newVal);
  };

  useEffect(() => {
      if (gameState !== GameState.PLAYING) return;
      if (currentInput === '') return;

      // Use nLevel state which should be in sync
      const targetProblemIndex = currentIndex - nLevel;
      if (targetProblemIndex < 0) return;
      
      const targetProblem = problemQueue[targetProblemIndex];
      // CRITICAL FIX: Ensure targetProblem exists before accessing properties.
      if (!targetProblem) return;

      const targetAnswerString = targetProblem.answer.toString();

      if (currentInput === targetAnswerString) {
          submitAnswer(true, targetProblem);
      } else if (currentInput.length >= targetAnswerString.length) {
          submitAnswer(false, targetProblem);
      }
  }, [currentInput, gameState, currentIndex, nLevel, problemQueue]);

  const submitAnswer = (correct: boolean, problem: MathProblem) => {
      sessionRef.current.history.push({
          question: problem.expression,
          correctAnswer: problem.answer,
          userAnswer: currentInput,
          isCorrect: correct,
          timeTakenMs: 0,
          stageLevel: nLevel
      });

      // Check if this was the last answer in the queue
      const totalExpectedAnswers = problemQueue.length;
      const answersGiven = sessionRef.current.history.length - batchStartRef.current;
      const isLastQuestion = answersGiven >= totalExpectedAnswers;

      if (correct) {
          playSound('correct');
          // Only speak per-question feedback if it's NOT the last question
          if (!isLastQuestion) {
            speakFeedback(true);
          }
          if (gameMode === GameMode.ADVENTURE || gameMode === GameMode.DAILY) {
              sessionRef.current.score += 1;
          }
          const newCombo = currentCombo + 1;
          setCurrentCombo(newCombo);
          sessionRef.current.maxCombo = Math.max(sessionRef.current.maxCombo, newCombo);
          
          if (newCombo > 4) setHakimiMood(HakimiMood.DEVIL);
          else setHakimiMood(HakimiMood.HAPPY);
      } else {
          playSound('wrong');
          setHakimiMood(HakimiMood.ANGRY);
          setHakimiMessage(t.game.wrong);
          setCurrentCombo(0);
          // Only speak per-question feedback if it's NOT the last question
          if (!isLastQuestion) {
            speakFeedback(false); 
          }
      }

      setCurrentInput('');
      
      const nextIndex = currentIndex + 1;
      const totalStimuli = problemQueue.length;
      
      if (nextIndex < totalStimuli) {
          setCurrentIndex(nextIndex);
      } else {
          // Flush phase or Done
          setCurrentIndex(nextIndex); // Increment anyway to track state
          setHakimiMessage(t.game.flushPrompt);
      }
      
      // If we have collected all expected answers
      if (answersGiven >= totalExpectedAnswers) { 
           handleBatchComplete();
      } else if (nextIndex >= totalStimuli) {
          // If not done, but entering flush
         setHakimiMessage(t.game.flushPrompt);
      }
  };
  
  const handleBatchComplete = () => {
      // Calculate Accuracy for this batch
      const count = problemQueue.length;
      const recentHistory = sessionRef.current.history.slice(-count);
      const correctCount = recentHistory.filter(h => h.isCorrect).length;
      const accuracy = correctCount / count;

      // Speak Final Result Voice
      speakResult(accuracy);
      
      if (gameMode === GameMode.ADVENTURE) {
          finishGame(accuracy);
      } else {
          // Daily Mode Transition Logic
          
          // Check if time is UP
          const durationSeconds = gameDuration * 60;
          if (timeElapsed >= durationSeconds) {
              finishGame(accuracy);
              return;
          }

          // If time is not up, calculate next stage
          setGameState(GameState.STAGE_TRANSITION);
          let action: 'UP'|'DOWN'|'KEEP' = 'KEEP';
          let nextLevel = nLevel;
          
          if (accuracy >= 0.85) {
              action = 'UP';
              nextLevel = nLevel + 1;
              playSound('fanfare');
          } else if (accuracy < 0.60) {
              action = 'DOWN';
              nextLevel = Math.max(2, nLevel - 1);
          } else {
              action = 'KEEP';
          }
          
          setDailyStageResult({ acc: accuracy, action, nextLevel });
          
          // Delay and start next stage automatically
          setTimeout(() => {
             // Check if user hasn't quit
             startDailyStage(nextLevel);
          }, 2500); 
      }
  };
  

  const advanceMemorization = () => {
      playSound('pop');
      setCurrentIndex(prev => prev + 1);
  };
  
  const advanceTutorial = () => {
      playSound('pop');
      setTutorialStep(prev => prev + 1);
  }

  const finishGame = async (finalBatchAccuracy?: number) => {
      // Update Total Questions for daily accuracy display BEFORE setting state
      if (gameMode === GameMode.DAILY) {
          sessionRef.current.totalQuestions = sessionRef.current.history.length;
      }

      setGameState(GameState.FEEDBACK);
      setSessionData({...sessionRef.current}); // Clone
      setHakimiMood(HakimiMood.THINKING);
      setHakimiMessage(t.game.calculating);
      
      // Check-in Logic & Adventure Unlock
      let unlockMsg = "";
      if (gameMode === GameMode.ADVENTURE) {
           const acc = finalBatchAccuracy || 0;
           
           if (acc >= 0.85) {
               setAdventureSuccess(true);
               playSound('fanfare');
               
               // Logic: If we passed the highest unlocked level, unlock the next one.
               if (nLevel === unlockedLevel && unlockedLevel < ADVENTURE_MAX_LEVEL) {
                   const newUnlock = unlockedLevel + 1;
                   setUnlockedLevel(newUnlock); // useEffect will auto-save this
                   setAdventureUnlockJustNow(true);
                   unlockMsg = " " + t.feedback.adventureSuccess;
               } else if (nLevel === ADVENTURE_MAX_LEVEL) {
                   unlockMsg = " " + t.feedback.allCleared;
               } else {
                   unlockMsg = " " + t.feedback.adventureSuccess;
               }
           } else {
               setAdventureSuccess(false);
           }
      } else if (gameMode === GameMode.DAILY) {
           handleDailyCheckIn();
           saveDailyLog();
           // Update max daily level for next time
           const maxReached = sessionRef.current.maxDailyLevelReached || 2;
           if (maxReached > dailyMaxLevel) {
               setDailyMaxLevel(maxReached); // useEffect will auto-save this
           }
      }

      const feedback = await getHakimiFeedback(sessionRef.current, language);
      setHakimiMessage(feedback + (unlockMsg ? `\n${unlockMsg}` : ""));
      
      const accuracy = sessionRef.current.score / Math.max(1, sessionRef.current.totalQuestions);
      if (accuracy > 0.8) setHakimiMood(HakimiMood.HAPPY);
      else setHakimiMood(HakimiMood.ANGRY);
  };

  const handleDailyCheckIn = () => {
      const today = new Date().toISOString().split('T')[0];

      // If already checked in today, do nothing
      if (lastCheckInDate === today) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      if (lastCheckInDate === yesterdayStr) {
          newStreak = streak + 1;
      }

      setStreak(newStreak); // useEffect will auto-save this
      setLastCheckInDate(today); // useEffect will auto-save this
      setJustCheckedIn(true);
  };

  const saveDailyLog = () => {
      const today = new Date().toISOString().split('T')[0];
      const newLog: DailyLog = {
          date: today,
          durationMinutes: gameDuration,
          nLevel: sessionRef.current.maxDailyLevelReached || 2,
          score: sessionRef.current.score
      };
      // useEffect will auto-save dailyLogs when it changes
      setDailyLogs(prevLogs => [...prevLogs, newLog]);
  };

  // --- Renderers ---

  const renderMainMenu = () => (
    <div className={`flex flex-col items-center justify-center w-full h-full p-6 animate-fade-in relative transition-all duration-300 ${activeLayout === 'LANDSCAPE' ? 'flex-row space-x-12' : 'space-y-6'}`}>
      <div className="absolute top-4 left-4 z-20 flex gap-2">
          <button onClick={() => setShowSettings(true)} className="w-10 h-10 bg-white border border-ghibli-wood rounded-full flex items-center justify-center shadow-sm active:scale-95 text-xl text-ghibli-wood" title={t.settingsTitle}>⚙️</button>
      </div>
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end space-y-2">
          <button onClick={startTutorial} className="w-10 h-10 bg-white border border-ghibli-sky rounded-full flex items-center justify-center shadow-sm active:scale-95 text-xl" title={t.tutorialBtn}>🎓</button>
          <button onClick={() => setShowCalendar(true)} className="w-10 h-10 bg-white border border-ghibli-wood rounded-full flex items-center justify-center shadow-sm active:scale-95 text-xl" title={t.calendarTitle}>📅</button>
      </div>

      {/* Main Content Group (Title + Avatar) */}
      <div className={`flex flex-col items-center ${activeLayout === 'LANDSCAPE' ? 'w-1/2 items-end' : ''}`}>
          <div className="text-center space-y-1 mt-8 mb-4">
            <h1 className="text-5xl font-cute font-bold text-ghibli-green tracking-wide drop-shadow-sm whitespace-pre-line leading-tight">{t.title}</h1>
            <p className="text-ghibli-wood font-cute text-lg opacity-80">{t.subtitle}</p>
          </div>

          <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-2 shadow-sm mb-4">
             <span>🔥 {t.game.checkIn}: {streak} {t.game.days}</span>
          </div>
          
          <div className="w-full max-w-xs">
              <HakimiAvatar mood={HakimiMood.HAPPY} message={hakimiMessage} />
          </div>
      </div>
      
      {/* Buttons Group */}
      <div className={`flex flex-col w-full max-w-xs space-y-3 ${activeLayout === 'LANDSCAPE' ? 'w-1/2 items-start justify-center' : ''}`}>
          <button 
             onClick={() => {
                 setGameState(GameState.DAILY_SETUP);
                 setGameDuration(3);
             }}
             className="w-full py-3 bg-ghibli-sky text-white rounded-2xl text-xl font-cute font-bold shadow-[4px_4px_0px_0px_rgba(135,206,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-white"
          >
             {t.dailyBtn}
          </button>
          
          <button 
             onClick={() => setMenuView('ADVENTURE')}
             className="w-full py-3 bg-white border-2 border-ghibli-green rounded-2xl text-xl font-cute font-bold text-ghibli-dark shadow-[4px_4px_0px_0px_rgba(85,107,47,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
             {t.adventureBtn}
          </button>
      </div>
    </div>
  );

  const renderAdventureMenu = () => {
      // 30 Levels List
      const levels = Array.from({length: ADVENTURE_MAX_LEVEL}, (_, i) => i + 1);

      return (
        <div className="flex flex-col items-center h-full w-full p-4 animate-fade-in space-y-4 bg-ghibli-bg relative">
            <div className="w-full flex justify-between items-center mt-2 max-w-2xl">
                 <h1 className="text-2xl font-cute font-bold text-ghibli-green flex items-center gap-2">
                    <span className="text-3xl">🏔️</span>
                    {t.adventureBtn.replace("🚀 ", "")}
                 </h1>
                 <div className="text-xs text-ghibli-wood bg-white px-2 py-1 rounded-lg border border-ghibli-wood/30">
                     Max: 30-Back
                 </div>
            </div>

            <div className={`flex-1 w-full overflow-y-auto no-scrollbar pb-20 max-w-2xl`}>
                <div className={`grid gap-3 p-2 ${activeLayout === 'LANDSCAPE' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {levels.map(level => {
                        const isLocked = level > unlockedLevel;
                        const isCurrent = level === unlockedLevel;
                        const isPassed = level < unlockedLevel;
                        
                        return (
                            <button 
                                key={level}
                                disabled={isLocked}
                                onClick={() => startAdventureGame(level)}
                                className={`w-full flex items-center justify-between px-6 py-4 rounded-3xl transition-all duration-300 relative overflow-hidden group
                                    ${isLocked 
                                        ? 'bg-gray-100/50 border-2 border-dashed border-gray-200 text-gray-400' 
                                        : isCurrent
                                            ? 'bg-white border-2 border-ghibli-accent text-ghibli-dark shadow-[0px_4px_0px_0px_rgba(255,127,80,1)] translate-x-1'
                                            : 'bg-white border-2 border-ghibli-green text-ghibli-dark shadow-sm hover:bg-green-50'
                                    }
                                `}
                            >
                                {/* Left Side: Level Number */}
                                <div className="flex items-center gap-4 z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                                        ${isLocked ? 'bg-gray-200' : isCurrent ? 'bg-ghibli-accent text-white' : 'bg-ghibli-green text-white'}
                                    `}>
                                        {level}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className={`font-cute font-bold text-lg ${isLocked ? 'text-gray-400' : 'text-ghibli-dark'}`}>
                                            Level {level}
                                        </span>
                                        <span className="text-xs font-bold opacity-60">
                                           {level}-Back
                                        </span>
                                    </div>
                                </div>

                                {/* Right Side: Status */}
                                <div className="z-10">
                                    {isLocked && <span className="text-xl">🔒</span>}
                                    {isCurrent && <span className="text-sm font-bold text-ghibli-accent animate-pulse">PLAY</span>}
                                    {isPassed && <span className="text-xl text-yellow-400 drop-shadow-sm">⭐⭐⭐</span>}
                                </div>
                                
                                {/* Current Level Highlight BG */}
                                {isCurrent && (
                                    <div className="absolute inset-0 bg-orange-50 -z-0 opacity-50"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <button 
                 onClick={() => setMenuView('MAIN')}
                 className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-8 py-3 bg-white border-2 border-ghibli-wood text-ghibli-wood font-cute font-bold rounded-full shadow-lg active:scale-95 transition-all z-20"
            >
                 {t.menuBack}
            </button>
        </div>
      );
  };

  const renderDailySetup = () => (
      <div className={`flex flex-col items-center justify-center h-full w-full p-6 animate-fade-in ${activeLayout === 'LANDSCAPE' ? 'flex-row gap-12' : 'space-y-6'}`}>
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-cute font-bold text-ghibli-dark mb-4">{t.dailyBtn}</h1>
            <div className="w-full max-w-xs">
                <HakimiAvatar mood={HakimiMood.THINKING} message={hakimiMessage} />
            </div>
          </div>

          <div className="flex flex-col space-y-4 w-full max-w-xs">
              <div className="w-full bg-white rounded-3xl p-6 shadow-md border border-ghibli-green space-y-6">
                  <div>
                      <label className="block text-ghibli-wood font-bold mb-4 flex justify-between">
                          <span>{t.daily.selectTime}</span>
                          <span className="text-ghibli-accent">{gameDuration} {t.daily.min}</span>
                      </label>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={gameDuration} 
                        onChange={(e) => setGameDuration(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ghibli-green"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold">
                          <span>1m</span>
                          <span>5m</span>
                          <span>10m</span>
                      </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                      <span className="text-sm text-gray-500 block mb-1">{t.daily.recommended}</span>
                      <span className="text-xl font-bold text-ghibli-dark">
                          {Math.max(2, dailyMaxLevel - 1)}-Back
                      </span>
                  </div>
              </div>

              <button 
                 onClick={startDailyGame}
                 className="w-full py-3 bg-ghibli-dark text-white rounded-2xl text-xl font-cute font-bold shadow-lg active:scale-95 transition-all"
              >
                 {t.daily.start}
              </button>
              
              <button 
                 onClick={() => setGameState(GameState.MENU)}
                 className="text-ghibli-wood font-cute font-bold opacity-60 hover:opacity-100 text-center"
              >
                 {t.menuBack}
              </button>
          </div>
      </div>
  );

  const renderGame = () => {
      // If we are in transition, show overlay
      if (gameState === GameState.STAGE_TRANSITION) {
          return (
              <div className="w-full h-full flex flex-col items-center justify-center bg-ghibli-bg animate-fade-in p-6 space-y-6">
                  <h2 className="text-3xl font-cute font-bold text-ghibli-dark">{t.game.stageComplete}</h2>
                  
                  <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-ghibli-green text-center w-full max-w-xs">
                       <div className="text-gray-500 font-bold mb-2">{t.game.accuracy}</div>
                       <div className={`text-4xl font-bold mb-4 ${(dailyStageResult?.acc||0) >= 0.85 ? 'text-green-500' : (dailyStageResult?.acc||0) < 0.6 ? 'text-red-500' : 'text-yellow-500'}`}>
                           {Math.round((dailyStageResult?.acc || 0) * 100)}%
                       </div>
                       <div className="text-lg font-cute font-bold text-ghibli-dark">
                           {dailyStageResult?.action === 'UP' ? t.game.levelUp : dailyStageResult?.action === 'DOWN' ? t.game.levelDown : t.game.levelKeep}
                       </div>
                  </div>
                  
                  <div className="animate-pulse text-ghibli-wood font-bold">{t.game.nextStage}</div>
              </div>
          );
      }

      if (problemQueue.length === 0) return null;

      const isMemorizationPhase = currentIndex < nLevel;
      const isFlushPhase = currentIndex >= problemQueue.length;
      const displayProblem = isFlushPhase ? null : problemQueue[currentIndex];
      
      const totalRounds = problemQueue.length;
      const answerIndex = currentIndex - nLevel;
      const progress = Math.max(0, (answerIndex / totalRounds) * 100);

      const formatTime = (seconds: number) => {
          const m = Math.floor(seconds / 60);
          const s = seconds % 60;
          return `${m}:${s < 10 ? '0'+s : s}`;
      };

      const isLandscape = activeLayout === 'LANDSCAPE';

      return (
        <div className={`flex h-full w-full relative overflow-hidden ${isLandscape ? 'flex-row' : 'flex-col'}`}>
           <div className="absolute top-4 left-4 z-30">
               <button 
                  onClick={() => setGameState(GameState.MENU)}
                  className="w-10 h-10 bg-white/80 backdrop-blur border border-ghibli-wood/50 rounded-full flex items-center justify-center shadow-sm active:scale-95 text-xl text-ghibli-wood"
               >
                  🚪
               </button>
           </div>

           {/* MAIN GAME AREA CONTAINER */}
           <div className={`flex-1 flex w-full relative overflow-y-auto no-scrollbar ${isLandscape ? 'flex-row items-center justify-center p-8 gap-8' : 'flex-col items-center'}`}>
               
               {/* Left Panel (Portrait: Top Stats + Avatar) */}
               <div className={`flex flex-col items-center justify-center ${isLandscape ? 'w-1/2 max-w-sm h-full' : 'w-full'}`}>
                   
                   {/* Top Stats Bar */}
                   <div className="w-full px-5 py-2 flex justify-between items-end z-10 min-h-[60px] pt-12">
                     <div className="text-ghibli-wood font-bold font-cute text-lg">{t.game.difficulty}: {nLevel}-B</div>
                     <div className="text-ghibli-accent font-bold font-cute text-xl">
                        {gameMode === GameMode.ADVENTURE 
                            ? `${t.game.combo} x${currentCombo}`
                            : `${formatTime(timeElapsed)} / ${gameDuration}m`
                        }
                     </div>
                   </div>

                   {gameMode === GameMode.ADVENTURE && (
                       <div className="w-full px-6 mb-2 z-10 shrink-0">
                         <div className="h-2 w-full bg-white border border-ghibli-green rounded-full overflow-hidden">
                           <div className="h-full bg-ghibli-green transition-all duration-300" style={{width: `${progress}%`}}></div>
                         </div>
                       </div>
                   )}

                   {/* Avatar */}
                   <div className="flex-shrink-0 w-full max-w-xs">
                       <HakimiAvatar mood={hakimiMood} message={hakimiMessage} />
                   </div>
               </div>

               {/* Right Panel (Portrait: Center Problem + Bottom Input) */}
               <div className={`flex flex-col items-center justify-center space-y-6 ${isLandscape ? 'w-1/2 max-w-sm h-full justify-center' : 'w-full p-2 flex-1'}`}>
                   
                   {/* Problem Card */}
                   <div className={`w-64 flex-shrink-0 bg-white border-2 border-ghibli-dark rounded-3xl p-4 shadow-md transition-all duration-300 transform ${isFlushPhase ? 'opacity-50 scale-95 grayscale' : ''}`}>
                      <div className="text-center">
                          <p className="text-xs font-bold text-ghibli-wood font-cute tracking-widest mb-1">
                              {isFlushPhase ? t.game.flush : isMemorizationPhase ? t.game.memorize : t.game.current}
                          </p>
                          <p className="text-4xl font-display font-bold text-ghibli-dark">
                              {isFlushPhase ? t.game.done : displayProblem?.expression}
                          </p>
                      </div>
                   </div>

                   {/* Input Display Area */}
                   <div className="w-64 h-14 flex-shrink-0">
                        {isMemorizationPhase ? (
                            <button 
                                onClick={advanceMemorization}
                                className="w-full h-full bg-ghibli-accent text-white font-cute font-bold text-xl rounded-2xl shadow-md active:scale-95 transition-transform"
                            >
                                {t.game.memorizedBtn}
                            </button>
                        ) : (
                            <div className="w-full h-full relative">
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-ghibli-green text-white px-3 py-0.5 rounded-full text-xs font-cute shadow-sm z-10 whitespace-nowrap border border-white">
                                    {t.game.inputPrompt(nLevel)}
                                </div>
                                <div className="w-full h-full bg-ghibli-bg border-2 border-ghibli-green border-dashed rounded-2xl flex items-center justify-center">
                                    <span className="text-3xl font-bold text-ghibli-dark tracking-widest">
                                        {currentInput}
                                        <span className="animate-pulse text-ghibli-accent ml-1">|</span>
                                    </span>
                                </div>
                            </div>
                        )}
                   </div>
                   
                   {/* Numpad Container (Landscape specific placement) */}
                   {isLandscape && (
                        <div className="w-full mt-4">
                           <Numpad 
                            onInput={handleInput} 
                            onClear={() => setCurrentInput('')}
                            disabled={isMemorizationPhase}
                            clearLabel={t.game.clear}
                           />
                        </div>
                   )}
               </div>
           </div>

           {/* Numpad Container (Portrait specific placement - Sticky Bottom) */}
           {!isLandscape && (
               <div 
                 className="flex-shrink-0 w-full bg-white rounded-t-[30px] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pt-3 z-20"
                 style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }} 
               >
                   <Numpad 
                    onInput={handleInput} 
                    onClear={() => setCurrentInput('')}
                    disabled={isMemorizationPhase}
                    clearLabel={t.game.clear}
                   />
               </div>
           )}
        </div>
      );
  };

  const renderFeedback = () => {
    const total = sessionData?.totalQuestions || 0;
    const correct = sessionData?.score || 0;
    const wrong = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
      <div className={`flex flex-col items-center justify-center h-full w-full p-8 space-y-6 animate-fade-in overflow-y-auto no-scrollbar ${activeLayout === 'LANDSCAPE' ? 'flex-row space-y-0 space-x-12' : ''}`}>
        
        {/* Left Side (Feedback Avatar & Message) */}
        <div className="flex flex-col items-center max-w-sm w-full">
            <h2 className="text-3xl font-cute font-bold text-ghibli-dark mb-4">{t.feedback.title}</h2>
            
            {justCheckedIn && (
                <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded shadow-md w-full mb-4 animate-bounce">
                    <p className="font-bold">{t.feedback.checkInSuccess} {streak} {t.game.days}!</p>
                </div>
            )}
            
            {adventureUnlockJustNow && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md w-full mb-4 animate-bounce">
                    <p className="font-bold">{t.feedback.adventureSuccess}</p>
                </div>
            )}

            <HakimiAvatar mood={hakimiMood} message={hakimiMessage} />
        </div>
        
        {/* Right Side (Stats & Actions) */}
        <div className="flex flex-col items-center max-w-sm w-full space-y-6">
            <div className="w-full bg-white border-2 border-ghibli-green rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(232,168,124,0.4)]">
               
               {/* Stats Content */}
               {sessionData?.mode === GameMode.DAILY ? (
                 <>
                    {/* Big Accuracy Header */}
                    <div className="flex flex-col items-center border-b-2 border-gray-100 pb-4 mb-4">
                        <span className="text-ghibli-wood font-cute font-bold opacity-60 text-sm tracking-wider uppercase">{t.feedback.accuracy}</span>
                        <div className={`text-6xl font-display font-bold ${accuracy >= 85 ? 'text-ghibli-green' : accuracy >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {accuracy}<span className="text-3xl">%</span>
                        </div>
                    </div>

                    {/* Grid Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                         {/* Correct */}
                         <div className="bg-[#EDF7ED] rounded-2xl p-3 flex flex-col items-center justify-center border border-[#C8E6C9]">
                             <span className="text-green-600 font-bold text-xs uppercase mb-1">{t.feedback.correct}</span>
                             <span className="text-2xl font-display font-bold text-green-700">{correct}</span>
                         </div>
                         {/* Wrong */}
                         <div className="bg-[#FDEDED] rounded-2xl p-3 flex flex-col items-center justify-center border border-[#FFCDD2]">
                             <span className="text-red-500 font-bold text-xs uppercase mb-1">{t.feedback.mistake}</span>
                             <span className="text-2xl font-display font-bold text-red-600">{wrong}</span>
                         </div>
                         {/* Total */}
                         <div className="bg-blue-50 rounded-2xl p-3 flex flex-col items-center justify-center border border-blue-100">
                             <span className="text-blue-500 font-bold text-xs uppercase mb-1">{t.feedback.total}</span>
                             <span className="text-2xl font-display font-bold text-blue-600">{total}</span>
                         </div>
                         {/* Combo */}
                         <div className="bg-orange-50 rounded-2xl p-3 flex flex-col items-center justify-center border border-orange-100">
                             <span className="text-orange-500 font-bold text-xs uppercase mb-1">{t.feedback.maxCombo}</span>
                             <span className="text-2xl font-display font-bold text-orange-600">{sessionData?.maxCombo}</span>
                         </div>
                    </div>

                    {/* Footer Stats (Time & Level) */}
                    <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-2 text-sm font-bold text-ghibli-wood">
                         <div className="flex items-center gap-1">
                            <span>⏱</span>
                            <span>{Math.floor((sessionData.durationMinutes || 0))} min</span>
                         </div>
                         <div className="w-px h-4 bg-gray-300"></div>
                         <div className="flex items-center gap-1">
                            <span>🏔</span>
                            <span>Peak: {sessionData.maxDailyLevelReached}-B</span>
                         </div>
                    </div>
                 </>
               ) : (
                 // Adventure Mode Fallback (Existing style but slightly cleaned up)
                 <>
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-ghibli-wood font-cute text-xl">{t.feedback.score}</span>
                      <span className="text-3xl font-display font-bold text-ghibli-dark">{sessionData?.score}/{sessionData?.totalQuestions}</span>
                   </div>
                   <div className="w-full h-px bg-ghibli-green opacity-20 mb-4"></div>
                   <div className="flex justify-between items-center">
                      <span className="text-ghibli-wood font-cute text-xl">{t.feedback.maxCombo}</span>
                      <span className="text-2xl font-display font-bold text-ghibli-accent">{sessionData?.maxCombo}</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2 mt-4">
                       <div className="text-center bg-green-50 rounded-lg py-1 border border-green-100 text-green-700 font-bold text-sm">
                           ✔ {correct}
                       </div>
                       <div className="text-center bg-red-50 rounded-lg py-1 border border-red-100 text-red-600 font-bold text-sm">
                           ✖ {wrong}
                       </div>
                   </div>
                 </>
               )}
            </div>

            <div className="flex flex-col w-full space-y-3">
              {gameMode === GameMode.ADVENTURE ? (
                 <>
                   {adventureSuccess ? (
                       <>
                           {nLevel < ADVENTURE_MAX_LEVEL ? (
                               <button 
                                 onClick={() => startAdventureGame(nLevel + 1)}
                                 className="w-full py-3 bg-ghibli-accent text-white rounded-2xl font-cute text-xl font-bold shadow-lg active:scale-95 transition-all"
                               >
                                 {t.feedback.nextLevel}
                               </button>
                           ) : (
                               <div className="w-full py-3 bg-yellow-400 text-white rounded-2xl font-cute text-xl font-bold shadow-lg text-center animate-pulse">
                                   🏆 {t.feedback.allCleared}
                               </div>
                           )}
                       </>
                   ) : (
                       <button 
                         onClick={() => startAdventureGame(nLevel)}
                         className="w-full py-3 bg-ghibli-green text-white rounded-2xl font-cute text-xl font-bold shadow-lg active:scale-95 transition-all"
                       >
                         {t.feedback.retry}
                       </button>
                   )}
                 </>
              ) : (
                 <button 
                   onClick={startDailyGame}
                   className="w-full py-3 bg-ghibli-green text-white rounded-2xl font-cute text-xl font-bold shadow-lg active:scale-95 transition-all"
                 >
                   {t.feedback.retry}
                 </button>
              )}

              <button 
                onClick={() => {
                    setGameState(GameState.MENU);
                    setMenuView('MAIN');
                }}
                className="w-full py-3 bg-white border-2 border-ghibli-wood text-ghibli-wood rounded-2xl font-cute text-xl font-bold shadow-sm active:scale-95 transition-all"
              >
                {t.feedback.back}
              </button>
            </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth(); 
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      
      const days = [];
      for (let i = 0; i < firstDay; i++) days.push(null);
      for (let i = 1; i <= daysInMonth; i++) days.push(i);

      const getLogForDay = (day: number) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          return dailyLogs.filter(log => log.date === dateStr).pop(); // Get latest
      };

      return (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm relative">
                  <button onClick={() => setShowCalendar(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">✖</button>
                  <h2 className="text-2xl font-cute font-bold text-ghibli-dark mb-4 text-center">{t.calendarTitle}</h2>
                  <div className="text-center font-bold text-ghibli-wood mb-2">{year} / {month + 1}</div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (<div key={i} className="text-xs font-bold text-gray-400">{d}</div>))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                      {days.map((day, i) => {
                          const log = day ? getLogForDay(day) : null;
                          return (
                              <div key={i} className="aspect-square flex items-center justify-center relative bg-gray-50 rounded-lg">
                                  {day && (
                                      <>
                                        <span className={`text-sm ${log ? 'opacity-30' : 'text-gray-700'}`}>{day}</span>
                                        {log && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <div className="w-10 h-10 border-2 border-red-500 rounded-full flex flex-col items-center justify-center transform -rotate-12 opacity-80 bg-red-50/80">
                                                    <span className="text-[10px] font-bold text-red-600 leading-none">{log.durationMinutes}m</span>
                                                    <span className="text-[10px] font-bold text-red-600 leading-none">{log.nLevel}B</span>
                                                </div>
                                            </div>
                                        )}
                                      </>
                                  )}
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      );
  };
  
  const renderSettings = () => (
      <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm relative border-4 border-ghibli-wood">
              <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold">✖</button>
              <h2 className="text-2xl font-cute font-bold text-ghibli-dark mb-6 text-center border-b pb-2 border-gray-100">{t.settingsTitle}</h2>
              
              <div className="space-y-6">
                  {/* Language Selection */}
                  <div className="flex flex-col space-y-2">
                      <label className="text-ghibli-wood font-bold">Language / 语言</label>
                      <div className="flex bg-gray-100 rounded-xl p-1">
                          <button
                            onClick={() => setLanguage('zh')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${language === 'zh' ? 'bg-white shadow-sm text-ghibli-green' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                              中文
                          </button>
                          <button
                            onClick={() => setLanguage('en')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${language === 'en' ? 'bg-white shadow-sm text-ghibli-green' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                              English
                          </button>
                      </div>
                  </div>

                  {/* Layout Selection */}
                  <div className="flex flex-col space-y-2">
                      <label className="text-ghibli-wood font-bold">{t.layoutLabel}</label>
                      <div className="flex bg-gray-100 rounded-xl p-1">
                          {[
                             { id: LayoutMode.AUTO, label: t.layoutAuto },
                             { id: LayoutMode.PORTRAIT, label: t.layoutPortrait },
                             { id: LayoutMode.LANDSCAPE, label: t.layoutLandscape }
                          ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => setLayoutMode(opt.id as LayoutMode)}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${layoutMode === opt.id ? 'bg-white shadow-sm text-ghibli-green' : 'text-gray-400 hover:text-gray-600'}`}
                              >
                                  {opt.label}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="mt-8 text-center text-xs text-gray-400">
                  Version 1.1.0 (Bobo Update)
              </div>
          </div>
      </div>
  );

  const renderTutorial = () => {
    const getTutorialStepData = () => {
        switch(tutorialStep) {
            case 0: return { message: t.tutorial.introContent, note: null, problem: null };
            case 1: return { message: t.tutorial.step1Note, note: t.tutorial.memorized, problem: "3 + 3" };
            case 2: return { message: t.tutorial.step2Note, note: "6", problem: "2 + 2" };
            case 3: return { message: t.tutorial.step3Note, note: "4", problem: "5 - 0" };
            case 4: return { message: t.tutorial.step4Note, note: "5", problem: t.game.done };
            case 5: return { message: t.tutorial.step5Content, note: null, problem: null };
            default: return { message: "", note: null, problem: null };
        }
    };
    const data = getTutorialStepData();
    const isIntroOrOutro = tutorialStep === 0 || tutorialStep === 5;
    const isMemorize = tutorialStep === 1;
    const isFlush = tutorialStep === 4;
    const isLandscape = activeLayout === 'LANDSCAPE';

    return (
        <div className={`flex h-full w-full relative overflow-hidden bg-white/50 ${isLandscape ? 'flex-row' : 'flex-col'}`}>
             <div className="absolute top-4 left-4 z-30">
               <button onClick={() => setGameState(GameState.MENU)} className="w-10 h-10 bg-white/80 backdrop-blur border border-ghibli-wood/50 rounded-full flex items-center justify-center shadow-sm active:scale-95 text-xl text-ghibli-wood">🚪</button>
             </div>
             
             <div className={`flex-1 flex w-full p-4 overflow-y-auto no-scrollbar ${isLandscape ? 'flex-row items-center justify-center gap-8' : 'flex-col items-center pt-12'}`}>
                {isIntroOrOutro && (
                    <div className="flex flex-col items-center justify-center h-full space-y-6">
                        <HakimiAvatar mood={HakimiMood.HAPPY} message={data.message} />
                        <button onClick={() => tutorialStep === 0 ? advanceTutorial() : setGameState(GameState.MENU)} className="px-8 py-3 bg-ghibli-green text-white rounded-xl font-cute font-bold text-xl shadow-lg active:scale-95 transition-all">
                            {tutorialStep === 0 ? t.tutorial.next : t.tutorial.finish}
                        </button>
                    </div>
                )}
                {!isIntroOrOutro && (
                    <>
                        {/* Tutorial Content Left/Top */}
                        <div className={`flex flex-col items-center space-y-4 ${isLandscape ? 'w-1/2 max-w-sm' : 'w-full pt-4'}`}>
                            <HakimiAvatar mood={HakimiMood.NEUTRAL} />
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl text-center text-sm font-bold whitespace-pre-line shadow-sm w-full max-w-[280px]">
                                {data.message}
                            </div>
                        </div>

                        {/* Tutorial Action Right/Bottom */}
                        <div className={`flex flex-col items-center space-y-4 ${isLandscape ? 'w-1/2 max-w-sm' : 'w-full'}`}>
                            <div className={`w-64 bg-white border-2 border-ghibli-dark rounded-3xl p-4 shadow-md ${isFlush ? 'opacity-50 grayscale' : ''}`}>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-ghibli-wood font-cute tracking-widest mb-1">{isFlush ? t.game.flush : isMemorize ? t.game.memorize : t.game.current}</p>
                                    <p className="text-4xl font-display font-bold text-ghibli-dark">{data.problem}</p>
                                </div>
                            </div>
                            <div className="w-64 h-14 mt-2">
                                 {isMemorize ? (
                                    <button onClick={advanceTutorial} className="w-full h-full bg-ghibli-accent text-white font-cute font-bold text-xl rounded-2xl shadow-md active:scale-95 transition-transform">{t.tutorial.memorized}</button>
                                 ) : (
                                    <div className="w-full h-full relative">
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-ghibli-green text-white px-3 py-0.5 rounded-full text-xs font-cute shadow-sm z-10 whitespace-nowrap border border-white">{t.game.inputPrompt(1)}</div>
                                        <div className="w-full h-full bg-ghibli-bg border-2 border-ghibli-green border-dashed rounded-2xl flex items-center justify-center">
                                            <span className="text-3xl font-bold text-ghibli-dark tracking-widest"><span className="animate-pulse text-ghibli-accent ml-1">|</span></span>
                                        </div>
                                    </div>
                                 )}
                            </div>
                            
                            {isLandscape && !isMemorize && (
                                <div className="w-full mt-4">
                                     <Numpad onInput={handleInput} onClear={() => {}} disabled={false} highlightKey={tutorialStep === 2 ? 6 : tutorialStep === 3 ? 4 : tutorialStep === 4 ? 5 : null} clearLabel={t.game.clear}/>
                                </div>
                            )}
                        </div>
                    </>
                )}
             </div>

             {!isIntroOrOutro && !isLandscape && (
                <div className={`flex-shrink-0 w-full bg-white rounded-t-[30px] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pt-3 transition-transform duration-500 ease-in-out ${isMemorize ? 'translate-y-full opacity-0 absolute bottom-0' : 'translate-y-0'}`} style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
                    <Numpad onInput={handleInput} onClear={() => {}} disabled={false} highlightKey={tutorialStep === 2 ? 6 : tutorialStep === 3 ? 4 : tutorialStep === 4 ? 5 : null} clearLabel={t.game.clear}/>
                </div>
             )}
        </div>
    );
  };

  const isLandscape = activeLayout === 'LANDSCAPE';

  return (
    <div className="w-full h-[100dvh] bg-[#E0E8D8] flex justify-center items-center overflow-hidden">
       {/* Responsive Container: Max-width limited in Portrait, Expanded in Landscape */}
       <div className={`bg-ghibli-bg flex flex-col relative shadow-2xl transition-all duration-300
           ${isLandscape 
              ? 'w-full max-w-5xl h-[90vh] rounded-[30px] border-4 border-white' // Landscape: Floating card style like a tablet
              : 'w-full max-w-md h-full' // Portrait: Full mobile screen
           }
       `}>
          {gameState === GameState.MENU && menuView === 'MAIN' && renderMainMenu()}
          {gameState === GameState.MENU && menuView === 'ADVENTURE' && renderAdventureMenu()}
          {gameState === GameState.DAILY_SETUP && renderDailySetup()}
          {(gameState === GameState.PLAYING || gameState === GameState.STAGE_TRANSITION) && renderGame()}
          {gameState === GameState.FEEDBACK && renderFeedback()}
          {showCalendar && renderCalendar()}
          {showSettings && renderSettings()}
          {gameState === GameState.TUTORIAL && renderTutorial()}
       </div>
    </div>
  );
};

export default App;