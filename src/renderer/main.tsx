// main.tsx (updated)
import ReactDOM from 'react-dom/client'
import './styles/App.css';
import './styles/scrollbar.css';
import './styles/animations.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import "reflect-metadata";
import React from 'react';
import ConditionalRouter from './components/Shared/ConditionalRouter';
import App from './routes/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <ConditionalRouter>
        <App />
      </ConditionalRouter>
  </React.StrictMode>,
)