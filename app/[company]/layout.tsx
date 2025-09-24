import { ReactNode } from 'react';

export default function CompanyLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { company: string };
}) {
  return <div className="company-layout">{children}</div>;
}
