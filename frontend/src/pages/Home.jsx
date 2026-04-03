import { Link } from "react-router-dom";
import { ChevronRight, Zap, Shield, Users, Rocket } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-6 md:px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">aditya sen application</span>
        </div>

        <div className="hidden md:flex gap-8">
          <a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a>
          <a href="#benefits" className="text-white/70 hover:text-white transition-colors">Benefits</a>
          <a href="#contact" className="text-white/70 hover:text-white transition-colors">Contact</a>
        </div>

        <Link
          to="/login"
          className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-lg transition-all duration-200 hover:scale-105"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-white/80">Now Live on Production</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Secure Your
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Digital Identity
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl leading-relaxed">
          A modern authentication solution built for speed, security, and simplicity. 
          Join thousands of users who trust AuthApp for their digital security.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link
            to="/login"
            className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 flex items-center justify-center gap-2"
          >
            Get Started
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={() => alert("Demo coming soon!")}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl transition-all duration-300 hover:border-white/50"
          >
            Watch Demo
          </button>
        </div>

        {/* Social Proof */}
        <div className="text-center mb-16">
          <p className="text-white/60 text-sm mb-4">Trusted by leading companies</p>
          <div className="flex justify-center gap-8 items-center">
            {["Acme", "TechCorp", "StartUp Co", "Enterprise Inc"].map((company, i) => (
              <div key={i} className="text-white/40 font-semibold text-sm">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose AuthApp?
            </h2>
            <p className="text-white/60 text-lg">
              Powerful features designed for modern applications
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group p-8 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-xl group-hover:shadow-purple-500/50 transition-all">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Enterprise Security</h3>
              <p className="text-white/60">
                Military-grade encryption and advanced security protocols to protect your data.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group p-8 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-xl group-hover:shadow-pink-500/50 transition-all">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-white/60">
                Optimized infrastructure ensures sub-millisecond authentication response times.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group p-8 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-xl group-hover:shadow-indigo-500/50 transition-all">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Team Collaboration</h3>
              <p className="text-white/60">
                Easy user management and role-based access control for your entire team.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div id="benefits" className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Built for the Modern Web
              </h2>
              <div className="space-y-4">
                {[
                  { title: "OAuth 2.0 Support", desc: "Seamless integration with popular providers" },
                  { title: "Real-time Sessions", desc: "Instant session management and tracking" },
                  { title: "API First Design", desc: "RESTful APIs for maximum flexibility" },
                  { title: "24/7 Support", desc: "Dedicated support team always ready to help" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <p className="text-white/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl border border-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce">
                    <Rocket className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-white/60">Advanced Security Features</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div id="contact" className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center p-12 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-white/20 backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Join thousands of users who are already securing their digital identity with AuthApp.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105"
            >
              Get Started Now
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-12 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-white/60 text-sm">
          <p>&copy; 2026 AuthApp. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
