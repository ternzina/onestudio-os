"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useFormStatus } from "react-dom";
import { ArrowUpRight } from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { OneStudioFooter } from "@/components/marketing/OneStudioFooter";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/use-locale";
import { contactEmail } from "@/lib/site-content";
import { submitContactMessage, type ContactActionState } from "./actions";
import {
  contactValuesFromFormData,
  validateContactValues,
  type ContactErrorCode,
  type ContactField,
  type ContactFieldErrors,
} from "./contact-validation";
import styles from "./page.module.css";

const initialState: ContactActionState = { status: "idle", errors: {} };
type ContactCopy = ReturnType<typeof getTranslations>["contact"];

function SubmitButton({ copy }: { copy: ContactCopy["form"] }) {
  const { pending } = useFormStatus();

  return (
    <button className={`${styles.submit} os-button primary`} type="submit" disabled={pending}>
      {pending ? copy.submitting : copy.submit}
      <ArrowUpRight size={17} aria-hidden="true" />
    </button>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p className={styles.error} id={id} role="alert">{message}</p> : null;
}

function isContactField(value: string): value is ContactField {
  return value === "name" || value === "email" || value === "topic" || value === "message" || value === "consent";
}

export default function ContactPageClient() {
  const [lang, setLang] = useLocale();
  const [state, formAction] = useActionState(submitContactMessage, initialState);
  const [clientErrors, setClientErrors] = useState<ContactFieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const t = getTranslations(lang).contact;

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const errors = validateContactValues(contactValuesFromFormData(new FormData(event.currentTarget)));
    setClientErrors(errors);
    if (Object.keys(errors).length > 0) event.preventDefault();
  }

  function clearFieldError(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const field = event.target.name;
    if (!isContactField(field)) return;
    setClientErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  const errorMessages: Record<ContactField, Partial<Record<ContactErrorCode, string>>> = {
    name: { required: t.form.errors.nameRequired, invalid: t.form.errors.nameInvalid },
    email: { required: t.form.errors.emailRequired, invalid: t.form.errors.emailInvalid },
    topic: { required: t.form.errors.topicRequired, invalid: t.form.errors.topicInvalid },
    message: { required: t.form.errors.messageRequired, invalid: t.form.errors.messageInvalid },
    consent: { required: t.form.errors.consentRequired },
  };

  function errorFor(field: ContactField) {
    const code = clientErrors[field] ?? state.errors[field];
    return code ? errorMessages[field][code] : undefined;
  }

  return (
    <main className={`${styles.page} os-site`}>
      <section className={styles.hero}>
        <MarketingHeader lang={lang} onLangChange={setLang} />
        <div className={styles.heroInner}>
          <SectionReveal>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <p className={`${styles.eyebrow} os-type-eyebrow`}><span />{t.hero.eyebrow}</p>
                <h1 className={`${styles.heroTitle} os-type-h1`}>{t.hero.title}</h1>
                <p className={`${styles.heroLead} os-type-supporting`}>{t.hero.lead}</p>
                <p className={`${styles.secondary} os-type-card-body`}>{t.hero.secondary}</p>

                <div className={styles.questionsBlock}>
                  <h2 className={`${styles.questionsTitle} os-type-action`}>{t.questionsTitle}</h2>
                  <ul className={styles.questionsList}>
                    {t.questions.map((question) => <li key={question}><span />{question}</li>)}
                  </ul>
                </div>

                <div className={styles.directContact}>
                  <span className="os-type-eyebrow">{t.directContactLabel}</span>
                  <a className="os-type-action" href={`mailto:${contactEmail}`}>{contactEmail}</a>
                  <a className="os-type-action" href="tel:+380954441859">+380 95 444 18 59</a>
                </div>
              </div>

              <div className={styles.formCard}>
                {state.status === "success" ? (
                  <div className={styles.success} role="status" aria-live="polite">
                    <span className={styles.successMark} aria-hidden="true">✓</span>
                    <h2 className="os-type-card-title">{t.form.successTitle}</h2>
                    <p className="os-type-supporting">{t.form.successDescription}</p>
                  </div>
                ) : (
                  <form ref={formRef} action={formAction} onSubmit={handleSubmit} noValidate>
                    <div className={styles.formHeading}>
                      <p className={`${styles.formEyebrow} os-type-eyebrow`}>ONESTUDIO</p>
                      <h2 className="os-type-card-title">{t.form.title}</h2>
                      <p className="os-type-card-body">{t.form.description}</p>
                    </div>

                    <div className={styles.formFields}>
                      <div className={styles.field}>
                        <label className={`${styles.label} os-type-action`} htmlFor="contact-name">{t.form.nameLabel}<span aria-hidden="true">*</span></label>
                        <input id="contact-name" name="name" type="text" placeholder={t.form.namePlaceholder} autoComplete="name" required aria-invalid={Boolean(errorFor("name"))} aria-describedby={errorFor("name") ? "contact-name-error" : undefined} onChange={clearFieldError} />
                        <FieldError id="contact-name-error" message={errorFor("name")} />
                      </div>

                      <div className={styles.field}>
                        <label className={`${styles.label} os-type-action`} htmlFor="contact-email">{t.form.emailLabel}<span aria-hidden="true">*</span></label>
                        <input id="contact-email" name="email" type="email" placeholder={t.form.emailPlaceholder} autoComplete="email" required aria-invalid={Boolean(errorFor("email"))} aria-describedby={errorFor("email") ? "contact-email-error" : undefined} onChange={clearFieldError} />
                        <FieldError id="contact-email-error" message={errorFor("email")} />
                      </div>

                      <div className={styles.field}>
                        <label className={`${styles.label} os-type-action`} htmlFor="contact-phone">{t.form.phoneLabel}<span className={styles.optional}>({t.form.phoneOptional})</span></label>
                        <input id="contact-phone" name="phone" type="tel" placeholder={t.form.phonePlaceholder} autoComplete="tel" onChange={clearFieldError} />
                      </div>

                      <div className={styles.field}>
                        <label className={`${styles.label} os-type-action`} htmlFor="contact-topic">{t.form.topicLabel}<span aria-hidden="true">*</span></label>
                        <select id="contact-topic" name="topic" defaultValue="" required aria-invalid={Boolean(errorFor("topic"))} aria-describedby={errorFor("topic") ? "contact-topic-error" : undefined} onChange={clearFieldError}>
                          <option value="" disabled>{t.form.topicPlaceholder}</option>
                          {t.topics.map((topic) => <option key={topic.value} value={topic.value}>{topic.label}</option>)}
                        </select>
                        <FieldError id="contact-topic-error" message={errorFor("topic")} />
                      </div>

                      <div className={`${styles.field} ${styles.fieldFull}`}>
                        <label className={`${styles.label} os-type-action`} htmlFor="contact-message">{t.form.messageLabel}<span aria-hidden="true">*</span></label>
                        <textarea id="contact-message" name="message" placeholder={t.form.messagePlaceholder} rows={6} required aria-invalid={Boolean(errorFor("message"))} aria-describedby={errorFor("message") ? "contact-message-error" : undefined} onChange={clearFieldError} />
                        <FieldError id="contact-message-error" message={errorFor("message")} />
                      </div>
                    </div>

                    <div className={styles.consentField}>
                      <label className={styles.consentLabel} htmlFor="contact-consent">
                        <input id="contact-consent" name="consent" value="yes" type="checkbox" required aria-invalid={Boolean(errorFor("consent"))} aria-describedby={errorFor("consent") ? "contact-consent-error" : undefined} onChange={clearFieldError} />
                        <span>{t.form.consentBefore}<Link href="/privacy">{t.form.consentLink}</Link>{t.form.consentAfter}</span>
                      </label>
                      <FieldError id="contact-consent-error" message={errorFor("consent")} />
                    </div>

                    <div className={styles.honeypot} aria-hidden="true">
                      <label htmlFor="contact-website">Website</label>
                      <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                    </div>

                    <SubmitButton copy={t.form} />

                    {state.status === "unavailable" ? (
                      <p className={styles.statusMessage} role="status" aria-live="polite">
                        {t.form.unavailable} <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                      </p>
                    ) : null}
                  </form>
                )}
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      <OneStudioFooter lang={lang} />
    </main>
  );
}
