import React from 'react';
import App from './App.js';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";

setTimeout(() => createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>), 0);