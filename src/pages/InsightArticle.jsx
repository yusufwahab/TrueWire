import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { PulseSkeleton } from "../components/ui/PulseSkeleton";
import { PhotoCredit } from "../components/ui/PhotoCredit";
import { useEditorialImage } from "../hooks/useEditorialImage";
import { api } from "../lib/api";
import { INSIGHTS } from "../data/seed";
import { timeAgo } from "../lib/format";

export function InsightArticle() {
  const { slug } = useParams();
  const [post, setPost] = useState(() => INSIGHTS.find((i) => i.slug === slug) ?? null);
  const [notFound, setNotFound] = useState(false);
  const image = useEditorialImage(post?.heroImageQuery || "Nigeria newsroom");

  useEffect(() => {
    let cancelled = false;
    setNotFound(false);
    api
      .insight(slug)
      .then((data) => {
        if (!cancelled && data?.insight) setPost(data.insight);
      })
      .catch(() => {
        const fallback = INSIGHTS.find((i) => i.slug === slug);
        if (!cancelled) {
          if (fallback) setPost(fallback);
          else setNotFound(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-slate">We couldn't find that post.</p>
        <Link to="/insights" className="mt-4 inline-block text-sm font-medium text-signal-teal hover:underline">
          Back to Insights
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-16 sm:px-6 lg:px-8">
        <PulseSkeleton className="h-8 w-2/3" />
        <PulseSkeleton className="h-64 w-full" rounded="rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
      <Link to="/insights" className="mb-6 inline-flex items-center gap-1 text-sm text-slate hover:text-signal-teal">
        <ChevronLeft size={16} /> Back to Insights
      </Link>

      <p className="mb-2 font-mono text-xs text-slate">
        {post.category} · {timeAgo(post.publishedAt)}
      </p>
      <h1 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">{post.title}</h1>

      <div className="mt-8">
        {image.url ? (
          <img src={image.url} alt={image.alt} className="editorial-photo h-72 w-full rounded-xl object-cover sm:h-96" />
        ) : (
          <PulseSkeleton className="h-72 w-full sm:h-96" rounded="rounded-xl" />
        )}
        <PhotoCredit credit={image.credit} className="mt-2" />
      </div>

      <div className="mt-8 space-y-5">
        {(post.body || []).map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="text-base leading-relaxed text-ink/85">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
