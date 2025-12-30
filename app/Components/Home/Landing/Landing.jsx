import React from "react";
import styles from "./Landing.module.css";

const Landing = () => {
  return (
    <section className={styles.Main}>
      <div className={styles.MainConatiner}>
        <div className={styles.Top}>
          <div className={styles.Marquee}>
            <div className={styles.Track}>
              <h1>FROM THE FARM – THROUGH US TO EVERYONE •</h1>
              <h1>FROM THE FARM – THROUGH US TO EVERYONE •</h1>
            </div>
          </div>
        </div>

        <div className={styles.VideoConatiner}>
          <div className={styles.VideoInner}>
            <video className={styles.Video} autoPlay muted loop playsInline>
              <source src="/videos/landing home.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;
