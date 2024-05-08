import './App.css';
import Menu from './Menu';
import {
  initArrowNavigation,
  FocusableElement,
  FocusableGroup
} from '@arrow-navigation/react'

initArrowNavigation()

function App() {
  return (
    <div className="main-page">
      <div className="top">
        <h1 className="name">Arthur Davtaev</h1>
        <div className="content"> <Menu /> </div>
      </div>
    </div>
  );
}

export default App;