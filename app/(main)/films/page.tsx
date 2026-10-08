import { Suspense } from "react";
import type { Metadata } from "next";
import FilmsPageClient from "./FilmsPageClient";

export const metadata: Metadata = {
  title: "Filmlar",
  description: "Retro va klassik filmlar katalogi — milliy va xorijiy kinolar",
};

// Next.js 15: searchParams is a Promise
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FilmsPage({ searchParams }: PageProps) {
  // Await the Promise before passing down
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <FilmsPageClient searchParams={params as Record<string, string | undefined>} />
    </Suspense>
  );
}
