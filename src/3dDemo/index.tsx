import React from 'react';
import ReactDOM from 'react-dom/client';
import Simple3DView from './Simple3DView';
import './Simple3DView.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Simple3DView />
  </React.StrictMode>
);