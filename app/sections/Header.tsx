'use client'

import React from 'react'
import { HiOutlineDocumentText, HiOutlinePlus } from 'react-icons/hi2'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  currentView: 'dashboard' | 'viewer'
  showSample: boolean
  onToggleSample: (val: boolean) => void
  onNewSpec: () => void
  onBackToDashboard: () => void
  specCount: number
}

export default function Header({
  currentView,
  showSample,
  onToggleSample,
  onNewSpec,
  onBackToDashboard,
  specCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-[16px]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HiOutlineDocumentText className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">SpecDraft</span>
          </button>
          {currentView === 'dashboard' && specCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs font-medium">
              {specCount} spec{specCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Sample Data</span>
            <Switch checked={showSample} onCheckedChange={onToggleSample} />
          </div>

          {currentView === 'dashboard' && (
            <Button size="sm" onClick={onNewSpec} className="gap-1.5">
              <HiOutlinePlus className="h-3.5 w-3.5" />
              New Specification
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
