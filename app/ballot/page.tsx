import { BallotClient } from "@/components/BallotClient";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BallotPage({ searchParams }: Props) {
  const params = await searchParams;
  const returnToSummary = params["returnTo"] === "summary";
  const startIndex = parseInt((params["index"] as string) ?? "-1", 10);

  return <BallotClient returnToSummary={returnToSummary} startIndex={startIndex} />;
}
