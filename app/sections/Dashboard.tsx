'use client'

import React, { useState } from 'react'
import {
  HiOutlineDocumentText,
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineEye,
} from 'react-icons/hi2'
import { FiGitBranch } from 'react-icons/fi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface SavedSpec {
  id: string
  spec_title: string
  repoUrl: string
  createdAt: string
  status: 'draft' | 'final'
  executive_summary: string
  data: Record<string, any>
  artifactFiles?: Array<{ file_url: string; name: string; format_type: string }>
}

interface DashboardProps {
  specifications: SavedSpec[]
  onViewSpec: (spec: SavedSpec) => void
  onDeleteSpec: (id: string) => void
  onNewSpec: () => void
}

export default function Dashboard({
  specifications,
  onViewSpec,
  onDeleteSpec,
  onNewSpec,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = specifications.filter((spec) => {
    const q = searchQuery.toLowerCase()
    if (!q) return true
    return (
      (spec.spec_title ?? '').toLowerCase().includes(q) ||
      (spec.repoUrl ?? '').toLowerCase().includes(q) ||
      (spec.executive_summary ?? '').toLowerCase().includes(q)
    )
  })

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (specifications.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <HiOutlineDocumentText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-1 text-lg font-semibold text-foreground">No specifications yet</h2>
          <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Create your first feature specification by analyzing a GitHub repository. The AI will extract requirements, draft sections, and format a complete document.
          </p>
          <Button onClick={onNewSpec} className="gap-1.5">
            <HiOutlinePlus className="h-4 w-4" />
            Create First Specification
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-foreground">Your Specifications</h1>
        <p className="text-sm text-muted-foreground">Manage and review your generated feature specifications.</p>
      </div>

      <div className="relative mb-5">
        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search specifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {sorted.length === 0 && searchQuery && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">No specifications match your search.</p>
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-260px)]">
        <div className="grid gap-3">
          {sorted.map((spec) => (
            <Card
              key={spec.id}
              className="group cursor-pointer border-border/60 transition-all duration-200 hover:border-border hover:shadow-md"
              onClick={() => onViewSpec(spec)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {spec.spec_title || 'Untitled Specification'}
                      </h3>
                      <Badge
                        variant={spec.status === 'final' ? 'default' : 'secondary'}
                        className="shrink-0 text-[10px]"
                      >
                        {spec.status === 'final' ? 'Final' : 'Draft'}
                      </Badge>
                    </div>

                    <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FiGitBranch className="h-3 w-3" />
                        {spec.repoUrl || 'No repo'}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiOutlineClock className="h-3 w-3" />
                        {formatDate(spec.createdAt)}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {spec.executive_summary
                        ? spec.executive_summary.slice(0, 200)
                        : 'No summary available.'}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewSpec(spec)
                      }}
                    >
                      <HiOutlineEye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSpec(spec.id)
                      }}
                    >
                      <HiOutlineTrash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}
