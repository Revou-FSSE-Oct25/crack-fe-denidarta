export const kpis = [
  { label: 'Active users', value: '1,284', delta: '+4.1%' },
  { label: 'Conversion', value: '3.6%', delta: '+0.3%' },
  { label: 'Revenue', value: '$42.8k', delta: '+1.8%' },
  { label: 'Tickets', value: '19', delta: '-2' },
];

export const headerData = [
  { key: 'id', header: 'ID' },
  { key: 'title', header: 'Title' },
  { key: 'status', header: 'Status' },
  { key: 'owner', header: 'Owner' },
  { key: 'updated', header: 'Updated' },
];

export const rowData = [
  { id: 'A-1024', title: 'Billing address update', status: 'Open', owner: 'S. Lee', updated: '2h ago' },
  { id: 'A-1023', title: 'SSO configuration', status: 'In progress', owner: 'M. Chen', updated: '6h ago' },
  { id: 'A-1019', title: 'Usage report export', status: 'Blocked', owner: 'A. Patel', updated: '1d ago' },
  { id: 'A-1012', title: 'New workspace request', status: 'Done', owner: 'J. Kim', updated: '3d ago' },
];

export function statusTagType(status: string) {
  switch (status) {
    case 'Done': return 'green';
    case 'Open': return 'blue';
    case 'In progress': return 'teal';
    case 'Blocked': return 'red';
    default: return 'gray';
  }
}
