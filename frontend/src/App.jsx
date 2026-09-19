import { useCallback, useEffect, useMemo, useState } from 'react'

/* ─────────────────────────────────────────────────────────────
   API & DEMO STORAGE CONFIG
   - When backend (localhost:8080) is running, calls real REST API.
   - When hosted on GitHub Pages or offline, seamlessly runs full
     interactive demo storage so the website works 100% online!
───────────────────────────────────────────────────────────── */
const API = 'http://localhost:8080/api'

// Initial seed data for offline / GitHub Pages demo mode
const INITIAL_DEMO_DATA = {
  users: [
    { userId: 1, name: 'Rapaka Rithwik', username: '2520030427', password: 'rithu', displayName: 'Rithwik' },
    { userId: 2, name: 'Wallet Admin', username: 'admin', password: 'admin123', displayName: 'Admin' },
    { userId: 3, name: 'Alice Sharma', username: 'alice', password: 'password123', displayName: 'Alice' },
    { userId: 4, name: 'Bob Mehta', username: 'bob', password: 'password123', displayName: 'Bob' },
    { userId: 5, name: 'Carol Singh', username: 'carol', password: 'password123', displayName: 'Carol' },
  ],
  groups: [
    { groupId: 1, groupName: 'Trip to Goa', monthlyBudget: 25000, createdBy: 3, createdAt: '2026-09-19' },
    { groupId: 2, groupName: 'Flat Mates', monthlyBudget: 15000, createdBy: 4, createdAt: '2026-09-19' },
    { groupId: 3, groupName: 'Weekend Treks', monthlyBudget: 8000, createdBy: 3, createdAt: '2026-09-19' },
  ],
  expenses: [
    { expenseId: 1, groupId: 1, paidBy: 3, description: 'Seaside Villa Stay', amount: 8400, category: 'Travel', expenseDate: '2026-09-18', splitType: 'equal' },
    { expenseId: 2, groupId: 1, paidBy: 4, description: 'Beachside Dinner & Seafood', amount: 3250, category: 'Food', expenseDate: '2026-09-18', splitType: 'equal' },
    { expenseId: 3, groupId: 1, paidBy: 5, description: 'Scuba Diving Passes', amount: 4500, category: 'Entertainment', expenseDate: '2026-09-19', splitType: 'equal' },
    { expenseId: 4, groupId: 2, paidBy: 4, description: 'Monthly High-Speed WiFi', amount: 1199, category: 'Other', expenseDate: '2026-09-15', splitType: 'equal' },
    { expenseId: 5, groupId: 2, paidBy: 3, description: 'Supermarket Groceries', amount: 3820, category: 'Food', expenseDate: '2026-09-17', splitType: 'equal' },
  ],
}

function getDemoStore() {
  try {
    const raw = localStorage.getItem('cw_demo_store')
    if (raw) return JSON.parse(raw)
  } catch {}
  localStorage.setItem('cw_demo_store', JSON.stringify(INITIAL_DEMO_DATA))
  return INITIAL_DEMO_DATA
}

function saveDemoStore(store) {
  localStorage.setItem('cw_demo_store', JSON.stringify(store))
}

let isBackendAvailable = null // null: untested, true: live, false: demo mode

async function api(path, options = {}) {
  // Check if we are running on GitHub Pages (github.io) -> use interactive demo mode directly
  const isGitHubPages = window.location.hostname.includes('github.io')

  if (!isGitHubPages && isBackendAvailable !== false) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2500)
      const res = await fetch(`${API}${path}`, {
        headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
        signal: controller.signal,
        ...options,
      })
      clearTimeout(timeoutId)

      const text = await res.text()
      let data = null
      if (text) {
        try { data = JSON.parse(text) } catch { data = { message: text } }
      }

      if (!res.ok) {
        const detail = data?.message || data?.error || `HTTP ${res.status} error.`
        throw new Error(detail)
      }
      isBackendAvailable = true
      return data
    } catch (err) {
      if (err.name === 'AbortError' || err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        isBackendAvailable = false
      } else {
        throw err
      }
    }
  }

  // ── In-Browser Interactive Demo Storage (GitHub Pages / Offline mode) ──
  const store = getDemoStore()

  // 1. Auth login
  if (path === '/auth/login' && options.method === 'POST') {
    const { username, password } = JSON.parse(options.body)
    const user = store.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password)
    if (!user) throw new Error('Invalid username or password.')
    return { success: true, userId: user.userId, username: user.username, displayName: user.displayName }
  }

  // 2. Groups
  if (path === '/groups' && (!options.method || options.method === 'GET')) {
    return store.groups
  }
  if (path === '/groups' && options.method === 'POST') {
    const body = JSON.parse(options.body)
    const newGroup = {
      groupId: Date.now(),
      groupName: body.groupName,
      monthlyBudget: Number(body.monthlyBudget) || 10000,
      createdBy: body.createdBy,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    store.groups.push(newGroup)
    saveDemoStore(store)
    return newGroup
  }
  if (path.startsWith('/groups/') && options.method === 'DELETE') {
    const id = Number(path.replace('/groups/', ''))
    store.groups = store.groups.filter(g => g.groupId !== id)
    store.expenses = store.expenses.filter(e => e.groupId !== id)
    saveDemoStore(store)
    return { success: true }
  }

  // 3. Expenses
  if (path.startsWith('/expenses/group/')) {
    const gid = Number(path.replace('/expenses/group/', ''))
    return store.expenses
      .filter(e => e.groupId === gid)
      .sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate))
  }
  if (path === '/expenses' && options.method === 'POST') {
    const body = JSON.parse(options.body)
    const newExp = {
      expenseId: Date.now(),
      groupId: Number(body.groupId),
      paidBy: Number(body.paidBy),
      description: body.description,
      amount: Number(body.amount),
      category: body.category || 'Food',
      expenseDate: body.expenseDate,
      splitType: body.splitType || 'equal',
    }
    store.expenses.push(newExp)
    saveDemoStore(store)
    return newExp
  }
  if (path.startsWith('/expenses/') && options.method === 'DELETE') {
    const id = Number(path.replace('/expenses/', ''))
    store.expenses = store.expenses.filter(e => e.expenseId !== id)
    saveDemoStore(store)
    return { success: true }
  }

  return []
}

/* ─────────────────────────────────────────────────────────────
   UTILS
───────────────────────────────────────────────────────────── */
function readStoredUser() {
  try {
    const raw = localStorage.getItem('cw_user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function categoryIcon(cat) {
  const icons = {
    Food: '🍔', Travel: '✈️', Shopping: '🛍️',
    Education: '📚', Entertainment: '🎬', Other: '💡',
  }
  return icons[cat] ?? '💡'
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })
}

/* ─────────────────────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────────────────────── */
export default function App() {
  const [user, setUser] = useState(readStoredUser)

  function handleLogin(account) {
    localStorage.setItem('cw_user', JSON.stringify(account))
    setUser(account)
  }

  function handleLogout() {
    localStorage.removeItem('cw_user')
    setUser(null)
  }

  return user
    ? <Dashboard user={user} onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════════════ */
function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      })
      onLogin({
        userId: data.userId,
        username: data.username,
        displayName: data.displayName || data.username,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* ── Left art panel ── */}
      <div className="login-art">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="login-copy">
          <div className="logo">💰</div>
          <p className="eyebrow">COMMON WALLET</p>
          <h1>
            Money should feel <span>shared.</span>
          </h1>
          <p>
            One place for group spending, split bills, budgets and the
            story behind every rupee your group moves.
          </p>
        </div>
        <div className="mini-float">
          <span>Group Health</span>
          <b>92%</b>
          <small>✅ on track this month</small>
        </div>
      </div>

      {/* ── Right login card ── */}
      <div className="login-card-wrap">
        <div className="login-card">
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Sign in</h2>
          <p className="muted">Enter your credentials to continue</p>

          {error && <div className="error">{error}</div>}

          <form onSubmit={submit}>
            <label>
              Username
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="alice"
                autoFocus
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>
            <button className="primary-btn full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <p className="demo-note">
            Demo accounts: <b>alice</b> / <b>bob</b> / <b>carol</b>
            <br />Password: <b>password123</b>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════ */
function Dashboard({ user, onLogout }) {
  const [groups,        setGroups]        = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [expenses,      setExpenses]      = useState([])
  const [error,         setError]         = useState('')
  const [showExpense,   setShowExpense]   = useState(false)
  const [showGroup,     setShowGroup]     = useState(false)
  const [toast,         setToast]         = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadGroups = useCallback(async (selectId) => {
    const data = await api('/groups')
    setGroups(data)
    const id = selectId ?? (data[0]?.groupId ?? null)
    setSelectedGroup(id)
  }, [])

  useEffect(() => { loadGroups().catch(e => setError(e.message)) }, [loadGroups])

  const loadExpenses = useCallback(async () => {
    if (!selectedGroup) { setExpenses([]); return }
    const data = await api(`/expenses/group/${selectedGroup}`)
    setExpenses(data)
  }, [selectedGroup])

  useEffect(() => { loadExpenses().catch(e => setError(e.message)) }, [loadExpenses])

  const group = useMemo(
    () => groups.find(g => g.groupId === selectedGroup) ?? null,
    [groups, selectedGroup]
  )

  const budget    = group?.monthlyBudget ?? 0
  const total     = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount), 0), [expenses])
  const remaining = Math.max(0, budget - total)
  const progress  = budget > 0 ? Math.min(100, (total / budget) * 100) : 0
  const health    = budget > 0 ? Math.max(0, Math.round(100 - progress)) : 100

  async function deleteExpense(id) {
    try {
      await api(`/expenses/${id}`, { method: 'DELETE' })
      setExpenses(prev => prev.filter(e => e.expenseId !== id))
      showToast('Expense removed')
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteGroup() {
    if (!group) return
    if (!window.confirm(`Delete "${group.groupName}"? All its expenses will also be removed.`)) return
    try {
      await api(`/groups/${group.groupId}`, { method: 'DELETE' })
      showToast('Group deleted')
      await loadGroups()
    } catch (err) {
      setError(err.message)
    }
  }

  const catBreakdown = useMemo(() => {
    const m = {}
    expenses.forEach(e => { m[e.category || 'Other'] = (m[e.category || 'Other'] || 0) + Number(e.amount) })
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 3)
  }, [expenses])

  const memberBreakdown = useMemo(() => {
    const m = {}
    expenses.forEach(e => { m[e.paidBy] = (m[e.paidBy] || 0) + Number(e.amount) })
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 3)
  }, [expenses])

  return (
    <div>
      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">💰</div>
          Common Wallet
          <small>expense splitter</small>
        </div>
        <div className="top-actions">
          <button className="outline-btn" onClick={() => setShowGroup(true)}>+ New Group</button>
          <div className="user-chip">
            <div className="avatar">{initials(user.displayName)}</div>
            <span>{user.displayName}</span>
          </div>
          <button className="outline-btn" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <main className="container">
        {/* ── Page heading ── */}
        <div className="welcome-row">
          <h1>
            Hey, <span>{user.displayName}! 👋</span>
          </h1>
          <div className="actions">
            <button className="outline-btn" onClick={() => setShowGroup(true)}>
              ＋ Create group
            </button>
            <button
              className="primary-btn"
              onClick={() => setShowExpense(true)}
              disabled={!selectedGroup}
            >
              ＋ Add expense
            </button>
          </div>
        </div>

        {/* ── Global error ── */}
        {error && (
          <div className="error" style={{ marginBottom: 20 }}>
            {error}{' '}
            <button
              style={{ marginLeft: 12, fontWeight: 700, background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}
              onClick={() => setError('')}
            >✕</button>
          </div>
        )}

        {/* ── Group tabs ── */}
        {groups.length > 0 ? (
          <div className="group-bar">
            {groups.map(g => (
              <button
                key={g.groupId}
                className={`group-pill${selectedGroup === g.groupId ? ' active' : ''}`}
                onClick={() => setSelectedGroup(g.groupId)}
              >
                {g.groupName}
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No groups yet</h2>
            <p>Create your first group to start splitting expenses with friends.</p>
            <button className="primary-btn" onClick={() => setShowGroup(true)}>
              Create my first group
            </button>
          </div>
        )}

        {/* ── Wallet hero ── */}
        <div className="wallet-hero">
          <div>
            <p className="label">Total Spent</p>
            <p className="wallet-amount">{fmt(total)}</p>
            <p>{group ? `in ${group.groupName}` : 'Select a group'}</p>
          </div>

          <div
            className="budget-ring"
            style={{ '--p': `${progress}%` }}
          >
            <div>
              <b>{Math.round(progress)}%</b>
              <span>used</span>
            </div>
          </div>

          <div className="wallet-stats">
            <div>
              <span>Monthly Budget</span>
              <b>{fmt(budget)}</b>
            </div>
            <div>
              <span>Remaining</span>
              <b>{fmt(remaining)}</b>
            </div>
            <div>
              <span>Transactions</span>
              <b>{expenses.length}</b>
            </div>
            <div>
              <span>Avg Expense</span>
              <b>{expenses.length ? fmt(total / expenses.length) : '₹0'}</b>
            </div>
          </div>
        </div>

        {/* ── Feature cards ── */}
        <section className="feature-grid">
          {/* Health */}
          <div className="feature-card">
            <div className="feature-head">
              <div className="feature-icon">📊</div>
              <div>
                <span>BUDGET HEALTH</span>
                <h3>Wallet Score</h3>
              </div>
            </div>
            <div className="health-score">
              <strong>{health}</strong>
              <div>
                <b style={{ color: health > 60 ? '#13b891' : '#e05555' }}>
                  {health > 75 ? 'Excellent' : health > 50 ? 'On Track' : 'Overspending'}
                </b>
                <p>Budget utilisation {Math.round(progress)}%</p>
              </div>
            </div>
            <div className="bar">
              <i style={{ width: `${health}%` }} />
            </div>
          </div>

          {/* Members */}
          <div className="feature-card">
            <div className="feature-head">
              <div className="feature-icon">👥</div>
              <div>
                <span>TOP SPENDERS</span>
                <h3>Who Paid</h3>
              </div>
            </div>
            {memberBreakdown.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 12 }}>No expenses yet</p>
            ) : (
              memberBreakdown.map(([uid, amt], i) => (
                <div className="map-row" key={uid}>
                  <div className={`person p${(i % 3) + 1}`}>U{uid}</div>
                  <div>
                    <b>User #{uid}</b>
                    <small>{((amt / total) * 100).toFixed(0)}% of total</small>
                  </div>
                  <strong>{fmt(amt)}</strong>
                </div>
              ))
            )}
          </div>

          {/* Categories */}
          <div className="feature-card">
            <div className="feature-head">
              <div className="feature-icon">🏷️</div>
              <div>
                <span>CATEGORIES</span>
                <h3>Spending Rules</h3>
              </div>
            </div>
            <div className="rule"><span>Monthly budget</span><b>{fmt(budget)}</b></div>
            <div className="rule"><span>Split method</span><b>Equal</b></div>
            {catBreakdown.map(([cat, amt]) => (
              <div className="rule" key={cat}>
                <span>{categoryIcon(cat)} {cat}</span>
                <b>{fmt(amt)}</b>
              </div>
            ))}
            {catBreakdown.length === 0 && (
              <div className="rule"><span>Categories</span><b>—</b></div>
            )}
          </div>
        </section>

        {/* ── Timeline + Budget panel ── */}
        <section className="content-grid">
          {/* Timeline */}
          <div className="panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">MONEY TIMELINE</p>
                <h2>Where the wallet moved</h2>
              </div>
              <button
                className="outline-btn"
                onClick={() => loadExpenses().catch(e => setError(e.message))}
              >
                ↺ Refresh
              </button>
            </div>
            <div className="timeline">
              {expenses.length === 0 ? (
                <div className="empty">
                  {selectedGroup
                    ? 'No expenses in this group yet — add one!'
                    : 'Pick or create a group to see spending.'}
                </div>
              ) : (
                expenses.map(e => (
                  <div className="timeline-item" key={e.expenseId}>
                    <div className="dot">{categoryIcon(e.category)}</div>
                    <div className="line-content">
                      <b>{e.description}</b>
                      <span>
                        {e.category || 'Other'} · {e.expenseDate} · paid by user #{e.paidBy}
                      </span>
                    </div>
                    <strong>{fmt(e.amount)}</strong>
                    <button
                      className="delete-btn"
                      onClick={() => deleteExpense(e.expenseId)}
                      title="Delete expense"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Budget panel */}
          <div className="panel budget-panel">
            <p className="eyebrow">VIEW BUDGET</p>
            <h2>{fmt(budget)}</h2>
            <p className="muted">Monthly group budget</p>
            <div className="budget-track">
              <i style={{ width: `${progress}%` }} />
            </div>
            <div className="budget-numbers">
              <span>{fmt(total)} spent</span>
              <b>{fmt(remaining)} left</b>
            </div>
            <button
              className="primary-btn full"
              onClick={() => setShowExpense(true)}
              disabled={!selectedGroup}
            >
              ＋ Add to timeline
            </button>
            {group && (
              <button className="danger-text" onClick={deleteGroup}>
                Delete this group
              </button>
            )}
          </div>
        </section>
      </main>

      {/* ── Modals ── */}
      {showExpense && selectedGroup && (
        <ExpenseModal
          groupId={selectedGroup}
          userId={user.userId}
          onClose={() => setShowExpense(false)}
          onSaved={async () => {
            setError('')
            showToast('Expense added! 🎉')
            await loadExpenses()
          }}
        />
      )}

      {showGroup && (
        <GroupModal
          userId={user.userId}
          onClose={() => setShowGroup(false)}
          onCreated={async id => {
            setError('')
            showToast('Group created! 🚀')
            await loadGroups(id)
            setShowGroup(false)
          }}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EXPENSE MODAL
═══════════════════════════════════════════════════════════════ */
function ExpenseModal({ groupId, userId, onClose, onSaved }) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Food',
    expenseDate: new Date().toISOString().slice(0, 10),
    splitType: 'equal',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const change = e => setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          description: form.description.trim(),
          amount: Number(form.amount),
          category: form.category,
          expenseDate: form.expenseDate,
          splitType: form.splitType,
          groupId,
          paidBy: userId,
        }),
      })
      await onSaved()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Add expense" eyebrow="MONEY IN MOTION" onClose={onClose}>
      <form onSubmit={submit}>
        {error && <div className="error">{error}</div>}
        <label>
          Description
          <input
            name="description"
            value={form.description}
            onChange={change}
            placeholder="Dinner, cab, groceries…"
            autoFocus
            required
          />
        </label>
        <label>
          Amount (₹)
          <div className="amount-input">
            <span>₹</span>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={change}
              placeholder="0.00"
              required
            />
          </div>
        </label>
        <div className="two-col">
          <label>
            Category
            <select name="category" value={form.category} onChange={change}>
              {['Food', 'Travel', 'Shopping', 'Education', 'Entertainment', 'Other'].map(x => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              type="date"
              name="expenseDate"
              value={form.expenseDate}
              onChange={change}
              required
            />
          </label>
        </div>
        <label>
          Split method
          <select name="splitType" value={form.splitType} onChange={change}>
            <option value="equal">Equal split</option>
          </select>
        </label>
        <div className="modal-actions">
          <button type="button" className="outline-btn" onClick={onClose}>Cancel</button>
          <button className="primary-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save expense'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ═══════════════════════════════════════════════════════════════
   GROUP MODAL
═══════════════════════════════════════════════════════════════ */
function GroupModal({ userId, onClose, onCreated }) {
  const [name,   setName]   = useState('')
  const [budget, setBudget] = useState('10000')
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const g = await api('/groups', {
        method: 'POST',
        body: JSON.stringify({
          groupName: name.trim(),
          monthlyBudget: Number(budget),
          createdBy: userId,
        }),
      })
      await onCreated(g.groupId)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Create a group" eyebrow="NEW SHARED SPACE" onClose={onClose}>
      <form onSubmit={submit}>
        {error && <div className="error">{error}</div>}
        <label>
          Group name
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Friends, trip, college…"
            autoFocus
            required
          />
        </label>
        <label>
          Monthly budget (₹)
          <input
            type="number"
            min="0"
            step="100"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            required
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="outline-btn" onClick={onClose}>Cancel</button>
          <button className="primary-btn" disabled={saving}>
            {saving ? 'Creating…' : 'Create group'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MODAL SHELL
═══════════════════════════════════════════════════════════════ */
function Modal({ title, eyebrow, onClose, children }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button className="close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
