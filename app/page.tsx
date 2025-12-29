import { HeroSection } from "@/components/blocks/hero-section-1"
import { PricingPlans } from "@/components/blocks/pricing-plans"
import { Testimonials } from "@/components/blocks/testimonials"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-grow">
        <HeroSection />
        
        {/* Technical Architecture Section */}
        <section id="about" className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-24">
              {/* Left side - Content */}
              <div className="flex-1 md:pr-8">
                <h2 className="text-4xl font-bold mb-6">Technical Architecture</h2>
                <p className="text-xl text-gray-300 mb-8">
                  VerifyChain leverages blockchain technology and smart contracts to provide immutable product verification and supply chain transparency.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-emerald-400">Frontend</span>
                      <span className="text-gray-300">: Next.js with React and Tailwind CSS for intuitive verification dashboard</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-emerald-500">Web3 Integration</span>
                      <span className="text-gray-300">: RainbowKit & Wagmi for seamless wallet connection and blockchain interactions</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-emerald-600">Smart Contracts</span>
                      <span className="text-gray-300">: Product Registry on Ethereum Sepolia for tamper-proof authenticity records</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-teal-400">Verification Engine</span>
                      <span className="text-gray-300">: AI-powered authenticity detection with blockchain validation</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-cyan-400">Supply Chain Tracking</span>
                      <span className="text-gray-300">: Real-time checkpoint monitoring from origin to consumer</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Image */}
              <div className="flex-1 md:pl-8 flex justify-center">
                <div className="w-[300px] h-[300px] rounded-xl shadow-lg shadow-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 flex items-center justify-center border border-emerald-500/20">
                  <svg className="w-32 h-32 text-emerald-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <PricingPlans />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
