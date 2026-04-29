import Image from "next/image";
import Link from "next/link";
import { Button } from "@carbon/react";
import { Navbar } from "@/components/Navbar";
import {
	Education,
	Analytics,
	Certificate,
	UserMultiple,
	Idea,
	Connect,
} from "@carbon/icons-react";
import styles from "./page.module.scss";

const stats = [
	{ num: "2,400+", label: "Organizations" },
	{ num: "14M+", label: "Learners Served" },
	{ num: "98%", label: "Completion Rate" },
	{ num: "4.9/5", label: "Learner Satisfaction" },
];

const features = [
	{
		icon: <Education size={24} className={styles.featIcon} />,
		title: "Course Builder",
		desc: "Drag-and-drop authoring tools to create rich, interactive courses with video, quizzes, and SCORM support.",
	},
	{
		icon: <Analytics size={24} className={styles.featIcon} />,
		title: "Analytics Engine",
		desc: "Real-time dashboards track learner progress, engagement rates, and skill proficiency across every department.",
	},
	{
		icon: <Certificate size={24} className={styles.featIcon} />,
		title: "Certifications",
		desc: "Issue verifiable credentials and badges upon course completion. Integrate with LinkedIn and external registries.",
	},
	{
		icon: <UserMultiple size={24} className={styles.featIcon} />,
		title: "Team Management",
		desc: "Assign learning paths by role, team, or location. Set deadlines, send reminders, and manage compliance training.",
	},
	{
		icon: <Idea size={24} className={styles.featIcon} />,
		title: "AI Recommendations",
		desc: "Personalized content suggestions based on learner behavior, role requirements, and skill gap analysis.",
	},
	{
		icon: <Connect size={24} className={styles.featIcon} />,
		title: "Integrations",
		desc: "Connect with HRIS, Slack, Salesforce, and 80+ tools. Single sign-on and API-first architecture.",
	},
];

const steps = [
	{
		num: "01",
		title: "Build Your Catalog",
		body: "Upload existing materials or build new courses with our editor. Support for video, PDFs, SCORM packages, and live sessions.",
	},
	{
		num: "02",
		title: "Assign & Automate",
		body: "Create learning paths and auto-enroll employees based on role, department, or onboarding stage. Set due dates and compliance windows.",
	},
	{
		num: "03",
		title: "Measure & Improve",
		body: "Track completion, quiz scores, time-on-task, and skill growth over time. Export reports for compliance audits and executive reviews.",
	},
];

const testimonials = [
	{
		quote:
			'"LearnOS reduced our onboarding time by 40%. Every new hire is fully productive two weeks faster than before."',
		name: "Sarah Chen",
		role: "Head of L&D · Meridian Corp",
	},
	{
		quote:
			'"The compliance tracking alone saved our legal team 20+ hours a month. It just works exactly the way we need."',
		name: "Marcus Williams",
		role: "VP Operations · Nexus Financial",
	},
	{
		quote:
			'"We scaled from 200 to 8,000 learners without touching the infrastructure. The platform just grew with us."',
		name: "Priya Nair",
		role: "CTO · Skybridge Technologies",
	},
];

export default function Home() {
	return (
		<div className={styles.page}>
			{/* ── Navigation ── */}
			<Navbar>
				<Navbar.Logo />
				<Navbar.Links
					links={[
						{ label: "Platform", href: "#features" },
						{ label: "Solutions", href: "#how" },
						{ label: "Pricing", href: "#pricing" },
						{ label: "Docs", href: "#" },
					]}
				/>
				<Navbar.Actions>
					<Link href="/login" className={styles.navLogin}>
						Log in
					</Link>
					<Button kind="primary" size="md" href="/login">
						Get Started
					</Button>
				</Navbar.Actions>
			</Navbar>

			{/* ── Hero ── */}
			<section className={styles.hero}>
				<div className={styles.heroLeft}>
					<div className={styles.heroBadge}>
						<div className={styles.heroBadgeDot} />
						<span className={styles.heroBadgeText}>
							Enterprise Learning Platform
						</span>
					</div>

					<h1 className={styles.heroHeadline}>
						Knowledge That
						<br />
						Scales With
						<br />
						Your Organization
					</h1>

					<p className={styles.heroSubline}>
						Deliver structured, measurable learning experiences at enterprise
						scale. Track progress, certify skills, and close knowledge gaps —
						all in one unified platform.
					</p>

					<div className={styles.heroCTAs}>
						<Button kind="primary" size="lg" href="/login">
							Start Free Trial
						</Button>
						<Button kind="secondary" size="lg">
							Request Demo →
						</Button>
					</div>
				</div>

				<div className={styles.heroRight}>
					<Image
						src="https://images.unsplash.com/photo-1599575208290-43c84d78d922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
						alt="Team collaborating"
						fill
						style={{ objectFit: "cover" }}
						priority
					/>
				</div>
			</section>

			{/* ── Stats Bar ── */}
			<div className={styles.statsBar}>
				{stats.map((s) => (
					<div key={s.label} className={styles.statItem}>
						<span className={styles.statNum}>{s.num}</span>
						<span className={styles.statLabel}>{s.label}</span>
					</div>
				))}
			</div>

			{/* ── Features ── */}
			<section id="features" className={styles.features}>
				<div className={styles.featHeader}>
					<div className={styles.featHeaderLeft}>
						<span className={styles.eyebrow}>Platform Capabilities</span>
						<h2 className={styles.sectionTitle}>
							Everything you need to
							<br />
							build a learning culture
						</h2>
					</div>
					<p className={styles.featDesc}>
						From onboarding to advanced skill development, LearnOS provides the
						infrastructure to design, deploy, and measure learning at any scale.
					</p>
				</div>

				<div className={styles.featGrid}>
					<div className={styles.featRow}>
						{features.slice(0, 3).map((f) => (
							<div key={f.title} className={styles.featCard}>
								{f.icon}
								<h3>{f.title}</h3>
								<p>{f.desc}</p>
							</div>
						))}
					</div>
					<div className={styles.featRow}>
						{features.slice(3).map((f) => (
							<div key={f.title} className={styles.featCard}>
								{f.icon}
								<h3>{f.title}</h3>
								<p>{f.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── How It Works ── */}
			<section id="how" className={styles.howItWorks}>
				<div>
					<span className={styles.eyebrow}>How It Works</span>
					<h2 className={styles.sectionTitle} style={{ marginTop: "1rem" }}>
						From setup to scale
						<br />
						in three steps
					</h2>
				</div>

				<div className={styles.steps}>
					{steps.map((s) => (
						<div key={s.num} className={styles.step}>
							<span className={styles.stepNum}>{s.num}</span>
							<h3 className={styles.stepTitle}>{s.title}</h3>
							<p className={styles.stepBody}>{s.body}</p>
						</div>
					))}
				</div>
			</section>

			{/* ── Social Proof ── */}
			<section className={styles.socialProof}>
				<div>
					<span className={styles.eyebrow}>Trusted by Enterprise Teams</span>
					<h2 className={styles.sectionTitle} style={{ marginTop: "1rem" }}>
						What learning leaders say
					</h2>
				</div>

				<div className={styles.testimonials}>
					{testimonials.map((t) => (
						<div key={t.name} className={styles.testimonialCard}>
							<p className={styles.testimonialQuote}>{t.quote}</p>
							<div className={styles.testimonialDivider} />
							<div className={styles.testimonialAuthor}>
								<span className={styles.authorName}>{t.name}</span>
								<span className={styles.authorRole}>{t.role}</span>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* ── Pricing ── */}
			<section id="pricing" className={styles.pricing}>
				<div>
					<span className={styles.eyebrow}>Pricing</span>
					<h2 className={styles.sectionTitle} style={{ marginTop: "1rem" }}>
						Simple, transparent pricing
					</h2>
				</div>

				<div className={styles.pricingCards}>
					{/* Starter */}
					<div className={styles.pricingCard}>
						<span className={`${styles.planLabel} ${styles.planLabelMuted}`}>
							Starter
						</span>
						<div className={styles.priceRow}>
							<span className={styles.priceNum}>$49</span>
							<span className={styles.pricePer}>/mo</span>
						</div>
						<p className={`${styles.planDesc} ${styles.planDescMuted}`}>
							For teams getting started with structured learning.
						</p>
						<div className={styles.pricingDivider} />
						<div className={styles.planFeatures}>
							{[
								"Up to 50 learners",
								"20 courses included",
								"Basic analytics",
								"Email support",
							].map((f) => (
								<span
									key={f}
									className={`${styles.planFeature} ${styles.planFeatureMuted}`}
								>
									{f}
								</span>
							))}
						</div>
						<Button kind="secondary" size="md">
							Get Started
						</Button>
					</div>

					{/* Professional (featured) */}
					<div
						className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}
					>
						<span className={styles.planLabelHighlight}>Most Popular</span>
						<span className={styles.planName}>Professional</span>
						<div className={styles.priceRow}>
							<span className={`${styles.priceNum} ${styles.priceNumWhite}`}>
								$149
							</span>
							<span className={`${styles.pricePer} ${styles.pricePerBlue}`}>
								/mo
							</span>
						</div>
						<p className={`${styles.planDesc} ${styles.planDescBlue}`}>
							For growing teams with serious learning objectives.
						</p>
						<div
							className={`${styles.pricingDivider} ${styles.pricingDividerBlue}`}
						/>
						<div className={styles.planFeatures}>
							{[
								"Up to 500 learners",
								"Unlimited courses",
								"Advanced analytics",
								"Priority support",
								"Custom branding",
							].map((f) => (
								<span
									key={f}
									className={`${styles.planFeature} ${styles.planFeatureWhite}`}
								>
									{f}
								</span>
							))}
						</div>
						<Button
							kind="tertiary"
							size="md"
							style={{
								background: "#fff",
								color: "#0f62fe",
								borderColor: "#fff",
							}}
						>
							Get Started
						</Button>
					</div>

					{/* Enterprise */}
					<div className={styles.pricingCard}>
						<span className={`${styles.planLabel} ${styles.planLabelMuted}`}>
							Enterprise
						</span>
						<span className={styles.priceNumCustom}>Custom</span>
						<p className={`${styles.planDesc} ${styles.planDescMuted}`}>
							For large organizations requiring full control, compliance, and
							dedicated support.
						</p>
						<div className={styles.pricingDivider} />
						<div className={styles.planFeatures}>
							{[
								"Unlimited learners",
								"SSO & SCIM provisioning",
								"Dedicated CSM",
								"SLA guarantees",
							].map((f) => (
								<span
									key={f}
									className={`${styles.planFeature} ${styles.planFeatureMuted}`}
								>
									{f}
								</span>
							))}
						</div>
						<Button kind="secondary" size="md">
							Contact Sales
						</Button>
					</div>
				</div>
			</section>

			{/* ── Final CTA ── */}
			<section className={styles.finalCta}>
				<div className={styles.ctaLeft}>
					<h2 className={styles.ctaTitle}>
						Ready to transform
						<br />
						how your team learns?
					</h2>
					<p className={styles.ctaSub}>
						Join 2,400+ organizations already using LearnOS. No setup fees.
						Cancel anytime.
					</p>
					<div className={styles.ctaButtons}>
						<Button
							kind="tertiary"
							size="lg"
							style={{
								background: "#fff",
								color: "#0f62fe",
								borderColor: "#fff",
							}}
						>
							Start Free Trial
						</Button>
						<Button
							kind="ghost"
							size="lg"
							style={{ color: "#fff", borderColor: "#fff" }}
						>
							Talk to Sales →
						</Button>
					</div>
				</div>

				<div className={styles.ctaRight}>
					<Image
						src="https://images.unsplash.com/photo-1565688527174-775059ac429c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
						alt="Learning in action"
						fill
						style={{ objectFit: "cover" }}
					/>
				</div>
			</section>

			{/* ── Footer ── */}
			<footer className={styles.footer}>
				<div className={styles.footerTop}>
					<div className={styles.footerBrand}>
						<div className={styles.footerLogoRow}>
							<div className={styles.footerLogoMark} />
							<span className={styles.footerLogoText}>LearnOS</span>
						</div>
						<p className={styles.footerTagline}>
							The enterprise learning platform built for teams that move fast
							and need to stay sharp.
						</p>
					</div>

					<div className={styles.footerLinks}>
						<div className={styles.footerCol}>
							<span className={styles.footerColTitle}>Product</span>
							{["Features", "Integrations", "Pricing", "Changelog"].map((l) => (
								<a key={l} href="#" className={styles.footerColLink}>
									{l}
								</a>
							))}
						</div>
						<div className={styles.footerCol}>
							<span className={styles.footerColTitle}>Company</span>
							{["About", "Blog", "Careers", "Press"].map((l) => (
								<a key={l} href="#" className={styles.footerColLink}>
									{l}
								</a>
							))}
						</div>
						<div className={styles.footerCol}>
							<span className={styles.footerColTitle}>Resources</span>
							{["Documentation", "API Reference", "Community", "Status"].map(
								(l) => (
									<a key={l} href="#" className={styles.footerColLink}>
										{l}
									</a>
								),
							)}
						</div>
					</div>
				</div>

				<div className={styles.footerBottom}>
					<span className={styles.footerCopy}>
						© 2025 LearnOS Inc. All rights reserved.
					</span>
					<div className={styles.footerBottomLinks}>
						{["Privacy Policy", "Terms of Service", "Security"].map((l) => (
							<a key={l} href="#" className={styles.footerBottomLink}>
								{l}
							</a>
						))}
					</div>
				</div>
			</footer>
		</div>
	);
}
