import type { Metadata } from "next";
import { Suspense } from "react";
import ContentPage from "@/components/movie/ContentPage";

export const metadata: Metadata = {
  title: "Seriallar",
  description: "Milliy va xorijiy retro seriallar katalogi",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SerialsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ContentPage
        type="serial"
        title="SERIALLAR"
        searchParams={params as Record<string, string>}
      />
    </Suspense>
  );
}
