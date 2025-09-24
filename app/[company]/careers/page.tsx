import { notFound } from 'next/navigation';

export default function CareersPage({
  params,
}: {
  params: { company: string };
}) {
  // Add your company-specific logic here
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Careers at {params.company}</h1>
      <p>We're hiring! Check back soon for open positions.</p>
    </div>
  );
}
