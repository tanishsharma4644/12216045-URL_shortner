import logger from './loggingMiddleware.js';

class URLDataManager {
  constructor() {
    this.urls = this.loadUrls();
    this.initializeStorage();
    logger.info('URLDataManager initialized', { urlCount: this.urls.length });
  }

  initializeStorage() {
    if (typeof Storage === 'undefined') {
      logger.error('localStorage not supported');
      throw new Error('localStorage not supported');
    }
  }

  loadUrls() {
    try {
      const stored = localStorage.getItem('urlShortener_urls');
      const urls = stored ? JSON.parse(stored) : [];
      logger.debug('URLs loaded from storage', { count: urls.length });
      return urls;
    } catch (error) {
      logger.error('Failed to load URLs from storage', error);
      return [];
    }
  }

  saveUrls() {
    try {
      localStorage.setItem('urlShortener_urls', JSON.stringify(this.urls));
      logger.debug('URLs saved to storage', { count: this.urls.length });
    } catch (error) {
      logger.error('Failed to save URLs to storage', error);
    }
  }

  generateShortCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  isValidShortCode(shortCode) {
    const regex = /^[a-zA-Z0-9]{3,20}$/;
    return regex.test(shortCode);
  }

  isShortCodeUnique(shortCode) {
    return !this.urls.some(url => url.shortCode === shortCode);
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  createShortUrl(originalUrl, customShortCode = null, validityMinutes = 30) {
    logger.logUserAction('Create Short URL Attempt', {
      originalUrl,
      customShortCode,
      validityMinutes
    });

    if (!this.isValidUrl(originalUrl)) {
      const error = new Error('Invalid URL format');
      logger.logError(error, 'URL validation');
      throw error;
    }

    let shortCode = customShortCode;
    if (customShortCode) {
      if (!this.isValidShortCode(customShortCode)) {
        const error = new Error('Invalid shortcode format. Must be alphanumeric, 3-20 characters.');
        logger.logError(error, 'Shortcode validation');
        throw error;
      }
      if (!this.isShortCodeUnique(customShortCode)) {
        const error = new Error('Shortcode already exists. Please choose a different one.');
        logger.logError(error, 'Shortcode uniqueness check');
        throw error;
      }
    } else {
      do {
        shortCode = this.generateShortCode();
      } while (!this.isShortCodeUnique(shortCode));
    }

    const now = new Date();
    const expiryDate = new Date(now.getTime() + validityMinutes * 60000);
    
    const urlData = {
      id: Date.now() + Math.random(),
      originalUrl,
      shortCode,
      shortUrl: `http://localhost:3000/${shortCode}`,
      createdAt: now.toISOString(),
      expiresAt: expiryDate.toISOString(),
      validityMinutes,
      clicks: [],
      totalClicks: 0,
      isActive: true
    };

    this.urls.push(urlData);
    this.saveUrls();

    logger.logUserAction('Short URL Created Successfully', {
      shortCode,
      originalUrl,
      expiresAt: urlData.expiresAt
    });

    return urlData;
  }

  getUrlByShortCode(shortCode) {
    const url = this.urls.find(url => url.shortCode === shortCode);
    if (url) {
      logger.debug('URL found by shortcode', { shortCode, originalUrl: url.originalUrl });
    } else {
      logger.warn('URL not found by shortcode', { shortCode });
    }
    return url;
  }

  isUrlExpired(urlData) {
    return new Date() > new Date(urlData.expiresAt);
  }

  recordClick(shortCode, clickData = {}) {
    const url = this.getUrlByShortCode(shortCode);
    if (!url) {
      logger.warn('Attempted to record click for non-existent URL', { shortCode });
      return null;
    }

    if (this.isUrlExpired(url)) {
      logger.warn('Attempted to access expired URL', { shortCode, expiresAt: url.expiresAt });
      throw new Error('This short URL has expired');
    }

    const click = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'Direct',
      location: this.getSimulatedLocation(),
      ...clickData
    };

    url.clicks.push(click);
    url.totalClicks = url.clicks.length;
    this.saveUrls();

    logger.logUserAction('URL Click Recorded', {
      shortCode,
      originalUrl: url.originalUrl,
      clickId: click.id,
      totalClicks: url.totalClicks
    });

    return { url, click };
  }

  getSimulatedLocation() {
    const locations = [
      'New York, NY, USA',
      'Los Angeles, CA, USA',
      'Chicago, IL, USA',
      'Houston, TX, USA',
      'Phoenix, AZ, USA',
      'Philadelphia, PA, USA',
      'San Antonio, TX, USA',
      'San Diego, CA, USA',
      'Dallas, TX, USA',
      'San Jose, CA, USA'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  getAllUrls() {
    return this.urls.map(url => ({
      ...url,
      isExpired: this.isUrlExpired(url)
    }));
  }

  getActiveUrls() {
    return this.urls.filter(url => !this.isUrlExpired(url));
  }

  deleteUrl(shortCode) {
    const index = this.urls.findIndex(url => url.shortCode === shortCode);
    if (index !== -1) {
      const deletedUrl = this.urls.splice(index, 1)[0];
      this.saveUrls();
      logger.logUserAction('URL Deleted', { shortCode, originalUrl: deletedUrl.originalUrl });
      return true;
    }
    logger.warn('Attempted to delete non-existent URL', { shortCode });
    return false;
  }

  clearAllUrls() {
    const count = this.urls.length;
    this.urls = [];
    this.saveUrls();
    logger.logUserAction('All URLs Cleared', { deletedCount: count });
  }

  getStatistics() {
    const stats = {
      totalUrls: this.urls.length,
      activeUrls: this.getActiveUrls().length,
      expiredUrls: this.urls.filter(url => this.isUrlExpired(url)).length,
      totalClicks: this.urls.reduce((sum, url) => sum + url.totalClicks, 0),
      averageClicksPerUrl: this.urls.length > 0 ? 
        this.urls.reduce((sum, url) => sum + url.totalClicks, 0) / this.urls.length : 0
    };

    logger.debug('Statistics calculated', stats);
    return stats;
  }
}

const urlDataManager = new URLDataManager();

export default urlDataManager;
