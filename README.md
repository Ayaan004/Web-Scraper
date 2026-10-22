# Professional Web Scraper

A powerful, modern web scraping application with a beautiful UI built using Flask (Python) backend and vanilla JavaScript frontend.

## Features

- 🚀 **Multiple Scraping Modes**
  - Complete scrape (all data)
  - Text content only
  - Links extraction
  - Images extraction
  - Headings structure
  - Meta tags
  - Tables
  - Custom CSS selector

- 🎨 **Modern UI/UX**
  - Dark theme with gradient accents
  - Responsive design
  - Real-time statistics
  - Tabbed results view
  - Loading animations

- 📊 **Data Export**
  - Download as JSON
  - Copy to clipboard
  - Beautiful formatted display

- 🔧 **Built With**
  - Backend: Python, Flask, BeautifulSoup4, Requests
  - Frontend: HTML5, CSS3, JavaScript (ES6+)
  - Design: Modern CSS with gradients and animations

## Installation

1. **Clone or navigate to the project directory:**
   ```powershell
   cd "c:\Users\ayaan\Desktop\development\PRACTICE\Web Scraper"
   ```

2. **Install Python dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

## Usage

1. **Start the Flask server:**
   ```powershell
   python app.py
   ```

2. **Open your browser and visit:**
   ```
   http://localhost:5000
   ```

3. **Start scraping:**
   - Enter a URL (e.g., `https://example.com`)
   - Select scraping type
   - Click "Scrape Now"
   - View results in organized tabs
   - Download or copy data as needed

## API Endpoints

### Health Check
```
GET /api/health
```

### Scrape Endpoint
```
POST /api/scrape
Content-Type: application/json

{
  "url": "https://example.com",
  "type": "all",  // all, text, links, images, headings, meta, tables, custom
  "selector": ".class-name"  // optional, for custom type
}
```

## Project Structure

```
Web Scraper/
├── app.py                  # Flask backend server
├── requirements.txt        # Python dependencies
├── README.md              # Documentation
└── static/
    ├── index.html         # Main HTML page
    ├── style.css          # Styling
    └── script.js          # Frontend logic
```

## Features Breakdown

### Backend (Python/Flask)
- **WebScraper Class**: Handles all scraping operations
- **BeautifulSoup4**: HTML/XML parsing
- **Requests**: HTTP requests with proper headers
- **Flask-CORS**: Cross-origin resource sharing
- Error handling and validation

### Frontend
- **Responsive Design**: Works on all devices
- **Tab Navigation**: Organized data display
- **Real-time Stats**: Visual metrics
- **Export Functions**: JSON download and clipboard copy
- **Loading States**: User feedback during operations

## Supported Data Extraction

1. **Meta Tags**: Title, description, keywords, OG tags
2. **Headings**: H1-H6 hierarchy
3. **Links**: Internal and external with labels
4. **Images**: Sources, alt text, titles
5. **Tables**: Complete table structures
6. **Text Content**: Clean, extracted text
7. **Custom Selectors**: Target specific elements

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Security Notes

- User-Agent headers included for compatibility
- CORS enabled for development
- Input validation on backend
- URL sanitization

## Performance

- Fast scraping with optimized requests
- Efficient HTML parsing with lxml
- Minimal memory footprint
- Async-ready architecture

## Troubleshooting

**Server won't start:**
- Ensure Python 3.7+ is installed
- Check if port 5000 is available
- Verify all dependencies are installed

**Scraping fails:**
- Check if URL is accessible
- Some sites may block scrapers
- Verify internet connection

**UI not loading:**
- Clear browser cache
- Check browser console for errors
- Ensure Flask server is running

## Future Enhancements

- [ ] Rate limiting and queue system
- [ ] Scheduled scraping
- [ ] Database integration
- [ ] User authentication
- [ ] CSV export
- [ ] Proxy support
- [ ] JavaScript rendering support

## License

This project is provided as-is for educational and development purposes.

## Support

For issues or questions, please check the documentation or create an issue in the project repository.

---

**Built with ❤️ using Python, Flask & BeautifulSoup**
