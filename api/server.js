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

const articlesDir = path.join(__dirname, 'public', 'articles');

app.get('/api/articles/:fileName', (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(articlesDir, fileName);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Error reading file');
    }

    try {
      const article = parseFullArticle(data, fileName);
      res.json(article);
    } catch (error) {
      console.error('Error parsing article:', error);
      return res.status(500).send('Error parsing article');
    }
  });
});

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

    // Добавляем свойство fileName
    metadata['fileName'] = fileName;

    // Добавляем свойства folder и date, если они есть в метаданных
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
  const quotesPath = path.join(__dirname,'public', 'quotes');
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
  const [quote, location] = randomHighlight.split(' — ');
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

// Запуск сервера на порту 5000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
