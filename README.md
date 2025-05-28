# Castro 311 Dashboard

A web dashboard displaying San Francisco Public Works (311) service requests in the Castro neighborhood, built with React, Vite, and React Leaflet, and served via GitHub Pages.

## 🚀 Live Demo

[https://danielmyers-xyz.github.io/castro-311-dashboard/](https://danielmyers-xyz.github.io/castro-311-dashboard/)

## 🔍 Features

- Interactive map with service request points in Castro  
- Data loaded on-the-fly from GeoServer WFS endpoint  
- Responsive design for desktop and mobile  

## 🛠️ Technologies

- **Vite** — Build tool and dev server  
- **React** — UI library  
- **React Leaflet** — Map rendering  
- **GeoServer** — Hosting WFS layer  
- **GitHub Pages** — Static site hosting  

## ⚙️ Project Structure

```
castro-311-dashboard/
├── docs/                # Built assets for GitHub Pages
│   ├── assets/          # CSS, JS, images
│   └── index.html       # Landing page
├── src/                 # Source code
│   ├── App.jsx          # Main App component
│   ├── main.jsx         # Entry point
│   └── …                # Other components & styles
├── vite.config.js       # Vite config (base, outDir, proxy)
├── package.json         # Dependencies & scripts
└── README.md            # This file
```

## 💾 Installation & Development

```bash
# Clone the repo
git clone https://github.com/danielmyers-xyz/castro-311-dashboard.git
cd castro-311-dashboard

# Install dependencies
npm install

# Run dev server
npm run dev
```

_App opens at http://localhost:5173 by default._

## 📦 Build & Deploy

### Build

```bash
npm run build
```

This outputs your static site into `docs/` (per `vite.config.js`).

### Deploy on GitHub Pages

1. Commit & push the `docs/` folder to your main branch.  
2. In GitHub repo **Settings > Pages**, set the source to `main` branch `/docs` folder.

## 🔧 Configuration

- **Base Path** — `./` in `vite.config.js` ensures correct relative URLs on GH Pages.  
- **Proxy** — During dev, routes `/geoserver` → `https://geoserver.danielmyers.xyz`:

```js
export default defineConfig({
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/geoserver': {
        target: 'https://geoserver.danielmyers.xyz',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/geoserver/, '/geoserver')
      }
    }
  }
});
```

## 🗺️ WFS Endpoint

Layer `castro_311` from:

[https://geoserver.danielmyers.xyz/geoserver/census/castro_311/ows?service=WFS&request=GetFeature&version=2.0.0&outputFormat=application/json](https://geoserver.danielmyers.xyz/geoserver/census/castro_311/ows?service=WFS&request=GetFeature&version=2.0.0&outputFormat=application/json)

This layer is generated and published by the [ETL pipeline here](https://github.com/danielmyers-xyz/castro-dashboard-etl).

## 📈 Usage

- Pan and zoom the map to explore service requests  
- Click markers for details  

## 📝 License

Distributed under the MIT License. See LICENSE for details.

---

Created with 💙 using Vite & React Leaflet

## 🧪 To Do

- ✨ **Styling & Theming**: Integrate a CSS framework (e.g., Tailwind, Material UI) or custom styles to enhance typography, color palette, and overall visual polish  
- 🎨 **Map Design**: Customize map markers, popups, and controls to reflect brand identity (icons, colors, hover effects)  
- 📱 **Responsive Layout**: Add media queries or responsive utilities to ensure the dashboard looks great on mobile and tablet  
- 🌙 **Dark Mode**: Implement theme toggling (light/dark) for user preference and accessibility  
- 🧩 **UI Components**: Refine buttons, inputs, and other controls with consistent padding, rounded corners, and interactive states (hover, active)  
- 🛠️ **Accessibility Improvements**: Ensure keyboard navigation, focus states, and ARIA labels for map features and form elements  
