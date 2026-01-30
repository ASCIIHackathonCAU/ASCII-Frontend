import InboxDetailView from '@/modules/a/InboxDetailView'
import { getInboxDocuments } from '@/lib/inboxData'

type PageProps = {
  params: { id: string }
}

export default function InboxDetailPage({ params }: PageProps) {
  const documents = getInboxDocuments()
  const document = documents.find((item) => item.id === params.id) ?? null

  return <InboxDetailView document={document} />
}
