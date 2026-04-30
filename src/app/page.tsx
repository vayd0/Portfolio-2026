import { sanity } from "@/lib/sanity";
import PortfolioClient from "@/components/PortfolioClient";

export const revalidate = 60;

const query = `*[_type == "project"] | order(_createdAt asc)[0...3] {
  _id,
  title,
  "image": mainImage.asset->url,
  "gallery": gallery[].asset->url,
  description,
  projectUrl,
  github
}`;

export default async function Home() {
  const projects = await sanity.fetch(query);
  return <PortfolioClient projects={projects} />;
}
