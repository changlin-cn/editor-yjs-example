import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import 'virtual:windi.css';
import 'virtual:windi-devtools';
import { Navigator } from './components/Navigator/Navigator';
import { NotFound } from './pages/NotFound';
import { RemoteCursorsOverlayPage } from './pages/RemoteCursorOverlay';

ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<RemoteCursorsOverlayPage />}
        />
       
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Navigator />
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root')
);
