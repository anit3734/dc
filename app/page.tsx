"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Database, Zap, Globe, BarChart3, Users, CheckCircle2, ChevronRight, Menu, X, Activity, Layers, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#2a3547] font-sans selection:bg-[#0085db] selection:text-white overflow-x-hidden">
      
      {/* 1. Navbar - Thinner */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 sm:px-12 py-2.5 flex items-center justify-between",
        isScrolled ? "bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md shadow-sm border-b border-[#e5eaef] dark:border-[#334155]" : "bg-transparent"
      )}>
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="h-8 w-8 bg-[#0085db] rounded-lg flex items-center justify-center shadow-lg shadow-[#0085db]/20 group-hover:rotate-12 transition-transform">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#2a3547] dark:text-white">Zauba<span className="text-[#0085db]">Insights</span></span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {["About", "Features", "Stats"].map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="text-[12px] font-bold text-[#707eae] hover:text-[#0085db] transition-colors relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0085db] transition-all group-hover:w-full" />
            </Link>
          ))}
          <div className="h-4 w-[1px] bg-[#e5eaef]" />
          <Link href="/login" className="text-[12px] font-bold text-[#2a3547] hover:text-[#0085db] transition-colors">Sign In</Link>
          <Link href="/register" className="h-8 px-4 bg-[#0085db] text-white text-[12px] font-bold rounded-lg flex items-center justify-center hover:bg-[#0074c0] hover:shadow-lg hover:shadow-[#0085db]/20 transition-all active:scale-95">
            Get Started
          </Link>
          <div className="h-4 w-[1px] bg-[#e5eaef] dark:bg-[#334155]" />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button className="text-[#2a3547] dark:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-white dark:bg-[#0f172a] p-8 flex flex-col gap-5 animate-in fade-in slide-in-from-top duration-300 md:hidden">
           <Link href="#about" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-[#2a3547] dark:text-[#e2e8f0]">About</Link>
           <Link href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-[#2a3547] dark:text-[#e2e8f0]">Features</Link>
           <Link href="#stats" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-[#2a3547] dark:text-[#e2e8f0]">Performance</Link>
           <hr className="border-[#e5eaef] dark:border-[#334155]" />
           <Link href="/login" className="text-lg font-bold text-[#0085db]">Sign In</Link>
           <Link href="/register" className="h-11 px-6 bg-[#0085db] text-white text-[13px] font-bold rounded-xl flex items-center justify-center">
             Get Started
           </Link>
        </div>
      )}

      {/* 2. Hero Section - Expanded & Dynamic */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 px-6 sm:px-12 overflow-hidden border-b border-[#e5eaef]/30 bg-white dark:bg-[#0f172a]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0085db]/5 blur-[100px] rounded-full animate-blob pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#13deb9]/5 blur-[100px] rounded-full animate-blob animation-delay-2000 pointer-events-none" />
        
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center reveal">
          <div className="animate-in fade-in slide-in-from-left duration-700">
             <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ecf2ff] border border-[#d1e1ff] rounded-full mb-4">
                <Zap size={12} className="text-[#0085db] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0085db]">Enterprise Protocol v2.5 Online</span>
             </div>
             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#2a3547] leading-[1.1] mb-5 tracking-tight">
                Industrial-Grade <span className="text-[#0085db]">Intelligence</span> Platform
             </h1>
             <p className="text-[#707eae] text-base sm:text-lg font-medium mb-8 leading-relaxed max-w-[500px]">
                Deploy high-precision extraction protocols for global company data. Our automated suite ensures 100% data integrity for top-tier architectural analysis.
             </p>
             <div className="flex flex-wrap items-center gap-3">
                <Link href="/register" className="h-12 px-8 bg-[#0085db] text-white text-[14px] font-bold rounded-xl flex items-center justify-center hover:bg-[#0074c0] hover:shadow-xl hover:shadow-[#0085db]/20 transition-all active:scale-95 group">
                   Get Started <ChevronRight size={18} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="#how-it-works" className="h-12 px-8 bg-white border border-[#e5eaef] text-[#2a3547] text-[14px] font-bold rounded-xl flex items-center justify-center hover:bg-[#f9fafb] transition-all active:scale-95">
                   How it Works
                </Link>
             </div>
             
             <div className="mt-10 flex items-center gap-6 opacity-70">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-[#f4f7fb] flex items-center justify-center text-[10px] font-bold text-[#707eae]">
                        U{i}
                     </div>
                   ))}
                </div>
                <div className="h-4 w-[1px] bg-[#e5eaef]" />
                <p className="text-[11px] font-bold text-[#707eae]">Used by 1,200+ Intelligence Officers</p>
             </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right duration-1000 delay-200 lg:ml-auto">
             <div className="relative rounded-[32px] overflow-hidden border border-[#e5eaef] bg-white shadow-2xl p-2 animate-float">
               <div className="bg-[#f4f7fb] rounded-[24px] aspect-video w-[350px] sm:w-[450px] lg:w-[500px] flex flex-col p-4 overflow-hidden relative group">
                  <div className="flex items-center gap-3 mb-5">
                     <div className="h-6 w-20 bg-[#0085db]/20 rounded-lg animate-pulse" />
                     <div className="h-6 w-24 bg-[#e5eaef] rounded-lg animate-pulse" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-5">
                     {Array.from({length:3}).map((_,i) => (
                       <div key={i} className="h-16 bg-white rounded-xl border border-[#e5eaef] animate-pulse transition-all group-hover:scale-105" style={{ animationDelay: `${i * 150}ms` }} />
                     ))}
                  </div>
                  <div className="flex-1 bg-white rounded-t-[24px] border-t border-x border-[#e5eaef] p-4">
                     <div className="space-y-3">
                        <div className="h-2 w-full bg-[#f4f7fb] rounded animate-pulse" />
                        <div className="h-2 w-[80%] bg-[#f4f7fb] rounded animate-pulse" />
                        <div className="h-2 w-[90%] bg-[#f4f7fb] rounded animate-pulse" />
                     </div>
                  </div>
                  {/* Floating Overlay Badge */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/50 backdrop-blur-xl border border-white/40 rounded-2xl p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform">
                     <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-[#0085db]" />
                        <span className="text-[10px] font-black uppercase text-[#2a3547]">Secure Payload Verified</span>
                     </div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. Stats Section - Compact Ribbon */}
      <section id="stats" className="py-8 bg-[#f4f7fb] dark:bg-[#1e293b] border-b border-[#e5eaef] dark:border-[#334155] reveal">
         <div className="max-w-[1100px] mx-auto px-6 sm:px-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { val: "50k+", label: "Entities Indexed", icon: Database },
              { val: "24/7", label: "Auto Guard", icon: Activity },
              { val: "99.9%", label: "System Uptime", icon: Zap },
              { val: "100%", label: "Data Integrity", icon: ShieldCheck },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 reveal-content" style={{ transitionDelay: `${i * 100}ms` }}>
                 <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-white flex items-center justify-center text-[#0085db] shadow-sm">
                    <stat.icon size={18} />
                 </div>
                 <div>
                    <h4 className="text-xl font-black text-[#2a3547] leading-none mb-0.5">{stat.val}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#707eae]">{stat.label}</p>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* 4. How it Works - NEW SECTION */}
      <section id="how-it-works" className="py-16 px-6 sm:px-12 bg-white dark:bg-[#0f172a] reveal">
         <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-12 reveal-content">
               <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0085db] mb-2">Operation Flow</h3>
               <h2 className="text-3xl font-black text-[#2a3547] tracking-tight">Three Stages of Intelligence</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
               {/* Connecting Line (Desktop) */}
               <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[2px] bg-[#f4f7fb] z-0" />
               
               {[
                 { step: "01", title: "Target Identification", desc: "Select company identifiers or CINs for prioritized extraction.", icon: Users },
                 { step: "02", title: "Neural Extraction", desc: "Our proprietary engine navigates source protocols to collect details.", icon: Zap },
                 { step: "03", title: "Refined Payload", desc: "Cleaned, structured data is delivered to your dashboard instantly.", icon: Layers },
               ].map((item, i) => (
                 <div key={i} className="relative z-10 text-center flex flex-col items-center reveal-content" style={{ transitionDelay: `${i * 200}ms` }}>
                    <div className="h-16 w-16 rounded-full bg-white border-2 border-[#f4f7fb] flex items-center justify-center text-[#0085db] mb-6 shadow-sm group hover:border-[#0085db] transition-colors relative">
                       <item.icon size={24} />
                       <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-[#0085db] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                          {item.step}
                       </div>
                    </div>
                    <h4 className="text-lg font-bold text-[#2a3547] mb-2">{item.title}</h4>
                    <p className="text-[#707eae] text-[13px] font-medium leading-relaxed max-w-[240px]">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 5. Features Section - Expanded Grid */}
      <section id="features" className="py-16 px-6 sm:px-12 bg-[#f9fafb] dark:bg-[#1e293b] border-y border-[#e5eaef] dark:border-[#334155] reveal">
         <div className="max-w-[1100px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center mb-12">
               <div className="lg:col-span-1 reveal-content">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0085db] mb-3">Core Modules</h3>
                  <h2 className="text-3xl font-black text-[#2a3547] dark:text-[#e2e8f0] mb-5 leading-tight tracking-tight">Built for Industrial Scale Intelligence</h2>
                  <p className="text-[#707eae] text-[14px] font-medium leading-relaxed mb-6">
                    Our infrastructure is designed to handle high-frequency requests without compromising data accuracy.
                  </p>
                  <Link href="/register" className="inline-flex items-center text-[13px] font-bold text-[#0085db] hover:underline">
                    Explore entire module suite <ArrowRight size={16} className="ml-1" />
                  </Link>
               </div>
               
               <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 reveal-content delay-300">
                  {[
                    { title: "Smart Adaptive Scraper", desc: "Self-healing algorithms for web changes.", icon: Zap },
                    { title: "Multi-Region Sync", desc: "Reliable distribution across cloud nodes.", icon: Globe },
                    { title: "Live Telemetry Feed", desc: "Monitor extraction health in real-time.", icon: BarChart3 },
                    { title: "Automated Verification", desc: "Ensures data matches source records.", icon: ShieldCheck },
                  ].map((feat, i) => (
                    <div key={i} className="bg-white dark:bg-[#0f172a] border border-[#e5eaef] dark:border-[#334155] p-5 rounded-2xl hover:border-[#0085db] hover:shadow-md transition-all group">
                       <div className="h-9 w-9 rounded-lg bg-[#f4f7fb] dark:bg-[#1e293b] flex items-center justify-center text-[#0085db] mb-4 group-hover:bg-[#0085db] group-hover:text-white transition-colors">
                          <feat.icon size={18} />
                       </div>
                       <h4 className="text-[15px] font-bold text-[#2a3547] mb-1">{feat.title}</h4>
                       <p className="text-[#707eae] text-[12px] font-medium leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 6. Security & Compliance - NEW SECTION */}
      <section id="security" className="py-16 px-6 sm:px-12 bg-white reveal">
         <div className="max-w-[1100px] mx-auto">
            <div className="bg-[#2a3547] rounded-[40px] p-10 lg:p-16 text-white overflow-hidden relative shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0085db]/20 blur-[60px] rounded-full pointer-events-none" />
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                  <div className="reveal-content">
                     <div className="h-10 w-10 rounded-xl bg-[#0085db] flex items-center justify-center mb-6">
                        <Lock size={20} className="text-white" />
                     </div>
                     <h2 className="text-3xl font-black mb-4">Secured Intelligence Protocol</h2>
                     <p className="text-white/70 text-[15px] font-medium leading-relaxed mb-8">
                       Your extractions and company insights are protected by military-grade encryption. We maintain strict compliance with data privacy standards.
                     </p>
                     <div className="grid grid-cols-2 gap-4">
                        {[
                          { val: "AES-256", label: "Encryption" },
                          { val: "SSL/TLS", label: "Transport" },
                          { val: "OIDC", label: "Authentication" },
                          { val: "24/7", label: "Monitoring" },
                        ].map((stat, i) => (
                           <div key={i} className="border-l border-white/20 pl-4">
                              <h4 className="text-xl font-black text-white">{stat.val}</h4>
                              <p className="text-[10px] font-black uppercase text-white/40">{stat.label}</p>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="reveal-content delay-200">
                     <div className="space-y-4">
                        {[
                          { title: "End-to-End Encryption", desc: "Data is encrypted from source to your dashboard." },
                          { title: "Activity Audit Logs", desc: "Every extraction step is logged and traceable." },
                          { title: "Compliance Ready", desc: "Built to adhere to regional data regulations." },
                        ].map((item, i) => (
                          <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors">
                             <div className="flex items-center gap-3 mb-1">
                                <CheckCircle2 size={16} className="text-[#0085db]" />
                                <h4 className="text-[15px] font-bold text-white">{item.title}</h4>
                             </div>
                             <p className="text-white/50 text-[12px] pl-7 leading-relaxed">{item.desc}</p>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 7. Professional Solutions - NEW SECTION */}
      <section id="solutions" className="py-16 px-6 sm:px-12 bg-[#f4f7fb] dark:bg-[#1e293b] reveal">
         <div className="max-w-[1100px] mx-auto text-center">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0085db] mb-2">Platform Access</h3>
            <h2 className="text-3xl font-black text-[#2a3547] dark:text-[#e2e8f0] mb-12">Professional Tiers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal-content">
               {[
                 { tier: "Individual", price: "Free", perks: ["50 Extractions/mo", "Basic Analytics", "Community Support"] },
                 { tier: "Business", price: "$49/mo", perks: ["5,000 Extractions/mo", "Advanced Telemetry", "Priority API Access"], featured: true },
                 { tier: "Enterprise", price: "Custom", perks: ["Unlimited Volume", "Custom Integrations", "Dedicated Support"] },
               ].map((plan, i) => (
                 <div key={i} className={cn(
                   "bg-white border rounded-[32px] p-8 flex flex-col items-center transition-all hover:translate-y-[-8px] shadow-sm",
                   plan.featured ? "border-[#0085db] shadow-xl shadow-[#0085db]/10 relative scale-105" : "border-[#e5eaef]"
                 )}>
                    {plan.featured && (
                      <div className="absolute top-0 -translate-y-1/2 px-4 py-1 bg-[#0085db] text-white text-[10px] font-black uppercase rounded-full">
                         Most Popular
                      </div>
                    )}
                    <h4 className="text-lg font-bold text-[#2a3547] dark:text-[#e2e8f0] mb-2">{plan.tier}</h4>
                    <div className="flex items-baseline gap-1 mb-6">
                       <span className="text-3xl font-black text-[#2a3547] dark:text-[#e2e8f0]">{plan.price}</span>
                    </div>
                    <ul className="space-y-3 mb-8 w-full text-center">
                       {plan.perks.map((perk, j) => (
                         <li key={j} className="text-[12px] font-medium text-[#707eae]">{perk}</li>
                       ))}
                    </ul>
                    <Link href="/register" className={cn(
                      "w-full h-11 rounded-xl font-bold text-[13px] flex items-center justify-center transition-all",
                      plan.featured ? "bg-[#0085db] text-white hover:bg-[#0074c0]" : "bg-[#f4f7fb] dark:bg-[#1e293b] text-[#2a3547] dark:text-[#e2e8f0] hover:bg-[#e5eaef] dark:hover:bg-[#334155]/20"
                    )}>
                       Select Tier
                    </Link>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 8. FAQ Section - NEW SECTION */}
      <section className="py-16 px-6 sm:px-12 bg-white dark:bg-[#0f172a] reveal">
         <div className="max-w-[700px] mx-auto">
            <div className="text-center mb-10 reveal-content">
               <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0085db] mb-2">Knowledge Base</h3>
               <h2 className="text-3xl font-black text-[#2a3547] dark:text-[#e2e8f0]">Common Inquiries</h2>
            </div>
            
            <div className="space-y-3 reveal-content">
               {[
                 { q: "Is the data sourced from ZaubaCorp official?", a: "We provide automated access to genuine company documentation matching official source records." },
                 { q: "How fast is the neural extraction engine?", a: "Typical payloads are processed and delivered in under 2 seconds depending on source load." },
                 { q: "Can I integrate the API into my CRM?", a: "Absolutely. Our REST protocol is designed for seamless integration with modern ERPs and CRMs." },
                 { q: "Do you support international company data?", a: "Currently focusing on exhaustive Indian company intelligence, with more regions planned." },
               ].map((faq, i) => (
                 <div key={i} className="border border-[#e5eaef] rounded-xl p-5 hover:border-[#0085db] transition-colors cursor-pointer group">
                    <h4 className="text-[14px] font-bold text-[#2a3547] mb-1 flex items-center justify-between">
                       {faq.q} <ChevronRight size={14} className="text-[#0085db] transition-transform group-hover:translate-x-1" />
                    </h4>
                    <p className="text-[#707eae] text-[12px] leading-relaxed group-hover:text-[#2a3547] transition-colors">{faq.a}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 9. CTA Section - Expanded */}
      <section className="py-14 px-6 sm:px-12 bg-[#f4f7fb] dark:bg-[#1e293b] reveal">
         <div className="max-w-[1100px] mx-auto bg-[#0085db] rounded-[48px] p-10 sm:p-20 text-center relative overflow-hidden shadow-2xl shadow-[#0085db]/20">
            <div className="absolute top-0 right-0 w-64 h-64 border-[32px] border-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 border-[24px] border-white/5 rounded-full -translate-x-1/3 translate-y-1/3" />
            <div className="relative z-10 reveal-content">
               <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight">Supercharge your intelligence network.</h2>
               <p className="text-white/80 text-base sm:text-lg font-medium mb-10 max-w-[550px] mx-auto leading-relaxed">Join 1,200+ professionals using industrial-grade tools for high-precision company documentation.</p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/register" className="h-14 px-10 bg-white text-[#0085db] text-[15px] font-black rounded-xl hover:shadow-2xl hover:scale-[1.05] transition-all active:scale-95 flex items-center gap-2">
                    Create Professional ID <ArrowRight size={18} />
                  </Link>
                  <Link href="/login" className="h-14 px-8 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[15px] font-bold rounded-xl hover:bg-white/20 transition-all active:scale-95">
                    View Internal Portal
                  </Link>
               </div>
            </div>
         </div>
      </section>

      {/* 10. Footer - Informative */}
      <footer className="py-12 bg-white dark:bg-[#0f172a] border-t border-[#e5eaef] dark:border-[#334155]">
         <div className="max-w-[1100px] mx-auto px-6 sm:px-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
               <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-6 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="h-8 w-8 bg-[#0085db] rounded-lg flex items-center justify-center shadow-lg shadow-[#0085db]/20">
                      <ShieldCheck size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold text-[#2a3547]">Zauba<span className="text-[#0085db]">Insights</span></span>
                  </div>
                  <p className="text-[#707eae] text-[13px] font-medium leading-relaxed max-w-[320px]">
                    The commercial standard for company data intelligence and automated extraction protocols. Built for architectural precision.
                  </p>
               </div>
               
               <div>
                  <h4 className="text-[12px] font-black uppercase tracking-widest text-[#2a3547] mb-6">Platform</h4>
                  <ul className="space-y-3">
                     {["Intelligence", "Scraper", "Analytics", "Security"].map(link => (
                       <li key={link}><Link href="#" className="text-[13px] font-bold text-[#707eae] hover:text-[#0085db] transition-colors">{link}</Link></li>
                     ))}
                  </ul>
               </div>
               
               <div>
                  <h4 className="text-[12px] font-black uppercase tracking-widest text-[#2a3547] mb-6">Company</h4>
                  <ul className="space-y-3">
                     {["About Protocol", "Support Hub", "Privacy", "Terms"].map(link => (
                       <li key={link}><Link href="#" className="text-[13px] font-bold text-[#707eae] hover:text-[#0085db] transition-colors">{link}</Link></li>
                     ))}
                  </ul>
               </div>
            </div>
            
            <div className="pt-8 border-t border-[#e5eaef] flex flex-col sm:flex-row items-center justify-between gap-6">
               <p className="text-[12px] font-bold text-[#707eae]">© 2026 ZaubaCorp Data Solutions. Professional Protocol.</p>
               <div className="flex items-center gap-6 text-[#707eae]">
                  <Link href="#" className="hover:text-[#0085db] transition-colors"><Globe size={18} /></Link>
                  <Link href="#" className="hover:text-[#0085db] transition-colors"><BarChart3 size={18} /></Link>
                  <Link href="#" className="hover:text-[#0085db] transition-colors"><Users size={18} /></Link>
               </div>
            </div>
         </div>
      </footer>      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob {
          0% { transform: scale(1) translate(0px, 0px); }
          33% { transform: scale(1.1) translate(30px, -50px); }
          66% { transform: scale(0.9) translate(-20px, 20px); }
          100% { transform: scale(1) translate(0px, 0px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-blob { animation: blob 8s infinite alternate; }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        
        .reveal { opacity: 0; transform: translateY(25px); transition: all 1s ease-out; }
        .reveal.reveal-visible { opacity: 1; transform: translateY(0); }
        .reveal-content { opacity: 0; transform: translateY(20px); transition: all 0.8s ease-out; }
        .reveal.reveal-visible .reveal-content { opacity: 1; transform: translateY(0); }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
        .overflow-x-hidden { overflow-x: hidden; }
      `}} />
    </div>
  );
}

