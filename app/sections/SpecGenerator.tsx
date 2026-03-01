'use client'

import React, { useState } from 'react'
import { FiGitBranch, FiLoader } from 'react-icons/fi'
import { VscSymbolProperty } from 'react-icons/vsc'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface SpecGeneratorProps {
  open: boolean
  onClose: () => void
  onGenerate: (repoUrl: string, featureScope: string) => void
  loading: boolean
  loadingMessage: string
  error: string
}

export default function SpecGenerator({
  open,
  onClose,
  onGenerate,
  loading,
  loadingMessage,
  error,
}: SpecGeneratorProps) {
  const [repoUrl, setRepoUrl] = useState('')
  const [featureScope, setFeatureScope] = useState('')
  const [validationError, setValidationError] = useState('')

  const validateRepo = (url: string): boolean => {
    const trimmed = url.trim()
    if (!trimmed) {
      setValidationError('Repository URL is required.')
      return false
    }
    const ownerRepoPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/
    const fullUrlPattern = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+/
    if (!ownerRepoPattern.test(trimmed) && !fullUrlPattern.test(trimmed)) {
      setValidationError('Enter a valid GitHub repo (e.g., owner/repo-name or full URL).')
      return false
    }
    setValidationError('')
    return true
  }

  const handleSubmit = () => {
    if (!validateRepo(repoUrl)) return
    onGenerate(repoUrl.trim(), featureScope.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">New Specification</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enter a GitHub repository to generate a complete feature specification.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FiLoader className="h-5 w-5 animate-spin text-primary" />
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">{loadingMessage}</p>
            <p className="text-xs text-muted-foreground">This may take a minute or two...</p>
            <div className="mt-4 flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse"
                  style={{ animationDelay: `${i * 300}ms` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="repo-url" className="text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <FiGitBranch className="h-3.5 w-3.5" />
                  GitHub Repository
                  <span className="text-destructive">*</span>
                </span>
              </Label>
              <Input
                id="repo-url"
                placeholder="e.g., owner/repo-name"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value)
                  if (validationError) setValidationError('')
                }}
                onKeyDown={handleKeyDown}
                className={validationError ? 'border-destructive' : ''}
              />
              {validationError && (
                <p className="text-xs text-destructive">{validationError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="feature-scope" className="text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <VscSymbolProperty className="h-3.5 w-3.5" />
                  Feature Scope
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </span>
              </Label>
              <Textarea
                id="feature-scope"
                placeholder="Describe the feature focus area..."
                value={featureScope}
                onChange={(e) => setFeatureScope(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={!repoUrl.trim()}>
                Generate Specification
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
