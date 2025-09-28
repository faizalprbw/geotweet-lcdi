import React from 'react'
import { Link } from 'react-router-dom'

export default function PostItem({ post }) {
    const created = new Date(post.created_at)
    return (
        <div className="py-4 flex items-start gap-3">
            <img className="h-10 w-10 rounded-full ring-2 ring-blue-50"
                src={`https://ui-avatars.com/api/?name=${post.user.username}`} alt="avatar" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <strong className="text-gray-800 truncate">{post.user.username}</strong>
                    <span className="text-xs text-gray-400">• {created.toLocaleString()}</span>
                </div>
                <div className="mt-1 whitespace-pre-wrap text-gray-800">{post.text}</div>
            </div>
            <div className="ml-2">
                <Link className="btn outline" to={`/map?focus=${post.id}`}>📍 Lokasi</Link>
            </div>
        </div>
    )
}
