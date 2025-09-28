import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { getPostGeoJSON, getPostById } from '../services/api'


// Fix default icon
if (L.Icon?.Default?.prototype?._getIconUrl) {
    delete L.Icon.Default.prototype._getIconUrl
}
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})


function FlyTo({ lat, lng }) {
    const map = useMap()
    useEffect(() => { if (lat && lng) { map.setView([lat, lng], 16, { animate: true }) } }, [lat, lng])
    return null
}

export default function MapPage() {
    const [features, setFeatures] = useState([])
    const [focus, setFocus] = useState(null)
    const popupRefs = useRef({})


    const load = async () => {
        const { data } = await getPostGeoJSON()
        setFeatures(data.features)
    }
    useEffect(() => { load() }, [])


    // Focus via query param ?focus=ID
    useEffect(() => {
        const url = new URL(location.href)
        const id = url.searchParams.get('focus')
        if (id) { setFocus(Number(id)) }
    }, [])


    const focusedFeature = useMemo(() => features.find(f => f.properties.id === focus), [features, focus])
    const lat = focusedFeature?.geometry?.coordinates?.[1]
    const lng = focusedFeature?.geometry?.coordinates?.[0]


    useEffect(() => {
        if (focus && focusedFeature) {
            // open popup after small delay
            setTimeout(() => {
                const ref = popupRefs.current[focus]
                if (ref) { ref.openOn(ref._map) }
            }, 300)
        }
    }, [focus, focusedFeature])


    return (
        <div className="card">
            <div className="card p-0 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Peta Laporan</h3>
                    <span className="text-sm text-gray-500">Klik marker untuk detail</span>
                </div>

                <div className="h-[70vh]">
                    <MapContainer center={[-2, 118]} zoom={5} className="h-full w-full">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                        {lat && lng && <FlyTo lat={lat} lng={lng} zoom={16} />}
                        {features.map(f => (
                            <Marker key={f.properties.id} position={[f.geometry.coordinates[1], f.geometry.coordinates[0]]}>
                                <Popup whenCreated={(p) => { popupRefs.current[f.properties.id] = p }}>
                                    <div className="flex items-start gap-3">
                                        <img className="h-10 w-10 rounded-full" src={f.properties.avatar} />
                                        <div>
                                            <strong className="text-gray-800">{f.properties.user}</strong>
                                            <div className="whitespace-pre-wrap text-gray-800">{f.properties.text}</div>
                                            <small className="text-gray-500">{new Date(f.properties.created_at).toLocaleString()}</small>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>

        </div>
    )
}