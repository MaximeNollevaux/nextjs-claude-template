export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Next.js + Claude Code Template
        </h1>

        <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-3 lg:text-left gap-4">
          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
            <h2 className="mb-3 text-2xl font-semibold">
              Database Autonomy
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Claude Code can autonomously modify your Supabase schema, create tables, and run migrations.
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
            <h2 className="mb-3 text-2xl font-semibold">
              Custom Commands
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Use /epct, /explore, /commit and more slash commands for enhanced productivity.
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
            <h2 className="mb-3 text-2xl font-semibold">
              N8N Integration
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Optional N8N integration for workflow automation and AI copilot features.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm opacity-70">
            Get started by editing <code className="font-mono font-bold">src/app/page.tsx</code>
          </p>
        </div>
      </div>
    </main>
  );
}
