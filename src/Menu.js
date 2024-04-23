import React, { useState, useEffect } from 'react';
import './Menu.css';
import './quote.js'
import axios from 'axios';
import ArticleContent from './ArticleContent';
import Quote from './quote';
import Contacts from './contacts.js';

const Menu = () => {
  const [articles, setArticles] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [submenuPath, setSubmenuPath] = useState('');
  const [path, setPath] = useState('aurteur/');

  useEffect(() => {
    // Запрос на сервер для получения списка статей
    axios.get('/api/articles')
      .then(response => {
        if (Array.isArray(response.data)) {
          const allFolders = ['designs', 'works']; // Заранее известные папки
          const articlesByFolder = {};
  
          // Разбиваем статьи по папкам и сортируем их по дате
          allFolders.forEach(folder => {
            const articlesForFolder = response.data.filter(article => article.folder === folder);
            articlesForFolder.sort((a, b) => new Date(b.date) - new Date(a.date)); // Сортируем по убыванию даты
            articlesByFolder[folder] = articlesForFolder;
          });
          
          setArticles(articlesByFolder);
        } else {
          console.error('Error fetching articles: Response data is not an array');
        }
      })
      .catch(error => {
        console.error('Error fetching articles:', error);
      });
  }, []);
  
  const handleMenuClick = (menuItem, index) => {
    setPath('aurteur/' + menuItem + '/');
    setSelectedFolder(menuItem); // Устанавливаем выбранную папку
    setSelectedItemIndex(index);
    setSubmenuPath('');
    setSelectedArticle(null); // Сбрасываем выбранную статью
  };

  const handleSubMenuClick = (submenuItem, article) => {
    setSubmenuPath(submenuItem.toLowerCase());
    setSelectedArticle(article); // Устанавливаем выбранную статью
  };

  return (
    <div className="menu-container">
      <div className="path">
        {path + submenuPath}
      </div>
      <div className="contentBody">
        <div className='leftPanel'>
          <div className="menu">
            <ul className="menu-list">
              {Object.keys(articles).map((folder, index) => (
                <li key={index} className={`menu-item ${selectedItemIndex === index ? 'selected' : ''}`} onClick={() => handleMenuClick(folder, index)}>
                  {selectedItemIndex === index ? '> ' : ''}{folder}
                </li>
              ))}
              <li className={`menu-item ${selectedFolder === 'contacts' ? 'selected' : ''}`} onClick={() => handleMenuClick('contacts', null)}>
                {selectedFolder === 'contacts' ? '> ' : ''}contacts
              </li>
            </ul>
            <div className="submenu">
              {selectedFolder && articles[selectedFolder] && articles[selectedFolder].map((article, index) => (
                <div key={index} className={`article-list ${selectedArticle === article ? 'selected' : ''}`} onClick={() => handleSubMenuClick(article.fileName, article)}>
                  <div className="articleTitle">{selectedArticle === article ? '> ' : ''}{article.fileName.split('.').slice(0, -1).join('.')}</div>
                  <div className="articleTags">{article.tags && article.tags.map(tag => `#${tag}`).join(' ')}</div>
                </div>
              ))}
            </div>
          </div>
          <Quote/>
        </div>
        {selectedArticle && <ArticleContent fileName={selectedArticle.fileName} />}
        {selectedFolder === 'contacts' && <Contacts />}
      </div>
    </div>
  );
};

export default Menu;
