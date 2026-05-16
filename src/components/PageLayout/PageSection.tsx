import styles from "./PageLayout.module.scss";

interface PageSectionProps {
	children: React.ReactNode;
}

export default function PageSection({ children }: PageSectionProps) {
	return <div className={styles.section}>{children}</div>;
}
