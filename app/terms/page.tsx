import type { Metadata } from "next";
import PlatformLegalShell, {
  LegalSection,
} from "@/components/marketing/PlatformLegalShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing access to and use of the OneStudio OS business platform.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PlatformLegalShell
      eyebrow="Service terms"
      title="Terms of Service"
      intro="These terms govern access to OneStudio OS, including its website builder, booking, calendar, client, payment, media and analytics features."
      updatedAt="30 July 2026"
    >
      <LegalSection title="1. The service">
        <p>
          OneStudio OS provides cloud software and related configuration,
          implementation and support services for service businesses. The
          features, limits, price and service period that apply to a customer
          are shown in the selected plan, order, invoice or individual
          proposal.
        </p>
      </LegalSection>

      <LegalSection title="2. Accounts and workspaces">
        <p>
          Customers must provide accurate information, protect account access
          and assign workspace roles only to authorized people. The workspace
          owner is responsible for business settings, content, staff access and
          activity performed through the workspace.
        </p>
      </LegalSection>

      <LegalSection title="3. Customer content and client data">
        <p>
          Customers retain responsibility for content and personal data they
          upload or collect through OneStudio OS. They must have the rights and
          lawful basis needed to use that content and data, publish required
          notices and respond to their clients&apos; privacy requests.
        </p>
      </LegalSection>

      <LegalSection title="4. Integrations">
        <p>
          Optional integrations, including Google Calendar, Supabase, Vercel,
          Cloudflare, email and payment providers, are also governed by the
          provider&apos;s terms. Customers choose whether to connect an
          integration and may disconnect it. Provider availability and policy
          changes can affect a connected feature.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceptable use">
        <p>
          OneStudio OS may not be used to break the law, infringe rights,
          distribute malware, bypass access controls, abuse third-party
          services, send unlawful messages or interfere with the security or
          availability of the platform.
        </p>
      </LegalSection>

      <LegalSection title="6. Payments and cancellation">
        <p>
          Fees are due as stated in the applicable order. Cancelling a
          subscription stops future renewals but does not automatically refund
          a current period or completed implementation work. Any agreed refund
          is handled under the order terms and applicable law.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual property">
        <p>
          OneStudio OS software, core architecture, design system and
          documentation remain the property of their respective rights holders.
          A customer receives a limited right to use the service for the agreed
          period and scope.
        </p>
      </LegalSection>

      <LegalSection title="8. Availability and liability">
        <p>
          We work to keep the service secure and available, but uninterrupted
          operation cannot be guaranteed. To the extent permitted by law,
          liability is limited to direct losses and the amount paid for the
          affected service during the preceding six months.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes and contact">
        <p>
          We may update the service and these terms. Material changes affecting
          active paid customers will be communicated through a reasonable
          channel. Questions can be sent to{" "}
          <a
            href="mailto:hello@onestudioos.com"
            className="font-semibold text-[#397c70]"
          >
            hello@onestudioos.com
          </a>
          .
        </p>
      </LegalSection>
    </PlatformLegalShell>
  );
}
