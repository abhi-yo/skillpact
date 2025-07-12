import Link from 'next/link'

export default function CommunityGuidelinesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Community Guidelines</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">Community Guidelines</h1>
          <p className="text-base sm:text-lg text-gray-600">Last updated: July 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 xl:p-12">
          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
            <div className="bg-purple-50 border-l-4 border-purple-400 p-4 sm:p-6 mb-8 sm:mb-12">
              <p className="text-purple-800 font-medium text-sm sm:text-base">
                Our community guidelines help ensure Skillpact remains a safe, respectful, and productive environment for all users to exchange skills and services.
              </p>
            </div>
            
            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">1. Be Respectful and Kind</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                Treat all community members with kindness, respect, and professionalism. We have zero tolerance for:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base lg:text-lg">
                <li>Harassment, bullying, or intimidation</li>
                <li>Hate speech or discrimination based on race, gender, religion, or other protected characteristics</li>
                <li>Personal attacks or offensive language</li>
                <li>Threats or violent content</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">2. Provide Honest and Quality Services</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                Maintain the integrity of our platform by:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base lg:text-lg">
                <li>Only offering skills you are genuinely qualified to perform</li>
                <li>Providing accurate and detailed descriptions of your services</li>
                <li>Being honest about your experience level and capabilities</li>
                <li>Delivering services that meet the agreed-upon standards</li>
                <li>Using recent and representative photos in your profile</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">3. Communicate Clearly and Promptly</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                Effective communication is essential for successful exchanges:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base lg:text-lg">
                <li>Discuss expectations, timelines, and credit amounts before agreeing to exchanges</li>
                <li>Respond to messages in a timely manner</li>
                <li>Ask questions if anything is unclear</li>
                <li>Provide updates on your progress</li>
                <li>Communicate any issues or delays promptly</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">4. Honor Your Commitments</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                Reliability builds trust in our community:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base lg:text-lg">
                <li>Complete agreed-upon exchanges as promised</li>
                <li>Show up on time for scheduled services</li>
                <li>If you need to cancel or reschedule, provide as much notice as possible</li>
                <li>Be prepared with the necessary tools and materials</li>
                <li>Follow through on your commitments even if they become inconvenient</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">5. Keep It Legal and Safe</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                Do not use Skillpact for any illegal or unsafe activities:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base lg:text-lg">
                <li>Services that violate local, state, or federal laws</li>
                <li>Activities that could cause harm to people or property</li>
                <li>Services requiring professional licenses you don't possess</li>
                <li>Adult content or services of a sexual nature</li>
                <li>Gambling, drug-related activities, or other illegal substances</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">6. Protect Privacy and Personal Information</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                Respect the privacy of all community members:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base lg:text-lg">
                <li>Do not share personal information of others without consent</li>
                <li>Respect confidentiality when working in people's homes or businesses</li>
                <li>Do not take photos or videos without permission</li>
                <li>Keep payment information and personal details secure</li>
                <li>Report any privacy violations to our support team</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">7. Report Issues and Concerns</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                Help us maintain a safe community by reporting problems:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base lg:text-lg">
                <li>Use the reporting tools to flag inappropriate behavior</li>
                <li>Contact support if you encounter safety concerns</li>
                <li>Report fraudulent or suspicious activities</li>
                <li>Provide detailed information to help us investigate</li>
                <li>Do not take matters into your own hands</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">8. Consequences and Enforcement</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                Violations of these guidelines may result in:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base lg:text-lg">
                <li>Warning messages and educational resources</li>
                <li>Temporary suspension of account privileges</li>
                <li>Permanent termination of your account</li>
                <li>Removal from the platform and forfeiture of credits</li>
                <li>Legal action in cases of serious violations</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">9. Updates to Guidelines</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                We may update these Community Guidelines from time to time to reflect changes in our platform or community needs. Continued use of Skillpact indicates your acceptance of any updated guidelines.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">10. Questions and Support</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                If you have questions about these Community Guidelines or need to report a concern, please contact our support team at{' '}
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