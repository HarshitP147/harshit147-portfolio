# Personal Portfolio
This is the codebase for my personal portfolio website. The site is deployed on Vercel and blogs are hosted on Cloudflare.

Earlier the blogs were written and hosted on Hashnode and the site would utilize Hashnode's GraphQL API endpoints to retrieve the blogs.
As of 13th May 2026, their API started moving to paid offering.

On 16th May 2026, all the blogs were migrated and hosted on Cloudflare services, more specifically R2 storage for markdown and images and D1 database for blog metadata and blog likes storage.

Now each blog is written in Hashnode, downloaded to `tmp/` folder and the migration script is being executed to push the blog to Cloudflare.

The tech stack:
- Next.js
- Typescript
- ShadCN/UI
- TailwindCSS
- Cloudflare Typescript SDK
- Vercel tools (Analytics and Speed insights)

To run locally:
```sh
npm install
npm run dev
```

## Agents
The site is designed and engineered with coding agents. All the relevant skills are commited with this project.

Any agent specific settings such as MCP servers are not commited with this project.

The project also contains knowledge base in the `docs/` folder. Each knowledge base contain the design, architecture and other important information about the codebase and the project in separate files and folders.

The site is deployed on [harshit147.dev](https://harshit147.dev).