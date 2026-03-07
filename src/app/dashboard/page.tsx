'use client';
import {
  Breadcrumb, BreadcrumbItem, Button, Column, DataTable, Grid,
  OverflowMenu, OverflowMenuItem, Search, Table, TableBody, TableCell,
  TableContainer, TableHead, TableHeader, TableRow, Tag, Tile,
} from '@carbon/react';
import { Add, Download, Filter } from '@carbon/icons-react';
import React from 'react';
import { kpis, headerData, rowData, statusTagType } from './data';
import styles from './page.module.scss';

export default function DashboardPage() {
  return (
    <div className={styles.wrapper}>
      <Grid fullWidth>
        <Column sm={4} md={8} lg={16}>
          <Breadcrumb noTrailingSlash>
            <BreadcrumbItem href="#">Home</BreadcrumbItem>
            <BreadcrumbItem href="#">Operations</BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>Dashboard</BreadcrumbItem>
          </Breadcrumb>
        </Column>

        <Column sm={4} md={8} lg={16}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Operations dashboard</h1>
              <p>Quick overview of activity, revenue, and support.</p>
            </div>
            <div className={styles.pageActions}>
              <Button kind="secondary" size="md" renderIcon={Download}>Export</Button>
              <Button kind="primary" size="md" renderIcon={Add}>New item</Button>
            </div>
          </div>
        </Column>

        {kpis.map((kpi) => (
          <Column key={kpi.label} sm={4} md={4} lg={4} className={styles.kpiColumn}>
            <Tile>
              <div className={styles.kpiTile}>
                <div>
                  <div className={styles.kpiLabel}>{kpi.label}</div>
                  <div className={styles.kpiValue}>{kpi.value}</div>
                </div>
                <Tag type={kpi.delta.startsWith('-') ? 'red' : 'green'} size="sm">{kpi.delta}</Tag>
              </div>
            </Tile>
          </Column>
        ))}

        <Column sm={4} md={8} lg={10} className={styles.activityColumn}>
          <Tile>
            <div className={styles.activityHeader}>
              <div>
                <h2>Recent activity</h2>
                <p>Latest tickets and requests.</p>
              </div>
              <div className={styles.activitySearch}>
                <Search size="md" labelText="Search" placeholder="Search" />
                <Button kind="ghost" size="md" hasIconOnly iconDescription="Filter" renderIcon={Filter} />
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <DataTable rows={rowData} headers={headerData} isSortable>
                {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getTableContainerProps }) => (
                  <TableContainer title="" description="" {...getTableContainerProps()}>
                    <Table {...getTableProps()}>
                      <TableHead>
                        <TableRow>
                          {headers.map((header) => (
                            <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                          ))}
                          <TableHeader />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow {...getRowProps({ row })}>
                            {row.cells.map((cell) => {
                              if (cell.info.header === 'status') {
                                return (
                                  <TableCell key={cell.id}>
                                    <Tag type={statusTagType(String(cell.value))} size="sm">{String(cell.value)}</Tag>
                                  </TableCell>
                                );
                              }
                              return <TableCell key={cell.id}>{cell.value}</TableCell>;
                            })}
                            <TableCell>
                              <OverflowMenu size="sm" aria-label="Row actions">
                                <OverflowMenuItem itemText="View" />
                                <OverflowMenuItem itemText="Assign" />
                                <OverflowMenuItem itemText="Close" />
                              </OverflowMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DataTable>
            </div>
          </Tile>
        </Column>

        <Column sm={4} md={8} lg={6} className={styles.glanceColumn}>
          <Tile>
            <h2>At a glance</h2>
            <p>Placeholder panel for charts.</p>
            <div className={styles.chartPlaceholder}>Chart goes here</div>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
}
