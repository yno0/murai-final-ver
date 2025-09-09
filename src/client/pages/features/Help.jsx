import React, { useState } from 'react'
import { Mail, Phone, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'

export default function Help() {
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })

  const faqs = [
    {
      question: 'What is MURAi and how does it work?',
      answer:
        'MURAi is an advanced content monitoring system that helps detect and manage inappropriate content across various social media platforms. It uses AI to analyze content and provide real-time alerts for potential violations.',
    },
    {
      question: 'How do I set up content monitoring?',
      answer:
        "To set up content monitoring, navigate to the Detection page, click on 'Add New Monitor', and follow the setup wizard. You can select platforms, set keywords, and customize alert preferences.",
    },
    {
      question: 'What types of content can MURAi detect?',
      answer:
        'MURAi can detect various types of inappropriate content including harassment, hate speech, misinformation, and spam. The system is continuously updated to improve detection accuracy.',
    },
    {
      question: 'How do I manage detection alerts?',
      answer:
        'You can manage detection alerts through the Detection page. Here you can view all alerts, set priority levels, and customize notification settings for different types of content.',
    },
    {
      question: 'Can I export detection reports?',
      answer:
        'Yes, you can export detection reports in various formats. Go to the Reports section, select your desired date range and metrics, and click the Export button.',
    },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-3 py-2">
        <h1 className="text-2xl font-medium text-gray-900 mb-6">Help & Support</h1>
        <div className="border-b border-gray-200 -mx-3 mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-3">
              <Mail className="w-5 h-5 text-[#015763] mr-3" />
              <h3 className="text-sm font-medium text-gray-900">Email Support</h3>
            </div>
            <p className="text-sm text-gray-500">support@murai.com</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-3">
              <Phone className="w-5 h-5 text-[#015763] mr-3" />
              <h3 className="text-sm font-medium text-gray-900">Phone Support</h3>
            </div>
            <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-3">
              <MessageSquare className="w-5 h-5 text-[#015763] mr-3" />
              <h3 className="text-sm font-medium text-gray-900">Live Chat</h3>
            </div>
            <p className="text-sm text-gray-500">Available 24/7</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                  <button className="w-full text-left flex justify-between items-center" onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}>
                    <span className="text-sm font-medium text-gray-900">{faq.question}</span>
                    {expandedFaq === index ? <ChevronUp className="w-4 h-4 text-[#015763]" /> : <ChevronDown className="w-4 h-4 text-[#015763]" />}
                  </button>
                  {expandedFaq === index && <p className="mt-2 text-sm text-gray-500">{faq.answer}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-6">Contact Support</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2" required />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2" required />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea id="message" name="message" rows="4" value={formData.message} onChange={handleInputChange} className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015763] focus-visible:ring-offset-2" required />
              </div>
              <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[#015763] text-white hover:bg-[#015763]/90 h-10 px-4 py-2 w-full">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

