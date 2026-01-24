"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { performAIReview, type ReviewResult } from "@/lib/ai/ai-review-system"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"

interface AIReviewPanelProps {
  text: string
  language: string
  targetCulture?: string
}

export function AIReviewPanel({ text, language, targetCulture }: AIReviewPanelProps) {
  const [review, setReview] = useState<ReviewResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleReview = async () => {
    setLoading(true)
    try {
      const result = await performAIReview(text, language, targetCulture)
      setReview(result)
    } catch (error) {
      console.error("Review error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50"
      case "medium":
        return "text-yellow-600 bg-yellow-50"
      case "low":
        return "text-blue-600 bg-blue-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertCircle className="w-4 h-4" />
      case "medium":
        return <AlertTriangle className="w-4 h-4" />
      case "low":
        return <CheckCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleReview} disabled={loading} className="w-full">
        {loading ? "Reviewing..." : "Perform AI Review"}
      </Button>

      {review && (
        <div className="space-y-4">
          {/* Quality Score */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div
                  className={`text-4xl font-bold ${review.overallScore >= 80
                      ? "text-green-600"
                      : review.overallScore >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                >
                  {review.overallScore}%
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${review.overallScore >= 80
                        ? "bg-green-600"
                        : review.overallScore >= 60
                          ? "bg-yellow-600"
                          : "bg-red-600"
                      }`}
                    style={{ width: `${review.overallScore}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {review.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {review.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-blue-600 font-bold">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Grammar Errors */}
          {review.grammarErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Grammar & Spelling Issues</CardTitle>
                <CardDescription>{review.grammarErrors.length} issue(s) found</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {review.grammarErrors.map((error, idx) => (
                  <div key={idx} className={`border rounded-lg p-3 ${getSeverityColor(error.severity)}`}>
                    <div className="flex items-start gap-2">
                      {getSeverityIcon(error.severity)}
                      <div className="flex-1">
                        <p className="font-semibold text-sm capitalize">{error.type}</p>
                        <p className="text-sm mt-1">
                          <span className="line-through">{error.original}</span> →{" "}
                          <span className="font-semibold">{error.suggestion}</span>
                        </p>
                        <p className="text-xs mt-1 opacity-75">{error.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Compliance Issues */}
          {review.complianceIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Compliance & Sensitivity Issues</CardTitle>
                <CardDescription>{review.complianceIssues.length} issue(s) found</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {review.complianceIssues.map((issue, idx) => (
                  <div key={idx} className={`border rounded-lg p-3 ${getSeverityColor(issue.severity)}`}>
                    <div className="flex items-start gap-2">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <p className="font-semibold text-sm capitalize">{issue.type}</p>
                        <p className="text-sm mt-1">{issue.issue}</p>
                        <p className="text-sm mt-1">
                          Suggestion: <span className="font-semibold">{issue.suggestion}</span>
                        </p>
                      </div>
                    </div>
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
