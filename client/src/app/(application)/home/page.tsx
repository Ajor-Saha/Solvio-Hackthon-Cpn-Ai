"use client";

// Clean slate – replace old StudyFlow content with the new CPN-AI landing sections
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  Shield,
  Users,
  TrendingUp,
  BookOpen,
  Target,
  CheckCircle,
  Star,
  Play,
  ChevronDown,
  Sparkles,
  Rocket,
  Network,
  Eye,
  Award,
  Coffee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Intersection-observer helper
const useInView = (threshold = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!ref) return;
    const obs = new IntersectionObserver(([e]) => setIsInView(e.isIntersecting), { threshold });
    obs.observe(ref);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return [setRef, isInView] as const;
};

// Animation presets
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export default function HomeLanding() {
  const { scrollYProgress } = useScroll();
  const [heroRef, heroInView] = useInView(0.1);
  const [featuresRef, featuresInView] = useInView(0.1);
  const [statsRef, statsInView] = useInView(0.1);
  const [testimonialsRef, testimonialsInView] = useInView(0.1);

  const yRange = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacityRange = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-10">
        <motion.div style={{ y: yRange, opacity: opacityRange }} className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800/20 to-slate-700/10 blur-3xl" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-slate-700/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-slate-600/15 rounded-full blur-2xl" />
        </motion.div>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 100 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-white/5 text-gray-300 border border-white/10">
              <Sparkles className="w-4 h-4 mr-2" /> Open Innovation Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Campus Projects & <span className="bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent">Proof Network</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-4xl mx-auto">
              The campus-wide OS where students collaborate, keep verifiable diaries and get AI-powered guidance via <span className="text-gray-200 font-semibold">ScholarPulse</span> & <span className="text-gray-200 font-semibold">CareerPulse</span>.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/signup">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 shadow-xl hover:scale-105 transition">
                  Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 px-8 py-4 backdrop-blur-sm">
                <Play className="mr-2 w-5 h-5" /> Watch Demo
              </Button>
            </div>
            {/* Stats */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto" variants={stagger} initial="initial" animate={heroInView ? 'animate' : 'initial'}>
              {[{ label: 'Active Projects', value: '2,500+', icon: Rocket }, { label: 'Research Papers', value: '15K+', icon: BookOpen }, { label: 'Success Rate', value: '94%', icon: Award }].map((s, i) => (
                <motion.div key={i} variants={fadeInUp} className="text-center">
                  <div className="flex items-center justify-center mb-2"><s.icon className="w-6 h-6 text-indigo-300 mr-2" /><span className="text-2xl font-bold">{s.value}</span></div>
                  <p className="text-gray-400">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" ref={featuresRef} className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 50 }} animate={featuresInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Revolutionary Campus <span className="bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent">Innovation</span></h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Five integrated pillars that transform how students learn, collaborate, and succeed.</p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" variants={stagger} initial="initial" animate={featuresInView ? 'animate' : 'initial'}>
            {[{ icon: Users, title: 'Project Execution & Proof', desc: 'Milestone-driven rooms with blockchain-verified diaries', list: ['Collaboration', 'Milestones', 'Supervisor reviews', 'Verifiable logs'] }, { icon: Brain, title: 'AI-Powered Learning', desc: 'Ask-Your-Library RAG and design helpers', list: ['Research assistance', 'Method comparison', 'Repro checks', 'Study planning'] }, { icon: TrendingUp, title: 'ScholarPulse Engine', desc: 'Research-trend analysis guiding next steps', list: ['Topic velocity', 'Collab targets', 'Grants', 'Focus map'] }, { icon: Target, title: 'CareerPulse Engine', desc: 'Job-market intelligence for personal skill paths', list: ['Demand analysis', 'Skill gaps', 'Portfolio planning', 'Company match'] }, { icon: Shield, title: 'Blockchain Integrity', desc: 'Immutable proof & provenance badges', list: ['Tamper-proof', 'Dataset/code hashes', 'Badges', 'Trust network'] }, { icon: Eye, title: 'Discovery & Outcomes', desc: 'Verified feed & project showcases', list: ['Portfolios', 'Achievement feed', 'Archive search', 'Impact tracking'] }].map((f, i) => (
              <motion.div key={i} variants={scaleIn}>
                <Card className="h-full bg-gradient-to-br from-slate-900/40 to-slate-800/40 backdrop-blur-xl border-white/10 hover:border-white/20 transition group hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-400/5 to-slate-300/5 opacity-0 group-hover:opacity-100 transition" />
                    <div className="relative z-10">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition"><f.icon className="w-6 h-6 text-indigo-300" /></div>
                        <h3 className="text-xl font-semibold">{f.title}</h3>
                      </div>
                      <p className="text-gray-300 mb-4">{f.desc}</p>
                      <ul className="space-y-2">
                        {f.list.map((li, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-400"><CheckCircle className="w-4 h-4 text-emerald-300 mr-2" />{li}</li>
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
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How <span className="bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent">CPN-AI</span> Works</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">A seamless flow from idea to career success</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[{ step: '01', title: 'Create Project Room', desc: 'Milestones, tasks & supervisor workflows', icon: Users }, { step: '02', title: 'Build & Document', desc: 'AI assistance & verifiable diary', icon: Brain }, { step: '03', title: 'Strategic Insights', desc: 'ScholarPulse & CareerPulse guidance', icon: TrendingUp }, { step: '04', title: 'Showcase & Succeed', desc: 'Publish verified achievements', icon: Award }].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4"><s.icon className="w-8 h-8 text-white" /></div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-sm font-bold text-gray-400">{s.step}</div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
                <p className="text-gray-300">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/20 to-slate-800/10 -z-10" />
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center" variants={stagger} initial="initial" animate={statsInView ? 'animate' : 'initial'}>
            {[{ value: '50K+', label: 'Students Empowered', icon: Users }, { value: '2.5K+', label: 'Active Projects', icon: Rocket }, { value: '94%', label: 'Success Rate', icon: TrendingUp }, { value: '15K+', label: 'Research Papers', icon: BookOpen }].map((s, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <s.icon className="w-8 h-8 text-indigo-300 mx-auto mb-4" />
                <div className="text-4xl font-bold mb-2">{s.value}</div>
                <div className="text-gray-300">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" ref={testimonialsRef} className="py-24 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 50 }} animate={testimonialsInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Success <span className="bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent">Stories</span></h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Real students, real results, real impact</p>
          </motion.div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={stagger} initial="initial" animate={testimonialsInView ? 'animate' : 'initial'}>
            {[{ name: 'Sarah Chen', role: 'CS PhD Student', uni: 'Stanford', quote: 'ScholarPulse helped me identify research gaps and publish 3 papers.' }, { name: 'Marcus Johnson', role: 'Engineering Student', uni: 'MIT', quote: 'The verifiable diary landed me an internship at Google.' }, { name: 'Dr. Priya Patel', role: 'Research Supervisor', uni: 'UC Berkeley', quote: 'Milestone tracking lets me guide 20+ projects effortlessly.' }].map((t, i) => (
              <motion.div key={i} variants={scaleIn}>
                <Card className="h-full bg-gradient-to-br from-slate-800/50 to-slate-700/40 backdrop-blur-xl border-white/10 hover:border-white/20 transition">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4"><div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-slate-600 rounded-full flex items-center justify-center text-white font-bold mr-4">{t.name.split(' ').map(n => n[0]).join('')}</div><div><h4 className="font-semibold">{t.name}</h4><p className="text-sm text-gray-400">{t.role}</p><p className="text-xs text-gray-400">{t.uni}</p></div></div>
                    <div className="flex mb-4">{Array(5).fill(0).map((_, idx) => <Star key={idx} className="w-4 h-4 text-yellow-400 fill-current" />)}</div>
                    <p className="text-gray-300 italic">"{t.quote}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 to-slate-800/20 -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your <span className="bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent">Academic Journey?</span></h2>
            <p className="text-xl text-gray-300 mb-8">Join thousands already building the future with CPN-AI.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup"><Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 shadow-xl hover:scale-105 transition">Start Free Trial <ArrowRight className="ml-2 w-5 h-5" /></Button></Link>
              <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 px-8 py-4 backdrop-blur-sm"><Coffee className="mr-2 w-5 h-5" /> Schedule Demo</Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
