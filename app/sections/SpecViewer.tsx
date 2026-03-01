'use client'

import React, { useState } from 'react'
import {
  HiOutlineArrowLeft,
  HiOutlineArrowDownTray,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineClipboard,
  HiOutlineCheck,
} from 'react-icons/hi2'
import { FiGitBranch, FiLoader } from 'react-icons/fi'
import { TbFileTypePdf, TbFileTypeDocx } from 'react-icons/tb'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { copyToClipboard } from '@/lib/clipboard'

import type { SavedSpec } from './Dashboard'

interface SpecViewerProps {
  spec: SavedSpec
  onBack: () => void
  onRegenerateSection: (sectionName: string, currentContent: string) => void
  regeneratingSection: string
}

const SECTIONS_CONFIG = [
  { key: 'executive_summary', label: 'Executive Summary' },
  { key: 'problem_statement', label: 'Problem Statement' },
  { key: 'scope_and_goals', label: 'Scope & Goals' },
  { key: 'user_stories', label: 'User Stories' },
  { key: 'technical_requirements', label: 'Technical Requirements' },
  { key: 'system_architecture', label: 'System Architecture' },
  { key: 'success_metrics', label: 'Success Metrics' },
  { key: 'risk_assessment', label: 'Risk Assessment' },
  { key: 'timeline_considerations', label: 'Timeline Considerations' },
  { key: 'glossary', label: 'Glossary' },
] as const

export default function SpecViewer({
  spec,
  onBack,
  onRegenerateSection,
  regeneratingSection,
}: SpecViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(SECTIONS_CONFIG.map((s) => s.key))
  )
  const [copied, setCopied] = useState(false)

  const data = spec.data || {}

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleDownload = (type: 'pdf' | 'docx') => {
    const files = Array.isArray(spec.artifactFiles) ? spec.artifactFiles : []
    const file = files.find(
      (f) => f.format_type === type || (f.name ?? '').toLowerCase().endsWith(`.${type}`)
    )
    if (file?.file_url) {
      window.open(file.file_url, '_blank')
      return
    }
    const textContent = buildPlainText(spec)
    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(spec.spec_title || 'specification').replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyAll = async () => {
    const text = buildPlainText(spec)
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const metadata = data.document_metadata
  const hasArtifacts = Array.isArray(spec.artifactFiles) && spec.artifactFiles.length > 0

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-14 z-30 border-b border-border/60 bg-background/80 backdrop-blur-[16px]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:px-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-xs">
            <HiOutlineArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopyAll} className="gap-1.5 text-xs">
              {copied ? (
                <><HiOutlineCheck className="h-3.5 w-3.5" /> Copied</>
              ) : (
                <><HiOutlineClipboard className="h-3.5 w-3.5" /> Copy All</>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')} className="gap-1.5 text-xs">
              <TbFileTypePdf className="h-3.5 w-3.5" />
              {hasArtifacts ? 'Download PDF' : 'Export TXT'}
            </Button>
            {hasArtifacts && (
              <Button variant="outline" size="sm" onClick={() => handleDownload('docx')} className="gap-1.5 text-xs">
                <TbFileTypeDocx className="h-3.5 w-3.5" />
                Download DOCX
              </Button>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="mb-6">
            <h1 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
              {spec.spec_title || 'Untitled Specification'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <FiGitBranch className="h-2.5 w-2.5" />
                {spec.repoUrl || 'No repo'}
              </Badge>
              {metadata?.version && (
                <Badge variant="outline" className="text-[10px]">v{metadata.version}</Badge>
              )}
              <span>{formatDate(spec.createdAt)}</span>
              {metadata?.section_count != null && (
                <span>{metadata.section_count} sections</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {SECTIONS_CONFIG.map((section, idx) => {
              const isExpanded = expandedSections.has(section.key)
              const content = data[section.key]
              const isRegenerating = regeneratingSection === section.key

              return (
                <Card key={section.key} className="group border-border/60 overflow-hidden">
                  <button
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary/30"
                    onClick={() => toggleSection(section.key)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <HiOutlineChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <HiOutlineChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="text-xs font-medium text-muted-foreground">{idx + 1}.</span>
                      <span className="text-sm font-medium text-foreground">{section.label}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                      disabled={isRegenerating}
                      onClick={(e) => {
                        e.stopPropagation()
                        const contentStr = typeof content === 'string' ? content : JSON.stringify(content ?? '')
                        onRegenerateSection(section.key, contentStr)
                      }}
                    >
                      {isRegenerating ? (
                        <FiLoader className="h-3 w-3 animate-spin" />
                      ) : (
                        <HiOutlineArrowPath className="h-3 w-3" />
                      )}
                    </Button>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border/40 px-4 py-3">
                      {isRegenerating ? (
                        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                          <FiLoader className="h-3.5 w-3.5 animate-spin" />
                          Regenerating section...
                        </div>
                      ) : (
                        <SectionContent sectionKey={section.key} content={content} />
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

function SectionContent({ sectionKey, content }: { sectionKey: string; content: any }) {
  if (content == null || content === '') {
    return <p className="text-sm italic text-muted-foreground">No content available for this section.</p>
  }

  if (sectionKey === 'user_stories' && Array.isArray(content)) {
    return (
      <div className="space-y-3">
        {content.map((story: any, i: number) => (
          <div key={i} className="rounded-lg bg-secondary/30 p-3">
            <p className="mb-2 text-sm font-medium text-foreground">{story?.story ?? 'User Story'}</p>
            {Array.isArray(story?.acceptance_criteria) && story.acceptance_criteria.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Acceptance Criteria</p>
                <ul className="space-y-0.5">
                  {story.acceptance_criteria.map((ac: string, j: number) => (
                    <li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <HiOutlineCheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-green-600" />
                      {ac}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (sectionKey === 'success_metrics' && Array.isArray(content)) {
    return (
      <ul className="space-y-1.5">
        {content.map((metric: string, i: number) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            {metric}
          </li>
        ))}
      </ul>
    )
  }

  if (sectionKey === 'risk_assessment' && Array.isArray(content)) {
    return (
      <div className="space-y-2">
        {content.map((item: any, i: number) => (
          <div key={i} className="rounded-lg border border-border/40 p-3">
            <div className="mb-1 flex items-start gap-2">
              <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-foreground">{item?.risk ?? 'Risk'}</p>
                {item?.mitigation && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium">Mitigation:</span> {item.mitigation}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (sectionKey === 'glossary' && Array.isArray(content)) {
    return (
      <div className="space-y-1.5">
        {content.map((item: any, i: number) => (
          <div key={i} className="flex gap-2 text-sm">
            <span className="shrink-0 font-semibold text-foreground">{item?.term ?? 'Term'}:</span>
            <span className="text-muted-foreground">{item?.definition ?? ''}</span>
          </div>
        ))}
      </div>
    )
  }

  if (typeof content === 'string') {
    return renderMarkdown(content)
  }

  return <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{JSON.stringify(content, null, 2)}</pre>
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h4 key={i} className="mt-3 mb-1 text-sm font-semibold">{line.slice(4)}</h4>
        if (line.startsWith('## '))
          return <h3 key={i} className="mt-3 mb-1 text-base font-semibold">{line.slice(3)}</h3>
        if (line.startsWith('# '))
          return <h2 key={i} className="mt-4 mb-2 text-lg font-bold">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

function buildPlainText(spec: SavedSpec): string {
  const data = spec.data || {}
  const lines: string[] = []
  lines.push(`# ${spec.spec_title || 'Untitled Specification'}`)
  lines.push(`Repository: ${spec.repoUrl || 'N/A'}`)
  lines.push(`Generated: ${spec.createdAt || 'N/A'}`)
  lines.push('')

  const textSections = [
    ['Executive Summary', data.executive_summary],
    ['Problem Statement', data.problem_statement],
    ['Scope & Goals', data.scope_and_goals],
    ['Technical Requirements', data.technical_requirements],
    ['System Architecture', data.system_architecture],
    ['Timeline Considerations', data.timeline_considerations],
  ]
  for (const [title, content] of textSections) {
    if (content) {
      lines.push(`## ${title}`)
      lines.push(String(content))
      lines.push('')
    }
  }

  if (Array.isArray(data.user_stories)) {
    lines.push('## User Stories')
    data.user_stories.forEach((s: any, i: number) => {
      lines.push(`${i + 1}. ${s?.story ?? ''}`)
      if (Array.isArray(s?.acceptance_criteria)) {
        s.acceptance_criteria.forEach((ac: string) => lines.push(`   - ${ac}`))
      }
    })
    lines.push('')
  }

  if (Array.isArray(data.success_metrics)) {
    lines.push('## Success Metrics')
    data.success_metrics.forEach((m: string) => lines.push(`- ${m}`))
    lines.push('')
  }

  if (Array.isArray(data.risk_assessment)) {
    lines.push('## Risk Assessment')
    data.risk_assessment.forEach((r: any) => {
      lines.push(`- Risk: ${r?.risk ?? ''}`)
      if (r?.mitigation) lines.push(`  Mitigation: ${r.mitigation}`)
    })
    lines.push('')
  }

  if (Array.isArray(data.glossary)) {
    lines.push('## Glossary')
    data.glossary.forEach((g: any) => lines.push(`- ${g?.term ?? ''}: ${g?.definition ?? ''}`))
    lines.push('')
  }

  return lines.join('\n')
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}
