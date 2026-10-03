import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  Download,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import './App.css'

const STORAGE_KEY = 'careflow-patients-v1'
const today = new Date()
const todayLabel = new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(today)
const careRoundLabel = `${new Intl.DateTimeFormat('en', { weekday: 'long' }).format(today).toUpperCase()} CARE ROUND`

const initialPatients = [
  {
    id: 'PT-2048', name: 'Munna Thakur', age: 47, gender: 'Male',
    symptoms: 'Persistent headache and neck tension', diagnosis: 'Tension headache', severity: 'Low',
    ward: 'General', doctor: 'Dr. Sharma', status: 'In consultation', time: '09:24 AM',
    treatment: 'Rest, hydration, and follow up if symptoms worsen.', prevention: 'Stay hydrated, take regular breaks, and keep a consistent sleep schedule.',
    medicine: 'A10', dosage: '5 mg', reminder: '01:19 AM', color: 'sage',
  },
  {
    id: 'PT-2047', name: 'Aarav Mehta', age: 32, gender: 'Male',
    symptoms: 'Chest tightness and shortness of breath', diagnosis: 'Needs urgent assessment', severity: 'High',
    ward: 'Emergency', doctor: 'Dr. Khan', status: 'Urgent review', time: '09:18 AM',
    treatment: 'Immediate in-person assessment required.', prevention: 'Follow the care team\'s instructions after evaluation.',
    medicine: '', dosage: '', reminder: '', color: 'coral',
  },
  {
    id: 'PT-2046', name: 'Priya Nair', age: 26, gender: 'Female',
    symptoms: 'Low-grade fever and sore throat', diagnosis: 'Upper respiratory symptoms', severity: 'Moderate',
    ward: 'General', doctor: 'Dr. Iyer', status: 'Waiting', time: '09:10 AM',
    treatment: 'Monitor symptoms and arrange a clinician review.', prevention: 'Rest, fluids, and good hand hygiene.',
    medicine: '', dosage: '', reminder: '', color: 'lilac',
  },
  {
    id: 'PT-2045', name: 'Kabir Singh', age: 54, gender: 'Male',
    symptoms: 'Stress, poor sleep, and low mood', diagnosis: 'Wellbeing review recommended', severity: 'Moderate',
    ward: 'Mental health', doctor: 'Dr. Mehta', status: 'In consultation', time: '08:52 AM',
    treatment: 'A private clinician conversation is recommended.', prevention: 'Maintain a routine and reach out to a trusted person.',
    medicine: '', dosage: '', reminder: '', color: 'blue',
  },
  {
    id: 'PT-2044', name: 'Sana Qureshi', age: 38, gender: 'Female',
    symptoms: 'Mild cough and seasonal allergies', diagnosis: 'Allergy symptoms', severity: 'Low',
    ward: 'General', doctor: 'Dr. Sharma', status: 'Completed', time: '08:34 AM',
    treatment: 'Avoid known triggers and seek care if breathing becomes difficult.', prevention: 'Keep windows closed on high pollen days.',
    medicine: '', dosage: '', reminder: '', color: 'peach',
  },
]

const careTeam = [
  { name: 'Dr. Sharma', role: 'General medicine', ward: 'General', status: 'Available', next: '09:40 AM', patients: 4, initials: 'AS', color: 'sage' },
  { name: 'Dr. Iyer', role: 'General medicine', ward: 'General', status: 'In consultation', next: '09:55 AM', patients: 6, initials: 'RI', color: 'lilac' },
  { name: 'Dr. Khan', role: 'Emergency care', ward: 'Emergency', status: 'Available', next: '09:30 AM', patients: 2, initials: 'AK', color: 'coral' },
  { name: 'Dr. Mehta', role: 'Mental health', ward: 'Mental health', status: 'In consultation', next: '10:00 AM', patients: 3, initials: 'NM', color: 'blue' },
  { name: 'Dr. Gupta', role: 'Mental health', ward: 'Mental health', status: 'Available', next: '10:15 AM', patients: 1, initials: 'PG', color: 'peach' },
]

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Patients', icon: UsersRound },
  { label: 'Care team', icon: Stethoscope },
  { label: 'Reports', icon: ClipboardList },
]

function loadPatients() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : initialPatients
  } catch {
    return initialPatients
  }
}

function assessSymptoms(text) {
  const symptoms = text.toLowerCase()
  if (/chest pain|chest tight|breathless|shortness of breath|unconscious|seizure|severe bleeding/.test(symptoms)) {
    return { diagnosis: 'Needs urgent assessment', severity: 'High', ward: 'Emergency', treatment: 'Immediate in-person assessment required.' }
  }
  if (/anxiety|panic|stress|low mood|depress|sleep/.test(symptoms)) {
    return { diagnosis: 'Wellbeing review recommended', severity: 'Moderate', ward: 'Mental health', treatment: 'A private clinician conversation is recommended.' }
  }
  if (/fever|sore throat|infection|vomit|dizz|pain/.test(symptoms)) {
    return { diagnosis: 'Further review recommended', severity: 'Moderate', ward: 'General', treatment: 'Monitor symptoms and arrange a clinician review.' }
  }
  return { diagnosis: /headache/.test(symptoms) ? 'Possible tension headache' : 'Initial review recommended', severity: 'Low', ward: 'General', treatment: 'Rest and hydration may help while awaiting clinician review.' }
}

function saveTextFile(name, content, type = 'text/plain') {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([content], { type }))
  link.download = name
  link.click()
  URL.revokeObjectURL(link.href)
}

function App() {
  const [patients, setPatients] = useState(loadPatients)
  const [activePage, setActivePage] = useState('Overview')
  const [selectedId, setSelectedId] = useState('PT-2048')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [showNewPatient, setShowNewPatient] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [toast, setToast] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [form, setForm] = useState({ name: '', age: '', gender: 'Female', symptoms: '' })

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(patients))
    } catch (error) {
      console.warn('Careflow could not save data to local storage.', error)
    }
  }, [patients])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const selectedPatient = patients.find((patient) => patient.id === selectedId) ?? patients[0]
  const filteredPatients = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return patients.filter((patient) => !normalized || `${patient.name} ${patient.id} ${patient.ward} ${patient.diagnosis}`.toLowerCase().includes(normalized))
  }, [patients, query])
  const urgentCount = patients.filter((patient) => patient.severity === 'High' && patient.status !== 'Completed').length
  const waitingCount = patients.filter((patient) => patient.status === 'Waiting' || patient.status === 'Urgent review').length

  function addPatient(event) {
    event.preventDefault()
    const assessment = assessSymptoms(form.symptoms)
    const doctor = careTeam.find((member) => member.ward === assessment.ward && member.status === 'Available')?.name ?? 'Pending assignment'
    const patient = {
      id: `PT-${2049 + patients.length - initialPatients.length}`,
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      symptoms: form.symptoms.trim(),
      ...assessment,
      doctor,
      status: assessment.severity === 'High' ? 'Urgent review' : 'Waiting',
      time: new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      prevention: 'Follow the care team\'s guidance and seek urgent help if symptoms worsen.',
      medicine: '', dosage: '', reminder: '', color: ['sage', 'coral', 'lilac', 'blue', 'peach'][patients.length % 5],
    }
    setPatients((current) => [patient, ...current])
    setSelectedId(patient.id)
    setActivePage('Patients')
    setShowNewPatient(false)
    setForm({ name: '', age: '', gender: 'Female', symptoms: '' })
    setToast('Patient added and triage summary created.')
  }

  function updatePatient(id, updates) {
    setPatients((current) => current.map((patient) => patient.id === id ? { ...patient, ...updates } : patient))
  }

  function downloadPatientReport(patient) {
    if (!patient) return
    const report = [
      'CAREFLOW | PATIENT VISIT SUMMARY',
      'DEMO RECORD — NOT A MEDICAL DIAGNOSIS',
      '',
      `Patient: ${patient.name} (${patient.id})`,
      `Age: ${patient.age}   Gender: ${patient.gender}`,
      `Symptoms: ${patient.symptoms}`,
      `Triage suggestion: ${patient.diagnosis} (${patient.severity})`,
      `Suggested unit: ${patient.ward}`,
      `Assigned clinician: ${patient.doctor}`,
      `Visit status: ${patient.status}`,
      `Treatment note: ${patient.treatment}`,
      `Prevention: ${patient.prevention}`,
      patient.medicine ? `Medicine reminder: ${patient.medicine}, ${patient.dosage}, ${patient.reminder}` : 'Medicine reminder: Not set',
      '',
      'This demo is not a substitute for care from a qualified healthcare professional.',
    ].join('\n')
    saveTextFile(`${patient.id}-visit-summary.txt`, report)
    setToast('Visit summary downloaded.')
  }

  function downloadAllPatients() {
    const header = ['ID', 'Name', 'Age', 'Gender', 'Symptoms', 'Triage suggestion', 'Severity', 'Unit', 'Clinician', 'Status']
    const rows = patients.map((patient) => [patient.id, patient.name, patient.age, patient.gender, patient.symptoms, patient.diagnosis, patient.severity, patient.ward, patient.doctor, patient.status])
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    saveTextFile('careflow-patient-list.csv', csv, 'text/csv')
    setToast('Patient list exported as CSV.')
  }

  function setReminder(patientId, event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const medicine = String(data.get('medicine')).trim()
    const dosage = String(data.get('dosage')).trim()
    const reminder = String(data.get('reminder'))
    if (!patients.some((patient) => patient.id === patientId) || !medicine || !dosage || !reminder) return
    const formattedTime = new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date(`2000-01-01T${reminder}`))
    updatePatient(patientId, { medicine, dosage, reminder: formattedTime })
    setToast('Reminder saved to this browser. Notifications require permission and an open app.')
  }

  const pageTitle = activePage === 'Overview' ? 'Good morning, Dr. Patel' : activePage
  const pageSubtitle = activePage === 'Overview'
    ? 'Here is your clinic snapshot for today.'
    : activePage === 'Patients'
      ? 'Review visits, triage summaries, and follow-up notes.'
      : activePage === 'Care team'
        ? 'Today\'s clinicians and unit availability.'
        : activePage === 'Reports'
          ? 'Export visit summaries and your local patient register.'
          : 'Manage this browser-based demo workspace.'

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#overview" onClick={() => setActivePage('Overview')} aria-label="Careflow home">
          <span className="brand-mark"><HeartPulse size={21} strokeWidth={2.4} /></span>
          <span>careflow<span className="brand-period">.</span><small>CLINIC WORKSPACE</small></span>
        </a>

        <div className="clinic-switcher">
          <span className="clinic-avatar">NC</span>
          <span className="clinic-copy"><strong>Northside Clinic</strong><small>Care workspace</small></span>
          <ChevronDown size={15} />
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button className={`nav-item ${activePage === label ? 'nav-active' : ''}`} key={label} onClick={() => { setActivePage(label); setMobileMenuOpen(false) }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {label === 'Patients' && <span className="nav-count">{patients.length}</span>}
              {label === 'Overview' && urgentCount > 0 && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-safety"><ShieldCheck size={17} /><span>Demo workspace<small>Data stays in this browser</small></span></div>
          <button className={`nav-item ${activePage === 'Settings' ? 'nav-active' : ''}`} onClick={() => { setActivePage('Settings'); setMobileMenuOpen(false) }}><Settings2 size={18} /><span>Settings</span></button>
          <div className="user-profile"><span className="user-avatar">DP</span><span className="user-copy"><strong>Dr. Patel</strong><small>Clinic administrator</small></span><button className="icon-button profile-more" title="Account options" onClick={() => setToast('Signed in as Dr. Patel · demo account')}><Menu size={17} /></button></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" aria-label="Open menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu size={20} /></button>
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{activePage}</strong></div>
          <div className="topbar-actions">
            <label className="search-box"><Search size={16} /><input aria-label="Search patients" placeholder="Search patients..." value={search} onChange={(event) => { setSearch(event.target.value); setQuery(event.target.value) }} /><kbd>⌘ K</kbd></label>
            <div className="notification-wrap">
              <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setShowNotifications((visible) => !visible)}><Bell size={19} />{urgentCount > 0 && <span className="notification-dot" />}</button>
              {showNotifications && <div className="notification-popover"><strong>Needs your attention</strong>{urgentCount ? <p>{urgentCount} patient{urgentCount > 1 ? 's' : ''} flagged for urgent review.</p> : <p>No urgent reviews right now.</p>}<button onClick={() => { setActivePage('Patients'); setShowNotifications(false) }}>View patient queue <ArrowRight size={14} /></button></div>}
            </div>
            <span className="topbar-divider" />
            <span className="today-date"><CalendarDays size={15} />{todayLabel}</span>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div><div className="eyebrow"><span className="live-indicator" /> {careRoundLabel}</div><h1>{pageTitle}</h1><p>{pageSubtitle}</p></div>
            <div className="heading-actions">
              {activePage === 'Reports' && <button className="button button-secondary" onClick={downloadAllPatients}><Download size={16} /> Export CSV</button>}
              {(activePage === 'Overview' || activePage === 'Patients') && <button className="button button-primary" onClick={() => setShowNewPatient(true)}><Plus size={17} /> New patient</button>}
            </div>
          </div>

          {activePage === 'Overview' && <Overview
            patients={patients} selectedPatient={selectedPatient} filteredPatients={filteredPatients}
            waitingCount={waitingCount} urgentCount={urgentCount} onSelect={(patient) => setSelectedId(patient.id)}
            onViewPatients={() => setActivePage('Patients')} onAdd={() => setShowNewPatient(true)}
            onDownload={() => downloadPatientReport(selectedPatient)} onReminder={setReminder} onUpdate={updatePatient} onCareTeam={() => setActivePage('Care team')}
          />}
          {activePage === 'Patients' && <PatientsView patients={filteredPatients} selectedId={selectedId} onSelect={(patient) => setSelectedId(patient.id)} onDownload={downloadPatientReport} onUpdate={updatePatient} onReminder={setReminder} />}
          {activePage === 'Care team' && <CareTeamView patients={patients} />}
          {activePage === 'Reports' && <ReportsView patients={patients} onDownload={downloadPatientReport} onExport={downloadAllPatients} />}
          {activePage === 'Settings' && <SettingsView patientCount={patients.length} onExport={downloadAllPatients} onReset={() => { setPatients(initialPatients); setSelectedId(initialPatients[0].id); setToast('Demo records restored.') }} />}

          <footer className="page-footer"><span><ShieldCheck size={14} /> Careflow demo · Browser-stored data</span><span>Not for emergency or clinical decision-making</span></footer>
        </div>
      </main>

      {showNewPatient && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowNewPatient(false) }}>
        <section className="patient-modal" role="dialog" aria-modal="true" aria-labelledby="new-patient-title">
          <div className="modal-heading"><div><span className="modal-icon"><UserRound size={19} /></span><div><h2 id="new-patient-title">Add patient</h2><p>Create a visit and triage summary.</p></div></div><button className="icon-button" aria-label="Close dialog" onClick={() => setShowNewPatient(false)}><X size={19} /></button></div>
          <form className="patient-form" onSubmit={addPatient}>
            <label>Patient name<input required maxLength="70" autoFocus placeholder="e.g. Aanya Kapoor" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <div className="form-row"><label>Age<input required type="number" min="0" max="120" placeholder="Age" value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} /></label><label>Gender<select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></label></div>
            <label>Symptoms<textarea required minLength="3" rows="4" placeholder="Describe the patient's symptoms..." value={form.symptoms} onChange={(event) => setForm({ ...form, symptoms: event.target.value })} /></label>
            <div className="form-disclaimer"><Activity size={15} /> Demo triage uses simple keywords. A qualified clinician must review every case.</div>
            <div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setShowNewPatient(false)}>Cancel</button><button type="submit" className="button button-primary"><Plus size={16} /> Create visit</button></div>
          </form>
        </section>
      </div>}

      {toast && <div className="toast" role="status"><CheckCircle2 size={17} />{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15} /></button></div>}
    </div>
  )
}

function Overview({ patients, selectedPatient, filteredPatients, waitingCount, urgentCount, onSelect, onViewPatients, onAdd, onDownload, onReminder, onUpdate, onCareTeam }) {
  const completedCount = patients.filter((patient) => patient.status === 'Completed').length
  return <>
    <section className="metric-grid" aria-label="Today's clinic metrics">
      <MetricCard label="Patients today" value={String(patients.length).padStart(2, '0')} change="Across all care units" icon={UsersRound} tone="mint" trend="up" />
      <MetricCard label="Waiting for review" value={String(waitingCount).padStart(2, '0')} change="In today's queue" icon={Clock3} tone="yellow" trend="flat" />
      <MetricCard label="Urgent attention" value={String(urgentCount).padStart(2, '0')} change={urgentCount ? 'Review as soon as possible' : 'No urgent cases'} icon={Activity} tone="rose" trend="down" />
      <MetricCard label="Visits completed" value={String(completedCount).padStart(2, '0')} change="Ready for follow-up" icon={CheckCircle2} tone="blue" trend="up" />
    </section>

    <div className="dashboard-grid">
      <section className="panel queue-panel">
        <div className="panel-heading"><div><span className="section-kicker">LIVE QUEUE</span><h2>Patient overview <span className="heading-count">{filteredPatients.length}</span></h2></div><button className="text-button" onClick={onViewPatients}>All patients <ArrowRight size={15} /></button></div>
        <div className="queue-table-wrap"><table className="queue-table"><thead><tr><th>Patient</th><th>Initial assessment</th><th>Priority</th><th>Clinician</th><th>Status</th><th aria-label="Select patient" /></tr></thead><tbody>
          {filteredPatients.slice(0, 5).map((patient) => <tr key={patient.id} className={selectedPatient?.id === patient.id ? 'row-selected' : ''} onClick={() => onSelect(patient)}>
            <td><div className="patient-cell"><Avatar name={patient.name} color={patient.color} /><span><strong>{patient.name}</strong><small>{patient.id} · {patient.age} yrs</small></span></div></td>
            <td><span className="assessment-name">{patient.diagnosis}</span><small className="table-subtext">{patient.time}</small></td>
            <td><Severity severity={patient.severity} /></td>
            <td><span className="doctor-name">{patient.doctor}</span></td>
            <td><Status status={patient.status} /></td>
            <td><button className="row-arrow" aria-label={`View ${patient.name}`} onClick={(event) => { event.stopPropagation(); onSelect(patient) }}><ArrowRight size={15} /></button></td>
          </tr>)}
          {!filteredPatients.length && <tr><td colSpan="6" className="empty-state">No patients match your search. Try another name or ID.</td></tr>}
        </tbody></table></div>
        <div className="queue-footer"><span>Showing <strong>{Math.min(filteredPatients.length, 5)}</strong> of <strong>{filteredPatients.length}</strong> visits</span><button className="subtle-button" onClick={onAdd}><Plus size={15} /> Add visit</button></div>
      </section>

      <PatientDetail patient={selectedPatient} onDownload={onDownload} onReminder={onReminder} onUpdate={onUpdate} />
    </div>

    <section className="lower-grid">
      <div className="panel activity-panel"><div className="panel-heading"><div><span className="section-kicker">CARE ACTIVITY</span><h2>Today's flow</h2></div><span className="live-pill"><span /> Live</span></div>
        <div className="flow-chart"><div className="chart-axis"><span>12</span><span>9</span><span>6</span><span>3</span><span>0</span></div><div className="chart-main"><div className="chart-grid-lines"><i /><i /><i /><i /><i /></div><div className="chart-bars">{[4, 6, 5, 8, 7, 10, 8, 6, 9, 5, 7, 4].map((height, index) => <div className="chart-bar-column" key={index}><span className="chart-bar" style={{ '--bar-height': `${height * 8}%`, '--bar-delay': `${index * 35}ms` }} /><span className="chart-bar-soft" style={{ '--bar-height': `${Math.max(12, height * 5)}%` }} /></div>)}</div><div className="chart-labels"><span>8 AM</span><span>9 AM</span><span>10 AM</span><span>11 AM</span><span>12 PM</span><span>1 PM</span></div></div></div>
        <div className="chart-legend"><span><i className="legend-primary" />Patient visits</span><span><i className="legend-secondary" />Completed</span><span className="chart-update">Updated just now</span></div>
      </div>
      <div className="panel schedule-panel"><div className="panel-heading"><div><span className="section-kicker">UP NEXT</span><h2>Care team schedule</h2></div><button className="icon-button small-icon-button" aria-label="View care team" onClick={onCareTeam}><ArrowRight size={16} /></button></div>
        <div className="schedule-list">{careTeam.slice(0, 4).map((doctor, index) => <div className="schedule-row" key={doctor.name}><span className="schedule-time">{['09:30', '09:40', '09:55', '10:00'][index]}</span><span className={`schedule-line ${index === 0 ? 'schedule-current' : ''}`} /><Avatar name={doctor.name} color={doctor.color} small /><span className="schedule-doctor"><strong>{doctor.name}</strong><small>{doctor.role}</small></span><span className={`availability-dot ${doctor.status === 'Available' ? 'available' : ''}`} title={doctor.status} /></div>)}</div>
        <div className="schedule-note"><Clock3 size={14} /> Average wait <strong>18 min</strong><span>·</span> 3 clinicians available</div>
      </div>
    </section>
  </>
}

function MetricCard({ label, value, change, icon: Icon, tone, trend }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}><Icon size={18} strokeWidth={1.9} /></span></div><div className="metric-value">{value}<span className={`metric-trend ${trend}`} aria-label={trend === 'down' ? 'Attention needed' : 'On track'}>{trend === 'down' ? <ArrowDownRight size={15} /> : trend === 'up' ? <ArrowUpRight size={15} /> : <span />}</span></div><div className="metric-change">{change}</div></article>
}

function Avatar({ name, color = 'sage', small = false }) {
  const initials = name.split(' ').filter((word) => !['Dr.'].includes(word)).slice(0, 2).map((word) => word[0]).join('').toUpperCase()
  return <span className={`avatar avatar-${color} ${small ? 'avatar-small' : ''}`}>{initials}</span>
}

function Severity({ severity }) {
  return <span className={`severity severity-${severity.toLowerCase()}`}><i />{severity}</span>
}

function Status({ status }) {
  return <span className={`status status-${status.toLowerCase().replaceAll(' ', '-')}`}><i />{status}</span>
}

function PatientDetail({ patient, onDownload, onReminder, onUpdate }) {
  const [showReminder, setShowReminder] = useState(false)
  if (!patient) return <section className="panel detail-panel detail-empty">Select a patient to view their visit summary.</section>
  return <section className="panel detail-panel">
    <div className="detail-head"><div><span className="section-kicker">VISIT SUMMARY</span><button className="icon-button small-icon-button detail-menu" aria-label="Download patient summary" onClick={onDownload}><Download size={16} /></button></div>
      <div className="detail-person"><Avatar name={patient.name} color={patient.color} /><div><h2>{patient.name}</h2><p>{patient.id} <span>·</span> {patient.age} years <span>·</span> {patient.gender}</p></div></div>
      <div className="detail-tags"><Severity severity={patient.severity} /><Status status={patient.status} /></div>
    </div>
    <div className="detail-section"><div className="detail-label"><span>Symptoms</span><span>{patient.time}</span></div><p className="detail-copy">{patient.symptoms}</p></div>
    <div className="assessment-box"><div className="assessment-heading"><span className="assessment-icon"><Activity size={15} /></span><div><strong>Initial assessment</strong><small>Keyword-based demo · clinician review required</small></div></div><p className="assessment-result">{patient.diagnosis}</p><div className="assessment-meta"><span><span className="meta-dot dot-lime" />Suggested unit</span><strong>{patient.ward}</strong></div><div className="assessment-meta"><span><UserRound size={13} />Care team</span><strong>{patient.doctor}</strong></div></div>
    <div className="detail-section treatment-section"><div className="detail-label"><span>Care note</span><button className="inline-edit" onClick={() => onUpdate(patient.id, { status: patient.status === 'Completed' ? 'Waiting' : 'Completed' })}>{patient.status === 'Completed' ? 'Reopen visit' : 'Mark complete'}</button></div><p className="detail-copy">{patient.treatment}</p></div>
    <div className="reminder-box"><div className="reminder-heading"><span className="reminder-icon"><Clock3 size={15} /></span><div><strong>Medicine reminder</strong><small>{patient.medicine ? `${patient.medicine} · ${patient.dosage} · ${patient.reminder}` : 'No reminder set for this visit'}</small></div></div><button className="reminder-action" onClick={() => setShowReminder((visible) => !visible)}>{showReminder ? 'Cancel' : patient.medicine ? 'Edit' : 'Set reminder'}</button></div>
    {showReminder && <form className="reminder-form" onSubmit={(event) => { onReminder(patient.id, event); setShowReminder(false) }}><label>Medicine<input required name="medicine" defaultValue={patient.medicine} placeholder="Medicine name" /></label><div className="reminder-form-row"><label>Dosage<input required name="dosage" defaultValue={patient.dosage} placeholder="e.g. 1 tablet" /></label><label>Time<input required name="reminder" type="time" /></label></div><button className="button button-primary reminder-save" type="submit"><Check size={15} /> Save reminder</button></form>}
    <button className="button button-report" onClick={onDownload}><FileText size={16} /> Download visit summary <Download size={15} /></button>
    <p className="detail-safety"><ShieldCheck size={13} /> Demo information. Not a medical diagnosis.</p>
  </section>
}

function PatientsView({ patients, selectedId, onSelect, onDownload, onUpdate, onReminder }) {
  const [filter, setFilter] = useState('All visits')
  const visible = patients.filter((patient) => filter === 'All visits' || (filter === 'Needs review' ? patient.status !== 'Completed' : patient.severity === filter))
  const choices = ['All visits', 'Needs review', 'High', 'Moderate', 'Low']
  const selected = patients.find((patient) => patient.id === selectedId) ?? patients[0]
  return <div className="patients-layout"><section className="panel full-table-panel"><div className="panel-heading patients-toolbar"><div><span className="section-kicker">CARE REGISTER</span><h2>All patient visits <span className="heading-count">{visible.length}</span></h2></div><label className="filter-select"><span className="sr-only">Filter visits</span><select value={filter} onChange={(event) => setFilter(event.target.value)}>{choices.map((choice) => <option key={choice}>{choice}</option>)}</select><ChevronDown size={14} /></label></div>
    <div className="queue-table-wrap"><table className="queue-table patient-list-table"><thead><tr><th>Patient</th><th>Symptoms</th><th>Triage suggestion</th><th>Priority</th><th>Clinician</th><th>Status</th><th /></tr></thead><tbody>{visible.map((patient) => <tr key={patient.id} className={selectedId === patient.id ? 'row-selected' : ''} onClick={() => onSelect(patient)}><td><div className="patient-cell"><Avatar name={patient.name} color={patient.color} /><span><strong>{patient.name}</strong><small>{patient.id} · {patient.age} yrs</small></span></div></td><td className="symptom-cell">{patient.symptoms}</td><td>{patient.diagnosis}</td><td><Severity severity={patient.severity} /></td><td>{patient.doctor}</td><td><Status status={patient.status} /></td><td><button className="row-arrow" title="Download visit summary" onClick={(event) => { event.stopPropagation(); onDownload(patient) }}><Download size={15} /></button></td></tr>)}{!visible.length && <tr><td colSpan="7" className="empty-state">No visits in this filter.</td></tr>}</tbody></table></div>
    <div className="queue-footer"><span>Saved on this device · {visible.length} result{visible.length === 1 ? '' : 's'}</span><span className="privacy-note"><ShieldCheck size={14} /> Private to this browser</span></div>
  </section><PatientDetail patient={selected} onDownload={() => selected && onDownload(selected)} onReminder={onReminder} onUpdate={onUpdate} /></div>
}

function CareTeamView({ patients }) {
  return <><section className="team-summary"><article className="panel team-summary-card"><span className="metric-icon mint"><Stethoscope size={18} /></span><div><strong>{careTeam.length}</strong><span>Clinicians on roster</span></div></article><article className="panel team-summary-card"><span className="metric-icon blue"><CheckCircle2 size={18} /></span><div><strong>{careTeam.filter((doctor) => doctor.status === 'Available').length}</strong><span>Available now</span></div></article><article className="panel team-summary-card"><span className="metric-icon yellow"><UsersRound size={18} /></span><div><strong>{patients.filter((patient) => patient.status !== 'Completed').length}</strong><span>Active visits</span></div></article></section>
    <section className="panel team-panel"><div className="panel-heading"><div><span className="section-kicker">TODAY'S ROSTER</span><h2>Care team availability</h2></div><span className="roster-date"><CalendarDays size={15} /> Today</span></div><div className="team-table-wrap"><table className="team-table"><thead><tr><th>Clinician</th><th>Unit</th><th>Availability</th><th>Next slot</th><th>Active visits</th></tr></thead><tbody>{careTeam.map((doctor) => <tr key={doctor.name}><td><div className="patient-cell"><Avatar name={doctor.name} color={doctor.color} /><span><strong>{doctor.name}</strong><small>{doctor.role}</small></span></div></td><td>{doctor.ward}</td><td><span className={`availability-label ${doctor.status === 'Available' ? 'is-available' : ''}`}><i />{doctor.status}</span></td><td><Clock3 size={14} className="muted-inline" /> {doctor.next}</td><td>{patients.filter((patient) => patient.doctor === doctor.name && patient.status !== 'Completed').length}</td></tr>)}</tbody></table></div><div className="team-note"><Activity size={16} /><span>Assignments are suggestions based on care unit and demo availability. Confirm all assignments with your clinic team.</span></div></section></>
}

function ReportsView({ patients, onDownload, onExport }) {
  return <><section className="report-banner"><div className="report-banner-icon"><FileText size={21} /></div><div><span className="section-kicker">REPORT CENTER</span><h2>Your clinic, clearly summarized.</h2><p>Download individual visit notes or export the patient register as a spreadsheet.</p></div><button className="button button-primary" onClick={onExport}><Download size={16} /> Export patient list</button></section><div className="report-stats"><article className="panel report-stat"><span>Total visit records</span><strong>{patients.length}</strong><small>Stored in this browser</small></article><article className="panel report-stat"><span>Needs follow-up</span><strong>{patients.filter((patient) => patient.status !== 'Completed').length}</strong><small>Not marked complete</small></article><article className="panel report-stat"><span>Medicine reminders</span><strong>{patients.filter((patient) => patient.reminder).length}</strong><small>Saved reminder details</small></article></div><section className="panel report-list"><div className="panel-heading"><div><span className="section-kicker">RECENT VISITS</span><h2>Download a visit summary</h2></div><span className="export-format">TXT · CSV</span></div>{patients.map((patient) => <div className="report-row" key={patient.id}><Avatar name={patient.name} color={patient.color} small /><div className="report-row-main"><strong>{patient.name}</strong><span>{patient.id} · {patient.diagnosis}</span></div><Severity severity={patient.severity} /><button className="button button-secondary report-download" onClick={() => onDownload(patient)}><Download size={15} /><span>Download</span></button></div>)}</section></>
}

function SettingsView({ patientCount, onExport, onReset }) {
  const [confirmReset, setConfirmReset] = useState(false)
  return <section className="settings-layout"><div className="panel settings-panel"><div className="panel-heading"><div><span className="section-kicker">WORKSPACE</span><h2>Privacy & data</h2></div><span className="settings-shield"><ShieldCheck size={18} /></span></div><div className="settings-item"><div><strong>Local storage</strong><p>Your {patientCount} demo patient records are saved in this browser on this device.</p></div><span className="setting-status"><i /> Active</span></div><div className="settings-item"><div><strong>Data sharing</strong><p>This demo does not send patient data to a server or third-party service.</p></div><span className="setting-status"><i /> Off</span></div><div className="settings-item"><div><strong>Export your records</strong><p>Download the current patient register as a CSV file.</p></div><button className="button button-secondary" onClick={onExport}><Download size={15} /> Export</button></div><div className="settings-item settings-danger"><div><strong>Restore sample data</strong><p>Replace local records with the original sample visits.</p></div><button className="button button-danger" onClick={() => setConfirmReset(true)}>Restore demo</button></div></div><aside className="settings-notice"><span className="notice-icon"><ShieldCheck size={18} /></span><strong>Demo, not clinical software</strong><p>Careflow is a frontend demonstration. It is not connected to a medical record system, does not send notifications while closed, and should never be used for diagnosis or emergency decisions.</p></aside>
    {confirmReset && <div className="confirm-inline"><span>Restore sample data and replace current local records?</span><button className="button button-secondary" onClick={() => setConfirmReset(false)}>Cancel</button><button className="button button-danger" onClick={() => { onReset(); setConfirmReset(false) }}>Restore</button></div>}
  </section>
}

export default App
