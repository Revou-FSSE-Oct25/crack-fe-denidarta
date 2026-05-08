"use client";

import React from "react";
import { Button } from "@carbon/react";
import {
	ArrowRight,
	DocumentBlank,
	Search,
	Warning,
} from "@carbon/icons-react";
import styles from "./EmptyState.module.scss";

export type EmptyStateType = "no-data" | "user-action" | "error";
export type EmptyStateSize = "sm" | "lg";

export interface EmptyStateAction {
	label: string;
	onClick?: () => void;
	href?: string;
}

export interface EmptyStateProps {
	/** @default "no-data" */
	type?: EmptyStateType;
	/** Prefer positive framing, e.g. "Start by adding data" vs "No data found". */
	title: string;
	description?: string;
	/**
	 * `undefined` = default icon per type, `null` = no illustration, node = custom.
	 * Decorative illustrations must have `aria-hidden="true"` or empty `alt`.
	 */
	illustration?: React.ReactNode | null;
	primaryAction?: EmptyStateAction & {
		/** Use `"tertiary"` when multiple empty states appear simultaneously. @default "primary" */
		kind?: "primary" | "tertiary";
	};
	/** Secondary ghost link, typically to documentation. */
	secondaryAction?: EmptyStateAction;
	/** `sm` for tiles/panels, `lg` for tables/pages. @default "lg" */
	size?: EmptyStateSize;
	className?: string;
}

const defaultIcons: Record<EmptyStateType, React.ElementType> = {
	"no-data": DocumentBlank,
	"user-action": Search,
	error: Warning,
};

/**
 * Follows the Carbon Design System empty-states pattern.
 * https://carbondesignsystem.com/patterns/empty-states-pattern/
 */
export default function EmptyState({
	type = "no-data",
	title,
	description,
	illustration,
	primaryAction,
	secondaryAction,
	size = "lg",
	className,
}: EmptyStateProps) {
	const isSmall = size === "sm";

	let illustrationNode: React.ReactNode = null;
	if (illustration === null) {
		illustrationNode = null;
	} else if (illustration !== undefined) {
		illustrationNode = illustration;
	} else {
		const IconComponent = defaultIcons[type];
		illustrationNode = (
			<IconComponent size={isSmall ? 32 : 80} aria-hidden="true" />
		);
	}

	const rootClasses = [styles.root, styles[size], className]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={rootClasses}>
			{illustrationNode !== null && (
				<div className={styles.illustration}>{illustrationNode}</div>
			)}

			<p className={styles.title}>{title}</p>

			{description && <p className={styles.description}>{description}</p>}

			{(primaryAction || secondaryAction) && (
				<div className={styles.actions}>
					{primaryAction && (
						<Button
							kind={primaryAction.kind ?? "primary"}
							size={isSmall ? "sm" : "md"}
							onClick={primaryAction.onClick}
							{...(primaryAction.href ? { href: primaryAction.href } : {})}
						>
							{primaryAction.label}
						</Button>
					)}

					{secondaryAction && (
						<Button
							kind="ghost"
							size={isSmall ? "sm" : "md"}
							renderIcon={ArrowRight}
							onClick={secondaryAction.onClick}
							{...(secondaryAction.href ? { href: secondaryAction.href } : {})}
						>
							{secondaryAction.label}
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
