import express from 'express'
import cors from 'cors'
import { httpServerHandler } from 'cloudflare:node';
import { env } from 'cloudflare:workers';

// Create Express app
const app = express();

// Middleware: JSON body parsing
app.use(express.json())


const devDomain = env.DEV_DOMAIN
const stagingDomain = env.STAGING_DOMAIN
const prodDomain = env.PROD_DOMAIN



// Middleware: CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  // If your frontend runs on a different local port (e.g. 5174),
  // add it here like: 'http://localhost:5174'

  // ⚠️ DEV_DOMAIN and PROD_DOMAIN are injected via Cloudflare env vars.
  // These values are available at runtime once your component is
  // published and approved. Do NOT remove them — they are required
  // for deployed environments to work correctly.
  devDomain,
  stagingDomain,
  prodDomain
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))


// Placeholder for DB access
const getDB = () => env.DB

// In order to use table, it shoule be created using
// wrangler d1 execute my-db --local --command "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE);"
// Here my-db refers to the database name defined in wrangler.jsonc
// The create table command should also be part of schema.jsonc in order to create tables remotely


// Route: Basic Test
app.get('/api/message', (req, res) => {
  const db = getDB();
  console.log('db', db)
  res.json({ message: 'Hello from Express on Workers!' })
})

// Route: Dynamic Hello
app.get('/api/hello/:name', (req, res) => {
  const environment = global.ENVIRONMENT || 'unknown'
  res.json({ message: `Hello, ${req.params.name} ${environment}` })
})



// Route: Insert Data into D1
// app.post('/api/users', async (req, res) => {
//   console.log('reqq', req.body)
//   const { name, email } = req.body

//   if (!name || !email) {
//     return res.status(400).json({ error: 'Name and email are required' })
//   }

//   try {
//     const db = getDB();
//     console.log('db', db)
//     await db.prepare('INSERT INTO users (name, email) VALUES (?, ?)')
//       .bind(name, email)
//       .run()

//     res.status(201).json({ success: true, message: 'User added successfully' })
//   } catch (err) {
//     res.status(500).json({ error: 'Database error', details: err.message })
//   }
// })

// Route: Fetch All Users
// app.get('/api/users', async (req, res) => {
//   try {
//     const db = getDB()
//     const { results } = await db.prepare('SELECT * FROM users').all()
//     res.json(results)
//   } catch (err) {
//     res.status(500).json({ error: 'Database error', details: err.message })
//   }
// })
/**
 * Fetch a Wikipedia thumbnail for a place name.
 * Uses the free MediaWiki **search** API — no API key needed.
 * Appends the city name for better disambiguation.
 * Returns the image URL string or null on any failure.
 */
async function fetchWikipediaImage(placeName, city) {
  try {
    // Combine place name + city for better search results
    // e.g. "Conciergerie Paris" instead of just "Conciergerie"
    const searchTerm = city ? `${placeName} ${city}` : placeName;

    const searchUrl =
      `https://en.wikipedia.org/w/api.php` +
      `?action=query` +
      `&generator=search` +
      `&gsrsearch=${encodeURIComponent(searchTerm)}` +
      `&gsrlimit=1` +
      `&prop=pageimages` +
      `&format=json` +
      `&pithumbsize=600` +
      `&origin=*`;

    // 4-second timeout so a slow lookup never blocks the whole response
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const resp = await fetch(searchUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!resp.ok) return null;

    const json = await resp.json();
    const pages = json?.query?.pages;
    if (!pages) return null;

    for (const page of Object.values(pages)) {
      if (page?.thumbnail?.source) {
        return page.thumbnail.source;
      }
    }
    return null;
  } catch (err) {
    // AbortError (timeout), network error, parse error — all safe
    return null;
  }
}

app.get('/api/tourism', async (req, res) => {
  try {
    const {
      lat,
      lon,
      query = '',
      city = ''
    } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    /*
     * Understand the user's requested tourism category.
     * Default = general tourist attractions.
     */
    const normalizedQuery = query.toLowerCase();

    let category = 'tourism.sights';

if (/\bmuseums?\b/.test(normalizedQuery)) {
  category = 'entertainment.museum';
}
else if (/\bparks?\b|\bgardens?\b/.test(normalizedQuery)) {
  category = 'leisure.park';
}
else if (/\bviewpoints?\b|\bscenic views?\b/.test(normalizedQuery)) {
  category = 'tourism.attraction.viewpoint';
}
else if (/\bstatues?\b|\bsculptures?\b|\bartworks?\b/.test(normalizedQuery)) {
  category = 'tourism.attraction.artwork';
}
else if (/\bcastles?\b/.test(normalizedQuery)) {
  category = 'tourism.sights.castle';
}
else if (/\bchurches?\b|\bcathedrals?\b|\btemples?\b|\bmosques?\b|\bsynagogues?\b/.test(normalizedQuery)) {
  category = 'tourism.sights.place_of_worship';
}
else if (/\bmonuments?\b|\bmemorials?\b/.test(normalizedQuery)) {
  category = 'tourism.sights.memorial';
}
else if (/\bzoos?\b/.test(normalizedQuery)) {
  category = 'entertainment.zoo';
}
else if (/\baquariums?\b/.test(normalizedQuery)) {
  category = 'entertainment.aquarium';
}
else if (/\bgalleries?\b/.test(normalizedQuery)) {
  category = 'entertainment.culture.gallery';
}
else if (/\btheatres?\b|\btheaters?\b/.test(normalizedQuery)) {
  category = 'entertainment.culture.theatre';
}
    console.log('Tourism query:', query);
    console.log('Selected category:', category);

    const apiKey = env.GEOAPIFY_API_KEY;

   const url =
  `https://api.geoapify.com/v2/places` +
  `?categories=${encodeURIComponent(category)}` +
  `&filter=circle:${lon},${lat},5000` +
  `&bias=proximity:${lon},${lat}` +
  `&limit=20` +
  `&apiKey=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();

      console.error('Geoapify error:', errorText);

      throw new Error(
        `Geoapify API error: ${response.status}`
      );
    }

    const data = await response.json();

    const features = data.features || [];

// Rank places that actually match the requested category first
const rankedFeatures = [...features].sort((a, b) => {
  const aCategories = a.properties?.categories || [];
  const bCategories = b.properties?.categories || [];

  const aMatch = aCategories.some(cat =>
    cat === category || cat.startsWith(category + ".")
  );

  const bMatch = bCategories.some(cat =>
    cat === category || cat.startsWith(category + ".")
  );

  return Number(bMatch) - Number(aMatch);
});

const places = rankedFeatures.map(feature => {
  const p = feature.properties || {};

  return {
    name: p.name || "Unnamed attraction",

    category:
      p.categories?.find(cat =>
        cat === category || cat.startsWith(category + ".")
      ) ||
      p.categories?.[0] ||
      category,

    lat:
      p.lat ??
      feature.geometry?.coordinates?.[1],

    lon:
      p.lon ??
      feature.geometry?.coordinates?.[0],

    description:
      p.description || "",

    address:
      p.formatted || "",

    image: null  // populated below for top results
  };
});

    /*
     * Fetch Wikipedia images for the first 8 places only.
     * Each call is individually wrapped — a single failure
     * never blocks the rest or the overall response.
     */
    const IMAGE_LIMIT = 8;
    const imageSlice = places.slice(0, IMAGE_LIMIT);

    const imageResults = await Promise.all(
      imageSlice.map(place =>
        fetchWikipediaImage(place.name, city).catch(() => null)
      )
    );
  //   const imageResults = await Promise.all(
  // imageSlice.map(async (place) => {
  //   const image = await fetchWikipediaImage(place.name, city);

  //   console.log("🖼️ WIKIPEDIA:", place.name, "=>", image);

  //   return image;
  //})

    for (let i = 0; i < imageResults.length; i++) {
      if (imageResults[i]) {
        places[i].image = imageResults[i];
      }
    }

    res.json({
      category,
      places
    });

  } catch (error) {
    console.error('Tourism API error:', error);

    res.status(500).json({
      error: 'Failed to fetch tourism data'
    });
  }
});
app.listen(3000)
export default httpServerHandler({ port: 3000 })
