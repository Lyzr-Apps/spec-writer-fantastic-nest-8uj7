'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import type { AIAgentResponse } from '@/lib/aiAgent'
import { Card, CardContent } from '@/components/ui/card'

import Header from './sections/Header'
import Dashboard from './sections/Dashboard'
import type { SavedSpec } from './sections/Dashboard'
import SpecGenerator from './sections/SpecGenerator'
import SpecViewer from './sections/SpecViewer'

// ── Constants ──
const MANAGER_AGENT_ID = '69a387ce78f49a857ee6cd33'
const STORAGE_KEY = 'specdraft_specifications'

const AGENTS_INFO = [
  { id: '69a387ce78f49a857ee6cd33', name: 'Spec Orchestrator Manager', role: 'Coordinates sub-agents' },
  { id: '69a387ba02d22f6533d62e2d', name: 'Requirements Extractor', role: 'Extracts requirements from GitHub' },
  { id: '69a387a85d446100f182a995', name: 'Spec Drafting Agent', role: 'Drafts specification sections' },
  { id: '69a387a829fc9c9afefea994', name: 'Summary & Formatting', role: 'Formats final document' },
]

const LOADING_MESSAGES = [
  'Analyzing repository documentation...',
  'Extracting requirements from codebase...',
  'Drafting specification sections...',
  'Formatting and reviewing document...',
]

const SAMPLE_SPECS: SavedSpec[] = [
  {
    id: 'sample-1',
    spec_title: 'Real-Time Collaboration Module',
    repoUrl: 'acme/collaboration-engine',
    createdAt: '2025-02-28T10:30:00Z',
    status: 'final',
    executive_summary: 'This specification outlines the design and implementation of a real-time collaboration module enabling multiple users to simultaneously edit documents, share cursors, and resolve conflicts using CRDTs.',
    data: {
      spec_title: 'Real-Time Collaboration Module',
      executive_summary: 'This specification outlines the design and implementation of a real-time collaboration module enabling multiple users to simultaneously edit documents, share cursors, and resolve conflicts using CRDTs.',
      problem_statement: 'Current document editing is single-user only. Users must take turns or use external tools for collaboration, causing friction and version conflicts.',
      scope_and_goals: '**Scope:** Implement real-time text editing with presence awareness.\n\n**Goals:**\n- Support 50+ concurrent editors per document\n- Sub-100ms latency for character propagation\n- Automatic conflict resolution without data loss',
      user_stories: [
        { story: 'As a product manager, I want to see who is currently editing a document so I can coordinate changes.', acceptance_criteria: ['User avatars appear at cursor positions', 'Presence list updates within 2 seconds of join/leave', 'Idle users are visually dimmed after 5 minutes'] },
        { story: 'As a developer, I want real-time text sync so I can pair-edit specs with my team.', acceptance_criteria: ['Characters appear on remote screens within 100ms', 'No data loss during concurrent edits', 'Undo/redo works correctly per-user'] },
      ],
      technical_requirements: '- WebSocket connections for real-time data transport\n- CRDT (Yjs) for conflict-free merging\n- Redis pub/sub for horizontal scaling\n- PostgreSQL for persistent document storage',
      system_architecture: '**Client Layer:** React editor with Yjs bindings\n**Transport:** WebSocket gateway (Node.js)\n**Sync Engine:** Yjs CRDT with Redis awareness\n**Persistence:** PostgreSQL with document versioning',
      success_metrics: ['99.9% message delivery rate', 'P95 latency under 80ms', 'Zero data-loss incidents in 6 months', 'Editor adoption rate above 70%'],
      risk_assessment: [
        { risk: 'WebSocket connection instability on mobile networks', mitigation: 'Implement reconnection with exponential backoff and offline queue' },
        { risk: 'Memory pressure with large documents and many cursors', mitigation: 'Paginate document updates and limit cursor broadcast frequency' },
      ],
      timeline_considerations: 'Phase 1 (4 weeks): Core editing and sync. Phase 2 (2 weeks): Presence and cursors. Phase 3 (2 weeks): Scaling and load testing.',
      glossary: [
        { term: 'CRDT', definition: 'Conflict-free Replicated Data Type, a data structure that allows concurrent updates without coordination.' },
        { term: 'Yjs', definition: 'An open-source CRDT implementation optimized for rich text editing.' },
      ],
      document_metadata: { version: '1.0', last_updated: '2025-02-28T10:30:00Z', section_count: 10 },
    },
    artifactFiles: [],
  },
  {
    id: 'sample-2',
    spec_title: 'API Rate Limiting & Throttling',
    repoUrl: 'acme/api-gateway',
    createdAt: '2025-02-25T14:15:00Z',
    status: 'draft',
    executive_summary: 'Design an adaptive rate limiting system for the API gateway that prevents abuse while maintaining quality of service for legitimate users through token bucket and sliding window algorithms.',
    data: {
      spec_title: 'API Rate Limiting & Throttling',
      executive_summary: 'Design an adaptive rate limiting system for the API gateway that prevents abuse while maintaining quality of service for legitimate users through token bucket and sliding window algorithms.',
      problem_statement: 'The API gateway lacks rate limiting, making it vulnerable to DDoS attacks and resource exhaustion from misbehaving clients.',
      scope_and_goals: '**Scope:** Rate limiting middleware for all API endpoints.\n\n**Goals:**\n- Per-client and per-endpoint rate limits\n- Configurable policies without code changes\n- Real-time monitoring dashboard',
      user_stories: [
        { story: 'As an API consumer, I want clear rate limit headers so I can adjust my request frequency.', acceptance_criteria: ['X-RateLimit-Limit header shows max requests', 'X-RateLimit-Remaining shows available requests', '429 response includes Retry-After header'] },
      ],
      technical_requirements: '- Redis for distributed rate counters\n- Lua scripting for atomic token bucket operations\n- Configuration via YAML or admin API',
      system_architecture: '**Middleware Layer:** Express middleware for request interception\n**Counter Store:** Redis cluster with Lua scripts\n**Config Store:** Consul/etcd for dynamic policy updates',
      success_metrics: ['Block 99% of abusive traffic', 'Less than 1ms added latency per request', 'Zero false positives for legitimate users'],
      risk_assessment: [
        { risk: 'Redis single point of failure', mitigation: 'Deploy Redis Sentinel with automatic failover' },
      ],
      timeline_considerations: 'MVP in 3 weeks. Production hardening in 2 additional weeks.',
      glossary: [
        { term: 'Token Bucket', definition: 'A rate limiting algorithm where tokens are added at a fixed rate and consumed per request.' },
      ],
      document_metadata: { version: '0.9', last_updated: '2025-02-25T14:15:00Z', section_count: 10 },
    },
    artifactFiles: [],
  },
]

// ── Error Boundary ──
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <div className="max-w-md p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
            <p className="mb-4 text-sm text-muted-foreground">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Helpers ──
function saveSpecs(specs: SavedSpec[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(specs))
  } catch {}
}

function loadSpecs(): SavedSpec[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function parseSpecResponse(result: AIAgentResponse) {
  if (!result.success) return null
  const raw = result.response?.result
  if (!raw) return null

  let parsed = raw
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw) } catch { return null }
  }

  return {
    spec_title: parsed?.spec_title || 'Untitled Specification',
    executive_summary: parsed?.executive_summary || '',
    problem_statement: parsed?.problem_statement || '',
    scope_and_goals: parsed?.scope_and_goals || '',
    user_stories: Array.isArray(parsed?.user_stories) ? parsed.user_stories : [],
    technical_requirements: parsed?.technical_requirements || '',
    system_architecture: parsed?.system_architecture || '',
    success_metrics: Array.isArray(parsed?.success_metrics) ? parsed.success_metrics : [],
    risk_assessment: Array.isArray(parsed?.risk_assessment) ? parsed.risk_assessment : [],
    timeline_considerations: parsed?.timeline_considerations || '',
    glossary: Array.isArray(parsed?.glossary) ? parsed.glossary : [],
    document_metadata: parsed?.document_metadata || { version: '1.0', last_updated: '', section_count: 0 },
  }
}

// ── Agent Status Panel ──
function AgentStatusPanel({ activeAgentId }: { activeAgentId: string }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-3">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Agent Pipeline</p>
        <div className="space-y-1.5">
          {AGENTS_INFO.map((agent) => (
            <div key={agent.id} className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${activeAgentId === agent.id ? 'bg-primary animate-pulse' : 'bg-border'}`} />
              <span className="text-[11px] text-foreground">{agent.name}</span>
              <span className="text-[10px] text-muted-foreground">- {agent.role}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main Page ──
export default function Page() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'viewer'>('dashboard')
  const [showGenerator, setShowGenerator] = useState(false)
  const [specifications, setSpecifications] = useState<SavedSpec[]>([])
  const [currentSpec, setCurrentSpec] = useState<SavedSpec | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [error, setError] = useState('')
  const [showSample, setShowSample] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState('')
  const [regeneratingSection, setRegeneratingSection] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSpecifications(loadSpecs())
  }, [])

  useEffect(() => {
    if (mounted) saveSpecs(specifications)
  }, [specifications, mounted])

  const displaySpecs = showSample ? [...SAMPLE_SPECS, ...specifications] : specifications

  const cycleLoadingMessages = useCallback(() => {
    let idx = 0
    setLoadingMessage(LOADING_MESSAGES[0])
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[idx])
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleGenerate = useCallback(async (repoUrl: string, featureScope: string) => {
    setLoading(true)
    setError('')
    setActiveAgentId(MANAGER_AGENT_ID)
    const stopCycle = cycleLoadingMessages()

    try {
      const message = `Generate a feature specification for the GitHub repository: ${repoUrl}.${featureScope ? ` Focus area: ${featureScope}` : ''}`
      const result = await callAIAgent(message, MANAGER_AGENT_ID)
      stopCycle()

      if (!result.success) {
        setError(result.error || 'Failed to generate specification. Please try again.')
        setLoading(false)
        setActiveAgentId('')
        return
      }

      const specData = parseSpecResponse(result)
      if (!specData) {
        setError('Could not parse the specification response. Please try again.')
        setLoading(false)
        setActiveAgentId('')
        return
      }

      const artifactFiles = Array.isArray(result.module_outputs?.artifact_files)
        ? result.module_outputs.artifact_files
        : []

      const newSpec: SavedSpec = {
        id: `spec-${Date.now()}`,
        spec_title: specData.spec_title,
        repoUrl,
        createdAt: new Date().toISOString(),
        status: 'final',
        executive_summary: specData.executive_summary,
        data: specData,
        artifactFiles,
      }

      setSpecifications((prev) => [newSpec, ...prev])
      setCurrentSpec(newSpec)
      setShowGenerator(false)
      setCurrentView('viewer')
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
      setActiveAgentId('')
      setLoadingMessage('')
    }
  }, [cycleLoadingMessages])

  const handleRegenerateSection = useCallback(async (sectionKey: string, currentContent: string) => {
    if (!currentSpec) return
    setRegeneratingSection(sectionKey)
    setActiveAgentId(MANAGER_AGENT_ID)

    try {
      const sectionLabel = sectionKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      const message = `Regenerate ONLY the "${sectionLabel}" section for the specification based on GitHub repository: ${currentSpec.repoUrl}. Keep all other sections unchanged. Current content of this section: ${currentContent}`
      const result = await callAIAgent(message, MANAGER_AGENT_ID)

      if (result.success) {
        const newData = parseSpecResponse(result)
        if (newData && newData[sectionKey as keyof typeof newData] != null) {
          const updatedData = { ...currentSpec.data, [sectionKey]: newData[sectionKey as keyof typeof newData] }
          const updatedSpec = { ...currentSpec, data: updatedData }
          setCurrentSpec(updatedSpec)
          setSpecifications((prev) =>
            prev.map((s) => (s.id === updatedSpec.id ? updatedSpec : s))
          )
        }
      }
    } catch {}
    setRegeneratingSection('')
    setActiveAgentId('')
  }, [currentSpec])

  const handleViewSpec = useCallback((spec: SavedSpec) => {
    setCurrentSpec(spec)
    setCurrentView('viewer')
  }, [])

  const handleDeleteSpec = useCallback((id: string) => {
    setSpecifications((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const handleBackToDashboard = useCallback(() => {
    setCurrentView('dashboard')
    setCurrentSpec(null)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header
          currentView={currentView}
          showSample={showSample}
          onToggleSample={setShowSample}
          onNewSpec={() => { setError(''); setShowGenerator(true) }}
          onBackToDashboard={handleBackToDashboard}
          specCount={displaySpecs.length}
        />

        {currentView === 'dashboard' && (
          <Dashboard
            specifications={displaySpecs}
            onViewSpec={handleViewSpec}
            onDeleteSpec={handleDeleteSpec}
            onNewSpec={() => { setError(''); setShowGenerator(true) }}
          />
        )}

        {currentView === 'viewer' && currentSpec && (
          <SpecViewer
            spec={currentSpec}
            onBack={handleBackToDashboard}
            onRegenerateSection={handleRegenerateSection}
            regeneratingSection={regeneratingSection}
          />
        )}

        <SpecGenerator
          open={showGenerator}
          onClose={() => setShowGenerator(false)}
          onGenerate={handleGenerate}
          loading={loading}
          loadingMessage={loadingMessage}
          error={error}
        />

        {/* Agent Status */}
        <div className="fixed bottom-4 left-4 z-50 w-64 opacity-70 transition-opacity hover:opacity-100">
          <AgentStatusPanel activeAgentId={activeAgentId} />
        </div>
      </div>
    </ErrorBoundary>
  )
}
