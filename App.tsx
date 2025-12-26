import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameMode, HakimiMood, MathProblem, GameSession, Language, DailyLog, LayoutMode, DailyQuest, QuestType } from './types';
import HakimiAvatar from './components/HakimiAvatar';
import Numpad from './components/Numpad';
import { getHakimiFeedback } from './services/geminiService';

// --- Localization Constants ---
const TEXTS = {
  zh: {
    title: "BOBO\n脑锻炼",
    subtitle: "每日锻炼专注力与记忆力",
    menuMessage: "喵！快来锻炼你的脑子，人类！",
    adventureMenuMessage: "闯关模式！你的极限是第几关？",
    dailySetupMessage: "选择今天的受苦时长喵！",
    dailyBtn: "📅 每日训练",
    adventureBtn: "🚀 闯关模式",
    shopBtn: "🛒 商店",
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
    currencyName: "小鱼干",
    shop: {
        title: "杂货铺",
        freeze: "连胜冻结",
        freezeDesc: "错过一天打卡也能保留连胜天数！",
        owned: "已拥有",
        buy: "购买",
        poor: "小鱼干不足喵！"
    },
    quests: {
        title: "每日任务",
        reset: "每日刷新",
        claimed: "已领取",
        claim: "领取",
        descriptions: {
            [QuestType.PLAY_TIME]: (n: number) => `累计训练 ${n} 分钟`,
            [QuestType.TOTAL_SCORE]: (n: number) => `累计答对 ${n} 题`,
            [QuestType.MAX_COMBO]: (n: number) => `单局达到 ${n} 连击`,
            [QuestType.COMPLETE_SESSION]: (n: number) => `完成 ${n} 次训练`
        }
    },
    tutorial: {
      welcome: "欢迎来到BOBO的脑锻炼！",
      letsStart: "现在来进行一下新手教学吧！",
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
      checkInSaved: "连胜冻结生效！❄️ 连胜已保留",
      adventureSuccess: "闯关成功！解锁下一关！🎉",
      adventureFail: "挑战失败，正确率未达 85%。再试一次！",
      allCleared: "太强了喵！所有关卡已通关！🏆",
      correct: "正确",
      mistake: "错误",
      total: "总题数",
      accuracy: "正确率",
      rewards: "获得奖励"
    }
  },
  en: {
    title: "BOBO\nBrain Training",
    subtitle: "Daily Focus & Memory",
    menuMessage: "Meow! Come train your brain, human!",
    adventureMenuMessage: "Adventure Mode! What's your limit?",
    dailySetupMessage: "Choose your suffering duration!",
    dailyBtn: "📅 Daily Training",
    adventureBtn: "🚀 Adventure Mode",
    shopBtn: "🛒 Shop",
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
    currencyName: "Dried Fish",
    shop: {
        title: "Bobo's Store",
        freeze: "Streak Freeze",
        freezeDesc: "Miss a day without losing your streak!",
        owned: "Owned",
        buy: "Buy",
        poor: "Not enough fish meow!"
    },
    quests: {
        title: "Daily Quests",
        reset: "Resets Daily",
        claimed: "Claimed",
        claim: "Claim",
        descriptions: {
            [QuestType.PLAY_TIME]: (n: number) => `Train for ${n} mins`,
            [QuestType.TOTAL_SCORE]: (n: number) => `Get ${n} correct answers`,
            [QuestType.MAX_COMBO]: (n: number) => `Reach ${n} combo`,
            [QuestType.COMPLETE_SESSION]: (n: number) => `Complete ${n} sessions`
        }
    },
    tutorial: {
      welcome: "Welcome to BOBO Brain Training!",
      letsStart: "Let's do a quick tutorial now!",
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
      checkInSaved: "Streak Freeze Used! ❄️ Streak Saved",
      adventureSuccess: "Success! Next Level Unlocked! 🎉",
      adventureFail: "Failed. Need 85% accuracy to unlock.",
      allCleared: "Amazing! All Levels Cleared! 🏆",
      correct: "Correct",
      mistake: "Wrong",
      total: "Total",
      accuracy: "Accuracy",
      rewards: "Rewards"
    }
  }
};

// --- Constants ---
const ADVENTURE_MAX_LEVEL = 30;
const STREAK_FREEZE_COST = 200;

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
  const [showQuests, setShowQuests] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false); // New state for collapsible menu
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(LayoutMode.PORTRAIT); // Default to PORTRAIT
  const [activeLayout, setActiveLayout] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');

  // --- Persistence State (Initialized Lazily from LocalStorage) ---
  
  const [unlockedLevel, setUnlockedLevel] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('hakimiUnlockLevel') || '1', 10); } catch { return 1; }
  });

  const [dailyMaxLevel, setDailyMaxLevel] = useState<number>(() => {
    // Changed default from 2 to 1 to allow 1-Back start
    try { return parseInt(localStorage.getItem('hakimiDailyMax') || '1', 10); } catch { return 1; }
  });

  const [streak, setStreak] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('hakimiStreak') || '0', 10); } catch { return 0; }
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

  // Gamification States
  const [fishCount, setFishCount] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('hakimiFish') || '0', 10); } catch { return 0; }
  });

  const [hasStreakFreeze, setHasStreakFreeze] = useState<boolean>(() => {
    return localStorage.getItem('hakimiFreeze') === 'true';
  });

  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(() => {
    try {
      const saved = localStorage.getItem('hakimiQuests');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [questDate, setQuestDate] = useState<string>(() => {
      return localStorage.getItem('hakimiQuestDate') || '';
  });

  // New State for Tutorial
  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean>(() => {
    return localStorage.getItem('hakimiHasSeenTutorial') === 'true';
  });

  // --- Auto-Save Effects ---
  useEffect(() => localStorage.setItem('hakimiUnlockLevel', unlockedLevel.toString()), [unlockedLevel]);
  useEffect(() => localStorage.setItem('hakimiDailyMax', dailyMaxLevel.toString()), [dailyMaxLevel]);
  useEffect(() => localStorage.setItem('hakimiStreak', streak.toString()), [streak]);
  useEffect(() => localStorage.setItem('hakimiLastDate', lastCheckInDate), [lastCheckInDate]);
  useEffect(() => localStorage.setItem('hakimiDailyLogs', JSON.stringify(dailyLogs)), [dailyLogs]);
  useEffect(() => localStorage.setItem('hakimiFish', fishCount.toString()), [fishCount]);
  useEffect(() => localStorage.setItem('hakimiFreeze', hasStreakFreeze.toString()), [hasStreakFreeze]);
  useEffect(() => localStorage.setItem('hakimiQuests', JSON.stringify(dailyQuests)), [dailyQuests]);
  useEffect(() => localStorage.setItem('hakimiQuestDate', questDate), [questDate]);
  useEffect(() => localStorage.setItem('hakimiHasSeenTutorial', hasSeenTutorial.toString()), [hasSeenTutorial]);


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

  // Stats & Feedback
  const [sessionData, setSessionData] = useState<GameSession | null>(null);
  const [justCheckedIn, setJustCheckedIn] = useState<boolean>(false);
  const [streakSaved, setStreakSaved] = useState<boolean>(false);
  const [adventureUnlockJustNow, setAdventureUnlockJustNow] = useState<boolean>(false);
  const [adventureSuccess, setAdventureSuccess] = useState<boolean>(false);
  const [earnedFish, setEarnedFish] = useState<number>(0);
  
  // Tutorial State
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  const sessionRef = useRef<GameSession>({
    mode: GameMode.ADVENTURE, nLevel: 1, score: 0, totalQuestions: 0, maxCombo: 0, history: []
  });

  const batchStartRef = useRef<number>(0);
  const lastSpokenRef = useRef<string[]>([]);

  // --- Initialization & Daily Quest Logic ---
  useEffect(() => {
      setHakimiMessage(t.menuMessage);
      initializeDailyQuests();

      // Auto-start tutorial if not seen
      if (!hasSeenTutorial) {
        setTimeout(() => {
          startTutorial(true); // Pass true for first time
          setHasSeenTutorial(true);
        }, 300);
      }
  }, []);

  useEffect(() => {
      if (gameState === GameState.MENU) {
          if (menuView === 'MAIN') setHakimiMessage(t.menuMessage);
          else if (menuView === 'ADVENTURE') setHakimiMessage(t.adventureMenuMessage);
      }
      if (gameState === GameState.DAILY_SETUP) setHakimiMessage(t.dailySetupMessage);
      if (gameState === GameState.SHOP) setHakimiMessage("欢迎光临！请问要买点什么？");
  }, [language, gameState, menuView]);

  const initializeDailyQuests = () => {
    const today = new Date().toISOString().split('T')[0];
    if (questDate !== today) {
        // Generate new quests
        const newQuests: DailyQuest[] = [
            { id: '1', type: QuestType.TOTAL_SCORE, target: 20 + Math.floor(Math.random() * 20), progress: 0, isClaimed: false, description: '', reward: 30 },
            { id: '2', type: QuestType.MAX_COMBO, target: 5 + Math.floor(Math.random() * 5), progress: 0, isClaimed: false, description: '', reward: 40 },
            { id: '3', type: QuestType.PLAY_TIME, target: 3 + Math.floor(Math.random() * 5), progress: 0, isClaimed: false, description: '', reward: 50 },
        ];
        setDailyQuests(newQuests);
        setQuestDate(today);
    }
  };

  const updateQuests = (stats: { score?: number, combo?: number, time?: number, session?: number }) => {
     setDailyQuests(prev => prev.map(q => {
         if (q.isClaimed) return q;
         let newProgress = q.progress;
         if (q.type === QuestType.TOTAL_SCORE && stats.score) newProgress += stats.score;
         if (q.type === QuestType.MAX_COMBO && stats.combo) newProgress = Math.max(newProgress, stats.combo);
         if (q.type === QuestType.PLAY_TIME && stats.time) newProgress += Math.round(stats.time);
         if (q.type === QuestType.COMPLETE_SESSION && stats.session) newProgress += stats.session;
         
         // Cap progress at target
         return { ...q, progress: Math.min(newProgress, q.target) };
     }));
  };

  const claimQuest = (questId: string) => {
      setDailyQuests(prev => prev.map(q => {
          if (q.id === questId && !q.isClaimed && q.progress >= q.target) {
              setFishCount(c => c + q.reward);
              playSound('pop');
              return { ...q, isClaimed: true };
          }
          return q;
      }));
  };

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
    const preferredCN = ["Xiaoxiao", "Yaoyao", "HiuGaai", "Meijia", "Sin-Ji", "Ting-Ting", "Google 汉语", "Google 普通话"];
    const preferredEN = ["Google US English", "Samantha", "Zira", "Ava", "Susan"];

    const targetList = lang === 'zh' ? preferredCN : preferredEN;
    const langCode = lang === 'zh' ? 'zh' : 'en';

    for (const name of targetList) {
        const hit = voices.find(v => v.name.includes(name));
        if (hit) return hit;
    }
    const femaleVoice = voices.find(v => v.lang.startsWith(langCode) && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("woman")));
    if (femaleVoice) return femaleVoice;
    return voices.find(v => v.lang.startsWith(langCode)) || null;
  };

  const speakFeedback = (isGood: boolean) => {
      if (Math.random() > 0.5) return; 
      let pool: string[] = [];
      if (language === 'zh') {
          if (isGood) pool = ["哈基米", "很好", "很棒", "厉害呢", "继续", "就是这样", "南北绿豆"];
          else pool = ["可惜", "曼波"];
      } else {
          if (isGood) pool = ["Good!", "Very Good!", "Awesome!", "OK!", "Amazing!", "Keep going!", "That's it!", "Excellent!"];
          else pool = ["Too bad!", "Mambo!", "Oh no!", "Pity!"];
      }
      const lookBackCount = pool.length > 2 ? 2 : 1;
      const forbidden = lastSpokenRef.current.slice(-lookBackCount);
      const candidates = pool.filter(p => !forbidden.includes(p));
      const finalPool = candidates.length > 0 ? candidates : pool;
      const phrase = finalPool[Math.floor(Math.random() * finalPool.length)];
      lastSpokenRef.current = [...lastSpokenRef.current, phrase].slice(-2);
      
      try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(phrase);
          const preferredVoice = getPreferredVoice(language);
          if (preferredVoice) utterance.voice = preferredVoice;
          utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
          utterance.rate = 1.1; 
          utterance.pitch = 1.25; 
          window.speechSynthesis.speak(utterance);
      } catch (e) { console.warn('TTS failed', e); }
  };

  const speakResult = (accuracy: number) => {
      let text = "";
      if (accuracy >= 0.85) text = language === 'zh' ? "你过关" : "You passed!";
      else if (accuracy >= 0.60) text = language === 'zh' ? "很不错，再试一次吧" : "Good job, try again!";
      else text = "Never gonna give you up"; 
      
      try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          const targetLang = text === "Never gonna give you up" ? 'en' : language;
          const preferredVoice = getPreferredVoice(targetLang);
          if (preferredVoice) utterance.voice = preferredVoice;
          utterance.lang = text === "Never gonna give you up" ? 'en-US' : (language === 'zh' ? 'zh-CN' : 'en-US');
          utterance.rate = 1.1; 
          utterance.pitch = 1.25; 
          window.speechSynthesis.speak(utterance);
      } catch (e) { console.warn('TTS failed', e); }
  };

  const playSound = (type: 'correct' | 'wrong' | 'pop' | 'fanfare' | 'buy') => {
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
          osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'buy') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0, ctx.currentTime + 0.3);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
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
    if (level < 1 || level > ADVENTURE_MAX_LEVEL || level > unlockedLevel + 1) return;
    setGameMode(GameMode.ADVENTURE);
    setNLevel(level);
    initializeBatch(level, 15, GameMode.ADVENTURE);
  };

  const startDailyGame = () => {
    setGameMode(GameMode.DAILY);
    setTimeElapsed(0); 
    // Allow start from 1-Back (Level 1)
    const startLvl = Math.max(1, dailyMaxLevel - 1);
    
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
      // Level 1 has 10 questions, others have 5 * lvl
      const qCount = lvl === 1 ? 10 : 5 * lvl;
      setNLevel(lvl);
      if (sessionRef.current.maxDailyLevelReached === undefined || lvl > sessionRef.current.maxDailyLevelReached) {
          sessionRef.current.maxDailyLevelReached = lvl;
      }
      initializeBatch(lvl, qCount, GameMode.DAILY);
  };

  const initializeBatch = (level: number, questionCount: number, mode: GameMode) => {
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
        sessionRef.current.nLevel = level;
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
    setStreakSaved(false);

    const problems: MathProblem[] = [];
    for(let i=0; i < questionCount; i++) problems.push(generateProblem());
    setProblemQueue(problems);
  };

  const startTutorial = (isFirstTime = false) => {
    setGameState(GameState.TUTORIAL);
    setTutorialStep(isFirstTime ? -2 : 0);
    setHakimiMood(HakimiMood.HAPPY);
    setHakimiMessage(isFirstTime ? t.tutorial.welcome : t.tutorial.introContent);
    setCurrentInput('');
  };

  const handleInput = (num: number) => {
    if (gameState === GameState.TUTORIAL) {
        if (tutorialStep === 2 && num === 6) { playSound('correct'); speakFeedback(true); setTutorialStep(3); setHakimiMood(HakimiMood.HAPPY); }
        else if (tutorialStep === 3 && num === 4) { playSound('correct'); speakFeedback(true); setTutorialStep(4); setHakimiMood(HakimiMood.HAPPY); }
        else if (tutorialStep === 4 && num === 5) { playSound('correct'); speakFeedback(true); setTutorialStep(5); setHakimiMood(HakimiMood.HAPPY); }
        else { playSound('wrong'); setHakimiMood(HakimiMood.ANGRY); setHakimiMessage(t.tutorial.wrong); }
        return;
    }

    if (gameState !== GameState.PLAYING) return;
    setCurrentInput(prev => prev + num.toString());
  };

  useEffect(() => {
      if (gameState !== GameState.PLAYING || currentInput === '') return;
      const targetProblemIndex = currentIndex - nLevel;
      if (targetProblemIndex < 0) return;
      
      const targetProblem = problemQueue[targetProblemIndex];
      if (!targetProblem) return;

      const targetAnswerString = targetProblem.answer.toString();

      if (currentInput === targetAnswerString) submitAnswer(true, targetProblem);
      else if (currentInput.length >= targetAnswerString.length) submitAnswer(false, targetProblem);
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

      const totalExpectedAnswers = problemQueue.length;
      const answersGiven = sessionRef.current.history.length - batchStartRef.current;
      const isLastQuestion = answersGiven >= totalExpectedAnswers;

      if (correct) {
          playSound('correct');
          if (!isLastQuestion) speakFeedback(true);
          if (gameMode === GameMode.ADVENTURE || gameMode === GameMode.DAILY) sessionRef.current.score += 1;
          const newCombo = currentCombo + 1;
          setCurrentCombo(newCombo);
          sessionRef.current.maxCombo = Math.max(sessionRef.current.maxCombo, newCombo);
          setHakimiMood(newCombo > 4 ? HakimiMood.DEVIL : HakimiMood.HAPPY);
      } else {
          playSound('wrong');
          setHakimiMood(HakimiMood.ANGRY);
          setHakimiMessage(t.game.wrong);
          setCurrentCombo(0);
          if (!isLastQuestion) speakFeedback(false); 
      }

      setCurrentInput('');
      const nextIndex = currentIndex + 1;
      const totalStimuli = problemQueue.length;
      
      if (nextIndex < totalStimuli) setCurrentIndex(nextIndex);
      else {
          setCurrentIndex(nextIndex); 
          setHakimiMessage(t.game.flushPrompt);
      }
      
      if (answersGiven >= totalExpectedAnswers) handleBatchComplete();
      else if (nextIndex >= totalStimuli) setHakimiMessage(t.game.flushPrompt);
  };
  
  const handleBatchComplete = () => {
      const count = problemQueue.length;
      const recentHistory = sessionRef.current.history.slice(-count);
      const correctCount = recentHistory.filter(h => h.isCorrect).length;
      const accuracy = correctCount / count;

      speakResult(accuracy);
      
      // Update Daily Quests with batch stats
      updateQuests({
          score: correctCount,
          combo: sessionRef.current.maxCombo,
          time: 0 // We track cumulative time for sessions separately if needed, but simplistic for now
      });

      if (gameMode === GameMode.ADVENTURE) {
          finishGame(accuracy);
      } else {
          const durationSeconds = gameDuration * 60;
          if (timeElapsed >= durationSeconds) {
              finishGame(accuracy);
              return;
          }

          setGameState(GameState.STAGE_TRANSITION);
          let action: 'UP'|'DOWN'|'KEEP' = 'KEEP';
          let nextLevel = nLevel;
          
          if (accuracy >= 0.85) {
              action = 'UP';
              nextLevel = nLevel + 1;
              playSound('fanfare');
          } else if (accuracy < 0.60) {
              action = 'DOWN';
              nextLevel = Math.max(1, nLevel - 1); // Allow drop to 1
          } else {
              action = 'KEEP';
          }
          
          setDailyStageResult({ acc: accuracy, action, nextLevel });
          setTimeout(() => startDailyStage(nextLevel), 2500); 
      }
  };
  
  const advanceMemorization = () => { playSound('pop'); setCurrentIndex(prev => prev + 1); };
  const advanceTutorial = () => { playSound('pop'); setTutorialStep(prev => prev + 1); }

  const finishGame = async (finalBatchAccuracy?: number) => {
      if (gameMode === GameMode.DAILY) sessionRef.current.totalQuestions = sessionRef.current.history.length;

      // Calculate Fish Rewards
      let fishReward = 0;
      // Base reward: 10% of score
      fishReward += Math.floor(sessionRef.current.score * 0.5);
      
      setGameState(GameState.FEEDBACK);
      setSessionData({...sessionRef.current}); 
      setHakimiMood(HakimiMood.THINKING);
      setHakimiMessage(t.game.calculating);
      
      let unlockMsg = "";
      if (gameMode === GameMode.ADVENTURE) {
           const acc = finalBatchAccuracy || 0;
           if (acc >= 0.85) {
               setAdventureSuccess(true);
               playSound('fanfare');
               fishReward += 10; // Bonus for clear
               if (nLevel === unlockedLevel && unlockedLevel < ADVENTURE_MAX_LEVEL) {
                   setUnlockedLevel(unlockedLevel + 1);
                   setAdventureUnlockJustNow(true);
                   fishReward += 50; // Big bonus for first clear
                   unlockMsg = " " + t.feedback.adventureSuccess;
               } else if (nLevel === ADVENTURE_MAX_LEVEL) unlockMsg = " " + t.feedback.allCleared;
               else unlockMsg = " " + t.feedback.adventureSuccess;
           } else setAdventureSuccess(false);
      } else if (gameMode === GameMode.DAILY) {
           handleDailyCheckIn();
           saveDailyLog();
           fishReward += 20; // Daily reward
           const maxReached = sessionRef.current.maxDailyLevelReached || 2;
           if (maxReached > dailyMaxLevel) setDailyMaxLevel(maxReached);
           
           // Update Play Time Quest
           updateQuests({ time: Math.ceil(timeElapsed / 60) });
      }

      setEarnedFish(fishReward);
      setFishCount(prev => prev + fishReward);

      const feedback = await getHakimiFeedback(sessionRef.current, language);
      setHakimiMessage(feedback + (unlockMsg ? `\n${unlockMsg}` : ""));
      
      const accuracy = sessionRef.current.score / Math.max(1, sessionRef.current.totalQuestions);
      setHakimiMood(accuracy > 0.8 ? HakimiMood.HAPPY : HakimiMood.ANGRY);
  };

  const handleDailyCheckIn = () => {
      const today = new Date().toISOString().split('T')[0];
      if (lastCheckInDate === today) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastCheckInDate === yesterdayStr) {
          setStreak(streak + 1);
          setJustCheckedIn(true);
      } else if (lastCheckInDate) {
          // Missed at least one day
          const lastDate = new Date(lastCheckInDate);
          const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          
          if (diffDays > 1 && hasStreakFreeze) {
              // Freeze protects the streak!
              setHasStreakFreeze(false); // Consume item
              setStreakSaved(true);
              setStreak(streak + 1); // Keep counting
              setJustCheckedIn(true);
          } else if (diffDays > 1) {
              setStreak(1); // Reset
              setJustCheckedIn(true);
          }
      } else {
          setStreak(1);
          setJustCheckedIn(true);
      }
      setLastCheckInDate(today);
  };

  const saveDailyLog = () => {
      const today = new Date().toISOString().split('T')[0];
      const newLog: DailyLog = {
          date: today,
          durationMinutes: gameDuration,
          nLevel: sessionRef.current.maxDailyLevelReached || 2,
          score: sessionRef.current.score
      };
      setDailyLogs(prevLogs => [...prevLogs, newLog]);
  };

  // --- Renderers ---

  const renderShop = () => (
      <div className="flex flex-col h-full w-full bg-[#FFF8E1] animate-fade-in relative">
           {/* Header */}
           <div className="flex items-center justify-between p-6 bg-white shadow-sm z-10">
               <button onClick={() => setGameState(GameState.MENU)} className="text-xl">↩️</button>
               <h1 className="text-2xl font-cute font-bold text-ghibli-wood">{t.shop.title}</h1>
               <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                    <span>🐟</span>
                    <span className="font-bold text-ghibli-wood">{fishCount}</span>
               </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex flex-col items-center mb-6">
                    <HakimiAvatar mood={HakimiMood.HAPPY} message={t.game.checkIn + ": " + streak + " " + t.game.days} />
                </div>

                {/* Freeze Item Card */}
                <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-blue-100 flex items-center justify-between relative overflow-hidden">
                    <div className="flex items-center gap-4 z-10">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                            🧊
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-ghibli-dark">{t.shop.freeze}</h3>
                            <p className="text-xs text-gray-500 max-w-[150px] leading-tight mt-1">{t.shop.freezeDesc}</p>
                        </div>
                    </div>
                    
                    <div className="z-10">
                        {hasStreakFreeze ? (
                            <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 font-bold rounded-xl">{t.shop.owned}</button>
                        ) : (
                            <button 
                                onClick={() => {
                                    if (fishCount >= STREAK_FREEZE_COST) {
                                        setFishCount(c => c - STREAK_FREEZE_COST);
                                        setHasStreakFreeze(true);
                                        playSound('buy');
                                    } else {
                                        playSound('wrong');
                                        setHakimiMessage(t.shop.poor);
                                    }
                                }}
                                className={`px-4 py-2 rounded-xl font-bold shadow-md active:scale-95 transition-all text-white ${fishCount >= STREAK_FREEZE_COST ? 'bg-ghibli-sky shadow-blue-200' : 'bg-gray-300'}`}
                            >
                                <div className="flex flex-col items-center leading-none">
                                    <span className="text-sm">{t.shop.buy}</span>
                                    <span className="text-[10px]">🐟 {STREAK_FREEZE_COST}</span>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Placeholder for Skins */}
                <div className="opacity-50 grayscale pointer-events-none">
                     <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-yellow-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center text-4xl">
                                👑
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-ghibli-dark">Golden Bobo</h3>
                                <p className="text-xs text-gray-500">Coming Soon...</p>
                            </div>
                        </div>
                     </div>
                </div>
           </div>
      </div>
  );

  const renderMainMenu = () => (
    <div className={`flex flex-col items-center justify-center w-full h-full p-6 animate-fade-in relative transition-all duration-300 ${activeLayout === 'LANDSCAPE' ? 'flex-row space-x-12' : 'space-y-6'}`}>
      <div className="absolute top-4 left-4 z-20 flex gap-2">
          <button onClick={() => setShowSettings(true)} className="w-10 h-10 bg-white border border-ghibli-wood rounded-full flex items-center justify-center shadow-sm active:scale-95 text-xl text-ghibli-wood" title={t.settingsTitle}>⚙️</button>
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur px-3 rounded-full border border-ghibli-wood/20 h-10 shadow-sm">
             <span className="text-lg">🐟</span>
             <span className="font-bold text-ghibli-wood text-sm">{fishCount}</span>
          </div>
      </div>
      
      {/* Main Content Group (Title + Avatar) */}
      <div className={`flex flex-col items-center ${activeLayout === 'LANDSCAPE' ? 'w-1/2 items-end' : 'w-full'}`}>
          <div className="relative w-full text-center mt-8 mb-4">
            <h1 className="text-5xl font-cute font-bold text-ghibli-green tracking-wide drop-shadow-sm whitespace-pre-line leading-tight">{t.title}</h1>
            <p className="text-ghibli-wood font-cute text-lg opacity-80">{t.subtitle}</p>
            
            {/* Right Side Collapsible Menu */}
            <div className="absolute top-24 right-4 z-30 flex flex-col items-end gap-3">
                
                {/* Toggle Button - Now at the TOP */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`w-12 h-12 bg-ghibli-dark text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all text-xl border-2 border-white z-40`}
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>

                {/* Collapsible Items - Now BELOW the button (Expanding Downwards) */}
                <div className={`flex flex-col gap-3 transition-all duration-300 origin-top ${isMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 -translate-y-10 pointer-events-none h-0'}`}>
                    <button onClick={() => startTutorial(false)} className="w-10 h-10 bg-white border border-ghibli-sky rounded-full flex items-center justify-center shadow-sm active:scale-95 text-xl" title={t.tutorialBtn}>🎓</button>
                    <button onClick={() => setShowCalendar(true)} className="w-10 h-10 bg-white border border-ghibli-wood rounded-full flex items-center justify-center shadow-sm active:scale-95 text-xl" title={t.calendarTitle}>📅</button>
                    <button onClick={() => setShowQuests(true)} className="w-10 h-10 bg-white border border-ghibli-accent rounded-full flex items-center justify-center shadow-sm active:scale-95 text-xl relative" title={t.quests.title}>
                      📜
                      {dailyQuests.some(q => q.progress >= q.target && !q.isClaimed) && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                      )}
                    </button>
                    <button onClick={() => setGameState(GameState.SHOP)} className="w-10 h-10 bg-white border border-orange-300 rounded-full flex items-center justify-center shadow-sm active:scale-95 text-xl" title={t.shopBtn}>🛒</button>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
             <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-2 shadow-sm">
                 <span>🔥 {t.game.checkIn}: {streak} {t.game.days}</span>
             </div>
             {hasStreakFreeze && <span className="text-xl" title={t.shop.freeze}>🧊</span>}
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
                 <div className="flex gap-2">
                     <div className="text-xs text-ghibli-wood bg-white px-2 py-1 rounded-lg border border-ghibli-wood/30">
                         Max: 30-Back
                     </div>
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
                                
                                {isCurrent && <div className="absolute inset-0 bg-orange-50 -z-0 opacity-50"></div>}
                            </button>
                        );
                    })}
                </div>
            </div>

            <button onClick={() => setMenuView('MAIN')} className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-8 py-3 bg-white border-2 border-ghibli-wood text-ghibli-wood font-cute font-bold rounded-full shadow-lg active:scale-95 transition-all z-20">
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
                        type="range" min="1" max="10" value={gameDuration} onChange={(e) => setGameDuration(parseInt(e.target.value))}
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
                          {Math.max(1, dailyMaxLevel - 1)}-Back
                      </span>
                  </div>
              </div>

              <button onClick={startDailyGame} className="w-full py-3 bg-ghibli-dark text-white rounded-2xl text-xl font-cute font-bold shadow-lg active:scale-95 transition-all">
                 {t.daily.start}
              </button>
              
              <button onClick={() => setGameState(GameState.MENU)} className="text-ghibli-wood font-cute font-bold opacity-60 hover:opacity-100 text-center">
                 {t.menuBack}
              </button>
          </div>
      </div>
  );

  const renderGame = () => {
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
      const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
      const isLandscape = activeLayout === 'LANDSCAPE';

      return (
        <div className={`flex h-full w-full relative overflow-hidden ${isLandscape ? 'flex-row' : 'flex-col'}`}>
           <div className="absolute top-4 left-4 z-30">
               <button onClick={() => setGameState(GameState.MENU)} className="w-10 h-10 bg-white/80 backdrop-blur border border-ghibli-wood/50 rounded-full flex items-center justify-center shadow-sm active:scale-95 text-xl text-ghibli-wood">🚪</button>
           </div>
           
           <div className={`flex-1 flex w-full relative overflow-y-auto no-scrollbar ${isLandscape ? 'flex-row items-center justify-center p-8 gap-8' : 'flex-col items-center'}`}>
               <div className={`flex flex-col items-center justify-center ${isLandscape ? 'w-1/2 max-w-sm h-full' : 'w-full'}`}>
                   <div className="w-full px-5 py-2 flex justify-between items-end z-10 min-h-[60px] pt-12">
                     <div className="text-ghibli-wood font-bold font-cute text-lg">{t.game.difficulty}: {nLevel}-B</div>
                     <div className="text-ghibli-accent font-bold font-cute text-xl">
                        {gameMode === GameMode.ADVENTURE ? `${t.game.combo} x${currentCombo}` : `${formatTime(timeElapsed)} / ${gameDuration}m`}
                     </div>
                   </div>
                   <div className="flex-shrink-0 w-full max-w-xs">
                       <HakimiAvatar mood={hakimiMood} message={hakimiMessage} />
                   </div>
               </div>

               <div className={`flex flex-col items-center justify-center space-y-6 ${isLandscape ? 'w-1/2 max-w-sm h-full justify-center' : 'w-full p-2 flex-1'}`}>
                   <div className={`w-64 flex-shrink-0 bg-white border-2 border-ghibli-dark rounded-3xl p-4 shadow-md transition-all duration-300 transform ${isFlushPhase ? 'opacity-50 scale-95 grayscale' : ''}`}>
                      <div className="text-center">
                          <p className="text-xs font-bold text-ghibli-wood font-cute tracking-widest mb-1">{isFlushPhase ? t.game.flush : isMemorizationPhase ? t.game.memorize : t.game.current}</p>
                          <p className="text-4xl font-display font-bold text-ghibli-dark">{isFlushPhase ? t.game.done : displayProblem?.expression}</p>
                      </div>
                   </div>
                   <div className="w-64 h-14 flex-shrink-0">
                        {isMemorizationPhase ? (
                            <button onClick={advanceMemorization} className="w-full h-full bg-ghibli-accent text-white font-cute font-bold text-xl rounded-2xl shadow-md active:scale-95 transition-transform">{t.game.memorizedBtn}</button>
                        ) : (
                            <div className="w-full h-full relative">
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-ghibli-green text-white px-3 py-0.5 rounded-full text-xs font-cute shadow-sm z-10 whitespace-nowrap border border-white">{t.game.inputPrompt(nLevel)}</div>
                                <div className="w-full h-full bg-ghibli-bg border-2 border-ghibli-green border-dashed rounded-2xl flex items-center justify-center">
                                    <span className="text-3xl font-bold text-ghibli-dark tracking-widest">{currentInput}<span className="animate-pulse text-ghibli-accent ml-1">|</span></span>
                                </div>
                            </div>
                        )}
                   </div>
                   {isLandscape && <div className="w-full mt-4"><Numpad onInput={handleInput} onClear={() => setCurrentInput('')} disabled={isMemorizationPhase} clearLabel={t.game.clear}/></div>}
               </div>
           </div>
           {!isLandscape && (
               <div className="flex-shrink-0 w-full bg-white rounded-t-[30px] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pt-3 z-20" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
                   <Numpad onInput={handleInput} onClear={() => setCurrentInput('')} disabled={isMemorizationPhase} clearLabel={t.game.clear}/>
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
        <div className="flex flex-col items-center max-w-sm w-full">
            <h2 className="text-3xl font-cute font-bold text-ghibli-dark mb-4">{t.feedback.title}</h2>
            {justCheckedIn && (
                <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded shadow-md w-full mb-4 animate-bounce">
                    <p className="font-bold">{t.feedback.checkInSuccess} {streak} {t.game.days}!</p>
                </div>
            )}
            {streakSaved && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-md w-full mb-4">
                    <p className="font-bold">{t.feedback.checkInSaved}</p>
                </div>
            )}
            {adventureUnlockJustNow && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md w-full mb-4 animate-bounce">
                    <p className="font-bold">{t.feedback.adventureSuccess}</p>
                </div>
            )}
            <HakimiAvatar mood={hakimiMood} message={hakimiMessage} />
        </div>
        
        <div className="flex flex-col items-center max-w-sm w-full space-y-6">
            <div className="w-full bg-white border-2 border-ghibli-green rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(232,168,124,0.4)]">
               {/* Rewards Section */}
               <div className="flex items-center justify-center gap-2 mb-4 bg-orange-50 rounded-xl p-2 border border-orange-100">
                   <span className="font-cute font-bold text-orange-600 uppercase text-xs">{t.feedback.rewards}</span>
                   <div className="flex items-center gap-1">
                       <span className="text-2xl animate-bounce">🐟</span>
                       <span className="text-2xl font-bold text-ghibli-wood">+{earnedFish}</span>
                   </div>
               </div>

               {sessionData?.mode === GameMode.DAILY ? (
                 <>
                    <div className="flex flex-col items-center border-b-2 border-gray-100 pb-4 mb-4">
                        <span className="text-ghibli-wood font-cute font-bold opacity-60 text-sm tracking-wider uppercase">{t.feedback.accuracy}</span>
                        <div className={`text-6xl font-display font-bold ${accuracy >= 85 ? 'text-ghibli-green' : accuracy >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>{accuracy}<span className="text-3xl">%</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                         <div className="bg-[#EDF7ED] rounded-2xl p-3 flex flex-col items-center justify-center border border-[#C8E6C9]"><span className="text-green-600 font-bold text-xs uppercase mb-1">{t.feedback.correct}</span><span className="text-2xl font-display font-bold text-green-700">{correct}</span></div>
                         <div className="bg-[#FDEDED] rounded-2xl p-3 flex flex-col items-center justify-center border border-[#FFCDD2]"><span className="text-red-500 font-bold text-xs uppercase mb-1">{t.feedback.mistake}</span><span className="text-2xl font-display font-bold text-red-600">{wrong}</span></div>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-2 text-sm font-bold text-ghibli-wood">
                         <div className="flex items-center gap-1"><span>⏱</span><span>{Math.floor((sessionData.durationMinutes || 0))} min</span></div>
                         <div className="w-px h-4 bg-gray-300"></div>
                         <div className="flex items-center gap-1"><span>🏔</span><span>Peak: {sessionData.maxDailyLevelReached}-B</span></div>
                    </div>
                 </>
               ) : (
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
                       <div className="text-center bg-green-50 rounded-lg py-1 border border-green-100 text-green-700 font-bold text-sm">✔ {correct}</div>
                       <div className="text-center bg-red-50 rounded-lg py-1 border border-red-100 text-red-600 font-bold text-sm">✖ {wrong}</div>
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
                               <button onClick={() => startAdventureGame(nLevel + 1)} className="w-full py-3 bg-ghibli-accent text-white rounded-2xl font-cute text-xl font-bold shadow-lg active:scale-95 transition-all">{t.feedback.nextLevel}</button>
                           ) : (
                               <div className="w-full py-3 bg-yellow-400 text-white rounded-2xl font-cute text-xl font-bold shadow-lg text-center animate-pulse">🏆 {t.feedback.allCleared}</div>
                           )}
                       </>
                   ) : (
                       <button onClick={() => startAdventureGame(nLevel)} className="w-full py-3 bg-ghibli-green text-white rounded-2xl font-cute text-xl font-bold shadow-lg active:scale-95 transition-all">{t.feedback.retry}</button>
                   )}
                 </>
              ) : (
                 <button onClick={startDailyGame} className="w-full py-3 bg-ghibli-green text-white rounded-2xl font-cute text-xl font-bold shadow-lg active:scale-95 transition-all">{t.feedback.retry}</button>
              )}
              <button onClick={() => { setGameState(GameState.MENU); setMenuView('MAIN'); }} className="w-full py-3 bg-white border-2 border-ghibli-wood text-ghibli-wood rounded-2xl font-cute text-xl font-bold shadow-sm active:scale-95 transition-all">{t.feedback.back}</button>
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
          return dailyLogs.filter(log => log.date === dateStr).pop();
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
  
  const renderQuestsModal = () => (
      <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm relative border-4 border-ghibli-wood">
              <button onClick={() => setShowQuests(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold">✖</button>
              <div className="flex justify-between items-center mb-6 border-b pb-2 border-gray-100">
                  <h2 className="text-2xl font-cute font-bold text-ghibli-dark">{t.quests.title}</h2>
                  <span className="text-xs text-gray-500">{t.quests.reset}</span>
              </div>
              
              <div className="space-y-3">
                  {dailyQuests.map(q => (
                      <div key={q.id} className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-gray-200">
                          <div className="flex flex-col flex-1 mr-4">
                              <span className="text-sm font-bold text-gray-700">{t.quests.descriptions[q.type](q.target)}</span>
                              <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-ghibli-accent transition-all duration-500" style={{width: `${Math.min(100, (q.progress/q.target)*100)}%`}}></div>
                              </div>
                          </div>
                          <div className="flex-shrink-0">
                            {q.isClaimed ? (
                                <span className="text-lg font-bold text-green-500">✔</span>
                            ) : q.progress >= q.target ? (
                                <button onClick={() => claimQuest(q.id)} className="px-3 py-1 bg-yellow-400 text-white rounded-lg text-sm font-bold animate-pulse shadow-sm active:scale-95">{t.quests.claim}</button>
                            ) : (
                                <span className="text-xs font-bold text-gray-400">{q.progress}/{q.target}</span>
                            )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderSettings = () => (
      <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm relative border-4 border-ghibli-wood">
              <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold">✖</button>
              <h2 className="text-2xl font-cute font-bold text-ghibli-dark mb-6 text-center border-b pb-2 border-gray-100">{t.settingsTitle}</h2>
              <div className="space-y-6">
                  <div className="flex flex-col space-y-2">
                      <label className="text-ghibli-wood font-bold">Language / 语言</label>
                      <div className="flex bg-gray-100 rounded-xl p-1">
                          <button onClick={() => setLanguage('zh')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${language === 'zh' ? 'bg-white shadow-sm text-ghibli-green' : 'text-gray-400 hover:text-gray-600'}`}>中文</button>
                          <button onClick={() => setLanguage('en')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${language === 'en' ? 'bg-white shadow-sm text-ghibli-green' : 'text-gray-400 hover:text-gray-600'}`}>English</button>
                      </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                      <label className="text-ghibli-wood font-bold">{t.layoutLabel}</label>
                      <div className="flex bg-gray-100 rounded-xl p-1">
                          {[{ id: LayoutMode.AUTO, label: t.layoutAuto }, { id: LayoutMode.PORTRAIT, label: t.layoutPortrait }, { id: LayoutMode.LANDSCAPE, label: t.layoutLandscape }].map((opt) => (
                              <button key={opt.id} onClick={() => setLayoutMode(opt.id as LayoutMode)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${layoutMode === opt.id ? 'bg-white shadow-sm text-ghibli-green' : 'text-gray-400 hover:text-gray-600'}`}>{opt.label}</button>
                          ))}
                      </div>
                  </div>
              </div>
              <div className="mt-8 text-center text-xs text-gray-400">Version 1.2.0 (Gamification Update)</div>
          </div>
      </div>
  );

  const renderTutorial = () => {
    const getTutorialStepData = () => {
        switch(tutorialStep) {
            case -2: return { message: t.tutorial.welcome, note: null, problem: null };
            case -1: return { message: t.tutorial.letsStart, note: null, problem: null };
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
    const isIntroOrOutro = tutorialStep <= 0 || tutorialStep === 5;
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
                        <button onClick={() => tutorialStep === 5 ? setGameState(GameState.MENU) : advanceTutorial()} className="px-8 py-3 bg-ghibli-green text-white rounded-xl font-cute font-bold text-xl shadow-lg active:scale-95 transition-all">
                            {tutorialStep === 5 ? t.tutorial.finish : t.tutorial.next}
                        </button>
                    </div>
                )}
                {!isIntroOrOutro && (
                    <>
                        <div className={`flex flex-col items-center space-y-4 ${isLandscape ? 'w-1/2 max-w-sm' : 'w-full pt-4'}`}>
                            <HakimiAvatar mood={HakimiMood.NEUTRAL} />
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl text-center text-sm font-bold whitespace-pre-line shadow-sm w-full max-w-[280px]">{data.message}</div>
                        </div>
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
                                        <div className="w-full h-full bg-ghibli-bg border-2 border-ghibli-green border-dashed rounded-2xl flex items-center justify-center"><span className="text-3xl font-bold text-ghibli-dark tracking-widest"><span className="animate-pulse text-ghibli-accent ml-1">|</span></span></div>
                                    </div>
                                 )}
                            </div>
                            {isLandscape && !isMemorize && <div className="w-full mt-4"><Numpad onInput={handleInput} onClear={() => {}} disabled={false} highlightKey={tutorialStep === 2 ? 6 : tutorialStep === 3 ? 4 : tutorialStep === 4 ? 5 : null} clearLabel={t.game.clear}/></div>}
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
       <div className={`bg-ghibli-bg flex flex-col relative shadow-2xl transition-all duration-300 ${isLandscape ? 'w-full max-w-5xl h-[90vh] rounded-[30px] border-4 border-white' : 'w-full max-w-md h-full'}`}>
          {gameState === GameState.MENU && menuView === 'MAIN' && renderMainMenu()}
          {gameState === GameState.MENU && menuView === 'ADVENTURE' && renderAdventureMenu()}
          {gameState === GameState.DAILY_SETUP && renderDailySetup()}
          {gameState === GameState.SHOP && renderShop()}
          {(gameState === GameState.PLAYING || gameState === GameState.STAGE_TRANSITION) && renderGame()}
          {gameState === GameState.FEEDBACK && renderFeedback()}
          {showCalendar && renderCalendar()}
          {showSettings && renderSettings()}
          {showQuests && renderQuestsModal()}
          {gameState === GameState.TUTORIAL && renderTutorial()}
       </div>
    </div>
  );
};

export default App;