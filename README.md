# Quad Travels

Website for **Quad Travels** — taxi services, city tour packages, and optional hotel add-ons across India.

## Features

- Responsive single-page design
- Tour packages listed by city (Delhi, Jaipur, Agra, Shimla, Goa, Custom)
- Hotel stays as optional add-on (extra charges)
- WhatsApp enquiry flow
- Business details managed in `data/config.json`

## Project structure

```
quad-travels/
├── index.html
├── css/styles.css
├── js/main.js
├── data/
│   ├── config.json     # Business name, phone, email, WhatsApp
│   └── packages.json   # Tour packages
├── netlify.toml
└── README.md
```

## Local preview

```bash
python -m http.server 8080
```

Visit `http://localhost:8080`

> Package data loads via `fetch()`, so use a local server rather than opening the file directly.

## Update business details

Edit `data/config.json`:

```json
{
  "businessName": "Quad Travels",
  "tagline": "Ride to Explore, Travel to Remember",
  "phone": "+91 9817728917",
  "whatsapp": "919817728917",
  "email": "quadtourandtravels@gmail.com",
  "address": "Near Football Chowk, Ambala Cantt 133001"
}
```

## Update tour packages

Edit `data/packages.json` to add, remove, or change packages and prices.

| Field | Description |
|-------|-------------|
| `city` | City name (used for filtering) |
| `title` | Package name |
| `duration` | e.g. "2 Days / 1 Night" |
| `price` | Price in INR (use `0` for custom quote) |
| `vehicle` | Vehicle type |
| `highlights` | List of places/activities |
| `hotelAvailable` | Show hotel add-on badge |
| `popular` | Show "Popular" badge |
| `image` | Image URL |

## Deploy

**Live site:** https://theanubhavgoel.github.io/quad-travels/

Hosted on [GitHub Pages](https://pages.github.com) from the `master` branch. Push updates to GitHub and the site refreshes in a minute or two.

Alternatives: [Netlify](https://netlify.com) or [Cloudflare Pages](https://pages.cloudflare.com) — no build step required, publish the root folder.

## Contact

- **Phone:** +91 9817728917
- **Email:** quadtourandtravels@gmail.com
- **Address:** Near Football Chowk, Ambala Cantt 133001
