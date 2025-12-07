
import React, { useState, useEffect, useRef } from 'react';
import { GameState, HakimiMood, MathProblem, GameSession, Language } from './types';
import HakimiAvatar from './components/HakimiAvatar';
import Numpad from './components/Numpad';
import { getHakimiFeedback } from './services/geminiService';

// --- Localization Constants ---
const TEXTS = {
  zh: {
    title: "哈基米\n魔鬼特训",
    subtitle: "N-Back 脑力燃烧",
    menuMessage: "喵！快来锻炼你的脑子，人类！",
    tutorialBtn: "🎓 新手教程",
    levelSuffix: "-Back",
    levelDevil: "(魔鬼)",
    tutorial: {
      step0Title: "N-Back 是什么？",
      step0Content: "规则很简单：不要回答当前的题目，而是回答 N 轮之前的答案！",
      step1Title: "第一步：记住",
      step1Content: "比如 1-Back。看到【3 + 2】。算出 5。现在别输入，只要记住 5！",
      step1Note: "算出是 5 -> 默念记住！",
      step2Title: "第二步：回答",
      step2Content: "新题【1 + 1】来了。现在输入上一题的答案【5】！同时记住当前的 2。",
      step2Note: "上一题是 5 -> 请在键盘点击 5",
      step3Title: "你学会了！",
      step3Content: "就这样不断【输出旧的，存入新的】。去挑战吧！",
      intro: "哈基米小课堂开课啦！",
      outro: "就是这么简单喵！",
      next: "下一步",
      backToMenu: "返回菜单",
      wrong: "不对喵！上一题的答案是 5！",
      correct: "太棒了！答对了喵！",
      numpadHint: "请点击下方键盘 ↓"
    },
    game: {
      difficulty: "难度",
      combo: "连击",
      progress: "进度",
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
      days: "天"
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
    tutorialBtn: "🎓 Tutorial",
    levelSuffix: "-Back",
    levelDevil: "(Devil)",
    tutorial: {
      step0Title: "What is N-Back?",
      step0Content: "Simple rule: Don't answer the current question. Answer the one from N steps ago!",
      step1Title: "Step 1: Memorize",
      step1Content: "E.g. 1-Back. You see [3 + 2]. Result is 5. Don't type it! Just memorize 5.",
      step1Note: "Result is 5 -> Memorize it!",
      step2Title: "Step 2: Answer",
      step2Content: "New [1 + 1] appears. Now input the PREVIOUS answer [5]! And memorize the new 2.",
      step2Note: "Previous was 5 -> Tap 5 below",
      step3Title: "You got it!",
      step3Content: "Keep 'Outputting the old, Storing the new'. Go challenge yourself!",
      intro: "Hakimi Class is in session!",
      outro: "It's that simple, meow!",
      next: "Next",
      backToMenu: "Back to Menu",
      wrong: "Wrong meow! Previous answer was 5!",
      correct: "Awesome! That's right meow!",
      numpadHint: "Tap keypad below ↓"
    },
    game: {
      difficulty: "Level",
      combo: "Combo",
      progress: "Progress",
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
      days: "Days"
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
const TOTAL_ROUNDS = 10; 

const generateProblem = (): MathProblem => {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const op = Math.random() > 0.4 ? '+' : '-';
  
  if (op === '+') {
      return { id: crypto.randomUUID(), expression: `${a} + ${b}`, answer: a + b };
  } else {
      const max = Math.max(a, b);
      const min = Math.min(a, b);
      return { id: crypto.randomUUID(), expression: `${max} - ${min}`, answer: max - min };
  }
};

const App: React.FC = () => {
  // --- State ---
  const [language, setLanguage] = useState<Language>('zh');
  const t = TEXTS[language];

  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [nLevel, setNLevel] = useState<number>(1);
  const [hakimiMood, setHakimiMood] = useState<HakimiMood>(HakimiMood.NEUTRAL);
  const [hakimiMessage, setHakimiMessage] = useState<string>("");
  
  // Game Logic
  const [problemQueue, setProblemQueue] = useState<MathProblem[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Stats
  const [sessionData, setSessionData] = useState<GameSession | null>(null);
  const [currentCombo, setCurrentCombo] = useState<number>(0);
  
  // Tutorial State
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  // Check-in State
  const [streak, setStreak] = useState<number>(0);
  const [justCheckedIn, setJustCheckedIn] = useState<boolean>(false);

  const sessionRef = useRef<GameSession>({
    nLevel: 1, score: 0, totalQuestions: 0, maxCombo: 0, history: []
  });

  // --- Initialization ---
  useEffect(() => {
      // Load streak from local storage
      const storedStreak = localStorage.getItem('hakimiStreak');
      const lastDate = localStorage.getItem('hakimiLastDate');
      
      if (storedStreak) {
          setStreak(parseInt(storedStreak, 10));
      }
      // Set initial message
      setHakimiMessage(t.menuMessage);
  }, []);

  // Update message when language changes if in Menu
  useEffect(() => {
      if (gameState === GameState.MENU) {
          setHakimiMessage(t.menuMessage);
      }
  }, [language, gameState]);

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

  // --- Game Loop ---
  const startGame = (level: number) => {
    setNLevel(level);
    setGameState(GameState.PLAYING);
    setHakimiMood(HakimiMood.NEUTRAL);
    setHakimiMessage(t.game.levelStart(level));
    setCurrentInput('');
    setCurrentIndex(0);
    setCurrentCombo(0);
    setJustCheckedIn(false);
    
    sessionRef.current = {
      nLevel: level,
      score: 0,
      totalQuestions: TOTAL_ROUNDS,
      maxCombo: 0,
      history: []
    };

    const problems: MathProblem[] = [];
    for(let i=0; i < TOTAL_ROUNDS; i++) {
        problems.push(generateProblem());
    }
    setProblemQueue(problems);
  };

  const startTutorial = () => {
    setGameState(GameState.TUTORIAL);
    setTutorialStep(0);
    setHakimiMood(HakimiMood.HAPPY);
    setHakimiMessage(t.tutorial.intro);
    setCurrentInput('');
  };

  const handleInput = (num: number) => {
    if (gameState === GameState.TUTORIAL) {
        if (tutorialStep === 2 && num === 5) {
             playSound('correct');
             setTutorialStep(3);
             setHakimiMessage(t.tutorial.correct);
             setHakimiMood(HakimiMood.HAPPY);
        } else if (tutorialStep === 2 && num !== 5) {
             playSound('wrong');
             setHakimiMessage(t.tutorial.wrong);
             setHakimiMood(HakimiMood.ANGRY);
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
      
      if (nextIndex >= TOTAL_ROUNDS + nLevel) {
          finishGame();
      } else {
          setCurrentIndex(nextIndex);
          if (nextIndex >= TOTAL_ROUNDS) {
              setHakimiMessage(t.game.flushPrompt);
          }
      }
  };

  const advanceMemorization = () => {
      playSound('pop');
      setCurrentIndex(prev => prev + 1);
  };

  const handleDailyCheckIn = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = localStorage.getItem('hakimiLastDate');
      let currentStreak = parseInt(localStorage.getItem('hakimiStreak') || '0', 10);

      if (lastDate === today) {
          // Already checked in today
          return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
          currentStreak += 1;
      } else {
          currentStreak = 1; // Reset or Start new
      }

      localStorage.setItem('hakimiLastDate', today);
      localStorage.setItem('hakimiStreak', currentStreak.toString());
      setStreak(currentStreak);
      setJustCheckedIn(true);
  };

  const finishGame = async () => {
      setGameState(GameState.FEEDBACK);
      setSessionData(sessionRef.current);
      setHakimiMood(HakimiMood.THINKING);
      setHakimiMessage(t.game.calculating);
      
      // Perform check-in
      handleDailyCheckIn();

      const feedback = await getHakimiFeedback(sessionRef.current, language);
      setHakimiMessage(feedback);
      
      const accuracy = sessionRef.current.score / sessionRef.current.totalQuestions;
      if (accuracy > 0.8) setHakimiMood(HakimiMood.HAPPY);
      else setHakimiMood(HakimiMood.ANGRY);
  };

  // --- Renderers ---

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 animate-fade-in space-y-6">
      
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-20">
          <button 
             onClick={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}
             className="px-3 py-1 bg-white border border-ghibli-green rounded-full text-sm font-bold text-ghibli-green shadow-sm active:scale-95"
          >
             {language === 'zh' ? 'EN' : '中'}
          </button>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-5xl font-cute font-bold text-ghibli-green tracking-wide drop-shadow-sm whitespace-pre-line">{t.title}</h1>
        <p className="text-ghibli-wood font-cute text-lg opacity-80">{t.subtitle}</p>
      </div>

      {/* Check-in Streak Badge */}
      <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-2 shadow-sm">
         <span>🔥 {t.game.checkIn}: {streak} {t.game.days}</span>
      </div>
      
      <div className="w-full max-w-xs">
          <HakimiAvatar mood={HakimiMood.HAPPY} message={hakimiMessage} />
      </div>
      
      <div className="flex flex-col w-full max-w-xs space-y-3">
          <button 
             onClick={startTutorial}
             className="w-full py-3 bg-ghibli-sky text-white rounded-2xl text-xl font-cute font-bold shadow-[4px_4px_0px_0px_rgba(135,206,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(135,206,235,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all border-2 border-white"
          >
             {t.tutorialBtn}
          </button>
          
          <div className="h-px w-full bg-gray-200 my-2"></div>

          {[1, 2, 3].map(level => (
            <button 
                key={level}
                onClick={() => startGame(level)}
                className="w-full py-3 bg-white border-2 border-ghibli-green rounded-2xl text-xl font-cute font-bold text-ghibli-dark shadow-[4px_4px_0px_0px_rgba(85,107,47,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(85,107,47,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
            >
                {level}{t.levelSuffix} {level === 3 ? t.levelDevil : ''}
            </button>
          ))}
      </div>
    </div>
  );

  const renderTutorial = () => {
    const steps = [
        { title: t.tutorial.step0Title, content: t.tutorial.step0Content, mood: HakimiMood.NEUTRAL },
        { title: t.tutorial.step1Title, content: t.tutorial.step1Content, mood: HakimiMood.HAPPY },
        { title: t.tutorial.step2Title, content: t.tutorial.step2Content, mood: HakimiMood.DEVIL },
        { title: t.tutorial.step3Title, content: t.tutorial.step3Content, mood: HakimiMood.HAPPY }
    ];

    const currentStepData = steps[tutorialStep] || steps[3];

    return (
        <div className="flex flex-col h-full w-full relative overflow-hidden bg-white/50">
             <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-xs mb-4">
                     <HakimiAvatar mood={currentStepData.mood} message={currentStepData.content} />
                </div>

                <div className="w-64 bg-white border-2 border-ghibli-green rounded-3xl p-4 shadow-lg mb-6 relative">
                     <div className="absolute -top-3 left-4 bg-ghibli-accent text-white px-3 py-1 rounded-full text-xs font-bold">
                        {currentStepData.title}
                     </div>

                     {tutorialStep === 1 && (
                         <div className="text-center animate-fade-in">
                             <p className="text-gray-400 text-sm">{t.game.current}</p>
                             <p className="text-4xl font-display font-bold text-ghibli-dark">3 + 2</p>
                             <div className="mt-4 bg-blue-50 text-blue-600 p-2 rounded-lg text-sm font-bold">
                                 {t.tutorial.step1Note}
                             </div>
                         </div>
                     )}

                     {tutorialStep === 2 && (
                         <div className="text-center animate-fade-in">
                             <p className="text-gray-400 text-sm">{t.game.current}</p>
                             <p className="text-4xl font-display font-bold text-ghibli-dark">1 + 1</p>
                             <div className="mt-4 bg-yellow-50 text-yellow-700 p-2 rounded-lg text-sm font-bold">
                                 {t.tutorial.step2Note}
                             </div>
                         </div>
                     )}
                     
                     {(tutorialStep === 0 || tutorialStep === 3) && (
                         <div className="text-center text-ghibli-wood py-4 font-cute text-xl">
                            {tutorialStep === 0 ? t.tutorial.intro : t.tutorial.outro}
                         </div>
                     )}
                </div>

                {tutorialStep !== 2 ? (
                    <button
                        onClick={() => {
                            if (tutorialStep < 3) {
                                playSound('pop');
                                setTutorialStep(s => s + 1);
                            } else {
                                setGameState(GameState.MENU);
                            }
                        }}
                        className="w-48 py-3 bg-ghibli-green text-white rounded-xl font-cute font-bold text-xl shadow-lg active:scale-95 transition-all"
                    >
                        {tutorialStep === 3 ? t.tutorial.backToMenu : t.tutorial.next}
                    </button>
                ) : (
                    <div className="text-sm text-ghibli-wood animate-bounce">{t.tutorial.numpadHint}</div>
                )}
             </div>

             <div 
                className={`flex-shrink-0 w-full bg-white rounded-t-[30px] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pt-3 transition-transform duration-500 ease-in-out ${tutorialStep === 2 ? 'translate-y-0' : 'translate-y-full opacity-0 absolute bottom-0'}`}
                style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }} 
             >
                <Numpad 
                    onInput={handleInput} 
                    onClear={() => {}} 
                    disabled={false} 
                    highlightKey={tutorialStep === 2 ? 5 : null}
                    clearLabel={t.game.clear}
                />
             </div>
        </div>
    );
  };

  const renderGame = () => {
      if (problemQueue.length === 0) return null;

      const isMemorizationPhase = currentIndex < nLevel;
      const isFlushPhase = currentIndex >= TOTAL_ROUNDS;
      const displayProblem = isFlushPhase ? null : problemQueue[currentIndex];
      const answerIndex = currentIndex - nLevel;
      const progress = Math.max(0, (answerIndex / TOTAL_ROUNDS) * 100);

      return (
        <div className="flex flex-col h-full w-full relative overflow-hidden">
           <div className="flex-1 flex flex-col items-center w-full relative overflow-y-auto no-scrollbar">
               
               <div className="w-full px-5 py-2 flex justify-between items-end z-10 min-h-[50px]">
                 <div className="text-ghibli-wood font-bold font-cute text-lg">{t.game.difficulty}: {nLevel}-Back</div>
                 <div className="text-ghibli-accent font-bold font-cute text-xl">{t.game.combo} x{currentCombo}</div>
               </div>

               <div className="w-full px-6 mb-2 z-10 shrink-0">
                 <div className="h-2 w-full bg-white border border-ghibli-green rounded-full overflow-hidden">
                   <div className="h-full bg-ghibli-green transition-all duration-300" style={{width: `${progress}%`}}></div>
                 </div>
               </div>

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

  const renderFeedback = () => (
      <div className="flex flex-col items-center justify-center h-full w-full p-8 space-y-6 animate-fade-in overflow-y-auto no-scrollbar">
        <h2 className="text-3xl font-cute font-bold text-ghibli-dark">{t.feedback.title}</h2>
        
        {/* Check-in Notification */}
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
           <div className="w-full h-px bg-ghibli-green opacity-20 mb-4"></div>
           <div className="flex justify-between items-center">
              <span className="text-ghibli-wood font-cute text-xl">{t.feedback.maxCombo}</span>
              <span className="text-2xl font-display font-bold text-ghibli-accent">{sessionData?.maxCombo}</span>
           </div>
        </div>

        <button 
          onClick={() => setGameState(GameState.MENU)}
          className="w-full max-w-xs py-3 bg-ghibli-dark text-white rounded-2xl font-cute text-xl font-bold shadow-lg active:scale-95 transition-all"
        >
          {t.feedback.back}
        </button>
      </div>
  );

  return (
    <div className="w-full h-[100dvh] bg-[#E0E8D8] flex justify-center overflow-hidden">
       <div className="w-full max-w-md h-full bg-ghibli-bg flex flex-col relative shadow-2xl">
          {gameState === GameState.MENU && renderMenu()}
          {gameState === GameState.PLAYING && renderGame()}
          {gameState === GameState.TUTORIAL && renderTutorial()}
          {(gameState === GameState.FEEDBACK || gameState === GameState.GAME_OVER) && renderFeedback()}
       </div>
    </div>
  );
};

export default App;
