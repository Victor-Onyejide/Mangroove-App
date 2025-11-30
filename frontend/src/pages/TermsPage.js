import React from 'react';
import '../assets/css/terms.css';

export default function TermsPage() {
  return (
    <main className="policy-page">
      <div className="policy-container">
        <p className="policy-updated">Last updated on September 15, 2025</p>
        <h1 className="policy-title">Terms of service</h1>

        <section className="policy-section">
          <p className="policy-lead">These terms of service ("terms") govern your use of Mangrove Studios' website, applications, and related services (the "services"). By creating an account, joining a session, or otherwise using the services, you agree to these terms.</p>
        </section>

        <section className="policy-section">
          <h2>1. Eligibility</h2>
          <p>You must be at least 13 years old to use the services.</p>
          <p>If you are using the services on behalf of an organization, you confirm that you have authority to bind that organization to these terms.</p>
        </section>

        <section className="policy-section">
          <h2>2. Account responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your account login information.</p>
          <p>You are responsible for all activity that occurs under your account.</p>
          <p>You agree to provide accurate, current, and complete information when creating your account and using the services.</p>
        </section>

        <section className="policy-section">
          <h2>3. Use of services</h2>
          <p>You may use the services only for lawful purposes and in accordance with these terms. You agree not to:</p>
          <ul>
            <li>Misuse or interfere with the operation of the services.</li>
            <li>Upload, share, or store any unlawful or infringing content.</li>
            <li>Attempt to access accounts or data without authorization.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Sessions and split sheets</h2>
          <p>Information you provide in sessions (such as song titles, contributors, and ownership percentages) will be shared with invited collaborators.</p>
          <p>It is your responsibility to ensure that the ownership information you submit is accurate.</p>
          <p>Mangrove Studios is not a party to, and does not mediate, ownership disputes between collaborators.</p>
        </section>

        <section className="policy-section">
          <h2>5. Membership plans and payments</h2>
          <p>Some services are available for free, while others require a paid membership or session pack.</p>
          <p>All payments are processed securely through third-party providers.</p>
          <p>Subscription plans renew automatically unless cancelled before the billing date.</p>
          <p>You may cancel your subscription at any time through your account settings; cancellations take effect at the end of the current billing cycle.</p>
        </section>

        <section className="policy-section">
          <h2>6. Intellectual property</h2>
          <p>Mangrove Studios retains ownership of the platform, design, and technology behind the services.</p>
          <p>You retain ownership of your content, including session data, split sheets, and receipts.</p>
          <p>By using the services, you grant Mangrove a limited license to store, process, and display your content for the purpose of operating the services.</p>
        </section>

        <section className="policy-section">
          <h2>7. Termination</h2>
          <p>You may delete your account at any time through your profile settings.</p>
          <p>Mangrove Studios may suspend or terminate accounts that violate these terms or harm the integrity of the platform.</p>
          <p>Upon termination, you will lose access to your account and stored data, except as required by law.</p>
        </section>

        <section className="policy-section">
          <h2>8. Disclaimers</h2>
          <p>The services are provided "as is" and "as available."</p>
          <p>Mangrove Studios makes no warranties, express or implied, regarding the reliability, accuracy, or availability of the services.</p>
          <p>Mangrove is not liable for losses or disputes resulting from collaborator disagreements or inaccurate ownership data.</p>
        </section>

        <section className="policy-section">
          <h2>9. Limitation of liability</h2>
          <ul>
            <li>Mangrove Studios will not be liable for indirect, incidental, or consequential damages.</li>
            <li>Our total liability for any claim related to the services will not exceed the amount you paid for the services in the past 12 months.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>10. Changes to these terms</h2>
          <p>We may update these terms from time to time. If we make material changes, we will notify you by email or through the services. Continued use after changes means you accept the updated terms.</p>
        </section>

        <section className="policy-section">
          <h2>11. Governing law</h2>
          <p>These terms are governed by the laws of Ontario, Canada, without regard to conflict of law principles. Any disputes will be resolved in the courts located in Toronto, Ontario.</p>
        </section>

        <section className="policy-section">
          <h2>12. Contact us</h2>
          <p>If you have questions about these terms, please contact us at:</p>
          <p><a href="mailto:support@mangrovestudios.org">support@mangrovestudios.org</a></p>
        </section>
      </div>
    </main>
  );
}
