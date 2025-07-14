import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Box,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import logger from '../utils/loggingMiddleware.js';
import urlDataManager from '../utils/urlDataManager.js';

const URLShortenerPage = () => {
  const [urlForms, setUrlForms] = useState([
    { id: 1, originalUrl: '', customShortCode: '', validityMinutes: 30 }
  ]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  logger.logUserAction('URL Shortener Page Loaded');

  const addUrlForm = () => {
    if (urlForms.length < 5) {
      const newForm = {
        id: Date.now(),
        originalUrl: '',
        customShortCode: '',
        validityMinutes: 30
      };
      setUrlForms([...urlForms, newForm]);
      logger.logUserAction('URL Form Added', { formCount: urlForms.length + 1 });
    }
  };

  const removeUrlForm = (id) => {
    if (urlForms.length > 1) {
      setUrlForms(urlForms.filter(form => form.id !== id));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
      logger.logUserAction('URL Form Removed', { formCount: urlForms.length - 1 });
    }
  };

  const updateUrlForm = (id, field, value) => {
    setUrlForms(urlForms.map(form => 
      form.id === id ? { ...form, [field]: value } : form
    ));
    
    if (errors[id]?.[field]) {
      setErrors(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: null
        }
      }));
    }
  };

  const validateForm = (form) => {
    const formErrors = {};
    
    if (!form.originalUrl.trim()) {
      formErrors.originalUrl = 'URL is required';
    } else {
      try {
        new URL(form.originalUrl);
      } catch {
        formErrors.originalUrl = 'Please enter a valid URL';
      }
    }

    const validity = parseInt(form.validityMinutes);
    if (!validity || validity < 1 || validity > 10080) { // Max 1 week
      formErrors.validityMinutes = 'Validity must be between 1 and 10080 minutes';
    }

    if (form.customShortCode.trim()) {
      if (!/^[a-zA-Z0-9]{3,20}$/.test(form.customShortCode)) {
        formErrors.customShortCode = 'Shortcode must be alphanumeric, 3-20 characters';
      }
    }

    return formErrors;
  };

  const validateAllForms = () => {
    const allErrors = {};
    let hasErrors = false;

    urlForms.forEach(form => {
      if (form.originalUrl.trim()) { 
        const formErrors = validateForm(form);
        if (Object.keys(formErrors).length > 0) {
          allErrors[form.id] = formErrors;
          hasErrors = true;
        }
      }
    });

    setErrors(allErrors);
    return !hasErrors;
  };

  const handleSubmit = async () => {
    logger.logUserAction('URL Shortening Attempted', { formCount: urlForms.length });
    
    
    const validForms = urlForms.filter(form => form.originalUrl.trim());
    
    if (validForms.length === 0) {
      setErrors({ general: 'Please enter at least one URL to shorten' });
      return;
    }

    if (!validateAllForms()) {
      logger.logUserAction('URL Shortening Failed - Validation Errors');
      return;
    }

    setLoading(true);
    setErrors({});
    const newResults = [];

    try {
      for (const form of validForms) {
        try {
          const result = urlDataManager.createShortUrl(
            form.originalUrl,
            form.customShortCode.trim() || null,
            parseInt(form.validityMinutes)
          );
          newResults.push({ success: true, data: result });
          logger.info('URL shortened successfully', { shortCode: result.shortCode });
        } catch (error) {
          newResults.push({ 
            success: false, 
            error: error.message, 
            originalUrl: form.originalUrl 
          });
          logger.logError(error, 'URL shortening');
        }
      }

      setResults(newResults);
      
      if (newResults.every(r => r.success)) {
        setUrlForms([{ id: Date.now(), originalUrl: '', customShortCode: '', validityMinutes: 30 }]);
      }

    } catch (error) {
      logger.logError(error, 'Batch URL shortening');
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.logUserAction('Short URL Copied', { url: text });
    } catch (error) {
      logger.logError(error, 'Copy to clipboard');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LinkIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" gutterBottom>
            URL Shortener
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Shorten up to 5 URLs at once. 
        </Typography>

        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        <Grid container spacing={3}>
          {urlForms.map((form, index) => (
            <Grid item xs={12} key={form.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      URL #{index + 1}
                    </Typography>
                    {urlForms.length > 1 && (
                      <IconButton 
                        onClick={() => removeUrlForm(form.id)}
                        color="error"
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Original URL"
                        placeholder="https://example.com/very-long-url"
                        value={form.originalUrl}
                        onChange={(e) => updateUrlForm(form.id, 'originalUrl', e.target.value)}
                        error={!!errors[form.id]?.originalUrl}
                        helperText={errors[form.id]?.originalUrl}
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Custom Shortcode (Optional)"
                        placeholder="mycode123"
                        value={form.customShortCode}
                        onChange={(e) => updateUrlForm(form.id, 'customShortCode', e.target.value)}
                        error={!!errors[form.id]?.customShortCode}
                        helperText={errors[form.id]?.customShortCode || "3-20 alphanumeric characters"}
                        variant="outlined"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Validity (Minutes)"
                        type="number"
                        value={form.validityMinutes}
                        onChange={(e) => updateUrlForm(form.id, 'validityMinutes', e.target.value)}
                        error={!!errors[form.id]?.validityMinutes}
                        helperText={errors[form.id]?.validityMinutes || "Default: 30 minutes"}
                        variant="outlined"
                        inputProps={{ min: 1, max: 10080 }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {urlForms.length < 5 && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addUrlForm}
            >
              Add Another URL
            </Button>
          )}
          
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            size="large"
            sx={{ ml: 'auto' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Shorten URLs'}
          </Button>
        </Box>

        {results.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Results
            </Typography>
            
            <Grid container spacing={2}>
              {results.map((result, index) => (
                <Grid item xs={12} key={index}>
                  {result.success ? (
                    <Card sx={{ backgroundColor: 'success.light', color: 'success.contrastText' }}>
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Original URL:
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                wordBreak: 'break-all',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                p: 1,
                                borderRadius: 1
                              }}
                            >
                              {result.data.originalUrl}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Short URL:
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  backgroundColor: 'rgba(255,255,255,0.2)',
                                  p: 1,
                                  borderRadius: 1,
                                  flexGrow: 1,
                                  wordBreak: 'break-all'
                                }}
                              >
                                {result.data.shortUrl}
                              </Typography>
                              <Tooltip title="Copy to clipboard">
                                <IconButton 
                                  onClick={() => copyToClipboard(result.data.shortUrl)}
                                  sx={{ color: 'inherit' }}
                                >
                                  <CopyIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            
                            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                icon={<ScheduleIcon />}
                                label={`Expires: ${formatDate(result.data.expiresAt)}`}
                                size="small"
                                sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                              />
                              <Chip
                                label={`Code: ${result.data.shortCode}`}
                                size="small"
                                sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ) : (
                    <Alert severity="error">
                      <Typography variant="body1">
                        <strong>Failed to shorten:</strong> {result.originalUrl}
                      </Typography>
                      <Typography variant="body2">
                        {result.error}
                      </Typography>
                    </Alert>
                  )}
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default URLShortenerPage;
