import Link from "next/link";
import styles from "./Navbar.module.scss";

interface NavbarLogoProps {
  text?: string;
  href?: string;
}

export function NavbarLogo({ text = "LearnOS", href = "/" }: NavbarLogoProps) {
  return (
    <Link href={href} className={styles.navLogo}>
      <div className={styles.navLogoMark} aria-hidden="true" />
      <span className={styles.navLogoText}>{text}</span>
    </Link>
  );
}
