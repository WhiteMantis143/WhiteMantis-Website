import React from "react";
import styles from "./Subscribe.module.css";
import Image from "next/image";
import one from "./1.png";
import two from "./2.png";

const Subscribe = () => {
  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainContainer}>
          <div className={styles.Left}>
            <Image src={one} alt="image" />
          </div>
          <div className={styles.Right}>
            <div className={styles.RightTop}>
              <h3>Subscribe and save </h3>
              <p>
                Your coffee, always on time. Set your preferred delivery
                schedule and receive freshly roasted coffee at regular
                intervals. Enjoy added savings, priority roasting, and the
                confidence of consistent quality in every delivery, so your
                coffee routine stays effortless and uninterrupted.
              </p>
            </div>
            <div className={styles.RightBottom}>
              <Image src={two} alt="two" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Subscribe;
