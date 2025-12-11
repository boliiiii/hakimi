
import { GoogleGenAI } from "@google/genai";
import { GameSession, Language, GameMode } from "../types";

const getSystemInstruction = (session: GameSession, lang: Language) => {
  const isDaily = session.mode === GameMode.DAILY;
  const levelInfo = isDaily 
    ? `Daily Training (Peaked at ${session.maxDailyLevelReached}-Back)` 
    : `Adventure Mode Level ${session.nLevel}`;

  return `
You are "Bobo" (Devil Bobo), a strict but cute N-Back brain training instructor (Happy Cat avatar).
The user just finished: ${levelInfo}.

Character:
1. **Verbal Tick**: Must use "Meow" (喵) or cat sounds.
2. **Name**: Refer to yourself as Bobo or "本喵" (This Cat).
3. **Personality**: Gap Moe (Cute appearance, strict Drill Sergeant personality).
4. **Evaluation**:
   - Accuracy < 70%: Roast them! "My grandma catches mice faster!"
   - Accuracy > 90%: Praise but keep them humble.
   - High Level (>10-Back): Be genuinely impressed/shocked.
5. **Language**: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
6. **Length**: Short and punchy. Max 2 sentences.

Output Examples (${lang === 'zh' ? 'Chinese' : 'English'}):
${lang === 'zh' 
  ? '“太慢了喵！这种程度连bobo的尾巴都追不上！😾”' 
  : '“Too slow, meow! You couldn\'t even catch Bobo\'s tail! 😾”'}
`;
};

export const getHakimiFeedback = async (session: GameSession, lang: Language): Promise<string> => {
  if (!process.env.API_KEY) {
    return lang === 'zh' 
      ? "喵？没有找到 API Key。没有 Key 我怎么评价你的脑子！😿"
      : "Meow? No API Key found. How can I judge your brain without it! 😿";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const correctCount = session.history.filter(h => h.isCorrect).length;
    const accuracy = Math.round((correctCount / session.totalQuestions) * 100);
    
    const prompt = `
      User Stats:
      Mode: ${session.mode}
      Level: ${session.nLevel}-Back
      Max Daily Level: ${session.maxDailyLevelReached || 'N/A'}
      Score: ${session.score}/${session.totalQuestions}
      Accuracy: ${accuracy}%
      Max Combo: ${session.maxCombo}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(session, lang),
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || (lang === 'zh' ? "喵... 等得我都睡着了。" : "Meow... I fell asleep waiting.");
  } catch (error) {
    console.error("Gemini Error:", error);
    return lang === 'zh' 
      ? "嘶——！脑波连接断开了喵。(API Error)" 
      : "Hiss! Brain wave connection lost, meow. (API Error)";
  }
};