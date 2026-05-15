"use client";

import { useState } from "react";
import { Button, Tag, Dropdown, ExpandableSearch, OverflowMenuItem, OverflowMenu } from "@carbon/react";
import { Add } from "@carbon/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchStudents } from "@/services/users.service";
import { studentTableHeaders, userStatusFilters } from "@/constants/students";
import AddNewUserModal from "@/components/Modals/AddNewUserModal";
import { statusTagType } from "@/utils/tag-type";
import { DATE_LOCALE } from "@/constants";
import PageLayout, { PageHeader } from "@/components/PageLayout";
import ResourceTableSection from "@/components/ResourceTableSection";


export default function StudentsPage() {
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [search, setSearch] = useState("");
	const [inputValue, setInputValue] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState(userStatusFilters[0]);

	const { data, isLoading, error } = useQuery({
		queryKey: ["students", page, pageSize, search, selectedStatus.id],
		queryFn: () => fetchStudents(page, pageSize, search, selectedStatus.id),
	});

	const users = data?.data ?? [];
	const total = data?.meta.total ?? 0;

	const rows = users.map((user) => ({
		id: String(user.id),
		fullName: user.profile?.fullName ?? user.username,
		email: user.email,
		status: user.status,
		createdAt: new Date(user.createdAt).toLocaleDateString(DATE_LOCALE),
	}));

	return (
		<PageLayout>
			<PageHeader
				title="Students"
				subtitle={isLoading ? "..." : `${total} students total`}
			/>
			<ResourceTableSection
				loading={isLoading}
				error={error ? error.message : null}
				headers={studentTableHeaders}
				rows={rows}
				pagination={{
					page,
					pageSize,
					total,
					onChange: ({ page, pageSize }) => {
						setPage(page);
						setPageSize(pageSize);
					},
				}}
				toolbar={
					<div
						style={{
							display: "flex",
							width: "100%",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Dropdown
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
						<div
							style={{
								display: "flex",
								justifyContent: "flex-end",
								gap: "0.5rem",
							}}
						>
							<ExpandableSearch
								closeButtonLabelText="Clear search input"
								id="search-default-1"
								labelText="Search"
								placeholder="Search students by name or email"
								size="md"
								type="search"
								value={inputValue}
								onChange={(e) => setInputValue(e.currentTarget.value)}
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
					</div>
				}
				renderCell={(cell) => {
					if (cell.info.header === "status") {
						return (
							<Tag type={statusTagType(String(cell.value))} size="sm">
								{String(cell.value)}
							</Tag>
						);
					}
					if (cell.info.header === "action") {
						return (
							<OverflowMenu size="lg">
								<OverflowMenuItem itemText="Invitation Link" />
								<OverflowMenuItem itemText="View" />
							</OverflowMenu>
						);
					}
					return null;
				}}
			/>
			<AddNewUserModal
				open={modalOpen}
				onRequestClose={() => setModalOpen(false)}
				onSuccess={() => {
					setModalOpen(false);
					void queryClient.invalidateQueries({ queryKey: ["students"] });
				}}
			/>
		</PageLayout>
	);
}
