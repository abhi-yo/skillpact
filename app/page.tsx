import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import ServiceCategories from "@/components/ServiceCategories";
import SocialProof from "@/components/SocialProof";
import ValueProps from "@/components/ValueProps";
import Marquee from "@/components/ui/marquee";

const marqueeTexts = [
  "Swap Skills, Not Cash",
  "Earn Credits for Your Talents",
  "Connect with Your Community",
  "Learn Something New Today",
  "Share Your Passion",
  "Get Help from Trusted Neighbors",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-blue-50">
      <Marquee items={marqueeTexts} />
      <Navbar/>
      <Hero />
      <HowItWorks />
      <ValueProps />
      <ServiceCategories />
      <SocialProof />
      <CallToAction />
      <Footer />
    </main>
  );
} 