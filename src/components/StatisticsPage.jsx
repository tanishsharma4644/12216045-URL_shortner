import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  ExpandMore as ExpandMoreIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon,
  Mouse as MouseIcon,
  Public as PublicIcon,
  AccessTime as AccessTimeIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import logger from '../utils/loggingMiddleware.js';
import urlDataManager from '../utils/urlDataManager.js';

const StatisticsPage = () => {
  const [urls, setUrls] = useState([]);
  const [stats, setStats] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, url: null });

  useEffect(() => {
    loadData();
    logger.logUserAction('Statistics Page Loaded');
  }, []);

  const loadData = () => {
    const allUrls = urlDataManager.getAllUrls();
    const statistics = urlDataManager.getStatistics();
    setUrls(allUrls);
    setStats(statistics);
    logger.info('Statistics data loaded', { urlCount: allUrls.length, stats: statistics });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.logUserAction('Short URL Copied from Statistics', { url: text });
    } catch (error) {
      logger.logError(error, 'Copy to clipboard');
    }
  };

  const handleDelete = (url) => {
    setDeleteDialog({ open: true, url });
  };

  const confirmDelete = () => {
    if (deleteDialog.url) {
      urlDataManager.deleteUrl(deleteDialog.url.shortCode);
      loadData(); // Refresh data
      logger.logUserAction('URL Deleted from Statistics', { shortCode: deleteDialog.url.shortCode });
    }
    setDeleteDialog({ open: false, url: null });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusChip = (url) => {
    if (url.isExpired) {
      return <Chip label="Expired" color="error" size="small" icon={<WarningIcon />} />;
    }
    return <Chip label="Active" color="success" size="small" icon={<ScheduleIcon />} />;
  };

  const OverviewCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total URLs
                </Typography>
                <Typography variant="h4">
                  {stats.totalUrls || 0}
                </Typography>
              </Box>
              <LinkIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Active URLs
                </Typography>
                <Typography variant="h4">
                  {stats.activeUrls || 0}
                </Typography>
              </Box>
              <ScheduleIcon color="success" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Clicks
                </Typography>
                <Typography variant="h4">
                  {stats.totalClicks || 0}
                </Typography>
              </Box>
              <MouseIcon color="info" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Avg. Clicks/URL
                </Typography>
                <Typography variant="h4">
                  {stats.averageClicksPerUrl ? stats.averageClicksPerUrl.toFixed(1) : '0.0'}
                </Typography>
              </Box>
              <AnalyticsIcon color="secondary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const URLDetailsAccordion = ({ url, index }) => (
    <Accordion key={url.id}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ wordBreak: 'break-all' }}>
              {url.shortUrl}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {url.originalUrl.length > 50 ? url.originalUrl.substring(0, 50) + '...' : url.originalUrl}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusChip(url)}
            <Chip label={`${url.totalClicks} clicks`} size="small" />
          </Box>
        </Box>
      </AccordionSummary>
      
      <AccordionDetails>
        <Grid container spacing={3}>
          {/* URL Information */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  URL Information
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Original URL:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ wordBreak: 'break-all', flexGrow: 1 }}
                    >
                      {url.originalUrl}
                    </Typography>
                    <Tooltip title="Copy original URL">
                      <IconButton size="small" onClick={() => copyToClipboard(url.originalUrl)}>
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Short URL:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {url.shortUrl}
                    </Typography>
                    <Tooltip title="Copy short URL">
                      <IconButton size="small" onClick={() => copyToClipboard(url.shortUrl)}>
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Short Code:
                  </Typography>
                  <Typography variant="body1">{url.shortCode}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Created:
                  </Typography>
                  <Typography variant="body1">{formatDate(url.createdAt)}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Expires:
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color={url.isExpired ? 'error' : 'inherit'}
                  >
                    {formatDate(url.expiresAt)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Validity Period:
                  </Typography>
                  <Typography variant="body1">{url.validityMinutes} minutes</Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(url)}
                    size="small"
                  >
                    Delete URL
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Click Statistics */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Click Statistics
                </Typography>
                
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Typography variant="h3" color="primary">
                    {url.totalClicks}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Clicks
                  </Typography>
                </Box>

                {url.clicks.length > 0 ? (
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTimeIcon fontSize="small" />
                              Timestamp
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PublicIcon fontSize="small" />
                              Location
                            </Box>
                          </TableCell>
                          <TableCell>Source</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {url.clicks
                          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                          .map((click) => (
                          <TableRow key={click.id}>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(click.timestamp)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {click.location}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {click.referrer === 'Direct' ? 'Direct' : 
                                 click.referrer.length > 20 ? 
                                 click.referrer.substring(0, 20) + '...' : 
                                 click.referrer}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">
                    No clicks recorded yet for this URL.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AnalyticsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            URL Statistics
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          View detailed analytics .
        </Typography>

        <OverviewCards />

        {urls.length === 0 ? (
          <Alert severity="info">
            No URLs have been shortened yet. 
          </Alert>
        ) : (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              URL Details ({urls.length} total)
            </Typography>
            
            {urls
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((url, index) => (
                <URLDetailsAccordion key={url.id} url={url} index={index} />
              ))}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, url: null })}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this short URL?
            </Typography>
            {deleteDialog.url && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Short URL:
                </Typography>
                <Typography variant="body1">
                  {deleteDialog.url.shortUrl}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Original URL:
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                  {deleteDialog.url.originalUrl}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, url: null })}>
              Cancel
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default StatisticsPage;
