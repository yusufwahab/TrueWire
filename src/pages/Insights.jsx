import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "../components/ui/Reveal";
import { PulseSkeleton } from "../components/ui/PulseSkeleton";
import { PhotoCredit } from "../components/ui/PhotoCredit";
import { useEditorialImage } from "../hooks/useEditorialImage";
import { api } from "../lib/api";
import { INSIGHTS } from "../data/seed";
import { timeAgo } from "../lib/format";

function InsightCard({ post }) {
  const image = useEditorialImage(post.heroImageQuery);
  return (
    <div>
      <Link to={`/insights/${post.slug}`} className="group block">
        {image.url ? (
          <img src={image.url} alt={image.alt} className="editorial-photo mb-4 h-48 w-full rounded-xl object-cover" />
        ) : (
          <PulseSkeleton className="mb-4 h-48 w-full" rounded="rounded-xl" />
        )}
        <p className="mb-1 font-mono text-xs text-slate">
          {post.category} · {timeAgo(post.publishedAt)}
        </p>
        <h3 className="font-display text-xl font-semibold text-ink group-hover:text-signal-teal">{post.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate">{post.excerpt}</p>
      </Link>
      <PhotoCredit credit={image.credit} className="mt-2" />
    </div>
  );
}

export function Insights() {
  const [posts, setPosts] = useState(INSIGHTS);
  useEffect(() => {
    let cancelled = false;
    api
      .insights()
      .then((data) => {
        if (!cancelled && data?.insights?.length) setPosts(data.insights);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Insights</h1>
        <p className="mt-3 max-w-xl text-sm text-slate">Debunk write-ups, methodology notes, and trend recaps from the team.</p>
      </Reveal>

      <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Reveal key={post.id}>
            <InsightCard post={post} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
