import { type Metadata } from 'next';
import { ContactSection } from '@/components/ContactSection';
import { PageIntro } from '@/components/PageIntro';
import { RootLayout } from '@/components/RootLayout';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'StellarSafe blog and security updates.',
};

export default function Blog() {
  return (
    <RootLayout>
      <PageIntro eyebrow="Blog" title="Security Updates">
        <p>
          Coming soon: Latest news, security tips, and insights about Stellar ecosystem safety.
        </p>
      </PageIntro>

      <ContactSection />
    </RootLayout>
  );
}
