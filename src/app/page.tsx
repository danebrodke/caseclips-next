import VideoGrid from "@/components/VideoGrid";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string }>;
}) {
  const { specialty } = await searchParams;
  return <VideoGrid initialSpecialty={specialty} />;
}
