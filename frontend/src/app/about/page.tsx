import { type Metadata } from 'next'
import Image from 'next/image'

import { Border } from '@/components/Border'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { GridList, GridListItem } from '@/components/GridList'
import { PageIntro } from '@/components/PageIntro'
import { PageLinks } from '@/components/PageLinks'
import { SectionIntro } from '@/components/SectionIntro'
import { StatList, StatListItem } from '@/components/StatList'
import imageAngelaFisher from '@/images/team/angela-fisher.jpg'
import imageBenjaminRussel from '@/images/team/benjamin-russel.jpg'
import imageChelseaHagon from '@/images/team/chelsea-hagon.jpg'
import imageDriesVincent from '@/images/team/dries-vincent.jpg'
import imageEmmaDorsey from '@/images/team/emma-dorsey.jpg'
import imageJeffreyWebb from '@/images/team/jeffrey-webb.jpg'
import imageLeonardKrasner from '@/images/team/leonard-krasner.jpg'
import imageLeslieAlexander from '@/images/team/leslie-alexander.jpg'
import imageMichaelFoster from '@/images/team/michael-foster.jpg'
import { RootLayout } from '@/components/RootLayout'

function Culture() {
  return (
    <div className="mt-24 rounded-4xl bg-neutral-950 py-24 sm:mt-32 lg:mt-40 lg:py-32">
      <SectionIntro
        eyebrow="Our values"
        title="Security first, community driven."
        invert
      >
        <p>
          We are united by our commitment to protecting the Stellar ecosystem and empowering users with security intelligence.
        </p>
      </SectionIntro>
      <Container className="mt-16">
        <GridList>
          <GridListItem title="Transparency" invert>
            We believe in open-source security. Our threat detection methods and 
            findings are transparent, allowing the community to verify and improve our work.
          </GridListItem>
          <GridListItem title="Vigilance" invert>
            Security threats evolve constantly. We maintain 24/7 monitoring and 
            continuously update our detection algorithms to stay ahead of new attack vectors.
          </GridListItem>
          <GridListItem title="Community" invert>
            The Stellar ecosystem is stronger when we work together. We collaborate with 
            wallets, exchanges, and developers to share threat intelligence and best practices.
          </GridListItem>
        </GridList>
      </Container>
    </div>
  )
}

const team = [
  {
    title: 'Core Team',
    people: [
      {
        name: 'Alex Chen',
        role: 'Founder & Security Architect',
        image: { src: imageMichaelFoster },
      },
      {
        name: 'Sarah Kim',
        role: 'Lead Blockchain Developer',
        image: { src: imageLeslieAlexander },
      },
      {
        name: 'David Rodriguez',
        role: 'Threat Intelligence Analyst',
        image: { src: imageDriesVincent },
      },
    ],
  },
  {
    title: 'Development',
    people: [
      {
        name: 'Emma Thompson',
        role: 'Full-Stack Developer',
        image: { src: imageEmmaDorsey },
      },
      {
        name: 'Marcus Johnson',
        role: 'Smart Contract Auditor',
        image: { src: imageBenjaminRussel },
      },
      {
        name: 'Lisa Wang',
        role: 'Frontend Developer',
        image: { src: imageAngelaFisher },
      },
      {
        name: 'James Miller',
        role: 'DevOps Engineer',
        image: { src: imageJeffreyWebb },
      },
      {
        name: 'Rachel Green',
        role: 'UX/UI Designer',
        image: { src: imageChelseaHagon },
      },
      {
        name: 'Tom Wilson',
        role: 'Security Researcher',
        image: { src: imageLeonardKrasner },
      },
    ],
  },
]

function Team() {
  return (
    <Container className="mt-24 sm:mt-32 lg:mt-40">
      <div className="space-y-24">
        {team.map((group) => (
          <FadeInStagger key={group.title}>
            <Border as={FadeIn} />
            <div className="grid grid-cols-1 gap-6 pt-12 sm:pt-16 lg:grid-cols-4 xl:gap-8">
              <FadeIn>
                <h2 className="font-display text-2xl font-semibold text-neutral-950">
                  {group.title}
                </h2>
              </FadeIn>
              <div className="lg:col-span-3">
                <ul
                  role="list"
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8"
                >
                  {group.people.map((person) => (
                    <li key={person.name}>
                      <FadeIn>
                        <div className="group relative overflow-hidden rounded-3xl bg-neutral-100">
                          <Image
                            alt=""
                            {...person.image}
                            className="h-96 w-full object-cover grayscale transition duration-500 motion-safe:group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black to-black/0 to-40% p-6">
                            <p className="font-display text-base/6 font-semibold tracking-wide text-white">
                              {person.name}
                            </p>
                            <p className="mt-2 text-sm text-white">
                              {person.role}
                            </p>
                          </div>
                        </div>
                      </FadeIn>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeInStagger>
        ))}
      </div>
    </Container>
  )
}

export const metadata: Metadata = {
  title: 'About StellarSafe',
  description:
    'Learn about StellarSafe - the leading security platform protecting Stellar ecosystem users from scams, malicious assets, and fraudulent transactions.',
}

export default function About() {
  return (
    <RootLayout>
      <PageIntro eyebrow="About StellarSafe" title="Protecting the Stellar Ecosystem">
        <p>
          We are dedicated to making the Stellar network safer for everyone by providing
          real-time threat detection, asset verification, and comprehensive security analysis.
        </p>
        <div className="mt-10 max-w-2xl space-y-6 text-base">
          <p>
            StellarSafe was founded with a simple mission: to protect Stellar users from
            scams, malicious assets, and fraudulent transactions. As the Stellar ecosystem
            grows, so do the security challenges. We provide the tools and intelligence
            needed to navigate this landscape safely.
          </p>
          <p>
            Our platform combines advanced threat detection algorithms with community-driven
            intelligence to identify and flag suspicious activities in real-time. From asset
            verification to transaction analysis, we help users make informed decisions
            about their Stellar interactions.
          </p>
        </div>
      </PageIntro>
      <Container className="mt-16">
        <StatList>
          <StatListItem value="10K+" label="Assets Analyzed" />
          <StatListItem value="500+" label="Threats Detected" />
          <StatListItem value="99.9%" label="Uptime" />
        </StatList>
      </Container>

      <Culture />

      <Team />


      <ContactSection />
    </RootLayout>
  )
}
