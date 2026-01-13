import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_PROFILE, FinancialProfile, SimulationResult } from './types';
import { InputSection } from './components/InputSection';
import { Dashboard } from './components/Dashboard';
import { generateFinancialPlan } from './services/geminiService';
import { Sparkles, HeartPulse, Calculator, FileText, Printer, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [profile, setProfile] = useState<FinancialProfile>(INITIAL_PROFILE);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner'>('dashboard');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Simulation Logic
  const simulation = useMemo<SimulationResult>(() => {
    // 1. Calculate Standard Monthly Income (Both Working)
    const monthlyIncomeUser = (profile.incomeBiWeeklyUser * 26) / 12;
    const monthlyIncomePartner = (profile.incomeBiWeeklyPartner * 26) / 12;
    const totalMonthlyNet = monthlyIncomeUser + monthlyIncomePartner;

    // 2. Calculate Expenses
    const totalExpensesPre = (Object.values(profile.monthlyExpenses) as number[]).reduce((a, b) => a + b, 0);
    const totalExpensesPost = totalExpensesPre + 
                              profile.babySettings.childcareMonthly + 
                              profile.babySettings.diapersFormulaMonthly;

    // 3. Leave Impact Calculator (NJ Context)
    // NJ FLI (2025) provides 85% of average weekly wage, capped at approx $1,081/week.
    // Tax Info: FLI benefits are subject to Federal Income Tax, but EXEMPT from NJ State Income Tax and FICA.
    // To estimate FLI benefits from the user's Net Income, we first approximate Gross Income.
    
    const weeklyNetUser = (profile.incomeBiWeeklyUser / 2); 
    const weeklyNetPartner = (profile.incomeBiWeeklyPartner / 2);

    // Reverse engineer Gross from Net (Assuming approx 25% withheld for Fed/State/FICA normally)
    const estimatedGrossUser = weeklyNetUser / 0.75;
    const estimatedGrossPartner = weeklyNetPartner / 0.75;

    const FLI_MAX_WEEKLY_2025 = 1081; 
    const FEDERAL_TAX_RATE_ESTIMATE = 0.12; // Conservative federal tax estimate on benefits (10-12% bracket typically)

    // Calculate Estimated FLI Net (After Federal Tax)
    const fliGrossUser = Math.min(estimatedGrossUser * 0.85, FLI_MAX_WEEKLY_2025);
    const fliNetUser = fliGrossUser * (1 - FEDERAL_TAX_RATE_ESTIMATE);

    const fliGrossPartner = Math.min(estimatedGrossPartner * 0.85, FLI_MAX_WEEKLY_2025);
    const fliNetPartner = fliGrossPartner * (1 - FEDERAL_TAX_RATE_ESTIMATE);

    // Weekly loss per person while on leave
    const weeklyLossUser = Math.max(0, weeklyNetUser - fliNetUser);
    const weeklyLossPartner = Math.max(0, weeklyNetPartner - fliNetPartner);

    const totalLeaveLoss = (weeklyLossUser * profile.babySettings.leaveWeeksUser) + 
                           (weeklyLossPartner * profile.babySettings.leaveWeeksPartner);

    // 4. "During Leave" Monthly Scenario (Alternating Leave)
    // Instead of simultaneous leave, we assume they alternate to keep cash flow.
    // We calculate the monthly income for the scenario where ONE person is on leave.
    
    // Monthly Equivalent of FLI Net
    const monthlyFliIncomeUser = fliNetUser * 52 / 12;
    const monthlyFliIncomePartner = fliNetPartner * 52 / 12;

    // Scenario A: User on leave (FLI), Partner working (Full)
    const incomeScenarioUserLeave = monthlyFliIncomeUser + monthlyIncomePartner;
    
    // Scenario B: Partner on leave (FLI), User working (Full)
    const incomeScenarioPartnerLeave = monthlyIncomeUser + monthlyFliIncomePartner;

    let totalMonthlyNetDuringLeave = totalMonthlyNet;

    if (profile.babySettings.leaveWeeksUser > 0 && profile.babySettings.leaveWeeksPartner > 0) {
        // Both plan to take leave (at different times). The "tightest" month is the minimum of the two scenarios.
        totalMonthlyNetDuringLeave = Math.min(incomeScenarioUserLeave, incomeScenarioPartnerLeave);
    } else if (profile.babySettings.leaveWeeksUser > 0) {
        totalMonthlyNetDuringLeave = incomeScenarioUserLeave;
    } else if (profile.babySettings.leaveWeeksPartner > 0) {
        totalMonthlyNetDuringLeave = incomeScenarioPartnerLeave;
    }
    
    // Expenses during leave usually don't include Childcare yet (since one parent is home), 
    // but include Diapers/Living. 
    const monthlyExpensesDuringLeave = totalExpensesPre + profile.babySettings.diapersFormulaMonthly;
    const monthlySurplusDuringLeave = totalMonthlyNetDuringLeave - monthlyExpensesDuringLeave;

    // 5. Savings Runway
    // If surplus during leave is negative, how many months can savings cover?
    let savingsRunway = 0;
    if (monthlySurplusDuringLeave < 0) {
        savingsRunway = Math.floor(profile.savings / Math.abs(monthlySurplusDuringLeave));
    } else {
        savingsRunway = 999; // Infinite
    }

    return {
      monthlyNetIncome: Math.floor(totalMonthlyNet),
      monthlyNetIncomeDuringLeave: Math.floor(totalMonthlyNetDuringLeave),
      monthlyExpensesPreBaby: totalExpensesPre,
      monthlyExpensesPostBaby: totalExpensesPost,
      monthlyExpensesDuringLeave: Math.floor(monthlyExpensesDuringLeave),
      monthlySurplusPreBaby: Math.floor(totalMonthlyNet - totalExpensesPre),
      monthlySurplusPostBaby: Math.floor(totalMonthlyNet - totalExpensesPost),
      monthlySurplusDuringLeave: Math.floor(monthlySurplusDuringLeave),
      totalLeaveLoss: Math.floor(totalLeaveLoss),
      savingsRunway,
    };
  }, [profile]);

  const handleGenerateAdvice = async () => {
    setLoadingAi(true);
    // Pass both profile AND the calculated simulation result
    const advice = await generateFinancialPlan(profile, simulation);
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-teal-600 text-white shadow-lg sticky top-0 z-50 no-print">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-8 h-8 text-teal-100" />
            <div>
              <h1 className="text-xl font-bold">NJ Nurse Baby Planner</h1>
              <p className="text-xs text-teal-100 opacity-80">뉴저지 부부 간호사를 위한 재정 플래너</p>
            </div>
          </div>
          {/* Mobile-friendly simple nav */}
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-white text-teal-700 shadow' : 'text-teal-100 hover:bg-teal-700'}`}
            >
              <Calculator className="w-4 h-4 inline mr-1" />
              대시보드
            </button>
            <button 
              onClick={() => setActiveTab('planner')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'planner' ? 'bg-white text-teal-700 shadow' : 'text-teal-100 hover:bg-teal-700'}`}
            >
              <FileText className="w-4 h-4 inline mr-1" />
              AI 리포트
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Inputs */}
            <div className="lg:col-span-5 space-y-6 no-print">
              <InputSection profile={profile} setProfile={setProfile} />
            </div>

            {/* Right: Dashboard */}
            <div className="lg:col-span-7 space-y-6">
              <Dashboard profile={profile} simulation={simulation} />
              
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 no-print">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    AI 맞춤형 조언 받기
                  </h3>
                  <p className="text-indigo-100 text-sm mt-1">
                    현재 재정 수치를 바탕으로 아내분을 위한 안심 리포트를 작성합니다.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setActiveTab('planner');
                    if (!aiAdvice) handleGenerateAdvice();
                  }}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-full font-bold shadow hover:bg-indigo-50 transition active:scale-95 whitespace-nowrap"
                >
                  리포트 보기
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="max-w-3xl mx-auto">
             <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-0">
                <div className="bg-indigo-600 p-6 text-white flex justify-between items-center print:bg-white print:text-indigo-900 print:p-0 print:mb-4 print:border-b">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-yellow-300 print:text-indigo-600" />
                      안심 재정 리포트
                    </h2>
                    <p className="opacity-90 mt-2 text-indigo-100 print:text-slate-500">
                      부부의 소득과 NJ FLI 혜택을 고려한 AI 분석 결과입니다.
                    </p>
                  </div>
                  <div className="no-print">
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      <Printer className="w-4 h-4" />
                      PDF 저장 / 인쇄
                    </button>
                  </div>
                </div>

                <div className="p-8 print:p-0">
                  {!aiAdvice && !loadingAi && (
                    <div className="text-center py-12 no-print">
                      <p className="text-slate-500 mb-6">최신 재정 데이터를 기반으로 분석을 시작합니다.</p>
                      <button 
                        onClick={handleGenerateAdvice}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 mx-auto"
                      >
                        <Sparkles className="w-5 h-5" />
                        분석 시작하기
                      </button>
                    </div>
                  )}

                  {loadingAi && (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p className="text-slate-600 font-medium animate-pulse">NJ 간호사 급여 데이터와 FLI 정책을 분석 중입니다...</p>
                    </div>
                  )}

                  {aiAdvice && !loadingAi && (
                    <div className="prose prose-slate max-w-none prose-headings:text-indigo-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-indigo-700 print:prose-sm">
                      <ReactMarkdown>{aiAdvice}</ReactMarkdown>
                      
                      <div className="mt-8 pt-8 border-t border-slate-200 flex justify-end no-print">
                         <button 
                          onClick={handleGenerateAdvice}
                          className="text-slate-500 hover:text-indigo-600 text-sm flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          새로운 데이터로 다시 분석하기
                        </button>
                      </div>
                    </div>
                  )}
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}