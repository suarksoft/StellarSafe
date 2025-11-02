import { WalletAnalysisResult } from './walletRiskAnalyzer';

/**
 * AI Risk Explainer
 * 
 * OpenAI veya Claude API kullanarak risk analizini daha detaylı açıklar.
 * Bu opsiyonel bir özelliktir - API key olmadan da çalışır.
 */

interface AIExplanation {
  summary: string;
  detailedAnalysis: string;
  recommendations: string[];
  riskMitigation: string[];
  shouldProceed: boolean;
}

/**
 * AI Açıklama Servisi
 */
export class AIRiskExplainer {
  private apiKey?: string;
  private model: 'openai' | 'claude';

  constructor(apiKey?: string, model: 'openai' | 'claude' = 'openai') {
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Risk analizini AI ile açıkla
   */
  async explainRisk(analysis: WalletAnalysisResult): Promise<AIExplanation | null> {
    // API key yoksa null döndür
    if (!this.apiKey) {
      console.log('⚠️ AI API key not provided - skipping AI explanation');
      return null;
    }

    try {
      if (this.model === 'openai') {
        return await this.explainWithOpenAI(analysis);
      } else {
        return await this.explainWithClaude(analysis);
      }
    } catch (error) {
      console.error('AI explanation error:', error);
      return null;
    }
  }

  /**
   * OpenAI ile açıkla
   */
  private async explainWithOpenAI(analysis: WalletAnalysisResult): Promise<AIExplanation> {
    const prompt = this.buildPrompt(analysis);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a blockchain security expert specializing in Stellar network. 
            Analyze wallet risks and provide clear, actionable advice to users in Turkish. 
            Be honest about risks but also highlight positive indicators.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return this.parseAIResponse(aiResponse);
  }

  /**
   * Claude ile açıkla
   */
  private async explainWithClaude(analysis: WalletAnalysisResult): Promise<AIExplanation> {
    const prompt = this.buildPrompt(analysis);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();
    const aiResponse = data.content[0].text;

    return this.parseAIResponse(aiResponse);
  }

  /**
   * Prompt oluştur
   */
  private buildPrompt(analysis: WalletAnalysisResult): string {
    return `
Stellar blockchain üzerinde bir cüzdan adresine kripto gönderilmek isteniyor. 
Aşağıda bu adresin güvenlik analiz sonuçları var. Lütfen Türkçe olarak:

1. Kısa bir özet (2-3 cümle)
2. Detaylı analiz (risk faktörlerini açıkla)
3. Tavsiyeler listesi
4. Risk azaltma yöntemleri
5. Devam edilip edilmemeli (boolean)

şeklinde JSON formatında yanıt ver.

ANALIZ SONUÇLARI:
- Adres: ${analysis.address}
- Risk Seviyesi: ${analysis.riskLevel} (${analysis.riskScore}/100)
- Recommendation: ${analysis.recommendation}

Risk Faktörleri:
- Hesap Yaşı: ${analysis.factors.accountAge.description} (Risk: ${analysis.factors.accountAge.risk}/100)
- Transaction Geçmişi: ${analysis.factors.transactionHistory.description} (Risk: ${analysis.factors.transactionHistory.risk}/100)
- Hesap Aktivitesi: ${analysis.factors.accountActivity.description} (Risk: ${analysis.factors.accountActivity.risk}/100)
- Bilinen Adres Durumu: ${analysis.factors.knownScammer.description} (Risk: ${analysis.factors.knownScammer.risk}/100)
- Multi-Signature: ${analysis.factors.multiSig.description} (Risk: ${analysis.factors.multiSig.risk}/100)

Uyarılar: ${analysis.warnings.join(', ') || 'Yok'}
Pozitif İşaretler: ${analysis.greenFlags.join(', ') || 'Yok'}

JSON formatı:
{
  "summary": "...",
  "detailedAnalysis": "...",
  "recommendations": ["...", "..."],
  "riskMitigation": ["...", "..."],
  "shouldProceed": true/false
}
`;
  }

  /**
   * AI yanıtını parse et
   */
  private parseAIResponse(response: string): AIExplanation {
    try {
      // JSON'u çıkar
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('AI response parse error:', error);
    }

    // Parse başarısız olursa default değer döndür
    return {
      summary: 'AI analizi yapılamadı.',
      detailedAnalysis: response,
      recommendations: [],
      riskMitigation: [],
      shouldProceed: true,
    };
  }
}

/**
 * Helper: Mock AI açıklama (API key olmadan test için)
 */
export function getMockAIExplanation(analysis: WalletAnalysisResult): AIExplanation {
  const explanations = {
    critical: {
      summary: 'Bu adres son derece tehlikeli görünüyor. Güçlü şekilde gönderim yapmaktan kaçınmanızı tavsiye ederim.',
      detailedAnalysis: 'Analiz sonuçlarına göre bu adres birden fazla yüksek risk faktörü içeriyor. Özellikle hesap yaşının çok düşük olması ve transaction geçmişinin yetersiz olması dikkat çekici. Bu tür adresler genellikle scam veya phishing saldırılarında kullanılır.',
      recommendations: [
        'Bu adrese GÖNDERMEYİN',
        'Alıcının kimliğini doğrulamak için alternatif kanallardan iletişim kurun',
        'Eğer mutlaka göndermeniz gerekiyorsa çok küçük bir test miktarı gönderin',
      ],
      riskMitigation: [
        'Farklı bir iletişim kanalından alıcının adresini teyit edin',
        'Alıcının sosyal medya hesaplarını kontrol edin',
        'Bu işlemi ertelemeyi düşünün',
      ],
      shouldProceed: false,
    },
    high: {
      summary: 'Bu adres yüksek risk içeriyor. Dikkatli olun ve küçük miktarla test yapın.',
      detailedAnalysis: 'Adresin bazı risk faktörleri mevcut. Hesap yaşı veya transaction geçmişi yeterince güven vermiyor. Bu adrese gönderim yapmadan önce ek doğrulama yapmanız önerilir.',
      recommendations: [
        'Önce küçük bir test miktarı gönderin',
        'Alıcının adresi doğrulamasını isteyin',
        'Memo alanına açıklayıcı bilgi ekleyin',
      ],
      riskMitigation: [
        'İlk gönderiminizi minimum tutarla yapın',
        'Başarılı test sonrası ana miktarı gönderin',
        'Transaction hash\'ini kaydedin',
      ],
      shouldProceed: true,
    },
    medium: {
      summary: 'Bu adres orta seviye risk içeriyor. Normal önlemlerinizi alın.',
      detailedAnalysis: 'Adres bazı güven işaretleri gösterse de dikkatli olunması gereken noktalar var. Transaction geçmişi ve hesap aktivitesi normal görünüyor ancak ek doğrulama yapılması faydalı olabilir.',
      recommendations: [
        'Transaction detaylarını kontrol edin',
        'Memo ekleyerek gönderim yapın',
        'Transaction hash\'ini saklayın',
      ],
      riskMitigation: [
        'Gönderim öncesi adresin doğruluğunu iki kez kontrol edin',
        'Küçük bir test işlemi yapabilirsiniz',
      ],
      shouldProceed: true,
    },
    low: {
      summary: 'Bu adres düşük risk içeriyor. Normal bir kullanıcı gibi görünüyor.',
      detailedAnalysis: 'Adres çoğunlukla pozitif işaretler gösteriyor. Hesap yaşı ve transaction geçmişi güven verici. Normal bir Stellar kullanıcısı gibi görünüyor.',
      recommendations: [
        'Normal şekilde gönderim yapabilirsiniz',
        'Gerekirse memo ekleyin',
        'Transaction hash\'ini saklayın',
      ],
      riskMitigation: ['Standart güvenlik önlemlerini uygulayın'],
      shouldProceed: true,
    },
    safe: {
      summary: 'Bu adres güvenli görünüyor. Gönderim yapabilirsiniz.',
      detailedAnalysis: 'Adres tüm güvenlik kontrollerinden başarıyla geçti. Hesap yaşı, transaction geçmişi ve aktivite seviyeleri güvenilirlik gösteriyor. İster doğrulanmış bir exchange adresi olabilir, ister uzun süredir aktif olan bir kullanıcı.',
      recommendations: [
        'Güvenle gönderim yapabilirsiniz',
        'Exchange\'lere gönderiyorsanız memo eklemeyi unutmayın',
      ],
      riskMitigation: ['Standart işlem prosedürünü takip edin'],
      shouldProceed: true,
    },
  };

  return explanations[analysis.riskLevel];
}

/**
 * Example Usage:
 * 
 * // API key ile
 * const explainer = new AIRiskExplainer(process.env.OPENAI_API_KEY, 'openai');
 * const aiExplanation = await explainer.explainRisk(analysis);
 * 
 * // API key olmadan (mock)
 * const mockExplanation = getMockAIExplanation(analysis);
 */
