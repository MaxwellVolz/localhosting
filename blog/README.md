# Next.js + MDX Blog

A modern, static blog with visual CMS, perfect for self-hosting.

## Features

- **Static Site Generation**: Fast, SEO-friendly pages
- **MDX Support**: Write JSX components in markdown
- **Decap CMS**: Visual content editor at `/admin`
- **Syntax Highlighting**: Code blocks with copy buttons (rehype-pretty-code)
- **Heading Anchors**: Auto-generated IDs for all headings (rehype-slug)
- **Custom Components**: Keyboard shortcuts with `::text::` syntax
- **Text Replacements**: `->` becomes →, `<-` becomes ←, `<3` becomes ♥
- **Tag System**: Color-coded tags with hover effects
- **Dark Mode**: Persistent theme preference

## Installation

```bash
npm install
```

## Development

```bash
# Start dev server (http://localhost:3000)
npm run dev

# Build for production (outputs to /out)
npm run build

# Format code
npm run format
```

## Content Management

### Option 1: Decap CMS (Visual Editor)

1. Visit http://localhost:3000/admin
2. Authenticate with GitHub (requires GitHub OAuth or token)
3. Create/edit posts visually
4. Publish → Auto-commits to Git

### Option 2: Manual Editing

Create/edit `.mdx` files in `content/posts/`:

```markdown
---
title: My First Post
date: 2025-01-01
tags: web react
pinned: false
work: false
draft: false
---

# Hello World

Your content here...
```

**Frontmatter Fields**:
- `title`: Post title (required)
- `date`: Publication date (required)
- `tags`: Space-separated tags (e.g., "web react")
- `pinned`: Show in "What I'm Doing" section (default: false)
- `work`: Show in "Things I've Shipped" section (default: false)
- `draft`: Hide from site (default: false)
- `cover`: Optional cover image path

## Configuration

### Decap CMS Setup

Edit `public/admin/config.yml` to configure:

```yaml
backend:
  name: github
  repo: your-username/your-repo
  branch: master
```

### Site Customization

1. **Update branding** in `pages/index.tsx`:
   - Change "MVOLZ" header
   - Update social links
   - Modify hero text

2. **Add/modify tags** in `pages/index.tsx`:
   - Update `tagColors` object with your tag names and colors

3. **Customize theme** in `tailwind.config.js`:
   - Colors, fonts, spacing

## Project Structure

```
blog/
├── pages/
│   ├── [slug].tsx         # Blog post template
│   ├── index.tsx          # Homepage with post listings
│   ├── _app.tsx           # App wrapper (theme management)
│   └── admin.tsx          # Decap CMS entry point
├── components/
│   └── Kbd.tsx            # Keyboard shortcut component
├── lib/
│   └── remarkSubstitutions.ts  # Custom MDX text replacements
├── content/posts/         # Your blog posts (.mdx files)
├── public/
│   ├── admin/             # Decap CMS config
│   └── uploads/           # Media uploads
└── styles/
    └── globals.css        # Global styles
```

## MDX Pipeline

Posts are processed with these plugins:

1. **remarkSubstitutions**: Custom text replacements
   - `->` → `→`, `<-` → `←`, `<3` → `♥`
   - `::text::` → `<Kbd>text</Kbd>`

2. **remarkGfm**: GitHub-flavored markdown (tables, strikethrough, etc.)

3. **rehypeSlug**: Auto-generate heading IDs for anchor links

4. **rehypePrettyCode**: Syntax highlighting with github-dark theme

## Custom Syntax

**Keyboard Shortcuts**:
```markdown
Press ::Ctrl+C:: to copy
```
Renders as: Press <kbd>Ctrl+C</kbd> to copy

**Text Replacements**:
```markdown
This arrow -> points right
I <3 self-hosting
```
Renders as: This arrow → points right, I ♥ self-hosting

## Deployment

This blog is configured for static export (`output: 'export'` in `next.config.js`).

Build output goes to `/out` directory, ready for:
- NGINX (see [../hosting/README.md](../hosting/README.md))
- Vercel/Netlify
- GitHub Pages
- Any static hosting service

## Troubleshooting

**CMS authentication fails**:
- Check GitHub OAuth app configuration
- Verify repo permissions in `public/admin/config.yml`

**Build fails**:
- Ensure all `.mdx` files have valid frontmatter
- Check for syntax errors in MDX content
- Run `npm install` to ensure dependencies are installed

**Styles not loading**:
- Run `npm run dev` to start the dev server
- Check `styles/globals.css` is imported in `_app.tsx`
