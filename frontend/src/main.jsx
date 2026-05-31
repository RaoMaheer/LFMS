import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux';
import { store } from './store'; // Make sure this path is correct
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import { ThemeProvider } from './context/ThemeContext';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
      <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
)