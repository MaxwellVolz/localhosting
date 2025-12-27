# LocalHosting - Home Server Boilerplates

A collection of ready-to-deploy boilerplates for self-hosted home server setups. This repository provides clean, tested configurations for common home lab services with automated deployment pipelines.

## Repository Structure

```
localhosting/
├── blog/           # Next.js + MDX static blog with CMS
├── endpoint/       # API server boilerplates (coming soon)
└── hosting/        # Deployment configurations (Jenkins, NGINX, Cloudflare)
```

## Quick Start

### Blog Setup

```bash
cd blog
npm install
npm run dev
```

Visit http://localhost:3000 to see your blog.
Visit http://localhost:3000/admin for the CMS (requires GitHub auth).

### Deployment Setup

See [hosting/README.md](hosting/README.md) for complete deployment guide.

## Stack Overview

**Blog**:
- Next.js 15 with static export
- MDX for rich content
- Decap CMS for visual editing
- Tailwind CSS for styling
- TypeScript support

**Deployment**:
- Jenkins CI/CD pipeline
- NGINX web server
- Cloudflare Tunnel for secure exposure
- Git-backed content (no database)

## Features

- **Zero Database**: All content in Git
- **Visual Editing**: Decap CMS at `/admin`
- **Auto Deploy**: Push to Git → Jenkins builds → NGINX serves
- **Secure Tunnel**: Cloudflare Tunnel (no port forwarding)
- **SEO Friendly**: Static site generation
- **Syntax Highlighting**: Beautiful code blocks with copy buttons
- **Heading Anchors**: All headings are linkable
- **Custom MDX Components**: Keyboard shortcuts and text replacements

## Documentation

- [Blog Setup & Usage](blog/README.md)
- [Deployment Guide](hosting/README.md)
- [Endpoint Examples](endpoint/README.md) (coming soon)

## License

MIT - Use freely for your home server projects
