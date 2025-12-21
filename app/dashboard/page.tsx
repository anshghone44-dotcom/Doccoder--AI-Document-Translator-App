'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, LogOut, BarChart3, Clock, CheckCircle, XCircle, Globe, FileSearch, Loader2, Book, Sparkles, AlertTriangle, Send } from 'lucide-react';

interface User {
  userId: string;
  email: string;
  name: string;
}

interface Document {
  documentId: string;
  fileName: string;
  operation: string;
  model: string;
  status: string;
  result: string;
  createdAt: string;
}

interface Stats {
  totalDocuments: number;
  completedDocuments: number;
  failedDocuments: number;
  translations: number;
  summaries: number;
  recentActivity: number;
  successRate: number;
}

interface ReviewPoint {
  original: string;
  translation: string;
  confidence: number;
  alternatives: string[];
  reason: string;
}

interface TranslationResult {
  translated_text: string;
  review_points: ReviewPoint[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [glossaryFile, setGlossaryFile] = useState<File | null>(null);
  const [operation, setOperation] = useState<'translate' | 'summarize' | 'ocr'>('translate');
  const [model, setModel] = useState<'gpt-5' | 'claude-sonnet'>('gpt-5');
  const [language, setLanguage] = useState('Spanish');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Result state
  const [result, setResult] = useState<string | TranslationResult | null>(null);

  // Interactive Edit state
  const [editInstruction, setEditInstruction] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // History state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Stats state
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setToken(session.access_token);
      // Ensure user is set (could fetch more details or just use session user)
      if (session.user) {
        setUser({
          userId: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User'
        });
      }
    };

    checkAuth();
  }, [router, supabase]);

  useEffect(() => {
    if (file) {
      const type = file.type || '';
      if (type.startsWith('image/')) {
        setOperation('ocr');
      } else if (operation === 'ocr') {
        setOperation('translate'); // Revert if not image
      }
    }
  }, [file]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError('');
      setResult(null);
    }
  };

  const handleGlossaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGlossaryFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!file || !token) return;

    setUploading(true);
    setUploadError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (glossaryFile) {
        formData.append('glossary', glossaryFile);
      }
      formData.append('operation', operation);
      formData.append('model', model);
      if (operation === 'translate') {
        formData.append('language', language);
      }

      // Refresh token ensures latest
      const { data: { session } } = await supabase.auth.getSession();
      const currentToken = session?.access_token || token;

      await processDocument(formData, currentToken);
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred');
      setUploading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!result || !token || !editInstruction) return;
    setIsEditing(true);

    try {
      // We need a way to pass the CURRENT content to edit.
      // For simplicity, we create a temporary file from the current result text.
      const currentText = typeof result === 'string' ? result : result.translated_text;
      const blob = new Blob([currentText], { type: 'text/plain' });
      const tempFile = new File([blob], "current_doc.txt", { type: 'text/plain' });

      const formData = new FormData();
      formData.append('file', tempFile);
      formData.append('operation', 'edit');
      formData.append('model', model);
      formData.append('instructions', editInstruction);

      const { data: { session } } = await supabase.auth.getSession();
      const currentToken = session?.access_token || token;

      await processDocument(formData, currentToken);
      setEditInstruction('');
    } catch (err: any) {
      setUploadError(err.message || "Edit failed");
    } finally {
      setIsEditing(false);
    }
  };

  const processDocument = async (formData: FormData, activeToken: string = token) => {
    const response = await fetch('/api/documents/process', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${activeToken}`,
      },
      credentials: 'include', // Supabase SSR relies on cookies
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    // Parse result if it's JSON
    let parsedResult = data.document.result;
    try {
      parsedResult = JSON.parse(data.document.result);
    } catch (e) {
      // It's a plain string
    }

    setResult(parsedResult);
    if (!isEditing) setFile(null); // Keep file if we want to re-process? Actually standard flow is clear it.

    // Refresh history and stats
    fetchHistory();
    fetchStats();
    setUploading(false);
  }

  const fetchHistory = async () => {
    if (!token) return;

    setLoadingHistory(true);
    try {
      const response = await fetch('/api/documents/history?page=1&limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchStats = async () => {
    if (!token) return;

    setLoadingStats(true);
    try {
      const response = await fetch('/api/documents/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchHistory();
      fetchStats();
    }
  }, [token]);

  // Render Helpers
  const renderResult = () => {
    if (!result) return null;

    const isStructured = typeof result !== 'string' && 'review_points' in result;
    const textContent = isStructured ? (result as TranslationResult).translated_text : (result as string);

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Processing completed</span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className={isStructured ? "md:col-span-2" : "md:col-span-3"}>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-[600px] overflow-y-auto font-mono text-sm leading-relaxed">
              <pre className="whitespace-pre-wrap text-gray-800">{textContent}</pre>
            </div>
          </div>

          {isStructured && (
            <div className="md:col-span-1 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" /> AI Review Points
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {(result as TranslationResult).review_points.map((point, idx) => (
                  <Card key={idx} className="p-3 bg-amber-50 border-amber-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-amber-800 uppercase">Confidence: {Math.round(point.confidence * 100)}%</span>
                      {point.confidence < 0.8 && <AlertTriangle className="h-3 w-3 text-amber-600" />}
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-1">"{point.original}" → "{point.translation}"</p>
                    <p className="text-xs text-gray-600 mb-2 italic">{point.reason}</p>
                    {point.alternatives.length > 0 && (
                      <div className="text-xs">
                        <span className="font-semibold text-gray-700">Alternatives:</span>
                        <ul className="list-disc list-inside text-gray-600">
                          {point.alternatives.map((alt, i) => <li key={i}>{alt}</li>)}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
                {(result as TranslationResult).review_points.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No specific issues flagged by AI.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Edit */}
        <div className="pt-4 border-t border-gray-200">
          <Label className="text-gray-700 font-medium mb-2 block">Make changes with AI</Label>
          <div className="flex gap-2">
            <Input
              value={editInstruction}
              onChange={(e) => setEditInstruction(e.target.value)}
              placeholder="e.g., 'Make the tone more formal', 'Fix the second paragraph'..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
            />
            <Button
              onClick={handleEditSubmit}
              disabled={isEditing || !editInstruction}
              className="bg-[#1e3a8a] text-white"
            >
              {isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Doccoder</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 font-medium">Welcome, {user.name}</span>
              <Button onClick={handleLogout} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Documents</p>
                <p className="text-3xl font-bold text-[#1e3a8a] mt-2">{stats?.totalDocuments || 0}</p>
              </div>
              <FileText className="h-10 w-10 text-[#1e3a8a] opacity-20" />
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Translations</p>
                <p className="text-3xl font-bold text-[#1e3a8a] mt-2">{stats?.translations || 0}</p>
              </div>
              <Globe className="h-10 w-10 text-[#1e3a8a] opacity-20" />
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Summaries</p>
                <p className="text-3xl font-bold text-[#1e3a8a] mt-2">{stats?.summaries || 0}</p>
              </div>
              <FileSearch className="h-10 w-10 text-[#1e3a8a] opacity-20" />
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-[#1e3a8a] mt-2">{stats?.successRate || 0}%</p>
              </div>
              <BarChart3 className="h-10 w-10 text-[#1e3a8a] opacity-20" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="upload" className="data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white">
              <Upload className="h-4 w-4 mr-2" />
              Process Document
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white">
              <Clock className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6 bg-white border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Process a Document</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="file" className="text-gray-700 font-medium">Upload File</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.txt,.csv,.xlsx,.jpg,.jpeg,.png,.webp"
                      required
                      className="mt-1 border-gray-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported: Text, PDF, DOCX, CSV, Excel. <br />
                      <span className="text-blue-600 font-medium">Images (JPG, PNG) supported for OCR/Scanning.</span>
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="operation" className="text-gray-700 font-medium">Operation</Label>
                    <Select value={operation} onValueChange={(value) => setOperation(value as 'translate' | 'summarize' | 'ocr')}>
                      <SelectTrigger className="mt-1 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="translate">Translate</SelectItem>
                        <SelectItem value="summarize">Summarize</SelectItem>
                        <SelectItem value="ocr">OCR / Image Scan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {operation === 'translate' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="language" className="text-gray-700 font-medium">Target Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="mt-1 border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                            <SelectItem value="German">German</SelectItem>
                            <SelectItem value="Chinese">Chinese</SelectItem>
                            <SelectItem value="Japanese">Japanese</SelectItem>
                            <SelectItem value="Arabic">Arabic</SelectItem>
                            <SelectItem value="Hindi">Hindi</SelectItem>
                            <SelectItem value="Portuguese">Portuguese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="glossary" className="text-gray-700 font-medium">Custom Glossary (Optional)</Label>
                        <Input
                          id="glossary"
                          type="file"
                          onChange={handleGlossaryChange}
                          accept=".csv,.xlsx,.txt"
                          className="mt-1 border-gray-300"
                        />
                        <p className="text-xs text-gray-500 mt-1">Upload a CSV/Excel file with terms to guide translation.</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="model" className="text-gray-700 font-medium">AI Model</Label>
                    <Select value={model} onValueChange={(value) => setModel(value as 'gpt-5' | 'claude-sonnet')}>
                      <SelectTrigger className="mt-1 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-5">OpenAI GPT-5 (Preview)</SelectItem>
                        <SelectItem value="claude-sonnet">Claude Sonnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {uploadError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {uploadError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={uploading || !file}
                    className="w-full bg-[#1e3a8a] text-white hover:bg-[#1e40af] h-11 text-base font-semibold"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Process Document'
                    )}
                  </Button>
                </form>
              </Card>

              <Card className="p-6 bg-white border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Result</h2>
                {result ? renderResult() : (
                  <div className="flex items-center justify-center h-64 text-gray-400">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p>Your processed document will appear here</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="p-6 bg-white border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Document History</h2>
              {loadingHistory ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" />
                </div>
              ) : documents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">File Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Operation</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Model</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.documentId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{doc.fileName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 capitalize">{doc.operation}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{doc.model === 'gpt-5' ? 'GPT-5' : 'Claude'}</td>
                          <td className="px-4 py-3 text-sm">
                            {doc.status === 'completed' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </span>
                            ) : doc.status === 'failed' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                <XCircle className="h-3 w-3 mr-1" />
                                Failed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Processing
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <div className="text-center">
                    <Clock className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>No documents processed yet</p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
