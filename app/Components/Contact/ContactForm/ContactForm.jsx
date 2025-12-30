"use client";
import React, { useState } from "react";
import styles from "./ContactForm.module.css";
import testStyles from "../TestFormUi/TestFormUi.module.css";
import Image from "next/image";
import one from "./1.png";

const ContactForm = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [enquiryType, setEnquiryType] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseError, setResponseError] = useState(false);

const ENDPOINT = "/api/contact";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMessage("");
    setResponseError(false);


    if (!fullName.trim() || !email.trim()) {
      setResponseError(true);
      setResponseMessage("Please enter your name and email.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        enquiry_type: enquiryType.trim(),
        message: message.trim(),
      };

      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || (json && json.success === false)) {
        setResponseError(true);
        setResponseMessage((json && json.message) || "Submission failed. Please try again.");
      } else {
        setResponseError(false);
        setResponseMessage("Thank you! Your message has been submitted.");
        setFullName("");
        setEmail("");
        setPhone("");
        setEnquiryType("");
        setMessage("");
      }
    } catch (err) {
      setResponseError(true);
      setResponseMessage("Network error. Please try again.");
    } finally {
        
          try {
            window.setTimeout(() => {
              setResponseMessage("");
            }, 3000);
          } catch (e) {}
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainContainer}>
          <div className={styles.LeftConatiner}>
            <Image src={one} alt="Contact Form Image" className={styles.image} />
          </div>

          <div className={styles.RightContainer}>
            <form onSubmit={handleSubmit} className={testStyles.MainConatiner}>
              <div className={testStyles.Top}>
                <h3>Send us a message
                </h3>

                <svg
                  width="34"
                  height="30"
                  viewBox="0 0 34 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M28.2091 4.36292C26.6876 2.97477 24.8755 1.8741 22.8784 1.12507C20.8813 0.376033 18.7393 -0.00639159 16.577 8.08027e-05C7.51689 8.08027e-05 0.132749 6.67178 0.132749 14.8577C0.132749 17.4814 0.896053 20.0302 2.3231 22.2791L0 29.9852L8.71163 27.9163C11.1177 29.1007 13.8224 29.7304 16.577 29.7304C25.6371 29.7304 33.0212 23.0587 33.0212 14.8727C33.0212 10.8997 31.3121 7.16653 28.2091 4.36292ZM16.577 27.2116C14.1211 27.2116 11.7151 26.6119 9.60768 25.4875L9.10987 25.2176L3.93268 26.447L5.30994 21.8893L4.97807 21.4245C3.61333 19.456 2.88882 17.1805 2.88728 14.8577C2.88728 8.0511 9.0269 2.50384 16.5604 2.50384C20.211 2.50384 23.6458 3.7932 26.2178 6.13205C27.4916 7.27728 28.501 8.63962 29.1875 10.1401C29.874 11.6405 30.2239 13.2492 30.2169 14.8727C30.2501 21.6794 24.1105 27.2116 16.577 27.2116ZM24.0773 17.9762C23.6624 17.7963 21.638 16.8967 21.273 16.7618C20.8913 16.6418 20.6258 16.5819 20.3437 16.9417C20.0616 17.3165 19.2817 18.1561 19.0494 18.396C18.8171 18.6509 18.5682 18.6808 18.1534 18.4859C17.7385 18.306 16.411 17.9012 14.8512 16.6418C13.6233 15.6523 12.8102 14.4379 12.5613 14.0631C12.329 13.6883 12.5281 13.4934 12.7439 13.2985C12.9264 13.1336 13.1587 12.8637 13.3578 12.6538C13.5569 12.4439 13.6399 12.279 13.7727 12.0391C13.9054 11.7843 13.839 11.5744 13.7395 11.3944C13.6399 11.2145 12.8102 9.38544 12.4784 8.63581C12.1465 7.91616 11.798 8.00612 11.5491 7.99113H10.7526C10.4705 7.99113 10.0391 8.08108 9.65746 8.4559C9.2924 8.83071 8.23041 9.73027 8.23041 11.5594C8.23041 13.3885 9.70724 15.1576 9.90636 15.3975C10.1055 15.6523 12.8102 19.4005 16.9254 21.0047C17.9045 21.3945 18.6678 21.6194 19.2651 21.7843C20.2442 22.0692 21.1402 22.0242 21.8537 21.9342C22.6502 21.8293 24.293 21.0347 24.6249 20.1651C24.9733 19.2955 24.9733 18.5609 24.8572 18.396C24.741 18.2311 24.4921 18.1561 24.0773 17.9762Z"
                    fill="#6E736A"
                  />
                </svg>
              </div>

              <div className={testStyles.formBox}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />

                <div className={testStyles.row}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className={testStyles.selectWrap}>
                  <select
                    value={enquiryType}
                    onChange={(e) => setEnquiryType(e.target.value)}
                  >
                    <option value="">Please select enquiry type</option>
                    <option value="General">General</option>
                    <option value="Support">Support</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Careers">Careers</option>
                  </select>
                </div>

                <textarea
                  placeholder="Write your message here."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className={testStyles.Bottom}>
                <button className={testStyles.btn} type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>

              {responseMessage && (
                <div style={{ color: responseError ? 'crimson' : '#197B5B', marginTop: 12 }}>
                  {responseMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactForm;
