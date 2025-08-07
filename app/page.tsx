export default function SimpleHomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          The New Alkebulan
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Empowering Global Communities
        </p>
        <div className="space-y-4">
          <a 
            href="/auth/signup" 
            className="block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </a>
          <a 
            href="/auth/signin" 
            className="block bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Sign In
          </a>
          <a 
            href="/test" 
            className="block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Test Page
          </a>
        </div>
      </div>
    </div>
  )
} 