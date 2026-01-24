"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Lock, Users, FileText, Database, Mail, AlertTriangle, CheckCircle, Info } from "lucide-react"
import Header from "@/components/header"
import { useTranslation } from "@/components/language-context"

export default function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-semibold tracking-wider uppercase text-primary/70 mb-4">
            <Shield className="h-3 w-3" />
            Privacy Policy
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-4">
            Your Privacy Matters
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We built Doccoder to help you translate documents quickly and easily. Here&apos;s everything you need to know about how we protect your information.
          </p>
        </div>

        <div className="space-y-8">
          {/* Last Updated */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                Last updated: January 6, 2026
              </div>
            </CardContent>
          </Card>

          {/* What We Do */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                What is Doccoder?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Doccoder is an AI-powered tool that translates documents between different languages. We use advanced artificial intelligence to understand and translate your text while keeping your document&apos;s original formatting.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Simple Example:</strong> You upload a PDF contract in English, and we give you back the same contract translated to Spanish, with all the formatting, tables, and images preserved.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* What Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                What Information Do We Collect?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-700 dark:text-green-400">✓ Information You Give Us</h4>
                <ul className="space-y-2 text-muted-foreground ml-4">
                  <li>• Your email address and name (when you create an account)</li>
                  <li>• Documents you upload for translation</li>
                  <li>• Your preferences and settings</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-400">✓ Information We Collect Automatically</h4>
                <ul className="space-y-2 text-muted-foreground ml-4">
                  <li>• How you use our app (which features you click on)</li>
                  <li>• Your device type and browser information</li>
                  <li>• When and how often you use our service</li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Important:</strong> We never sell your personal information or documents to anyone. Your uploaded files are only used to provide the translation service you requested.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                How Do We Use Your Information?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-4">
                We use your information only to make our service work better for you:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">For Translation</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Process your documents to translate them</li>
                    <li>✓ Send you the translated results</li>
                    <li>✓ Improve translation quality over time</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">For Our Service</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Create and manage your account</li>
                    <li>✓ Send you important updates</li>
                    <li>✓ Fix problems and improve the app</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Protect Your Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                How Do We Protect Your Data?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your data security is extremely important to us. Here&apos;s how we protect it:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">🔒 Security Measures</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• All data is encrypted (scrambled) during transmission</li>
                    <li>• Your files are stored securely on protected servers</li>
                    <li>• We regularly test our security systems</li>
                    <li>• Only authorized staff can access your data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">🛡️ Our Promises</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• We never share your documents with third parties</li>
                    <li>• Your data is only used for your translations</li>
                    <li>• We delete temporary files after processing</li>
                    <li>• You control what happens to your account</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border-l-4 border-green-500">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Bank-Level Security:</strong> We use the same security standards that banks and major companies use to protect your information.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI and Your Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                How AI Works With Your Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our AI helps translate your documents, but we handle this process carefully:
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">🤖 What the AI Does</h4>
                  <p className="text-sm text-muted-foreground">
                    The AI reads your document, understands the meaning, and creates a translation in another language. It preserves formatting, tables, and images.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">🔄 Temporary Processing</h4>
                  <p className="text-sm text-muted-foreground">
                    Your documents are processed only when you request a translation. We don&apos;t keep them longer than necessary to complete your request.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">📈 Learning & Improvement</h4>
                  <p className="text-sm text-muted-foreground">
                    We may use general patterns from translations (not your specific documents) to make our AI better, but your personal information is never included.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* For Business Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Special Features for Business Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you use Doccoder for business purposes, we offer additional protections:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Business Protections</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Custom privacy agreements available</li>
                    <li>• Detailed activity logs for compliance</li>
                    <li>• Priority security monitoring</li>
                    <li>• Data processing agreements</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Compliance Support</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• GDPR compliance assistance</li>
                    <li>• Regular security audits</li>
                    <li>• System-grade data handling</li>
                    <li>• Custom security requirements</li>
                  </ul>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>For Organizations:</strong> Contact our systems team at systems@doccoder.com for special organizational privacy arrangements.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Rights & Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You have complete control over your data. Here are your rights:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">📋 What You Can Do</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• See what personal information we have about you</li>
                    <li>• Correct any inaccurate information</li>
                    <li>• Delete your account and all your data</li>
                    <li>• Download a copy of your data</li>
                    <li>• Stop us from using your data (in some cases)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">⚙️ How to Control Your Data</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Update your account settings anytime</li>
                    <li>• Opt out of non-essential emails</li>
                    <li>• Control cookie preferences in your browser</li>
                    <li>• Contact us to make changes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How Long We Keep Data */}
          <Card>
            <CardHeader>
              <CardTitle>How Long Do We Keep Your Data?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We keep your information only as long as needed:
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="font-medium">Your Account Information</span>
                  <span className="text-sm text-muted-foreground">Until you delete your account</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="font-medium">Translation History</span>
                  <span className="text-sm text-muted-foreground">30 days (unless you save it)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="font-medium">Usage Statistics</span>
                  <span className="text-sm text-muted-foreground">2 years (to improve our service)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="font-medium">Legal Records</span>
                  <span className="text-sm text-muted-foreground">As required by law</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Us */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Questions? Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Have questions about your privacy or want to exercise your rights? We&apos;re here to help!
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">General Questions</h4>
                  <p className="text-sm text-muted-foreground">
                    Email: privacy@doccoder.com<br />
                    Response: Usually within 48 hours
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Protection Officer</h4>
                  <p className="text-sm text-muted-foreground">
                    Email: dpo@doccoder.com<br />
                    For privacy rights and GDPR requests
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Organization Users:</strong> For systems privacy questions or custom agreements, email systems@doccoder.com
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to This Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Updates to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We may update this policy occasionally to reflect changes in our service or laws. When we make important changes, we&apos;ll:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• Send you an email notification</li>
                <li>• Show a notice in the app</li>
                <li>• Update this page with the new information</li>
              </ul>
              <p className="text-muted-foreground">
                Your continued use of Doccoder means you agree to the updated policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}