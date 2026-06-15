import { useCallback, useEffect, useState } from 'react'
import { Shield, Users, Activity, Plus, Loader2 } from 'lucide-react'
import { adminApi } from '@/services/authApi'
import type { User } from '@/types/auth'
import { ErrorState } from '@/components/ErrorState'
import { ActivityLogPanel } from '@/components/admin/ActivityLogPanel'

export function AdminPage() {
  const [tab, setTab] = useState<'users' | 'activity'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newTelegram, setNewTelegram] = useState('')
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (tab !== 'users') {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.listUsers()
      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    void load()
  }, [load])

  const handleCreate = async () => {
    if (!newUsername.trim() || newPassword.length < 6) {
      setFormError('Username and password (min 6 chars) required')
      return
    }
    setCreating(true)
    setFormError(null)
    try {
      await adminApi.createUser({
        username: newUsername.trim(),
        password: newPassword,
        telegram_number: newTelegram.trim() || undefined,
      })
      setNewUsername('')
      setNewPassword('')
      setNewTelegram('')
      await load()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  const toggleActive = async (user: User) => {
    if (user.role === 'admin') return
    await adminApi.updateUser(user.id, { is_active: !user.is_active })
    await load()
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2">
          <Shield className="h-6 w-6 text-brand-500" />
          Admin
        </h1>
        <p className="text-sm text-dark-400 mt-1">Manage users and review platform activity</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'users' ? 'bg-dark-800 text-dark-50' : 'text-dark-400 hover:bg-dark-800/50'
          }`}
        >
          <Users className="h-4 w-4" /> Users
        </button>
        <button
          type="button"
          onClick={() => setTab('activity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'activity' ? 'bg-dark-800 text-dark-50' : 'text-dark-400 hover:bg-dark-800/50'
          }`}
        >
          <Activity className="h-4 w-4" /> Activity log
        </button>
      </div>

      {error && !loading && tab === 'users' && <ErrorState message={error} onRetry={load} />}

      {loading && tab === 'users' && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      )}

      {!loading && !error && tab === 'users' && (
        <div className="space-y-6">
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create user
            </h2>
            <div className="flex flex-wrap gap-2 items-end">
              <label className="space-y-1">
                <span className="text-xs text-dark-400">Username</span>
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm w-36"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-dark-400">Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm w-36"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-dark-400">Telegram (optional)</span>
                <input
                  value={newTelegram}
                  onChange={(e) => setNewTelegram(e.target.value)}
                  placeholder="+1… or @handle"
                  className="bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm w-40"
                />
              </label>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
            {formError && <p className="text-xs text-negative mt-2">{formError}</p>}
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-dark-500 border-b border-dark-800">
                  <th className="px-4 py-3 font-medium">Username</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Telegram</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last login</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-dark-800/50 hover:bg-dark-900/40">
                    <td className="px-4 py-3 font-medium text-dark-100">{u.username}</td>
                    <td className="px-4 py-3 capitalize text-dark-400">{u.role}</td>
                    <td className="px-4 py-3 text-dark-400">{u.telegram_number || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={u.is_active ? 'text-positive' : 'text-negative'}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-dark-500">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => toggleActive(u)}
                          className="text-xs text-brand-400 hover:underline"
                        >
                          {u.is_active ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && tab === 'activity' && <ActivityLogPanel />}
    </div>
  )
}
