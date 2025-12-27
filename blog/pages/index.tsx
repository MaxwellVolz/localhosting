import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
// import styles from '../styles/Blog.module.css';
import Link from 'next/link';
// import IDELayout from './layout/IDELayout';
import RoomScene from './room';
import MVolzLogo from '@/public/imgs/mvolz2.svg';
import { useState } from 'react';

// Modern muted color palette inspired by YC startup design systems
const tagColors: Record<string, string> = {
  web: 'bg-slate-100 text-slate-700 border border-slate-200',
  threeJS: 'bg-violet-50 text-violet-700 border border-violet-200',
  blender: 'bg-rose-50 text-rose-700 border border-rose-200',
  unity: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  ai: 'bg-amber-50 text-amber-700 border border-amber-200',
  n8n: 'bg-orange-50 text-orange-700 border border-orange-200',
  llm: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  automation: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
  stable_diffusion: 'bg-lime-50 text-lime-700 border border-lime-200',
  docker: 'bg-blue-50 text-blue-700 border border-blue-200',
  rant: 'bg-red-50 text-red-700 border border-red-200',
  python: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  react: 'bg-sky-50 text-sky-700 border border-sky-200',
  javascript: 'bg-stone-100 text-stone-700 border border-stone-200',
};



type PostMeta = {
  slug: string;
  title: string;
  date: string;
  cover?: string;
  pinned?: boolean;
  work?: boolean;
  draft?: boolean;
  tags?: string[];
};

export async function getStaticProps() {
  const postsDir = path.join(process.cwd(), 'content/posts');
  const files = fs.readdirSync(postsDir);

  const posts: PostMeta[] = files.map((file) => {
    const slug = file.replace(/\.mdx?$/, '');
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data } = matter(raw);

    return {
      slug,
      title: data.title || slug,
      date: data.date ? new Date(data.date).toISOString() : '',
      cover: data.cover || null,
      pinned: !!data.pinned,
      work: !!data.work,
      draft: !!data.draft,
      tags: typeof data.tags === 'string'
        ? data.tags.trim().split(/\s+/)
        : Array.isArray(data.tags)
          ? data.tags
          : [],

    };
  });

  const visiblePosts = posts
    .filter((post) => !post.draft)
    .sort((a, b) => (b.pinned ? -1 : 0) - (a.pinned ? -1 : 0) || b.date.localeCompare(a.date));

  return { props: { posts: visiblePosts } };
}


// export default function HomePage() {

//   return <RoomScene />;
// }

export default function BlogIndex({ posts = [] }: { posts: PostMeta[] }) {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  const handleTagHover = (tag: string) => {
    setHoveredTag(tag);
  };

  const handleTagLeave = () => {
    setHoveredTag(null);
  };

  const getTagClassName = (tag: string, baseSize: 'sm' | 'xs') => {
    const baseClasses = baseSize === 'sm'
      ? 'px-3 py-1 text-sm font-mono rounded-md transition-all duration-200 cursor-pointer'
      : 'px-2 py-1 text-xs font-mono rounded transition-all duration-200 cursor-pointer';

    const colorClasses = tagColors[tag] || 'bg-gray-50 text-gray-700 border border-gray-200';

    const isHighlighted = hoveredTag === tag;
    const isOtherTagHovered = hoveredTag !== null && hoveredTag !== tag;

    const interactionClasses = isHighlighted
      ? 'scale-110 shadow-md ring-2 ring-gray-300'
      : isOtherTagHovered
        ? 'opacity-50 scale-95'
        : 'hover:shadow-sm hover:scale-105';

    return `${baseClasses} ${colorClasses} ${interactionClasses}`;
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-24 relative z-10">
        <div className="space-y-8">
          <h1 className="text-6xl md:text-8xl font-bold text-black tracking-tight">
            MVOLZ
          </h1>

          <div className="max-w-2xl">
            <p className="text-2xl md:text-3xl text-gray-900 leading-relaxed font-light">
              I build products that matter. Full-stack engineer shipping
              <span className="font-medium text-blue-600"> AI-powered solutions</span> and
              <span className="font-medium text-emerald-600"> data visualizations</span> that solve real problems.
            </p>
          </div>

          <div className="max-w-xl">
            <p className="text-lg text-gray-600 leading-relaxed">
              Currently exploring opportunities to apply my expertise. <span className="font-medium text-emerald-400">"Hire me!"</span>
            </p>
          </div>
        </div>
      </div>

      {/* What I'm Building Section */}
      <div className="max-w-4xl mx-auto px-6 py-16 border-t border-gray-100">
        <div className="space-y-12">
          <h2 className="text-xl font-bold text-black uppercase tracking-wider">
            WHAT I'VE BEEN DOING LATELY
          </h2>

          <div className="space-y-8">
            {posts.filter((post) => post.pinned).map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/${post.slug}`} className="block">
                  <h3 className="text-2xl md:text-3xl font-medium text-black group-hover:text-gray-600 transition-colors duration-200 mb-3">
                    {post.title}
                  </h3>
                </Link>
                {post.tags && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className={getTagClassName(tag, 'sm')}
                        onMouseEnter={() => handleTagHover(tag)}
                        onMouseLeave={handleTagLeave}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Things I've Shipped Section */}
      <div className="max-w-4xl mx-auto px-6 py-16 border-t border-gray-100">
        <div className="space-y-12">
          <h2 className="text-xl font-bold text-black uppercase tracking-wider">
            THINGS I'VE SHIPPED
          </h2>

          <div className="space-y-8">
            {posts.filter((post) => post.work).map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/${post.slug}`} className="block">
                  <h3 className="text-2xl md:text-3xl font-medium text-black group-hover:text-gray-600 transition-colors duration-200 mb-3">
                    {post.title}
                  </h3>
                </Link>
                {post.tags && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className={getTagClassName(tag, 'sm')}
                        onMouseEnter={() => handleTagHover(tag)}
                        onMouseLeave={handleTagLeave}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}

          </div>
        </div>
      </div>

      {/* Previous Articles Section */}
      <div className="max-w-4xl mx-auto px-6 py-16 border-t border-gray-100">
        <div className="space-y-12">
          <h2 className="text-xl font-bold text-black uppercase tracking-wider">
            PREVIOUS ARTICLES
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            {posts.filter((post) => !post.pinned && !post.work).map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/${post.slug}`} className="block">
                  <h3 className="text-xl font-medium text-black group-hover:text-gray-600 transition-colors duration-200 mb-3">
                    {post.title}
                  </h3>
                </Link>
                {post.tags && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className={getTagClassName(tag, 'xs')}
                        onMouseEnter={() => handleTagHover(tag)}
                        onMouseLeave={handleTagLeave}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <a
              href="/downloads/mvolz_resume.pdf"
              className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors duration-200"
            >
              Resume.pdf
            </a>
            <div className="flex items-center space-x-4">
              <a
                href="https://linkedin.com/in/maxwellvolz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/maxwellwhatever"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://x.com/maxxxvolz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
