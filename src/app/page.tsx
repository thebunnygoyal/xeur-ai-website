'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Play, Github, Linkedin, Mail, ExternalLink, Zap, Target, Rocket, Users, Code, Brain, Globe, Calendar, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface FormData {
  email: string;
  name: string;
  gameTypes: string;
  experience: string;
  [key: string]: string;
}

const XeurAIHomepage = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    gameTypes: '',
    experience: 'Beginner',
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent, type: string) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Successfully submitted!');
        setFormData({ email: '', name: '', gameTypes: '', experience: 'Beginner' });
      } else {
        toast.error(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const Navigation = () => (
    <motion.nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/95 backdrop-blur-md border-b border-secondary-950/20' : 'bg-transparent'
      }`}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-secondary-950 to-accent-950 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">X</span>
            </div>
            <span className="text-2xl font-bold font-heading bg-gradient-to-r from-secondary-400 to-accent-400 bg-clip-text text-transparent">
              XEUR.AI
            </span>
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'Technology', 'Vision', 'Team', 'Roadmap', 'Contact'].map((item, index) => (
              <motion.button
                key={item}
                onClick={() => setActiveSection(item.toLowerCase())}
                className={`text-sm font-medium transition-colors ${
                  activeSection === item.toLowerCase() 
                    ? 'text-accent-950' 
                    : 'text-gray-300 hover:text-accent-400'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item}
              </motion.button>
            ))}
          </div>
          
          <motion.button 
            className="bg-gradient-to-r from-secondary-600 to-accent-600 text-white px-6 py-2 rounded-lg font-medium hover:from-secondary-700 hover:to-accent-700 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSection('waitlist')}
          >
            Join Waitlist
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );

  const HomePage = () => (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-primary-950/20 to-black"></div>
        
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 left-20 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 w-128 h-128 bg-secondary-500/5 rounded-full blur-3xl"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 bg-secondary-500/20 border border-secondary-500/30 rounded-full text-secondary-300 text-sm font-medium mb-6">
              🇮🇳 Made in India, For the World
            </span>
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6 leading-tight font-heading"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-white via-secondary-200 to-accent-200 bg-clip-text text-transparent">
              Game Creation
            </span>
            <br />
            <span className="bg-gradient-to-r from-secondary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent animate-gradient">
              Just Went God Mode
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Create complete, production-ready games with a single prompt. 
            Transform any game idea into playable reality in under 60 minutes.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <motion.button 
              className="group bg-gradient-to-r from-secondary-600 to-accent-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-secondary-700 hover:to-accent-700 transition-all transform hover:scale-105 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5" />
              <span>Watch Technology Demo</span>
            </motion.button>
            
            <motion.button 
              className="border border-secondary-500/50 text-secondary-300 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-secondary-500/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection('waitlist')}
            >
              Join Early Access Waitlist
            </motion.button>
          </motion.div>
          
          {/* Stats Bar */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {[
              { value: '78,000+', label: 'Games Training Dataset', color: 'text-secondary-400' },
              { value: '60 Min', label: 'Creation Time', color: 'text-accent-400' },
              { value: 'Cross-Platform', label: 'Ready', color: 'text-blue-400' },
              { value: 'Made in India', label: '🇮🇳', color: 'text-orange-400' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              >
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-secondary-400" />
        </motion.div>
      </section>

      {/* Demo Video Section */}
      <section className="py-20 bg-black/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4 font-heading">See the Magic in Action</h2>
            <p className="text-xl text-gray-300">From Prompt to Playable Game: The XEUR.AI Revolution</p>
          </motion.div>
          
          <motion.div 
            className="relative max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="aspect-video bg-gradient-to-br from-secondary-900/30 to-accent-900/30 rounded-2xl border border-secondary-500/20 flex items-center justify-center glass-effect">
              <div className="text-center">
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Play className="w-8 h-8 text-white" />
                </motion.div>
                <p className="text-gray-300">YouTube Demo Video Placeholder</p>
                <p className="text-sm text-gray-400 mt-2">This is just the beginning. Join our alpha program.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Instant Creation',
                description: 'Transform any game idea into reality in minutes, not months. No coding, no technical barriers, just pure creativity unleashed.',
                gradient: 'from-secondary-900/20 to-transparent border-secondary-500/20'
              },
              {
                icon: Target,
                title: 'Production Quality',
                description: 'AI-generated games that rival professional studios. Built on Unreal Engine with cross-platform deployment capabilities.',
                gradient: 'from-accent-900/20 to-transparent border-accent-500/20'
              },
              {
                icon: Rocket,
                title: 'Limitless Genres',
                description: 'From racing games to RPGs, puzzle games to shooters. Any genre, any style, any vision - powered by our specialized AI models.',
                gradient: 'from-blue-900/20 to-transparent border-blue-500/20'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className={`bg-gradient-to-br ${item.gradient} rounded-2xl p-8 text-center glass-effect`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 font-heading">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <motion.section 
        className="py-12 bg-gradient-to-r from-secondary-900/10 to-accent-900/10 border-y border-secondary-500/20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-300 text-lg">
            Powered by partnerships with <span className="text-secondary-400 font-semibold">Epic Games</span> • 
            Backed by <span className="text-accent-400 font-semibold">Microsoft</span>, <span className="text-blue-400 font-semibold">NVIDIA</span>, <span className="text-red-400 font-semibold">Google</span> partnerships • 
            Building the future of game creation from India 🇮🇳
          </p>
        </div>
      </motion.section>

      {/* Early Access CTA */}
      <section className="py-20 bg-gradient-to-br from-secondary-900/30 to-accent-900/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4 font-heading">Join the Game Creation Revolution</h2>
            <p className="text-xl text-gray-300 mb-8">Limited alpha access starting Q2 2025</p>
            
            <motion.div 
              className="bg-black/50 border border-secondary-500/20 rounded-2xl p-8 max-w-md mx-auto glass-effect"
              whileHover={{ scale: 1.02 }}
            >
              <form onSubmit={(e) => handleSubmit(e, 'waitlist')} className="space-y-4">
                <input 
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-accent-500 focus:outline-none transition-colors"
                  required
                />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-accent-500 focus:outline-none transition-colors"
                  required
                />
                <select 
                  value={formData.gameTypes}
                  onChange={(e) => setFormData({...formData, gameTypes: e.target.value})}
                  className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-accent-500 focus:outline-none transition-colors"
                  required
                >
                  <option value="">What type of games do you want to create?</option>
                  <option value="Action/Adventure">Action/Adventure</option>
                  <option value="RPG">RPG</option>
                  <option value="Puzzle">Puzzle</option>
                  <option value="Racing">Racing</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Other">Other</option>
                </select>
                <motion.button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-secondary-600 to-accent-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-secondary-700 hover:to-accent-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {isLoading ? 'Joining...' : 'Secure My Early Access'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />
      <HomePage />
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">X</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-secondary-400 to-accent-400 bg-clip-text text-transparent font-heading">
                  XEUR.AI
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Revolutionizing game creation with AI. Made in India for the World.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-secondary-400 transition-colors">Platform</a></li>
                <li><a href="#" className="hover:text-secondary-400 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-secondary-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-secondary-400 transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-secondary-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-secondary-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-secondary-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-secondary-400 transition-colors">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="https://github.com/cpg-xeur-ai" className="hover:text-secondary-400 transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-secondary-400 transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-secondary-400 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-secondary-400 transition-colors">YouTube</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 XEUR.AI. All rights reserved. Made in India 🇮🇳 for the World 🌍</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default XeurAIHomepage;