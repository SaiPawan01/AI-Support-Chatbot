import React, { useState } from 'react'

import features from '../../data/features.jsx'

function Features(){
    const [hoveredCard, setHoveredCard] = useState(null);

    return <>
    {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Everything you need to provide exceptional customer support powered by AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`p-8 rounded-xl border transition-all duration-300 ${
                  hoveredCard === idx
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20 transform scale-105'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="text-blue-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
}

export default Features