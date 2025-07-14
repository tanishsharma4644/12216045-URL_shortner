import React from 'react';
import { Container, Paper, Typography, Button, Box, Alert } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import logger from '../utils/loggingMiddleware.js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    logger.logError(error, 'React Error Boundary');
    logger.error('Component stack trace', errorInfo.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom color="error.main">
                Something went wrong
              </Typography>
            </Box>

            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body1" gutterBottom>
                An unexpected error occurred in the application. This has been logged for investigation.
              </Typography>
              {this.state.error && (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                  {this.state.error.toString()}
                </Typography>
              )}
            </Alert>

            <Button
              variant="contained"
              onClick={this.handleReload}
              startIcon={<RefreshIcon />}
              size="large"
            >
              Reload Application
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              If the problem persists, please contact support.
            </Typography>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
