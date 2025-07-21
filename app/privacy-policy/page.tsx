import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Privacy Policy</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">Privacy Policy</h1>
          <p className="text-base sm:text-lg text-gray-600">Last updated: July 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 xl:p-12">
          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
            <div className="bg-green-50 border-l-4 border-green-400 p-4 sm:p-6 mb-8 sm:mb-12">
              <p className="text-green-800 font-medium text-sm sm:text-base">
                Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use Skillpact.
              </p>
            </div>
            
            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                This Privacy Policy explains how Skillpact ("we," "us," or "our") collects, uses, and protects your information when you use our platform. We are committed to protecting your privacy and handling your data responsibly.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">2. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                We collect several types of information to provide and improve our services:
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">Name, email address, profile photo, and other information you provide when creating an account.</p>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Usage Data</h3>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">Information about how you use our platform, including pages visited, features used, and interactions with other users.</p>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Technical Information</h3>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">IP address, browser type, device information, and other technical data collected automatically.</p>
                </div>
              </div>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base lg:text-lg">
                <li>Provide and maintain our services</li>
                <li>Facilitate skill exchanges between users</li>
                <li>Process transactions and manage credits</li>
                <li>Communicate with you about your account and services</li>
                <li>Improve our platform and develop new features</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">4. Information Sharing</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                We do not sell your personal information. We may share your information in the following limited circumstances:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base lg:text-lg">
                <li>With other users as necessary to facilitate service exchanges</li>
                <li>With service providers who help us operate our platform</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or acquisition</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">6. Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base lg:text-lg">
                <li>Access and review your personal information</li>
                <li>Update or correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Restrict or object to certain processing activities</li>
                <li>Request a copy of your data in a portable format</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">7. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                Skillpact is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">8. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our platform and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">9. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at{' '}
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