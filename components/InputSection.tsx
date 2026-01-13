import React from 'react';
import { FinancialProfile } from '../types';
import { DollarSign, Baby, Home, Car, ShoppingCart, Clock } from 'lucide-react';

interface Props {
  profile: FinancialProfile;
  setProfile: React.Dispatch<React.SetStateAction<FinancialProfile>>;
}

export const InputSection: React.FC<Props> = ({ profile, setProfile }) => {
  const handleChange = (section: keyof FinancialProfile, key: string, value: number) => {
    setProfile(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section] as object, [key]: value }
        : value
    }));
  };

  // Helper to calculate monthly equivalent from bi-weekly
  const getMonthlyEst = (biWeekly: number) => Math.floor((biWeekly * 26) / 12).toLocaleString();

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-teal-600" />
          현재 수입 및 자산 (Income)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-slate-600">아내 2주 급여 (Net)</label>
                <span className="text-xs text-teal-600 font-medium">월 환산: ${getMonthlyEst(profile.incomeBiWeeklyUser)}</span>
            </div>
            <input
              type="number"
              value={profile.incomeBiWeeklyUser}
              onChange={(e) => handleChange('incomeBiWeeklyUser', '', Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
            />
          </div>
          <div>
            <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-slate-600">남편 2주 급여 (Net)</label>
                <span className="text-xs text-teal-600 font-medium">월 환산: ${getMonthlyEst(profile.incomeBiWeeklyPartner)}</span>
            </div>
            <input
              type="number"
              value={profile.incomeBiWeeklyPartner}
              onChange={(e) => handleChange('incomeBiWeeklyPartner', '', Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">현재 모아둔 비상금 (Savings)</label>
            <input
              type="number"
              value={profile.savings}
              onChange={(e) => handleChange('savings', '', Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition bg-teal-50"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-indigo-600" />
          월 지출 (Monthly Expenses)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: '주거비 (Rent/Mortgage)', key: 'housing', icon: Home },
            { label: '차량 유지비 (Loan/Ins)', key: 'cars', icon: Car },
            { label: '식비/생활비', key: 'groceries', icon: ShoppingCart },
            { label: '유틸리티/폰/인터넷', key: 'utilities', icon: null },
            { label: '학자금/기타 대출', key: 'loans', icon: null },
            { label: '쇼핑/여가', key: 'entertainment', icon: null },
            { label: '기타', key: 'other', icon: null },
          ].map((item) => (
            <div key={item.key}>
              <label className="block text-xs font-medium text-slate-500 mb-1">{item.label}</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">$</span>
                <input
                  type="number"
                  value={profile.monthlyExpenses[item.key as keyof typeof profile.monthlyExpenses]}
                  onChange={(e) => handleChange('monthlyExpenses', item.key, Number(e.target.value))}
                  className="w-full pl-7 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Baby className="w-5 h-5 text-pink-500" />
          출산 및 육아 계획 (Baby Plan)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-pink-50 p-4 rounded-lg border border-pink-100 mb-2">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> 아내 휴직 기간
                </label>
                <div className="flex items-center gap-4">
                    <input
                    type="range"
                    min="0"
                    max="24"
                    value={profile.babySettings.leaveWeeksUser}
                    onChange={(e) => handleChange('babySettings', 'leaveWeeksUser', Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                    <span className="text-pink-600 font-bold w-12 text-right">{profile.babySettings.leaveWeeksUser}주</span>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> 남편 휴직 기간
                </label>
                <div className="flex items-center gap-4">
                    <input
                    type="range"
                    min="0"
                    max="24"
                    value={profile.babySettings.leaveWeeksPartner}
                    onChange={(e) => handleChange('babySettings', 'leaveWeeksPartner', Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-indigo-600 font-bold w-12 text-right">{profile.babySettings.leaveWeeksPartner}주</span>
                </div>
            </div>
            <p className="text-xs text-slate-500 md:col-span-2">
              * NJ FLI(가족휴가보험)는 부모 각각 최대 12주까지 급여의 약 85%를 지원합니다.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">예상 월 데이케어 비용</label>
            <input
              type="number"
              value={profile.babySettings.childcareMonthly}
              onChange={(e) => handleChange('babySettings', 'childcareMonthly', Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">기저귀/분유 등 월 육아비용</label>
            <input
              type="number"
              value={profile.babySettings.diapersFormulaMonthly}
              onChange={(e) => handleChange('babySettings', 'diapersFormulaMonthly', Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition"
            />
          </div>
           <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">초기 준비물 (유모차, 가구 등)</label>
            <input
              type="number"
              value={profile.babySettings.oneTimeCosts}
              onChange={(e) => handleChange('babySettings', 'oneTimeCosts', Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
};