import type { Metadata } from "next";
import { Suspense } from "react";
import ContentPage from "@/components/movie/ContentPage";

export const metadata: Metadata = {
  title: "Multfilmlar",
  description: "Milliy va Yevropa retro multfilmlar katalogi",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CartoonsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ContentPage
        type="cartoon"
        title="MULTFILMLAR"
        searchParams={params as Record<string, string>}
      />
    </Suspense>
  );
}
