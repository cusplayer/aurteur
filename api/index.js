import kv from '@vercel/kv';
import express from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import axios from 'axios';
import qs from 'querystring';
import yaml from 'js-yaml';

const app = express();
app.use(cors());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://aurteur.com/api/callback';

let accessToken = null;
let userAccessToken = null;
let refreshToken = null;
let accessTokenExpiresAt = null;
let currentTrack = null;
let currentTrackId = null;

async function authorize() {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      qs.stringify({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    await kv.set('accessToken', response.data.access_token);
    // accessTokenExpiresAt = new Date().getTime() + response.data.expires_in * 1000;
  } catch (error) {
    console.error('Error during authorization:', error);
  }
}

// Middleware for checking access token
// async function checkAccessToken(req, res, next) {
//   if (!accessToken || new Date().getTime() >= accessTokenExpiresAt) {
//     authorize().then(() => next());
//   } else {
//     next();
//   }
// }

app.get('/api/login', (req, res) => {
  res.redirect(`https://accounts.spotify.com/authorize?${qs.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: 'user-read-currently-playing user-read-playback-state',
    redirect_uri: REDIRECT_URI,
  })}`);
});

app.get('/api/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      qs.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
        },
      }
    );

    await kv.set('userAccessToken', response.data.access_token);
    await kv.set('refreshToken', response.data.refresh_token);
    // userAccessTokenExpiresAt = new Date().getTime() + response.data.expires_in * 1000;
    res.redirect('/.');
  } catch (error) {
    console.error('Error during callback:', error);
    res.status(500).json({ error: 'Error during callback' });
  }
});

app.get('/api/current-track', async (req, res) => {
  try {
    const userAccessToken = await kv.get('userAccessToken');
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    });
    if (response.data && response.data.item) {
      const currentTrack = response.data.item;
      currentTrackId = currentTrack.id;
      const trackInfo = {
        name: currentTrack.name,
        album: currentTrack.album.name,
        artist: currentTrack.artists[0].name,
        is_playing: response.data.is_playing,
      };
      res.json(trackInfo);
    }
  } catch (error) {
    console.error('Error fetching current track:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching current track' });
  }
});

let longPollingClients = [];

app.get('/api/long-polling', async (req, res) => {
  trackChanges(res);
  const client = res;
  longPollingClients.push(client);
  req.on('close', () => {
    longPollingClients = longPollingClients.filter(c => c !== client);
  });
});

function notifyClients(trackInfo) {
  longPollingClients.forEach(client => {
    client.json(trackInfo);
  });
  longPollingClients = [];
}

let nowPlaying = false;

async function fetchCurrentTrack() {
  try {
    const userAccessToken = await kv.get('userAccessToken');
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    });
    if (response.data && response.data.item) {
      nowPlaying = response.data.is_playing;
      return response.data.item;
    } else {
      nowPlaying = false;
      return null;
    }
  } catch (error) {
    console.error('Error fetching current track:', error.response ? error.response.data : error.message);
    nowPlaying = false;
    return null;
  }
}

function trackChanges(res) {
  const intervalId = setInterval(async () => {
    const newTrack = await fetchCurrentTrack();
    if (newTrack && (currentTrackId !== newTrack.id) && nowPlaying === true) {
      currentTrackId = newTrack.id;
      currentTrack = newTrack;
      const trackInfo = {
        name: newTrack.name,
        album: newTrack.album.name,
        artist: newTrack.artists[0].name,
        is_playing: nowPlaying,
      };
      clearInterval(intervalId);
      notifyClients(trackInfo);
    } else if (nowPlaying === false) {
      currentTrack = null;
      currentTrackId = null;
      clearInterval(intervalId);
      notifyClients({ is_playing: false });
    } else {
      clearInterval(intervalId);
      res.status(204).send(); // No Content
    }
  }, 7000); // Check for changes every 5 seconds
}

app.get('/api/token_refresher', async (req, res) => {
  // this code is so fucking wacky
  try {
    authorize()
    const refreshToken = await kv.get('refreshToken');
    console.log('kved refreshtoken:', refreshToken);
    const response = await axios.post('https://accounts.spotify.com/api/token', qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      }), 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
          },
      }
    );
    await kv.set('userAccessToken', response.data.access_token);
    res.redirect('/.');
  } catch (error) {
      console.error('Error refreshing tokens:', error);
  }
});

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

let lastQuote = '';
let lastUpdateDate = '';
let bookTitle = '';
let author = '';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const articlesDir = join(__dirname, 'articles');

app.get('/api/articles/:fileName', (req, res) => {
  const { fileName } = req.params;
  const filePath = join(articlesDir, fileName);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading article file:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const { metadata, content } = splitArticleData(fileName, data);

    res.json({ metadata, content });
  });
});

function splitArticleData(fileName, data) {
  const lines = data.split('\n');
  let metadataLines = [];
  let isMetadataSection = false;

  for (const line of lines) {
    if (line.trim() === '---') {
      if (isMetadataSection) {
        break;
      }
      isMetadataSection = true;
      continue;
    }

    if (isMetadataSection) {
      metadataLines.push(line);
    }
  }

  const metadataString = metadataLines.join('\n');

  try {
    const metadata = yaml.safeLoad(metadataString);
    metadata['fileName'] = fileName;

    if (metadata.folder) {
      metadata['folder'] = metadata.folder;
    }
    if (metadata.date) {
      metadata['date'] = new Date(metadata.date);
    }

    const content = lines.slice(metadataLines.length + 2).join('\n');

    return { metadata, content };
  } catch (error) {
    console.error('Error parsing YAML metadata:', error);
    return { metadata: null, content: null };
  }
}

app.get('/api/articles', (req, res) => {
  fs.readdir(articlesDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).send('Error reading directory');
    }

    const articles = [];

    files.forEach((fileName) => {
      const filePath = join(articlesDir, fileName);

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return res.status(500).send('Error reading file');
        }

        try {
          const article = parseArticle(data, fileName);
          articles.push(article);
          if (articles.length === files.length) {
            res.send(articles);
          }
        } catch (error) {
          console.error('Error parsing article:', error);
          return res.status(500).send('Error parsing article');
        }
      });
    });
  });
});


function parseArticle(data, fileName) {
  const lines = data.split('\n');
  let metadataLines = [];
  let isMetadataSection = false;

  for (const line of lines) {
    if (line.trim() === '---') {
      if (isMetadataSection) {
        break;
      }
      isMetadataSection = true;
      continue;
    }

    if (isMetadataSection) {
      metadataLines.push(line);
    }
  }

  const metadataString = metadataLines.join('\n');

  try {
    const metadata = yaml.safeLoad(metadataString);
    metadata['fileName'] = fileName;

    if (metadata.folder) {
      metadata['folder'] = metadata.folder;
    }
    if (metadata.date) {
      metadata['date'] = new Date(metadata.date);
    }

    return metadata;
  } catch (error) {
    console.error('Error parsing YAML metadata:', error);
    return null;
  }
}


function getRandomQuoteFromFile() {
  const quotesPath = join(__dirname, 'quotes');
  const files = fs.readdirSync(quotesPath);
  const randomFile = files[Math.floor(Math.random() * files.length)];
  const filePath = join(quotesPath, randomFile);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  const highlightsIndex = lines.indexOf('## Highlights');
  const metadata = lines.slice(1, highlightsIndex).reduce((acc, line) => {
    const [key, value] = line.split(':').map(item => item.trim());
    acc[key] = value;
    return acc;
  }, {});
  const highlights = lines.slice(highlightsIndex + 1);
  const randomHighlight = highlights[Math.floor(Math.random() * highlights.length)];
  const lastLongDashIndex = randomHighlight.lastIndexOf('â');
  const quote = randomHighlight.slice(0, lastLongDashIndex);
  const [location] = randomHighlight.slice(lastLongDashIndex + 1).split(' â ');
  const bookTitle = metadata.title;
  const author = metadata.author;
  return {
    quote,
    bookTitle,
    author
  };
}

app.get('/api/quote', (req, res) => {
  const currentDate = new Date().toISOString().split('T')[0]; 
  if (currentDate !== lastUpdateDate) {
    let processedQuote;
    let words;
    let newBookTitle;
    let newAuthor;
    do {
      const { quote, bookTitle: bTitle, author: aName } = getRandomQuoteFromFile();
      newBookTitle  = bTitle;
      newAuthor  = aName;
      processedQuote = quote.replace(/—.*$/, '');
      words = processedQuote.split(/\s+/).filter(word => word !== '');
    } while (words.length < 3 || words.length > 250);

    lastQuote = `${processedQuote}`;
    bookTitle = newBookTitle;
    author = newAuthor;
    lastUpdateDate = currentDate;
  }

  res.json({ quote: lastQuote, bookTitle, author });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
