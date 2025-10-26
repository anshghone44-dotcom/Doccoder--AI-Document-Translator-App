"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { compareTranslations, type ComparisonResult } from "@/lib/text-comparison"

interface ComparisonViewProps {
  originalText: string
  translatedText: string
  targetLanguage?: string
}

export function ComparisonView({ originalText, translatedText, targetLanguage = "Spanish" }: ComparisonViewProps) {
  const [comparison, setComparison] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCompare = async () => {
    setLoading(true)
    try {
      const result = await compareTranslations(originalText, translatedText, targetLanguage)
      setComparison(result)
    } catch (error) {
      console.error("Comparison error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleCompare} disabled={loading} className="w-full">
        {loading ? "Analyzing..." : "Compare Translations"}
      </Button>

      {comparison && (
        <div className="space-y-4">
          {/* Overall Similarity */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Similarity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-blue-600">
                  {Math.round(comparison.overallSimilarity * 100)}%
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${comparison.overallSimilarity * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Segment Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Segment Analysis</CardTitle>
              <CardDescription>Side-by-side comparison of text segments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {comparison.segments.map((segment, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        segment.type === "added"
                          ? "bg-green-100 text-green-800"
                          : segment.type === "removed"
                            ? "bg-red-100 text-red-800"
                            : segment.type === "modified"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {segment.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">Similarity: {Math.round(segment.similarity * 100)}%</span>
                  </div>
                  {segment.original && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Original:</p>
                      <p className="text-sm">{segment.original}</p>
                    </div>
                  )}
                  {segment.translated && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Translation:</p>
                      <p className="text-sm">{segment.translated}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Changed Meanings */}
          {comparison.changedMeanings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Meaning Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {comparison.changedMeanings.map((change, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Synonym Alternatives */}
          {comparison.synonyms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Alternative Translations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {comparison.synonyms.map((syn, idx) => (
                  <div key={idx} className="border-l-2 border-blue-600 pl-3">
                    <p className="font-semibold text-sm">{syn.original}</p>
                    <p className="text-xs text-gray-600">{syn.alternatives.join(", ")}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
