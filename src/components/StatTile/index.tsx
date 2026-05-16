import styles from "./StatTile.module.scss";

interface StatTileProps {
	label: string;
	value: string | number;
	subtitle?: string;
}

export default function StatTile({ label, value, subtitle }: StatTileProps) {
	return (
		<div className={styles.tile}>
			<p className={styles.label}>{label}</p>
			<p className={styles.value}>{value}</p>
			{subtitle && <p className={styles.subtitle}>{subtitle}</p>}
		</div>
	);
}
