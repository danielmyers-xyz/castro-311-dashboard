import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import proj4 from 'proj4';

// Coordinate systems
const fromCRS = 'EPSG:3857';
const toCRS = 'EPSG:4326';

// Transform [x, y] (WebMercator) to [lat, lon]
function transformCoords(x, y) {
  const [lon, lat] = proj4(fromCRS, toCRS, [x, y]);
  return [lat, lon];
}

// Fit map to GeoJSON bounds
function FitBounds({ data }) {
  const map = useMap();
  React.useEffect(() => {
    if (data && data.features.length) {
      const latlngs = data.features.map(f => transformCoords(...f.geometry.coordinates));
      map.fitBounds(latlngs);
    }
  }, [data, map]);
  return null;
}

export default function App() {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 });
  const [topTypes, setTopTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);

  // Filter only open cases for the map (and by request type, if selected)
  const openFeatures = data
    ? data.features.filter(f => {
        const isOpen = f.properties.status === 'Open';
        return isOpen && (!selectedType || f.properties.request_type === selectedType);
      })
    : [];
  const openData = data
    ? { ...data, features: openFeatures, numberReturned: openFeatures.length }
    : null;

  useEffect(() => {
    const pageSize = 1000;
    let startIndex = 0;
    let allFeatures = [];

    async function loadAllFeatures() {
      let lastResponse;
      while (true) {
        const url =
          'https://geoserver.danielmyers.xyz/geoserver/census/ows?service=WFS&version=2.0.0' +
          '&request=GetFeature&typeNames=census:castro_311' +
          '&outputFormat=application/json' +
          `&count=${pageSize}` +
          `&startIndex=${startIndex}`;
        const res = await fetch(url);
        const json = await res.json();
        lastResponse = json;
        allFeatures = allFeatures.concat(json.features);
        if (json.features.length < pageSize) break;
        startIndex += pageSize;
      }

      // Build a single FeatureCollection from all pages
      const combined = {
        ...lastResponse,
        features: allFeatures,
        numberReturned: allFeatures.length,
      };
      setData(combined);

      // Compute stats
      const total = combined.features.length;
      const open = combined.features.filter(f => f.properties.status === 'Open').length;
      const closed = combined.features.filter(f => f.properties.status === 'Closed').length;
      setStats({ total, open, closed });

      // Compute top request types only for open cases
      const typeCounts = combined.features
        .filter(f => f.properties.status === 'Open')
        .reduce((acc, f) => {
          const t = f.properties.request_type;
          acc[t] = (acc[t] || 0) + 1;
          return acc;
        }, {});
      const sortedTypes = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => ({ type, count }));
      setTopTypes(sortedTypes);
    }

    loadAllFeatures().catch(console.error);
  }, []);

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>311 Dashboard</h2>
        <p style={{ fontSize: '12px', color: '#666', marginTop: 0 }}>Data updates daily.</p>
        <p><strong>Total Cases:</strong> {stats.total}</p>
        <p><strong>Open Cases:</strong> {stats.open}</p>
        <p><strong>Closed Cases:</strong> {stats.closed}</p>
        <h3>Top Open Requests</h3>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '4px', marginBottom: '8px' }}>
          Select a request type to filter the map, and click on a point for details.
        </p>
        <button
          onClick={() => setSelectedType(null)}
          disabled={!selectedType}
          style={{ marginBottom: '8px' }}
        >
          Reset Filter
        </button>
        <ul>
          {topTypes.map(({ type, count }) => (
            <li
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                cursor: 'pointer',
                fontWeight: selectedType === type ? 'bold' : 'normal'
              }}
            >
              {type} ({count})
            </li>
          ))}
        </ul>
      </aside>
      <div className="map-container">
      <MapContainer
        center={[37.75, -122.45]}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {data && (
          <>
            <GeoJSON
              key={selectedType || 'all'}
              data={openData}
              pointToLayer={(feature, latlng) => {
                const [lat, lon] = transformCoords(...feature.geometry.coordinates);
                return L.circleMarker([lat, lon], { radius: 5, fillOpacity: 0.7 });
              }}
              onEachFeature={(feature, layer) => {
                const p = feature.properties;
                const popupContent =
                  '<div>' +
                  '<strong>Case ID:</strong> ' + p.case_id + '<br/>' +
                  '<strong>Status:</strong> ' + p.status + '<br/>' +
                  '<strong>Opened:</strong> ' + p.opened_ts + '<br/>' +
                  '<strong>Closed:</strong> ' + (p.closed_ts || 'N/A') + '<br/>' +
                  '<strong>Type:</strong> ' + p.request_type + '<br/>' +
                  '<strong>Category:</strong> ' + p.category + '<br/>' +
                  '<strong>Agency:</strong> ' + p.agency + '<br/>' +
                  '<strong>Address:</strong> ' + p.address + '<br/>' +
                  '<em>' + p.status_notes + '</em>' +
                  '</div>';
                layer.bindPopup(popupContent);
              }}
            />
            <FitBounds data={openData} />
          </>
        )}
      </MapContainer>
      </div>
    </div>
  );
}
