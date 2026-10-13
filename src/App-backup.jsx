import { useEffect, useMemo, useRef, useState } from 'react'

/* =====================================================================
   MediCare – Hospital Appointment & Patient Management System (frontend)

   BACKEND SWITCH
   - USE_BACKEND = false  -> everything stays in this page's memory (demo).
   - USE_BACKEND = true   -> calls the Spring Boot API at API_BASE.
   Nothing is ever shown as "saved" unless it really was.

   All doctors, patients, schedules and bookings below are FICTIONAL DEMO DATA.
   ===================================================================== */

const USE_BACKEND = false
const API_BASE = 'http://localhost:8080/api'

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`Server responded with ${res.status}`)
  return res.json()
}

/* ----------------------------- Data -------------------------------- */

const DEPARTMENTS = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'General Medicine',
]

const DEPT_ICON = {
  All: 'layers',
  Cardiology: 'heart',
  Neurology: 'brain',
  Pediatrics: 'baby',
  Dermatology: 'sparkle',
  Orthopedics: 'bone',
  'General Medicine': 'stethoscope',
}

const DOCTORS = [
  {
    id: 1,
    name: 'Dr. Aanya Rao',
    specialty: 'Interventional Cardiologist',
    department: 'Cardiology',
    years: 14,
    languages: ['English', 'Hindi', 'Telugu'],
    focus: ['Heart rhythm checks', 'Blood pressure care', 'Post-procedure follow-up'],
    bio: 'Sample profile. Dr. Rao focuses on calm, clearly explained cardiac care, from first consultations to long-term follow-up plans.',
    look: { bg: '#c5ebe8', skin: '#e0ac86', hair: '#1d2b30', long: true },
  },
  {
    id: 2,
    name: 'Dr. Marcus Bell',
    specialty: 'Neurologist',
    department: 'Neurology',
    years: 11,
    languages: ['English', 'Spanish'],
    focus: ['Migraine management', 'Nerve conditions', 'Memory concerns'],
    bio: 'Sample profile. Dr. Bell takes a methodical approach to neurological symptoms and keeps patients informed at every step.',
    look: { bg: '#d8f8ea', skin: '#8d5a3b', hair: '#14181a', long: false },
  },
  {
    id: 3,
    name: 'Dr. Priya Nair',
    specialty: 'Child Health Specialist',
    department: 'Pediatrics',
    years: 9,
    languages: ['English', 'Malayalam', 'Hindi'],
    focus: ['Routine child checkups', 'Growth and development', 'Vaccination guidance'],
    bio: 'Sample profile. Dr. Nair creates a friendly environment for children and gives parents practical, reassuring guidance.',
    look: { bg: '#dff4f3', skin: '#c98d65', hair: '#2a1c16', long: true },
  },
  {
    id: 4,
    name: 'Dr. Samuel Okafor',
    specialty: 'Joint & Sports Medicine',
    department: 'Orthopedics',
    years: 16,
    languages: ['English', 'Igbo'],
    focus: ['Joint pain', 'Sports injuries', 'Rehabilitation planning'],
    bio: 'Sample profile. Dr. Okafor helps patients return to movement with clear recovery plans and realistic goals.',
    look: { bg: '#c5ebe8', skin: '#6b4429', hair: '#0f1213', long: false },
  },
  {
    id: 5,
    name: 'Dr. Elena Torres',
    specialty: 'Dermatologist',
    department: 'Dermatology',
    years: 8,
    languages: ['English', 'Spanish'],
    focus: ['Skin concerns', 'Allergic reactions', 'Long-term skin care'],
    bio: 'Sample profile. Dr. Torres combines careful examination with straightforward advice for everyday skin health.',
    look: { bg: '#d8f8ea', skin: '#f0c8a4', hair: '#6b3b1f', long: true },
  },
  {
    id: 6,
    name: 'Dr. Rohan Mehta',
    specialty: 'Family Physician',
    department: 'General Medicine',
    years: 12,
    languages: ['English', 'Hindi', 'Gujarati'],
    focus: ['General checkups', 'Preventive care', 'Chronic condition follow-up'],
    bio: 'Sample profile. Dr. Mehta is a first point of contact for the whole family and coordinates specialist referrals.',
    look: { bg: '#dff4f3', skin: '#d39b73', hair: '#1d2b30', long: false },
  },
  {
    id: 7,
    name: 'Dr. Hana Kim',
    specialty: 'Headache & Sleep Medicine',
    department: 'Neurology',
    years: 7,
    languages: ['English', 'Korean'],
    focus: ['Sleep difficulties', 'Chronic headaches', 'Lifestyle planning'],
    bio: 'Sample profile. Dr. Kim listens closely and builds practical routines that fit into daily life.',
    look: { bg: '#c5ebe8', skin: '#ecc19b', hair: '#14181a', long: true },
  },
  {
    id: 8,
    name: 'Dr. Leila Haddad',
    specialty: 'Preventive Cardiology',
    department: 'Cardiology',
    years: 10,
    languages: ['English', 'Arabic', 'French'],
    focus: ['Heart health screening', 'Cholesterol care', 'Lifestyle coaching'],
    bio: 'Sample profile. Dr. Haddad helps patients understand their risk early and plan simple, sustainable changes.',
    look: { bg: '#d8f8ea', skin: '#b97c55', hair: '#241711', long: true },
  },
]

/* Fictional demonstration patients (used only when USE_BACKEND is false). */
const SAMPLE_PATIENTS = [
  {
    id: 'P-1001',
    name: 'Asha Verma',
    age: 34,
    gender: 'Female',
    phone: '+00 00000 10001',
    diagnosis: 'Seasonal allergic rhinitis',
    notes: 'Advised to avoid known triggers. Review in four weeks if symptoms persist.',
    appointments: [
      { date: '2026-09-02', doctor: 'Dr. Rohan Mehta', department: 'General Medicine', status: 'Completed' },
      { date: '2026-09-30', doctor: 'Dr. Elena Torres', department: 'Dermatology', status: 'Completed' },
    ],
  },
  {
    id: 'P-1002',
    name: 'Daniel Joseph',
    age: 52,
    gender: 'Male',
    phone: '+00 00000 10002',
    diagnosis: 'Hypertension, routine follow-up',
    notes: 'Blood pressure readings stable. Continue lifestyle changes. Next review in three months.',
    appointments: [
      { date: '2026-08-18', doctor: 'Dr. Aanya Rao', department: 'Cardiology', status: 'Completed' },
      { date: '2026-11-05', doctor: 'Dr. Leila Haddad', department: 'Cardiology', status: 'Scheduled' },
    ],
  },
  {
    id: 'P-1003',
    name: 'Meera Iyer',
    age: 8,
    gender: 'Female',
    phone: '+00 00000 10003',
    diagnosis: 'Routine growth and vaccination review',
    notes: 'Growth within the expected range. Vaccination schedule discussed with parent.',
    appointments: [
      { date: '2026-09-12', doctor: 'Dr. Priya Nair', department: 'Pediatrics', status: 'Completed' },
    ],
  },
  {
    id: 'P-1004',
    name: 'Kenji Watanabe',
    age: 41,
    gender: 'Male',
    phone: '+00 00000 10004',
    diagnosis: 'Lower back strain',
    notes: 'Physiotherapy exercises recommended. Avoid heavy lifting for two weeks.',
    appointments: [
      { date: '2026-09-22', doctor: 'Dr. Samuel Okafor', department: 'Orthopedics', status: 'Completed' },
      { date: '2026-10-20', doctor: 'Dr. Samuel Okafor', department: 'Orthopedics', status: 'Scheduled' },
    ],
  },
  {
    id: 'P-1005',
    name: 'Fatima Noor',
    age: 29,
    gender: 'Female',
    phone: '+00 00000 10005',
    diagnosis: 'Recurring tension headaches',
    notes: 'Sleep and hydration routine discussed. Headache diary requested before next visit.',
    appointments: [
      { date: '2026-09-27', doctor: 'Dr. Hana Kim', department: 'Neurology', status: 'Completed' },
    ],
  },
]

const SLOT_TIMES = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:30 PM', '04:00 PM', '04:30 PM',
]

const FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every 8 hours',
  'Only when needed',
]

const STATUS = {
  available: { label: 'Available today', cls: 'st-available' },
  limited: { label: 'Few slots today', cls: 'st-limited' },
  soon: { label: 'Next slot soon', cls: 'st-soon' },
  full: { label: 'Fully booked', cls: 'st-full' },
}

/* --------------------------- Helpers -------------------------------- */

const pad = (n) => String(n).padStart(2, '0')
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function getUpcomingDays(count = 7) {
  const base = new Date()
  const out = []
  for (let i = 0; i < count; i += 1) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    out.push({
      key: toKey(d),
      index: i,
      dow: d.toLocaleDateString('en-US', { weekday: 'short' }),
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      long: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    })
  }
  return out
}

function toMinutes(t) {
  const [hm, ap] = t.split(' ')
  let [h, m] = hm.split(':').map(Number)
  if (ap === 'PM' && h !== 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  return h * 60 + m
}

/* Deterministic pseudo-random demo availability (no backend involved). */
function isSlotUnavailable(docId, dayKey, time, isToday) {
  if (isToday) {
    const now = new Date()
    if (toMinutes(time) <= now.getHours() * 60 + now.getMinutes() + 30) return true
  }
  let h = 7
  const s = `${docId}|${dayKey}|${time}`
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % 4 === 0
}

function availabilityFor(doc) {
  const days = getUpcomingDays(7)
  const freeToday = SLOT_TIMES.filter((t) => !isSlotUnavailable(doc.id, days[0].key, t, true)).length
  let next = null
  for (const d of days) {
    for (const t of SLOT_TIMES) {
      if (!isSlotUnavailable(doc.id, d.key, t, d.index === 0)) {
        next = { day: d, time: t }
        break
      }
    }
    if (next) break
  }
  let status = 'full'
  if (freeToday > 3) status = 'available'
  else if (freeToday > 0) status = 'limited'
  else if (next) status = 'soon'
  const nextLabel = next
    ? `${next.day.index === 0 ? 'Today' : next.day.index === 1 ? 'Tomorrow' : `${next.day.dow} ${next.day.day}`} · ${next.time}`
    : 'No slots this week'
  return { status, next, nextLabel }
}

function formatDate(value) {
  const d = new Date(`${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

/* ----------------- Patient records / prescriptions API --------------- */

/* Converts a patient from the Spring Boot response into the shape used here. */
const normalizePatient = (p) => ({
  id: p.patientCode,
  name: p.name,
  age: p.age,
  gender: p.gender,
  phone: p.phone,
  diagnosis: p.diagnosis,
  notes: p.doctorNotes,
  appointments: (p.appointments || []).map((a) => ({
    date: a.appointmentDate,
    doctor: a.doctorName,
    department: a.department,
    status: a.status,
  })),
})

async function searchPatients(query) {
  const q = query.trim()
  if (!USE_BACKEND) {
    const lower = q.toLowerCase()
    return SAMPLE_PATIENTS.filter(
      (p) => !lower || p.id.toLowerCase().includes(lower) || p.name.toLowerCase().includes(lower)
    )
  }
  const data = await apiRequest(`/patients?query=${encodeURIComponent(q)}`)
  return data.map(normalizePatient)
}

/* ------------------------------ Icons ------------------------------- */

const ICONS = {
  calendar: (<><rect x="3" y="4.5" width="18" height="16" rx="3" /><path d="M8 2.5v4M16 2.5v4M3 10h18" /></>),
  file: (<><path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>),
  pill: (<><rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)" /><path d="M9.6 9.6l4.8 4.8" /></>),
  search: (<><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />,
  shield: (<><path d="M12 3l7 3v5.5c0 4.3-3 8-7 9.5-4-1.5-7-5.2-7-9.5V6z" /><path d="M9 12l2.2 2.2L15.5 10" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></>),
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  mail: (<><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3.5 7l8.5 6 8.5-6" /></>),
  pin: (<><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>),
  brain: (<><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 4.5A3 3 0 0 0 9 20h3V4z" /><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 4.5A3 3 0 0 1 15 20h-3" /></>),
  baby: (<><circle cx="12" cy="12" r="8.5" /><path d="M9 10.5h.01M15 10.5h.01M9.2 14.5c1.4 1.5 4.2 1.5 5.6 0M12 3.5c1 0 2 .6 2 1.5" /></>),
  bone: (<><path d="M8.5 15.5l7-7" /><circle cx="6.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="6.5" r="2.5" /><circle cx="5.5" cy="14.5" r="1.6" /><circle cx="18.5" cy="9.5" r="1.6" /></>),
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />,
  stethoscope: (<><path d="M6 3v6a4 4 0 0 0 8 0V3" /><path d="M10 13v2a5 5 0 0 0 10 0v-1" /><circle cx="20" cy="12" r="2" /></>),
  layers: <path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" />,
  alert: (<><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16h.01" /></>),
  lock: (<><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>),
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>),
  award: (<><circle cx="12" cy="9" r="5.5" /><path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7" /></>),
  printer: (<><path d="M7 9V3h10v6" /><rect x="3.5" y="9" width="17" height="8" rx="2" /><path d="M7 14h10v7H7z" /></>),
}

function Icon({ name, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  )
}

function Logo({ light = false }) {
  return (
    <span className={`logo ${light ? 'logo-light' : ''}`}>
      <svg width="38" height="38" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <rect width="40" height="40" rx="12" fill="#17324D" />
        <path d="M17 9h6v8h8v6h-8v8h-6v-8H9v-6h8z" fill="#7FE0CF" />
        <circle cx="31" cy="9.5" r="2.6" fill="#ffffff" />
      </svg>
      <span className="logo-text">Medi<b>Care</b></span>
    </span>
  )
}

function Avatar({ look, size = 88 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <rect width="100" height="100" fill={look.bg} />
      {look.long && <path d="M29 46c0-20 9-31 21-31s21 11 21 31v28H29z" fill={look.hair} />}
      <path d="M10 100c2-20 17-28 40-28s38 8 40 28z" fill="#ffffff" />
      <path d="M40 73l10 14 10-14z" fill="#087F8C" />
      <rect x="43" y="56" width="14" height="18" rx="6" fill={look.skin} />
      <ellipse cx="50" cy="44" rx="15" ry="17" fill={look.skin} />
      <path d="M34 42c0-13 7-20 16-20s16 7 16 20c-4-7-9-10-16-10s-12 3-16 10z" fill={look.hair} />
    </svg>
  )
}

/* --------------------------- Small components ---------------------- */

function Field({ id, label, error, hint, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="hint">{hint}</p>}
      {error && (
        <p className="err" id={`${id}-err`}>
          <Icon name="alert" size={15} /> {error}
        </p>
      )}
    </div>
  )
}

function Modal({ titleId, onClose, size = 'md', children }) {
  const ref = useRef(null)
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    const node = ref.current
    const previous = document.activeElement
    const focusables = () =>
      node.querySelectorAll(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
      )
    node.focus()
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeRef.current()
        return
      }
      if (e.key === 'Tab') {
        const items = focusables()
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && (document.activeElement === first || document.activeElement === node)) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      if (previous && document.contains(previous) && previous.focus) previous.focus()
    }
  }, [])

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={ref}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
          <Icon name="x" size={20} />
        </button>
        {children}
      </div>
    </div>
  )
}

function DemoNote({ children, className = '' }) {
  return (
    <p className={`demo-note ${className}`}>
      <Icon name="alert" size={18} />
      <span>{children}</span>
    </p>
  )
}

/* ------------------------- Doctor profile modal --------------------- */

function DoctorModal({ doctor, info, onBook, onClose }) {
  const st = STATUS[info.status]
  return (
    <Modal titleId="doc-title" onClose={onClose}>
      <div className="dm-head">
        <div className="avatar avatar-lg"><Avatar look={doctor.look} size={104} /></div>
        <div>
          <h2 id="doc-title">{doctor.name}</h2>
          <p className="dm-spec">{doctor.specialty}</p>
          <div className="dm-tags">
            <span className="tag"><Icon name={DEPT_ICON[doctor.department]} size={15} /> {doctor.department}</span>
            <span className={`pill ${st.cls}`}><span className="dot" /> {st.label}</span>
          </div>
        </div>
      </div>
      <p className="dm-bio">{doctor.bio}</p>
      <dl className="dm-list">
        <div><dt><Icon name="award" size={18} /> Experience</dt><dd>{doctor.years} years (sample data)</dd></div>
        <div><dt><Icon name="globe" size={18} /> Languages</dt><dd>{doctor.languages.join(', ')}</dd></div>
        <div><dt><Icon name="stethoscope" size={18} /> Focus areas</dt><dd>{doctor.focus.join(' · ')}</dd></div>
        <div><dt><Icon name="clock" size={18} /> Next demo slot</dt><dd>{info.nextLabel}</dd></div>
      </dl>
      <DemoNote>This is a fictional profile used for demonstration. Schedules shown are generated sample data.</DemoNote>
      <div className="modal-actions">
        <button type="button" className="btn btn-primary" onClick={() => onBook(doctor)}>
          Book appointment <Icon name="arrow" size={18} />
        </button>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  )
}

/* ------------------------- Booking modal ---------------------------- */

function BookingModal({ doctor, onClose, notify }) {
  const days = useMemo(() => getUpcomingDays(7), [])
  const [form, setForm] = useState({
    doctorId: doctor ? String(doctor.id) : '',
    name: '',
    email: '',
    phone: '',
    reason: '',
  })
  const [dayKey, setDayKey] = useState('')
  const [slot, setSlot] = useState('')
  const [errors, setErrors] = useState({})
  const [confirmed, setConfirmed] = useState(null)

  const selDoc = DOCTORS.find((d) => String(d.id) === form.doctorId)
  const selDay = days.find((d) => d.key === dayKey)
  const slots =
    selDoc && selDay
      ? SLOT_TIMES.map((t) => ({
          time: t,
          off: isSlotUnavailable(selDoc.id, selDay.key, t, selDay.index === 0),
        }))
      : []
  const freeCount = slots.filter((s) => !s.off).length

  const clearError = (k) => {
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const setField = (k) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [k]: value }))
    clearError(k)
    if (k === 'doctorId') setSlot('')
  }

  const pickDay = (key) => {
    setDayKey(key)
    setSlot('')
    clearError('date')
  }

  const pickSlot = (t) => {
    setSlot(t)
    clearError('slot')
  }

  const inputProps = (id, key) => ({
    id,
    'aria-invalid': errors[key] ? 'true' : 'false',
    'aria-describedby': errors[key] ? `${id}-err` : undefined,
    className: errors[key] ? 'has-error' : undefined,
  })

  const validate = () => {
    const e = {}
    if (!form.doctorId) e.doctorId = 'Please choose a doctor.'
    if (!dayKey) e.date = 'Please select a date.'
    else if (!slot) e.slot = 'Please pick an available time slot.'
    if (form.name.trim().length < 2) e.name = 'Enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address.'
    if (!/^[+\d][\d\s-]{6,17}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number (7–15 digits).'
    if (form.reason.trim().length < 5) e.reason = 'Briefly describe the reason for your visit.'
    return e
  }

  const focusMap = {
    doctorId: 'bk-doctor',
    date: 'bk-dates',
    slot: 'bk-slots',
    name: 'bk-name',
    email: 'bk-email',
    phone: 'bk-phone',
    reason: 'bk-reason',
  }

  const submit = (e) => {
    e.preventDefault()
    const er = validate()
    setErrors(er)
    const keys = Object.keys(er)
    if (keys.length) {
      const el = document.getElementById(focusMap[keys[0]])
      if (el) el.focus()
      notify('error', 'Please fix the highlighted fields to continue.')
      return
    }
    setConfirmed({
      ref: `DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
      doc: selDoc,
      day: selDay,
      slot,
      name: form.name.trim(),
    })
    notify('success', 'Demo appointment created. It is not saved anywhere.')
  }

  const reset = () => {
    setConfirmed(null)
    setForm({ doctorId: '', name: '', email: '', phone: '', reason: '' })
    setDayKey('')
    setSlot('')
    setErrors({})
  }

  if (confirmed) {
    return (
      <Modal titleId="bk-title" onClose={onClose}>
        <div className="success">
          <span className="success-icon"><Icon name="check" size={34} /></span>
          <h2 id="bk-title">Demo booking confirmed</h2>
          <p className="success-sub">
            Thanks, {confirmed.name.split(' ')[0]}. This is a demonstration, so no real appointment was created.
          </p>
          <dl className="summary">
            <div><dt>Reference</dt><dd>{confirmed.ref}</dd></div>
            <div><dt>Doctor</dt><dd>{confirmed.doc.name} · {confirmed.doc.department}</dd></div>
            <div><dt>Date</dt><dd>{confirmed.day.long}</dd></div>
            <div><dt>Time</dt><dd>{confirmed.slot}</dd></div>
          </dl>
          <DemoNote>Bookings are not stored until the Spring Boot backend and MySQL database are connected.</DemoNote>
          <div className="modal-actions">
            <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
            <button type="button" className="btn btn-ghost" onClick={reset}>Book another</button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal titleId="bk-title" size="lg" onClose={onClose}>
      <p className="eyebrow">Step by step</p>
      <h2 id="bk-title" className="modal-title">Book an appointment</h2>
      <DemoNote>Demo mode: nothing you enter here is sent or saved.</DemoNote>

      <form onSubmit={submit} noValidate className="form">
        <Field id="bk-doctor" label="Doctor" error={errors.doctorId}>
          <select {...inputProps('bk-doctor', 'doctorId')} value={form.doctorId} onChange={setField('doctorId')}>
            <option value="">Select a doctor</option>
            {DOCTORS.map((d) => (
              <option key={d.id} value={d.id}>{d.name} — {d.department}</option>
            ))}
          </select>
        </Field>

        <div className="field">
          <span className="label" id="bk-dates-label">Choose a date</span>
          <div
            className="dates"
            id="bk-dates"
            role="group"
            aria-labelledby="bk-dates-label"
            tabIndex={-1}
            aria-describedby={errors.date ? 'bk-dates-err' : undefined}
          >
            {days.map((d) => (
              <button
                key={d.key}
                type="button"
                className="date-btn"
                aria-pressed={dayKey === d.key}
                onClick={() => pickDay(d.key)}
              >
                <span>{d.dow}</span>
                <b>{d.day}</b>
                <span>{d.month}</span>
              </button>
            ))}
          </div>
          {errors.date && <p className="err" id="bk-dates-err"><Icon name="alert" size={15} /> {errors.date}</p>}
        </div>

        <div className="field">
          <span className="label" id="bk-slots-label">Available time slots</span>
          <div
            className="slots"
            id="bk-slots"
            role="group"
            aria-labelledby="bk-slots-label"
            tabIndex={-1}
            aria-describedby={errors.slot ? 'bk-slots-err' : undefined}
          >
            {!selDoc || !selDay ? (
              <p className="hint">Select a doctor and a date to see demo time slots.</p>
            ) : freeCount === 0 ? (
              <p className="hint">No demo slots left for this day. Try another date.</p>
            ) : (
              slots.map((s) => (
                <button
                  key={s.time}
                  type="button"
                  className="slot"
                  disabled={s.off}
                  aria-pressed={slot === s.time}
                  onClick={() => pickSlot(s.time)}
                >
                  {s.time}
                </button>
              ))
            )}
          </div>
          {errors.slot && <p className="err" id="bk-slots-err"><Icon name="alert" size={15} /> {errors.slot}</p>}
        </div>

        <div className="row">
          <Field id="bk-name" label="Full name" error={errors.name}>
            <input {...inputProps('bk-name', 'name')} type="text" autoComplete="name" value={form.name} onChange={setField('name')} />
          </Field>
          <Field id="bk-phone" label="Phone number" error={errors.phone}>
            <input {...inputProps('bk-phone', 'phone')} type="tel" autoComplete="tel" value={form.phone} onChange={setField('phone')} />
          </Field>
        </div>
        <Field id="bk-email" label="Email address" error={errors.email}>
          <input {...inputProps('bk-email', 'email')} type="email" autoComplete="email" value={form.email} onChange={setField('email')} />
        </Field>
        <Field id="bk-reason" label="Reason for visit" error={errors.reason}>
          <textarea {...inputProps('bk-reason', 'reason')} rows={3} value={form.reason} onChange={setField('reason')} />
        </Field>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary">Confirm demo appointment</button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  )
}

/* --------------------------- Auth modal ----------------------------- */

function AuthModal({ initialMode, onClose, notify }) {
  const [mode, setMode] = useState(initialMode)
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const isReg = mode === 'register'

  const set = (k) => (e) => {
    const value = e.target.value
    setF((s) => ({ ...s, [k]: value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const switchMode = (m) => {
    setMode(m)
    setErrors({})
  }

  const props = (key) => ({
    id: `au-${key}`,
    'aria-invalid': errors[key] ? 'true' : 'false',
    'aria-describedby': errors[key] ? `au-${key}-err` : undefined,
    className: errors[key] ? 'has-error' : undefined,
  })

  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (isReg && f.name.trim().length < 2) er.name = 'Enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) er.email = 'Enter a valid email address.'
    if (isReg ? f.password.length < 8 : f.password.length === 0) {
      er.password = isReg ? 'Use at least 8 characters.' : 'Enter your password.'
    }
    if (isReg && f.confirm !== f.password) er.confirm = 'Passwords do not match.'
    setErrors(er)
    const first = Object.keys(er)[0]
    if (first) {
      const el = document.getElementById(`au-${first}`)
      if (el) el.focus()
      notify('error', 'Please fix the highlighted fields.')
      return
    }
    notify(
      'info',
      isReg
        ? 'Demo only: no account was created and nothing was stored.'
        : 'Demo only: no sign-in took place because no backend is connected yet.'
    )
    onClose()
  }

  return (
    <Modal titleId="au-title" onClose={onClose}>
      <p className="eyebrow">Patient portal</p>
      <h2 id="au-title" className="modal-title">{isReg ? 'Create your account' : 'Welcome back'}</h2>
      <div className="tabs" role="tablist" aria-label="Account options">
        <button type="button" role="tab" aria-selected={!isReg} className="tab" onClick={() => switchMode('login')}>Sign in</button>
        <button type="button" role="tab" aria-selected={isReg} className="tab" onClick={() => switchMode('register')}>Register</button>
      </div>
      <DemoNote>Interface preview only. Authentication is not connected, and no account data is stored.</DemoNote>

      <form onSubmit={submit} noValidate className="form" role="tabpanel">
        {isReg && (
          <Field id="au-name" label="Full name" error={errors.name}>
            <input {...props('name')} type="text" autoComplete="name" value={f.name} onChange={set('name')} />
          </Field>
        )}
        <Field id="au-email" label="Email address" error={errors.email}>
          <input {...props('email')} type="email" autoComplete="email" value={f.email} onChange={set('email')} />
        </Field>
        <Field id="au-password" label="Password" error={errors.password} hint={isReg ? 'At least 8 characters.' : undefined}>
          <input
            {...props('password')}
            type="password"
            autoComplete={isReg ? 'new-password' : 'current-password'}
            value={f.password}
            onChange={set('password')}
          />
        </Field>
        {isReg && (
          <Field id="au-confirm" label="Confirm password" error={errors.confirm}>
            <input {...props('confirm')} type="password" autoComplete="new-password" value={f.confirm} onChange={set('confirm')} />
          </Field>
        )}
        <div className="modal-actions">
          <button type="submit" className="btn btn-primary">{isReg ? 'Create demo account' : 'Sign in (demo)'}</button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  )
}

/* ----------------------- Patient records modal ---------------------- */

function PatientRecordsModal({ prescriptions, onClose }) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [lastQuery, setLastQuery] = useState('')

  const run = async (q) => {
    setLoading(true)
    setLoadError('')
    try {
      const found = await searchPatients(q)
      setResults(found)
      setSelectedId(found.length ? found[0].id : null)
      setLastQuery(q)
    } catch {
      setResults([])
      setSelectedId(null)
      setLoadError('Could not load patient records from the backend. Check that the Spring Boot server is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    run('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) {
      setError('Enter a patient ID or name to search.')
      return
    }
    if (q.length < 2) {
      setError('Enter at least 2 characters.')
      return
    }
    if (!/^[\w\s.'-]+$/.test(q)) {
      setError('Use only letters, numbers, spaces, dots, hyphens or apostrophes.')
      return
    }
    setError('')
    run(q)
  }

  const onReset = () => {
    setQuery('')
    setError('')
    run('')
  }

  const selected = results.find((p) => p.id === selectedId) || null
  const rxForPatient = selected
    ? prescriptions.filter((r) => r.patientId.toLowerCase() === selected.id.toLowerCase())
    : []

  return (
    <Modal titleId="pr-title" size="xl" onClose={onClose}>
      <p className="eyebrow">Healthcare services</p>
      <h2 id="pr-title" className="modal-title">Patient records</h2>
      <DemoNote>
        {USE_BACKEND
          ? 'Records are loaded from the Spring Boot backend.'
          : 'Demonstration data: every patient shown here is a fictional sample, not a real patient record.'}
      </DemoNote>

      <form className="pr-search" onSubmit={onSearch} noValidate>
        <div className="field pr-search-field">
          <label htmlFor="pr-query">Search by patient ID or name</label>
          <input
            id="pr-query"
            type="search"
            placeholder="For example P-1001 or Asha"
            value={query}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'pr-query-err' : undefined}
            className={error ? 'has-error' : undefined}
            onChange={(e) => {
              setQuery(e.target.value)
              if (error) setError('')
            }}
          />
          {error && (
            <p className="err" id="pr-query-err"><Icon name="alert" size={15} /> {error}</p>
          )}
        </div>
        <div className="pr-search-actions">
          <button type="submit" className="btn btn-primary">
            <Icon name="search" size={18} /> Search
          </button>
          <button type="button" className="btn btn-ghost" onClick={onReset}>Show all</button>
        </div>
      </form>

      {loadError && (
        <p className="err pr-load-err" role="alert"><Icon name="alert" size={16} /> {loadError}</p>
      )}

      <p className="count" role="status" aria-live="polite">
        {loading ? 'Loading records…' : `Showing ${results.length} ${results.length === 1 ? 'record' : 'records'}`}
      </p>

      {!loading && !loadError && results.length === 0 ? (
        <div className="empty">
          <Icon name="search" size={30} />
          <h3>No records found</h3>
          <p>
            No patient matches “{lastQuery}”. Check the patient ID (for example P-1001) or try a different name.
          </p>
          <button type="button" className="btn btn-dark btn-sm" onClick={onReset}>Show all records</button>
        </div>
      ) : (
        !loadError && (
          <div className="pr-grid">
            <ul className="pr-list" aria-label="Patient list">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="pr-item"
                    aria-pressed={selectedId === p.id}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <strong>{p.name}</strong>
                    <span>{p.id}</span>
                  </button>
                </li>
              ))}
            </ul>

            {selected && (
              <article className="pr-detail" aria-label={`Record for ${selected.name}`}>
                <div className="pr-detail-head">
                  <h3>{selected.name}</h3>
                  <span className="tag">{selected.id}</span>
                </div>
                <dl className="facts">
                  <div className="fact"><dt>Age</dt><dd>{selected.age}</dd></div>
                  <div className="fact"><dt>Gender</dt><dd>{selected.gender}</dd></div>
                  <div className="fact"><dt>Contact</dt><dd>{selected.phone}</dd></div>
                </dl>

                <div className="pr-block">
                  <h4>Diagnosis</h4>
                  <p>{selected.diagnosis}</p>
                </div>
                <div className="pr-block">
                  <h4>Doctor notes</h4>
                  <p>{selected.notes}</p>
                </div>

                <div className="pr-block">
                  <h4>Appointment history</h4>
                  {selected.appointments.length === 0 ? (
                    <p className="hint">No appointments on record.</p>
                  ) : (
                    <div className="table-wrap">
                      <table className="hist">
                        <caption className="sr-only">Appointment history for {selected.name}</caption>
                        <thead>
                          <tr>
                            <th scope="col">Date</th>
                            <th scope="col">Doctor</th>
                            <th scope="col">Department</th>
                            <th scope="col">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.appointments.map((a, i) => (
                            <tr key={`${a.date}-${i}`}>
                              <td>{formatDate(a.date)}</td>
                              <td>{a.doctor}</td>
                              <td>{a.department}</td>
                              <td>
                                <span className={`pill ${a.status === 'Completed' ? 'st-available' : a.status === 'Scheduled' ? 'st-soon' : 'st-limited'}`}>
                                  {a.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {rxForPatient.length > 0 && (
                  <div className="pr-block">
                    <h4>Prescriptions written in this session</h4>
                    <ul className="rx-mini">
                      {rxForPatient.map((r) => (
                        <li key={r.ref}>
                          <Icon name="pill" size={18} />
                          <span>
                            <strong>{r.medicine}</strong> · {r.dosage} · {r.frequency} · {r.duration} days
                            <em>{r.storage === 'backend' ? ' (saved to backend)' : ' (frontend memory only)'}</em>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            )}
          </div>
        )
      )}

      <div className="modal-actions">
        <button type="button" className="btn btn-dark" onClick={onClose}>Close</button>
      </div>
    </Modal>
  )
}

/* --------------------- Digital prescription modal ------------------- */

const EMPTY_RX = {
  patientId: '',
  patientName: '',
  doctor: '',
  diagnosis: '',
  medicine: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
}

function validateRx(f) {
  const e = {}
  if (!/^[A-Za-z0-9-]{3,20}$/.test(f.patientId.trim())) {
    e.patientId = 'Enter a patient ID of 3–20 letters, numbers or hyphens (for example P-1001).'
  }
  if (f.patientName.trim().length < 2) e.patientName = 'Enter the patient name.'
  if (!f.doctor) e.doctor = 'Please choose the prescribing doctor.'
  if (f.diagnosis.trim().length < 3) e.diagnosis = 'Enter a diagnosis.'
  if (f.medicine.trim().length < 2) e.medicine = 'Enter the medicine name.'
  if (!/\d/.test(f.dosage)) e.dosage = 'Include an amount, for example 500 mg.'
  if (!f.frequency) e.frequency = 'Choose how often to take it.'
  const days = Number(f.duration)
  if (!f.duration || !Number.isInteger(days) || days < 1 || days > 365) {
    e.duration = 'Enter a whole number of days from 1 to 365.'
  }
  if (f.instructions.trim().length < 5) e.instructions = 'Add short instructions for the patient.'
  return e
}

function RxSheet({ rx }) {
  const storageText =
    rx.storage === 'backend'
      ? 'Saved to the backend database.'
      : rx.storage === 'frontend'
        ? 'Stored in frontend memory only (demo).'
        : 'Preview only. Not saved.'
  return (
    <section className="rx-sheet" aria-label="Prescription">
      <div className="rx-head">
        <Logo />
        <div className="rx-meta">
          <strong>Digital Prescription</strong>
          <span>Ref: {rx.ref}</span>
          <span>{formatDateTime(rx.createdAt)}</span>
        </div>
      </div>

      <dl className="rx-people">
        <div><dt>Patient</dt><dd>{rx.patientName}</dd></div>
        <div><dt>Patient ID</dt><dd>{rx.patientId}</dd></div>
        <div><dt>Prescribed by</dt><dd>{rx.doctor}</dd></div>
      </dl>

      <div className="rx-block">
        <h4>Diagnosis</h4>
        <p>{rx.diagnosis}</p>
      </div>

      <div className="table-wrap">
        <table className="rx-table">
          <caption className="sr-only">Prescribed medicine</caption>
          <thead>
            <tr>
              <th scope="col">Medicine</th>
              <th scope="col">Dosage</th>
              <th scope="col">Frequency</th>
              <th scope="col">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{rx.medicine}</td>
              <td>{rx.dosage}</td>
              <td>{rx.frequency}</td>
              <td>{rx.duration} {Number(rx.duration) === 1 ? 'day' : 'days'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rx-block">
        <h4>Instructions</h4>
        <p>{rx.instructions}</p>
      </div>

      <p className="rx-foot">
        {storageText}
        {rx.storage !== 'backend' && ' Demonstration document, not a valid medical prescription.'}
      </p>
    </section>
  )
}

function PrescriptionModal({ onSave, onClose, notify }) {
  const [form, setForm] = useState(EMPTY_RX)
  const [errors, setErrors] = useState({})
  const [view, setView] = useState('form')
  const [sheet, setSheet] = useState(null)
  const [saving, setSaving] = useState(false)

  const setField = (k) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [k]: value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const ip = (key) => ({
    id: `rx-${key}`,
    'aria-invalid': errors[key] ? 'true' : 'false',
    'aria-describedby': errors[key] ? `rx-${key}-err` : undefined,
    className: errors[key] ? 'has-error' : undefined,
    value: form[key],
    onChange: setField(key),
  })

  const onPatientIdBlur = () => {
    if (USE_BACKEND || form.patientName.trim()) return
    const match = SAMPLE_PATIENTS.find((p) => p.id.toLowerCase() === form.patientId.trim().toLowerCase())
    if (match) setForm((f) => ({ ...f, patientName: match.name }))
  }

  const check = () => {
    const er = validateRx(form)
    setErrors(er)
    const keys = Object.keys(er)
    if (keys.length) {
      const el = document.getElementById(`rx-${keys[0]}`)
      if (el) el.focus()
      notify('error', 'Please fix the highlighted fields.')
      return false
    }
    return true
  }

  const cleanData = () => ({
    patientId: form.patientId.trim(),
    patientName: form.patientName.trim(),
    doctor: form.doctor,
    diagnosis: form.diagnosis.trim(),
    medicine: form.medicine.trim(),
    dosage: form.dosage.trim(),
    frequency: form.frequency,
    duration: Number(form.duration),
    instructions: form.instructions.trim(),
  })

  const handlePreview = () => {
    if (!check()) return
    setSheet({ ...cleanData(), ref: 'Preview (not saved)', createdAt: new Date().toISOString(), storage: null })
    setView('preview')
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    if (!check()) return
    setSaving(true)
    try {
      const rx = await onSave(cleanData())
      setSheet(rx)
      setView('saved')
      notify(
        'success',
        rx.storage === 'backend'
          ? 'Prescription saved to the backend.'
          : 'Demo prescription kept in frontend memory only. Nothing was sent to a server.'
      )
    } catch {
      notify('error', 'The prescription could not be saved and nothing was stored. Check the backend server and try again.')
    } finally {
      setSaving(false)
    }
  }

  const startNew = () => {
    setForm(EMPTY_RX)
    setErrors({})
    setSheet(null)
    setView('form')
  }

  if (view === 'saved' && sheet) {
    return (
      <Modal titleId="rx-title" size="lg" onClose={onClose}>
        <h2 id="rx-title" className="modal-title no-print">Prescription saved</h2>
        <p className="ok-banner no-print" role="status">
          <Icon name="check" size={20} />
          <span>
            {sheet.storage === 'backend'
              ? 'Saved to the Spring Boot backend and stored in the MySQL database.'
              : 'Saved in frontend memory only. It is not stored in any backend or database and will disappear when you refresh the page.'}
          </span>
        </p>
        <RxSheet rx={sheet} />
        <div className="modal-actions no-print">
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            <Icon name="printer" size={18} /> Print / Save as PDF
          </button>
          <button type="button" className="btn btn-ghost" onClick={startNew}>New prescription</button>
          <button type="button" className="btn btn-dark" onClick={onClose}>Close</button>
        </div>
      </Modal>
    )
  }

  if (view === 'preview' && sheet) {
    return (
      <Modal titleId="rx-title" size="lg" onClose={onClose}>
        <h2 id="rx-title" className="modal-title no-print">Prescription preview</h2>
        <DemoNote className="no-print">This preview has not been saved yet.</DemoNote>
        <RxSheet rx={sheet} />
        <div className="modal-actions no-print">
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save prescription'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
            <Icon name="printer" size={18} /> Print
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setView('form')}>Back to edit</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal titleId="rx-title" size="lg" onClose={onClose}>
      <p className="eyebrow">Healthcare services</p>
      <h2 id="rx-title" className="modal-title">Digital prescription</h2>
      <DemoNote>
        {USE_BACKEND
          ? 'Prescriptions are sent to the Spring Boot backend when you press Save.'
          : 'Demo mode: prescriptions stay in this page’s memory only and disappear on refresh. Nothing is sent to a server or database.'}
      </DemoNote>

      <form onSubmit={handleSave} noValidate className="form">
        <div className="row">
          <Field id="rx-patientId" label="Patient ID" error={errors.patientId} hint={USE_BACKEND ? undefined : 'Try a sample ID such as P-1001.'}>
            <input {...ip('patientId')} type="text" autoComplete="off" onBlur={onPatientIdBlur} />
          </Field>
          <Field id="rx-patientName" label="Patient name" error={errors.patientName}>
            <input {...ip('patientName')} type="text" autoComplete="off" />
          </Field>
        </div>

        <div className="row">
          <Field id="rx-doctor" label="Doctor name" error={errors.doctor}>
            <select {...ip('doctor')}>
              <option value="">Select a doctor</option>
              {DOCTORS.map((d) => (
                <option key={d.id} value={d.name}>{d.name} — {d.department}</option>
              ))}
            </select>
          </Field>
          <Field id="rx-diagnosis" label="Diagnosis" error={errors.diagnosis}>
            <input {...ip('diagnosis')} type="text" autoComplete="off" />
          </Field>
        </div>

        <Field id="rx-medicine" label="Medicine name" error={errors.medicine}>
          <input {...ip('medicine')} type="text" autoComplete="off" />
        </Field>

        <div className="row row-3">
          <Field id="rx-dosage" label="Dosage" error={errors.dosage} hint="Example: 500 mg">
            <input {...ip('dosage')} type="text" autoComplete="off" />
          </Field>
          <Field id="rx-frequency" label="Frequency" error={errors.frequency}>
            <select {...ip('frequency')}>
              <option value="">Select</option>
              {FREQUENCIES.map((fq) => (
                <option key={fq} value={fq}>{fq}</option>
              ))}
            </select>
          </Field>
          <Field id="rx-duration" label="Duration (days)" error={errors.duration}>
            <input {...ip('duration')} type="number" min="1" max="365" inputMode="numeric" />
          </Field>
        </div>

        <Field id="rx-instructions" label="Instructions" error={errors.instructions}>
          <textarea {...ip('instructions')} rows={3} />
        </Field>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save prescription'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={handlePreview}>
            <Icon name="printer" size={18} /> View / Print
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  )
}

/* ------------------------------ App --------------------------------- */

function App() {
  const [query, setQuery] = useState('')
  const [dept, setDept] = useState('All')
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')
  const [prescriptions, setPrescriptions] = useState([])

  const avail = useMemo(
    () => Object.fromEntries(DOCTORS.map((d) => [d.id, availabilityFor(d)])),
    []
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DOCTORS.filter((d) => {
      const inDept = dept === 'All' || d.department === dept
      const hay = `${d.name} ${d.specialty} ${d.department}`.toLowerCase()
      return inDept && (!q || hay.includes(q))
    })
  }, [query, dept])

  const notify = (kind, msg) => setToast({ kind, msg, id: Date.now() })

  /* Saves a prescription: to the backend if enabled, otherwise to frontend state only. */
  const handleSavePrescription = async (data) => {
    let rx
    if (USE_BACKEND) {
      const saved = await apiRequest('/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          patientCode: data.patientId,
          patientName: data.patientName,
          doctorName: data.doctor,
          diagnosis: data.diagnosis,
          medicineName: data.medicine,
          dosage: data.dosage,
          frequency: data.frequency,
          durationDays: data.duration,
          instructions: data.instructions,
        }),
      })
      rx = {
        ...data,
        ref: `RX-${saved.id}`,
        createdAt: saved.createdAt || new Date().toISOString(),
        storage: 'backend',
      }
    } else {
      rx = {
        ...data,
        ref: `RX-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        storage: 'frontend',
      }
    }
    setPrescriptions((list) => [rx, ...list])
    return rx
  }

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 5500)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined
    const ids = ['home', 'services', 'doctors', 'how', 'about']
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(en.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const scrollToId = (id) => {
    const el = document.getElementById(id)
    if (el) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
    setMenuOpen(false)
  }

  const go = (id) => (e) => {
    e.preventDefault()
    scrollToId(id)
  }

  const openBook = (doc = null) => {
    setMenuOpen(false)
    setModal({ type: 'book', doctor: doc })
  }
  const openAuth = (mode) => {
    setMenuOpen(false)
    setModal({ type: 'auth', mode })
  }
  const openRecords = () => setModal({ type: 'records' })
  const openRx = () => setModal({ type: 'rx' })
  const closeModal = () => setModal(null)

  const heroDoc = DOCTORS[0]
  const heroInfo = avail[heroDoc.id]
  const heroNext = heroInfo.next

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'doctors', label: 'Find Doctors' },
    { id: 'about', label: 'About' },
  ]

  return (
    <div className="mc">
      <style>{css}</style>
      <a href="#main" className="skip">Skip to main content</a>

      {/* ------------------------------ Navigation ------------------------------ */}
      <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="wrap nav-inner">
          <a href="#home" className="brand" aria-label="MediCare home" onClick={go('home')}>
            <Logo />
          </a>
          <nav aria-label="Primary" className="nav-links">
            {navItems.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={go(n.id)}
                aria-current={active === n.id ? 'true' : undefined}
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <button type="button" className="link-btn" onClick={() => openAuth('login')}>Sign In</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openBook(null)}>
              Book Appointment
            </button>
          </div>
          <button
            type="button"
            className="burger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon name={menuOpen ? 'x' : 'menu'} size={24} />
          </button>
        </div>
        {menuOpen && (
          <div className="mobile-menu" id="mobile-menu">
            <nav aria-label="Mobile">
              {navItems.map((n) => (
                <a key={n.id} href={`#${n.id}`} onClick={go(n.id)}>{n.label}</a>
              ))}
            </nav>
            <div className="mobile-actions">
              <button type="button" className="btn btn-ghost" onClick={() => openAuth('login')}>Sign In</button>
              <button type="button" className="btn btn-primary" onClick={() => openBook(null)}>Book Appointment</button>
            </div>
          </div>
        )}
      </header>

      <main id="main">
        {/* -------------------------------- Hero --------------------------------- */}
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="eyebrow eyebrow-pill"><Icon name="stethoscope" size={16} /> Appointments &amp; patient care, together</p>
              <h1 id="hero-title">
                Better care begins with the <span className="hl">right connection.</span>
              </h1>
              <p className="lead">
                Book appointments in a few calm steps, keep your records organized, and stay connected with the doctors
                who look after you, all in one thoughtfully designed place.
              </p>
              <div className="cta-row">
                <button type="button" className="btn btn-primary btn-lg" onClick={() => openBook(null)}>
                  Book Appointment <Icon name="arrow" size={18} />
                </button>
                <a href="#doctors" className="btn btn-ghost btn-lg" onClick={go('doctors')}>Find a Doctor</a>
              </div>
              <ul className="trust" aria-label="What MediCare is designed for">
                <li><Icon name="calendar" size={18} /> Simple scheduling</li>
                <li><Icon name="file" size={18} /> Organized records</li>
                <li><Icon name="pill" size={18} /> Clear prescriptions</li>
              </ul>
            </div>

            <div className="hv">
              <div className="hv-dots" aria-hidden="true" />
              <div className="hv-arch">
                <svg viewBox="0 0 400 440" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
                  <circle cx="200" cy="175" r="132" fill="#ffffff" opacity=".6" />
                  <circle cx="200" cy="175" r="168" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 9" />
                  <path d="M40 440c0-82 55-132 160-132s160 50 160 132z" fill="#ffffff" />
                  <path d="M166 312l-24 40 58 30z M234 312l24 40-58 30z" fill="#EEF4F8" stroke="#D5E1E8" strokeWidth="2" />
                  <path d="M166 312l34 56 34-56z" fill="#087F8C" />
                  <rect x="184" y="262" width="32" height="56" rx="14" fill="#e8b88f" />
                  <ellipse cx="200" cy="224" rx="47" ry="56" fill="#e8b88f" />
                  <path d="M152 218c0-40 22-64 50-64s48 24 48 64c-10-22-26-32-48-32s-40 10-50 32z" fill="#1d2b30" />
                  <circle cx="183" cy="230" r="3.4" fill="#1d2b30" />
                  <circle cx="217" cy="230" r="3.4" fill="#1d2b30" />
                  <path d="M186 251q14 10 28 0" stroke="#1d2b30" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M160 318c-14 44 10 78 42 76" stroke="#17324D" strokeWidth="5" fill="none" strokeLinecap="round" />
                  <circle cx="203" cy="394" r="11" fill="#7FE0CF" stroke="#17324D" strokeWidth="4" />
                  <rect x="262" y="384" width="50" height="46" rx="8" fill="none" stroke="#D5E1E8" strokeWidth="3" />
                  <rect x="278" y="374" width="6" height="22" rx="3" fill="#087F8C" />
                  <path d="M70 92h14M77 85v14M330 150h12M336 144v12M96 250h10M101 245v10" stroke="#087F8C" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              <div className="float-card fc-rx">
                <span className="icon-tile sm"><Icon name="pill" size={20} /></span>
                <div>
                  <strong>Digital prescription</strong>
                  <span>Shared after your visit</span>
                </div>
              </div>

              <div className="float-card fc-appt" role="group" aria-label="Sample appointment summary">
                <div className="fc-head">
                  <span className="fc-label">Appointment summary</span>
                  <span className="pill pill-demo">Sample</span>
                </div>
                <div className="fc-doc">
                  <span className="avatar avatar-sm"><Avatar look={heroDoc.look} size={44} /></span>
                  <div>
                    <strong>{heroDoc.name}</strong>
                    <span>{heroDoc.department}</span>
                  </div>
                </div>
                <dl className="fc-meta">
                  <div>
                    <dt><Icon name="calendar" size={15} /> Date</dt>
                    <dd>{heroNext ? `${heroNext.day.dow}, ${heroNext.day.month} ${heroNext.day.day}` : 'TBD'}</dd>
                  </div>
                  <div>
                    <dt><Icon name="clock" size={15} /> Time</dt>
                    <dd>{heroNext ? heroNext.time : '—'}</dd>
                  </div>
                </dl>
                <p className="fc-status"><span className="dot" /> Slot held (demo)</p>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------- Services ------------------------------- */}
        <section className="sec" id="services" aria-labelledby="svc-title">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">Healthcare services</p>
              <h2 id="svc-title">Everything care needs, gently organized.</h2>
              <p className="sub">Three connected tools that keep appointments, records and prescriptions clear for patients and clinicians alike.</p>
            </div>

            <div className="svc">
              <article className="svc-card svc-main">
                <span className="icon-tile on-dark"><Icon name="calendar" size={26} /></span>
                <h3>Appointment booking</h3>
                <p>A calm, guided flow from choosing a doctor to confirming a time that suits you.</p>
                <div className="mini-cal" aria-hidden="true">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
                    <div key={d} className={`cal-day ${i === 2 ? 'on' : ''}`}>
                      <span>{d}</span>
                      <b>{12 + i}</b>
                    </div>
                  ))}
                </div>
                <div className="mini-slots" aria-hidden="true">
                  <span>09:30</span><span className="on">10:30</span><span>11:30</span><span>02:00</span>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => openBook(null)}>
                  Book an appointment <Icon name="arrow" size={18} />
                </button>
              </article>

              <article className="svc-card svc-records is-click">
                <span className="icon-tile"><Icon name="file" size={26} /></span>
                <h3>Patient records</h3>
                <p>Visit history, notes and care plans kept together in one tidy timeline.</p>
                <ul className="rec-list" aria-hidden="true">
                  <li><i /><span style={{ width: '72%' }} /><em /></li>
                  <li><i /><span style={{ width: '56%' }} /><em /></li>
                  <li><i /><span style={{ width: '64%' }} /><em /></li>
                </ul>
                <button type="button" className="btn btn-dark btn-sm svc-link" onClick={openRecords}>
                  Open patient records <Icon name="arrow" size={16} />
                </button>
              </article>

              <article className="svc-card svc-rx is-click">
                <span className="icon-tile"><Icon name="pill" size={26} /></span>
                <h3>Digital prescriptions</h3>
                <p>Legible prescriptions with clear dosage instructions, ready to review on any device.</p>
                <div className="rx-chip" aria-hidden="true">
                  <b>Rx</b>
                  <span>Sample medicine · twice daily</span>
                </div>
                <button type="button" className="btn btn-dark btn-sm svc-link" onClick={openRx}>
                  Write a prescription <Icon name="arrow" size={16} />
                </button>
              </article>
            </div>
          </div>
        </section>

        {/* ------------------------------ Doctors --------------------------------- */}
        <section className="sec sec-mint" id="doctors" aria-labelledby="doc-heading">
          <div className="wrap">
            <div className="sec-head sec-head-split">
              <div>
                <p className="eyebrow">Featured doctors</p>
                <h2 id="doc-heading">Find the right specialist.</h2>
              </div>
              <p className="sub">Search by name or specialty, or filter by department. Profiles and schedules are fictional samples.</p>
            </div>

            <div className="toolbar">
              <div className="search">
                <label htmlFor="doc-search" className="sr-only">Search doctors by name or specialty</label>
                <Icon name="search" size={20} />
                <input
                  id="doc-search"
                  type="search"
                  placeholder="Search by name or specialty"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="chips" role="group" aria-label="Filter by department">
                {['All', ...DEPARTMENTS].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className="chip"
                    aria-pressed={dept === d}
                    onClick={() => setDept(d)}
                  >
                    <Icon name={DEPT_ICON[d]} size={16} /> {d}
                  </button>
                ))}
              </div>
            </div>

            <p className="count" role="status" aria-live="polite">
              Showing {filtered.length} of {DOCTORS.length} doctors
            </p>

            {filtered.length === 0 ? (
              <div className="empty">
                <Icon name="search" size={30} />
                <h3>No doctors match your search</h3>
                <p>Try a different name or choose another department.</p>
                <button
                  type="button"
                  className="btn btn-dark btn-sm"
                  onClick={() => {
                    setQuery('')
                    setDept('All')
                  }}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <ul className="doc-grid">
                {filtered.map((d) => {
                  const info = avail[d.id]
                  const st = STATUS[info.status]
                  return (
                    <li key={d.id}>
                      <article className="doc-card">
                        <div className="doc-top">
                          <span className="avatar"><Avatar look={d.look} size={76} /></span>
                          <span className={`pill ${st.cls}`}><span className="dot" /> {st.label}</span>
                        </div>
                        <div className="doc-body">
                          <h3>{d.name}</h3>
                          <p className="doc-spec">{d.specialty}</p>
                          <p className="doc-meta"><Icon name={DEPT_ICON[d.department]} size={16} /> {d.department}</p>
                          <p className="doc-meta"><Icon name="clock" size={16} /> {info.nextLabel}</p>
                        </div>
                        <div className="doc-actions">
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => setModal({ type: 'doctor', doctor: d })}
                            aria-label={`View profile of ${d.name}`}
                          >
                            View Profile
                          </button>
                          <button
                            type="button"
                            className="btn btn-dark btn-sm"
                            onClick={() => openBook(d)}
                            aria-label={`Book an appointment with ${d.name}`}
                          >
                            Book
                          </button>
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>

        {/* ----------------------------- How it works ----------------------------- */}
        <section className="sec how" id="how" aria-labelledby="how-title">
          <div className="wrap">
            <div className="sec-head sec-head-light">
              <p className="eyebrow">How it works</p>
              <h2 id="how-title">Your care journey, in four clear steps.</h2>
            </div>
            <ol className="steps">
              {[
                { icon: 'search', title: 'Find a Doctor', text: 'Search by name, specialty or department and compare profiles.' },
                { icon: 'clock', title: 'Choose a Slot', text: 'Pick a date and a time that fits your day from the open slots.' },
                { icon: 'check', title: 'Confirm Appointment', text: 'Add your details and review everything before you confirm.' },
                { icon: 'heart', title: 'Receive Care', text: 'Meet your doctor and keep follow-ups and prescriptions in one place.' },
              ].map((s, i) => (
                <li key={s.title} className="step">
                  <span className="step-icon"><Icon name={s.icon} size={26} /></span>
                  <span className="step-num">0{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------ About / Benefits ------------------------ */}
        <section className="sec" id="about" aria-labelledby="about-title">
          <div className="wrap about">
            <div className="about-copy">
              <p className="eyebrow">Why MediCare</p>
              <h2 id="about-title">Designed around the patient, not the paperwork.</h2>
              <p className="sub">
                MediCare is a student project that demonstrates the front end of a hospital appointment and patient
                management system. All doctors, schedules and bookings shown are fictional samples.
              </p>
              <button type="button" className="btn btn-dark" onClick={() => openAuth('register')}>
                Create a demo account
              </button>
            </div>
            <ul className="benefits">
              {[
                { icon: 'calendar', title: 'Booking in a few steps', text: 'A short guided flow with a clear confirmation at the end.' },
                { icon: 'layers', title: 'One organized place', text: 'Appointments, records and prescriptions presented together.' },
                { icon: 'file', title: 'Clear communication', text: 'Plain-language details so nothing is left to guess.' },
                { icon: 'shield', title: 'Accessible by design', text: 'Keyboard-friendly, readable on any screen and respectful of reduced motion.' },
              ].map((b) => (
                <li key={b.title}>
                  <span className="icon-tile"><Icon name={b.icon} size={24} /></span>
                  <div>
                    <h3>{b.title}</h3>
                    <p>{b.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* --------------------------------- CTA ---------------------------------- */}
        <section className="wrap cta-wrap" aria-labelledby="cta-title">
          <div className="cta">
            <h2 id="cta-title">Ready to meet your next doctor?</h2>
            <p>Explore the demo booking flow and see how simple scheduling can feel.</p>
            <div className="cta-row cta-center">
              <button type="button" className="btn btn-primary btn-lg" onClick={() => openBook(null)}>
                Book Appointment <Icon name="arrow" size={18} />
              </button>
              <a href="#doctors" className="btn btn-light btn-lg" onClick={go('doctors')}>Browse doctors</a>
            </div>
          </div>
        </section>
      </main>

      {/* -------------------------------- Footer -------------------------------- */}
      <footer className="footer">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <Logo light />
            <p>Coordinated, patient-friendly care, presented as a college demonstration project.</p>
          </div>
          <nav aria-label="Footer navigation">
            <h3>Navigate</h3>
            <ul>
              {navItems.map((n) => (
                <li key={n.id}><a href={`#${n.id}`} onClick={go(n.id)}>{n.label}</a></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Departments">
            <h3>Departments</h3>
            <ul>
              {DEPARTMENTS.slice(0, 5).map((d) => (
                <li key={d}>
                  <a
                    href="#doctors"
                    onClick={(e) => {
                      e.preventDefault()
                      setDept(d)
                      scrollToId('doctors')
                    }}
                  >
                    {d}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3>Contact</h3>
            <ul className="contact">
              <li><Icon name="mail" size={17} /> contact@medicare.example</li>
              <li><Icon name="phone" size={17} /> +00 000 000 0000</li>
              <li><Icon name="pin" size={17} /> 123 Sample Street, Your City</li>
            </ul>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <p>© {new Date().getFullYear()} MediCare. Academic demonstration project, not a real medical service.</p>
          <p>For emergencies, contact your local emergency services.</p>
        </div>
      </footer>

      {/* -------------------------------- Modals -------------------------------- */}
      {modal && modal.type === 'doctor' && (
        <DoctorModal
          key={`doc-${modal.doctor.id}`}
          doctor={modal.doctor}
          info={avail[modal.doctor.id]}
          onBook={(d) => openBook(d)}
          onClose={closeModal}
        />
      )}
      {modal && modal.type === 'book' && (
        <BookingModal
          key={`book-${modal.doctor ? modal.doctor.id : 'any'}`}
          doctor={modal.doctor}
          onClose={closeModal}
          notify={notify}
        />
      )}
      {modal && modal.type === 'auth' && (
        <AuthModal key={`auth-${modal.mode}`} initialMode={modal.mode} onClose={closeModal} notify={notify} />
      )}
      {modal && modal.type === 'records' && (
        <PatientRecordsModal key="records" prescriptions={prescriptions} onClose={closeModal} />
      )}
      {modal && modal.type === 'rx' && (
        <PrescriptionModal key="rx" onSave={handleSavePrescription} onClose={closeModal} notify={notify} />
      )}

      {/* --------------------------------- Toast -------------------------------- */}
      {toast && (
        <div
          key={toast.id}
          className={`toast toast-${toast.kind}`}
          role={toast.kind === 'error' ? 'alert' : 'status'}
        >
          <Icon name={toast.kind === 'error' ? 'alert' : toast.kind === 'success' ? 'check' : 'shield'} size={20} />
          <span>{toast.msg}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification">
            <Icon name="x" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------ Styles ------------------------------ */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

html{scroll-behavior:smooth}
body{margin:0!important;display:block!important;background:#F7FAFC!important}
#root{width:100%!important;max-width:none!important;margin:0!important;padding:0!important;border:0!important;text-align:left!important;display:block!important;min-height:0!important}

.mc{
  --navy:#17324D;--navy-d:#0F2438;--teal:#087F8C;--teal-d:#066873;
  --mint:#E6F5F2;--mint-2:#CDEAE4;--page:#F7FAFC;--ink:#172B3A;--muted:#526575;
  --line:#D5E1E8;--field:#7B92A3;--ok:#18794E;--err:#B42318;--accent:#7FE0CF;
  font-family:'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  color:var(--ink);background:var(--page);line-height:1.6;color-scheme:light;
  -webkit-font-smoothing:antialiased;overflow-x:hidden;text-align:left;
}
.mc *,.mc *::before,.mc *::after{box-sizing:border-box}
.mc h1,.mc h2,.mc h3,.mc h4,.mc p,.mc dl,.mc dd,.mc ul,.mc ol{margin:0;padding:0}
.mc h1,.mc h2,.mc h3{font-family:'Fraunces',Georgia,'Times New Roman',serif;font-weight:600;color:var(--navy);letter-spacing:-.015em;line-height:1.12}
.mc :where(a){color:inherit;text-decoration:none}
.mc :where(button,input,select,textarea){font:inherit;color:inherit}
.mc :where(button){cursor:pointer}
.mc ul,.mc ol{list-style:none}
.mc :focus-visible{outline:3px solid var(--teal);outline-offset:3px}
.mc ::selection{background:var(--accent);color:var(--navy)}
.wrap{width:min(1180px,100% - 2.5rem);margin-inline:auto}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.skip{position:absolute;left:1rem;top:-4rem;background:var(--navy);color:#fff;padding:.7rem 1rem;border-radius:12px;z-index:300;transition:top .2s}
.skip:focus{top:1rem}

/* Buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.55rem;padding:.8rem 1.4rem;border-radius:999px;border:2px solid transparent;font-weight:600;font-size:.97rem;line-height:1.2;text-align:center;transition:transform .2s,box-shadow .2s,background .2s,color .2s,border-color .2s}
.btn:hover{transform:translateY(-2px)}
.btn:active{transform:translateY(0)}
.btn:disabled{opacity:.65;cursor:not-allowed;transform:none}
.btn-sm{padding:.6rem 1.1rem;font-size:.9rem}
.btn-lg{padding:1rem 1.7rem;font-size:1rem}
.btn-primary{background:var(--teal);color:#fff;box-shadow:0 8px 18px -10px rgba(8,127,140,.9)}
.btn-primary:hover{background:var(--teal-d)}
.btn-dark{background:var(--navy);color:#fff}
.btn-dark:hover{background:var(--navy-d)}
.btn-ghost{background:#fff;color:var(--navy);border-color:var(--navy)}
.btn-ghost:hover{background:var(--mint)}
.btn-light{background:transparent;color:#fff;border-color:#fff}
.btn-light:hover{background:rgba(255,255,255,.16)}
.link-btn{background:none;border:0;padding:.5rem .7rem;font-weight:600;color:var(--navy);border-radius:10px}
.link-btn:hover{color:var(--teal-d);text-decoration:underline;text-underline-offset:4px}

/* Logo */
.logo{display:inline-flex;align-items:center;gap:.6rem}
.logo-text{font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:1.45rem;color:var(--navy);letter-spacing:-.02em}
.logo-text b{color:var(--teal-d);font-weight:600}
.logo-light .logo-text{color:#fff}
.logo-light .logo-text b{color:var(--accent)}

/* Nav */
.nav{position:sticky;top:0;z-index:60;background:rgba(247,250,252,.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid transparent;transition:border-color .2s,box-shadow .2s}
.nav.scrolled{border-color:var(--line);box-shadow:0 8px 24px -20px rgba(23,50,77,.6)}
.nav-inner{display:flex;align-items:center;gap:1.5rem;height:74px}
.nav-links{display:flex;gap:.3rem;margin-left:auto}
.nav-links a{padding:.55rem .95rem;border-radius:999px;font-weight:600;color:var(--muted);transition:background .2s,color .2s}
.nav-links a:hover{background:var(--mint);color:var(--navy)}
.nav-links a[aria-current="true"]{background:var(--mint-2);color:var(--navy)}
.nav-actions{display:flex;align-items:center;gap:.6rem}
.burger{display:none;margin-left:auto;width:46px;height:46px;border-radius:14px;border:2px solid var(--navy);background:#fff;align-items:center;justify-content:center;color:var(--navy)}
.mobile-menu{border-top:1px solid var(--line);background:var(--page);padding:1rem 1.25rem 1.5rem;box-shadow:0 18px 30px -22px rgba(23,50,77,.6)}
.mobile-menu nav{display:grid;gap:.25rem}
.mobile-menu nav a{padding:.85rem 1rem;border-radius:14px;font-weight:600;color:var(--navy)}
.mobile-menu nav a:hover{background:var(--mint)}
.mobile-actions{display:grid;gap:.6rem;margin-top:1rem}

/* Hero */
.hero{position:relative;padding:3.5rem 0 5.5rem;background:linear-gradient(180deg,var(--mint) 0%,var(--page) 100%)}
.hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:3rem;align-items:center}
.eyebrow{font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--teal-d);margin-bottom:.9rem}
.eyebrow-pill{display:inline-flex;align-items:center;gap:.5rem;background:#fff;border:1px solid var(--line);padding:.45rem .9rem;border-radius:999px;letter-spacing:.04em;text-transform:none;font-size:.85rem;margin-bottom:1.4rem;color:var(--navy)}
.hero h1{font-size:clamp(2.5rem,5.4vw,4.35rem);line-height:1.04;letter-spacing:-.025em}
.hl{white-space:nowrap;color:var(--teal-d);background:linear-gradient(transparent 62%,var(--mint-2) 62%,var(--mint-2) 92%,transparent 92%)}
.lead{margin-top:1.4rem;font-size:1.13rem;color:var(--muted);max-width:34rem}
.cta-row{display:flex;flex-wrap:wrap;gap:.9rem;margin-top:2rem}
.cta-center{justify-content:center}
.trust{display:flex;flex-wrap:wrap;gap:.6rem 1.6rem;margin-top:2.2rem;color:var(--navy);font-weight:600;font-size:.93rem}
.trust li{display:flex;align-items:center;gap:.5rem}
.trust svg{color:var(--teal-d)}

.hv{position:relative;width:100%;max-width:490px;margin-inline:auto;aspect-ratio:1/1.08}
.hv-arch{position:absolute;inset:0 7% 0 7%;border-radius:999px 999px 40px 40px;overflow:hidden;background:var(--mint-2);box-shadow:0 40px 70px -44px rgba(23,50,77,.6)}
.hv-arch svg{position:absolute;inset:0;width:100%;height:100%}
.hv-dots{position:absolute;top:6%;left:-2%;width:110px;height:110px;background-image:radial-gradient(var(--teal) 1.6px,transparent 1.8px);background-size:14px 14px;opacity:.35}
.float-card{position:absolute;background:#fff;border:1px solid var(--line);border-radius:20px;box-shadow:0 24px 50px -28px rgba(23,50,77,.55);animation:floaty 7s ease-in-out infinite}
.fc-appt{left:-3%;bottom:7%;width:min(275px,72%);padding:1rem 1.1rem}
.fc-rx{right:-2%;top:11%;display:flex;align-items:center;gap:.7rem;padding:.7rem .95rem .7rem .7rem;animation-delay:-3s}
.fc-rx strong{display:block;font-size:.88rem;color:var(--navy);line-height:1.25}
.fc-rx span:not(.icon-tile){font-size:.78rem;color:var(--muted)}
.fc-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem}
.fc-label{font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.fc-doc{display:flex;align-items:center;gap:.7rem}
.fc-doc strong{display:block;font-size:.95rem;color:var(--navy);line-height:1.2}
.fc-doc span:not(.avatar){font-size:.8rem;color:var(--muted)}
.fc-meta{display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin:.9rem 0;padding:.7rem;background:var(--mint);border-radius:14px}
.fc-meta dt{display:flex;align-items:center;gap:.3rem;font-size:.72rem;color:var(--muted);font-weight:600}
.fc-meta dd{font-weight:700;font-size:.9rem;color:var(--navy)}
.fc-status{display:flex;align-items:center;gap:.5rem;font-size:.8rem;font-weight:600;color:var(--ok)}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

.avatar{display:inline-block;flex:none;border-radius:50%;overflow:hidden;line-height:0;border:3px solid #fff;box-shadow:0 6px 16px -8px rgba(23,50,77,.6)}
.avatar-sm{border-width:2px}
.avatar-lg{border-radius:28px}
.icon-tile{display:inline-grid;place-items:center;width:54px;height:54px;border-radius:17px;background:var(--mint-2);color:var(--navy)}
.icon-tile.sm{width:42px;height:42px;border-radius:13px;flex:none}
.icon-tile.on-dark{background:rgba(127,224,207,.18);color:var(--accent)}
.dot{width:8px;height:8px;border-radius:50%;background:currentColor;display:inline-block}
.pill{display:inline-flex;align-items:center;gap:.4rem;padding:.28rem .7rem;border-radius:999px;font-size:.76rem;font-weight:700;white-space:nowrap}
.pill-demo{background:#FFF1CF;color:#6A4500}
.st-available{background:#E1F3EA;color:var(--ok)}
.st-limited{background:#FFF1CF;color:#6A4500}
.st-soon{background:#E3EEF8;color:var(--navy)}
.st-full{background:#FDE8E6;color:var(--err)}
.tag{display:inline-flex;align-items:center;gap:.4rem;padding:.28rem .7rem;border-radius:999px;background:var(--mint-2);color:var(--navy);font-size:.8rem;font-weight:600}

/* Sections */
.sec{padding:6rem 0}
.sec-mint{background:var(--mint)}
.sec-head{max-width:40rem;margin-bottom:2.8rem}
.sec-head h2,.about-copy h2{font-size:clamp(2rem,3.8vw,3rem)}
.sub{margin-top:1rem;color:var(--muted);font-size:1.06rem}
.sec-head-split{max-width:none;display:flex;justify-content:space-between;align-items:flex-end;gap:2rem;flex-wrap:wrap}
.sec-head-split .sub{max-width:28rem;margin-top:0}

/* Services bento */
.svc{display:grid;grid-template-columns:1.1fr 1fr;grid-template-rows:auto auto;gap:1.25rem}
.svc-card{position:relative;overflow:hidden;background:#fff;border:1px solid var(--line);border-radius:30px;padding:2rem;display:flex;flex-direction:column;gap:.8rem;transition:transform .25s,box-shadow .25s}
.svc-card:hover{transform:translateY(-4px);box-shadow:0 26px 44px -32px rgba(23,50,77,.55)}
.svc-card h3{font-size:1.55rem;margin-top:.6rem}
.svc-card p{color:var(--muted);max-width:30rem}
.svc-main{grid-row:span 2;background:var(--navy);border-color:var(--navy)}
.svc-main h3{color:#fff}
.svc-main p{color:rgba(255,255,255,.88)}
.svc-main .btn{align-self:flex-start;margin-top:auto}
.svc-main .btn-primary{background:var(--accent);color:var(--navy);box-shadow:none}
.svc-main .btn-primary:hover{background:#fff}
.mini-cal{display:grid;grid-template-columns:repeat(5,1fr);gap:.55rem;margin-top:1.4rem}
.cal-day{display:grid;justify-items:center;gap:.1rem;padding:.7rem .2rem;border-radius:16px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.88);font-size:.78rem}
.cal-day b{font-size:1.2rem;color:#fff;font-family:'Fraunces',Georgia,serif}
.cal-day.on{background:var(--accent);color:var(--navy)}
.cal-day.on b{color:var(--navy)}
.mini-slots{display:flex;flex-wrap:wrap;gap:.5rem;margin:.9rem 0 1.4rem}
.mini-slots span{padding:.4rem .85rem;border-radius:999px;border:1px solid rgba(255,255,255,.45);color:#fff;font-size:.82rem;font-weight:600}
.mini-slots span.on{background:#fff;color:var(--navy);border-color:#fff}
.svc-records{background:var(--mint);border-color:var(--mint-2)}
.svc-rx{background:#EAF1F7;border-color:#D3E1EE}
.svc-records .icon-tile,.svc-rx .icon-tile{background:#fff;border:1px solid var(--line);color:var(--navy)}
.rec-list{display:grid;gap:.6rem;margin:.6rem 0 0;padding:0;list-style:none}
.rec-list li{display:flex;align-items:center;gap:.7rem;padding:.7rem .9rem;background:#fff;border-radius:14px}
.rec-list i{width:12px;height:12px;border-radius:50%;background:var(--teal);flex:none}
.rec-list span{height:8px;border-radius:99px;background:#BFD3DC}
.rec-list em{margin-left:auto;width:34px;height:8px;border-radius:99px;background:#DCE7EC}
.rx-chip{display:flex;align-items:center;gap:.8rem;padding:.8rem 1rem;background:#fff;border-radius:16px;margin-top:.4rem}
.rx-chip b{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:var(--navy);color:var(--accent);font-family:'Fraunces',Georgia,serif;font-size:1.1rem}
.rx-chip span{font-size:.9rem;font-weight:600;color:var(--navy)}
.svc-card.is-click{cursor:pointer}
.svc-card .svc-link{align-self:flex-start;margin-top:1rem}
.svc-link::after{content:'';position:absolute;inset:0;border-radius:30px}
.svc-card:has(.svc-link:focus-visible){outline:3px solid var(--teal);outline-offset:3px}
.svc-link:focus-visible{outline:none}

/* Doctors */
.toolbar{display:grid;gap:1rem;margin-bottom:1rem}
.search{position:relative;max-width:520px}
.search svg{position:absolute;left:1.1rem;top:50%;transform:translateY(-50%);color:var(--teal-d);pointer-events:none}
.search input{width:100%;height:54px;padding:0 1.2rem 0 3.1rem;border-radius:999px;border:2px solid var(--field);background:#fff;font-size:1rem;transition:border-color .2s,box-shadow .2s}
.mc input::placeholder,.mc textarea::placeholder{color:#5B6F7E;opacity:1}
.search input:focus{outline:none;border-color:var(--teal);box-shadow:0 0 0 4px rgba(8,127,140,.25)}
.chips{display:flex;flex-wrap:wrap;gap:.5rem}
.chip{display:inline-flex;align-items:center;gap:.45rem;padding:.55rem 1rem;border-radius:999px;border:2px solid var(--field);background:#fff;font-weight:600;font-size:.88rem;color:var(--navy);transition:background .2s,color .2s,border-color .2s,transform .2s}
.chip:hover{border-color:var(--navy);background:var(--mint-2)}
.chip[aria-pressed="true"]{background:var(--navy);border-color:var(--navy);color:#fff}
.count{margin:.6rem 0 1.4rem;font-size:.9rem;color:var(--muted);font-weight:600}
.doc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:1.25rem}
.doc-card{height:100%;display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);border-radius:26px;overflow:hidden;transition:transform .25s,box-shadow .25s}
.doc-card:hover{transform:translateY(-5px);box-shadow:0 28px 44px -32px rgba(23,50,77,.55)}
.doc-top{display:flex;justify-content:space-between;align-items:flex-start;padding:1.1rem 1.1rem 3.6rem;background:var(--mint-2)}
.doc-top .avatar{margin-bottom:-3.4rem;align-self:flex-end}
.doc-body{padding:2.6rem 1.3rem .6rem;flex:1}
.doc-body h3{font-size:1.28rem}
.doc-spec{color:var(--muted);font-size:.93rem;margin:.2rem 0 .8rem}
.doc-meta{display:flex;align-items:center;gap:.5rem;font-size:.88rem;color:var(--ink);font-weight:500;margin-top:.35rem}
.doc-meta svg{color:var(--teal-d);flex:none}
.doc-actions{display:flex;gap:.6rem;padding:1rem 1.3rem 1.3rem}
.doc-actions .btn{flex:1}
.empty{display:grid;justify-items:center;gap:.6rem;text-align:center;padding:3rem 1rem;background:#fff;border:2px dashed var(--field);border-radius:26px;color:var(--navy)}
.empty h3{font-size:1.4rem}
.empty p{color:var(--muted);max-width:30rem}

/* How it works */
.how{background:var(--navy)}
.sec-head-light h2{color:#fff}
.sec-head-light .eyebrow{color:var(--accent)}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:1.6rem}
.step{position:relative;color:#fff}
.step:not(:last-child)::after{content:'';position:absolute;top:30px;left:calc(64px + .6rem);right:-.8rem;border-top:2px dashed rgba(127,224,207,.5)}
.step-icon{display:grid;place-items:center;width:62px;height:62px;border-radius:50%;background:rgba(127,224,207,.14);border:2px solid var(--accent);color:var(--accent)}
.step-num{display:block;margin-top:1.3rem;font-family:'Fraunces',Georgia,serif;font-size:.95rem;color:var(--accent);letter-spacing:.1em}
.step h3{color:#fff;font-size:1.4rem;margin:.3rem 0 .5rem}
.step p{color:rgba(255,255,255,.88);font-size:.97rem;max-width:16rem}

/* About */
.about{display:grid;grid-template-columns:.95fr 1.05fr;gap:4rem;align-items:start}
.about-copy .btn{margin-top:1.8rem}
.benefits{display:grid}
.benefits li{display:flex;gap:1.2rem;padding:1.4rem 0;border-bottom:1px solid var(--line)}
.benefits li:first-child{padding-top:0}
.benefits li:last-child{border-bottom:0}
.benefits .icon-tile{flex:none}
.benefits h3{font-size:1.3rem;margin-bottom:.25rem}
.benefits p{color:var(--muted)}

/* CTA */
.cta-wrap{padding-bottom:6rem}
.cta{position:relative;overflow:hidden;text-align:center;color:#fff;border-radius:38px;padding:4.5rem 1.5rem;background:var(--teal-d)}
.cta::before,.cta::after{content:'';position:absolute;border-radius:50%;border:2px solid rgba(255,255,255,.2)}
.cta::before{width:340px;height:340px;left:-110px;top:-140px}
.cta::after{width:420px;height:420px;right:-140px;bottom:-200px;background:rgba(255,255,255,.07)}
.cta h2{color:#fff;font-size:clamp(2rem,4vw,3.1rem);position:relative}
.cta p{position:relative;margin:1rem auto 0;max-width:34rem;color:#fff;font-size:1.08rem}
.cta .cta-row{position:relative}
.cta .btn-primary{background:#fff;color:var(--navy);box-shadow:none}
.cta .btn-primary:hover{background:var(--mint)}

/* Footer */
.footer{background:var(--navy);color:rgba(255,255,255,.88);padding-top:4rem}
.footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1.3fr;gap:2.5rem}
.footer h3{font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem;font-weight:700}
.footer-brand p{margin-top:1rem;max-width:20rem;font-size:.95rem}
.footer li{margin-bottom:.55rem}
.footer a{transition:color .2s}
.footer a:hover{color:var(--accent);text-decoration:underline;text-underline-offset:3px}
.contact li{display:flex;gap:.6rem;align-items:center}
.contact svg{color:var(--accent);flex:none}
.footer-bottom{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-top:3rem;padding:1.5rem 0 2rem;border-top:1px solid rgba(255,255,255,.22);font-size:.86rem}

/* Modals */
.overlay{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:1rem;overflow-y:auto;background:rgba(15,36,56,.66);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:fade .2s ease}
.modal{position:relative;width:100%;background:#fff;border:1px solid var(--line);border-radius:28px;padding:2.2rem;max-height:calc(100vh - 2rem);overflow-y:auto;box-shadow:0 40px 80px -30px rgba(0,0,0,.6);animation:pop .28s cubic-bezier(.2,.8,.2,1)}
.modal:focus{outline:none}
.modal-md{max-width:560px}
.modal-lg{max-width:720px}
.modal-xl{max-width:960px}
.modal-close{position:absolute;top:1rem;right:1rem;width:42px;height:42px;display:grid;place-items:center;border-radius:50%;border:2px solid var(--navy);background:#fff;color:var(--navy);transition:background .2s}
.modal-close:hover{background:var(--mint)}
.modal-title{font-size:2rem;margin-bottom:1rem;padding-right:2.8rem}
.modal-actions{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.5rem}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes pop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
.demo-note{display:flex;gap:.6rem;align-items:flex-start;margin:0 0 1.2rem;padding:.75rem .95rem;border-radius:14px;background:#FFF4D6;border:1px solid #E4C46A;color:#5C4100;font-size:.87rem;font-weight:500;line-height:1.45}
.demo-note svg{flex:none;margin-top:1px}
.ok-banner{display:flex;gap:.6rem;align-items:flex-start;margin:0 0 1.2rem;padding:.8rem 1rem;border-radius:14px;background:#E1F3EA;border:1px solid #9AD3B7;color:#0F5A39;font-weight:600;font-size:.92rem}
.ok-banner svg{flex:none;margin-top:2px}
.dm-head{display:flex;gap:1.2rem;align-items:center;margin-bottom:1.2rem;padding-right:2.5rem}
.dm-head h2{font-size:1.8rem}
.dm-spec{color:var(--muted);margin:.15rem 0 .7rem}
.dm-tags{display:flex;flex-wrap:wrap;gap:.5rem}
.dm-bio{color:var(--muted);margin-bottom:1.2rem}
.dm-list{display:grid;gap:.6rem;margin-bottom:1.3rem}
.dm-list div{display:grid;grid-template-columns:150px 1fr;gap:.8rem;padding:.75rem 1rem;background:var(--mint);border-radius:14px}
.dm-list dt{display:flex;align-items:center;gap:.5rem;font-weight:700;font-size:.88rem;color:var(--navy)}
.dm-list dd{font-size:.93rem}

/* Forms */
.form{display:grid;gap:1.1rem}
.row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.row-3{grid-template-columns:1fr 1fr 1fr}
.field label,.field .label{display:block;font-weight:700;font-size:.9rem;margin-bottom:.4rem;color:var(--navy)}
.field input,.field select,.field textarea{width:100%;padding:.8rem 1rem;border-radius:14px;border:2px solid var(--field);background:#fff;font-size:.98rem;color:var(--ink);transition:border-color .2s,box-shadow .2s}
.field textarea{resize:vertical;min-height:84px}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--teal);box-shadow:0 0 0 4px rgba(8,127,140,.25)}
.field .has-error{border-color:var(--err);background:#FFF8F7}
.err{display:flex;align-items:center;gap:.4rem;margin-top:.4rem;color:var(--err);font-size:.84rem;font-weight:600}
.hint{margin-top:.35rem;font-size:.84rem;color:var(--muted)}
.dates{display:flex;gap:.55rem;overflow-x:auto;padding:.2rem .1rem .5rem}
.dates:focus{outline:none}
.date-btn{flex:none;display:grid;justify-items:center;gap:0;width:70px;padding:.6rem .2rem;border-radius:16px;border:2px solid var(--field);background:#fff;font-size:.74rem;color:var(--muted);font-weight:600;transition:all .2s}
.date-btn b{font-family:'Fraunces',Georgia,serif;font-size:1.35rem;color:var(--navy);line-height:1.2}
.date-btn:hover{border-color:var(--navy);background:var(--mint)}
.date-btn[aria-pressed="true"]{background:var(--navy);border-color:var(--navy);color:#fff}
.date-btn[aria-pressed="true"] b{color:#fff}
.slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:.5rem}
.slots:focus{outline:none}
.slots .hint{grid-column:1/-1;margin:0}
.slot{padding:.65rem .4rem;border-radius:12px;border:2px solid var(--field);background:#fff;font-weight:600;font-size:.88rem;color:var(--navy);transition:all .2s}
.slot:hover:not(:disabled){border-color:var(--navy);background:var(--mint)}
.slot[aria-pressed="true"]{background:var(--teal);border-color:var(--teal);color:#fff}
.slot:disabled{cursor:not-allowed;background:#EEF2F5;color:#5F7280;text-decoration:line-through;border-color:#D5E1E8}
.tabs{display:flex;gap:.3rem;padding:.3rem;background:var(--mint);border-radius:999px;margin-bottom:1.2rem;border:1px solid var(--mint-2)}
.tab{flex:1;padding:.6rem 1rem;border-radius:999px;border:0;background:transparent;font-weight:700;color:var(--navy);transition:background .2s}
.tab:hover{background:var(--mint-2)}
.tab[aria-selected="true"]{background:var(--navy);color:#fff}

/* Success (booking) */
.success{text-align:center}
.success-icon{display:inline-grid;place-items:center;width:72px;height:72px;border-radius:50%;background:#E1F3EA;color:var(--ok);margin-bottom:1rem}
.success h2{font-size:1.9rem}
.success-sub{color:var(--muted);margin:.6rem auto 1.4rem;max-width:30rem}
.summary{display:grid;gap:.5rem;text-align:left;margin-bottom:1.2rem}
.summary div{display:flex;justify-content:space-between;gap:1rem;padding:.7rem 1rem;background:var(--mint);border-radius:12px;font-size:.93rem}
.summary dt{font-weight:700;color:var(--navy)}
.summary dd{text-align:right}
.success .demo-note{text-align:left}
.success .modal-actions{justify-content:center}

/* Patient records */
.pr-search{display:flex;gap:.8rem;flex-wrap:wrap;align-items:flex-start}
.pr-search-field{flex:1 1 260px}
.pr-search-actions{display:flex;gap:.6rem;flex-wrap:wrap;padding-top:1.72rem}
.pr-load-err{margin:.8rem 0 0}
.pr-grid{display:grid;grid-template-columns:260px 1fr;gap:1.2rem;align-items:start}
.pr-list{display:grid;gap:.5rem;align-content:start;max-height:520px;overflow-y:auto;padding:2px}
.pr-item{width:100%;display:grid;gap:.1rem;text-align:left;padding:.8rem 1rem;border-radius:14px;border:2px solid var(--line);background:#fff;transition:border-color .2s,background .2s}
.pr-item strong{color:var(--navy)}
.pr-item span{font-size:.85rem;color:var(--muted)}
.pr-item:hover{border-color:var(--navy);background:var(--mint)}
.pr-item[aria-pressed="true"]{border-color:var(--teal);background:var(--mint)}
.pr-detail{border:1px solid var(--line);border-radius:20px;padding:1.4rem;background:#fff}
.pr-detail-head{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap;margin-bottom:1rem}
.pr-detail-head h3{font-size:1.6rem}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.6rem;margin-bottom:1rem}
.fact{background:var(--mint);border-radius:12px;padding:.6rem .8rem}
.fact dt{font-size:.74rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.fact dd{font-weight:700;color:var(--navy)}
.pr-block{margin-top:1.1rem}
.pr-block h4,.rx-block h4{font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;color:var(--teal-d);margin-bottom:.35rem;font-weight:700}
.pr-block p{color:var(--ink)}
.table-wrap{overflow-x:auto}
.hist{width:100%;border-collapse:collapse;font-size:.9rem;min-width:480px}
.hist th{text-align:left;background:var(--mint);color:var(--navy);padding:.6rem .7rem;font-size:.8rem}
.hist td{padding:.65rem .7rem;border-bottom:1px solid var(--line)}
.rx-mini{display:grid;gap:.5rem}
.rx-mini li{display:flex;gap:.6rem;align-items:flex-start;padding:.6rem .8rem;background:var(--mint);border-radius:12px;font-size:.9rem}
.rx-mini svg{flex:none;color:var(--teal-d);margin-top:2px}
.rx-mini em{font-style:normal;color:var(--muted)}

/* Prescription sheet */
.rx-sheet{border:2px solid var(--navy);border-radius:18px;padding:1.5rem;background:#fff}
.rx-head{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;padding-bottom:1rem;border-bottom:2px solid var(--line);margin-bottom:1rem}
.rx-meta{display:grid;text-align:right;font-size:.85rem;color:var(--muted)}
.rx-meta strong{color:var(--navy);font-size:1rem}
.rx-people{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6rem;margin-bottom:1rem}
.rx-people div{background:var(--mint);border-radius:12px;padding:.6rem .8rem}
.rx-people dt{font-size:.74rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.rx-people dd{font-weight:700;color:var(--navy)}
.rx-block{margin:1rem 0}
.rx-table{width:100%;border-collapse:collapse;font-size:.93rem;min-width:420px;margin:.4rem 0}
.rx-table th{text-align:left;background:var(--navy);color:#fff;padding:.6rem .8rem;font-size:.82rem}
.rx-table td{padding:.7rem .8rem;border:1px solid var(--line);font-weight:600}
.rx-foot{margin-top:1rem;padding-top:.8rem;border-top:1px dashed var(--field);font-size:.82rem;color:var(--muted)}

/* Toast */
.toast{position:fixed;left:50%;bottom:1.4rem;transform:translateX(-50%);z-index:200;display:flex;align-items:center;gap:.7rem;max-width:min(520px,calc(100% - 2rem));padding:.9rem 1rem .9rem 1.1rem;border-radius:16px;background:var(--navy);color:#fff;font-weight:500;font-size:.93rem;box-shadow:0 20px 40px -16px rgba(0,0,0,.6);border-left:5px solid var(--accent);animation:toastin .3s ease}
.toast svg{flex:none;color:var(--accent)}
.toast-error{border-left-color:#FF9B92}
.toast-error svg{color:#FF9B92}
.toast button{flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff}
.toast button:hover{background:rgba(255,255,255,.3)}
.toast button svg{color:#fff}
@keyframes toastin{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}

/* Responsive */
@media (max-width:1020px){
  .hero-grid{grid-template-columns:1fr;gap:3.5rem}
  .hero-copy{max-width:40rem}
  .steps{grid-template-columns:repeat(2,1fr);gap:2.4rem 1.6rem}
  .step:not(:last-child)::after{display:none}
  .about{grid-template-columns:1fr;gap:2.5rem}
  .footer-grid{grid-template-columns:1fr 1fr}
}
@media (max-width:900px){
  .nav-links,.nav-actions{display:none}
  .burger{display:inline-flex}
}
@media (max-width:820px){
  .pr-grid{grid-template-columns:1fr}
  .pr-list{max-height:220px}
}
@media (max-width:760px){
  .sec{padding:4.2rem 0}
  .hero{padding:2rem 0 4rem}
  .svc{grid-template-columns:1fr}
  .svc-main{grid-row:auto}
  .row,.row-3{grid-template-columns:1fr}
  .dm-list div{grid-template-columns:1fr;gap:.2rem}
  .dm-head{flex-direction:column;align-items:flex-start}
  .modal{padding:1.5rem 1.2rem;border-radius:24px}
  .cta{padding:3.4rem 1.2rem;border-radius:28px}
  .fc-appt{left:0}
  .fc-rx{right:0}
  .pr-search-actions{padding-top:0}
  .rx-meta{text-align:left}
}
@media (max-width:520px){
  .steps{grid-template-columns:1fr}
  .footer-grid{grid-template-columns:1fr}
  .cta-row .btn{width:100%}
  .hero .cta-row .btn{flex:1 1 100%}
  .hl{white-space:normal}
}

/* Reduced motion */
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .mc *,.mc *::before,.mc *::after{animation:none!important;transition:none!important}
  .btn:hover,.svc-card:hover,.doc-card:hover,.chip:hover{transform:none}
}

/* Print: only the prescription sheet is printed */
@media print{
  body{background:#fff!important}
  .mc .skip,.mc .nav,.mc main,.mc .footer,.mc .toast,.no-print{display:none!important}
  .overlay{position:static;display:block;padding:0;background:#fff;backdrop-filter:none;-webkit-backdrop-filter:none;overflow:visible;animation:none}
  .modal{box-shadow:none;border:0;max-height:none;max-width:none;overflow:visible;padding:0;border-radius:0;animation:none}
  .modal-close{display:none!important}
}
`

export default App