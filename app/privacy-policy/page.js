import styles from './PrivacyPolicy.module.css'

const PrivacyPolicy = () => {
  return (
    <div className={styles.mainPage}>
      <div className={styles.privacy}>
        <h3>Privacy Policy for White Mantis Roastery LLC</h3>

        <p className={styles.mainContent}>
          <p className={styles.textheadings}>1. Introduction</p>
          <span className={styles.topContent}>
            White Mantis Roastery LLC (“White Mantis”, “we”, “us”, or “our”) is committed to
            safeguarding the privacy of individuals whose personal data we process. This Privacy
            Policy explains how we collect, use, disclose, and protect your personal information
            when you interact with our website, mobile application, and digital services.
          </span>
        </p>

        <p>
          Data collection may occur through our mobile application and in-store digital services.
          Certain website features may be informational only at this stage and may be expanded in
          future updates.
        </p>

        <p className={styles.textheadings}>2. Scope</p>
        <p>This policy applies to personal data collected through:</p>
        <ul className={styles.listcontent}>
          <li>Visitors to our website</li>
          <li>Users of our mobile application</li>
          <li>Customers placing in-store or app-based orders</li>
          <li>Loyalty program participants</li>
          <li>Customer support interactions</li>
        </ul>

        <p className={styles.textheadings}>3. Data Controller</p>
        <p>
          White Mantis Roastery LLC, Dubai, United Arab Emirates, is the data controller responsible
          for your personal data.
        </p>

        <p className={styles.textheadings}>4. Information We Collect</p>
        <p>We may collect the following categories of personal data:</p>
        <ul className={styles.listcontent}>
          <li>
            <span className={styles.bulletpoint}>Contact Information:</span> Name, email address,
            phone number, delivery address
          </li>
          <li>
            <span className={styles.bulletpoint}>Order Information:</span> Order details, preferences,
            and transaction history
          </li>
          <li>
            <span className={styles.bulletpoint}>Technical Information:</span> Device type, IP
            address, app usage data, browser information
          </li>
          <li>
            <span className={styles.bulletpoint}>Payment Information:</span> Processed securely via
            third-party payment gateways (we do not store card details)
          </li>
        </ul>

        <p className={styles.textheadings}>5. How We Collect Data</p>
        <ul className={styles.listcontent}>
          <li>
            <span className={styles.bulletpoint}>Direct Interactions:</span> When you place orders,
            create an account, or contact us
          </li>
          <li>
            <span className={styles.bulletpoint}>Automated Technologies:</span> Through cookies, app
            analytics, and similar tools
          </li>
          <li>
            <span className={styles.bulletpoint}>Third Parties:</span> Payment processors, delivery
            partners, and service providers
          </li>
        </ul>

        <p className={styles.textheadings}>6. Use of Personal Data</p>
        <ul className={styles.listcontent}>
          <li>Processing and fulfilling orders</li>
          <li>Customer support and service communication</li>
          <li>Improving app and service performance</li>
          <li>Sending notifications and updates (with consent)</li>
          <li>Legal and regulatory compliance</li>
        </ul>

        <p className={styles.textheadings}>7. Legal Basis for Processing</p>
        <ul className={styles.listcontent}>
          <li>Consent provided by you</li>
          <li>Contractual necessity for service delivery</li>
          <li>Legal obligations under UAE law</li>
          <li>Legitimate business interests</li>
        </ul>

        <p className={styles.textheadings}>8. Data Sharing and Disclosure</p>
        <p>We may share personal data only with:</p>
        <ul className={styles.listcontent}>
          <li>Delivery and logistics partners</li>
          <li>Payment processing providers</li>
          <li>IT and analytics service providers</li>
          <li>Government authorities when legally required</li>
        </ul>

        <p className={styles.textheadings}>9. International Data Transfers</p>
        <p>
          Your data may be processed outside your country of residence. We ensure appropriate
          safeguards are in place to protect your data.
        </p>

        <p className={styles.textheadings}>10. Data Security</p>
        <p>
          We use industry-standard technical and organizational security measures to protect your
          personal information from unauthorized access or disclosure.
        </p>

        <p className={styles.textheadings}>11. Data Retention</p>
        <p>
          Personal data is retained only for as long as necessary to fulfill business, legal, or
          regulatory requirements.
        </p>

        <p className={styles.textheadings}>12. Your Rights</p>
        <ul className={styles.listcontent}>
          <li>Request access to your personal data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data (subject to legal requirements)</li>
          <li>Withdraw consent where applicable</li>
        </ul>

        <p className={styles.textheadings}>13. Cookies and Tracking Technologies</p>
        <p>
          We use cookies and similar technologies to enhance user experience and analyze performance.
          You can manage cookie settings through your browser or device.
        </p>

        <p className={styles.textheadings}>14. Children’s Privacy</p>
        <p>
          Our services are not intended for individuals under the age of 18, and we do not knowingly
          collect data from minors.
        </p>

        <p className={styles.textheadings}>15. Changes to This Privacy Policy</p>
        <p>
          We may update this Privacy Policy from time to time. Continued use of our services indicates
          acceptance of the updated policy.
        </p>

        <p className={styles.textheadings}>16. Contact Us</p>
        <ul className={styles.listcontent}>
          <li>White Mantis Roastery LLC</li>
          <li>Dubai, United Arab Emirates</li>
          <li>Email: hello@whitemantis.ae</li>
          <li>Phone: +971 58 953 5337</li>
        </ul>
      </div>
    </div>
  )
}

export default PrivacyPolicy
