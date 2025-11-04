'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  Shield,
  Zap,
  Users,
  TrendingUp,
  BookOpen,
  Target,
  CheckCircle,
  Star,
  Play,
  ChevronDown,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Sparkles,
  Rocket,
  Network,
  Eye,
  Award,
  Coffee,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Custom hook for intersection observer
const useInView = (threshold = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return [setRef, isInView] as const;
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5 }
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const [heroRef, heroInView] = useInView(0.1);
  const [featuresRef, featuresInView] = useInView(0.1);
  const [statsRef, statsInView] = useInView(0.1);
  const [testimonialsRef, testimonialsInView] = useInView(0.1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const yRange = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacityRange = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white overflow-hidden">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10 supports-backdrop-blur:bg-black/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              CPN-AI
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors hover:scale-105">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors hover:scale-105">How It Works</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors hover:scale-105">Success Stories</a>
            <Link href="/home" className="text-gray-300 hover:text-white transition-colors hover:scale-105">Platform</Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <Link href="/signin">
                <Button variant="ghost" className="text-white hover:bg-white/10 text-sm sm:text-base px-3 sm:px-4">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-sm sm:text-base px-3 sm:px-6 hover:scale-105 transition-transform">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-white/10 p-6"
            >
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-gray-300 hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-gray-300 hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </a>
                <a
                  href="#testimonials"
                  className="text-gray-300 hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Success Stories
                </a>
                <Link
                  href="/home"
                  className="text-gray-300 hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Platform
                </Link>
                <div className="flex flex-col space-y-3 pt-4 border-t border-white/10">
                  <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="text-white hover:bg-white/10 w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20">
        <motion.div
          style={{ y: yRange, opacity: opacityRange }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-3xl" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/30 rounded-full blur-2xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-500" />

          {/* Floating particles */}
          <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-300" />
          <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-700" />
          <div className="absolute top-1/2 left-1/5 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-1000" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Open Innovation Platform
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Campus Projects &{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Proof Network
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              The ultimate campus-wide OS where students collaborate on projects,
              maintain verifiable progress diaries, and get AI-powered strategic guidance
              through <span className="text-purple-400 font-semibold">ScholarPulse</span> & <span className="text-cyan-400 font-semibold">CareerPulse</span> engines.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-lg px-8 py-4 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Hero Stats */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
              variants={staggerContainer}
              initial="initial"
              animate={heroInView ? "animate" : "initial"}
            >
              {[
                { label: "Active Projects", value: "2,500+", icon: Rocket },
                { label: "Research Papers", value: "15K+", icon: BookOpen },
                { label: "Success Rate", value: "94%", icon: Award }
              ].map((stat, idx) => (
                <motion.div key={idx} variants={fadeInUp} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-purple-400 mr-2" />
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
          </div>
                  <p className="text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
            </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </motion.div>
      </section>

      {/* Core Features Section */}
      <section id="features" ref={featuresRef} className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Revolutionary Campus
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> Innovation</span>
                </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Five integrated pillars that transform how students learn, collaborate, and succeed
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate={featuresInView ? "animate" : "initial"}
          >
            {[
              {
                icon: Users,
                title: "Project Execution & Proof",
                description: "Milestone-driven project rooms with supervisor workflows and blockchain-verified progress diaries",
                features: ["Real-time collaboration", "Milestone tracking", "Supervisor approvals", "Verifiable logs"]
              },
              {
                icon: Brain,
                title: "AI-Powered Learning",
                description: "Ask-Your-Library RAG system, design helpers, and course-aware study acceleration",
                features: ["Smart research assistance", "Method comparisons", "Reproducibility checks", "Study planning"]
              },
              {
                icon: TrendingUp,
                title: "ScholarPulse Engine",
                description: "Research trend analysis that guides what to study, build, and publish next",
                features: ["Topic velocity tracking", "Collaboration targets", "Grant opportunities", "Focus mapping"]
              },
              {
                icon: Target,
                title: "CareerPulse Engine",
                description: "Job market intelligence that creates personalized skill development paths",
                features: ["Market demand analysis", "Skill gap identification", "Portfolio planning", "Company matching"]
              },
              {
                icon: Shield,
                title: "Blockchain Integrity",
                description: "Immutable proof of research provenance, submission integrity, and achievement verification",
                features: ["Tamper-proof records", "Research provenance", "Achievement badges", "Trust network"]
              },
              {
                icon: Eye,
                title: "Discovery & Outcomes",
                description: "Verified campus feed, searchable archives, and credible project showcases",
                features: ["Project portfolios", "Achievement feed", "Archive search", "Impact tracking"]
              }
            ].map((feature, idx) => (
              <motion.div key={idx} variants={scaleIn}>
                <Card className="h-full bg-gradient-to-br from-gray-900/30 to-gray-800/30 backdrop-blur-xl border-gray-700/30 hover:border-purple-500/50 transition-all duration-500 group hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2">
                  <CardContent className="p-6 relative overflow-hidden">
                    {/* Hover gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                          <feature.icon className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-white group-hover:text-purple-200">{feature.title}</h3>
                      </div>
                      <p className="text-gray-300 mb-4 group-hover:text-gray-200">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.features.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-center text-sm text-gray-400 group-hover:text-gray-300">
                            <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 group-hover:text-green-300" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gradient-to-r from-gray-900/30 to-gray-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">CPN-AI</span> Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A seamless flow from project inception to career success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Create Project Room",
                description: "Set up collaborative spaces with milestones, tasks, and supervisor workflows",
                icon: Users
              },
              {
                step: "02",
                title: "Build & Document",
                description: "Work with AI assistance while maintaining a verifiable progress diary",
                icon: Brain
              },
              {
                step: "03",
                title: "Get Strategic Insights",
                description: "Receive guidance from ScholarPulse and CareerPulse engines",
                icon: TrendingUp
              },
              {
                step: "04",
                title: "Showcase & Succeed",
                description: "Publish verified achievements and discover new opportunities",
                icon: Award
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-sm font-bold text-purple-400">
                    {step.step}
              </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </motion.div>
            ))}
            </div>
          </div>
        </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-cyan-900/20" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            variants={staggerContainer}
            initial="initial"
            animate={statsInView ? "animate" : "initial"}
          >
            {[
              { value: "50K+", label: "Students Empowered", icon: Users },
              { value: "2.5K+", label: "Active Projects", icon: Rocket },
              { value: "94%", label: "Success Rate", icon: TrendingUp },
              { value: "15K+", label: "Research Papers", icon: BookOpen }
            ].map((stat, idx) => (
              <motion.div key={idx} variants={fadeInUp}>
                <div className="flex items-center justify-center mb-4">
                  <stat.icon className="w-8 h-8 text-purple-400 mr-3" />
                      </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
                    </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" ref={testimonialsRef} className="py-24 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Success <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Stories</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real students, real results, real impact
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate={testimonialsInView ? "animate" : "initial"}
          >
            {[
              {
                name: "Sarah Chen",
                role: "CS PhD Student",
                university: "Stanford University",
                quote: "CPN-AI's ScholarPulse helped me identify emerging research gaps. I published 3 papers in top-tier conferences using their strategic insights.",
                rating: 5,
                avatar: "SC"
              },
              {
                name: "Marcus Johnson",
                role: "Engineering Student",
                university: "MIT",
                quote: "The verifiable project diary was a game-changer. Recruiters loved seeing my authenticated progress, and I landed my dream internship at Google.",
                rating: 5,
                avatar: "MJ"
              },
              {
                name: "Dr. Priya Patel",
                role: "Research Supervisor",
                university: "UC Berkeley",
                quote: "Managing 20+ student projects became effortless. The milestone tracking and AI insights help me guide students more effectively.",
                rating: 5,
                avatar: "PP"
              }
            ].map((testimonial, idx) => (
              <motion.div key={idx} variants={scaleIn}>
                <Card className="h-full bg-gradient-to-br from-gray-800/50 to-gray-700/50 border-gray-600/50 hover:border-purple-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{testimonial.name}</h4>
                        <p className="text-sm text-gray-400">{testimonial.role}</p>
                        <p className="text-xs text-purple-400">{testimonial.university}</p>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {Array(testimonial.rating).fill(0).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </motion.div>
          </div>
        </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> Academic Journey?</span>
              </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of students already building the future with CPN-AI
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-lg px-8 py-4 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 group">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
                Schedule Demo
                <Coffee className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Button>
            </div>
          </motion.div>
          </div>
        </section>

      {/* Footer */}
      <footer className="bg-gray-900/80 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Network className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  CPN-AI
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Campus Projects & Proof Network - Where innovation meets verification.
              </p>
              <div className="flex space-x-4">
                <Github className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Globe className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                  </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                    </ul>
                </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                  </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CPN-AI. All rights reserved. Built with ❤️ for the future of education.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
