from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin, urlparse
import time

app = Flask(__name__, static_folder='static')
CORS(app)

class WebScraper:
    def __init__(self, url, timeout=10):
        self.url = url
        self.timeout = timeout
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    def fetch_page(self):
        """Fetch the webpage content"""
        try:
            response = requests.get(self.url, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            return response.text, response.status_code
        except requests.exceptions.RequestException as e:
            raise Exception(f"Error fetching URL: {str(e)}")
    
    def extract_text(self, html):
        """Extract all text content from the page"""
        soup = BeautifulSoup(html, 'lxml')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text
    
    def extract_links(self, html):
        """Extract all links from the page"""
        soup = BeautifulSoup(html, 'lxml')
        links = []
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            absolute_url = urljoin(self.url, href)
            links.append({
                'text': link.get_text(strip=True),
                'url': absolute_url,
                'is_external': urlparse(absolute_url).netloc != urlparse(self.url).netloc
            })
        
        return links
    
    def extract_images(self, html):
        """Extract all images from the page"""
        soup = BeautifulSoup(html, 'lxml')
        images = []
        
        for img in soup.find_all('img'):
            src = img.get('src', '')
            if src:
                absolute_url = urljoin(self.url, src)
                images.append({
                    'src': absolute_url,
                    'alt': img.get('alt', ''),
                    'title': img.get('title', '')
                })
        
        return images
    
    def extract_headings(self, html):
        """Extract all headings from the page"""
        soup = BeautifulSoup(html, 'lxml')
        headings = []
        
        for i in range(1, 7):
            for heading in soup.find_all(f'h{i}'):
                headings.append({
                    'level': i,
                    'text': heading.get_text(strip=True)
                })
        
        return headings
    
    def extract_meta_tags(self, html):
        """Extract meta tags from the page"""
        soup = BeautifulSoup(html, 'lxml')
        meta_tags = {}
        
        # Title
        title = soup.find('title')
        if title:
            meta_tags['title'] = title.get_text(strip=True)
        
        # Meta tags
        for meta in soup.find_all('meta'):
            name = meta.get('name') or meta.get('property')
            content = meta.get('content')
            if name and content:
                meta_tags[name] = content
        
        return meta_tags
    
    def extract_tables(self, html):
        """Extract tables from the page"""
        soup = BeautifulSoup(html, 'lxml')
        tables = []
        
        for table in soup.find_all('table'):
            table_data = []
            rows = table.find_all('tr')
            
            for row in rows:
                cols = row.find_all(['td', 'th'])
                cols_data = [col.get_text(strip=True) for col in cols]
                if cols_data:
                    table_data.append(cols_data)
            
            if table_data:
                tables.append(table_data)
        
        return tables
    
    def extract_custom_selector(self, html, selector):
        """Extract content using custom CSS selector"""
        soup = BeautifulSoup(html, 'lxml')
        results = []
        
        elements = soup.select(selector)
        for element in elements:
            results.append({
                'text': element.get_text(strip=True),
                'html': str(element)
            })
        
        return results
    
    def scrape_all(self, custom_selector=None):
        """Perform complete scraping"""
        start_time = time.time()
        
        html, status_code = self.fetch_page()
        
        data = {
            'url': self.url,
            'status_code': status_code,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'scrape_time': 0,
            'meta_tags': self.extract_meta_tags(html),
            'headings': self.extract_headings(html),
            'links': self.extract_links(html),
            'images': self.extract_images(html),
            'tables': self.extract_tables(html),
            'text_content': self.extract_text(html)
        }
        
        if custom_selector:
            data['custom_selector_results'] = self.extract_custom_selector(html, custom_selector)
        
        data['scrape_time'] = round(time.time() - start_time, 2)
        
        return data

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/api/scrape', methods=['POST'])
def scrape():
    try:
        data = request.get_json()
        url = data.get('url')
        scrape_type = data.get('type', 'all')
        custom_selector = data.get('selector', None)
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Validate URL
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        scraper = WebScraper(url)
        html, status_code = scraper.fetch_page()
        
        result = {
            'url': url,
            'status_code': status_code,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        if scrape_type == 'all' or scrape_type == 'complete':
            result = scraper.scrape_all(custom_selector)
        elif scrape_type == 'text':
            result['text_content'] = scraper.extract_text(html)
        elif scrape_type == 'links':
            result['links'] = scraper.extract_links(html)
        elif scrape_type == 'images':
            result['images'] = scraper.extract_images(html)
        elif scrape_type == 'headings':
            result['headings'] = scraper.extract_headings(html)
        elif scrape_type == 'meta':
            result['meta_tags'] = scraper.extract_meta_tags(html)
        elif scrape_type == 'tables':
            result['tables'] = scraper.extract_tables(html)
        elif scrape_type == 'custom' and custom_selector:
            result['custom_selector_results'] = scraper.extract_custom_selector(html, custom_selector)
        
        return jsonify({'success': True, 'data': result})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Web Scraper API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
