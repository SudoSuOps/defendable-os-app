import { FAQS } from './faq';
import { SITE, abs } from './site';

/** One linked graph (Organization, Person, WebSite, WebPage, SoftwareApplication, FAQPage). No ratings, offers or reviews: none exist. */
export function jsonLd() {
  const org = `${abs('/')}#organization`;
  const person = `${abs('/')}#founder`;
  const site = `${abs('/')}#website`;
  const page = `${abs('/')}#webpage`;
  const app = `${abs('/')}#software`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': org,
        name: SITE.org,
        url: abs('/'),
        logo: { '@type': 'ImageObject', url: abs(SITE.logo), width: 256, height: 256 },
        email: 'build@defendableos.com',
        sameAs: [SITE.x],
        founder: { '@id': person },
        address: { '@type': 'PostalAddress', addressLocality: SITE.locality, addressRegion: SITE.region, addressCountry: SITE.country },
      },
      { '@type': 'Person', '@id': person, name: SITE.founder, jobTitle: SITE.founderTitle, worksFor: { '@id': org } },
      { '@type': 'WebSite', '@id': site, url: abs('/'), name: SITE.name, description: SITE.description, inLanguage: 'en-US', publisher: { '@id': org } },
      {
        '@type': 'WebPage',
        '@id': page,
        url: abs('/'),
        name: SITE.title,
        description: SITE.description,
        inLanguage: 'en-US',
        isPartOf: { '@id': site },
        about: { '@id': app },
        primaryImageOfPage: { '@type': 'ImageObject', url: abs(SITE.ogImage), width: 1200, height: 630 },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': app,
        name: SITE.name,
        description: SITE.description,
        applicationCategory: 'BusinessApplication',
        url: abs('/'),
        publisher: { '@id': org },
      },
      {
        '@type': 'FAQPage',
        '@id': `${abs('/')}#faq`,
        isPartOf: { '@id': page },
        mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };
}
