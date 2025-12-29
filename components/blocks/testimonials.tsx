"use client"

import { Quote, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    quote: "VerifyChain saved our brand from millions in counterfeit losses. The blockchain verification is instant and bulletproof.",
    name: "Emma Thompson",
    handle: "@emmatech",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    avatar: "ET",
    role: "Brand Protection Lead",
    rating: 5
  },
  {
    quote: "Our customers love scanning products to verify authenticity. Trust has never been higher. Game-changing technology.",
    name: "David Park", 
    handle: "@davidretail",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    avatar: "DP",
    role: "Retail Director",
    rating: 4
  },
  {
    quote: "Complete supply chain transparency from factory to consumer. VerifyChain makes compliance effortless.",
    name: "Sofia Rodriguez",
    handle: "@sofiasupply",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    avatar: "SR", 
    role: "Supply Chain Manager",
    rating: 5
  },
  {
    quote: "The blockchain integration is seamless. Every product gets an immutable authenticity certificate. Perfect solution.",
    name: "Alex Chen",
    handle: "@alexweb3",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    avatar: "AC",
    role: "Blockchain Developer",
    rating: 4
  },
  {
    quote: "Best anti-counterfeit platform we've tested. ROI was immediate. Our customers feel safer buying from us now.",
    name: "Maria Santos",
    handle: "@mariabrand",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    avatar: "MS",
    role: "E-commerce Director", 
    rating: 5
  },
  {
    quote: "Love the real-time verification alerts. Caught counterfeit attempts before they reached customers. Invaluable tool.",
    name: "James Wilson",
    handle: "@jamesquality",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    avatar: "JW",
    role: "Quality Assurance Lead",
    rating: 4
  }
]

function TestimonialCard({ testimonial }: { testimonial: any }) {
  return (
    <Card className="w-[350px] flex-shrink-0 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 rounded-xl">
      <CardContent className="p-8">
        {/* Quote */}
        <div className="mb-6">
          <Quote className="w-5 h-5 text-emerald-400 mb-4" />
          <p className="text-white text-base leading-relaxed font-medium h-[72px] overflow-hidden">
            "{testimonial.quote}"
          </p>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-6">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        
        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              src={testimonial.image} 
              alt={testimonial.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-white font-semibold text-sm">${testimonial.avatar}</span>`;
                }
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-semibold text-base mb-1">
              {testimonial.name}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-emerald-400 font-semibold tracking-wide">
                {testimonial.handle}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">
                {testimonial.role}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Testimonials() {
  // Duplicate testimonials for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  return (
    <section id="testimonials" className="py-20 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Trusted by Brands & Supply Chain Leaders Worldwide
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            VerifyChain empowers businesses to fight counterfeits and build consumer trust through blockchain verification.
          </p>
        </div>

        {/* Scrolling testimonials carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex gap-6 animate-scroll hover:pause"
              style={{
                animation: 'scroll 40s linear infinite'
              }}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <TestimonialCard 
                  key={`${testimonial.handle}-${index}`}
                  testimonial={testimonial}
                />
              ))}
            </div>
          </div>
          
          {/* Gradient overlays for smooth edges */}
          <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-black to-transparent pointer-events-none z-10"></div>
          <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-black to-transparent pointer-events-none z-10"></div>
        </div>

        {/* Social proof stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-white mb-2">50M+</div>
            <div className="text-gray-400 text-sm">Products Verified</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">2,500+</div>
            <div className="text-gray-400 text-sm">Brands Protected</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">94%</div>
            <div className="text-gray-400 text-sm">Counterfeit Detection</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">99.9%</div>
            <div className="text-gray-400 text-sm">Verification Accuracy</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-8 border border-emerald-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to protect your brand from counterfeits?
            </h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Join thousands of brands using blockchain verification to build consumer trust and eliminate counterfeit products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                Start Free Trial
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-350px * ${testimonials.length} - ${testimonials.length * 24}px));
          }
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
