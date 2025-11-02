import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { Button } from '@/components/Button'
import { PageIntro } from '@/components/PageIntro'
import { SectionIntro } from '@/components/SectionIntro'
import { List, ListItem } from '@/components/List'
import { GridList, GridListItem } from '@/components/GridList'
import { RootLayout } from '@/components/RootLayout'

export default function PartnersPage() {
  return (
    <RootLayout>
      <PageIntro eyebrow="Wallet Partners" title="White-label Security Solution for Stellar Wallets">
        <p>
          Tek script tag ile enterprise güvenlik. Cüzdanınızın kendi brand&apos;i ile 
          kullanıcılarınızı koruyun. Zero maintenance, full customization, enterprise SLA. 
          Lobstr, Freighter gibi lider wallet&apos;ların tercihi.
        </p>
      </PageIntro>

      <Container className="mt-16">
        <div className="lg:flex lg:items-center lg:justify-end">
          <div className="flex justify-center lg:w-1/2 lg:justify-end lg:pr-12">
            <FadeIn className="w-[33.75rem] flex-none lg:w-[45rem]">
              <div className="bg-neutral-900 rounded-lg p-6 text-white font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre">
<span className="text-green-400">{`// Tek script tag ile entegrasyon`}</span>
<span className="text-blue-400">&lt;script</span> <span className="text-red-400">src</span>=<span className="text-green-400">&quot;https://cdn.stellarsafe.io/widget.js&quot;</span>
        <span className="text-red-400">data-partner</span>=<span className="text-green-400">&quot;lobstr&quot;</span>
        <span className="text-red-400">data-network</span>=<span className="text-green-400">&quot;mainnet&quot;</span><span className="text-blue-400">&gt;&lt;/script&gt;</span>

<span className="text-green-400">{`// Cüzdanınızın transaction flow'unda`}</span>
<span className="text-yellow-400">StellarSafeWidget</span>.<span className="text-yellow-400">check</span>({'{'}
  <span className="text-red-400">address</span>: recipientAddress,
  <span className="text-red-400">onResult</span>: (result) ={'> {'} 
    <span className="text-blue-400">if</span> (result.riskLevel === <span className="text-green-400">&apos;HIGH&apos;</span>) {'{'}
      <span className="text-yellow-400">showLobstrWarning</span>(result);
    {'}'} <span className="text-blue-400">else</span> {'{'}
      <span className="text-yellow-400">proceedWithTransaction</span>();
    {'}'}
  {'}'}
{'}'});

<span className="text-gray-400">{`// → Lobstr branded popup ✅
// → Zero backend maintenance 🚀  
// → Enterprise SLA included 🛡️`}</span>
                </pre>
              </div>
            </FadeIn>
          </div>
          <List className="mt-16 lg:mt-0 lg:w-1/2 lg:min-w-[33rem] lg:pl-4">
            <ListItem title="Zero Maintenance">
              Tek script tag, otomatik güncellemeler. Backend yazmaya gerek yok. 
              StellarSafe tüm risk analysis&apos;i handle eder, siz sadece sonucu alırsınız.
            </ListItem>
            <ListItem title="Full White-label">
              Cüzdanınızın logosu, renkler, mesajlar. Kullanıcılar StellarSafe&apos;i 
              değil, sizin güvenlik sisteminizi görür. %100 brand consistency.
            </ListItem>
            <ListItem title="Enterprise SLA">
              99.9% uptime garantisi, 24/7 support, dedicated account manager. 
              Lobstr ve Freighter&apos;ın güvendiği infrastructure.
            </ListItem>
          </List>
        </div>
      </Container>

      <div className="mt-24 rounded-4xl bg-neutral-950 py-20 sm:mt-32 sm:py-32 lg:mt-56">
        <Container>
          <FadeIn className="flex items-center gap-x-8">
            <h2 className="text-center font-display text-sm font-semibold tracking-wider text-white sm:text-left">
              Stellar&apos;ın lider wallet&apos;larının güvendiği çözüm
            </h2>
            <div className="h-px flex-auto bg-neutral-800" />
          </FadeIn>
          
          {/* Partner Logos */}
          <FadeInStagger faster>
            <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
              <div className="flex items-center justify-center p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">Lobstr</div>
                  <div className="text-xs text-neutral-400">Mobile Wallet</div>
                </div>
              </div>
              <div className="flex items-center justify-center p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">Freighter</div>
                  <div className="text-xs text-neutral-400">Browser Extension</div>
                </div>
              </div>
              <div className="flex items-center justify-center p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">xBull</div>
                  <div className="text-xs text-neutral-400">Desktop Wallet</div>
                </div>
              </div>
              <div className="flex items-center justify-center p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400 mb-1">Your Wallet</div>
                  <div className="text-xs text-neutral-400">Join Partners</div>
                </div>
              </div>
            </div>
          </FadeInStagger>
          
          {/* Stats */}
          <FadeInStagger faster>
            <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-white">5</div>
                <div className="text-sm text-neutral-400">Partner Wallets</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-white">50K+</div>
                <div className="text-sm text-neutral-400">Protected Users</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-white">$2M+</div>
                <div className="text-sm text-neutral-400">Scams Prevented</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-white">99.9%</div>
                <div className="text-sm text-neutral-400">Uptime SLA</div>
              </div>
            </div>
          </FadeInStagger>
          
          <FadeIn>
            <p className="mt-8 text-center text-sm text-neutral-400">
              Partnership programımıza katılın ve kullanıcılarınızı koruyun
            </p>
          </FadeIn>
        </Container>
      </div>

      <SectionIntro
        eyebrow="Features"
        title="Enterprise-Grade Security Features"
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          Her API call&apos;da çoklu güvenlik katmanı. AI-powered risk analizi, 
          domain doğrulaması ve real-time scam tespiti ile kullanıcılarınızı koruyun.
        </p>
      </SectionIntro>

      <Container className="mt-16">
        <GridList>
          <GridListItem title="Real-time Scam Detection">
            AI-powered risk scoring ile scam adreslerini anlık tespit edin. 
            Makine öğrenmesi algoritmalarımız sürekli güncellenir.
          </GridListItem>
          <GridListItem title="Stellar Expert Integration">
            Verified organization kontrolü ve trust score hesaplaması. 
            0-100 arası güvenilirlik puanı ile doğru kararlar verin.
          </GridListItem>
          <GridListItem title="TOML Domain Verification">
            SEP-20 compliance ve domain ownership doğrulaması. 
            Organizasyon bilgilerini güvenilir kaynaklardan alın.
          </GridListItem>
          <GridListItem title="Transaction Preview">
            Fee estimation, balance check ve pre-flight validasyon. 
            İşlem öncesi tüm riskleri görün ve kullanıcıları uyarın.
          </GridListItem>
          <GridListItem title="Smart Caching">
            1-hour TTL ile akıllı önbellekleme sistemi. 
            %95 daha hızlı tekrar istekler, daha az maliyet.
          </GridListItem>
          <GridListItem title="Analytics Dashboard">
            API usage, success rates ve risk istatistikleri. 
            Detaylı raporlar ile performansı takip edin.
          </GridListItem>
        </GridList>
      </Container>

      <SectionIntro
        eyebrow="Partnership Tiers"
        title="Wallet Partnership Programs"
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          Wallet büyüklüğünüze göre esnek partnership modelleri. Revenue sharing, 
          white-label lisanslama veya enterprise contract. Birlikte büyüyelim.
        </p>
      </SectionIntro>

      <Container className="mt-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border-2 border-neutral-200 bg-white p-8">
            <div className="text-center">
              <h3 className="mb-2 text-xl font-bold text-neutral-950">Indie Wallet</h3>
              <div className="mb-1 text-3xl font-bold text-neutral-950">Revenue Share</div>
              <div className="mb-6 text-sm text-neutral-500">5% scam prevention revenue</div>
              
              <div className="mb-8 space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-green-500">✓</span>
                  <span className="text-sm">10K checks/month included</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-green-500">✓</span>
                  <span className="text-sm">Basic white-label branding</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-green-500">✓</span>
                  <span className="text-sm">Community support</span>
                </div>
              </div>

              <Button href="/contact" className="w-full">
                Partnership Başvurusu
              </Button>
              <p className="mt-3 text-xs text-neutral-500">
                Yeni ve küçük wallet&apos;lar için
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl border-2 border-blue-500 bg-gradient-to-b from-blue-50 to-purple-50 p-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform rounded-full bg-blue-500 px-4 py-1 text-sm font-medium text-white">
              En Popüler
            </div>
            
            <div className="text-center">
              <h3 className="mb-2 text-xl font-bold text-neutral-950">Growth Wallet</h3>
              <div className="mb-1 text-3xl font-bold text-neutral-950">$2,999</div>
              <div className="mb-6 text-sm text-neutral-500">/month + $0.01/check</div>
              
              <div className="mb-8 space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-green-500">✓</span>
                  <span className="text-sm"><strong>Unlimited checks included</strong></span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-green-500">✓</span>
                  <span className="text-sm">Full white-label customization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-green-500">✓</span>
                  <span className="text-sm">Partner analytics dashboard</span>
                </div>
              </div>

              <Button href="/contact" className="w-full">
                Partnership Görüşmesi
              </Button>
              <p className="mt-3 text-xs text-neutral-500">
                Orta büyüklük wallet&apos;lar için
              </p>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-neutral-200 bg-white p-8">
            <div className="text-center">
              <h3 className="mb-2 text-xl font-bold text-neutral-950">Enterprise</h3>
              <div className="mb-1 text-3xl font-bold text-neutral-950">Custom Deal</div>
              <div className="mb-6 text-sm text-neutral-500">Strategic partnership</div>
              
              <div className="mb-8 space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-green-500">✓</span>
                  <span className="text-sm"><strong>Revenue sharing model</strong></span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-green-500">✓</span>
                  <span className="text-sm">Co-marketing opportunities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-green-500">✓</span>
                  <span className="text-sm">Dedicated infrastructure</span>
                </div>
              </div>

              <Button href="/contact" className="w-full">
                Strategic Partnership
              </Button>
              <p className="mt-3 text-xs text-neutral-500">
                Lobstr, Freighter seviyesinde
              </p>
            </div>
          </div>
        </div>
      </Container>

      <SectionIntro
        eyebrow="Join Partners"
        title="StellarSafe Partner Network'e Katılın"
        className="mt-24 sm:mt-32 lg:mt-40"
        centered
      >
        <p>
          Lobstr, Freighter ve diğer lider wallet&apos;ların yanında yer alın. 
          Kullanıcılarınızı koruyun, güvenilirliğinizi artırın, birlikte büyüyelim.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button href="/white-label-demo">Live Demo Görün</Button>
          <Button href="/contact" invert>Partnership Görüşmesi</Button>
        </div>
        <p className="mt-6 text-sm text-neutral-500">
          Zero maintenance • 5 dakika entegrasyon • Enterprise SLA included
        </p>
      </SectionIntro>
    </RootLayout>
  )
}