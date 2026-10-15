'use client'

import { useState } from 'react'
import {
  Bluetooth, Check, ChevronDown, Circle, Clock3, Copy, Download, FileText,
  Grid3X3, History, Image as ImageIcon, LayoutDashboard, Minus, MoreHorizontal,
  Move, PanelLeft, Pencil, Plus, Printer, QrCode, Redo2, RotateCcw, Save,
  Search, Settings, Shapes, Square, Sun, Type, Undo2, Upload, Wifi, X, Zap,
} from 'lucide-react'

const sizes = ['20 × 10 mm', '30 × 20 mm', '40 × 30 mm', '50 × 30 mm', '50 × 40 mm', '50 × 50 mm']
const tools = [
  { label: 'Text', icon: Type }, { label: 'Bild', icon: ImageIcon }, { label: 'QR-Code', icon: QrCode },
  { label: 'Barcode', icon: BarcodeIcon }, { label: 'Linie', icon: Minus }, { label: 'Form', icon: Shapes },
]
function BarcodeIcon({ size = 18 }: { size?: number }) { return <span style={{ fontSize: size, letterSpacing: -3, lineHeight: 1 }}>||| ||||</span> }

export default function Page() {
  const [active, setActive] = useState('Dashboard')
  const [connected, setConnected] = useState(false)
  const [selectedSize, setSelectedSize] = useState('50 × 50 mm')
  const [density, setDensity] = useState(62)
  const [copies, setCopies] = useState(1)
  const [toast, setToast] = useState('')

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2800) }
  const connect = () => { setConnected(true); notify('NIIMBOT B1 verbunden') }
  const print = () => notify(`Druckauftrag erstellt · ${copies} ${copies === 1 ? 'Kopie' : 'Kopien'}`)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Printer size={19} /></div><div><strong>NIIMBOT</strong><span>Universal Label Studio</span></div></div>
        <div className="workspace-label">ARBEITSBEREICH</div>
        <nav className="nav-list">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={active === 'Dashboard'} onClick={() => setActive('Dashboard')} />
          <NavItem icon={Pencil} label="Etiketteneditor" active={active === 'Etiketteneditor'} onClick={() => setActive('Etiketteneditor')} />
          <NavItem icon={FileText} label="Vorlagen" active={active === 'Vorlagen'} onClick={() => setActive('Vorlagen')} />
          <NavItem icon={Printer} label="Drucker" active={active === 'Drucker'} onClick={() => setActive('Drucker')} />
        </nav>
        <div className="workspace-label settings-label">SYSTEM</div>
        <nav className="nav-list"><NavItem icon={Settings} label="Einstellungen" active={active === 'Einstellungen'} onClick={() => setActive('Einstellungen')} /></nav>
        <div className="sidebar-bottom"><div className="status-card"><div className="status-dot" /><div><b>{connected ? 'NIIMBOT B1' : 'Kein Drucker'}</b><span>{connected ? 'Bereit zum Drucken' : 'Nicht verbunden'}</span></div><MoreHorizontal size={17} /></div><div className="profile"><div className="avatar">LM</div><div><b>Lokaler Workspace</b><span>Nur auf diesem Gerät</span></div><ChevronDown size={16} /></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="breadcrumb"><span>Arbeitsbereich</span><span>/</span><b>{active}</b></div><div className="top-actions"><button className="icon-btn" aria-label="Darstellung"><Sun size={18} /></button><div className={`connection-pill ${connected ? 'online' : ''}`}><span className="signal"><Wifi size={15} /></span><span>{connected ? 'B1 verbunden' : 'Nicht verbunden'}</span></div><button className="connect-btn" onClick={connected ? () => { setConnected(false); notify('Drucker getrennt') } : connect}><Bluetooth size={16} />{connected ? 'Trennen' : 'Drucker verbinden'}</button></div></header>

        {active === 'Etiketteneditor' ? <Editor selectedSize={selectedSize} setSelectedSize={setSelectedSize} density={density} setDensity={setDensity} copies={copies} setCopies={setCopies} print={print} notify={notify} /> : <Dashboard connected={connected} connect={connect} print={print} notify={notify} setActive={setActive} />}
        {toast && <div className="toast"><Check size={16} />{toast}</div>}
      </main>
    </div>
  )
}

function NavItem({ icon: Icon, label, active, onClick }: any) { return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}><Icon size={18} /><span>{label}</span>{active && <span className="nav-indicator" />}</button> }

function Dashboard({ connected, connect, print, notify, setActive }: any) {
  return <div className="page-wrap"><section className="hero"><div><div className="eyebrow"><span className="eyebrow-line" />UNIVERSAL LABEL STUDIO</div><h1>Etiketten. Einfach.<br /><em>Unabhängig.</em></h1><p>Gestalte und drucke professionelle Etiketten direkt<br />mit deinem NIIMBOT B1 — ohne Hersteller-App.</p><div className="hero-actions"><button className="primary-btn" onClick={() => setActive('Etiketteneditor')}><Plus size={18} />Neues Etikett erstellen</button><button className="secondary-btn" onClick={connected ? print : connect}>{connected ? <><Printer size={17} />Testetikett drucken</> : <><Bluetooth size={17} />Drucker verbinden</>}</button></div></div><div className="hero-visual"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="label-preview"><div className="preview-code">NIIMBOT</div><div className="preview-main">Hello<br /><span>World</span></div><div className="preview-bar">|||| ||| |||| | |||</div></div><div className="visual-caption"><span className="live-dot" />BEREIT FÜR DEINEN DRUCK</div></div></section>
    <div className="section-heading"><div><h2>Dein Arbeitsbereich</h2><p>Alles, was du für deinen nächsten Druck brauchst.</p></div><button className="text-btn" onClick={() => setActive('Vorlagen')}>Alle Vorlagen <span>→</span></button></div>
    <section className="dashboard-grid"><div className="card recent-card"><div className="card-heading"><div><span className="card-kicker">ZULETZT BEARBEITET</span><h3>Meine Etiketten</h3></div><button className="dots-btn"><MoreHorizontal size={18} /></button></div><div className="template-row"><Template name="Küchenvorrat" size="50 × 50 mm" tone="sage" /><Template name="Versandetikett" size="50 × 30 mm" tone="blue" /><button className="add-template" onClick={() => setActive('Etiketteneditor')}><Plus size={21} /><span>Neues<br />Etikett</span></button></div></div><div className="card printer-card"><div className="card-heading"><div><span className="card-kicker">DRUCKERSTATUS</span><h3>{connected ? 'NIIMBOT B1' : 'Noch nicht verbunden'}</h3></div><div className={`big-status ${connected ? 'ready' : ''}`}><span />{connected ? 'Bereit' : 'Offline'}</div></div><div className="printer-detail"><div className="printer-icon"><Printer size={24} /></div><div><b>{connected ? 'Bluetooth-Verbindung aktiv' : 'Verbinde deinen Drucker'}</b><span>{connected ? 'Protokoll v4 · 203 dpi' : 'Direkter Druck über Web Bluetooth'}</span></div></div><button className="outline-wide" onClick={connected ? print : connect}>{connected ? 'Testetikett drucken' : 'Jetzt verbinden'} <span>→</span></button></div></section>
    <section className="info-strip"><div className="info-icon"><Zap size={18} /></div><div><b>Manuelle Etikettensteuerung</b><span>Deine Etikettengröße wird direkt festgelegt — unabhängig von RFID.</span></div><div className="info-meta"><span>50 × 50 mm</span><span className="meta-sep" /> <span>203 dpi</span></div><button className="circle-arrow" onClick={() => setActive('Etiketteneditor')}>→</button></section>
  </div>
}

function Template({ name, size, tone }: any) { return <button className="template-item"><div className={`mini-label ${tone}`}><span>{name === 'Küchenvorrat' ? 'PASTA' : 'SENDUNG'}</span><small>{name === 'Küchenvorrat' ? '01 / 2025' : 'DE-10115'}</small></div><b>{name}</b><span>{size}</span></button> }

function Editor({ selectedSize, setSelectedSize, density, setDensity, copies, setCopies, print, notify }: any) { return <div className="editor-page"><div className="editor-top"><div><div className="eyebrow"><span className="eyebrow-line" />ETIKETTENVORLAGE</div><h1>Neues Etikett</h1></div><div className="editor-actions"><button className="secondary-btn small" onClick={() => notify('Vorlage lokal gespeichert')}><Save size={16} />Speichern</button><button className="primary-btn small" onClick={print}><Printer size={16} />Drucken</button></div></div><div className="editor-layout"><div className="tools-panel"><span className="card-kicker">ELEMENTE</span>{tools.map(({ label, icon: Icon }) => <button className="tool-btn" key={label} onClick={() => notify(`${label} hinzugefügt`)}><span className="tool-icon"><Icon size={18} /></span>{label}<Plus size={14} /></button>)}<div className="tools-divider" /><span className="card-kicker">BEARBEITEN</span><div className="edit-icons"><button onClick={() => notify('Rückgängig')}><Undo2 size={17} /></button><button onClick={() => notify('Wiederhergestellt')}><Redo2 size={17} /></button><button onClick={() => notify('Raster aktiviert')}><Grid3X3 size={17} /></button></div></div><div className="canvas-area"><div className="canvas-toolbar"><span><Move size={15} />50 × 50 mm · 400 × 400 px</span><span>100%</span></div><div className="canvas-stage"><div className="ruler top-ruler">0 <span>100</span><span>200</span><span>300</span><span>400 px</span></div><div className="design-label"><div className="design-logo">N</div><div className="design-text">NIIMBOT<br /><strong>UNIVERSAL</strong></div><div className="design-rule" /><div className="design-product">KÜCHENVORRAT</div><div className="design-sub">HALTBAR BIS · 01 / 2025</div><div className="design-barcode">||||| || ||||| || ||||</div><div className="selection-box"><span className="handle nw" /><span className="handle ne" /><span className="handle sw" /><span className="handle se" /></div></div></div><div className="canvas-footer"><button onClick={() => notify('Vorschau exportiert')}><Download size={15} />PNG exportieren</button><span><Circle size={8} fill="currentColor" /> Automatisch gespeichert</span></div></div><aside className="properties-panel"><span className="card-kicker">ETIKETTENGRÖSSE</span><div className="size-grid">{sizes.map(s => <button key={s} className={selectedSize === s ? 'selected' : ''} onClick={() => setSelectedSize(s)}>{s}</button>)}</div><button className="custom-size" onClick={() => notify('Benutzerdefinierte Größe')}>+ Benutzerdefiniert</button><div className="property-section"><div className="property-label"><span>Druckdichte</span><b>{density}%</b></div><input type="range" min="20" max="100" value={density} onChange={e => setDensity(Number(e.target.value))} /></div><div className="property-section"><div className="property-label"><span>Ausrichtung</span><span className="segmented"><button className="seg-active">↕</button><button>↔</button></span></div></div><div className="property-section"><div className="property-label"><span>Kopien</span><div className="stepper"><button onClick={() => setCopies(Math.max(1, copies - 1))}>−</button><b>{copies}</b><button onClick={() => setCopies(copies + 1)}>+</button></div></div></div><div className="rfid-note"><Zap size={16} /><div><b>Manuelle Steuerung aktiv</b><span>RFID wird für dieses Format nicht benötigt.</span></div></div></aside></div></div> }


<style jsx>{``}</style>
