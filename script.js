let currentType = 'map';
let currentData = [];
let allData = {};
let searchQuery = '';
let isSearchActive = false;

const contentEl = document.getElementById('content');
const detailViewEl = document.getElementById('detailView');
const detailContentEl = document.getElementById('detailContent');
const tabs = document.querySelectorAll('.tab');
const searchBtn = document.querySelector('.search-btn');
const searchInput = document.querySelector('.search-input');
const searchIcon = document.querySelector('.search-icon');

const API_BASE = 'https://craftx-json-stored.vercel.app/view/';

searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchQuery = e.target.value;
        filterContent();
    }
});

searchBtn.addEventListener('click', () => {
    isSearchActive = !isSearchActive;
    
    if (isSearchActive) {
        searchInput.classList.add('active');
        searchIcon.src = 'https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Close.png';
        searchInput.focus();
    } else {
        searchInput.classList.remove('active');
        searchIcon.src = 'https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Search.png';
        searchQuery = '';
        searchInput.value = '';
        filterContent();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadContent('map');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const type = tab.getAttribute('data-type');
            currentType = type;
            if (allData[type]) {
                currentData = allData[type];
                filterContent();
            } else {
                loadContent(type);
            }
        });
    });

    detailViewEl.addEventListener('click', (e) => {
        if (e.target === detailViewEl) {
            closeDetailView();
        }
    });
});

async function fetchData(type) {
    try {
        const response = await fetch(API_BASE + type, {
            headers: {
                'X-View-Key': 'keyview'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
        console.error('Error fetching data:', error);
        
        // Try alternative API endpoint format
        try {
            const response = await fetch(API_BASE, {
                headers: {
                    'X-View-Key': 'keyview',
                    'X-Data-Type': type
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (secondError) {
            console.error('Second attempt failed:', secondError);
        }
        
        return {[type]: []};
    }
}

async function loadContent(type) {
    contentEl.innerHTML = `<div class="loading">Loading ${type} content...</div>`;

    try {
        const data = await fetchData(type);
        allData[type] = data[type] || data || [];
        currentData = allData[type];
        filterContent();
    } catch (error) {
        console.error('Error loading content:', error);
        contentEl.innerHTML = `<div class="error">Failed to load ${type} content. Please try again later.</div>`;
    }
}

function filterContent() {
    let visibleItems = currentData.filter(item => item && (item.visible === undefined || item.visible !== false));
    
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        visibleItems = visibleItems.filter(item => 
            item && (
                (item.name && item.name.toLowerCase().includes(query)) ||
                (item.description && item.description.toLowerCase().includes(query))
            )
        );
    }
    
    if (visibleItems.length === 0) {
        contentEl.innerHTML = `<div class="empty">No ${currentType} content found${searchQuery ? ' for "' + searchQuery + '"' : ''}.</div>`;
        return;
    }

    renderItems(visibleItems, currentType);
}

function renderItems(items, type) {
    contentEl.innerHTML = '';
    
    items.forEach(item => {
        if (!item) return;
        
        const card = document.createElement('div');
        card.className = 'card';
        card.addEventListener('click', () => {
            showDetailView(item, type);
        });
        
        card.innerHTML = `
            <div class="card-header">
                <div class="user-badge">
                    <img class="user-icon" src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/nouser.png" alt="Unknown">
                    <span class="user-name">Unknown</span>
                </div>
                <button class="share-btn" onclick="event.stopPropagation(); shareItem('${type}', ${item.id || 0})">
                    <img class="share-icon" src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Share.png" alt="Share">
                </button>
            </div>
            
            <div class="preview">
                <img class="preview-img" src="${item.img_url || ''}" alt="${item.name || 'No name'}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: ${item.img_url ? 'none' : 'flex'}; align-items: center; justify-content: center;">IMAGE NOT AVAILABLE</div>
            </div>
            
            <div class="title">${item.name || 'Untitled'}</div>
            <div class="description">${item.description || 'No description available'}</div>
        `;
        
        contentEl.appendChild(card);
    });
}

function showDetailView(item, type) {
    let buttonsHTML = '';
    
    if (type === 'map' || type === 'asset') {
        if (item.map_code_ind && item.map_code_ind.length > 0) {
            item.map_code_ind.forEach(code => {
                buttonsHTML += `
                    <button class="action-btn code-btn" onclick="copyToClipboard('${code.code}')">
                        <img src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Copy.png" alt="Copy"> ${code.name}: ${code.code}
                    </button>
                `;
            });
        }
        
        if (item.map_code_other && item.map_code_other.length > 0) {
            item.map_code_other.forEach(code => {
                buttonsHTML += `
                    <button class="action-btn code-btn" onclick="copyToClipboard('${code.code}')">
                        <img src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Copy.png" alt="Copy"> ${code.name}: ${code.code}
                    </button>
                `;
            });
        }
    } else if (item.button_links && item.button_links.length > 0) {
        item.button_links.forEach(link => {
            if (link.type === 'download file') {
                buttonsHTML += `
                    <button class="action-btn link-btn" onclick="window.open('${link.url}', '_self')">
                        <img src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Download.png" alt="Download"> ${link.label}
                    </button>
                `;
            } else {
                buttonsHTML += `
                    <button class="action-btn link-btn" onclick="window.open('${link.url}', '_blank')">
                        <img src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Link.png" alt="Link"> ${link.label}
                    </button>
                `;
            }
        });
    }
    
    if (item.youtube_url) {
        buttonsHTML = `
            <button class="action-btn youtube-btn" onclick="window.open('${item.youtube_url}', '_blank')">
                <img src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/YouTube.png" alt="YouTube"> Watch on YouTube
            </button>
        ` + buttonsHTML;
    }
    
    detailContentEl.innerHTML = `
        <button class="close-btn" onclick="closeDetailView()">×</button>
        <div class="detail-header">
            <div class="user-badge">
                <img class="user-icon" src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/nouser.png" alt="Unknown">
                <span class="user-name">Created by: Unknown</span>
            </div>
            <button class="share-btn" onclick="shareItem('${type}', ${item.id || 0})">
                <img class="share-icon" src="https://tfmuzuipuajtjzrjdkjt.supabase.co/storage/v1/object/public/craftxv1/Share.png" alt="Share">
            </button>
        </div>
        <img class="detail-image" src="${item.img_url || ''}" alt="${item.name || 'No name'}" onerror="this.style.display='none'">
        <div class="detail-title">${item.name || 'Untitled'}</div>
        <div class="detail-description">${item.description || 'No description available'}</div>
        <div class="action-buttons">
            ${buttonsHTML || '<p>No actions available</p>'}
        </div>
    `;
    
    detailViewEl.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeDetailView() {
    detailViewEl.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard: ' + text);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function shareItem(type, id) {
    const url = `${window.location.origin}${window.location.pathname}#${type}/${id}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Check out this CraftX content',
            url: url
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            prompt('Copy this link:', url);
        });
    }
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    const parts = hash.split('/');
    
    if (parts.length === 2) {
        const type = parts[0];
        const id = parseInt(parts[1]);
        
        const tab = document.querySelector(`.tab[data-type="${type}"]`);
        if (tab) {
            tab.click();
            
            setTimeout(() => {
                const item = currentData.find(item => item && item.id === id);
                if (item && (item.visible === undefined || item.visible !== false)) {
                    showDetailView(item, type);
                }
            }, 500);
        }
    }
});

window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    const parts = hash.split('/');
    
    if (parts.length === 2) {
        const type = parts[0];
        const id = parseInt(parts[1]);
        
        const tab = document.querySelector(`.tab[data-type="${type}"]`);
        if (tab) {
            tab.click();
            
            setTimeout(() => {
                fetchData(type).then(data => {
                    currentData = data[type] || data || [];
                    
                    const item = currentData.find(item => item && item.id === id);
                    if (item && (item.visible === undefined || item.visible !== false)) {
                        showDetailView(item, type);
                    }
                });
            }, 500);
        }
    }
});
