"use client";

import { useEffect, useState } from "react";
import {
	Button,
	DataTable,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	Tag,
	DataTableSkeleton,
	InlineNotification,
	Pagination,
	Search,
	Heading,
	Dropdown,
} from "@carbon/react";
import { Add } from "@carbon/icons-react";
import { apiFetch } from "@/lib/api-client";
import { User } from "@/types/index.type";
import { studentTableHeaders, userStatusFilters } from "@/constants/students";
import AddNewUserModal from "@/components/Modals/AddNewUserModal";
import { statusTagType } from "@/utils/tag-type";
import styles from "./students.module.scss";
import { DATE_LOCALE } from "@/constants";

export default function StudentsPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [search, setSearch] = useState("");
	const [inputValue, setInputValue] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState(userStatusFilters[0]);

	useEffect(() => {
		setLoading(true);
		let mounted = true;
		const controller = new AbortController();

		const params = new URLSearchParams({
			role: "student",
			page: String(page),
			limit: String(pageSize),
			...(search && { search }),
			...(selectedStatus.id !== "all" && { status: selectedStatus.id }),
		});
		(async () => {
			try {
				const res = await apiFetch(`/users?${params.toString()}`, {
					signal: controller.signal,
				});
				if (!res.ok)
					throw new Error(`Failed to fetch students (${res.status})`);
				const { data } = (await res.json()) as {
					data: { items: User[]; meta: { total: number } };
				};
				if (!mounted) return;
				setUsers(data.items ?? []);
				setTotal(data.meta?.total ?? 0);
			} catch (err) {
				if (!mounted || (err as Error).name === "AbortError") return;
				setError((err as Error).message);
			} finally {
				if (mounted) setLoading(false);
			}
		})();

		return () => {
			mounted = false;
			controller.abort();
		};
	}, [page, pageSize, search, selectedStatus.id]);

	const rows = users.map((user) => ({
		id: String(user.id),
		fullName: user.profile?.fullName ?? user.username,
		email: user.email,
		status: user.status,
		createdAt: new Date(user.createdAt).toLocaleDateString(DATE_LOCALE),
	}));

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.headerContent}>
					<Heading>Students</Heading>
					<p className={styles.subtitle}>
						{loading ? "..." : `${total} students total`}
					</p>
				</div>
			</div>

			{error && (
				<InlineNotification
					kind="error"
					title="Error"
					subtitle={error}
					lowContrast
					className={styles.notification}
				/>
			)}
			<div className={styles.searchBar}>
				<Dropdown
					className={styles.filterStatus}
					type="inline"
					titleText="Status"
					id="filter-student"
					items={userStatusFilters}
					label="Select a status"
					selectedItem={selectedStatus}
					itemToString={(item) => (item ? item.text : "")}
					onChange={({ selectedItem }) => {
						if (selectedItem) {
							setSelectedStatus(selectedItem);
							setPage(1);
						}
					}}
				/>
				<Search
					className={styles.searchBox}
					closeButtonLabelText="Clear search input"
					id="search-default-1"
					labelText="Search"
					placeholder="Search students by name or email"
					size="md"
					type="search"
					value={inputValue}
					onChange={(e) => {
						setInputValue(e.currentTarget.value);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							setSearch(inputValue);
							setPage(1);
						}
					}}
					onClear={() => {
						setInputValue("");
						setSearch("");
						setPage(1);
					}}
				/>
				<Button
					kind="primary"
					size="md"
					renderIcon={Add}
					onClick={() => setModalOpen(true)}
				>
					Add Student
				</Button>
			</div>
			{loading ? (
				<DataTableSkeleton headers={studentTableHeaders} rowCount={10} />
			) : (
				<DataTable rows={rows} headers={studentTableHeaders} isSortable>
					{({
						rows,
						headers,
						getTableProps,
						getHeaderProps,
						getRowProps,
						getTableContainerProps,
					}) => (
						<TableContainer {...getTableContainerProps()}>
							<Table {...getTableProps()}>
								<TableHead>
									<TableRow>
										{headers.map((header) => (
											<TableHeader
												{...getHeaderProps({ header })}
												key={header.key}
											>
												{header.header}
											</TableHeader>
										))}
									</TableRow>
								</TableHead>
								<TableBody>
									{rows.map((row) => (
										<TableRow {...getRowProps({ row })} key={row.id}>
											{row.cells.map((cell) => {
												if (cell.info.header === "status") {
													return (
														<TableCell key={cell.id}>
															<Tag
																type={statusTagType(String(cell.value))}
																size="sm"
															>
																{String(cell.value)}
															</Tag>
														</TableCell>
													);
												}
												return (
													<TableCell key={cell.id}>{cell.value}</TableCell>
												);
											})}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					)}
				</DataTable>
			)}
			<Pagination
				backwardText="Previous"
				forwardText="Next"
				itemsPerPageText="Items per page:"
				page={page}
				pageNumberText="Page Number"
				pageSize={pageSize}
				pageSizes={[10, 20, 30, 40, 50]}
				size="md"
				totalItems={total}
				onChange={({ page, pageSize }) => {
					setPage(page);
					setPageSize(pageSize);
				}}
			/>

			<AddNewUserModal
				open={modalOpen}
				onRequestClose={() => setModalOpen(false)}
				onRequestSubmit={async (userId, email) => {
					const inviteRes = await apiFetch(`/auth/invite/${userId}`, {
						method: "POST",
					});
					const { data } = (await inviteRes.json()) as {
						data: { inviteToken: string };
					};

					const params = new URLSearchParams({ email });
					return `${window.location.origin}/create-account/${data.inviteToken}?${params}`;
				}}
			/>
		</div>
	);
}
