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

authorize();

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

    accessToken = response.data.access_token;
    accessTokenExpiresAt = new Date().getTime() + response.data.expires_in * 1000;

    console.log('Access token:', accessToken);
  } catch (error) {
    console.error('Error during authorization:', error);
  }
}

// Middleware for checking access token
function checkAccessToken(req, res, next) {
  if (!accessToken || new Date().getTime() >= accessTokenExpiresAt) {
    authorize().then(() => next());
  } else {
    next();
  }
}

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
        // client_id: CLIENT_ID,
        // client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
        },
      }
    );
    console.log('response data from callback:', response.data);
    console.log('User access token2:', response.data.access_token);
    await kv.set('userAccessToken', response.data.access_token);
    refreshToken = response.data.refresh_token;
    console.log('Ref token1:', refreshToken);
    accessTokenExpiresAt = new Date().getTime() + response.data.expires_in * 1000;

    console.log('User access token:', userAccessToken);

    res.redirect('/api/current-track');
  } catch (error) {
    console.error('Error during callback:', error);
    res.status(500).json({ error: 'Error during callback' });
  }
});

app.get('/api/current-track', checkAccessToken, async (req, res) => {
  try {
    const userAccessToken = await kv.get('userAccessToken');
    console.log('userAccessToken after updating ct:', userAccessToken); // Add this line
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    });
    console.log('Response on ct:', response.data, response.data.item);
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
    } else {
      res.status(204).send(); // No Content
    }
  } catch (error) {
    console.error('Error fetching current track:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching current track' });
  }
  console.log('userAccessToken after updating:', userAccessToken); // Add this line
});

let longPollingClients = [];

app.get('/api/long-polling', checkAccessToken, async (req, res) => {
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

// function updateAccessToken() {
//   // if (new Date().getTime() >= accessTokenExpiresAt) {
//     console.log('Ref token2:', refreshToken);
//     axios.post('https://accounts.spotify.com/api/token', qs.stringify({
//       grant_type: 'refresh_token',
//       refresh_token: refreshToken,
//       client_id: CLIENT_ID,
//     }), {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     })
//     .then(response => {
//       userAccessToken = response.data.access_token;
//       accessTokenExpiresAt = new Date().getTime() + (response.data.expires_in * 1000);
//       console.log('Access token refreshed, new userAccessToken:', userAccessToken);
//     })
//     .catch(error => {
//       console.error('Error refreshing user access token:', error);
//     });
//   // }
// }


let nowPlaying = false;

async function fetchCurrentTrack() {
  try {
    // await updateAccessToken();
    const userAccessToken = await kv.get('userAccessToken');
    console.log('Before fetching current track, userAccessToken:', userAccessToken);
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    });

    console.log('Response on fetching:', response.data);
    if (response.data && response.data.item) {
      nowPlaying = response.data.is_playing;
      console.log('Current track:', response.data.item.name);
      console.log('After fetching current track, userAccessToken:', userAccessToken);
      return response.data.item;
    } else {
      nowPlaying = false;
      return null;
    }
  } catch (error) {
    console.error('Error fetching current track:', error.response ? error.response.data : error.message);
    nowPlaying = false;
    console.log('After fetching current track error, userAccessToken:', userAccessToken);
    return null;
  }
}

function trackChanges(res) {
  const intervalId = setInterval(async () => {
    // await updateAccessToken();
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

// Refresh access token every hour
// cron.schedule('0 * * * *', async () => {
//   if (!refreshToken) {
//     console.error('Refresh token is missing');
//     return;
//   }

//   try {
//     const response = await axios.post('https://accounts.spotify.com/api/token', qs.stringify({
//       grant_type: 'refresh_token',
//       refresh_token: refreshToken,
//       client_id: CLIENT_ID,
//       client_secret: CLIENT_SECRET
//     }), {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     });

//     accessToken = response.data.access_token;
//     accessTokenExpiresAt = new Date().getTime() + (response.data.expires_in * 1000);
//     console.log('Refreshed access token:', accessToken);
//   } catch (error) {
//     console.error('Error refreshing access token:', error);
//   }
// });


// How can I handle environment variables in a Node.js application deployed on
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

    // Ð Ð°Ð·Ð´ÐµÐ»Ð¸ÑÑ ÑÐ¾Ð´ÐµÑÐ¶Ð¸Ð¼Ð¾Ðµ ÑÐ°Ð¹Ð»Ð° Ð½Ð° Ð¼ÐµÑÐ°Ð´Ð°Ð½Ð½ÑÐµ Ð¸ ÐºÐ¾Ð½ÑÐµÐ½Ñ ÑÑÐ°ÑÑÐ¸
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

    const content = lines.slice(metadataLines.length + 1).join('\n');

    return { metadata, content };
  } catch (error) {
    console.error('Error parsing YAML metadata:', error);
    return { metadata: null, content: null };
  }
}


function parseFullArticle(data) {
  return data;
}

// ÐÐ±ÑÐ°Ð±Ð¾ÑÑÐ¸Ðº GET Ð·Ð°Ð¿ÑÐ¾ÑÐ° Ð´Ð»Ñ Ð¿Ð¾Ð»ÑÑÐµÐ½Ð¸Ñ ÑÐ¿Ð¸ÑÐºÐ° ÑÐ°Ð¹Ð»Ð¾Ð² Ð¸ Ð¸Ñ ÑÐ²Ð¾Ð¹ÑÑÐ²
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
          const article = parseArticle(data, fileName); // ÐÐµÑÐµÐ´Ð°ÐµÐ¼ ÑÐ°ÐºÐ¶Ðµ Ð¸Ð¼Ñ ÑÐ°Ð¹Ð»Ð°
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

// Ð¤ÑÐ½ÐºÑÐ¸Ñ Ð´Ð»Ñ Ð¿Ð°ÑÑÐ¸Ð½Ð³Ð° ÑÐ¾Ð´ÐµÑÐ¶Ð¸Ð¼Ð¾Ð³Ð¾ ÑÐ°Ð¹Ð»Ð° .md Ð¸ Ð¿Ð¾Ð»ÑÑÐµÐ½Ð¸Ñ ÑÐ²Ð¾Ð¹ÑÑÐ²
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

// Ð¤ÑÐ½ÐºÑÐ¸Ñ Ð´Ð»Ñ Ð¿Ð¾Ð»ÑÑÐµÐ½Ð¸Ñ ÑÐ»ÑÑÐ°Ð¹Ð½Ð¾Ð¹ ÑÐ¸ÑÐ°ÑÑ Ð¸Ð· ÑÐ°Ð¹Ð»Ð°
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

  // ÐÐ°ÑÐ¾Ð´Ð¸Ð¼ Ð¿Ð¾ÑÐ»ÐµÐ´Ð½ÐµÐµ Ð´Ð»Ð¸Ð½Ð½Ð¾Ðµ ÑÐ¸ÑÐµ Ð¸ Ð¾Ð±ÑÐµÐ·Ð°ÐµÐ¼ ÑÑÑÐ¾ÐºÑ Ð¿Ð¾ÑÐ»Ðµ Ð½ÐµÐ³Ð¾
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

// ÐÐ±ÑÐ°Ð±Ð¾ÑÑÐ¸Ðº GET Ð·Ð°Ð¿ÑÐ¾ÑÐ° Ðº /api/quote
app.get('/api/quote', (req, res) => {
  const currentDate = new Date().toISOString().split('T')[0]; // Ð¢ÐµÐºÑÑÐ°Ñ Ð´Ð°ÑÐ°

  // ÐÑÐ¾Ð²ÐµÑÑÐµÐ¼, Ð¿ÑÐ¾ÑÐµÐ» Ð»Ð¸ ÑÐ¶Ðµ Ð´ÐµÐ½Ñ Ñ Ð¼Ð¾Ð¼ÐµÐ½ÑÐ° Ð¿Ð¾ÑÐ»ÐµÐ´Ð½ÐµÐ³Ð¾ Ð¾Ð±Ð½Ð¾Ð²Ð»ÐµÐ½Ð¸Ñ ÑÐ¸ÑÐ°ÑÑ
  if (currentDate !== lastUpdateDate) {
    // ÐÑÐ±Ð¸ÑÐ°ÐµÐ¼ Ð½Ð¾Ð²ÑÑ ÑÐ¸ÑÐ°ÑÑ
    let processedQuote;
    let words;
    let newBookTitle;
    let newAuthor;
    do {
      const { quote, bookTitle: bTitle, author: aName } = getRandomQuoteFromFile();
      newBookTitle  = bTitle;
      newAuthor  = aName;
      processedQuote = quote.replace(/â location:.*$/, '');
      words = processedQuote.split(/\s+/).filter(word => word !== '');
    } while (words.length < 3 || words.length > 200);

    // Ð¤Ð¾ÑÐ¼Ð°ÑÐ¸ÑÑÐµÐ¼ ÑÐ¸ÑÐ°ÑÑ Ð² ÑÐ¾ÑÐ¼Ð°ÑÐµ Markdown
    lastQuote = `${processedQuote}`;
    bookTitle = newBookTitle;
    author = newAuthor;
    lastUpdateDate = currentDate; // ÐÐ±Ð½Ð¾Ð²Ð»ÑÐµÐ¼ Ð´Ð°ÑÑ Ð¿Ð¾ÑÐ»ÐµÐ´Ð½ÐµÐ³Ð¾ Ð¾Ð±Ð½Ð¾Ð²Ð»ÐµÐ½Ð¸Ñ
  }

  // ÐÑÐ¿ÑÐ°Ð²Ð»ÑÐµÐ¼ Ð¿Ð¾ÑÐ»ÐµÐ´Ð½ÑÑ Ð²ÑÐ±ÑÐ°Ð½Ð½ÑÑ ÑÐ¸ÑÐ°ÑÑ ÐºÐ°Ðº Ð¾ÑÐ²ÐµÑ Ð½Ð° Ð·Ð°Ð¿ÑÐ¾Ñ
  res.json({ quote: lastQuote, bookTitle, author });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
