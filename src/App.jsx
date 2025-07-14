import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Navigation from './components/Navigation.jsx';
import URLShortenerPage from './components/URLShortenerPage.jsx';
import StatisticsPage from './components/StatisticsPage.jsx';
import RedirectHandler from './components/RedirectHandler.jsx';
import logger from './utils/loggingMiddleware.js';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  React.useEffect(() => {
    logger.info('URL Shortener App initialized', {
      version: '1.0.0',
      environment: 'development'
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
          <Navigation />
          <Routes>
            <Route path="/" element={<URLShortenerPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/:shortCode" element={<RedirectHandler />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
