const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const qs = require('querystring');
const cron = require('node-cron');

const app = express();
app.use(cors());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://aurteur.com/api/callback';

let accessToken = null;
let refreshToken = null;
let accessTokenExpiresAt = null;
let currentTrack = null; // Variable to store the current track information

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
    refreshToken = response.data.refresh_token;
    accessTokenExpiresAt = new Date().getTime() + response.data.expires_in * 1000;

    console.log('Access token:', accessToken);

    res.redirect('/api/current-track');
  } catch (error) {
    console.error('Error during callback:', error);
    res.status(500).json({ error: 'Error during callback' });
  }
});

app.get('/api/current-track', checkAccessToken, async (req, res) => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.data && response.data.item) {
      const currentTrack = response.data.item;
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
});

let longPollingClients = [];

app.get('/api/long-polling', checkAccessToken, (req, res) => {
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

async function fetchCurrentTrack() {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.item;
  } catch (error) {
    console.error('Error fetching current track:', error.response ? error.response.data : error.message);
    return null;
  }
}

function trackChanges() {
  setInterval(async () => {
    const newTrack = await fetchCurrentTrack();
    if (newTrack && (!currentTrack || currentTrack.id !== newTrack.id)) {
      currentTrack = newTrack;
      const trackInfo = {
        name: newTrack.name,
        album: newTrack.album.name,
        artist: newTrack.artists[0].name,
        is_playing: true,
      };
      notifyClients(trackInfo);
    } else if (newTrack && !newTrack.is_playing) {
      currentTrack = response.data.item;
      const trackInfo = {
        name: currentTrack.name,
        album: currentTrack.album.name,
        artist: currentTrack.artists[0].name,
        is_playing: response.data.is_playing,
      };
      notifyClients(trackInfo);  
    }
  }, 5000); // Check for changes every 5 seconds
}

trackChanges();

// Refresh access token every hour
cron.schedule('0 * * * *', async () => {
  if (!refreshToken) {
    console.error('Refresh token is missing');
    return;
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    accessToken = response.data.access_token;
    accessTokenExpiresAt = new Date().getTime() + (response.data.expires_in * 1000);

    console.log(`New access token: ${accessToken}`);
  } catch (error) {
    console.error('Error refreshing access token:', error);
  }
});


let lastQuote = '';
let lastUpdateDate = '';
let bookTitle = '';
let author = '';

const articlesDir = path.join(__dirname, 'articles');

app.get('/api/articles/:fileName', (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(articlesDir, fileName);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading article file:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Разделить содержимое файла на метаданные и контент статьи
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

// Обработчик GET запроса для получения списка файлов и их свойств
app.get('/api/articles', (req, res) => {
  fs.readdir(articlesDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).send('Error reading directory');
    }

    const articles = [];

    files.forEach((fileName) => {
      const filePath = path.join(articlesDir, fileName);

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return res.status(500).send('Error reading file');
        }

        try {
          const article = parseArticle(data, fileName); // Передаем также имя файла
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
const yaml = require('js-yaml');
// Функция для парсинга содержимого файла .md и получения свойств
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

// Функция для получения случайной цитаты из файла
function getRandomQuoteFromFile() {
  const quotesPath = path.join(__dirname, 'quotes');
  const files = fs.readdirSync(quotesPath);
  const randomFile = files[Math.floor(Math.random() * files.length)];
  const filePath = path.join(quotesPath, randomFile);
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

  // Находим последнее длинное тире и обрезаем строку после него
  const lastLongDashIndex = randomHighlight.lastIndexOf('—');
  const quote = randomHighlight.slice(0, lastLongDashIndex);

  const [location] = randomHighlight.slice(lastLongDashIndex + 1).split(' — ');
  const bookTitle = metadata.title;
  const author = metadata.author;
  return {
    quote,
    bookTitle,
    author
  };
}

// Обработчик GET запроса к /api/quote
app.get('/api/quote', (req, res) => {
  const currentDate = new Date().toISOString().split('T')[0]; // Текущая дата

  // Проверяем, прошел ли уже день с момента последнего обновления цитаты
  if (currentDate !== lastUpdateDate) {
    // Выбираем новую цитату
    let processedQuote;
    let words;
    let newBookTitle;
    let newAuthor;
    do {
      const { quote, bookTitle: bTitle, author: aName } = getRandomQuoteFromFile();
      newBookTitle  = bTitle;
      newAuthor  = aName;
      processedQuote = quote.replace(/— location:.*$/, '');
      words = processedQuote.split(/\s+/).filter(word => word !== '');
    } while (words.length < 3 || words.length > 200);

    // Форматируем цитату в формате Markdown
    lastQuote = `${processedQuote}`;
    bookTitle = newBookTitle;
    author = newAuthor;
    lastUpdateDate = currentDate; // Обновляем дату последнего обновления
  }

  // Отправляем последнюю выбранную цитату как ответ на запрос
  res.json({ quote: lastQuote, bookTitle, author });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app
