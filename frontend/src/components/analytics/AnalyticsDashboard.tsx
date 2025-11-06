'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAnalyticsLogger } from '@/lib/analyzer/analyticsLogger';
import { getRiskLevelColor, getRiskLevelEmoji } from '@/lib/analyzer/walletRiskAnalyzer';

/**
 * Analytics Dashboard Component
 * 
 * Shows risk analysis statistics and logs.
 */
export const AnalyticsDashboard: React.FC = () => {
  const { getStats, getLogs, clearLogs, downloadCSV } = useAnalyticsLogger();
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const loadData = useCallback(() => {
    const statsData = getStats();
    const logsData = getLogs();
    setStats(statsData);
    setLogs(logsData);
  }, [getStats, getLogs]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to delete all analysis logs?')) {
      clearLogs();
      loadData();
    }
  };

  if (!stats) {
    return <div className="p-4 text-neutral-600">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-950">
          📊 Risk Analysis Statistics
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            📥 CSV İndir
          </button>
          <button
            onClick={handleClearLogs}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            🗑️ Temizle
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 text-sm"
          >
            🔄 Yenile
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyses */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-600 text-sm">Toplam Analiz</span>
            <span className="text-2xl">🔍</span>
          </div>
          <div className="text-3xl font-bold text-neutral-950">
            {stats.totalAnalyses}
          </div>
        </div>

        {/* Sent Transactions */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-600 text-sm">Gönderilen</span>
            <span className="text-2xl">✅</span>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {stats.sentTransactions}
          </div>
        </div>

        {/* Cancelled Transactions */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-600 text-sm">İptal Edilen</span>
            <span className="text-2xl">🚫</span>
          </div>
          <div className="text-3xl font-bold text-red-600">
            {stats.cancelledTransactions}
          </div>
        </div>

        {/* High Risk Blocked */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-600 text-sm">Riskli Engellenen</span>
            <span className="text-2xl">🛡️</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">
            {stats.highRiskBlocked}
          </div>
        </div>
      </div>

      {/* Average Risk Score */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-950 mb-4">
          Ortalama Risk Skoru
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="h-8 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  stats.averageRiskScore >= 70
                    ? 'bg-red-500'
                    : stats.averageRiskScore >= 50
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${stats.averageRiskScore}%` }}
              />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-950">
            {stats.averageRiskScore}/100
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-950 mb-4">
          Risk Dağılımı
        </h3>
        <div className="space-y-3">
          {Object.entries(stats.riskDistribution).map(([level, count]) => (
            <div key={level} className="flex items-center space-x-3">
              <span className="text-2xl">{getRiskLevelEmoji(level as any)}</span>
              <span className="flex-1 text-neutral-700 capitalize">
                {level}
              </span>
              <span className="font-semibold text-neutral-950">
                {count as number}
              </span>
              <div className="w-32 h-4 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    getRiskLevelColor(level as any).bg
                  }`}
                  style={{
                    width: `${
                      ((count as number) / stats.totalAnalyses) * 100
                    }%`,
                  }}
                />
              </div>
              <span className="text-sm text-neutral-500 w-12 text-right">
                {Math.round(((count as number) / stats.totalAnalyses) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Logs */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-950">
            Son Analizler
          </h3>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showLogs ? 'Gizle' : 'Tümünü Göster'}
          </button>
        </div>

        <div className="space-y-2">
          {(showLogs ? logs : logs.slice(0, 5)).map((log, idx) => (
            <div
              key={idx}
              className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">
                    {getRiskLevelEmoji(log.analysis.riskLevel)}
                  </span>
                  <span className={`text-sm font-semibold ${
                    getRiskLevelColor(log.analysis.riskLevel).text
                  }`}>
                    {log.analysis.riskLevel.toUpperCase()}
                  </span>
                  <span className="text-sm text-neutral-500">
                    ({log.analysis.riskScore}/100)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    log.action === 'sent'
                      ? 'bg-green-100 text-green-700'
                      : log.action === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {log.action === 'sent'
                      ? '✅ Gönderildi'
                      : log.action === 'cancelled'
                      ? '🚫 İptal'
                      : '🔍 Analiz'}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {new Date(log.timestamp).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-neutral-500">From:</span>
                  <code className="text-neutral-700 font-mono">
                    {log.userAddress.slice(0, 8)}...{log.userAddress.slice(-8)}
                  </code>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-neutral-500">To:</span>
                  <code className="text-neutral-700 font-mono">
                    {log.targetAddress.slice(0, 8)}...{log.targetAddress.slice(-8)}
                  </code>
                </div>
                {log.amount && log.asset && (
                  <div className="flex items-center space-x-2">
                    <span className="text-neutral-500">Amount:</span>
                    <span className="text-neutral-700 font-semibold">
                      {log.amount} {log.asset}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-neutral-500">Network:</span>
                  <span className="text-neutral-700">
                    {log.network === 'testnet' ? '🧪 Testnet' : '🌐 Mainnet'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {logs.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            Henüz analiz yapılmamış
          </div>
        )}
      </div>
    </div>
  );
};
