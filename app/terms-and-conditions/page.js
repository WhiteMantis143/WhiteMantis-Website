import styles from './terms.module.css'

const TermsAndConditions = () => {
  return (
    <div className={styles.mainPage}>
      <div className={styles.privacy}>
        <h3>Terms & Conditions</h3>

        <p className={styles.mainContent}>
          Welcome to <span className={styles.spantext}>White Mantis Roastery LLC</span> (“White
          Mantis”, “we”, “our”, “us”). These Terms & Conditions govern your use of our website, mobile
          application, and related digital services.
        </p>

        <p>
          Some features described in these Terms, including online ordering, payments, and delivery,
          may be available through our mobile application or will be introduced on the website in
          future updates.
        </p>

        <h4 className={styles.textheadings}>1. Eligibility</h4>
        <p>
          You must use our Services in compliance with applicable laws of the United Arab Emirates.
        </p>

        <h4 className={styles.textheadings}>2. Account Registration</h4>
        <ul className={styles.listcontent}>
          <li>Account creation may be required to access certain features</li>
          <li>You are responsible for maintaining accurate account information</li>
          <li>You are responsible for safeguarding your login credentials</li>
        </ul>

        <h4 className={styles.textheadings}>3. Products & Services</h4>
        <p>
          We offer roasted coffee, beverages, merchandise, equipment, and café-related services.
          Availability, pricing, and descriptions may change at any time.
        </p>

        <h4 className={styles.textheadings}>4. Pricing & Payments</h4>
        <p>
          All prices are listed in AED. Payments, where applicable, must be completed using approved
          payment methods.
        </p>

        <h4 className={styles.textheadings}>5. Shipping & Delivery</h4>
        <p>
          Delivery timelines are estimates only. Risk of loss transfers to the customer upon
          dispatch.
        </p>

        <h4 className={styles.textheadings}>6. Returns & Refunds</h4>
        <p>
          Roasted coffee products are non-returnable. Equipment returns are accepted only if unused
          and approved after inspection.
        </p>

        <h4 className={styles.textheadings}>7. Intellectual Property</h4>
        <p>
          All content, logos, designs, and trademarks are the property of White Mantis Roastery LLC
          and may not be used without written permission.
        </p>

        <h4 className={styles.textheadings}>8. Limitation of Liability</h4>
        <p>
          To the fullest extent permitted by law, White Mantis shall not be liable for indirect,
          incidental, or consequential damages.
        </p>

        <h4 className={styles.textheadings}>9. Governing Law</h4>
        <p>
          These Terms are governed by the laws of the United Arab Emirates, applicable in the Emirate
          of Dubai.
        </p>

        <h4 className={styles.textheadings}>10. Changes to Terms</h4>
        <p>
          We may update these Terms at any time. Continued use of the Services signifies acceptance
          of updated terms.
        </p>

        <h4 className={styles.textheadings}>11. Contact Information</h4>
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

export default TermsAndConditions
