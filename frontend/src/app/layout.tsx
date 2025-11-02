import { type Metadata } from 'next'

import '@/styles/tailwind.css'

export const metadata: Metadata = {
  title: {
    template: '%s - StellarSafe',
    default: 'StellarSafe - Security Layer for Stellar Blockchain',
  },
  description: 'Protect your Stellar transactions with real-time risk analysis. StellarSafe detects scams, fake tokens, and malicious contracts before you sign.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-neutral-950 text-base antialiased">
      <head>
        {/* Freighter API - ZORUNLU: Extension otomatik inject etmiyor, manuel eklememiz gerekiyor! */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/stellar-freighter-api/5.0.0/index.min.js" async></script>
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Freighter Detection Script
              (function() {
                let checkCount = 0;
                const maxChecks = 20;
                const checkInterval = 250;
                
                function checkFreighter() {
                  checkCount++;
                  
                  if (window.freighterApi) {
                    console.log('✅ Freighter API detected after ' + (checkCount * checkInterval) + 'ms');
                    console.log('Freighter API:', window.freighterApi);
                    return;
                  }
                  
                  if (checkCount < maxChecks) {
                    setTimeout(checkFreighter, checkInterval);
                  } else {
                    console.warn('⚠️ Freighter API not detected after ' + (maxChecks * checkInterval) + 'ms');
                    console.log('The CDN script may not have loaded correctly.');
                  }
                }
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', checkFreighter);
                } else {
                  checkFreighter();
                }
              })();
            `,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
