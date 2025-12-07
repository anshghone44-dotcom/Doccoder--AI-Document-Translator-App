'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, LogOut, BarChart3, Clock, CheckCircle, XCircle, Globe, FileSearch, Loader2 } from 'lucide-react';

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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState<'translate' | 'summarize'>('translate');
  const [model, setModel] = useState<'gpt-5' | 'claude-sonnet'>('gpt-5');
  const [language, setLanguage] = useState('Spanish');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [result, setResult] = useState('');

  // History state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Stats state
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    // Check authentication
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
      router.push('/login');
      return;
    }

    setToken(storedToken);
    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError('');
      setResult('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !token) return;

    setUploading(true);
    setUploadError('');
    setResult('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('operation', operation);
      formData.append('model', model);
      if (operation === 'translate') {
        formData.append('language', language);
      }

      const response = await fetch('/api/documents/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data.document.result);
      setFile(null);
      
      // Refresh history and stats
      fetchHistory();
      fetchStats();
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

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
              <img src="/logo.png" alt="DocTranslate Logo" className="h-10 w-auto" />
              <span className="text-2xl font-bold text-[#1e3a8a]">DocTranslate</span>
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
              Upload Document
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">Process Document</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="file" className="text-gray-700 font-medium">Upload File</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.txt"
                      required
                      className="mt-1 border-gray-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">Supported: PDF, DOCX, TXT</p>
                  </div>

                  <div>
                    <Label htmlFor="operation" className="text-gray-700 font-medium">Operation</Label>
                    <Select value={operation} onValueChange={(value) => setOperation(value as 'translate' | 'summarize')}>
                      <SelectTrigger className="mt-1 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="translate">Translate</SelectItem>
                        <SelectItem value="summarize">Summarize</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {operation === 'translate' && (
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
                  )}

                  <div>
                    <Label htmlFor="model" className="text-gray-700 font-medium">AI Model</Label>
                    <Select value={model} onValueChange={(value) => setModel(value as 'gpt-5' | 'claude-sonnet')}>
                      <SelectTrigger className="mt-1 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-5">OpenAI GPT-5</SelectItem>
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
                {result ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Processing completed</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700">{result}</pre>
                    </div>
                  </div>
                ) : (
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
