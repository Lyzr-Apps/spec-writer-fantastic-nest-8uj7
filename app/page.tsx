import NextDynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'

const SpecDraftApp = NextDynamic(() => import('./sections/SpecDraftApp'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '24px',
            height: '24px',
            border: '2px solid #e5e7eb',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <span style={{ fontSize: '14px', color: '#6b7280' }}>Loading SpecDraft...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  ),
})

export default function Page() {
  return <SpecDraftApp />
}
