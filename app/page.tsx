'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Globe, FileSearch, BarChart3, Shield, Zap, FileType } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="DocTranslate Logo" className="h-10 w-auto" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Doccoder</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="#features">
                <span className="text-gray-600 hover:text-gray-900 cursor-pointer font-medium transition-colors">Features</span>
              </Link>
              <Link href="#how-it-works">
                <span className="text-gray-600 hover:text-gray-900 cursor-pointer font-medium transition-colors">How It Works</span>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 opacity-70"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-full">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">AI-Powered Document Transformation</span>
            </div>
            
            <h1 className="mb-6 text-6xl font-bold leading-tight">
              <span className="text-gray-900">Transform Documents</span>
              <br />
              <span className="text-gray-900">with </span>
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">AI Intelligence</span>
            </h1>
            
            <p className="mb-10 text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Convert between PDF and 11+ formats instantly. Upload files, customize templates, and download in seconds. Powered by advanced AI technology.
            </p>
            
            <div className="flex justify-center space-x-4">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 px-10 py-7 text-lg shadow-xl hover:shadow-2xl transition-all font-semibold">
                  Start Converting
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-10 py-7 text-lg font-semibold">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-5xl font-bold text-gray-900">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need for professional document conversion</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-gray-100 p-8 hover:shadow-xl hover:border-blue-100 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg">
                <FileType className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Multiple Formats</h3>
              <p className="text-gray-600 leading-relaxed">Convert to PDF, Word, Excel, JSON, XML, Markdown, RTF, and more.</p>
            </Card>
            <Card className="border-gray-100 p-8 hover:shadow-xl hover:border-blue-100 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Custom Templates</h3>
              <p className="text-gray-600 leading-relaxed">Choose from Minimal, Professional, or Photo templates with adjustable margins.</p>
            </Card>
            <Card className="border-gray-100 p-8 hover:shadow-xl hover:border-blue-100 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Instant Processing</h3>
              <p className="text-gray-600 leading-relaxed">Fast AI-powered conversion with real-time preview and editing capabilities.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-5xl font-bold text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to transform your documents</p>
          </div>
          <div className="grid gap-12 md:grid-cols-3 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200"></div>
            
            <div className="text-center relative">
              <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl font-bold text-white shadow-xl relative z-10">
                1
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Upload</h3>
              <p className="text-gray-600 leading-relaxed">Select files or drag and drop to upload</p>
            </div>
            
            <div className="text-center relative">
              <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-2xl font-bold text-white shadow-xl relative z-10">
                2
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Customize</h3>
              <p className="text-gray-600 leading-relaxed">Choose format, template, and settings</p>
            </div>
            
            <div className="text-center relative">
              <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 text-2xl font-bold text-white shadow-xl relative z-10">
                3
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Download</h3>
              <p className="text-gray-600 leading-relaxed">Get your converted file instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-4 text-5xl font-bold text-white">Ready to Transform Your Documents?</h2>
          <p className="mb-8 text-xl text-blue-50">Start converting files with AI intelligence today</p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-10 py-7 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all">
              Get Started Now
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-4 flex justify-center">
            <img src="/logo.png" alt="DocTranslate Logo" className="h-8 w-auto opacity-60" />
          </div>
          <p className="text-gray-500">&copy; 2025 Doccoder. All rights reserved. Powered by AI.</p>
        </div>
      </footer>
    </div>
  );
}