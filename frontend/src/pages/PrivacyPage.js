import React from 'react';
import '../assets/css/privacy.css';

export default function PrivacyPage() {
  return (
    <main className="policy-page">
      <div className="policy-container">
        <p className="policy-updated">Last updated on September 15, 2025</p>
        <h1 className="policy-title">Privacy policy</h1>

        <section className="policy-section">
          <p className="policy-lead">Mangrove Studios ("Mangrove", "we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share your information when you use our website, mobile applications, and related services (collectively, the "Services").</p>
        </section>

        <section className="policy-section">
          <h2>1. Information we collect</h2>
          <h3>1.a Account Information</h3>
          <p>Name, email address, password, and profile details (such as role, publisher/PRO affiliation, or P/CAE numbers) you provide when creating an account.</p>
          <h3>1.b. Session & document data</h3>
          <p>Metadata from sessions (song titles, dates, collaborators, ownership percentages, and negotiation history).</p>
          <p>Uploaded files, split sheets, receipts, and related documentation.</p>
          <h3>1.c. Device & usage data</h3>
          <p>IP address, browser type, operating system, and usage logs (e.g., when you create or join sessions).</p>
          <h3>1.d. Payment information</h3>
          <p>If you purchase a plan, we collect payment details through secure third-party processors (we do not store full credit card numbers).</p>
        </section>

        <section className="policy-section">
          <h2>2. How we use your information</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Provide and improve the Services.</li>
            <li>Automatically fill split sheets and generate legal receipts.</li>
            <li>Enable collaboration with invited contributors.</li>
            <li>Communicate updates, security alerts, and support messages.</li>
            <li>Process payments and manage your subscription.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. How we share your information</h2>
          <p>We only share your data in limited circumstances:</p>
          <ul>
            <li>With collaborators: when you join a session, your profile details and ownership claims are shared with session members.</li>
            <li>With service providers: such as payment processors, hosting providers, and analytics tools.</li>
            <li>For legal reasons: if required by law, court order, or to protect the rights of Mangrove or its users.</li>
          </ul>
          <p>We do not sell or rent your personal data to third parties.</p>
        </section>

        <section className="policy-section">
          <h2>4. Data storage & security</h2>
          <p>All session data and split sheets are encrypted in storage and during transfer.</p>
          <p>Access to your account is protected with password authentication.</p>
          <p>We retain your data for as long as necessary to provide the services or comply with legal obligations.</p>
        </section>

        <section className="policy-section">
          <h2>5. Your rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access, correct, or delete your personal data.</li>
            <li>Download a copy of your session history and receipts.</li>
            <li>Opt out of marketing communications.</li>
            <li>Delete your account directly through the profile settings.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>6. Cookies & tracking</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul>
            <li>Keep you logged in.</li>
            <li>Remember your preferences.</li>
            <li>Measure site performance and improve features.</li>
          </ul>
          <p>You can disable cookies in your browser, but some services may not function properly.</p>
        </section>

        <section className="policy-section">
          <h2>7. Children’s privacy</h2>
          <p>Mangrove is not directed to individuals under the age of 13. If we learn that we have collected data from a child under 13 without parental consent, we will delete it promptly.</p>
        </section>

        <section className="policy-section">
          <h2>8. Changes to this policy</h2>
          <p>We may update this privacy policy from time to time. Any changes will be posted here with a revised “effective date.”</p>
        </section>

        <section className="policy-section">
          <h2>9. Contact us</h2>
          <p>If you have questions about this privacy policy or our data practices, please contact us at:</p>
          <p><a href="mailto:privacy@mangrovestudios.org">privacy@mangrovestudios.org</a></p>
        </section>
      </div>
    </main>
  );
}
