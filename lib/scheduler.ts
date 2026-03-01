'use client'

/**
 * Scheduler Client Utility
 *
 * Client-side wrapper for managing Lyzr Schedules via the /api/scheduler proxy.
 * All API calls are proxied through the server so the API key never reaches the browser.
 */

import { useState } from 'react'
import fetchWrapper from '@/lib/fetchWrapper'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Schedule {
  id: string
  user_id: string
  agent_id: string
  message: string
  cron_expression: string
  timezone: string
  max_retries: number
  retry_delay: number
  is_active: boolean
  created_at: string
  updated_at: string
  next_run_time: string | null
  last_run_at: string | null
  last_run_success: boolean | null
}

export interface ExecutionLog {
  id: string
  schedule_id: string
  agent_id: string
  user_id: string
  session_id: string
  executed_at: string
  attempt: number
  max_attempts: number
  success: boolean
  payload_message: string
  response_status: number
  response_output: string
  error_message: string | null
}

export interface Webhook {
  id: string
  agent_id: string
  user_id: string
  description: string
  webhook_url: string
  is_active: boolean
  created_at: string
  last_triggered_at: string | null
  last_trigger_success: boolean | null
  trigger_count: number
}

interface ApiResult<T = Record<string, unknown>> {
  success: boolean
  error?: string
  details?: string
  data?: T
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      query.set(key, String(value))
    }
  }
  return query.toString()
}

// ---------------------------------------------------------------------------
// GET operations
// ---------------------------------------------------------------------------

/** List all schedules (optionally filtered by agent / active status). */
export async function listSchedules(params?: {
  agentId?: string
  is_active?: boolean
  skip?: number
  limit?: number
}): Promise<{ success: boolean; schedules: Schedule[]; total: number; error?: string }> {
  try {
    const qs = buildQuery({
      action: 'list',
      agentId: params?.agentId,
      is_active: params?.is_active,
      skip: params?.skip,
      limit: params?.limit,
    })
    const res = await fetchWrapper(`/api/scheduler?${qs}`)
    const data = await res.json()
    if (!data.success) return { success: false, schedules: [], total: 0, error: data.error }
    return { success: true, schedules: data.schedules || [], total: data.total ?? 0 }
  } catch (error) {
    return { success: false, schedules: [], total: 0, error: error instanceof Error ? error.message : 'Network error' }
  }
}

/**
 * Get a single schedule by ID.
 * 
 * @param scheduleId - The schedule ID to fetch
 * @returns Promise with schedule data
 * 
 * @remarks
 * WARNING: This function only READS data (GET request). It does NOT modify the schedule state.
 * 
 * IMPORTANT: Do NOT use this function for refreshing schedule state after resume/pause operations.
 * Instead, use `loadSchedules()` or `fetchSchedules()` to refresh the full schedule list.
 * 
 * This function is intended for:
 * - Initial data loading when you only need one schedule
 * - Viewing schedule details in a modal/detail view
 * 
 * Do NOT use for:
 * - Refreshing state after resume/pause operations
 * - Automatic polling/refresh mechanisms after state changes
 * - Updating UI state after write operations
 */
export async function getSchedule(scheduleId: string): Promise<{ success: boolean; schedule?: Schedule; error?: string }> {
  try {
    const qs = buildQuery({ action: 'get', scheduleId })
    const res = await fetchWrapper(`/api/scheduler?${qs}`)
    const data = await res.json()
    if (!data.success) return { success: false, error: data.error }
    const { success: _, error: __, details: ___, ...schedule } = data
    return { success: true, schedule: schedule as unknown as Schedule }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' }
  }
}

/** Get all schedules + webhooks attached to an agent. */
export async function getSchedulesForAgent(agentId: string): Promise<{
  success: boolean
  agent_id?: string
  schedules: Schedule[]
  webhooks: Webhook[]
  error?: string
}> {
  try {
    const qs = buildQuery({ action: 'by-agent', agentId })
    const res = await fetchWrapper(`/api/scheduler?${qs}`)
    const data = await res.json()
    if (!data.success) return { success: false, schedules: [], webhooks: [], error: data.error }
    return {
      success: true,
      agent_id: data.agent_id,
      schedules: data.schedules || [],
      webhooks: data.webhooks || [],
    }
  } catch (error) {
    return { success: false, schedules: [], webhooks: [], error: error instanceof Error ? error.message : 'Network error' }
  }
}

/** Get execution logs for a schedule (paginated). */
export async function getScheduleLogs(
  scheduleId: string,
  params?: { skip?: number; limit?: number }
): Promise<{ success: boolean; executions: ExecutionLog[]; total: number; error?: string }> {
  try {
    const qs = buildQuery({
      action: 'logs',
      scheduleId,
      skip: params?.skip,
      limit: params?.limit,
    })
    const res = await fetchWrapper(`/api/scheduler?${qs}`)
    const data = await res.json()
    if (!data.success) return { success: false, executions: [], total: 0, error: data.error }
    return { success: true, executions: data.executions || [], total: data.total ?? 0 }
  } catch (error) {
    return { success: false, executions: [], total: 0, error: error instanceof Error ? error.message : 'Network error' }
  }
}

/** Get recent executions across all schedules. */
export async function getRecentExecutions(params?: {
  agentId?: string
  success?: boolean
  hours?: number
  days?: number
  skip?: number
  limit?: number
}): Promise<{ success: boolean; executions: ExecutionLog[]; total: number; error?: string }> {
  try {
    const qs = buildQuery({
      action: 'recent',
      agentId: params?.agentId,
      success: params?.success,
      hours: params?.hours,
      days: params?.days,
      skip: params?.skip,
      limit: params?.limit,
    })
    const res = await fetchWrapper(`/api/scheduler?${qs}`)
    const data = await res.json()
    if (!data.success) return { success: false, executions: [], total: 0, error: data.error }
    return { success: true, executions: data.executions || [], total: data.total ?? 0 }
  } catch (error) {
    return { success: false, executions: [], total: 0, error: error instanceof Error ? error.message : 'Network error' }
  }
}

// ---------------------------------------------------------------------------
// POST operations
// ---------------------------------------------------------------------------

/** Create a new schedule. */
export async function createSchedule(params: {
  agent_id: string
  cron_expression: string
  message: string
  timezone?: string
  max_retries?: number
  retry_delay?: number
}): Promise<{ success: boolean; schedule?: Schedule; error?: string }> {
  try {
    const res = await fetchWrapper('/api/scheduler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...params }),
    })
    const data = await res.json()
    if (!data.success) return { success: false, error: data.error }
    const { success: _, error: __, details: ___, ...schedule } = data
    return { success: true, schedule: schedule as unknown as Schedule }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' }
  }
}

/**
 * Pause a schedule (it will not run until resumed).
 * 
 * @param scheduleId - The schedule ID to pause
 * @returns Promise with success status
 * 
 * @remarks
 * IMPORTANT: After calling this function, UI components MUST refresh the schedule list
 * to sync the UI state with the backend, even if this function returns success for
 * "already paused/inactive" errors. Always call `loadSchedules()` or `fetchSchedules()` after pause.
 */
export async function pauseSchedule(scheduleId: string): Promise<ApiResult> {
  if (!scheduleId) {
    return { success: false, error: 'scheduleId is required' }
  }
  try {
    const res = await fetchWrapper('/api/scheduler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pause', scheduleId }),
    })
    const data = await res.json()
    
    // If API returns 400 with "already paused/inactive", treat as success (schedule is already in desired state)
    if (!data.success && data.details) {
      let detailsStr = ''
      if (typeof data.details === 'string') {
        // Try to parse JSON-stringified details
        try {
          const parsed = JSON.parse(data.details)
          detailsStr = JSON.stringify(parsed).toLowerCase()
        } catch {
          detailsStr = data.details.toLowerCase()
        }
      } else {
        detailsStr = JSON.stringify(data.details).toLowerCase()
      }
      
      if (detailsStr.includes('already') && (detailsStr.includes('paused') || detailsStr.includes('inactive'))) {
        return { success: true, data }
      }
    }
    
    return data
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' }
  }
}

/**
 * Resume a paused schedule.
 * 
 * @param scheduleId - The schedule ID to resume
 * @returns Promise with success status
 * 
 * @remarks
 * IMPORTANT: After calling this function, UI components MUST refresh the schedule list
 * to sync the UI state with the backend, even if this function returns success for
 * "already active" errors. Always call `loadSchedules()` or `fetchSchedules()` after resume.
 */
export async function resumeSchedule(scheduleId: string): Promise<ApiResult> {
  if (!scheduleId) {
    return { success: false, error: 'scheduleId is required' }
  }
  try {
    const res = await fetchWrapper('/api/scheduler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resume', scheduleId }),
    })
    const data = await res.json()
    
    // If API returns 400 with "already active", treat as success (schedule is already in desired state)
    if (!data.success && data.details) {
      let detailsStr = ''
      if (typeof data.details === 'string') {
        // Try to parse JSON-stringified details
        try {
          const parsed = JSON.parse(data.details)
          detailsStr = JSON.stringify(parsed).toLowerCase()
        } catch {
          detailsStr = data.details.toLowerCase()
        }
      } else {
        detailsStr = JSON.stringify(data.details).toLowerCase()
      }
      
      if (detailsStr.includes('already active') || detailsStr.includes('already active')) {
        return { success: true, data }
      }
    }
    
    return data
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' }
  }
}

/**
 * Update a schedule's message by deleting and recreating it.
 *
 * The Scheduler API has no PATCH/PUT endpoint, so updating the message
 * requires deleting the old schedule and creating a new one with the same
 * settings but the updated message. If the old schedule was active, the
 * new one is automatically resumed.
 *
 * @returns The new schedule (with a new ID) on success.
 */
export async function updateScheduleMessage(
  scheduleId: string,
  newMessage: string
): Promise<{ success: boolean; schedule?: Schedule; newScheduleId?: string; error?: string }> {
  if (!scheduleId) {
    return { success: false, error: 'scheduleId is required' }
  }

  // Use listSchedules to find the schedule — more reliable than getSchedule
  // which can return data in an unexpected shape.
  const list = await listSchedules()
  if (!list.success) {
    return { success: false, error: 'Failed to fetch schedules' }
  }
  const existing = list.schedules.find(s => s.id === scheduleId)
  if (!existing) {
    return { success: false, error: `Schedule ${scheduleId} not found` }
  }
  if (!existing.agent_id || !existing.cron_expression) {
    return { success: false, error: 'Schedule is missing agent_id or cron_expression' }
  }
  const wasActive = existing.is_active

  const deleted = await deleteSchedule(scheduleId)
  if (!deleted.success) {
    return { success: false, error: `Failed to delete old schedule: ${deleted.error}` }
  }

  const created = await createSchedule({
    agent_id: existing.agent_id,
    cron_expression: existing.cron_expression,
    message: newMessage,
    timezone: existing.timezone,
  })
  if (!created.success || !created.schedule) {
    return { success: false, error: `Failed to recreate schedule: ${created.error}` }
  }

  if (wasActive) {
    await resumeSchedule(created.schedule.id)
  }

  return { success: true, schedule: created.schedule, newScheduleId: created.schedule.id }
}

/** Manually trigger a schedule to run immediately (returns 202 async). */
export async function triggerScheduleNow(scheduleId: string): Promise<ApiResult> {
  try {
    const res = await fetchWrapper('/api/scheduler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'trigger', scheduleId }),
    })
    return res.json()
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' }
  }
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

/** Permanently delete a schedule. */
export async function deleteSchedule(scheduleId: string): Promise<ApiResult> {
  try {
    const res = await fetchWrapper('/api/scheduler', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleId }),
    })
    return res.json()
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' }
  }
}

// ---------------------------------------------------------------------------
// Cron helpers
// ---------------------------------------------------------------------------

/** Convert a 5-part cron expression to human-readable text. */
export function cronToHuman(cron: string): string {
  if (!cron || typeof cron !== 'string') return cron ?? 'No schedule'
  const parts = cron.split(' ')
  if (parts.length !== 5) return cron

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  if (dayOfMonth === '*' && month === '*') {
    if (dayOfWeek === '*') {
      if (hour === '*') {
        if (minute.startsWith('*/')) return `Every ${minute.slice(2)} minutes`
        return `Every hour at :${minute.padStart(2, '0')}`
      }
      if (hour.startsWith('*/')) return `Every ${hour.slice(2)} hours`
      return `Every day at ${hour}:${minute.padStart(2, '0')}`
    }
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    if (dayOfWeek === '1-5') return `Weekdays at ${hour}:${minute.padStart(2, '0')}`
    if (dayOfWeek === '0,6') return `Weekends at ${hour}:${minute.padStart(2, '0')}`
    const dayName = days[parseInt(dayOfWeek)] || dayOfWeek
    return `Every ${dayName} at ${hour}:${minute.padStart(2, '0')}`
  }

  if (dayOfMonth !== '*' && month === '*') {
    return `Day ${dayOfMonth} of every month at ${hour}:${minute.padStart(2, '0')}`
  }

  return cron
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

/** React hook for managing schedules with loading/error state. */
export function useScheduler() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedules = async (params?: { agentId?: string; is_active?: boolean }) => {
    setLoading(true)
    setError(null)
    const result = await listSchedules(params)
    if (result.success) {
      setSchedules(result.schedules)
      setTotal(result.total)
    } else {
      setError(result.error || 'Failed to fetch schedules')
    }
    setLoading(false)
    return result
  }

  const toggleSchedule = async (schedule: Schedule) => {
    setLoading(true)
    setError(null)
    const result = schedule.is_active
      ? await pauseSchedule(schedule.id)
      : await resumeSchedule(schedule.id)
    if (!result.success) {
      setError(result.error || 'Failed to toggle schedule')
    } else {
      // Update local state
      setSchedules(prev => prev.map(s => 
        s.id === schedule.id ? { ...s, is_active: !s.is_active } : s
      ))
    }
    setLoading(false)
    return result
  }

  const trigger = async (scheduleId: string) => {
    setLoading(true)
    setError(null)
    const result = await triggerScheduleNow(scheduleId)
    if (!result.success) {
      setError(result.error || 'Failed to trigger schedule')
    }
    setLoading(false)
    return result
  }

  const remove = async (scheduleId: string) => {
    setLoading(true)
    setError(null)
    const result = await deleteSchedule(scheduleId)
    if (result.success) {
      setSchedules(prev => prev.filter(s => s.id !== scheduleId))
      setTotal(prev => prev - 1)
    } else {
      setError(result.error || 'Failed to delete schedule')
    }
    setLoading(false)
    return result
  }

  return {
    schedules,
    total,
    loading,
    error,
    fetchSchedules,
    toggleSchedule,
    trigger,
    remove,
  }
}
