import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';
import {
  Link as LinkIcon,
  Analytics as AnalyticsIcon,
  ContentCut as ContentCutIcon
} from '@mui/icons-material';
import logger from '../utils/loggingMiddleware.js';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path, pageName) => {
    navigate(path);
    logger.logUserAction('Navigation', { from: location.pathname, to: path, pageName });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="static" elevation={2}>
      <Container maxWidth="lg">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <ContentCutIcon sx={{ mr: 1 }} />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigation('/', 'Home')}
            >
              URL Shortener
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<LinkIcon />}
              onClick={() => handleNavigation('/', 'URL Shortener')}
              variant={isActive('/') ? 'outlined' : 'text'}
              sx={{
                backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderColor: isActive('/') ? 'rgba(255,255,255,0.3)' : 'transparent'
              }}
            >
              Shorten URLs
            </Button>
            
            <Button
              color="inherit"
              startIcon={<AnalyticsIcon />}
              onClick={() => handleNavigation('/statistics', 'Statistics')}
              variant={isActive('/statistics') ? 'outlined' : 'text'}
              sx={{
                backgroundColor: isActive('/statistics') ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderColor: isActive('/statistics') ? 'rgba(255,255,255,0.3)' : 'transparent'
              }}
            >
              Statistics
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;
