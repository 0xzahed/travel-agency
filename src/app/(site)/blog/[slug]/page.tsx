import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { blogPosts } from "@/lib/data/content";
import { formatDate, img } from "@/lib/utils";
import { Avatar } from "@/components/ui/primitives";
import { BlogCard } from "../blog-index";
import { ShareButtons } from "./share-buttons";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = blogPosts.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.excerpt } : {};
}

function renderBlock(block: string, i: number) {
  if (block.startsWith("## ")) return <h2 key={i}>{block.slice(3)}</h2>;
  if (block.startsWith("### ")) return <h3 key={i}>{block.slice(4)}</h3>;
  if (block.startsWith("> ")) return <blockquote key={i}>{block.slice(2)}</blockquote>;
  return <p key={i}>{block}</p>;
}

/** Groups consecutive "- " lines into a single <ul>. */
function renderContent(content: string[]) {
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) out.push(<ul key={`ul${out.length}`}>{list.map((l) => <li key={l}>{l}</li>)}</ul>);
    list = [];
  };
  content.forEach((b, i) => {
    if (b.startsWith("- ")) list.push(b.slice(2));
    else {
      flush();
      out.push(renderBlock(b, i));
    }
  });
  flush();
  return out;
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();
  const related = blogPosts.filter((p) => p.id !== post.id && p.published).sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category)).slice(0, 3);

  return (
    <article className="pb-24 pt-28 md:pt-36">
      <div className="container-x max-w-3xl">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted">
          <Link href="/blog" className="hover:text-ink">
            Travel guide
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-secondary">{post.category}</span>
        </nav>
        <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{post.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
          <div className="flex items-center gap-3">
            <Avatar src={post.author.avatar} name={post.author.name} size={44} />
            <div className="text-sm">
              <p className="font-semibold">{post.author.name}</p>
              <p className="text-muted">
                {post.author.role} · <time dateTime={post.date}>{formatDate(post.date, "long")}</time> · <Clock className="inline size-3.5" /> {post.readTime} min read
              </p>
            </div>
          </div>
          <ShareButtons title={post.title} />
        </div>
      </div>

      <div className="container-x mt-10 max-w-5xl">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl">
          <Image src={img(post.image, 2000)} alt="" fill priority sizes="(max-width:1024px) 100vw, 1024px" className="object-cover" />
        </div>
      </div>

      <div className="container-x prose-travel mt-12 max-w-3xl text-[17px]">{renderContent(post.content)}</div>

      <div className="container-x mt-12 max-w-3xl">
        <div className="flex items-center justify-between rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-medium">Found this useful? Share it.</p>
          <ShareButtons title={post.title} />
        </div>
      </div>

      <section className="container-x mt-20">
        <h2 className="mb-8 text-2xl font-bold">Related articles</h2>
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <BlogCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    </article>
  );
}
