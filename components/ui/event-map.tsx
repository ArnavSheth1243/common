"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapEvent {
  id: string
  title: string
  date: string
  time: string | null
  location: string | null
  lat: number
  lng: number
  category: string | null
}

interface EventMapProps {
  events: MapEvent[]
  onEventClick?: (id: string) => void
}

export function EventMap({ events, onEventClick }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => {
          // Default to San Francisco
          setUserLocation([37.7749, -122.4194])
        },
      )
    } else {
      setUserLocation([37.7749, -122.4194])
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !userLocation) return

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapRef.current).setView(userLocation, 12)
    mapInstanceRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map)

    // Custom pin icon
    const pinIcon = L.divIcon({
      html: `<div style="width:32px;height:32px;background:#1d4ed8;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
        <span style="transform:rotate(45deg);color:white;font-size:12px;font-weight:bold;line-height:1;">E</span>
      </div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })

    // Add event markers
    events.forEach((event) => {
      const formatTime = (t: string | null) => {
        if (!t) return ""
        const [h, m] = t.split(":")
        const hour = parseInt(h, 10)
        const ampm = hour >= 12 ? "PM" : "AM"
        const hour12 = hour % 12 || 12
        return ` at ${hour12}:${m} ${ampm}`
      }

      const dateStr = new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })

      const marker = L.marker([event.lat, event.lng], { icon: pinIcon }).addTo(map)
      marker.bindPopup(
        `<div style="min-width:180px;font-family:system-ui,-apple-system,sans-serif;">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:#18181b;">${event.title}</div>
          <div style="font-size:11px;color:#71717a;margin-bottom:2px;">${dateStr}${formatTime(event.time)}</div>
          ${event.location ? `<div style="font-size:11px;color:#71717a;">${event.location}</div>` : ""}
        </div>`,
      )

      if (onEventClick) {
        marker.on("click", () => onEventClick(event.id))
      }
    })

    // User location marker
    L.circleMarker(userLocation, {
      radius: 8,
      fillColor: "#3b82f6",
      color: "#ffffff",
      weight: 3,
      fillOpacity: 1,
    }).addTo(map).bindPopup("You are here")

    // Fit bounds if events exist
    if (events.length > 0) {
      const allPoints: [number, number][] = [
        userLocation,
        ...events.map((e) => [e.lat, e.lng] as [number, number]),
      ]
      const bounds = L.latLngBounds(allPoints)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [userLocation, events, onEventClick])

  if (!userLocation) {
    return (
      <div className="w-full h-[300px] rounded-2xl bg-zinc-100 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-[300px] rounded-2xl overflow-hidden border border-border shadow-sm"
      style={{ zIndex: 0 }}
    />
  )
}
