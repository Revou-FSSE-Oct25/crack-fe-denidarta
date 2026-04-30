import { ReactNode } from "react";
import styles from "./Navbar.module.scss";

interface NavbarActionsProps {
	children: ReactNode;
}

export function NavbarActions({ children }: NavbarActionsProps) {
	return <div className={styles.navActions}>{children}</div>;
}
