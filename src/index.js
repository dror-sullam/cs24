import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRoutes from './Routes';
import {HeroUIProvider} from "@heroui/react";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HeroUIProvider>
      <AppRoutes />
    </HeroUIProvider>
  </React.StrictMode>
);

