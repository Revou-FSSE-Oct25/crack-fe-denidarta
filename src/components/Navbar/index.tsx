"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Close } from "@carbon/icons-react";
import styles from "./Navbar.module.scss";

interface NavLink {
	label: string;
	href: string;
}

interface NavbarProps {
	links: NavLink[];
	actions?: React.ReactNode;
}

export function Navbar({ links, actions }: NavbarProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<nav className={styles.nav}>
				<div className={styles.navInner}>
					<Link href="/" className={styles.navLogo}>
						<Image
							src="/logo_dark.svg"
							alt="LearnOS"
							width={100}
							height={40}
							priority
						/>
					</Link>

					<div className={styles.navLinks}>
						{links.map((link) => (
							<Link key={link.href} href={link.href} className={styles.navLink}>
								{link.label}
							</Link>
						))}
					</div>

					<div className={styles.navActions}>{actions}</div>

					<button
						className={styles.hamburger}
						aria-label="Open menu"
						onClick={() => setOpen(true)}
					>
						<Menu size={20} />
					</button>
				</div>
			</nav>

			{open && (
				<div
					className={styles.overlay}
					aria-hidden="true"
					onClick={() => setOpen(false)}
				/>
			)}

			<div
				className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
				aria-modal="true"
				aria-label="Navigation menu"
			>
				<div className={styles.drawerHeader}>
					<Link
						href="/"
						className={styles.navLogo}
						onClick={() => setOpen(false)}
					>
						<Image
							src="/logo_dark.svg"
							alt="LearnOS"
							width={100}
							height={40}
							priority
						/>
					</Link>
					<button
						className={styles.drawerClose}
						aria-label="Close menu"
						onClick={() => setOpen(false)}
					>
						<Close size={20} />
					</button>
				</div>

				<div className={styles.drawerLinks}>
					{links.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className={styles.drawerLink}
							onClick={() => setOpen(false)}
						>
							{link.label}
						</Link>
					))}
				</div>

				<div className={styles.drawerActions}>{actions}</div>
			</div>
		</>
	);
}
