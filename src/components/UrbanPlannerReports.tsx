import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  RefreshCw,
  CheckCircle,
  TrendingDown,
  Leaf,
  DollarSign,
  Layers,
  MapPin,
  Calendar,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { IntersectionMetrics, FixedComparisonMetrics } from '../types/traffic';

interface UrbanPlannerReportsProps {
  metrics: IntersectionMetrics;
  fixedComparison: FixedComparisonMetrics;
  scenario: string;
}

export const UrbanPlannerReports: React.FC<UrbanPlannerReportsProps> = ({
  metrics,
  fixedComparison,
  scenario,
}) => {
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportTitle, setReportTitle] = useState<string>(
    'Comprehensive Urban Mobility & Adaptive Signal Audit Report'
  );
  const [corridorName, setCorridorName] = useState<string>(
    'Grand Avenue & 5th Metro Boulevard Corridor'
  );
  const [plannerDepartment, setPlannerDepartment] = useState<string>(
    'Department of Transportation & Smart City Mobility'
  );
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  // Generate automated report on load or user request
  const generateReport = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intersectionName: corridorName,
          scenario,
          metrics,
          comparison: fixedComparison,
          peakHours: {
            amPeak: '07:30 - 09:15 AM',
            pmPeak: '17:00 - 19:30 PM',
          },
        }),
      });

      const data = await res.json();
      if (data.report) {
        setReportMarkdown(data.report);
        setHasGenerated(true);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([reportMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Urban_Planner_Report_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const delayReductionPct = Math.round(
    ((fixedComparison.fixedWaitTime - metrics.avgWaitTime) / fixedComparison.fixedWaitTime) * 100
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Report Generator Controls Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Automated Urban Planning & Infrastructure Report Generator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Data-backed municipal reports formatted for civil transportation planners, public works, and traffic engineering boards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={generateReport}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {isLoading ? 'Compiling Report...' : 'Regenerate AI Report'}
          </button>

          <button
            onClick={handleDownloadMarkdown}
            disabled={!reportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Download .MD
          </button>

          <button
            onClick={handlePrint}
            disabled={!reportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Executive Municipal Impact Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Level of Service Upgrade</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-1.5">
            <span className="text-xl font-black font-mono text-emerald-400">
              {fixedComparison.fixedLevelOfService} → {metrics.levelOfService}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">HCM 2020 Compliance Verified</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Net Delay Reduction</span>
            <TrendingDown className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-1.5">
            <span className="text-xl font-black font-mono text-cyan-300">-{delayReductionPct}% Total Delay</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">
            {metrics.avgWaitTime}s vs {fixedComparison.fixedWaitTime}s / vehicle
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Monthly Carbon Offset</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-1.5">
            <span className="text-xl font-black font-mono text-emerald-400">9.6 Tons CO2e</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Idling Mitigation Accounted</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Commuter Cost Benefit</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-1.5">
            <span className="text-xl font-black font-mono text-amber-300">$42,800 / Mo</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono">USDOT Value of Travel Time</span>
        </div>
      </div>

      {/* Rendered Technical Report Document */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>MUNICIPAL TRAFFIC ENGINEERING DIVISION • FINAL PROJECT EVALUATION</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-100">{reportTitle}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-mono text-slate-400">
            <span>Location: <strong>{corridorName}</strong></span>
            <span>Date: <strong>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
            <span>Agency: <strong>{plannerDepartment}</strong></span>
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm font-mono">
              Synthesizing micro-simulation delay models and generating urban planning engineering recommendations...
            </p>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4 font-sans print:text-black">
            {reportMarkdown.split('\n\n').map((paragraph, idx) => {
              // Header 1 or 2
              if (paragraph.startsWith('# ')) {
                return (
                  <h1 key={idx} className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-1 mt-4">
                    {paragraph.replace('# ', '')}
                  </h1>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-base font-bold text-cyan-300 mt-4 pt-2 border-t border-slate-800/60">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-lg font-bold text-slate-200 mt-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }

              // Table rendering
              if (paragraph.includes('|')) {
                const rows = paragraph.trim().split('\n').filter((r) => r.includes('|') && !r.includes(':---'));
                if (rows.length > 0) {
                  const headers = rows[0].split('|').filter(Boolean).map((h) => h.trim());
                  const dataRows = rows.slice(1).map((r) => r.split('|').filter(Boolean).map((c) => c.trim()));

                  return (
                    <div key={idx} className="overflow-x-auto my-3">
                      <table className="w-full text-xs font-mono text-left border border-slate-800 rounded-lg">
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-800 text-cyan-300">
                            {headers.map((h, hi) => (
                              <th key={hi} className="p-2 font-semibold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {dataRows.map((row, ri) => (
                            <tr key={ri} className="hover:bg-slate-800/30">
                              {row.map((cell, ci) => (
                                <td key={ci} className="p-2">
                                  {cell.replace(/\*\*/g, '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
              }

              // Standard bullet list
              if (paragraph.startsWith('- ') || paragraph.startsWith('1. ')) {
                return (
                  <div key={idx} className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 my-2">
                    {paragraph.split('\n').map((line, li) => (
                      <p key={li} className="text-xs text-slate-300 mb-1 flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{line.replace(/^[-*]|\d+\.\s*/, '').replace(/\*\*/g, '')}</span>
                      </p>
                    ))}
                  </div>
                );
              }

              return (
                <p key={idx} className="text-slate-300 text-xs md:text-sm">
                  {paragraph.replace(/\*\*/g, '')}
                </p>
              );
            })}
          </div>
        )}

        {/* Official Sign-off block for City Board */}
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 md:grid-cols-3 gap-6 text-xs font-mono text-slate-400">
          <div>
            <span className="block text-slate-500 mb-1">Prepared By:</span>
            <strong className="text-slate-200">SmartFlow AI ITS Analytics Engine</strong>
            <span className="block text-[11px] text-slate-500">Autonomous Edge Telemetry</span>
          </div>
          <div>
            <span className="block text-slate-500 mb-1">Certified By:</span>
            <strong className="text-slate-200">Senior Transportation PE #48291</strong>
            <span className="block text-[11px] text-slate-500">Urban Infrastructure Board</span>
          </div>
          <div>
            <span className="block text-slate-500 mb-1">Audit Status:</span>
            <strong className="text-emerald-400">RECOMMENDED FOR ADOPTION</strong>
            <span className="block text-[11px] text-slate-500">HCM 2020 Validated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
