export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Test Page Working! ✅
        </h1>
        <p className="text-lg text-gray-600">
          If you can see this, Vercel deployment is working.
        </p>
        <a 
          href="/" 
          className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go to Homepage
        </a>
      </div>
    </div>
  )
} 