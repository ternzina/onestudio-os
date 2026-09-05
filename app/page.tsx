"use client";

import { Fragment } from "react";
import Link from "next/link";
import { OneStudioMotionShowcase } from "@/components/marketing/OneStudioMotionShowcase";
import { OneStudioDemoShowcase } from "@/components/marketing/OneStudioDemoShowcase";
import { OneStudioSystemHero } from "@/components/marketing/OneStudioSystemHero";
import { OneStudioWorkflow } from "@/components/marketing/OneStudioWorkflow";
import type { WorkflowCopy } from "@/components/marketing/OneStudioWorkflow";
import { OneStudioCapabilities } from "@/components/marketing/OneStudioCapabilities";
import { OneStudioTechnicalStrip } from "@/components/marketing/OneStudioTechnicalStrip";
import { OneStudioLaunchSteps } from "@/components/marketing/OneStudioLaunchSteps";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { OneStudioFooter } from "@/components/marketing/OneStudioFooter";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/use-locale";

function renderFeatureTitleLine(line: string, accentWord: string) {
  const accentStart = line.indexOf(accentWord);

  if (accentStart < 0) return line;

  return (
    <>
      {line.slice(0, accentStart)}
      <strong className="os-feature-title-accent">{accentWord}</strong>
      {line.slice(accentStart + accentWord.length)}
    </>
  );
}

export default function Home() {
  const [lang, setLang] = useLocale();
  const t = getTranslations(lang);
  const home = t.home;

  return (
    <main className="os-site">
      <MarketingHeader lang={lang} onLangChange={setLang} />

      <section className="os-hero">
        <div className="os-orb os-orb-a"/><div className="os-orb os-orb-b"/>
        <div className="os-hero-copy">
          <div className="os-hero-text-group">
            <p className="os-eyebrow"><span/>{home.eyebrow}</p>
            <h1 className="os-type-h1">{home.titleLines.map((line, index) => <Fragment key={line}>{index === home.titleAccentLine ? <strong>{line}</strong> : line}{index < home.titleLines.length - 1 ? <br/> : null}</Fragment>)}</h1>
            <p className="os-lead">{home.lead}</p>
          </div>
          <div className="os-hero-cta-group">
            <div className="os-buttons">
              <Link className="os-button primary" href="/demos">{home.primary}<b>↗</b></Link>
              <a className="os-button ghost" href="#launch">{home.secondary}<b>↓</b></a>
            </div>
            <p className="os-note"><i>✓</i>{home.heroNote}</p>
          </div>
        </div>

        <div className="os-hero-system-wrap">
          <OneStudioSystemHero />
        </div>
      </section>

      <section className="os-features" id="features">
        <SectionReveal>
          <div className="os-public-content-guide">
            <div className="os-features-intro">
              <div>
                <p className="os-feature-eyebrow os-type-eyebrow"><span />{home.sectionEyebrow}</p>
                <h2 className="os-type-h2">{home.featureTitle.map((line) => <span key={line}>{renderFeatureTitleLine(line, home.featureAccent)}</span>)}</h2>
              </div>
              <p className="os-feature-intro-copy os-type-supporting">{home.featureLead}</p>
            </div>
          </div>

          <div className="os-public-content-guide-wide">
            <div className="os-feature-composition">
              <article className="os-feature-zone os-feature-zone-site">
                <div className="os-feature-zone-copy">
                  <span className="os-feature-zone-index">01</span>
                  <h3 className="os-type-card-title">{home.websiteOnly.title}</h3>
                  <p className="os-type-card-body">{home.websiteOnly.description}</p>
                  <small className="os-type-micro">{home.websiteOnly.microline}</small>
                  <Link className="os-feature-link os-type-action" href="/demos">{home.websiteOnly.cta}<b>↗</b></Link>
                </div>

                <div className="os-website-visual" aria-hidden="true">
                  <div className="os-browser-window">
                    <div className="os-browser-chrome"><span /><span /><span /><small>your-site.com</small><b>↗</b></div>
                    <div className="os-browser-page">
                      <div className="os-site-nav"><strong>STUDIO / 01</strong><span /><i /></div>
                      <div className="os-site-hero-art"><div><small>YOUR CONTENT</small><strong>Make room<br />for your work.</strong><i>↘</i></div><div className="os-site-image"><span /></div></div>
                      <div className="os-site-footer"><span>01 – 03</span><span /><b>Published</b></div>
                    </div>
                  </div>
                </div>
              </article>

              <article className="os-feature-zone os-feature-zone-system">
                <div className="os-feature-zone-copy">
                  <span className="os-feature-zone-index">02</span>
                  <h3 className="os-type-card-title">{home.websiteSystem.title}</h3>
                  <p className="os-type-card-body">{home.websiteSystem.description}</p>
                  <small className="os-type-micro">{home.websiteSystem.microline}</small>
                  <a className="os-feature-link os-type-action" href="#features">{home.websiteSystem.cta}<b>↓</b></a>
                </div>

                <div className="os-system-visual" aria-hidden="true">
                  <span className="os-network-line os-network-line-a" /><span className="os-network-line os-network-line-b" /><span className="os-network-line os-network-line-c" /><span className="os-network-line os-network-line-d" /><span className="os-network-line os-network-line-e" />
                  <div className="os-system-core"><span className="os-core-mark"><i /><i /><i /></span><strong>OneStudio</strong><small>OS CORE</small></div>
                  {home.websiteSystem.modules.map((module, index) => <div key={module} className={`os-module os-module-${["booking", "crm", "payments", "automation", "analytics"][index]}`}><i />{module}</div>)}
                </div>
              </article>
            </div>
          </div>
        </SectionReveal>
      </section>

      <OneStudioWorkflow id="businesses" copy={home.workflow as WorkflowCopy} />
      <OneStudioMotionShowcase id="design-motion" lang={lang} />
      <OneStudioDemoShowcase lang={lang} />
      <OneStudioCapabilities lang={lang} />
      <OneStudioTechnicalStrip lang={lang} />
      <OneStudioLaunchSteps lang={lang} />
      <OneStudioFooter lang={lang} />
    </main>
  );
}
