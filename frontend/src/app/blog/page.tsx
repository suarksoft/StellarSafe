import { type Metadata } from 'next';
import { ContactSection } from '@/components/ContactSection';
import { PageIntro } from '@/components/PageIntro';
import { RootLayout } from '@/components/RootLayout';
import { Container } from '@/components/Container';
import { FadeIn } from '@/components/FadeIn';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'StellarSafe security insights, threat analysis, and Stellar ecosystem safety updates.',
};

const blogPosts = [
  {
    title: "Understanding Stellar Asset Flags: AUTH_REVOCABLE Explained",
    excerpt: "Learn why AUTH_REVOCABLE is the most dangerous flag for Stellar assets and how to protect yourself.",
    date: "November 2024",
    category: "Security",
    readTime: "5 min read",
    status: "Coming Soon"
  },
  {
    title: "Top 10 Stellar Scams in 2024 and How to Avoid Them",
    excerpt: "Real examples of scams targeting Stellar users and the warning signs you should watch for.",
    date: "November 2024", 
    category: "Threat Analysis",
    readTime: "8 min read",
    status: "Coming Soon"
  },
  {
    title: "Building Secure Stellar Applications: Developer Guide",
    excerpt: "Best practices for developers building on Stellar to protect their users from common threats.",
    date: "December 2024",
    category: "Development",
    readTime: "12 min read", 
    status: "Coming Soon"
  },
  {
    title: "StellarSafe API: Integration Guide for Wallets",
    excerpt: "Step-by-step guide to integrating StellarSafe security features into your Stellar wallet.",
    date: "December 2024",
    category: "Integration",
    readTime: "10 min read",
    status: "Coming Soon"
  }
];

export default function Blog() {
  return (
    <RootLayout>
      <PageIntro eyebrow="Blog" title="Security Insights">
        <p>
          Stay informed about the latest threats, security best practices, and developments in the Stellar ecosystem.
        </p>
      </PageIntro>

      <Container className="mt-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {blogPosts.map((post, index) => (
            <FadeIn key={index}>
              <article className="bg-white rounded-2xl border border-neutral-200 p-8 hover:border-neutral-950 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {post.category}
                  </span>
                  <span className="text-sm text-neutral-500">{post.date}</span>
                  <span className="text-sm text-neutral-500">•</span>
                  <span className="text-sm text-neutral-500">{post.readTime}</span>
                </div>
                
                <h2 className="text-xl font-bold text-neutral-950 mb-3">
                  {post.title}
                </h2>
                
                <p className="text-neutral-600 mb-4">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-600">
                    {post.status}
                  </span>
                  <button 
                    disabled
                    className="text-sm font-medium text-neutral-400 cursor-not-allowed"
                  >
                    Read more →
                  </button>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>

        {/* Newsletter Signup */}
        <FadeIn>
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-neutral-950 mb-4">
              Stay Updated on Stellar Security
            </h2>
            <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
              Get notified when we publish new security insights, threat reports, and updates about the Stellar ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </FadeIn>
      </Container>

      <ContactSection />
    </RootLayout>
  );
}
