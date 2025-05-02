import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import ServiceCategories from "@/components/ServiceCategories";
import SocialProof from "@/components/SocialProof";
import ValueProps from "@/components/ValueProps";

;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-blue-50">
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