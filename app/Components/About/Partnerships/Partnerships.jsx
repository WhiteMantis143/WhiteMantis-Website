import React from 'react'
import styles from './Partnerships.module.css'
import Image from 'next/image'
import partner1 from './1.png'
import partner2 from './1.png'
import partner3 from './1.png'
import partner4 from './1.png'
import partner5 from './1.png'
import partner6 from './1.png'

const Partnerships = () => {
  return (
    <>
      <div className={styles.Main}>
        <div className={styles.MainConatiner}>
          <div className={styles.Top}>
            {/* <h3>Clientele & Partnerships</h3> */}
          </div>

          <div className={styles.Bottom}>
            <div className={styles.Marquee}>
              <div className={styles.Track}>
                <Image src={partner1} alt="Partner 1" />
                <Image src={partner2} alt="Partner 2" />
                <Image src={partner3} alt="Partner 3" />
                <Image src={partner4} alt="Partner 4" />
                <Image src={partner5} alt="Partner 5" />
                <Image src={partner6} alt="Partner 6" />

                <Image src={partner1} alt="Partner 1" />
                <Image src={partner2} alt="Partner 2" />
                <Image src={partner3} alt="Partner 3" />
                <Image src={partner4} alt="Partner 4" />
                <Image src={partner5} alt="Partner 5" />
                <Image src={partner6} alt="Partner 6" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default Partnerships
