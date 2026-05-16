import styles from "./PageLayout.module.scss";

export { default as PageHeader } from "./PageHeader";
export { default as PageSection } from "./PageSection";

interface PageLayoutProps {
	children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
	return <div className={styles.root}>{children}</div>;
}
