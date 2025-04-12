// app/dashboard/overview/[cid]/page.tsx

import dynamic from 'next/dynamic';

const DatasetOverview = dynamic(() => import('./DatasetOverview'), {
  ssr: false,
});

export default function Page() {
  return <DatasetOverview />;
}

export async function generateStaticParams() {
  // Here, you can define a list of known CIDs to pre-render
  return [
    { cid: 'bafybeieat2zrhnwtd6pq3nie2otgkqkafk6u4457qroqbyy6debg426yxy' },
    { cid: 'another-cid-here' },
    // Add more CIDs here if known
  ];
}
