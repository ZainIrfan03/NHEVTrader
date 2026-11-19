const linkStyle = {
  display: 'inline-block',
  padding: '12px 18px',
  borderRadius: 10,
  background: '#127a5b',
  color: '#fff',
  textDecoration: 'none',
  fontWeight: 700,
} as const

export default function BackendHome() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section style={{ width: 'min(680px, 100%)', background: '#fff', borderRadius: 20, padding: 36, boxShadow: '0 18px 50px rgba(20,45,35,.10)' }}>
        <p style={{ color: '#127a5b', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>NH EV Trader</p>
        <h1 style={{ fontSize: 38, margin: '10px 0 14px' }}>Commerce backend is running.</h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: '#52605a' }}>
          Manage products, variants, inventory, customers, orders, banners and website content from the Payload CMS dashboard.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 26 }}>
          <a href="/admin" style={linkStyle}>Open admin dashboard</a>
          <a href="/api/health" style={{ ...linkStyle, background: '#e7f2ee', color: '#127a5b' }}>Check API health</a>
        </div>
      </section>
    </main>
  )
}
