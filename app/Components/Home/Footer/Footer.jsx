import React from "react";
import styles from "./Footer.module.css";
import Link from "next/link";
import Image from "next/image";
import Logo from "./1.png";

const Footer = () => {
  return (
    <>
      <div className={styles.Main}>
        <div className={styles.MainConatiner}>
          <div className={styles.Top}>
            <div className={styles.One}>
              <Link href="/">
                <Image
                  src={Logo}
                  alt="White Mantis Logo"
                  className={styles.LogoImage}
                />
              </Link>
            </div>
            <div className={styles.Two}>
              <div className={styles.TwoTop}>
                <div className={styles.TwoTopTop}>
                  <h3>Explore</h3>
                </div>
                <div className={styles.TwoTopBottom}>
                  <Link href="/AboutUs">
                    {" "}
                    <p>About us</p>
                  </Link>
                  <Link href="/contact">
                    {" "}
                    <p>Contact us</p>
                  </Link>
                </div>
              </div>
              <div className={styles.TwoBottom}>
                <div className={styles.TwoBottomTop}>
                  <h3>Follow Us on</h3>
                </div>
                <Link
                  href="https://www.instagram.com/whitemantis.ae/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.TwoBottomBottom}
                >
                  <p>Instagram</p>
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.351085 7.5766L7.35034 0.505507M7.35034 0.505507V6.86949M7.35034 0.505507H1.05101"
                      stroke="white"
                    />
                  </svg>
                </Link>
              </div>
            </div>
            <div className={styles.Three}>
              <div className={styles.ThreeTop}>
                <div className={styles.ThreeTopOne}>
                  <h3>Contact Us</h3>
                </div>
                <div className={styles.ThreeTopTwo}>
                  <p>Need to speak with us?</p>
                  <p>
                    <a href="tel:+971589535337">05 8953 5337</a>
                    <br />
                    <a href="mailto:hello@whitemantis.ae">
                      hello@whitemantis.ae
                    </a>
                  </p>
                </div>
              </div>
              <div className={styles.line}></div>
              <div className={styles.ThreeBottom}>
                <div className={styles.ThreeBottomOne}>
                  <p>Where can you find us?</p>
                </div>
                <div className={styles.ThreeBottomTwo}>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Warehouse+%232+-+26+26th+St+-+Al+Quoz+Industrial+Area+4+Dubai"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <p>
                      Warehouse #2 - 26 26th St - Al Qouz Ind.fourth, Al Quoz,
                      Dubai
                    </p>
                  </a>
                </div>
              </div>
            </div>
            <div className={styles.Four}>
              <div className={styles.FourTop}>
                <h3>read our terms</h3>
              </div>
              <div className={styles.FourBottom}>
                <Link href="/privacy-policy">
                  <p>Privacy Policy</p>
                </Link>
                {/* <p>Returns & Refunds</p> */}
                <Link href="/terms-and-conditions">
                  <p>Terms & Conditions</p>
                </Link>
                {/* <p>Shipping Policy</p> */}
              </div>
            </div>
          </div>
          <div className={styles.Bottom}></div>
        </div>
      </div>
    </>
  );
};

export default Footer;
