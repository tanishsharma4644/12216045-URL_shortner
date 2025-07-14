# URL Shortener Web Application

A React-based URL shortener application with comprehensive analytics and client-side routing. Built with Material-UI and featuring extensive logging middleware.

## Features

### Core Functionality
- **Batch URL Shortening**: Shorten up to 5 URLs simultaneously
- **Custom Shortcodes**: Optional user-defined shortcodes with validation
- **Configurable Validity**: Set custom expiry periods (default: 30 minutes)
- **Client-Side Routing**: Handles redirects entirely in the React application
- **Real-time Analytics**: Comprehensive click tracking and statistics

### Analytics & Tracking
- **Click Statistics**: Track total clicks per URL
- **Geographical Location**: Simulated location tracking for demo purposes
- **Source Tracking**: Record referrer information for each click
- **Timestamp Logging**: Detailed click timestamps
- **URL Management**: View, manage, and delete shortened URLs

### Technical Features
- **Extensive Logging**: Custom logging middleware for all user actions and system events
- **Data Persistence**: Local storage for URL data and statistics
- **Material-UI Design**: Clean, responsive interface following Material Design principles
- **Error Handling**: Comprehensive client-side error handling with user-friendly messages
- **Form Validation**: Real-time validation for URLs, shortcodes, and validity periods

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:3000` as required.

3. **Build for Production**
   ```bash
   npm run build
   ```

## Application Structure

### Pages
1. **URL Shortener Page** (`/`)
   - Bulk URL shortening interface
   - Form validation and error handling
   - Results display with copy functionality

2. **Statistics Page** (`/statistics`)
   - Overview dashboard with key metrics
   - Detailed URL analytics
   - Individual click data and management

3. **Redirect Handler** (`/:shortCode`)
   - Automatic redirection with countdown
   - Expired URL handling
   - Click tracking and analytics

### Core Components

- **Navigation**: Main app navigation with route highlighting
- **URLShortenerPage**: Main shortening interface
- **StatisticsPage**: Analytics and URL management
- **RedirectHandler**: Handles shortcode redirects
- **ErrorBoundary**: Global error handling

### Utilities

- **LoggingMiddleware**: Comprehensive logging system
- **URLDataManager**: Data management and storage operations

## Usage

### Shortening URLs

1. Navigate to the main page
2. Enter up to 5 URLs in the provided forms
3. Optionally set custom shortcodes and validity periods
4. Click "Shorten URLs" to generate short links
5. Copy and share the generated short URLs

### Viewing Statistics

1. Navigate to the Statistics page
2. View overview metrics (total URLs, clicks, etc.)
3. Expand individual URL cards to see detailed analytics
4. View click history with timestamps and locations
5. Manage URLs (delete unwanted entries)

### Using Short URLs

1. Click on any generated short URL
2. View the redirect page with countdown
3. Automatically redirect to the original URL
4. Handle expired URLs with appropriate messaging

## Technical Requirements Met

- ✅ **React Application**: Built with React 19 and Vite
- ✅ **Material-UI Styling**: Comprehensive Material-UI implementation
- ✅ **Localhost:3000**: Configured to run on the required port
- ✅ **Extensive Logging**: Custom logging middleware for all operations
- ✅ **No Authentication**: Pre-authorized access as specified
- ✅ **Unique Shortcodes**: Automatic uniqueness validation
- ✅ **30-minute Default**: Configurable validity with proper defaults
- ✅ **Custom Shortcodes**: Optional user-defined codes with validation
- ✅ **Client-side Redirects**: Full React routing for redirections
- ✅ **Error Handling**: Comprehensive error management
- ✅ **User Experience**: Clean, intuitive interface design

## Data Storage

The application uses localStorage for data persistence:
- URL mappings and metadata
- Click analytics and statistics
- User session tracking
- Application logs

## Error Handling

- **URL Validation**: Real-time validation of URL formats
- **Shortcode Validation**: Alphanumeric, length, and uniqueness checks
- **Expiry Handling**: Automatic detection and handling of expired URLs
- **Network Errors**: Graceful handling of storage and processing errors
- **User Feedback**: Clear error messages and recovery suggestions

## Logging

The application includes comprehensive logging:
- User actions and navigation
- URL creation and access attempts
- Error tracking with stack traces
- Performance and usage analytics
- Session management

## Browser Compatibility

- Modern browsers with ES6+ support
- localStorage support required
- Clipboard API for copy functionality
- CSS Grid and Flexbox support

## Development

### Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

### File Structure
```
src/
├── components/          # React components
├── utils/              # Utility functions and middleware
├── App.jsx             # Main application component
└── main.jsx            # Application entry point
```
