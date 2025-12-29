"use client";
import React, { useEffect, useState } from "react";
import styles from "./Navbar.module.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./1.png";

const Navbar = () => {
  const pathname = usePathname();

  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentPosition = window.pageYOffset;
      setIsScrollingDown(
        currentPosition > scrollPosition && currentPosition > 50
      );
      setScrollPosition(currentPosition);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollPosition]);

  return (
    <div className={`${styles.Main} ${isScrollingDown ? styles.hide : ""}`}>
      <div className={styles.MainCoantiner}>
        <div className={styles.LeftContainer}></div>

        <div className={styles.MiddleContainer}>
          <Link href="/">
          <Image
            src={Logo}
            alt="White Mantis Logo"
            className={styles.LogoImage}
          />
          </Link>
        </div>

        <div className={styles.RightContainer}>
          <Link
            href="/AboutUs"
            className={pathname === "/AboutUs" ? styles.active : ""}
          >
            <p>About Us</p>
          </Link>

          <Link
            href="/contact"
            className={pathname === "/contact" ? styles.active : ""}
          >
            <p>Contact</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
