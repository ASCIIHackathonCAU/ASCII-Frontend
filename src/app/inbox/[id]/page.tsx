'use client'

import { useState, useEffect } from 'react'
import InboxDetailView from '@/modules/a/InboxDetailView'
import { getInboxDocuments } from '@/lib/inboxData'
import type { DocumentListItem } from '@/lib/inboxData'

type PageProps = {
  params: { id: string }
}

export default function InboxDetailPage({ params }: PageProps) {
  const [document, setDocument] = useState<DocumentListItem | null>(null)

  useEffect(() => {
    getInboxDocuments()
      .then((documents) => {
        const found = documents.find((item) => item.id === params.id) ?? null
        setDocument(found)
      })
      .catch(() => setDocument(null))
  }, [params.id])

  return <InboxDetailView document={document} />
}
