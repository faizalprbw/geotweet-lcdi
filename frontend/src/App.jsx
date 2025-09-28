import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MapPage from './pages/MapPage'
import ApiDocs from './pages/ApiDocs.jsx'


const useAuthed = () => {
    const [authed, setAuthed] = useState(!!localStorage.getItem('access'))
    useEffect(() => {
        const handler = () => setAuthed(!!localStorage.getItem('access'))
        window.addEventListener('auth-change', handler)
        window.addEventListener('storage', handler)
        return () => {
            window.removeEventListener('auth-change', handler)
            window.removeEventListener('storage', handler)
        }
    }, [])
    return authed
}

const isAuthed = () => !!localStorage.getItem('access')


const Private = ({ children }) => {
    const loc = useLocation()
    return isAuthed() ? children : <Navigate to="/login" state={{ from: loc }} replace />
}


export default function App() {
    return (
        <>
            <nav className="flex items-center gap-3">
                <Link className="px-3 py-2 rounded-lg hover:bg-gray-100" to="/dashboard">Dashboard</Link>
                <Link className="px-3 py-2 rounded-lg hover:bg-gray-100" to="/map">Peta</Link>
                <Link className="px-3 py-2 rounded-lg hover:bg-gray-100" to="/api">Daftar API</Link>

                {useAuthed() ? (
                    <button
                        className="btn ml-2"
                        onClick={() => {
                            localStorage.clear();
                            window.dispatchEvent(new Event('auth-change'));
                            location.href = '/login';
                        }}>
                        Logout
                    </button>
                ) : (
                    <Link className="btn outline ml-2" to="/login">Login</Link>
                )}
            </nav>
            <div className="container">
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
                    <Route path="/map" element={<Private><MapPage /></Private>} />
                    <Route path="/api" element={<ApiDocs />} />
                </Routes>
            </div>
        </>
    )
}