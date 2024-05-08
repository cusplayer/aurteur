const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors()); 

let lastQuote = ''; // Последняя выбранная цитата
let lastUpdateDate = ''; // Дата последнего обновления цитаты
let bookTitle = '';
let author = '';

const articlesDir = path.join(__dirname, 'articles');

app.get('/api/articles/:fileName', (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(articlesDir, fileName);
  // Прочитать файл статьи
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

app.listen(5000, () => console.log("Server ready on port 5000."));

module.exports = app
