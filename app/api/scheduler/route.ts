import { NextRequest, NextResponse } from 'next/server'

const SCHEDULER_BASE_URL = 'https://scheduler.studio.lyzr.ai'
const LYZR_API_KEY = process.env.LYZR_API_KEY || ''

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'accept': 'application/json',
    'x-api-key': LYZR_API_KEY,
  }
}

function apiKeyCheck() {
  if (!LYZR_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'LYZR_API_KEY not configured on server' },
      { status: 500 }
    )
  }
  return null
}

// ---------------------------------------------------------------------------
// GET — list | get | by-agent | logs | recent
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const check = apiKeyCheck()
  if (check) return check

  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'
    const scheduleId = searchParams.get('scheduleId')
    const agentId = searchParams.get('agentId')

    let url: string

    switch (action) {
      // GET /schedules/{schedule_id}
      case 'get': {
        if (!scheduleId) {
          return NextResponse.json({ success: false, error: 'scheduleId is required' }, { status: 400 })
        }
        url = `${SCHEDULER_BASE_URL}/schedules/${scheduleId}`
        break
      }

      // GET /schedules/by-agent/{agent_id}
      case 'by-agent': {
        if (!agentId) {
          return NextResponse.json({ success: false, error: 'agentId is required' }, { status: 400 })
        }
        url = `${SCHEDULER_BASE_URL}/schedules/by-agent/${agentId}`
        break
      }

      // GET /schedules/{schedule_id}/logs?skip=&limit=
      case 'logs': {
        if (!scheduleId) {
          return NextResponse.json({ success: false, error: 'scheduleId is required' }, { status: 400 })
        }
        const logsQuery = new URLSearchParams()
        if (searchParams.get('skip')) logsQuery.set('skip', searchParams.get('skip')!)
        if (searchParams.get('limit')) logsQuery.set('limit', searchParams.get('limit')!)
        const logsQs = logsQuery.toString() ? `?${logsQuery}` : ''
        url = `${SCHEDULER_BASE_URL}/schedules/${scheduleId}/logs${logsQs}`
        break
      }

      // GET /schedules/executions/recent?agent_id=&success=&hours=&days=&skip=&limit=
      case 'recent': {
        const recentQuery = new URLSearchParams()
        if (agentId) recentQuery.set('agent_id', agentId)
        if (searchParams.get('success')) recentQuery.set('success', searchParams.get('success')!)
        if (searchParams.get('hours')) recentQuery.set('hours', searchParams.get('hours')!)
        if (searchParams.get('days')) recentQuery.set('days', searchParams.get('days')!)
        if (searchParams.get('skip')) recentQuery.set('skip', searchParams.get('skip')!)
        if (searchParams.get('limit')) recentQuery.set('limit', searchParams.get('limit')!)
        const recentQs = recentQuery.toString() ? `?${recentQuery}` : ''
        url = `${SCHEDULER_BASE_URL}/schedules/executions/recent${recentQs}`
        break
      }

      // GET /schedules/?user_id=&agent_id=&is_active=&skip=&limit=
      case 'list':
      default: {
        const listQuery = new URLSearchParams()
        listQuery.set('user_id', LYZR_API_KEY)
        if (agentId) listQuery.set('agent_id', agentId)
        if (searchParams.get('is_active')) listQuery.set('is_active', searchParams.get('is_active')!)
        if (searchParams.get('skip')) listQuery.set('skip', searchParams.get('skip')!)
        if (searchParams.get('limit')) listQuery.set('limit', searchParams.get('limit')!)
        url = `${SCHEDULER_BASE_URL}/schedules/?${listQuery}`
        break
      }
    }

    const response = await fetch(url, { headers: getHeaders() })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { success: false, error: `Scheduler API error: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// POST — create | pause | resume | trigger
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const check = apiKeyCheck()
  if (check) return check

  try {
    const body = await request.json()
    const { action, scheduleId, ...params } = body

    let url: string
    let fetchBody: string | undefined

    switch (action) {
      // POST /schedules/{schedule_id}/trigger  → 202 Accepted
      case 'trigger': {
        if (!scheduleId) {
          return NextResponse.json({ success: false, error: 'scheduleId is required' }, { status: 400 })
        }
        url = `${SCHEDULER_BASE_URL}/schedules/${scheduleId}/trigger`
        break
      }

      // POST /schedules/{schedule_id}/pause  → 200 with updated schedule
      case 'pause': {
        if (!scheduleId) {
          return NextResponse.json({ success: false, error: 'scheduleId is required' }, { status: 400 })
        }
        url = `${SCHEDULER_BASE_URL}/schedules/${scheduleId}/pause`
        break
      }

      // POST /schedules/{schedule_id}/resume  → 200 with updated schedule
      case 'resume': {
        if (!scheduleId) {
          return NextResponse.json({ success: false, error: 'scheduleId is required' }, { status: 400 })
        }
        url = `${SCHEDULER_BASE_URL}/schedules/${scheduleId}/resume`
        break
      }

      // POST /schedules/  → 201 with created schedule
      case 'create':
      default: {
        if (!params.agent_id || !params.cron_expression || !params.message) {
          return NextResponse.json(
            { success: false, error: 'agent_id, cron_expression, and message are required' },
            { status: 400 }
          )
        }
        url = `${SCHEDULER_BASE_URL}/schedules/`
        fetchBody = JSON.stringify({
          agent_id: params.agent_id,
          cron_expression: params.cron_expression,
          message: params.message,
          timezone: params.timezone || 'UTC',
          user_id: LYZR_API_KEY,
          max_retries: params.max_retries ?? 3,
          retry_delay: params.retry_delay ?? 300,
        })
        break
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      ...(fetchBody && { body: fetchBody }),
    })

    // Trigger returns 202 Accepted with a string body
    if (action === 'trigger') {
      if (response.status === 202) {
        return NextResponse.json({ success: true, message: 'Schedule triggered successfully' })
      }
      const errorText = await response.text()
      return NextResponse.json(
        { success: false, error: `Trigger failed: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { success: false, error: `Scheduler API error: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// DELETE — delete schedule  (upstream returns 204 No Content)
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
  const check = apiKeyCheck()
  if (check) return check

  try {
    const body = await request.json()
    const { scheduleId } = body

    if (!scheduleId) {
      return NextResponse.json({ success: false, error: 'scheduleId is required' }, { status: 400 })
    }

    const response = await fetch(`${SCHEDULER_BASE_URL}/schedules/${scheduleId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })

    // Upstream returns 204 No Content on success
    if (response.status === 204 || response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Schedule deleted successfully',
        scheduleId,
      })
    }

    const errorText = await response.text()
    return NextResponse.json(
      { success: false, error: `Failed to delete schedule: ${response.status}`, details: errorText },
      { status: response.status }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
