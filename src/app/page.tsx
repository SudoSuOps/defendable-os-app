import { Cta } from '@/components/cta/Cta';
import { Curator } from '@/components/curator/Curator';
import { EcosystemSection } from '@/components/ecosystem/EcosystemSection';
import { EdgeSection } from '@/components/edge/EdgeSection';
import { EngineSection } from '@/components/engine/EngineSection';
import { FlightsheetSection } from '@/components/flightsheet/FlightsheetSection';
import { FounderSection } from '@/components/founder/FounderSection';
import { FaqSection } from '@/components/faq/FaqSection';
import { Hero } from '@/components/hero/Hero';
import { DialHost } from '@/components/navigation/DialHost';
import { FooterNav } from '@/components/navigation/FooterNav';
import { StickyNav } from '@/components/navigation/StickyNav';
import { Problem } from '@/components/problem/Problem';
import { ReceiptSection } from '@/components/receipts/ReceiptSection';
import { ValidatorLab } from '@/components/validator/ValidatorLab';
import { jsonLd } from '@/lib/seo/jsonld';

/** Feature flag: every sample is labelled as demonstration data unless this is turned off. */
const DEMO_LABELS = true;

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
      <a
        href="#main"
        className="absolute left-[-9999px] top-2 z-[100] rounded-md bg-gold px-3.5 py-2.5 text-canvas focus:left-2 focus:text-canvas"
      >
        Skip to content
      </a>
      <StickyNav />
      <main id="main">
        <Hero />
        <Problem demoLabels={DEMO_LABELS} />
        <EngineSection />
        <Curator demoLabels={DEMO_LABELS} />
        <ValidatorLab demoLabels={DEMO_LABELS} />
        <FlightsheetSection />
        <ReceiptSection demoLabels={DEMO_LABELS} />
        <EdgeSection />
        <EcosystemSection />
        <FounderSection />
        <FaqSection />
        <Cta />
      </main>
      <FooterNav />
      <DialHost />
    </>
  );
}
