// Global variables
let scrapedData = null;
const API_BASE_URL = 'http://localhost:5000';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Form submission
    document.getElementById('scrapeForm').addEventListener('submit', handleScrape);
    
    // Scrape type change
    document.getElementById('scrapeType').addEventListener('change', handleScrapeTypeChange);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Navigation link highlighting on scroll
    setupNavigationHighlighting();
    
    // Check API health
    checkAPIHealth();
}

function setupNavigationHighlighting() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function highlightNavigation() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavigation);
    highlightNavigation(); // Call on load
}

async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        console.log('API Status:', data.message);
    } catch (error) {
        console.error('API is not responding. Make sure the Flask server is running.');
    }
}

function handleScrapeTypeChange(e) {
    const customSelectorGroup = document.getElementById('customSelectorGroup');
    if (e.target.value === 'custom') {
        customSelectorGroup.style.display = 'block';
    } else {
        customSelectorGroup.style.display = 'none';
    }
}

async function handleScrape(e) {
    e.preventDefault();
    
    const url = document.getElementById('url').value.trim();
    const scrapeType = document.getElementById('scrapeType').value;
    const customSelector = document.getElementById('customSelector').value.trim();
    
    if (!url) {
        showNotification('Please enter a URL', 'error');
        return;
    }
    
    // Show loading
    showLoading();
    hideResults();
    
    try {
        const payload = {
            url: url,
            type: scrapeType
        };
        
        if (scrapeType === 'custom' && customSelector) {
            payload.selector = customSelector;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (result.success) {
            scrapedData = result.data;
            displayResults(result.data);
            showNotification('Scraping completed successfully!', 'success');
        } else {
            showNotification(`Error: ${result.error}`, 'error');
        }
    } catch (error) {
        showNotification(`Failed to scrape: ${error.message}`, 'error');
        console.error('Scraping error:', error);
    } finally {
        hideLoading();
    }
}

function displayResults(data) {
    // Update stats
    updateStats(data);
    
    // Display data in tabs
    displayOverview(data);
    displayMetaTags(data.meta_tags);
    displayHeadings(data.headings);
    displayLinks(data.links);
    displayImages(data.images);
    displayTables(data.tables);
    displayTextContent(data.text_content);
    displayJSON(data);
    
    // Show results container
    showResults();
}

function updateStats(data) {
    document.getElementById('scrapeTime').textContent = `${data.scrape_time || 0}s`;
    document.getElementById('linksCount').textContent = data.links ? data.links.length : 0;
    document.getElementById('imagesCount').textContent = data.images ? data.images.length : 0;
    document.getElementById('headingsCount').textContent = data.headings ? data.headings.length : 0;
}

function displayOverview(data) {
    const overviewHTML = `
        <div class="overview-content">
            <h3>Scrape Summary</h3>
            <div class="meta-item">
                <span class="meta-key">URL:</span>
                <a href="${data.url}" target="_blank">${data.url}</a>
            </div>
            <div class="meta-item">
                <span class="meta-key">Status Code:</span>
                ${data.status_code}
            </div>
            <div class="meta-item">
                <span class="meta-key">Timestamp:</span>
                ${data.timestamp}
            </div>
            <div class="meta-item">
                <span class="meta-key">Title:</span>
                ${data.meta_tags?.title || 'N/A'}
            </div>
            ${data.custom_selector_results ? `
                <div class="meta-item">
                    <span class="meta-key">Custom Selector Results:</span>
                    ${data.custom_selector_results.length} elements found
                </div>
            ` : ''}
        </div>
    `;
    document.getElementById('overview').innerHTML = overviewHTML;
}

function displayMetaTags(metaTags) {
    if (!metaTags || Object.keys(metaTags).length === 0) {
        document.getElementById('meta').innerHTML = '<p>No meta tags found.</p>';
        return;
    }
    
    let html = '<h3>Meta Tags</h3>';
    for (const [key, value] of Object.entries(metaTags)) {
        html += `
            <div class="meta-item">
                <span class="meta-key">${escapeHtml(key)}:</span>
                ${escapeHtml(value)}
            </div>
        `;
    }
    document.getElementById('meta').innerHTML = html;
}

function displayHeadings(headings) {
    if (!headings || headings.length === 0) {
        document.getElementById('headings').innerHTML = '<p>No headings found.</p>';
        return;
    }
    
    let html = '<h3>Headings Structure</h3>';
    headings.forEach(heading => {
        html += `
            <div class="heading-item">
                <span class="heading-level">H${heading.level}</span>
                ${escapeHtml(heading.text)}
            </div>
        `;
    });
    document.getElementById('headings').innerHTML = html;
}

function displayLinks(links) {
    if (!links || links.length === 0) {
        document.getElementById('links').innerHTML = '<p>No links found.</p>';
        return;
    }
    
    let html = `<h3>Links (${links.length})</h3>`;
    links.forEach(link => {
        html += `
            <div class="link-item">
                <div>
                    <strong>${escapeHtml(link.text || 'No text')}</strong>
                    ${link.is_external ? '<span class="external-badge">External</span>' : ''}
                </div>
                <a href="${escapeHtml(link.url)}" target="_blank">${escapeHtml(link.url)}</a>
            </div>
        `;
    });
    document.getElementById('links').innerHTML = html;
}

function displayImages(images) {
    if (!images || images.length === 0) {
        document.getElementById('images').innerHTML = '<p>No images found.</p>';
        return;
    }
    
    let html = `<h3>Images (${images.length})</h3>`;
    images.forEach(image => {
        html += `
            <div class="image-item">
                <div><strong>Source:</strong> <a href="${escapeHtml(image.src)}" target="_blank">${escapeHtml(image.src)}</a></div>
                ${image.alt ? `<div><strong>Alt:</strong> ${escapeHtml(image.alt)}</div>` : ''}
                ${image.title ? `<div><strong>Title:</strong> ${escapeHtml(image.title)}</div>` : ''}
                <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" class="image-preview" onerror="this.style.display='none'">
            </div>
        `;
    });
    document.getElementById('images').innerHTML = html;
}

function displayTables(tables) {
    if (!tables || tables.length === 0) {
        document.getElementById('tables').innerHTML = '<p>No tables found.</p>';
        return;
    }
    
    let html = `<h3>Tables (${tables.length})</h3>`;
    tables.forEach((table, index) => {
        html += `<h4>Table ${index + 1}</h4><table class="data-table">`;
        table.forEach((row, rowIndex) => {
            html += '<tr>';
            row.forEach(cell => {
                const tag = rowIndex === 0 ? 'th' : 'td';
                html += `<${tag}>${escapeHtml(cell)}</${tag}>`;
            });
            html += '</tr>';
        });
        html += '</table>';
    });
    document.getElementById('tables').innerHTML = html;
}

function displayTextContent(text) {
    if (!text) {
        document.getElementById('text').innerHTML = '<p>No text content found.</p>';
        return;
    }
    
    const preview = text.substring(0, 5000);
    const html = `
        <h3>Text Content</h3>
        <div class="meta-item">
            <span class="meta-key">Length:</span>
            ${text.length} characters
        </div>
        <pre><code>${escapeHtml(preview)}${text.length > 5000 ? '\n... (truncated)' : ''}</code></pre>
    `;
    document.getElementById('text').innerHTML = html;
}

function displayJSON(data) {
    const html = `
        <h3>Raw JSON Data</h3>
        <pre><code>${escapeHtml(JSON.stringify(data, null, 2))}</code></pre>
    `;
    document.getElementById('json').innerHTML = html;
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
}

function downloadJSON() {
    if (!scrapedData) return;
    
    const dataStr = JSON.stringify(scrapedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scraped-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('JSON downloaded successfully!', 'success');
}

function copyToClipboard() {
    if (!scrapedData) return;
    
    const dataStr = JSON.stringify(scrapedData, null, 2);
    navigator.clipboard.writeText(dataStr).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
        showNotification('Failed to copy to clipboard', 'error');
    });
}

function clearResults() {
    scrapedData = null;
    hideResults();
    document.getElementById('scrapeForm').reset();
    showNotification('Results cleared', 'success');
}

function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

function showResults() {
    document.getElementById('resultsContainer').style.display = 'block';
}

function hideResults() {
    document.getElementById('resultsContainer').style.display = 'none';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
