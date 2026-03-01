'use client'

/**
 * RAG Knowledge Base Client Utility
 *
 * Client-side wrapper for managing RAG Knowledge Base via API routes.
 */

import { useState } from 'react'
import fetchWrapper from '@/lib/fetchWrapper'

// Supported file types
export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const

export type SupportedFileType = (typeof SUPPORTED_FILE_TYPES)[number]

export const FILE_EXTENSION_MAP: Record<string, SupportedFileType> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain',
}

// Types
export interface RAGDocument {
  id?: string
  fileName: string
  fileType: 'pdf' | 'docx' | 'txt'
  fileSize?: number
  status?: 'processing' | 'active' | 'failed' | 'deleted'
  uploadedAt?: string
  documentCount?: number
}

export interface GetDocumentsResponse {
  success: boolean
  documents?: RAGDocument[]
  ragId?: string
  error?: string
  timestamp?: string
}

export interface UploadResponse {
  success: boolean
  message?: string
  fileName?: string
  fileType?: string
  documentCount?: number
  ragId?: string
  error?: string
  timestamp?: string
}

export interface DeleteResponse {
  success: boolean
  message?: string
  deletedCount?: number
  ragId?: string
  error?: string
  timestamp?: string
}

export interface CrawlResponse {
  success: boolean
  message?: string
  url?: string
  ragId?: string
  error?: string
  timestamp?: string
}

/**
 * Get all documents in a knowledge base
 */
export async function getDocuments(ragId: string): Promise<GetDocumentsResponse> {
  try {
    const response = await fetchWrapper('/api/rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ragId }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Upload and train a document to the knowledge base
 */
export async function uploadAndTrainDocument(ragId: string, file: File): Promise<UploadResponse> {
  // Validate file type
  if (!SUPPORTED_FILE_TYPES.includes(file.type as SupportedFileType)) {
    return {
      success: false,
      error: `Unsupported file type: ${file.type}. Supported: PDF, DOCX, TXT`,
    }
  }

  try {
    const formData = new FormData()
    formData.append('ragId', ragId)
    formData.append('file', file, file.name)

    const response = await fetchWrapper('/api/rag', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Delete documents from knowledge base
 */
export async function deleteDocuments(
  ragId: string,
  documentNames: string[]
): Promise<DeleteResponse> {
  try {
    const response = await fetchWrapper('/api/rag', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ragId, documentNames }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Crawl a website and add its content to the knowledge base
 */
export async function crawlWebsite(ragId: string, url: string): Promise<CrawlResponse> {
  try {
    const response = await fetchWrapper('/api/rag', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ragId, url }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Validate if a file type is supported
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!SUPPORTED_FILE_TYPES.includes(file.type as SupportedFileType)) {
    return {
      valid: false,
      error: `Unsupported file type. Supported formats: PDF, DOCX, TXT`,
    }
  }
  return { valid: true }
}

/**
 * Check if file type is supported
 */
export function isFileTypeSupported(fileType: string): boolean {
  return SUPPORTED_FILE_TYPES.includes(fileType as SupportedFileType)
}

/**
 * React hook for RAG Knowledge Base management
 */
export function useRAGKnowledgeBase() {
  const [documents, setDocuments] = useState<RAGDocument[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = async (ragId: string) => {
    setLoading(true)
    setError(null)

    const result = await getDocuments(ragId)

    if (result.success) {
      setDocuments(result.documents || [])
    } else {
      setError(result.error || 'Failed to fetch documents')
    }

    setLoading(false)
    return result
  }

  const uploadDocument = async (ragId: string, file: File) => {
    setLoading(true)
    setError(null)

    const result = await uploadAndTrainDocument(ragId, file)

    if (result.success) {
      // Refresh documents list
      await fetchDocuments(ragId)
    } else {
      setError(result.error || 'Failed to upload document')
    }

    setLoading(false)
    return result
  }

  const removeDocuments = async (ragId: string, documentNames: string[]) => {
    setLoading(true)
    setError(null)

    const result = await deleteDocuments(ragId, documentNames)

    if (result.success) {
      setDocuments((prev: RAGDocument[] | null) =>
        prev ? prev.filter((doc: RAGDocument) => !documentNames.includes(doc.fileName)) : null
      )
    } else {
      setError(result.error || 'Failed to delete documents')
    }

    setLoading(false)
    return result
  }

  const crawlSite = async (ragId: string, url: string) => {
    setLoading(true)
    setError(null)

    const result = await crawlWebsite(ragId, url)

    if (!result.success) {
      setError(result.error || 'Failed to crawl website')
    }

    setLoading(false)
    return result
  }

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    removeDocuments,
    crawlSite,
  }
}
