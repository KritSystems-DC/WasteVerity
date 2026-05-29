import CareMenuHeader from '@/components/CareMenuHeader'
import { useState } from 'react'

export default function CareMenuLanding() {
  const [residents, setResidents] = useState(100)
  const wastePerResident = 45 // £ per year in waste
  const savingsPercentage = 18
  const annualSavings = Math.round((residents * wastePerResident * 52) * (savingsPercentage / 100))

  return (
    <div className="bg-gray-50">
      <CareMenuHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Healthcare Food Service Management</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Compliance-ready tracking, waste reduction, and cost control for hospitals, care homes, and healthcare facilities
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Book a Demo
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <p className="text-gray-600">Healthcare Facilities</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">£12M+</div>
              <p className="text-gray-600">Food Costs Saved</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">98%</div>
              <p className="text-gray-600">Compliance Audit Pass Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Solutions */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Why Healthcare Facilities Choose CareMenu</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* HACCP Compliance */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">HACCP Compliance</h3>
              <p className="text-gray-600 mb-4">
                Automated HACCP documentation, temperature logging, and audit trails that are always ready for inspection.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ CQC and food safety ready</li>
                <li>✓ Automated audit reports</li>
                <li>✓ Real-time alerts</li>
              </ul>
            </div>

            {/* Waste Reduction */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Waste Reduction</h3>
              <p className="text-gray-600 mb-4">
                Track and reduce food waste by 15-20%, saving £20-30k annually per facility.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Daily waste tracking</li>
                <li>✓ Cost analysis</li>
                <li>✓ Benchmarking vs peers</li>
              </ul>
            </div>

            {/* Cost Control */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💷</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Cost Control</h3>
              <p className="text-gray-600 mb-4">
                Real-time food cost tracking, supplier audits, and budget forecasting.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Budget tracking</li>
                <li>✓ Supplier management</li>
                <li>✓ Cost per meal analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cost Savings Calculator */}
      <section className="bg-blue-50 py-20 border-y border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Calculate Your Annual Savings</h2>
          
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Number of Residents/Patients</label>
              <input
                type="range"
                min="20"
                max="500"
                value={residents}
                onChange={(e) => setResidents(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center text-2xl font-bold text-blue-600 mt-2">{residents}</div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Current Waste Cost</p>
                  <p className="text-2xl font-bold text-gray-900">£{(residents * wastePerResident * 52).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">per year</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Potential Savings</p>
                  <p className="text-2xl font-bold text-green-600">£{annualSavings.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{savingsPercentage}% reduction</p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-4">
                Plus improved compliance and staff retention
              </p>
            </div>

            <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Get Your Personalized Report
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Comprehensive Features</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'Real-Time Inventory', desc: 'Track stock levels, expiry dates, and supplier info instantly' },
              { title: 'Temperature Logging', desc: 'Automated temperature alerts for fridges, freezers, and storage' },
              { title: 'Staff Management', desc: 'Role-based access, staff requests, and compliance training tracking' },
              { title: 'Supplier Audits', desc: 'Track certifications, audits, and compliance documentation' },
              { title: 'Audit-Ready Reports', desc: 'Generate compliance reports for CQC, FSA, and internal audits' },
              { title: 'Mobile Access', desc: 'Access from any device, anytime, anywhere' },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="w-6 h-6 text-blue-600 font-bold flex-shrink-0">✓</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="bg-white py-20 border-y border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Real Results from Healthcare Leaders</h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-10 rounded-lg border border-blue-200">
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-yellow-400">★</span>)}
            </div>
            
            <blockquote className="text-lg text-gray-900 mb-6 italic">
              "CareMenu cut our food waste by 18% in the first 3 months. We saved nearly £28,000 that year. But more importantly, we passed our CQC audit on the first go—compliance is now automatic."
            </blockquote>
            
            <div className="flex items-center gap-4 border-t border-blue-200 pt-6">
              <div className="w-12 h-12 bg-blue-600 rounded-full"></div>
              <div>
                <p className="font-semibold text-gray-900">Sarah Mitchell</p>
                <p className="text-sm text-gray-600">Food Service Director, 85-Bed Care Home, East Sussex</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20" id="pricing">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">No hidden fees. Cancel anytime. 30-day free trial available.</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Starter</h3>
              <p className="text-gray-600 text-sm mb-6">For small facilities</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">£499</span>
                <span className="text-gray-600 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-gray-700">
                <li>✓ Up to 100 users</li>
                <li>✓ Inventory tracking</li>
                <li>✓ Basic compliance reports</li>
                <li>✓ Email support</li>
              </ul>
              <button className="w-full border-2 border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Professional (Recommended) */}
            <div className="bg-blue-600 text-white p-8 rounded-lg border-2 border-blue-600 transform scale-105">
              <div className="bg-yellow-400 text-blue-600 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">MOST POPULAR</div>
              <h3 className="text-xl font-bold mb-2">Professional</h3>
              <p className="text-blue-100 text-sm mb-6">For most healthcare facilities</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">£1,299</span>
                <span className="text-blue-100 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-blue-100">
                <li>✓ Unlimited users</li>
                <li>✓ Full compliance suite</li>
                <li>✓ Temperature logging</li>
                <li>✓ Audit report generation</li>
                <li>✓ Priority support</li>
              </ul>
              <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Enterprise</h3>
              <p className="text-gray-600 text-sm mb-6">For large networks</p>
              <div className="mb-6">
                <span className="text-2xl font-bold text-gray-900">Custom</span>
                <p className="text-gray-600 text-sm">Let's talk</p>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-gray-700">
                <li>✓ Multi-site integration</li>
                <li>✓ API access</li>
                <li>✓ Custom reporting</li>
                <li>✓ Dedicated support</li>
                <li>✓ SLA guarantee</li>
              </ul>
              <button className="w-full border-2 border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Food Service?</h2>
          <p className="text-xl text-blue-100 mb-8">Join 500+ healthcare facilities saving money and staying compliant.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Book a Demo Today
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Call: +44 (0) 123 456 7890
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">CareMenu</h3>
              <p className="text-sm">Healthcare food service management for compliance and cost control.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">HACCP Compliance</a></li>
                <li><a href="#" className="hover:text-white">Waste Reduction</a></li>
                <li><a href="#" className="hover:text-white">Cost Control</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 CareMenu Ltd. All rights reserved. | Compliance • Efficiency • Excellence</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
