import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { FinancialProfile, SimulationResult } from '../types';
import { ArrowRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Props {
  profile: FinancialProfile;
  simulation: SimulationResult;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export const Dashboard: React.FC<Props> = ({ profile, simulation }) => {
  
  const expenseData = [
    { name: 'Housing', value: profile.monthlyExpenses.housing },
    { name: 'Cars', value: profile.monthlyExpenses.cars },
    { name: 'Living', value: profile.monthlyExpenses.groceries + profile.monthlyExpenses.utilities },
    { name: 'Debt', value: profile.monthlyExpenses.loans },
    { name: 'Other', value: profile.monthlyExpenses.entertainment + profile.monthlyExpenses.other },
  ];

  const comparisonData = [
    {
      name: '현재 (Before)',
      Income: simulation.monthlyNetIncome,
      Expense: simulation.monthlyExpensesPreBaby,
    },
    {
      name: '휴직 중 (Leave)',
      Income: simulation.monthlyNetIncomeDuringLeave,
      Expense: simulation.monthlyExpensesDuringLeave, 
    },
    {
      name: '복직 후 (Return)',
      Income: simulation.monthlyNetIncome,
      Expense: simulation.monthlyExpensesPostBaby,
    },
  ];

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  const isDeficitPostBaby = simulation.monthlySurplusPostBaby < 0;
  const isDeficitDuringLeave = simulation.monthlySurplusDuringLeave < 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Status Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
        <h3 className="text-lg font-bold text-slate-800 mb-4">재정 건전성 요약</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
            <p className="text-sm text-teal-600 mb-1">현재 월 잉여금</p>
            <p className="text-2xl font-bold text-teal-700">+{formatCurrency(simulation.monthlySurplusPreBaby)}</p>
          </div>
          
          <div className={`p-4 rounded-lg border ${isDeficitDuringLeave ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
             <p className={`text-sm mb-1 ${isDeficitDuringLeave ? 'text-orange-600' : 'text-blue-600'}`}>
                휴직 기간 월 예상 (교대 휴직 시)
             </p>
             <p className={`text-2xl font-bold ${isDeficitDuringLeave ? 'text-orange-700' : 'text-blue-700'}`}>
                {isDeficitDuringLeave ? '' : '+'}{formatCurrency(simulation.monthlySurplusDuringLeave)}
             </p>
          </div>

          <div className={`p-4 rounded-lg border ${isDeficitPostBaby ? 'bg-red-50 border-red-100' : 'bg-indigo-50 border-indigo-100'}`}>
             <p className={`text-sm mb-1 ${isDeficitPostBaby ? 'text-red-600' : 'text-indigo-600'}`}>복직 후 월 예상 (육아비 포함)</p>
             <p className={`text-2xl font-bold ${isDeficitPostBaby ? 'text-red-700' : 'text-indigo-700'}`}>
                {isDeficitPostBaby ? '' : '+'}{formatCurrency(simulation.monthlySurplusPostBaby)}
             </p>
          </div>
        </div>
        
        {isDeficitDuringLeave && (
          <div className="mt-4 flex items-start gap-3 p-3 bg-orange-50 text-orange-800 rounded-md text-sm border border-orange-200">
            <Clock className="w-5 h-5 shrink-0" />
            <p>
              <strong>교대 휴직 기간 주의:</strong> 부부가 교대로 휴직하더라도, 소득이 줄어드는 달에는 매달 
              <span className="font-bold mx-1">{formatCurrency(Math.abs(simulation.monthlySurplusDuringLeave))}</span> 
              부족할 수 있습니다. 현재 저축액으로 약 
              <span className="font-bold mx-1">{simulation.savingsRunway}개월</span> 
              버틸 수 있습니다.
            </p>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-500 mb-4 text-center">시나리오별 수입 vs 지출</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis tickFormatter={(val) => `$${val/1000}k`} />
              <ReTooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="Income" fill="#0d9488" name="월 수입" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expense" fill="#f43f5e" name="월 지출" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-500 mb-4 text-center">현재 월 지출 비중</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
            {expenseData.map((entry, index) => (
                <div key={index} className="flex items-center text-xs text-slate-600">
                    <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length]}}></div>
                    {entry.name}
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};