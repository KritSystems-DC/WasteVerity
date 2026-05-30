const sections = [
  {
    title: '1. Who These Terms Are For',
    body: [
      'These Terms apply when you access or use WasteVerity, a healthcare food service operations platform for regulated kitchens and care providers.',
      'If you use WasteVerity on behalf of a business, facility or organisation, you confirm that you have authority to accept these Terms for that organisation.',
    ],
  },
  {
    title: '2. Your Account',
    body: [
      'You are responsible for keeping login details secure and for activity carried out through your account.',
      'You must provide accurate account and business information and keep it up to date.',
      'Tell us promptly if you believe an account has been accessed without permission.',
    ],
  },
  {
    title: '3. Using WasteVerity',
    body: [
      'You may use WasteVerity to manage inventory items, suppliers, reorder lists, waste records, staff requests, compliance records, reports and related operational data.',
      'You must not misuse the service, attempt to bypass access controls, interfere with the service, upload unlawful content, or use WasteVerity in a way that harms other users or systems.',
      'You are responsible for checking the accuracy of inventory, cost, expiry, compliance and reorder information before relying on it for operational decisions.',
    ],
  },
  {
    title: '4. Subscriptions and Billing',
    body: [
      'Paid plans, if enabled, are billed through Stripe or another payment provider shown at checkout.',
      'Prices, billing periods and plan features are shown before purchase. Taxes may apply depending on your location.',
      'If payment fails or a subscription is cancelled, access to paid features may be suspended or ended.',
    ],
  },
  {
    title: '5. Your Data',
    body: [
      'You keep ownership of business data you enter into WasteVerity.',
      'You give us permission to process that data so we can provide, secure, support and improve the service.',
      'You are responsible for ensuring you have the right to enter staff, supplier and business contact details into WasteVerity.',
    ],
  },
  {
    title: '6. Service Availability',
    body: [
      'We aim to keep WasteVerity available and reliable, but we do not guarantee uninterrupted or error-free access.',
      'We may update, suspend or change parts of the service for maintenance, security, legal or operational reasons.',
    ],
  },
  {
    title: '7. Disclaimers',
    body: [
      'WasteVerity provides operational food service information and reports. It is not accounting, tax, food safety, legal, clinical or professional advice.',
      'You remain responsible for physical checks, compliance obligations, supplier decisions, pricing decisions and organisational records.',
    ],
  },
  {
    title: '8. Liability',
    body: [
      'Nothing in these Terms limits liability where the law does not allow it to be limited.',
      'To the extent allowed by law, WasteVerity is not responsible for indirect loss, loss of profit, loss of business, loss of goodwill, or loss caused by inaccurate data entered by users.',
    ],
  },
  {
    title: '9. Ending Access',
    body: [
      'You may stop using WasteVerity at any time. Subscription cancellation terms depend on the billing provider and plan you choose.',
      'We may suspend or end access if you materially breach these Terms, create security risk, fail to pay, or use the service unlawfully.',
    ],
  },
  {
    title: '10. Changes to These Terms',
    body: [
      'We may update these Terms as the service changes. If changes are material, we will take reasonable steps to bring them to your attention.',
      'Continuing to use WasteVerity after updated Terms apply means you accept the updated Terms.',
    ],
  },
]

export default function Terms() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <article className="mx-auto max-w-4xl rounded border bg-white p-6 shadow-sm sm:p-8">
        <header className="border-b pb-6">
          <p className="text-sm font-medium text-accent">WasteVerity legal</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-950">Terms of Service</h1>
          <p className="mt-3 text-gray-600">Last updated: 29 May 2026</p>
          <p className="mt-4 text-sm text-gray-600">
            This draft is written for launch review. Replace the contact and company placeholders with the correct legal details before using it with real customers.
          </p>
        </header>

        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-950">Contact Details</h2>
            <p className="mt-3 text-gray-700">
              WasteVerity is operated by [Legal company name]. Contact: [support email]. Registered address: [registered business address].
            </p>
          </section>

          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-gray-950">{section.title}</h2>
              <div className="mt-3 space-y-3 text-gray-700">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded border border-amber-200 bg-amber-50 p-4">
            <h2 className="text-lg font-semibold text-amber-950">Before Launch</h2>
            <p className="mt-2 text-sm text-amber-900">
              Have these Terms reviewed by a qualified adviser for your company structure, country, customers, billing model and risk position before accepting real business data or payments.
            </p>
          </section>
        </div>
      </article>
    </main>
  )
}
