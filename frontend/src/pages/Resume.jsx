import { Link } from "react-router-dom";

import { usePortfolio } from "../context/PortfolioContext";

export default function Resume() {
  const { portfolio, loading, error } = usePortfolio();

  if (loading) return <main className="p-8 text-neutral-400">Loading resume…</main>;
  if (error) return <main className="p-8 text-red-300">Could not load resume: {error}</main>;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-10 sm:px-10">
      <Link to="/" className="text-sm text-neutral-400 hover:text-white">
        ← Back to portfolio
      </Link>
      <article className="mt-8 rounded-3xl border border-line bg-white p-8 text-black sm:p-14">
        <h1 className="mb-8 text-3xl font-bold">Resume</h1>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-7">
          {portfolio?.atsResumeText || "Resume text has not been added yet."}
        </pre>
      </article>
    </main>
  );
}
