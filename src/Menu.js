import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import ArticleContent from './ArticleContent';
import Quote from './quote';
import Contacts from './contacts.js';

const ContactsModal = React.lazy(() => import('./ContactsModal'));
const ArticleModal = React.lazy(() => import('./ArticleModal'));
const Menu = () => {
  const [articles, setArticles] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [submenuPath, setSubmenuPath] = useState('');
  const [path, setPath] = useState('aurteur/');
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState(null);

  useEffect(() => {
    // Запрос на сервер для получения списка статей
    axios.get('http://localhost:5000/api/articles')
      .then(response => {
        if (Array.isArray(response.data)) {
          const allFolders = ['designs', 'ouvres', 'feed']; // Заранее известные папки
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

    // Проверяем, является ли устройство мобильным
    const isMobileDevice = () => {
      return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768 // Например, мобильным будем считать устройства с шириной менее 768px
      );
    };

    setIsMobile(isMobileDevice());
  }, []);

  const handleMenuClick = (menuItem, index) => {
    setPath('aurteur/' + menuItem + '/');
    setSelectedFolder(menuItem); // Устанавливаем выбранную папку
    setSelectedItemIndex(index);
    setSubmenuPath('');
    setSelectedArticle(null); // Сбрасываем выбранную статью
    setShowModal(false); // Закрываем модальное окно при выборе пункта меню
    if (isMobile) {
      setShowModal(true);
    }
  };

  const handleSubMenuClick = (submenuItem, article) => {
    setSubmenuPath(submenuItem.toLowerCase());
    setSelectedArticle(article); // Устанавливаем выбранную статью
    setSelectedItemType('article'); // Устанавливаем тип выбранного элемента (статья)

    // Открываем модальное окно статьи
    if (isMobile) {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
    setSelectedItemType(null);
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
              {/* Отображение папок designs и ouvres всегда */}
              <li className={`menu-item ${selectedFolder === 'designs' ? 'selected' : ''}`} onClick={() => handleMenuClick('designs', null)}>
                {selectedFolder === 'designs' ? '> ' : ''}designs
              </li>
              <li className={`menu-item ${selectedFolder === 'ouvres' ? 'selected' : ''}`} onClick={() => handleMenuClick('ouvres', null)}>
                {selectedFolder === 'ouvres' ? '> ' : ''}ouvres
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
        {selectedArticle && !isMobile && <ArticleContent fileName={selectedArticle.fileName} />}
        {selectedFolder === 'contacts' && !isMobile && (
          <Contacts />
        )}
        {isMobile && showModal && (
          <Suspense fallback={<div>Loading...</div>}>
            {selectedFolder === 'contacts' && (
              <ContactsModal closeModal={closeModal} />
            )}
            {selectedItemType === 'article' && (
              <ArticleModal fileName={selectedArticle.fileName} closeModal={closeModal} />
            )}
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default Menu;
