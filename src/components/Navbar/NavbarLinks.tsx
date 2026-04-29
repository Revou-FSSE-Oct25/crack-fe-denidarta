import Link from "next/link";
import styles from "./Navbar.module.scss";

interface NavLink {
  label: string;
  href: string;
}

interface NavbarLinksProps {
  links: NavLink[];
}

export function NavbarLinks({ links }: NavbarLinksProps) {
  return (
    <div className={styles.navLinks}>
      {links.map((link, index) => (
        <Link key={`${link.href}-${index}`} href={link.href} className={styles.navLink}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}
