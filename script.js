// Global variables
let currentType = 'map';
let currentData = [];
let teamData = [];
let allData = {};
let searchQuery = '';
let isSearchActive = false;
let scrollTimeout = null;
let currentPage = 1;
const itemsPerPage = 8;

// DOM elements
const contentEl = document.getElementById('content');
const detailViewEl = document.getElementById('detailView');
const detailContentEl = document.getElementById('detailContent');
const tabs = document.querySelectorAll('.tab');
const searchBtn = document.querySelector('.search-btn');
const searchInput = document.querySelector('.search-input');
const searchIcon = document.querySelector('.search-icon');
const brand = document.querySelector('.brand');
const scrollHelper = document.createElement('div');
const paginationEl = document.querySelector('.pagination');
const contentContainer = document.createElement('div');

// Create content container
contentContainer.className = 'content-container';
contentEl.parentNode.insertBefore(contentContainer, contentEl);
contentContainer.appendChild(contentEl);

// Create footer
const footer = document.createElement('div');
footer.className = 'footer';
footer.innerHTML = 'A PRODUCT OF LAG FF';
contentContainer.parentNode.appendChild(footer);

// Create scroll helper element
scrollHelper.className = 'scroll-helper';
scrollHelper.innerHTML = '<img class="scroll-helper-icon" src="https://storage.craftx.site/f1/Scrollup.png" alt="Scroll">';
scrollHelper.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.body.appendChild(scrollHelper);

// CORS proxy server
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const API_BASE = 'https://craftx-json-stored.vercel.app/view/';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Set up scroll event listener with debounce
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScroll, 50);
    });
    
    // Set up search functionality
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchQuery = e.target.value;
            currentPage = 1;
            filterContent();
        }
    });

    searchBtn.addEventListener('click', () => {
        isSearchActive = !isSearchActive;
        
        if (isSearchActive) {
            searchInput.classList.add('active');
            searchIcon.src = 'https://storage.craftx.site/f1/Close.png';
            searchInput.focus();
        } else {
            searchInput.classList.remove('active');
            searchIcon.src = 'https://storage.craftx.site/f1/Search.png';
            searchQuery = '';
            searchInput.value = '';
            currentPage = 1;
            filterContent();
        }
    });

    // Make CraftX title clickable
    brand.addEventListener('click', () => {
        window.open('https://www.google.com', '_self');
    });

    // Load team data first (for creator names)
    fetchData('team').then(data => {
        teamData = data.team || [];
        // Load initial content (maps)
        loadContent('map');
    }).catch(error => {
        console.error('Error loading team data:', error);
        contentEl.innerHTML = `<div class="error">Failed to load data. Please try again later.</div>`;
    });

    // Set up tab click events
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const type = tab.getAttribute('data-type');
            currentType = type;
            currentPage = 1;
            if (allData[type]) {
                currentData = allData[type];
                filterContent();
            } else {
                loadContent(type);
            }
        });
    });

    // Close detail view when clicking outside
    detailViewEl.addEventListener('click', (e) => {
        if (e.target === detailViewEl) {
            closeDetailView();
        }
    });
});

// Handle scroll events with debounce
function handleScroll() {
    const currentScrollPosition = window.pageYOffset;
    
    // Show/hide scroll helper
    if (currentScrollPosition > 300) {
        scrollHelper.classList.add('visible');
    } else {
        scrollHelper.classList.remove('visible');
    }
    
    // Animate cards on scroll with optimized performance
    const cards = document.querySelectorAll('.card:not(.visible)');
    const screenPosition = window.innerHeight / 1.2;
    
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const cardPosition = card.getBoundingClientRect().top;
        
        if (cardPosition < screenPosition) {
            card.classList.add('visible');
        }
    }
}

// Fetch data from API with CORS proxy
async function fetchData(type) {
    try {
        // Try direct fetch first
        try {
            const response = await fetch(API_BASE + type, {
                headers: {
                    'X-View-Key': 'keyview'
                }
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (directError) {
            console.log('Direct fetch failed, trying with CORS proxy:', directError);
        }

        // If direct fetch fails, use CORS proxy
        const response = await fetch(CORS_PROXY + API_BASE + type, {
            headers: {
                'X-View-Key': 'keyview',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        
        // Return empty data if API fails
        return {[type]: []};
    }
}

// Load content based on type
async function loadContent(type) {
    contentEl.innerHTML = `<div class="loading">Loading ${type} content...</div>`;

    try {
        const data = await fetchData(type);
        allData[type] = data[type] || [];
        currentData = allData[type];
        
        filterContent();
    } catch (error) {
        contentEl.innerHTML = `<div class="error">Failed to load ${type} content. Please try again later.</div>`;
    }
}

function filterContent() {
    let visibleItems = currentData.filter(item => item.visible !== false);
    
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        visibleItems = visibleItems.filter(item => {
            const creator = teamData.find(teamMember => teamMember.id === item.creator_id) || {};
            const creatorName = creator.name || '';
            
            return (item.name && item.name.toLowerCase().includes(query)) ||
                   (item.description && item.description.toLowerCase().includes(query)) ||
                   (creatorName.toLowerCase().includes(query));
        });
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(visibleItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = visibleItems.slice(startIndex, endIndex);
    
    if (paginatedItems.length === 0) {
        contentEl.innerHTML = `<div class="empty">No ${currentType} content found${searchQuery ? ' for "' + searchQuery + '"' : ''}.</div>`;
        renderPagination(visibleItems.length, totalPages);
        return;
    }

    renderItems(paginatedItems, currentType);
    renderPagination(visibleItems.length, totalPages);
}

// Render pagination
function renderPagination(totalItems, totalPages) {
    paginationEl.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    if (currentPage > 1) {
        const prevBtn = document.createElement('div');
        prevBtn.className = 'page';
        prevBtn.textContent = '←';
        prevBtn.addEventListener('click', () => {
            currentPage--;
            filterContent();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationEl.appendChild(prevBtn);
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('div');
        pageBtn.className = `page ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            filterContent();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationEl.appendChild(pageBtn);
    }
    
    // Next button
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('div');
        nextBtn.className = 'page';
        nextBtn.textContent = '→';
        nextBtn.addEventListener('click', () => {
            currentPage++;
            filterContent();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationEl.appendChild(nextBtn);
    }
}

// Render items to the content area
function renderItems(items, type) {
    contentEl.innerHTML = '';
    
    items.forEach((item, index) => {
        const creator = teamData.find(teamMember => teamMember.id === item.creator_id) || {};
        
        const card = document.createElement('div');
        card.className = 'card';
        card.style.transitionDelay = `${index * 0.03}s`;
        card.addEventListener('click', () => {
            showDetailView(item, type);
        });
        
        card.innerHTML = `
            <div class="card-header">
                <div class="user-badge" onclick="event.stopPropagation(); openUserUrl('${creator.url || ''}')">
                    <img class="user-icon" src="${creator.img_url || 'https://storage.craftx.site/f1/nouser.png'}" alt="${creator.name || 'Unknown'}">
                    <span class="user-name">${creator.name || 'Unknown'}</span>
                </div>
                <button class="share-btn" onclick="event.stopPropagation(); shareItem('${type}', ${item.id})">
                    <img class="share-icon" src="https://storage.craftx.site/f1/Share.png" alt="Share">
                </button>
            </div>
            
            <div class="preview">
                <img class="preview-img" src="${item.img_url}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: ${item.img_url ? 'none' : 'flex'}; align-items: center; justify-content: center;">IMAGE NOT AVAILABLE</div>
            </div>
            
            <div class="title">${item.name}</div>
        `;
        
        contentEl.appendChild(card);
    });
    
    // Trigger scroll event to animate cards
    setTimeout(() => {
        handleScroll();
    }, 50);
}

// Open user URL
function openUserUrl(url) {
    if (url && url.trim() !== '') {
        // Add https:// if not present
        let fullUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            fullUrl = 'https://' + url;
        }
        window.open(fullUrl, '_self');
    }
}

// Show detail view for an item
function showDetailView(item, type) {
    const creator = teamData.find(teamMember => teamMember.id === item.creator_id) || {};
    
    let buttonsHTML = '';
    let indiaCodesHTML = '';
    let otherCodesHTML = '';
    
    if (type === 'map' || type === 'asset') {
        // Map and asset codes for India
        if (item.map_code_ind && item.map_code_ind.length > 0) {
            indiaCodesHTML = `<div class="code-section-title">${type === 'map' ? 'Map Code For India Server' : 'Asset Code For India Server'}</div>`;
            item.map_code_ind.forEach(code => {
                indiaCodesHTML += `
                    <button class="action-btn code-btn" onclick="copyToClipboard('${code.code}')">
                        <img src="https://storage.craftx.site/f1/Copy.png" alt="Copy"> ${code.name}
                    </button>
                `;
            });
        }
        
        // Map and asset codes for Other regions
        if (item.map_code_other && item.map_code_other.length > 0) {
            otherCodesHTML = `<div class="code-section-title">${type === 'map' ? 'Map Code For Other Server' : 'Asset Code For Other Server'}</div>`;
            item.map_code_other.forEach(code => {
                otherCodesHTML += `
                    <button class="action-btn code-btn" onclick="copyToClipboard('${code.code}')">
                        <img src="https://storage.craftx.site/f1/Copy.png" alt="Copy"> ${code.name}
                    </button>
                `;
            });
        }
        
        buttonsHTML = indiaCodesHTML + otherCodesHTML;
    } else if (item.button_links && item.button_links.length > 0) {
        // Other button links - use dark color for tools and others
        const buttonClass = type === 'tool' ? 'tool-btn' : 'other-btn';
        item.button_links.forEach(link => {
            if (link.type === 'download file') {
                buttonsHTML += `
                    <button class="action-btn link-btn ${buttonClass}" onclick="window.open('${link.url}', '_self')">
                        <img src="https://storage.craftx.site/f1/Download.png" alt="Download"> ${link.label}
                    </button>
                `;
            } else {
                buttonsHTML += `
                    <button class="action-btn link-btn ${buttonClass}" onclick="window.open('${link.url}', '_blank')">
                        <img src="https://storage.craftx.site/f1/Link.png" alt="Link"> ${link.label}
                    </button>
                `;
            }
        });
    }
    
    // YouTube button if available
    if (item.youtube_url) {
        buttonsHTML = `
            <button class="action-btn youtube-btn" onclick="window.open('${item.youtube_url}', '_blank')">
                <img src="https://storage.craftx.site/f1/YouTube.png" alt="YouTube"> Watch on YouTube
            </button>
        ` + buttonsHTML;
    }
    
    detailContentEl.innerHTML = `
        <div class="detail-header">
            <div class="user-badge" onclick="openUserUrl('${creator.url || ''}')">
                <img class="user-icon" src="${creator.img_url || 'https://storage.craftx.site/f1/nouser.png'}" alt="${creator.name || 'Unknown'}">
                <span class="user-name">${creator.name || 'Unknown'}</span>
            </div>
            <div class="detail-header-buttons">
                <button class="detail-share-btn" onclick="shareItem('${type}', ${item.id})">
                    <img class="detail-share-icon" src="https://storage.craftx.site/f1/Share.png" alt="Share">
                </button>
                <button class="close-detail-btn" onclick="closeDetailView()">
                    <img class="close-btn-icon" src="https://storage.craftx.site/f1/Close.png" alt="Close">
                </button>
            </div>
        </div>
        <img class="detail-image" src="${item.img_url}" alt="${item.name}" onerror="this.style.display='none'">
        <div class="detail-title">${item.name}</div>
        <div class="detail-description">${item.description || 'No description available'}</div>
        <div class="action-buttons">
            ${buttonsHTML || '<p>No actions available</p>'}
        </div>
    `;
    
    detailViewEl.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Add opening animation
    setTimeout(() => {
        detailContentEl.classList.add('open');
    }, 10);
}

// Close detail view
function closeDetailView() {
    detailContentEl.classList.remove('open');
    setTimeout(() => {
        detailViewEl.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 200);
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard: ' + text);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Share item URL
function shareItem(type, id) {
    const url = `${window.location.origin}${window.location.pathname}#${type}/${id}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Check out this CraftX content',
            url: url
        }).catch(console.error);
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            prompt('Copy this link:', url);
        });
    }
}

// Handle URL hash changes for direct links
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    const parts = hash.split('/');
    
    if (parts.length === 2) {
        const type = parts[0];
        const id = parseInt(parts[1]);
        
        // Find the tab with this type and click it
        const tab = document.querySelector(`.tab[data-type="${type}"]`);
        if (tab) {
            tab.click();
            
            // After content loads, find the item and show its detail
            setTimeout(() => {
                const item = currentData.find(item => item.id === id);
                if (item && item.visible !== false) {
                    showDetailView(item, type);
                }
            }, 500);
        }
    }
});

// Check for hash on page load
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    const parts = hash.split('/');
    
    if (parts.length === 2) {
        const type = parts[0];
        const id = parseInt(parts[1]);
        
        // Load the team data first, then the content type
        fetchData('team').then(data => {
            teamData = data.team || [];
            
            // Find the tab with this type and click it
            const tab = document.querySelector(`.tab[data-type="${type}"]`);
            if (tab) {
                tab.click();
                
                // Load the specific content type
                fetchData(type).then(data => {
                    currentData = data[type] || [];
                    
                    // Find the item and show its detail
                    const item = currentData.find(item => item.id === id);
                    if (item && item.visible !== false) {
                        showDetailView(item, type);
                    }
                });
            }
        });
    }
});
