/**
 * Quarterly Financials Component
 * Displays quarterly income statement, balance sheet, and cash flow
 * with QoQ and YoY percentage change indicators
 */

'use client';

import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { QuarterlyReport, GrowthRates } from '../../../types/fundamentalAnalysis';
import { formatCurrency, formatPercentage, formatNumber } from '../../../utils/fundamentalDataTransformer';

interface QuarterlyFinancialsProps {
  quarterlyReports: QuarterlyReport[];
  growthRates: GrowthRates[];
  onAskAI?: (context: string) => void;
}

interface StatementSection {
  label: string;
  value: number;
  qoqChange: number | null;
  yoyChange: number | null;
  format: 'currency' | 'percentage' | 'number';
}

export const QuarterlyFinancials: React.FC<QuarterlyFinancialsProps> = ({
  quarterlyReports,
  growthRates,
  onAskAI,
}) => {
  const [expandedSection, setExpandedSection] = useState<'income' | 'balance' | 'cashflow' | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(0);

  if (quarterlyReports.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-text-muted text-center">No quarterly data available</p>
      </Card>
    );
  }

  const currentReport = quarterlyReports[selectedQuarter];
  const currentGrowth = growthRates[selectedQuarter];
  const income = currentReport.incomeStatement;
  const balance = currentReport.balanceSheet;
  const cashFlow = currentReport.cashFlow;

  const getChangeIndicator = (value: number | null): { color: string; icon: string; text: string } => {
    if (value === null) return { color: 'text-text-muted', icon: '—', text: 'N/A' };
    if (value > 0) return { color: 'text-success', icon: '↑', text: `+${formatPercentage(value)}` };
    if (value < 0) return { color: 'text-error', icon: '↓', text: formatPercentage(value) };
    return { color: 'text-text-muted', icon: '→', text: '0%' };
  };

  const renderStatementSection = (
    title: string,
    sections: StatementSection[],
    sectionKey: 'income' | 'balance' | 'cashflow'
  ) => {
    const isExpanded = expandedSection === sectionKey;

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <div className="flex items-center space-x-2">
            {onAskAI && (
              <button
                onClick={() => onAskAI(`Analyze Tesla's ${title.toLowerCase()} for ${currentReport.fiscalQuarter} ${currentReport.fiscalYear}`)}
                className="px-3 py-1 text-xs bg-tesla-red/10 text-tesla-red rounded-md hover:bg-tesla-red/20 transition-colors"
              >
                Ask AI
              </button>
            )}
            <button
              onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
              className="px-3 py-1 text-xs border border-border rounded-md hover:bg-card/50 transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {/* Quarter Selector */}
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          {quarterlyReports.slice(0, 8).map((report, index) => (
            <button
              key={index}
              onClick={() => setSelectedQuarter(index)}
              className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                index === selectedQuarter
                  ? 'bg-tesla-red text-white'
                  : 'bg-card border border-border text-foreground hover:bg-card/50'
              }`}
            >
              {report.fiscalQuarter} {report.fiscalYear}
            </button>
          ))}
        </div>

        {/* Current Quarter Header */}
        <div className="mb-4 p-3 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">
              {currentReport.fiscalQuarter} {currentReport.fiscalYear}
            </span>
            <span className="text-sm text-text-muted">
              {currentReport.fiscalDateEnding}
            </span>
          </div>
        </div>

        {/* Statement Items */}
        <div className="space-y-2">
          {sections.map((section, index) => {
            const qoqChange = getChangeIndicator(section.qoqChange);
            const yoyChange = getChangeIndicator(section.yoyChange);
            
            const formatValue = (val: number) => {
              switch (section.format) {
                case 'currency':
                  return formatCurrency(val);
                case 'percentage':
                  return formatPercentage(val);
                default:
                  return formatNumber(val);
              }
            };

            if (!isExpanded && index >= 5) return null;

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-card/50 border border-border rounded-lg hover:bg-card/80 transition-colors"
              >
                <span className="text-sm text-text-muted">{section.label}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-foreground min-w-[100px] text-right">
                    {formatValue(section.value)}
                  </span>
                  {section.qoqChange !== null && (
                    <div className={`text-xs ${qoqChange.color} min-w-[60px] text-right`}>
                      <span className="mr-1">{qoqChange.icon}</span>
                      {qoqChange.text}
                      <span className="text-text-muted ml-1">QoQ</span>
                    </div>
                  )}
                  {section.yoyChange !== null && (
                    <div className={`text-xs ${yoyChange.color} min-w-[60px] text-right`}>
                      <span className="mr-1">{yoyChange.icon}</span>
                      {yoyChange.text}
                      <span className="text-text-muted ml-1">YoY</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {!isExpanded && sections.length > 5 && (
            <button
              onClick={() => setExpandedSection(sectionKey)}
              className="w-full py-2 text-sm text-tesla-red hover:bg-tesla-red/10 rounded-lg transition-colors"
            >
              View {sections.length - 5} more items...
            </button>
          )}
        </div>
      </Card>
    );
  };

  // Income Statement Sections
  const incomeSections: StatementSection[] = [
    {
      label: 'Total Revenue',
      value: income.revenue,
      qoqChange: currentGrowth.revenueQoQ,
      yoyChange: currentGrowth.revenueYoY,
      format: 'currency',
    },
    {
      label: 'Cost of Revenue',
      value: income.costOfRevenue,
      qoqChange: null, // Would need previous quarter data
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Gross Profit',
      value: income.grossProfit,
      qoqChange: currentGrowth.grossProfitQoQ,
      yoyChange: currentGrowth.grossProfitYoY,
      format: 'currency',
    },
    {
      label: 'Gross Margin',
      value: income.grossMargin,
      qoqChange: null,
      yoyChange: null,
      format: 'percentage',
    },
    {
      label: 'Operating Expenses',
      value: income.operatingExpenses,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Operating Income',
      value: income.operatingIncome,
      qoqChange: currentGrowth.operatingIncomeQoQ,
      yoyChange: currentGrowth.operatingIncomeYoY,
      format: 'currency',
    },
    {
      label: 'Operating Margin',
      value: income.operatingMargin,
      qoqChange: null,
      yoyChange: null,
      format: 'percentage',
    },
    {
      label: 'EBITDA',
      value: income.ebitda,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'EBITDA Margin',
      value: income.ebitdaMargin,
      qoqChange: null,
      yoyChange: null,
      format: 'percentage',
    },
    {
      label: 'Net Income',
      value: income.netIncome,
      qoqChange: currentGrowth.netIncomeQoQ,
      yoyChange: currentGrowth.netIncomeYoY,
      format: 'currency',
    },
    {
      label: 'Net Margin',
      value: income.netMargin,
      qoqChange: null,
      yoyChange: null,
      format: 'percentage',
    },
    {
      label: 'Earnings Per Share',
      value: income.earningsPerShare,
      qoqChange: currentGrowth.epsQoQ,
      yoyChange: currentGrowth.epsYoY,
      format: 'number',
    },
    {
      label: 'R&D Expenses',
      value: income.researchAndDevelopment,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'R&D as % of Revenue',
      value: income.rdAsPercentOfRevenue,
      qoqChange: null,
      yoyChange: null,
      format: 'percentage',
    },
  ];

  // Balance Sheet Sections
  const balanceSections: StatementSection[] = [
    {
      label: 'Total Assets',
      value: balance.totalAssets,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Total Current Assets',
      value: balance.totalCurrentAssets,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Cash & Equivalents',
      value: balance.cashAndEquivalents,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Inventory',
      value: balance.inventory,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Receivables',
      value: balance.receivables,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Property, Plant & Equipment',
      value: balance.propertyPlantEquipment,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Total Liabilities',
      value: balance.totalLiabilities,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Total Current Liabilities',
      value: balance.totalCurrentLiabilities,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Short-Term Debt',
      value: balance.shortTermDebt,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Long-Term Debt',
      value: balance.longTermDebt,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Total Debt',
      value: balance.totalDebt,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Shareholder Equity',
      value: balance.totalShareholderEquity,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Retained Earnings',
      value: balance.retainedEarnings,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Shares Outstanding',
      value: balance.commonStockSharesOutstanding,
      qoqChange: null,
      yoyChange: null,
      format: 'number',
    },
  ];

  // Cash Flow Sections
  const cashFlowSections: StatementSection[] = [
    {
      label: 'Operating Cash Flow',
      value: cashFlow.operatingCashflow,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Capital Expenditures',
      value: Math.abs(cashFlow.capitalExpenditures),
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Free Cash Flow',
      value: cashFlow.freeCashFlow,
      qoqChange: currentGrowth.freeCashFlowQoQ,
      yoyChange: currentGrowth.freeCashFlowYoY,
      format: 'currency',
    },
    {
      label: 'Cash Flow from Investments',
      value: cashFlow.cashflowFromInvestment,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Cash Flow from Financing',
      value: cashFlow.cashflowFromFinancing,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Change in Cash',
      value: cashFlow.changeInCashAndCashEquivalents,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
    {
      label: 'Dividend Payout',
      value: cashFlow.dividendPayout,
      qoqChange: null,
      yoyChange: null,
      format: 'currency',
    },
  ];

  return (
    <div className="space-y-6">
      {renderStatementSection('Income Statement', incomeSections, 'income')}
      {renderStatementSection('Balance Sheet', balanceSections, 'balance')}
      {renderStatementSection('Cash Flow Statement', cashFlowSections, 'cashflow')}
    </div>
  );
};

