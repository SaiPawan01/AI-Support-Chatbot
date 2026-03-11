import React from 'react'
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

function Navbar(){
    return <>
    {/* Navigation */}
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-white">SupportBot AI</span>
            </div>
            <div className="hidden md:flex gap-8">
              <a href="#benefits" className="text-slate-300 hover:text-white transition">Benefits</a>
              <a href="#features" className="text-slate-300 hover:text-white transition">Features</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition">Pricing</a>
            </div>
            <Link to='/login' className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
              Get Started 
            </Link>
          </div>
        </div>
      </nav>
    </>
}

export default Navbar