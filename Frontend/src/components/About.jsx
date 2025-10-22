import React from 'react'

const About = () => {
  return (
     <section
      id="about"
      className="py-24 px-6 text-center max-w-5xl mx-auto"
      style={{ fontFamily: "'Inter', sans-serif" }} // Modern Sans-Serif
    >
      {/* Heading */}
      <p className="text-5xl md:text-5xl font-light text-yellow-400 mb-8 tracking-tight">
        About Us
      </p>

      {/* Body Content */}
      <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto space-y-4">
        <span className="font-semibold text-white block mb-2">
          We're Not Just Upgrading HR. We're Redefining It.
        </span>
        The world of work has changed forever. The tools that manage our most valuable asset—our people—must not only keep up; they must lead the way. At <span className="font-medium text-yellow-300">SmartHRX®</span>, we believe the future of HR isn't about more paperwork, it's about more potential. It's not about administration, it's about intelligence.<br/><br/>
        
        <strong className="font-semibold text-white">Hire Smarter & Faster </strong> Our Talent Acquisition module uses AI to source the best candidates, automate screening, and predict hiring success, reducing time-to-hire by up to 50%.<br/><br/>
        <strong className="font-semibold text-white">Develop & Retain Your Best People </strong> Move from annual reviews to continuous growth. Our platform provides AI-driven performance insights, personalized learning recommendations, and predictive flight-risk analysis to help you keep your top performers engaged.<br/><br/>
        <strong className="font-semibold text-white">Make Data-Driven Strategic Decisions </strong> Stop guessing. Our analytics dashboard provides real-time insights into everything from employee sentiment and engagement to compensation benchmarks and diversity metrics.<br/><br/>
        <strong className="font-semibold text-white">Boost Employee Experience </strong> Provide your team with a simple, intuitive platform for everything they need—from requesting time off with a single click to getting instant answers from an AI-powered HR helpdesk.
      </p>
    </section>
  )
}

export default About
