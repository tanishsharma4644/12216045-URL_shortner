import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent
} from '@mui/material';
import {
  Link as LinkIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import logger from '../utils/loggingMiddleware.js';
import urlDataManager from '../utils/urlDataManager.js';

const RedirectHandler = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); 
  const [urlData, setUrlData] = useState(null);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    handleRedirect();
  }, [shortCode]);

  useEffect(() => {
    if (status === 'redirecting' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'redirecting' && countdown === 0) {
      window.location.href = urlData.originalUrl;
    }
  }, [status, countdown, urlData]);

  const handleRedirect = async () => {
    try {
      logger.logUserAction('Short URL Access Attempted', { shortCode });

      const url = urlDataManager.getUrlByShortCode(shortCode);
      
      if (!url) {
        setStatus('error');
        setError('Short URL not found. It may have been deleted or never existed.');
        logger.warn('Short URL not found', { shortCode });
        return;
      }

      if (urlDataManager.isUrlExpired(url)) {
        setStatus('expired');
        setUrlData(url);
        logger.warn('Attempted to access expired URL', { shortCode, expiresAt: url.expiresAt });
        return;
      }

      try {
        urlDataManager.recordClick(shortCode, {
          source: document.referrer || 'Direct'
        });
      } catch (clickError) {
        logger.logError(clickError, 'Recording click');
      }

      setUrlData(url);
      setStatus('redirecting');
      
      logger.logUserAction('Short URL Redirect Initiated', {
        shortCode,
        originalUrl: url.originalUrl,
        totalClicks: url.totalClicks + 1
      });

    } catch (error) {
      logger.logError(error, 'URL redirect handling');
      setStatus('error');
      setError('An unexpected error occurred while processing the redirect.');
    }
  };

  const handleManualRedirect = () => {
    if (urlData) {
      window.location.href = urlData.originalUrl;
    }
  };

  const goToHome = () => {
    navigate('/');
  };

  const goToStats = () => {
    navigate('/statistics');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (status === 'loading') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Processing Redirect...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Looking up short URL: <strong>{shortCode}</strong>
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (status === 'redirecting') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <LaunchIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="success.main">
              Redirecting...
            </Typography>
          </Box>
          
          <Card sx={{ mb: 3, backgroundColor: 'success.light' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Destination:
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ wordBreak: 'break-all', mb: 2 }}
              >
                {urlData.originalUrl}
              </Typography>
              <Typography variant="h3" color="primary">
                {countdown}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={handleManualRedirect}
              startIcon={<LaunchIcon />}
            >
              Go Now
            </Button>
            <Button
              variant="outlined"
              onClick={goToHome}
            >
              Cancel
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            If you are not redirected automatically, click "Go Now" above.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (status === 'expired') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <ScheduleIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="warning.main">
              Link Expired
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body1" gutterBottom>
              This short URL has expired and is no longer accessible.
            </Typography>
          </Alert>

          {urlData && (
            <Card sx={{ mb: 3, backgroundColor: 'grey.50' }}>
              <CardContent sx={{ textAlign: 'left' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Short Code:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {urlData.shortCode}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Original URL:
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ wordBreak: 'break-all', mb: 2 }}
                >
                  {urlData.originalUrl}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Expired On:
                </Typography>
                <Typography variant="body1" color="error">
                  {formatDate(urlData.expiresAt)}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={goToHome}
              startIcon={<LinkIcon />}
            >
              Create New Short URL
            </Button>
            <Button
              variant="outlined"
              onClick={goToStats}
            >
              View Statistics
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            You can create a new short URL for this destination or contact the link creator.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Error state
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="error.main">
            URL Not Found
          </Typography>
        </Box>

        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body1" gutterBottom>
            {error}
          </Typography>
        </Alert>

        <Card sx={{ mb: 3, backgroundColor: 'grey.50' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Requested Short Code:
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
              {shortCode}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={goToHome}
            startIcon={<LinkIcon />}
          >
            Create Short URL
          </Button>
          <Button
            variant="outlined"
            onClick={goToStats}
          >
            View All URLs
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Double-check the URL or contact the person who shared this link with you.
        </Typography>
      </Paper>
    </Container>
  );
};

export default RedirectHandler;
