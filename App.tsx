
import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameMode, HakimiMood, MathProblem, GameSession, Language, DailyLog } from './types';
import HakimiAvatar from './components/HakimiAvatar';
import Numpad from './components/Numpad';
import { getHakimiFeedback } from './services/geminiService';

// --- Localization Constants ---
const TEXTS = {
  zh: {
    title: "哈基米\n魔鬼特训",
    subtitle: "N-Back 脑力燃烧",
    menuMessage: "喵！快来锻炼你的脑子，人类！",
    classicMenuMessage: "选择你的受苦等级喵！",
    dailySetupMessage: "定制今天的特训计划！",
    dailyBtn: "📅 每日训练",
    classicModeBtn: "🔥 经典模式",
    menuBack: "↩️ 返回",
    levelSuffix: "-Back",
    levelEasy: "(入门)",
    levelNormal: "(普通)",
    levelHard: "(困难)",
    levelDevil: "(魔鬼)",
    calendarTitle: "特训打卡记录",
    tutorialBtn: "新手教程",
    tutorial: {
      introTitle: "哈基米小课堂",
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
      time: "时间",
      memorize: "记住这个！",
      current: "当前题目",
      flush: "清空缓存...",
      done: "完成",
      memorizedBtn: "记住了！",
      inputPrompt: (n: number) => `输入 ${n} 轮前的答案`,
      flushPrompt: "清空大脑缓存！回答！",
      clear: "清除",
      wrong: "嘶——！错啦！",
      levelStart: (n: number) => `难度 ${n}-Back! 快记住！`,
      calculating: "本喵正在计算你的脑年龄...",
      checkIn: "连续打卡",
      days: "天",
      quit: "退出"
    },
    daily: {
      selectTime: "选择时间",
      selectLevel: "选择难度",
      min: "分钟",
      start: "开始特训",
      stamp: "打卡"
    },
    feedback: {
      title: "特训结束",
      score: "最终得分",
      maxCombo: "最大连击",
      back: "返回菜单",
      checkInSuccess: "打卡成功！已连续坚持"
    }
  },
  en: {
    title: "Hakimi\nDevil Training",
    subtitle: "N-Back Brain Burn",
    menuMessage: "Meow! Come train your brain, human!",
    classicMenuMessage: "Choose your suffering level!",
    dailySetupMessage: "Customize today's training!",
    dailyBtn: "📅 Daily Training",
    classicModeBtn: "🔥 Classic Mode",
    menuBack: "↩️ Back",
    levelSuffix: "-Back",
    levelEasy: "(Easy)",
    levelNormal: "(Normal)",
    levelHard: "(Hard)",
    levelDevil: "(Devil)",
    calendarTitle: "Training Log",
    tutorialBtn: "Tutorial",
    tutorial: {
      introTitle: "Hakimi Class",
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
      levelStart: (n: number) => `Level ${n}-Back! Focus!`,
      calculating: "Calculating brain age...",
      checkIn: "Streak",
      days: "Days",
      quit: "Quit"
    },
    daily: {
      selectTime: "Select Time",
      selectLevel: "Select Level",
      min: "min",
      start: "Start Training",
      stamp: "Stamp"
    },
    feedback: {
      title: "Training Over",
      score: "Final Score",
      maxCombo: "Max Combo",
      back: "Back to Menu",
      checkInSuccess: "Check-in! Streak:"
    }
  }
};

// --- Constants ---
const CLASSIC_ROUNDS = 15; 

const generateProblem = (): MathProblem => {
  const op = Math.random() > 0.5 ? '+' : '-';
  let a, b, ans;
  
  // Constrain result to single digit 0-9
  if (op === '+') {
      // a + b = ans (0-9)
      ans = Math.floor(Math.random() * 10); 
      a = Math.floor(Math.random() * (ans + 1));
      b = ans - a;
  } else {
      // a - b = ans (0-9)
      // a (0-9), b (0-a) to ensure result >= 0
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
  const [menuView, setMenuView] = useState<'MAIN' | 'CLASSIC'>('MAIN'); 
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  // Game Config
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.CLASSIC);
  const [nLevel, setNLevel] = useState<number>(1);
  const [gameDuration, setGameDuration] = useState<number>(3); // Minutes
  const [timeLeft, setTimeLeft] = useState<number>(0); // Seconds

  // Hakimi State
  const [hakimiMood, setHakimiMood] = useState<HakimiMood>(HakimiMood.NEUTRAL);
  const [hakimiMessage, setHakimiMessage] = useState<string>("");
  
  // Game Logic State
  const [problemQueue, setProblemQueue] = useState<MathProblem[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentCombo, setCurrentCombo] = useState<number>(0);
  
  // Stats
  const [sessionData, setSessionData] = useState<GameSession | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [justCheckedIn, setJustCheckedIn] = useState<boolean>(false);
  
  // Tutorial State
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  const sessionRef = useRef<GameSession>({
    mode: GameMode.CLASSIC, nLevel: 1, score: 0, totalQuestions: 0, maxCombo: 0, history: []
  });

  // --- Initialization ---
  useEffect(() => {
      const storedStreak = localStorage.getItem('hakimiStreak');
      if (storedStreak) setStreak(parseInt(storedStreak, 10));

      const storedLogs = localStorage.getItem('hakimiDailyLogs');
      if (storedLogs) setDailyLogs(JSON.parse(storedLogs));

      setHakimiMessage(t.menuMessage);
  }, []);

  useEffect(() => {
      // Update message text when language changes
      if (gameState === GameState.MENU) {
          if (menuView === 'MAIN') setHakimiMessage(t.menuMessage);
          else if (menuView === 'CLASSIC') setHakimiMessage(t.classicMenuMessage);
      }
      if (gameState === GameState.DAILY_SETUP) setHakimiMessage(t.dailySetupMessage);
  }, [language, gameState, menuView]);

  // --- Timer Logic (Daily Mode) ---
  useEffect(() => {
    let timerId: any;
    if (gameState === GameState.PLAYING && gameMode === GameMode.DAILY) {
      if (timeLeft > 0) {
        timerId = setInterval(() => {
          setTimeLeft(prev => prev - 1);
        }, 1000);
      } else {
        // Time is up!
        finishGame();
      }
    }
    return () => clearInterval(timerId);
  }, [gameState, gameMode, timeLeft]);

  // --- Infinite Problem Generation (Daily Mode) ---
  useEffect(() => {
    if (gameState === GameState.PLAYING && gameMode === GameMode.DAILY) {
      // Keep queue buffer at least 5 ahead
      if (currentIndex + 5 >= problemQueue.length) {
        const newProblems = Array(5).fill(null).map(generateProblem);
        setProblemQueue(prev => [...prev, ...newProblems]);
      }
    }
  }, [currentIndex, problemQueue, gameState, gameMode]);


  // --- Sound Effects ---
  const playSound = (type: 'correct' | 'wrong' | 'pop') => {
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
  const startClassicGame = (level: number) => {
    setGameMode(GameMode.CLASSIC);
    setNLevel(level);
    initializeGame(level, CLASSIC_ROUNDS);
  };

  const startDailyGame = () => {
    setGameMode(GameMode.DAILY);
    // nLevel and gameDuration are already set in setup screen
    setTimeLeft(gameDuration * 60);
    // Initial batch bigger for infinite scroll
    initializeGame(nLevel, 20); 
  };

  const initializeGame = (level: number, initialCount: number) => {
    setGameState(GameState.PLAYING);
    setHakimiMood(HakimiMood.NEUTRAL);
    setHakimiMessage(t.game.levelStart(level));
    setCurrentInput('');
    setCurrentIndex(0);
    setCurrentCombo(0);
    setJustCheckedIn(false);
    
    sessionRef.current = {
      mode: gameMode,
      nLevel: level,
      score: 0,
      totalQuestions: gameMode === GameMode.CLASSIC ? initialCount : 0, // In daily mode total counts up
      maxCombo: 0,
      history: [],
      durationMinutes: gameMode === GameMode.DAILY ? gameDuration : undefined
    };

    const problems: MathProblem[] = [];
    for(let i=0; i < initialCount; i++) {
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
             setTutorialStep(3);
             setHakimiMood(HakimiMood.HAPPY);
        } else if (tutorialStep === 3 && num === 4) {
             playSound('correct');
             setTutorialStep(4);
             setHakimiMood(HakimiMood.HAPPY);
        } else if (tutorialStep === 4 && num === 5) {
             playSound('correct');
             setTutorialStep(5);
             setHakimiMood(HakimiMood.HAPPY);
        } else {
             playSound('wrong');
             setHakimiMood(HakimiMood.ANGRY);
             setHakimiMessage(t.tutorial.wrong);
        }
        return;
    }

    // Normal Game Logic
    if (gameState !== GameState.PLAYING) return;
    const newVal = currentInput + num.toString();
    setCurrentInput(newVal);
  };

  useEffect(() => {
      if (gameState !== GameState.PLAYING) return;
      if (currentInput === '') return;

      const targetProblemIndex = currentIndex - nLevel;
      if (targetProblemIndex < 0) return;
      
      const targetProblem = problemQueue[targetProblemIndex];
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
          timeTakenMs: 0
      });

      if (correct) {
          playSound('correct');
          sessionRef.current.score += 1;
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
      }

      setCurrentInput('');
      const nextIndex = currentIndex + 1;

      // Mode specific continuation
      if (gameMode === GameMode.CLASSIC) {
          const totalRoundWithFlush = CLASSIC_ROUNDS + nLevel;
          if (nextIndex >= totalRoundWithFlush) {
              finishGame();
          } else {
              setCurrentIndex(nextIndex);
              if (nextIndex >= CLASSIC_ROUNDS) {
                  setHakimiMessage(t.game.flushPrompt);
              }
          }
      } else {
          // Daily Mode runs until timer
          setCurrentIndex(nextIndex);
          sessionRef.current.totalQuestions = nextIndex; // Update total count roughly
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

  const finishGame = async () => {
      setGameState(GameState.FEEDBACK);
      setSessionData(sessionRef.current);
      setHakimiMood(HakimiMood.THINKING);
      setHakimiMessage(t.game.calculating);
      
      // Update Total Questions for accuracy calc
      // Classic: Fixed. Daily: Based on how many were answered.
      const historyLength = sessionRef.current.history.length;
      if (historyLength > 0) {
        sessionRef.current.totalQuestions = historyLength;
      }

      // Check-in Logic
      // Only check in if Daily Mode or if Classic Mode was completed
      if (gameMode === GameMode.DAILY || (gameMode === GameMode.CLASSIC && sessionRef.current.score > 0)) {
        handleDailyCheckIn();
        if (gameMode === GameMode.DAILY) {
            saveDailyLog();
        }
      }

      const feedback = await getHakimiFeedback(sessionRef.current, language);
      setHakimiMessage(feedback);
      
      const accuracy = sessionRef.current.score / Math.max(1, sessionRef.current.totalQuestions);
      if (accuracy > 0.8) setHakimiMood(HakimiMood.HAPPY);
      else setHakimiMood(HakimiMood.ANGRY);
  };

  const handleDailyCheckIn = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = localStorage.getItem('hakimiLastDate');
      let currentStreak = parseInt(localStorage.getItem('hakimiStreak') || '0', 10);

      if (lastDate === today) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
          currentStreak += 1;
      } else {
          currentStreak = 1; 
      }

      localStorage.setItem('hakimiLastDate', today);
      localStorage.setItem('hakimiStreak', currentStreak.toString());
      setStreak(currentStreak);
      setJustCheckedIn(true);
  };

  const saveDailyLog = () => {
      const today = new Date().toISOString().split('T')[0];
      // Check if log exists for today? We can allow multiple, but let's just push to history
      const newLog: DailyLog = {
          date: today,
          durationMinutes: gameDuration,
          nLevel: nLevel,
          score: sessionRef.current.score
      };
      const updatedLogs = [...dailyLogs, newLog];
      setDailyLogs(updatedLogs);
      localStorage.setItem('hakimiDailyLogs', JSON.stringify(updatedLogs));
  };

  // --- Renderers ---

  const renderMainMenu = () => (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 animate-fade-in space-y-6 relative">
      
      {/* Top Left: Tutorial */}
      <div className="absolute top-4 left-4 z-20">
          <button 
             onClick={startTutorial}
             className="w-10 h-10 bg-white border border-ghibli-sky rounded-full flex items-center justify-center shadow-sm active:scale-95 text-xl"
             title={t.tutorialBtn}
          >
             🎓
          </button>
      </div>

      {/* Top Right: Language & Calendar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end space-y-2">
          {/* Language Toggle: Now circular and symmetrical to Tutorial button */}
          <button 
             onClick={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}
             className="w-10 h-10 bg-white border border-ghibli-green rounded-full flex items-center justify-center shadow-sm active:scale-95 text-sm font-bold text-ghibli-green"
          >
             {language === 'zh' ? 'EN' : '中'}
          </button>
          
          <button
            onClick={() => setShowCalendar(true)}
            className="w-10 h-10 bg-white border border-ghibli-wood rounded-full flex items-center justify-center shadow-sm active:scale-95 text-xl"
            title={t.calendarTitle}
          >
            📅
          </button>
      </div>

      <div className="text-center space-y-1 mt-8">
        <h1 className="text-5xl font-cute font-bold text-ghibli-green tracking-wide drop-shadow-sm whitespace-pre-line leading-tight">{t.title}</h1>
        <p className="text-ghibli-wood font-cute text-lg opacity-80">{t.subtitle}</p>
      </div>

      <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-2 shadow-sm">
         <span>🔥 {t.game.checkIn}: {streak} {t.game.days}</span>
      </div>
      
      <div className="w-full max-w-xs">
          <HakimiAvatar mood={HakimiMood.HAPPY} message={hakimiMessage} />
      </div>
      
      <div className="flex flex-col w-full max-w-xs space-y-3">
          <button 
             onClick={() => {
                 setGameState(GameState.DAILY_SETUP);
                 setGameDuration(3);
                 setNLevel(2);
             }}
             className="w-full py-3 bg-ghibli-sky text-white rounded-2xl text-xl font-cute font-bold shadow-[4px_4px_0px_0px_rgba(135,206,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(135,206,235,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all border-2 border-white"
          >
             {t.dailyBtn}
          </button>
          
          <button 
             onClick={() => setMenuView('CLASSIC')}
             className="w-full py-3 bg-white border-2 border-ghibli-green rounded-2xl text-xl font-cute font-bold text-ghibli-dark shadow-[4px_4px_0px_0px_rgba(85,107,47,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(85,107,47,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
          >
             {t.classicModeBtn}
          </button>
      </div>
    </div>
  );

  const renderClassicMenu = () => {
      const getDifficultyLabel = (lvl: number) => {
          if (lvl === 1) return t.levelEasy;
          if (lvl === 2) return t.levelNormal;
          if (lvl === 3) return t.levelHard;
          if (lvl === 4) return t.levelDevil;
          return "";
      };

      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-6 animate-fade-in space-y-6">
            <div className="text-center space-y-1">
                <h1 className="text-4xl font-cute font-bold text-ghibli-green">{t.classicModeBtn.replace("🔥 ", "")}</h1>
            </div>

            <div className="w-full max-w-[200px]">
                <HakimiAvatar mood={HakimiMood.DEVIL} message={hakimiMessage} />
            </div>

            <div className="flex flex-col w-full max-w-xs space-y-3 overflow-y-auto no-scrollbar pb-4">
                {[1, 2, 3, 4].map(level => (
                    <button 
                        key={level}
                        onClick={() => startClassicGame(level)}
                        className={`w-full py-3 bg-white border-2 border-ghibli-green rounded-2xl text-lg font-cute font-bold text-ghibli-dark shadow-[4px_4px_0px_0px_rgba(85,107,47,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(85,107,47,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all ${level === 4 ? 'border-red-400 text-red-800' : ''}`}
                    >
                        {level}{t.levelSuffix} {getDifficultyLabel(level)}
                    </button>
                ))}
            </div>

            <button 
                 onClick={() => setMenuView('MAIN')}
                 className="px-6 py-2 text-ghibli-wood font-cute font-bold hover:bg-black/5 rounded-full transition-colors"
            >
                 {t.menuBack}
            </button>
        </div>
      );
  };

  const renderDailySetup = () => (
      <div className="flex flex-col items-center justify-center h-full w-full p-6 animate-fade-in space-y-4">
          <h1 className="text-3xl font-cute font-bold text-ghibli-dark">{t.dailyBtn}</h1>
          
          <div className="w-full max-w-xs">
              <HakimiAvatar mood={HakimiMood.THINKING} message={hakimiMessage} />
          </div>

          <div className="w-full max-w-xs bg-white rounded-3xl p-4 shadow-md border border-ghibli-green space-y-4">
              <div>
                  <label className="block text-ghibli-wood font-bold mb-2">{t.daily.selectTime}</label>
                  <div className="grid grid-cols-3 gap-2">
                      {[3, 5, 10].map(m => (
                          <button
                            key={m}
                            onClick={() => setGameDuration(m)}
                            className={`py-2 rounded-xl font-bold border-2 ${gameDuration === m ? 'bg-ghibli-green text-white border-ghibli-green' : 'bg-white text-ghibli-wood border-ghibli-wood/30'}`}
                          >
                            {m} {t.daily.min}
                          </button>
                      ))}
                  </div>
              </div>

              <div>
                  <label className="block text-ghibli-wood font-bold mb-2">{t.daily.selectLevel}</label>
                  <div className="grid grid-cols-3 gap-2">
                      {[2, 3, 4].map(l => (
                          <button
                            key={l}
                            onClick={() => setNLevel(l)}
                            className={`py-2 rounded-xl font-bold border-2 ${nLevel === l ? 'bg-ghibli-accent text-white border-ghibli-accent' : 'bg-white text-ghibli-wood border-ghibli-wood/30'}`}
                          >
                            {l}-Back
                          </button>
                      ))}
                  </div>
              </div>
          </div>

          <button 
             onClick={startDailyGame}
             className="w-full max-w-xs py-3 bg-ghibli-dark text-white rounded-2xl text-xl font-cute font-bold shadow-lg active:scale-95 transition-all"
          >
             {t.daily.start}
          </button>
          
          <button 
             onClick={() => setGameState(GameState.MENU)}
             className="text-ghibli-wood font-cute font-bold opacity-60 hover:opacity-100"
          >
             {t.menuBack}
          </button>
      </div>
  );

  const renderGame = () => {
      if (problemQueue.length === 0) return null;

      const isMemorizationPhase = currentIndex < nLevel;
      const isFlushPhase = gameMode === GameMode.CLASSIC && currentIndex >= CLASSIC_ROUNDS;
      const displayProblem = isFlushPhase ? null : problemQueue[currentIndex];
      
      // Progress bar for Classic, Timer for Daily
      const totalRounds = CLASSIC_ROUNDS;
      const answerIndex = currentIndex - nLevel;
      const progress = Math.max(0, (answerIndex / totalRounds) * 100);

      const formatTime = (seconds: number) => {
          const m = Math.floor(seconds / 60);
          const s = seconds % 60;
          return `${m}:${s < 10 ? '0'+s : s}`;
      };

      return (
        <div className="flex flex-col h-full w-full relative overflow-hidden">
           {/* Quit Button */}
           <div className="absolute top-4 left-4 z-30">
               <button 
                  onClick={() => setGameState(GameState.MENU)}
                  className="w-10 h-10 bg-white/80 backdrop-blur border border-ghibli-wood/50 rounded-full flex items-center justify-center shadow-sm active:scale-95 text-xl text-ghibli-wood"
               >
                  🚪
               </button>
           </div>

           <div className="flex-1 flex flex-col items-center w-full relative overflow-y-auto no-scrollbar">
               
               <div className="w-full px-5 py-2 flex justify-between items-end z-10 min-h-[60px] pt-12">
                 <div className="text-ghibli-wood font-bold font-cute text-lg">{t.game.difficulty}: {nLevel}-B</div>
                 <div className="text-ghibli-accent font-bold font-cute text-xl">
                    {gameMode === GameMode.CLASSIC 
                        ? `${t.game.combo} x${currentCombo}`
                        : `${t.game.time}: ${formatTime(timeLeft)}`
                    }
                 </div>
               </div>

               {gameMode === GameMode.CLASSIC && (
                   <div className="w-full px-6 mb-2 z-10 shrink-0">
                     <div className="h-2 w-full bg-white border border-ghibli-green rounded-full overflow-hidden">
                       <div className="h-full bg-ghibli-green transition-all duration-300" style={{width: `${progress}%`}}></div>
                     </div>
                   </div>
               )}

               <div className="flex-1 flex flex-col items-center justify-center w-full p-2 space-y-2">
                   
                   <div className="flex-shrink-0">
                       <HakimiAvatar mood={hakimiMood} message={hakimiMessage} />
                   </div>

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

                   <div className="w-64 h-14 flex-shrink-0 mt-2">
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
                   
                   <div className="h-4 shrink-0"></div>
               </div>
           </div>

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
        </div>
      );
  };

  const renderTutorial = () => {
    // ... (Tutorial code same as before, just kept for brevity in this response but needed in full file)
    // Re-implementing tutorial renderer as it was in previous version
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

    return (
        <div className="flex flex-col h-full w-full relative overflow-hidden bg-white/50">
             {/* Tutorial Exit Button */}
             <div className="absolute top-4 left-4 z-30">
               <button 
                  onClick={() => setGameState(GameState.MENU)}
                  className="w-10 h-10 bg-white/80 backdrop-blur border border-ghibli-wood/50 rounded-full flex items-center justify-center shadow-sm active:scale-95 text-xl text-ghibli-wood"
               >
                  🚪
               </button>
             </div>

             <div className="flex-1 flex flex-col items-center p-4 overflow-y-auto no-scrollbar pt-12">
                
                {isIntroOrOutro && (
                    <div className="flex flex-col items-center justify-center h-full space-y-6">
                        <HakimiAvatar mood={HakimiMood.HAPPY} message={data.message} />
                        <button
                            onClick={() => tutorialStep === 0 ? advanceTutorial() : setGameState(GameState.MENU)}
                            className="px-8 py-3 bg-ghibli-green text-white rounded-xl font-cute font-bold text-xl shadow-lg active:scale-95 transition-all"
                        >
                            {tutorialStep === 0 ? t.tutorial.next : t.tutorial.finish}
                        </button>
                    </div>
                )}

                {!isIntroOrOutro && (
                    <div className="w-full flex flex-col items-center space-y-4 pt-4">
                        <HakimiAvatar mood={HakimiMood.NEUTRAL} />
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl text-center text-sm font-bold whitespace-pre-line shadow-sm w-full max-w-[280px]">
                            {data.message}
                        </div>
                        <div className={`w-64 bg-white border-2 border-ghibli-dark rounded-3xl p-4 shadow-md ${isFlush ? 'opacity-50 grayscale' : ''}`}>
                            <div className="text-center">
                                <p className="text-xs font-bold text-ghibli-wood font-cute tracking-widest mb-1">
                                    {isFlush ? t.game.flush : isMemorize ? t.game.memorize : t.game.current}
                                </p>
                                <p className="text-4xl font-display font-bold text-ghibli-dark">
                                    {data.problem}
                                </p>
                            </div>
                        </div>
                        <div className="w-64 h-14 mt-2">
                             {isMemorize ? (
                                <button 
                                    onClick={advanceTutorial}
                                    className="w-full h-full bg-ghibli-accent text-white font-cute font-bold text-xl rounded-2xl shadow-md active:scale-95 transition-transform"
                                >
                                    {t.tutorial.memorized}
                                </button>
                             ) : (
                                <div className="w-full h-full relative">
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-ghibli-green text-white px-3 py-0.5 rounded-full text-xs font-cute shadow-sm z-10 whitespace-nowrap border border-white">
                                        {t.game.inputPrompt(1)}
                                    </div>
                                    <div className="w-full h-full bg-ghibli-bg border-2 border-ghibli-green border-dashed rounded-2xl flex items-center justify-center">
                                        <span className="text-3xl font-bold text-ghibli-dark tracking-widest">
                                            <span className="animate-pulse text-ghibli-accent ml-1">|</span>
                                        </span>
                                    </div>
                                </div>
                             )}
                        </div>
                    </div>
                )}
             </div>

             {!isIntroOrOutro && (
                <div 
                    className={`flex-shrink-0 w-full bg-white rounded-t-[30px] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pt-3 transition-transform duration-500 ease-in-out ${isMemorize ? 'translate-y-full opacity-0 absolute bottom-0' : 'translate-y-0'}`}
                    style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }} 
                >
                    <Numpad 
                        onInput={handleInput} 
                        onClear={() => {}} 
                        disabled={false} 
                        highlightKey={tutorialStep === 2 ? 6 : tutorialStep === 3 ? 4 : tutorialStep === 4 ? 5 : null}
                        clearLabel={t.game.clear}
                    />
                </div>
             )}
        </div>
    );
  };

  const renderFeedback = () => (
      <div className="flex flex-col items-center justify-center h-full w-full p-8 space-y-6 animate-fade-in overflow-y-auto no-scrollbar">
        <h2 className="text-3xl font-cute font-bold text-ghibli-dark">{t.feedback.title}</h2>
        
        {justCheckedIn && (
            <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded shadow-md w-full max-w-xs animate-bounce">
                <p className="font-bold">{t.feedback.checkInSuccess} {streak} {t.game.days}!</p>
            </div>
        )}

        <HakimiAvatar mood={hakimiMood} message={hakimiMessage} />
        
        <div className="w-full max-w-xs bg-white border-2 border-ghibli-green rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(232,168,124,0.4)]">
           <div className="flex justify-between items-center mb-4">
              <span className="text-ghibli-wood font-cute text-xl">{t.feedback.score}</span>
              <span className="text-3xl font-display font-bold text-ghibli-dark">{sessionData?.score}/{sessionData?.totalQuestions}</span>
           </div>
           {sessionData?.mode === GameMode.DAILY && (
             <div className="mb-4 text-center text-ghibli-green font-bold">
                 ⏱ {sessionData.durationMinutes} min ({sessionData.nLevel}-Back)
             </div>
           )}
           <div className="w-full h-px bg-ghibli-green opacity-20 mb-4"></div>
           <div className="flex justify-between items-center">
              <span className="text-ghibli-wood font-cute text-xl">{t.feedback.maxCombo}</span>
              <span className="text-2xl font-display font-bold text-ghibli-accent">{sessionData?.maxCombo}</span>
           </div>
        </div>

        <button 
          onClick={() => {
              setGameState(GameState.MENU);
              setMenuView('MAIN');
          }}
          className="w-full max-w-xs py-3 bg-ghibli-dark text-white rounded-2xl font-cute text-xl font-bold shadow-lg active:scale-95 transition-all"
        >
          {t.feedback.back}
        </button>
      </div>
  );

  const renderCalendar = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth(); // 0-11
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay(); // 0-6 (Sun-Sat)
      
      const days = [];
      for (let i = 0; i < firstDay; i++) days.push(null);
      for (let i = 1; i <= daysInMonth; i++) days.push(i);

      const getLogForDay = (day: number) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          // Find the last log for this day
          return dailyLogs.filter(log => log.date === dateStr).pop();
      };

      return (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm relative">
                  <button 
                    onClick={() => setShowCalendar(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
                  >
                      ✖
                  </button>
                  
                  <h2 className="text-2xl font-cute font-bold text-ghibli-dark mb-4 text-center">{t.calendarTitle}</h2>
                  
                  <div className="text-center font-bold text-ghibli-wood mb-2">
                      {year} / {month + 1}
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                          <div key={i} className="text-xs font-bold text-gray-400">{d}</div>
                      ))}
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
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
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

  return (
    <div className="w-full h-[100dvh] bg-[#E0E8D8] flex justify-center overflow-hidden">
       <div className="w-full max-w-md h-full bg-ghibli-bg flex flex-col relative shadow-2xl">
          {gameState === GameState.MENU && menuView === 'MAIN' && renderMainMenu()}
          {gameState === GameState.MENU && menuView === 'CLASSIC' && renderClassicMenu()}
          {gameState === GameState.DAILY_SETUP && renderDailySetup()}
          {gameState === GameState.PLAYING && renderGame()}
          {gameState === GameState.TUTORIAL && renderTutorial()}
          {(gameState === GameState.FEEDBACK || gameState === GameState.GAME_OVER) && renderFeedback()}
          {showCalendar && renderCalendar()}
       </div>
    </div>
  );
};

export default App;
