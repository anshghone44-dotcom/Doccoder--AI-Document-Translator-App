'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Globe, FileSearch, BarChart3, Shield, Zap, FileType } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="DocTranslate Logo" className="h-10 w-auto" />
              <span className="text-2xl font-bold text-[#1e3a8a]">DocTranslate</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="#features">
                <span className="text-gray-600 hover:text-[#1e3a8a] cursor-pointer font-medium">Features</span>
              </Link>
              <Link href="#how-it-works">
                <span className="text-gray-600 hover:text-[#1e3a8a] cursor-pointer font-medium">How It Works</span>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-[#1e3a8a] text-white hover:bg-[#1e40af]">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-5xl font-bold text-[#1e3a8a] leading-tight">
              Translate & Summarize Documents with AI
            </h1>
            <p className="mb-8 text-xl text-gray-600 leading-relaxed">
              Professional document translation and summarization powered by OpenAI GPT-5 and Claude Sonnet.
              Support for PDF, DOCX, and TXT files.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/signup">
                <Button size="lg" className="bg-[#1e3a8a] text-white hover:bg-[#1e40af] px-8 py-6 text-lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-gray-50 px-8 py-6 text-lg">
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
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-[#1e3a8a]">Enterprise Features</h2>
            <p className="text-xl text-gray-600">Everything you need for professional document processing</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1e3a8a]">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Multi-Language Translation</h3>
              <p className="text-gray-600">Translate documents to any language with AI-powered accuracy and context preservation.</p>
            </Card>
            <Card className="border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1e3a8a]">
                <FileSearch className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Smart Summarization</h3>
              <p className="text-gray-600">Get concise summaries that capture key points and important details from lengthy documents.</p>
            </Card>
            <Card className="border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1e3a8a]">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Dual AI Models</h3>
              <p className="text-gray-600">Choose between OpenAI GPT-5 or Claude Sonnet for optimal results based on your needs.</p>
            </Card>
            <Card className="border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1e3a8a]">
                <FileType className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Multiple Formats</h3>
              <p className="text-gray-600">Support for PDF, DOCX, and TXT files. Process any document with ease.</p>
            </Card>
            <Card className="border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1e3a8a]">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Usage Analytics</h3>
              <p className="text-gray-600">Track your document processing history and view detailed usage statistics.</p>
            </Card>
            <Card className="border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1e3a8a]">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Secure & Private</h3>
              <p className="text-gray-600">Your documents are processed securely with enterprise-grade encryption.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-[#1e3a8a]">How It Works</h2>
            <p className="text-xl text-gray-600">Simple process, powerful results</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1e3a8a] text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Upload Document</h3>
              <p className="text-gray-600">Upload your PDF, DOCX, or TXT file to our secure platform.</p>
            </div>
            <div className="text-center">
              <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1e3a8a] text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Choose Operation</h3>
              <p className="text-gray-600">Select translation or summarization and pick your preferred AI model.</p>
            </div>
            <div className="text-center">
              <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1e3a8a] text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Get Results</h3>
              <p className="text-gray-600">Receive your processed document instantly with AI-powered accuracy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1e3a8a]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">Ready to Transform Your Documents?</h2>
          <p className="mb-8 text-xl text-gray-200">Join thousands of professionals using DocTranslate</p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-[#1e3a8a] hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>&copy; 2025 DocTranslate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}