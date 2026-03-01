/**
 * MAIN PAGE - Build your UI here!
 *
 * FILE STRUCTURE:
 * - app/page.tsx         <- YOU ARE HERE - main page
 * - app/layout.tsx       <- root layout
 * - app/api/             <- API routes (server-side)
 * - components/ui/       <- shadcn/ui components
 * - lib/utils.ts         <- cn() helper
 * - lib/aiAgent.ts       <- AI agent client utilities
 */

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Ready to Build Something Amazing!
        </h1>
        <p className="text-gray-300 text-lg">
          Next.js + React + TypeScript + Tailwind CSS
        </p>
      </div>
    </div>
  )
}
