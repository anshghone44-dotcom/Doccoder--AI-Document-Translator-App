"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getGlossaryEntries,
  addGlossaryEntry,
  deleteGlossaryEntry,
  searchGlossary,
  type GlossaryEntry,
} from "@/lib/retrieval/glossary-manager"
import { Trash2, Plus, Search } from "lucide-react"

interface GlossaryManagerProps {
  userId: string
  languagePair?: string
}

export function GlossaryManager({ userId, languagePair = "en-es" }: GlossaryManagerProps) {
  const [entries, setEntries] = useState<GlossaryEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [newTerm, setNewTerm] = useState("")
  const [newTranslation, setNewTranslation] = useState("")
  const [loading, setLoading] = useState(false)

  const loadGlossary = async () => {
    setLoading(true)
    const data = await getGlossaryEntries(userId, languagePair)
    setEntries(data)
    setLoading(false)
  }

  useEffect(() => {
    loadGlossary()
  }, [userId, languagePair])

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.trim()) {
      const results = await searchGlossary(userId, term)
      setEntries(results)
    } else {
      loadGlossary()
    }
  }

  const handleAddEntry = async () => {
    if (!newTerm.trim() || !newTranslation.trim()) return

    const result = await addGlossaryEntry(userId, {
      term: newTerm,
      translation: newTranslation,
      languagePair,
    })

    if (result.success) {
      setNewTerm("")
      setNewTranslation("")
      loadGlossary()
    }
  }

  const handleDeleteEntry = async (entryId: string | undefined) => {
    if (!entryId) return

    const result = await deleteGlossaryEntry(entryId)
    if (result.success) {
      loadGlossary()
    }
  }

  return (
    <div className="space-y-4">
      {/* Add New Entry */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Term</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Original term"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Translation"
              value={newTranslation}
              onChange={(e) => setNewTranslation(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddEntry} disabled={!newTerm || !newTranslation}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input placeholder="Search glossary..." value={searchTerm} onChange={handleSearch} className="pl-10" />
      </div>

      {/* Glossary Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Glossary Entries</CardTitle>
          <CardDescription>{entries.length} term(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-gray-500">No entries yet. Add your first term above.</p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{entry.term}</p>
                    <p className="text-sm text-gray-600">{entry.translation}</p>
                    {entry.context && <p className="text-xs text-gray-500 mt-1">Context: {entry.context}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
