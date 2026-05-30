const dataTypes = [
  'Account details such as name, email address, role and login information.',
  'Business details such as business name, type, phone number, country, currency and setup preferences.',
  'Inventory and supplier data such as item names, quantities, costs, expiry dates, reorder settings, supplier contacts and notes.',
  'Operational records such as inventory movements, staff requests, reorder lists, waste records, automation logs and audit information.',
  'Billing data such as plan, subscription status, Stripe customer identifiers and checkout metadata.',
  'Technical data such as IP address, browser information, session data, logs and security events.',
]

const purposes = [
  {
    purpose: 'Provide the service',
    basis: 'Contract',
    detail: 'Create accounts, authenticate users, manage inventory and food service workflows, provide reports and operate subscriptions.',
  },
  {
    purpose: 'Secure and maintain WasteVerity',
    basis: 'Legitimate interests',
    detail: 'Prevent misuse, debug errors, audit access, monitor reliability and protect customer data.',
  },
  {
    purpose: 'Billing and payment administration',
    basis: 'Contract and legal obligation',
    detail: 'Create checkout sessions, maintain subscription status, keep payment records and meet accounting duties.',
  },
  {
    purpose: 'Customer support',
    basis: 'Contract and legitimate interests',
    detail: 'Respond to questions, investigate issues and maintain service quality.',
  },
  {
    purpose: 'Legal compliance',
    basis: 'Legal obligation',
    detail: 'Comply with tax, accounting, regulatory, security and law enforcement obligations where they apply.',
  },
]

const rights = [
  'Access the personal data we hold about you.',
  'Ask us to correct inaccurate personal data.',
  'Ask us to delete personal data where the law allows.',
  'Ask us to restrict or object to certain processing.',
  'Ask for data portability where this applies.',
  'Complain to the Information Commissioner\'s Office if you are unhappy with how your data is handled.',
]

export default function Privacy() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <article className="mx-auto max-w-4xl rounded border bg-white p-6 shadow-sm sm:p-8">
        <header className="border-b pb-6">
          <p className="text-sm font-medium text-accent">WasteVerity legal</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-950">Privacy Notice</h1>
          <p className="mt-3 text-gray-600">Last updated: 29 May 2026</p>
          <p className="mt-4 text-sm text-gray-600">
            This draft is written for launch review. Replace the contact and company placeholders with the correct legal details before using it with real customers.
          </p>
        </header>

        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-950">Who We Are</h2>
            <p className="mt-3 text-gray-700">
              WasteVerity is operated by [Legal company name]. Contact us at [privacy email]. Registered address: [registered business address].
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">Personal Data We Collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
              {dataTypes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">How We Use Personal Data</h2>
            <div className="mt-4 overflow-x-auto rounded border">
              <table className="min-w-full text-left">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 text-sm font-semibold">Purpose</th>
                    <th className="p-3 text-sm font-semibold">Lawful basis</th>
                    <th className="p-3 text-sm font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {purposes.map((row) => (
                    <tr key={row.purpose} className="border-t">
                      <td className="p-3 align-top font-medium">{row.purpose}</td>
                      <td className="p-3 align-top">{row.basis}</td>
                      <td className="p-3 align-top">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">Who We Share Data With</h2>
            <div className="mt-3 space-y-3 text-gray-700">
              <p>We share personal data only where needed to operate WasteVerity, meet legal duties or protect the service.</p>
              <p>Processors may include hosting providers, database providers, authentication/session providers, Stripe for billing, email or notification providers, analytics/error monitoring providers and professional advisers.</p>
              <p>We do not sell personal data.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">International Transfers</h2>
            <p className="mt-3 text-gray-700">
              Some providers may process data outside the UK or European Economic Area. Where this happens, we use appropriate safeguards such as adequacy regulations, standard contractual clauses or equivalent protections required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">Retention</h2>
            <p className="mt-3 text-gray-700">
              We keep personal data for as long as needed to provide WasteVerity, meet legal and accounting obligations, resolve disputes and maintain security records. Operational inventory data is kept while the account is active unless deleted earlier by an authorised user or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">Your Rights</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
              {rights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-3 text-gray-700">
              The ICO can be contacted at ico.org.uk or by phone on 0303 123 1113.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">Cookies and Similar Technologies</h2>
            <p className="mt-3 text-gray-700">
              WasteVerity uses essential cookies or similar storage for login sessions, security and service operation. If analytics or marketing cookies are added later, this notice and any cookie controls should be updated before they are used.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">Changes to This Notice</h2>
            <p className="mt-3 text-gray-700">
              We may update this Privacy Notice when WasteVerity, our providers or legal requirements change. If changes are material, we will take reasonable steps to bring them to your attention.
            </p>
          </section>

          <section className="rounded border border-amber-200 bg-amber-50 p-4">
            <h2 className="text-lg font-semibold text-amber-950">Before Launch</h2>
            <p className="mt-2 text-sm text-amber-900">
              Have this Privacy Notice reviewed against your actual company details, processors, retention periods, countries, data flows and customer base before handling real business data.
            </p>
          </section>
        </div>
      </article>
    </main>
  )
}
