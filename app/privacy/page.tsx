import type { Metadata } from "next";
import PlatformLegalShell, {
  LegalSection,
} from "@/components/marketing/PlatformLegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How OneStudio OS collects, uses, stores and protects personal data, including Google Calendar data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PlatformLegalShell
      eyebrow="Privacy & Google API data"
      title="Privacy Policy"
      intro="This policy explains how OneStudio OS processes account, business, booking and integration data, including the limited Google Calendar data required for two-way scheduling."
      updatedAt="30 July 2026"
    >
      <LegalSection title="1. Who operates OneStudio OS">
        <p>
          OneStudio OS is a web platform for service businesses. Privacy
          questions, access requests and deletion requests can be sent to{" "}
          <a
            href="mailto:hello@onestudioos.com"
            className="font-semibold text-[#397c70]"
          >
            hello@onestudioos.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Data we process">
        <p>
          We may process account identifiers, names, contact details, business
          settings, services, staff and resource information, bookings,
          payments and transaction status, uploaded media, support messages,
          security records and technical logs.
        </p>
        <p>
          A OneStudio customer controls the personal data they enter about
          their own clients and is responsible for having a lawful basis to
          collect and use that data.
        </p>
      </LegalSection>

      <LegalSection title="3. Google Calendar data">
        <p>
          Google Calendar access is optional and begins only after an authorized
          workspace administrator selects “Connect Google Calendar” and grants
          permission. OneStudio requests permission to create a secondary
          calendar and to view and manage events only in calendars created by
          OneStudio OS.
        </p>
        <p>
          OneStudio automatically creates a separate work calendar for each
          connected business. It does not read or change the Google
          account&apos;s personal calendar or other calendars. Inside the
          OneStudio-created calendar, the platform may process event identifiers,
          titles, start and end times, all-day dates, update timestamps and busy
          status. It also creates, updates or removes events that correspond to
          OneStudio bookings. OAuth access and refresh tokens are stored
          server-side in encrypted form and are never exposed on a public
          website.
        </p>
        <p>
          This data is used only to show accurate availability, prevent double
          booking and keep user-directed OneStudio bookings synchronized with
          Google Calendar. It is not sold, used for advertising, used to
          determine creditworthiness, or used to train general-purpose AI
          models.
        </p>
        <p>
          OneStudio OS&apos;s use and transfer of information received from
          Google APIs adheres to the Google API Services User Data Policy,
          including its Limited Use requirements.
        </p>
      </LegalSection>

      <LegalSection title="4. Why we use data">
        <p>
          Data is processed to provide the requested platform features, operate
          websites and bookings, secure accounts, deliver notifications,
          support customers, maintain records and comply with legal
          obligations. We do not use Google user data for unrelated product
          profiling.
        </p>
      </LegalSection>

      <LegalSection title="5. Service providers and transfers">
        <p>
          We use service providers only where needed to operate OneStudio OS,
          including hosting, databases, email, payment and Google API services.
          They receive only the data required for their role and process it
          under their own terms and applicable data-protection obligations. We
          do not sell personal data.
        </p>
      </LegalSection>

      <LegalSection title="6. Storage, retention and deletion">
        <p>
          Data is kept only as long as needed for the feature, contract,
          security or legal obligation. Google OAuth tokens remain until the
          workspace disconnects Google Calendar, the Google account revokes
          access, or the connection is deleted.
        </p>
        <p>
          Disconnecting removes the stored OAuth connection, imported busy
          windows and OneStudio-to-Google event links. Events already created in
          the separate work calendar may remain in the user&apos;s Google
          account and can be deleted there together with that calendar. A user
          can also revoke OneStudio OS from their Google Account permissions.
        </p>
      </LegalSection>

      <LegalSection title="7. Security and user choices">
        <p>
          We use access controls, workspace separation, encrypted OAuth tokens
          and server-only credentials. Authorized users can disconnect Google
          Calendar from the Integrations page. Requests to access, correct or
          delete personal data can be sent to the contact address above.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes">
        <p>
          We may update this policy as OneStudio OS changes. The current version
          and its effective date are always published on this page.
        </p>
      </LegalSection>
    </PlatformLegalShell>
  );
}
