import React, { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { login } from '../services/api'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const nav = useNavigate()
    const loc = useLocation()

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            await login(username, password)
            nav(loc.state?.from?.pathname || '/dashboard')
        } catch (e) {
            Swal.fire('Gagal Login', 'Username atau password salah.', 'error')
        }
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <div className="card w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Masuk ke GeoTweet</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Username</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="johndoe"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button className="btn w-full text-base py-3" type="submit">Login</button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Belum punya akun?{' '}
                    <Link className="text-blue-700 hover:underline" to="/register">Register</Link>
                </p>
            </div>
        </div>
    )
}
