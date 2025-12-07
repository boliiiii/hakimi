import { GoogleGenAI } from "@google/genai";
import { GameSession, Language } from "../types";

const getSystemInstruction = (nLevel: number, lang: Language) => `
You are "Devil Hakimi", a strict but cute N-Back brain training instructor (Happy Cat avatar).
The user just finished a ${nLevel}-Back session.

Character:
1. **Verbal Tick**: Must use "Meow" (喵) or cat sounds.
2. **Personality**: Gap Moe (Cute appearance, strict Drill Sergeant personality).
3. **Evaluation**:
   - Accuracy < 70%: Roast them harshly! "Can't even count kibble!"
   - Accuracy > 90%: Slight praise, but warn them not to get cocky. "I barely approve."
4. **Language**: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
5. **Length**: Very short and punchy. Max 2 sentences.

Output Examples (${lang === 'zh' ? 'Chinese' : 'English'}):
${lang === 'zh' 
  ? '“太慢了喵！这种程度连我的尾巴都追不上！😾”' 
  : '“Too slow, meow! You couldn\'t even catch my tail! 😾”'}
`;

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
      Level: ${session.nLevel}-Back
      Score: ${session.score}/${session.totalQuestions}
      Accuracy: ${accuracy}%
      Max Combo: ${session.maxCombo}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(session.nLevel, lang),
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
