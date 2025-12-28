# DownNote - Modern Markdown Editor

A beautiful, modern markdown editor built with Next.js 16, featuring real-time preview, cloud sync, and guest mode for quick note-taking.

![DownNote](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=flat-square&logo=tailwind-css)

## Features

### Editor

- **Real-time Preview** - See your markdown rendered instantly with synchronized scrolling
- **Split View** - Edit and preview side-by-side with resizable panes
- **Focus Mode** - Distraction-free writing environment
- **Syntax Highlighting** - Beautiful code blocks with syntax highlighting
- **Auto-save** - Never lose your work with automatic saving (2s debounce)
- **Word Count** - Track words, characters, and estimated reading time

### Beautiful Design

- **Dark Mode** - Gorgeous dark theme (default) with light mode option
- **Custom Fonts** - Crimson Pro for headings, Work Sans for body, IBM Plex Mono for code
- **Gradient Accents** - Modern UI with smooth gradients and animations
- **Responsive** - Works perfectly on desktop, tablet, and mobile
- **Custom Callouts** - Note, Warning, Tip, and Danger callout blocks

### Authentication & Storage

- **Guest Mode** - Start writing immediately without signing up
- **Cloud Sync** - Sign in to sync documents across devices
- **OAuth Support** - Sign in with Google or GitHub
- **Document Migration** - Automatically migrates guest documents when you sign in
- **Local Storage** - Guest documents saved in browser localStorage

### Document Management

- **Multiple Documents** - Create and manage unlimited documents
- **Search** - Quickly find documents by title or content
- **Rename & Delete** - Easy document organization
- **Export/Import** - Backup and restore your documents (guest mode)
- **Download** - Export individual documents as .md files

### Performance

- **Loading Indicators** - Clear visual feedback for all actions
- **Progress Bar** - Top loader for page navigation
- **Optimized Rendering** - Fast markdown processing with rehype/remark

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.1](https://tailwindcss.com/)
- **Authentication**: [NextAuth v5](https://next-auth.js.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Editor**: [CodeMirror 6](https://codemirror.net/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown) with rehype/remark plugins
- **UI Components**: Custom components with [Lucide Icons](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Split Panes**: [react-split](https://github.com/nathancahill/split/tree/master/packages/react-split)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- OAuth credentials (optional, for Google/GitHub login)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd downnote
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/downnote"

   # NextAuth
   AUTH_SECRET="your-auth-secret-here"
   AUTH_URL="http://localhost:3000"

   # OAuth Providers (optional)
   AUTH_GOOGLE_ID="your-google-client-id"
   AUTH_GOOGLE_SECRET="your-google-client-secret"
   AUTH_GITHUB_ID="your-github-client-id"
   AUTH_GITHUB_SECRET="your-github-client-secret"
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
downnote/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   └── documents/       # Document CRUD operations
│   ├── auth/                # Auth pages (signin, signup)
│   ├── editor/              # Main editor page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── editor/              # Editor components
│   │   └── markdown-editor.tsx
│   └── ui/                  # UI components
│       ├── document-sidebar.tsx
│       ├── header.tsx
│       └── theme-provider.tsx
├── lib/                     # Utility functions
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma client
│   ├── guest-storage.ts    # localStorage utilities
│   ├── migrate-guest-documents.ts
│   └── word-count.ts       # Text statistics
├── prisma/
│   └── schema.prisma       # Database schema
└── public/                 # Static assets
```

## Customization

### Colors

The primary color scheme can be customized in `app/globals.css`:

```css
@theme {
  --color-primary-500: #0ea5e9; /* Sky blue */
  --color-primary-600: #0284c7;
  /* ... more shades */
}
```

### Fonts

Fonts are configured in `app/globals.css`:

- **Headings**: Crimson Pro (serif)
- **Body**: Work Sans (sans-serif)
- **Code**: IBM Plex Mono (monospace)

## Markdown Features

DownNote supports standard markdown plus:

- **Code blocks** with syntax highlighting
- **Tables** with beautiful styling
- **Task lists** with checkboxes
- **Callouts/Admonitions**:
  - `> **NOTE**` - Blue info callout
  - `> ***WARNING***` - Orange warning callout
  - `> \`TIP\`` - Green tip callout
  - `> ~~**DANGER**~~` - Red danger callout

## Database Schema

```prisma
model User {
  id        String      @id @default(cuid())
  name      String?
  email     String      @unique
  password  String?
  documents Document[]
  accounts  Account[]
}

model Document {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.Text
  userId    String
  user      User     @relation(...)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Markdown rendering by [react-markdown](https://github.com/remarkjs/react-markdown)
- Inspiration from [StackEdit](https://stackedit.io/)