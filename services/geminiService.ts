import { GoogleGenAI } from "@google/genai";
import { FinancialProfile, SimulationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFinancialPlan = async (profile: FinancialProfile, simulation: SimulationResult): Promise<string> => {
  const prompt = `
    Role: You are an expert financial planner specializing in New Jersey (NJ) family finances, specifically for nurses.
    Client: A married couple, both nurses living in NJ. 
    User Situation: The wife is currently pregnant and specifically **very worried/anxious** about the financial situation after childbirth.
    
    **Verified Financial Data (Calculated):**
    - Monthly Net Income (Both working): $${simulation.monthlyNetIncome.toLocaleString()}
    - Monthly Expenses (Pre-baby): $${simulation.monthlyExpensesPreBaby.toLocaleString()}
    - **Current Monthly Surplus:** $${simulation.monthlySurplusPreBaby.toLocaleString()} (Very Healthy)
    
    **Worst Case Scenario (Leave Period):**
    - Lowest Monthly Income during alternating leave: $${simulation.monthlyNetIncomeDuringLeave.toLocaleString()}
    - Monthly Surplus during leave: $${simulation.monthlySurplusDuringLeave.toLocaleString()}
    - Savings Runway if deficit: ${simulation.savingsRunway > 100 ? "Infinite (Covered by income)" : simulation.savingsRunway + " months"}
    
    **Return to Work Scenario (Post-Baby):**
    - Expected Childcare: $${profile.babySettings.childcareMonthly.toLocaleString()}
    - **Final Monthly Surplus (Post-Baby):** $${simulation.monthlySurplusPostBaby.toLocaleString()}
    
    Task: Write a highly reassuring, comprehensive financial plan in Korean (한국어).
    
    Requirements:
    1. **Empathetic Intro & Fact-Based Reassurance**: Start by explicitly stating the **Post-Baby Surplus ($${simulation.monthlySurplusPostBaby.toLocaleString()})**. Tell the wife that having this much surplus *after* paying for childcare is exceptional and she is financially "Safe" (안전합니다). Use the data to prove she doesn't need to worry.
    2. **NJ FLI Strategy**: Confirm that alternating leave (User: ${profile.babySettings.leaveWeeksUser} weeks, Partner: ${profile.babySettings.leaveWeeksPartner} weeks) is a smart strategy to maintain cash flow. Mention NJ FLI benefits are a secure right for nurses.
    3. **The "Why You Are Safe" Analysis**: 
       - Point out that even with high NJ expenses ($${profile.monthlyExpenses.housing} housing, etc.), their dual nurse income ($${simulation.monthlyNetIncome}) is strong.
       - If the 'During Leave' surplus is negative, explain that their savings ($${profile.savings.toLocaleString()}) can easily cover this short period without making a dent in their long-term security.
    4. **Nurse Superpower**: Remind her that if an emergency *did* happen (which is unlikely given the numbers), picking up just 1-2 per diem shifts later would solve it immediately.
    5. **Actionable Steps**: Give 3 simple steps to organize finances now (e.g., set up auto-transfer to a 'Baby Fund', file FLI paperwork early).

    Tone: Warm, Professional, Fact-based, Calming.
    Format: Markdown with clear headers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "조언을 생성할 수 없습니다. 다시 시도해주세요.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "현재 AI 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.";
  }
};