// Global variables
let currentType = 'map';
let currentData = [];
let teamData = [];
let filteredData = [];
let isSearching = false;

// DOM elements
const contentEl = document.getElementById('content');
const detailViewEl = document.getElementById('detailView');
const detailContentEl = document.getElementById('detailContent');
const tabs = document.querySelectorAll('.tab');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// CORS proxy server
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const API_BASE = 'https://craftx-json-stored.vercel.app/view/';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
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
            isSearching = false;
            searchInput.value = '';
            searchInput.classList.remove('active');
            searchBtn.classList.remove('active');
            loadContent(type);
        });
    });

    // Close detail view when clicking outside
    detailViewEl.addEventListener('click', (e) => {
        if (e.target === detailViewEl) {
            closeDetailView();
        }
    });

    // Search functionality
    searchBtn.addEventListener('click', () => {
        searchInput.classList.toggle('active');
        searchBtn.classList.toggle('active');
        
        if (!searchInput.classList.contains('active')) {
            // Reset search
            isSearching = false;
            searchInput.value = '';
            renderItems(currentData.filter(item => item.visible !== false), currentType);
        } else {
            searchInput.focus();
        }
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm.length === 0) {
            isSearching = false;
            renderItems(currentData.filter(item => item.visible !== false), currentType);
            return;
        }
        
        isSearching = true;
        filteredData = currentData.filter(item => {
            if (item.visible === false) return false;
            
            const nameMatch = item.name && item.name.toLowerCase().includes(searchTerm);
            const descMatch = item.description && item.description.toLowerCase().includes(searchTerm);
            
            return nameMatch || descMatch;
        });
        
        renderItems(filteredData, currentType);
    });

    // Handle escape key to close search
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchInput.classList.contains('active')) {
            searchInput.classList.remove('active');
            searchBtn.classList.remove('active');
            isSearching = false;
            searchInput.value = '';
            renderItems(currentData.filter(item => item.visible !== false), currentType);
        }
    });
});

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
        
        // Fallback to mock data if API fails
        return getMockData(type);
    }
}

// Mock data for fallback
function getMockData(type) {
    const mockData = {
        team: {
            team: [
                {
                    id: 0,
                    visible: true,
                    name: "LAG FF",
                    description: "A short bio about the team member",
                    img_url: "https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/LAG-FF.jpg",
                    social_links: [
                        {
                            platform: "YouTube",
                            url: "https://youtube.com/@lag_ff_yt"
                        }
                    ]
                }
            ]
        },
        map: {
            map: [
                {
                    id: 0,
                    visible: true,
                    creator_id: 0,
                    name: "Sample Map",
                    description: "This is a sample map description",
                    img_url: "https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Test%20Banner.png",
                    youtube_url: "https://youtu.be/lJhnGCSPuVo",
                    map_code_ind: [
                        {
                            name: "India Standard Edition",
                            code: "IND-MAP-001"
                        }
                    ]
                }
            ]
        },
        asset: {
            asset: [
                {
                    id: 0,
                    visible: true,
                    creator_id: 0,
                    name: "Sample Asset",
                    description: "This is a sample asset description",
                    img_url: "https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Test%20Banner.png",
                    youtube_url: "https://youtu.be/lJhnGCSPuVo",
                    map_code_ind: [
                        {
                            name: "India Standard Edition",
                            code: "IND-ASSET-001"
                        }
                    ]
                }
            ]
        },
        tool: {
            tool: [
                {
                    id: 0,
                    visible: true,
                    creator_id: 0,
                    name: "Sample Tool",
                    description: "This is a sample tool description",
                    img_url: "https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Test%20Banner.png",
                    youtube_url: "https://youtu.be/lJhnGCSPuVo",
                    button_links: [
                        {
                            type: "download file",
                            label: "Download Tool",
                            url: "https://example.com/tool.zip"
                        }
                    ]
                }
            ]
        },
        other: {
            other: [
                {
                    id: 0,
                    visible: true,
                    creator_id: 0,
                    name: "Sample Other",
                    description: "This is a sample other content description",
                    img_url: "https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Test%20Banner.png",
                    youtube_url: "https://youtu.be/lJhnGCSPuVo",
                    button_links: [
                        {
                            type: "link",
                            label: "Visit Website",
                            url: "https://example.com"
                        }
                    ]
                }
            ]
        }
    };
    
    return mockData[type] || {[type]: []};
}

// Load content based on type
async function loadContent(type) {
    contentEl.innerHTML = `<div class="loading">Loading ${type} content...</div>`;

    try {
        const data = await fetchData(type);
        currentData = data[type] || [];
        
        // Filter out invisible items
        const visibleItems = currentData.filter(item => item.visible !== false);
        
        if (visibleItems.length === 0) {
            contentEl.innerHTML = `<div class="empty">No ${type} content available at the moment.</div>`;
            return;
        }

        // Render items
        renderItems(visibleItems, type);
    } catch (error) {
        contentEl.innerHTML = `<div class="error">Failed to load ${type} content. Please try again later.</div>`;
    }
}

// Render items to the content area
function renderItems(items, type) {
    contentEl.innerHTML = '';
    
    if (items.length === 0) {
        contentEl.innerHTML = `<div class="empty">No results found for your search.</div>`;
        return;
    }
    
    items.forEach(item => {
        const creator = teamData.find(teamMember => teamMember.id === item.creator_id) || {};
        
        const card = document.createElement('div');
        card.className = 'card';
        card.addEventListener('click', () => {
            showDetailView(item, type);
        });
        
        card.innerHTML = `
            <div class="card-header">
                <div class="user-badge">
                    <img class="user-icon" src="${creator.img_url || 'https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/nouser.png'}" alt="${creator.name || 'Unknown'}">
                    <span class="user-name">${creator.name || 'Unknown'}</span>
                </div>
                <button class="share-btn" onclick="event.stopPropagation(); shareItem('${type}', ${item.id})">
                    <img class="share-icon" src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Share.png" alt="Share">
                </button>
            </div>
            
            <div class="preview">
                <img class="preview-img" src="${item.img_url}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: ${item.img_url ? 'none' : 'flex'}; align-items: center; justify-content: center;">IMAGE NOT AVAILABLE</div>
            </div>
            
            <div class="title">${item.name}</div>
            <div class="description">${item.description || 'No description available'}</div>
        `;
        
        contentEl.appendChild(card);
    });
}

// Show detail view for an item
function showDetailView(item, type) {
    const creator = teamData.find(teamMember => teamMember.id === item.creator_id) || {};
    
    let buttonsHTML = '';
    
    if (type === 'map' || type === 'asset') {
        // Map and asset codes
        if (item.map_code_ind && item.map_code_ind.length > 0) {
            item.map_code_ind.forEach(code => {
                buttonsHTML += `
                    <button class="action-btn code-btn" onclick="copyToClipboard('${code.code}')">
                        <img src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Copy.png" class="action-icon" alt="Copy"> 
                        ${code.name}: ${code.code}
                    </button>
                `;
            });
        }
        
        if (item.map_code_other && item.map_code_other.length > 0) {
            item.map_code_other.forEach(code => {
                buttonsHTML += `
                    <button class="action-btn code-btn" onclick="copyToClipboard('${code.code}')">
                        <img src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Copy.png" class="action-icon" alt="Copy"> 
                        ${code.name}: ${code.code}
                    </button>
                `;
            });
        }
    } else if (type === 'team') {
        // Team social links
        if (item.social_links && item.social_links.length > 0) {
            buttonsHTML += `<div class="team-social">`;
            item.social_links.forEach(link => {
                buttonsHTML += `
                    <a href="${link.url}" target="_blank" class="social-link">${link.platform}</a>
                `;
            });
            buttonsHTML += `</div>`;
        }
    } else if (item.button_links && item.button_links.length > 0) {
        // Other button links
        item.button_links.forEach(link => {
            if (link.type === 'download file') {
                buttonsHTML += `
                    <button class="action-btn download-btn" onclick="window.open('${link.url}', '_self')">
                        <img src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Download.png" class="action-icon" alt="Download"> 
                        ${link.label}
                    </button>
                `;
            } else {
                buttonsHTML += `
                    <button class="action-btn link-btn" onclick="window.open('${link.url}', '_blank')">
                        <img src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Link.png" class="action-icon" alt="Link"> 
                        ${link.label}
                    </button>
                `;
            }
        });
    }
    
    // YouTube button if available
    if (item.youtube_url) {
        buttonsHTML = `
            <button class="action-btn youtube-btn" onclick="window.open('${item.youtube_url}', '_blank')">
                <img src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/YouTube.png" class="action-icon" alt="YouTube"> 
                Watch on YouTube
            </button>
        ` + buttonsHTML;
    }
    
    detailContentEl.innerHTML = `
        <button class="close-btn" onclick="closeDetailView()">×</button>
        <img class="detail-image" src="${item.img_url}" alt="${item.name}" onerror="this.style.display='none'">
        <div class="detail-title">${item.name}</div>
        <div class="detail-description">${item.description || 'No description available'}</div>
        <div class="user-badge">
            <img class="user-icon" src="${creator.img_url || 'https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/nouser.png'}" alt="${creator.name || 'Unknown'}">
            <span class="user-name">Created by: ${creator.name || 'Unknown'}</span>
        </div>
        <div class="action-buttons">
            ${buttonsHTML || '<p>No actions available</p>'}
        </div>
        <div class="detail-share">
            <button class="detail-share-btn" onclick="shareItem('${type}', ${item.id})">
                <img class="share-icon" src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Share.png" alt="Share">
                Share
            </button>
        </div>
    `;
    
    detailViewEl.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close detail view
function closeDetailView() {
    detailViewEl.style.display = 'none';
    document.body.style.overflow = 'auto';
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
