/**
 * Capacity refresh engine.
 * Generates inquiry emails from templates with merge fields
 * and tracks inquiry status per contact.
 */

export interface CapacityInquiryTemplate {
  subject: string;
  body: string;
}

export interface CapacityInquiryContext {
  contact_name: string;
  contact_email: string;
  contact_id: string;
  carrier_name: string;
  line_of_business_name: string;
  line_of_business_id: string;
  current_capacity: string;
  last_verified: string;
}

const DEFAULT_TEMPLATE: CapacityInquiryTemplate = {
  subject: 'Capacity Inquiry – {{line_of_business_name}} with {{carrier_name}}',
  body: `Dear {{contact_name}},

I hope this message finds you well. I am reaching out to confirm current capacity and appetite for {{line_of_business_name}} with {{carrier_name}}.

Could you please confirm:
1. Current available capacity/limits
2. Any changes to appetite or underwriting guidelines
3. Target classes of business

Our records show the last verified capacity as: {{current_capacity}} (verified: {{last_verified}}).

Thank you for your time.

Best regards`,
};

/**
 * Generate an email from the template, substituting merge fields.
 */
export function generateInquiryEmail(
  context: CapacityInquiryContext,
  template: CapacityInquiryTemplate = DEFAULT_TEMPLATE,
): { to: string; subject: string; body: string } {
  const mergeFields: Record<string, string> = {
    '{{contact_name}}': context.contact_name,
    '{{contact_email}}': context.contact_email,
    '{{carrier_name}}': context.carrier_name,
    '{{line_of_business_name}}': context.line_of_business_name,
    '{{current_capacity}}': context.current_capacity,
    '{{last_verified}}': context.last_verified,
  };

  let subject = template.subject;
  let body = template.body;

  for (const [placeholder, value] of Object.entries(mergeFields)) {
    subject = subject.replaceAll(placeholder, value);
    body = body.replaceAll(placeholder, value);
  }

  return {
    to: context.contact_email,
    subject,
    body,
  };
}

/**
 * Generate inquiry emails for a batch of contacts.
 */
export function generateBatchInquiries(
  contexts: CapacityInquiryContext[],
  template?: CapacityInquiryTemplate,
): { to: string; subject: string; body: string }[] {
  return contexts.map((context) => generateInquiryEmail(context, template));
}
