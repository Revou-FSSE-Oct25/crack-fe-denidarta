import { ReactNode } from "react";
import styles from "./Navbar.module.scss";
import { NavbarLogo } from "./NavbarLogo";
import { NavbarLinks } from "./NavbarLinks";
import { NavbarActions } from "./NavbarActions";

interface NavbarProps {
	children: ReactNode;
}

function NavbarRoot({ children }: NavbarProps) {
	return (
		<nav className={styles.nav}>
			<div className={styles.navInner}>{children}</div>
		</nav>
	);
}

export const Navbar = Object.assign(NavbarRoot, {
	Logo: NavbarLogo,
	Links: NavbarLinks,
	Actions: NavbarActions,
});
