import Link from 'next/link'

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Terms of Service</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">Terms of Service</h1>
          <p className="text-base sm:text-lg text-gray-600">Last updated: July 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 xl:p-12">
          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 sm:p-6 mb-8 sm:mb-12">
              <p className="text-blue-800 font-medium text-sm sm:text-base">
                Please read these Terms of Service carefully before using Skillpact. By accessing or using our platform, you agree to be bound by these terms.
              </p>
            </div>
            
            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                Skillpact is a platform that allows users to exchange skills and services using a credit system. By accessing or using Skillpact, you agree to these Terms of Service and all applicable laws and regulations.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">2. Eligibility</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                You must be at least 18 years old and capable of forming a binding contract to use Skillpact. By registering for an account, you represent and warrant that you meet these requirements and that all information you provide is accurate and complete.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">3. Account Registration</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base lg:text-lg">
                <li>Provide accurate and complete information during registration</li>
                <li>Update your information as needed to keep it current</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Use a strong password and keep it secure</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">4. Credits System</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                Skillpact uses a virtual credit system to facilitate exchanges. Credits have no monetary value and may not be exchanged for cash or other forms of payment. We reserve the right to adjust credit balances in cases of error, fraud, or misuse of the platform.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">5. Service Exchanges</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                Users are solely responsible for negotiating and fulfilling service exchanges. Skillpact is not a party to any agreement between users and does not guarantee the performance, quality, or safety of any services provided through the platform.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">6. User Conduct</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                You agree not to engage in any of the following prohibited activities:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base lg:text-lg">
                <li>Illegal, harmful, or fraudulent activities</li>
                <li>Harassment, abuse, or discrimination against other users</li>
                <li>Posting false, misleading, or inappropriate content</li>
                <li>Attempting to circumvent platform security measures</li>
                <li>Using the platform for commercial purposes without authorization</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">7. Content and Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                You retain ownership of content you submit to Skillpact but grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute that content for the purpose of operating and improving our service.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">8. Disclaimers</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                Skillpact is provided on an "as-is" and "as-available" basis without warranties of any kind, either express or implied. We do not guarantee that the platform will be uninterrupted, error-free, or secure.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">9. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                To the maximum extent permitted by law, Skillpact shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">10. Account Termination</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                We may terminate or suspend your account at any time, with or without notice, if we believe you have violated these Terms or engaged in conduct that is harmful to other users or the platform.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                We may modify these Terms at any time by posting the updated version on our platform. Your continued use of Skillpact after such changes constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                For questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:hello@skillpact.co" className="text-blue-600 hover:text-blue-800 underline font-medium break-all">
                  hello@skillpact.co
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
} 