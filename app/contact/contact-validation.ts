import { contactTopicValues, type ContactTopicValue } from "@/lib/i18n/config";

export type ContactField = "name" | "email" | "topic" | "message" | "consent";
export type ContactErrorCode = "required" | "invalid";
export type ContactFieldErrors = Partial<Record<ContactField, ContactErrorCode>>;

export type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  consent: boolean;
  honeypot: string;
};

function textValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function contactValuesFromFormData(formData: FormData): ContactFormValues {
  return {
    name: textValue(formData, "name"),
    email: textValue(formData, "email"),
    phone: textValue(formData, "phone"),
    topic: textValue(formData, "topic"),
    message: textValue(formData, "message"),
    consent: formData.get("consent") === "yes",
    honeypot: textValue(formData, "website"),
  };
}

function isTopic(value: string): value is ContactTopicValue {
  return contactTopicValues.includes(value as ContactTopicValue);
}

export function validateContactValues(values: ContactFormValues): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  if (!values.name) errors.name = "required";
  else if (values.name.length > 120) errors.name = "invalid";

  if (!values.email) errors.email = "required";
  else if (values.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "invalid";

  if (!values.topic) errors.topic = "required";
  else if (!isTopic(values.topic)) errors.topic = "invalid";

  if (!values.message) errors.message = "required";
  else if (values.message.length > 5000) errors.message = "invalid";

  if (!values.consent) errors.consent = "required";

  return errors;
}
