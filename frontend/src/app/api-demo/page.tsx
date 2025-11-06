'use client';

import { useState } from 'react';
import { Container } from '@/components/Container';
import { FadeIn } from '@/components/FadeIn';
import { PageIntro } from '@/components/PageIntro';
import { SectionIntro } from '@/components/SectionIntro';
import { RootLayout } from '@/components/RootLayout';
import { Button } from '@/components/Button';

export default function ApiDemoPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  // Mock API responses for demonstration
  const mockResponses = {
    'risk-analysis': {
      success: true,
      address: 'GCKFBEIYTKP6RCZX...',
      analysis: {
        riskLevel: 'CRITICAL',
        riskScore: 95,
        trustScore: 5,
        recommendation: {
          action: 'BLOCK',
          message: "Don&apos;t interact with this address",
          reasons: [
            'Recently created account',
            'No transaction history',
            'Suspicious patterns detected'
          ]
        },
        factors: {
          // Risk factors analysis
          stellarExpert: {
            isVerified: false,
            trustScore: 0
          },
          onChainAnalysis: {
            accountAge: '2 days',
            transactionVolume: 'NONE',
            suspiciousActivity: true
          }
        }
      }
    }
  };

  const runDemo = async (demoType: string) => {
    setLoading(true);
    setActiveDemo(demoType);
    
    // Simulate API call
    setTimeout(() => {
      setResult(mockResponses[demoType as keyof typeof mockResponses]);
      setLoading(false);
    }, 2000);
  };

  return (
    <RootLayout>
      <PageIntro eyebrow="Demo" title="StellarSafe Security Analysis Demo">
        <p>
          Test StellarSafe&apos;s security features. Analyze Stellar addresses and transactions,
          view risk levels and experience security recommendations.
        </p>
      </PageIntro>

      <Container className="mt-16">
        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Input */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-950 mb-6">
                Security Analysis Demo
              </h2>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => runDemo('risk-analysis')}
                  disabled={loading}
                  className="w-full"
                >
                  {loading && activeDemo === 'risk-analysis' ? 'Analyzing...' : 'Run Risk Analysis'}
                </Button>
                
                <Button 
                  onClick={() => runDemo('asset-verification')}
                  disabled={loading}
                  className="w-full"
                >
                  {loading && activeDemo === 'asset-verification' ? 'Verifying...' : 'Run Asset Verification'}
                </Button>
                
                <Button 
                  onClick={() => runDemo('transaction-analysis')}
                  disabled={loading}
                  className="w-full"
                >
                  {loading && activeDemo === 'transaction-analysis' ? 'Analyzing...' : 'Run Transaction Analysis'}
                </Button>
              </div>

              {/* Mock data examples */}
              <div className="mt-8">
                <h3 className="font-semibold text-neutral-950 mb-4">
                  Example Analysis Scenarios
                </h3>
                <div className="space-y-4">
                  <div className="bg-neutral-900 rounded-lg p-4">
                    <div className="text-green-400 text-sm mb-2">Suspicious Address Scenario:</div>
                    <pre className="text-white text-xs">
{`Address: GCKFBEIYTKP6RCZX...
Status: Newly created account
Risk: High
Recommendation: Do not transact`}
                    </pre>
                  </div>
                  
                  <div className="bg-neutral-900 rounded-lg p-4">
                    <div className="text-green-400 text-sm mb-2">Safe Token Scenario:</div>
                    <pre className="text-white text-xs">
{`Token: USDC
Issuer: Circle (Verified)
Status: Safe
TOML: Available and valid`}
                    </pre>
                  </div>
                  
                  <div className="bg-neutral-900 rounded-lg p-4">
                    <div className="text-green-400 text-sm mb-2">Risky Transaction Scenario:</div>
                    <pre className="text-white text-xs">
{`Transaction: 1000 XLM transfer
Recipient: Unknown address
Risk: Medium level
Recommendation: Send small test amount`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Results */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-950 mb-6">
                Analysis Result
              </h2>
              
              <div className="bg-neutral-900 rounded-lg p-6 text-white font-mono text-sm h-96 overflow-y-auto">
                {result ? (
                  <div>
                    <div className="text-green-400 mb-2">{`// StellarSafe Security Analysis`}</div>
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-neutral-400 text-center mt-20">
                    Click a demo button to see the analysis result
                  </div>
                )}
              </div>

              {result && (
                <div className="mt-6">
                  <h3 className="font-semibold text-neutral-950 mb-4">Analysis Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Risk Level:</span>
                      <span className={`font-semibold ${
                        result.analysis?.riskLevel === 'CRITICAL' ? 'text-red-600' :
                        result.analysis?.riskLevel === 'HIGH' ? 'text-orange-600' :
                        result.analysis?.riskLevel === 'MEDIUM' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {result.analysis?.riskLevel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recommendation:</span>
                      <span className="font-semibold">{result.analysis?.recommendation?.action}</span>
                    </div>
                  </div>
                  
                  {result.analysis?.recommendation?.reasons && (
                    <div className="mt-4">
                      <h4 className="font-medium text-neutral-950 mb-2">Risk Factors:</h4>
                      <ul className="space-y-1">
                        {result.analysis.recommendation.reasons.map((reason: string, index: number) => (
                          <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                            <span>⚠️</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Transaction recommendations */}
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Security Recommendations:</h4>
                    <ul className="space-y-1 text-sm text-red-700">
                      <li>• Don&apos;t proceed with this transaction</li>
                      <li>• Can&apos;t verify transaction safety</li>
                      <li>• Won&apos;t affect your balance</li>
                      <li>• Doesn&apos;t require additional fees</li>
                      <li>• Can&apos;t be reversed once submitted</li>
                      <li>• Won&apos;t trigger any smart contracts</li>
                      <li>• Doesn&apos;t involve any third parties</li>
                      <li>• Can&apos;t be modified after submission</li>
                      <li>• Won&apos;t affect network congestion</li>
                      <li>• Doesn&apos;t require manual approval</li>
                      <li>• Can&apos;t be cancelled once broadcast</li>
                      <li>• Won&apos;t trigger compliance checks</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      <SectionIntro
        eyebrow="Integration"
        title="StellarSafe Entegrasyonu"
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          See how to integrate StellarSafe into your project. 
          Add security layer using widgets, extensions and CLI tools.
        </p>
      </SectionIntro>

      <Container className="mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* JavaScript/TypeScript */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-950 mb-4 flex items-center">
              <span className="text-yellow-500 mr-2">🔧</span>
              StellarSafe Widget
            </h3>
            <div className="bg-neutral-900 rounded-lg p-6 text-sm text-white font-mono overflow-x-auto">
              <pre className="whitespace-pre">
{`// StellarSafe Widget entegrasyonu
<script src="stellarsafe-widget.js"></script>

const stellarSafe = new StellarSafeWidget({
  network: 'mainnet'
});

// Address analysis
stellarSafe.analyzeAddress('GXXXXXXX...')
  .then(result => {
    if (result.riskLevel === 'HIGH') {
      showWarning('Riskli adres tespit edildi!');
    }
  });`}
              </pre>
            </div>
          </div>

          {/* React Hook */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-950 mb-4 flex items-center">
              <span className="text-blue-500 mr-2">🧩</span>
              Browser Extension
            </h3>
            <div className="bg-neutral-900 rounded-lg p-6 text-sm text-white font-mono overflow-x-auto">
              <pre className="whitespace-pre">
{`// StellarSafe Browser Extension
// Automatically analyzes Stellar transactions

// After extension is installed:
// 1. Connect your Stellar wallet
// 2. Automatic warning when trying to transact
// 3. Recommendations based on risk level

// Supported wallets:
// - Freighter
// - Albedo  
// - Rabet`}
              </pre>
            </div>
          </div>

          {/* Python */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-950 mb-4 flex items-center">
              <span className="text-green-500 mr-2">⚙️</span>
              CLI Tool
            </h3>
            <div className="bg-neutral-900 rounded-lg p-6 text-sm text-white font-mono overflow-x-auto">
              <pre className="whitespace-pre">
{`# StellarSafe CLI installation
npm install -g @stellarsafe/cli

# Contract verification
stellarsafe verify CDLZFC3SYJYDZT...

# Address analysis
stellarsafe analyze GCKFBEIYTKP6JY4Q...

# Batch analysis
stellarsafe batch-analyze addresses.txt

# Export results as JSON
stellarsafe export --format json`}
              </pre>
            </div>
          </div>

          {/* cURL */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-950 mb-4 flex items-center">
              <span className="text-gray-500 mr-2">🌐</span>
              Web Dashboard
            </h3>
            <div className="bg-neutral-900 rounded-lg p-6 text-sm text-white font-mono overflow-x-auto">
              <pre className="whitespace-pre">
{`// StellarSafe Web Dashboard
// https://stellarsafe.io/dashboard

Features:
• Wallet connection (Freighter, Albedo)
• Portfolio security analysis
• Transaction history review
• Risk reports
• Security recommendations
• Asset verification
• Real-time alerts`}
              </pre>
            </div>
          </div>
        </div>
      </Container>

      <SectionIntro
        eyebrow="Comparison"
        title="StellarSafe Features"
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          See how StellarSafe differs from other security solutions. 
          Why should you choose StellarSafe?
        </p>
      </SectionIntro>

      <Container className="mt-16">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg border border-neutral-200">
            <thead>
              <tr className="bg-neutral-50">
                <th className="border-b border-neutral-200 px-6 py-4 text-left font-semibold text-neutral-950">
                  Feature
                </th>
                <th className="border-b border-neutral-200 px-6 py-4 text-center font-semibold text-neutral-500">
                  Other Solutions
                </th>
                <th className="border-b border-neutral-200 px-6 py-4 text-center font-semibold text-blue-600">
                  StellarSafe
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b border-neutral-100 px-6 py-4 font-medium">Real-time Risk Analysis</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-neutral-500">❌</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-green-600">✅ Multi-kaynak</td>
              </tr>
              <tr>
                <td className="border-b border-neutral-100 px-6 py-4 font-medium">Stellar Expert Integration</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-neutral-500">❌</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-green-600">✅ Native</td>
              </tr>
              <tr>
                <td className="border-b border-neutral-100 px-6 py-4 font-medium">TOML Verification</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-neutral-500">❌</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-green-600">✅ SEP-20</td>
              </tr>
              <tr>
                <td className="border-b border-neutral-100 px-6 py-4 font-medium">Browser Extension</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-neutral-500">❌</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-green-600">✅ Automatic</td>
              </tr>
              <tr>
                <td className="border-b border-neutral-100 px-6 py-4 font-medium">Contract Verification</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-neutral-500">❌</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-green-600">✅ CLI Tool</td>
              </tr>
              <tr>
                <td className="border-b border-neutral-100 px-6 py-4 font-medium">Web Dashboard</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-neutral-500">❌</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-green-600">✅ Full-featured</td>
              </tr>
              <tr>
                <td className="border-b border-neutral-100 px-6 py-4 font-medium">Widget Integration</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-neutral-500">❌</td>
                <td className="border-b border-neutral-100 px-6 py-4 text-center text-green-600">✅ Easy setup</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Container>

      <SectionIntro
        eyebrow="Get Started"
        title="Ready to get started?"
        className="mt-24 sm:mt-32 lg:mt-40"
        centered
      >
        <p>
          Start using StellarSafe right away. Enhance your security in the Stellar ecosystem.
          Begin with our free tools.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button href="/dashboard">Go to Dashboard</Button>
          <Button href="/developer" invert>Verify Contract</Button>
        </div>
        <p className="mt-6 text-sm text-neutral-500">
          Free • Open source • Community supported
        </p>
      </SectionIntro>
    </RootLayout>
  );
}