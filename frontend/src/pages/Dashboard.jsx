import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { createPost, listPosts, listPostsByUrl } from '../services/api'
import PostItem from '../components/PostItem'


export default function Dashboard() {
    const [text, setText] = useState('')
    const [posts, setPosts] = useState([])
    const [page, setPage] = useState(1)
    const [count, setCount] = useState(0)
    const [nextUrl, setNextUrl] = useState(null)
    const [prevUrl, setPrevUrl] = useState(null)
    const pageSize = 5

    const load = async () => {
        const { data } = await listPosts(page)
        setPosts(data.results || [])
        setCount(data.count || 0)
        setNextUrl(data.next || null)
        setPrevUrl(data.previous || null)
    }

    useEffect(() => { load() }, [page])


    const onSubmit = async () => {
        if (text.length > 140) {
            Swal.fire('Kebanyakan', 'Maksimal 140 karakter.', 'warning');
            return;
        }

        try {
            Swal.fire({
                title: 'Mengirim...',
                text: 'Sedang memproses posting Anda',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            await createPost(text);

            const { data } = await listPosts(1);
            setPosts(data.results || []);
            setCount(data.count || 0);
            setNextUrl(data.next || null);
            setPrevUrl(data.previous || null);
            setPage(1);
            setText('');

            Swal.fire('Sukses', 'Posting berhasil ditambahkan.', 'success');
        } catch (e) {
            const msg = e?.response?.data?.detail || 'Teks harus memuat lokasi (mis. Jakarta, Raja Ampat).';
            Swal.fire('Gagal Post', msg, 'error');
        }
    };



    return (
        <div className="grid space-y-8">
            <div className="card">
                <div className="flex items-start gap-3">
                    <img className="h-10 w-10 rounded-full" src={`https://ui-avatars.com/api/?name=me`} alt="me" />
                    <div className="flex-1">
                        <textarea
                            className="textarea"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder='Tulis 140 karakter, sertakan lokasi (contoh: "Jakarta", "Raja Ampat").'>
                        </textarea>
                        <div className="mt-2 flex items-center justify-between">
                            <small className={text.length > 140 ? 'text-red-600' : 'text-gray-500'}>
                                {text.length}/140
                            </small>
                            <button className="btn" onClick={onSubmit}>Post</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Postingan Terbaru</h3>
                </div>

                <div className="divide-y">
                    {posts.map(p => <PostItem key={p.id} post={p} />)}
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <button
                        className="btn outline"
                        disabled={!prevUrl}
                        onClick={async () => {
                            if (!prevUrl) return;
                            const { data } = await listPostsByUrl(prevUrl);
                            setPosts(data.results || []);
                            setCount(data.count || 0);
                            setNextUrl(data.next || null);
                            setPrevUrl(data.previous || null);
                            setPage(p => Math.max(1, p - 1));
                        }}>
                        ◀︎ Prev
                    </button>

                    <span className="text-sm text-gray-500">
                        Page {page} / {Math.max(1, Math.ceil((count || 0) / pageSize))}
                    </span>

                    <button
                        className="btn outline"
                        disabled={!nextUrl}
                        onClick={async () => {
                            if (!nextUrl) return;
                            const { data } = await listPostsByUrl(nextUrl);
                            setPosts(data.results || []);
                            setCount(data.count || 0);
                            setNextUrl(data.next || null);
                            setPrevUrl(data.previous || null);
                            setPage(p => p + 1);
                        }}>
                        Next ▶︎
                    </button>
                </div>
            </div>


        </div>
    )
}