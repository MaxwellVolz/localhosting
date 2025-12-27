import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import type { GetStaticPaths, GetStaticProps } from 'next';
import remarkSubstitutions from '@/lib/remarkSubstitutions';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import { useEffect } from 'react';
import { Kbd } from '@/components/Kbd';

export default function BlogPostPage({ source, frontmatter }: any) {

  useEffect(() => {
    document.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.copy-button')) return;

      const button = document.createElement('button');
      button.innerText = 'Copy';
      button.className = 'copy-button';

      button.onclick = () => {
        const code = pre.querySelector('code')?.textContent || '';
        navigator.clipboard.writeText(code);
        button.innerText = 'Copied!';
        setTimeout(() => (button.innerText = 'Copy'), 2000);
      };

      pre.appendChild(button);
    });
  }, []);


  return (
    <main className="prose lg:prose-xl max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-4xl mb-2">{frontmatter.title}</h1>
      {/* <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{new Date(frontmatter.date).toLocaleDateString()}</p> */}
      <article className="prose lg:prose-xl">
        <MDXRemote {...source} components={{ Kbd }} />
      </article>
      <div className="mt-4">
        <hr />
        <Link href={`/ `}>Home</Link>
      </div>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(path.join(process.cwd(), 'content/posts'));

  const paths = files.map((file) => ({
    params: { slug: file.replace(/\.mdx?$/, '') } // 👈 removes `.mdx`
  }));


  return { paths, fallback: false };
};


export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  const fullPath = path.join(process.cwd(), 'content/posts', `${slug}.mdx`); // 👈 ADD `.mdx` back here
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { content, data } = matter(raw);

  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkSubstitutions, remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypePrettyCode, {
          theme: 'github-dark', // or 'nord', 'one-dark-pro', etc.
          onVisitLine(node) {
            if (node.children.length === 0) {
              node.children = [{ type: 'text', value: ' ' }];
            }
          },
          onVisitHighlightedLine(node) {
            node.properties.className.push('highlighted');
          },
        }]
      ],
    },
  });

  return {
    props: {
      source: mdxSource,
      frontmatter: {
        title: data.title || slug,
        date: data.date ? new Date(data.date).toISOString() : '',
      },
    },
  };
};
