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
          const allFolders = ['designs', 'works', 'feed']; // Заранее известные папки
          const articlesByFolder = {};

          // Создаем объект с пустыми массивами для каждой папки
          allFolders.forEach(folder => {
            articlesByFolder[folder] = [];
          });

          // Группируем статьи по папкам
          response.data.forEach(article => {
            const folder = article.folder || 'feed'; // Если у статьи нет папки, добавляем ее в папку "feed"
            articlesByFolder[folder].push(article);
          });

          // Устанавливаем статьи по папкам
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
              {/* Отображение папки feed */}
              <li className={`menu-item ${selectedFolder === 'feed' ? 'selected' : ''}`} onClick={() => handleMenuClick('feed', null)}>
                {selectedFolder === 'feed' ? '> ' : ''}feed
              </li>
              {/* Отображение папок designs и works всегда */}
              <li className={`menu-item ${selectedFolder === 'designs' ? 'selected' : ''}`} onClick={() => handleMenuClick('designs', null)}>
                {selectedFolder === 'designs' ? '> ' : ''}designs
              </li>
              <li className={`menu-item ${selectedFolder === 'works' ? 'selected' : ''}`} onClick={() => handleMenuClick('works', null)}>
                {selectedFolder === 'works' ? '> ' : ''}works
              </li>
              <li className={`menu-item ${selectedFolder === 'contacts' ? 'selected' : ''}`} onClick={() => handleMenuClick('contacts', null)}>
                {selectedFolder === 'contacts' ? '> ' : ''}contacts
              </li>
            </ul>
            <div className="submenu">
              {/* Отображение статей для выбранной папки */}
              {selectedFolder && articles[selectedFolder] && articles[selectedFolder].map((article, index) => (
                <div key={index} className={`article-list ${selectedArticle === article ? 'selected' : ''}`} onClick={() => handleSubMenuClick(article.fileName, article)}>
                  <div className="articleTitle">{selectedArticle === article ? '> ' : ''}{article.fileName.split('.').slice(0, -1).join('.')}</div>
                  <div className="articleTags">{article.tags && article.tags.map(tag => `#${tag}`).join(' ')}</div>
                </div>
              ))}
              {/* Отображение всех статей для папки feed */}
              {selectedFolder === 'feed' && Object.values(articles).flat().map((article, index) => (
                <div key={index} className={`article-list ${selectedArticle === article ? 'selected' : ''}`} onClick={() => handleSubMenuClick(article.fileName, article)}>
                  <div className="articleTitle">{selectedArticle === article ? '> ' : ''}{article.fileName.split('.').slice(0, -1).join('.')}</div>
                  <div className="articleTags">{article.tags && article.tags.map(tag => `#${tag}`).join(' ')}</div>
                </div>
              ))}
            </div>
          </div>
          <Quote/>
        </div>
        {/* Отображение содержимого выбранной статьи */}
        {selectedArticle && <ArticleContent fileName={selectedArticle.fileName} />}
        {/* Отображение компонента Contacts, если выбрана папка contacts */}
        {selectedFolder === 'contacts' && <Contacts />}
      </div>
    </div>
  );
};

export default Menu;


