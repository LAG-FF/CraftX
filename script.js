(function(){
    'use strict';
    
    let z1='map',z2=[],z3=[],z4={},z5='',z6=false,z7=null,z8=1;
    const z9=8;
    const z10=document.getElementById('content');
    const z11=document.getElementById('detailView');
    const z12=document.getElementById('detailContent');
    const z13=document.querySelectorAll('.tab');
    const z14=document.querySelector('.search-btn');
    const z15=document.querySelector('.search-input');
    const z16=document.querySelector('.search-icon');
    const z17=document.querySelector('.brand');
    const z18=document.querySelector('.pagination');
    const z19=document.createElement('div');
    const z20=document.querySelector('.footer');
    
    z19.className='scroll-helper';
    z19.innerHTML='<img class="scroll-helper-icon" src="https://storage.craftx.site/f1/Scrollup.png" alt="Scroll">';
    z19.addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'})});
    document.body.appendChild(z19);
    
    z20.addEventListener('click',()=>{
        window.open('https://www.google.com','_self');
    });
    
    const z21='https://cors-anywhere.herokuapp.com/';
    const z22='https://craftx-json-stored.vercel.app/view/';
    
    document.addEventListener('DOMContentLoaded',()=>{
        window.addEventListener('scroll',()=>{
            clearTimeout(z7);
            z7=setTimeout(z23,50);
        });
        
        z15.addEventListener('keyup',(e)=>{
            if(e.key==='Enter'){
                z5=e.target.value;
                z8=1;
                z24();
            }
        });
        
        z14.addEventListener('click',()=>{
            z6=!z6;
            if(z6){
                z15.classList.add('active');
                z16.src='https://storage.craftx.site/f1/Close.png';
                z15.focus();
            }else{
                z15.classList.remove('active');
                z16.src='https://storage.craftx.site/f1/Search.png';
                z5='';
                z15.value='';
                z8=1;
                z24();
            }
        });
        
        z17.addEventListener('click',()=>{
            window.open('https://www.google.com','_self');
        });
        
        z25('team').then(data=>{
            z3=data.team||[];
            z25('map');
        }).catch(error=>{
            z10.innerHTML='<div class="error">Failed to load data.</div>';
        });
        
        z13.forEach(tab=>{
            tab.addEventListener('click',()=>{
                z13.forEach(t=>t.classList.remove('active'));
                tab.classList.add('active');
                const type=tab.getAttribute('data-type');
                z1=type;
                z8=1;
                if(z4[type]){
                    z2=z4[type];
                    z24();
                }else{
                    z25(type);
                }
            });
        });
        
        z11.addEventListener('click',(e)=>{
            if(e.target===z11){
                z26();
            }
        });
        
        document.addEventListener('contextmenu',(e)=>{
            e.preventDefault();
            return false;
        });
        
        document.addEventListener('keydown',(e)=>{
            if(e.ctrlKey&&(e.key==='u'||e.key==='U'||e.key==='s'||e.key==='S')){
                e.preventDefault();
                return false;
            }
        });
        
        Object.defineProperty(document,'designMode',{set:function(){},get:function(){return'off'}});
        Object.defineProperty(document,'contentEditable',{set:function(){},get:function(){return'false'}});
    });
    
    function z23(){
        const z27=window.pageYOffset;
        if(z27>300){
            z19.classList.add('visible');
        }else{
            z19.classList.remove('visible');
        }
        const z28=document.querySelectorAll('.card:not(.visible)');
        const z29=window.innerHeight/1.2;
        for(let i=0;i<z28.length;i++){
            const z30=z28[i];
            const z31=z30.getBoundingClientRect().top;
            if(z31<z29){
                z30.classList.add('visible');
            }
        }
    }
    
    async function z25(type){
        try{
            try{
                const z32=await fetch(z22+type,{headers:{'X-View-Key':'keyview'}});
                if(z32.ok)return await z32.json();
            }catch(z33){}
            const z34=await fetch(z21+z22+type,{headers:{'X-View-Key':'keyview','X-Requested-With':'XMLHttpRequest'}});
            if(!z34.ok)throw new Error(`HTTP error! status: ${z34.status}`);
            return await z34.json();
        }catch(z35){
            return{[type]:[]};
        }
    }
    
    async function z36(type){
        z10.innerHTML='<div class="loading">Loading '+type+' content...</div>';
        try{
            const data=await z25(type);
            z4[type]=data[type]||[];
            z2=z4[type];
            z24();
        }catch(z35){
            z10.innerHTML='<div class="error">Failed to load '+type+' content.</div>';
        }
    }
    
    function z24(){
        let z37=z2.filter(item=>item.visible!==false);
        if(z5){
            const z38=z5.toLowerCase();
            z37=z37.filter(item=>{
                const z39=z3.find(z40=>z40.id===item.creator_id)||{};
                const z41=z39.name||'';
                return(item.name&&item.name.toLowerCase().includes(z38))||
                      (item.description&&item.description.toLowerCase().includes(z38))||
                      (z41.toLowerCase().includes(z38));
            });
        }
        const z42=Math.ceil(z37.length/z9);
        const z43=(z8-1)*z9;
        const z44=z43+z9;
        const z45=z37.slice(z43,z44);
        if(z45.length===0){
            z10.innerHTML='<div class="empty">No '+z1+' content found'+(z5?' for "'+z5+'"':'')+'.</div>';
            z46(z37.length,z42);
            return;
        }
        z47(z45,z1);
        z46(z37.length,z42);
    }
    
    function z46(z48,z49){
        z18.innerHTML='';
        if(z49<=1)return;
        if(z8>1){
            const z50=document.createElement('div');
            z50.className='page';
            z50.textContent='←';
            z50.addEventListener('click',()=>{
                z8--;
                z24();
                window.scrollTo({top:0,behavior:'smooth'});
            });
            z18.appendChild(z50);
        }
        for(let i=1;i<=z49;i++){
            const z51=document.createElement('div');
            z51.className='page '+(i===z8?'active':'');
            z51.textContent=i;
            z51.addEventListener('click',()=>{
                z8=i;
                z24();
                window.scrollTo({top:0,behavior:'smooth'});
            });
            z18.appendChild(z51);
        }
        if(z8<z49){
            const z52=document.createElement('div');
            z52.className='page';
            z52.textContent='→';
            z52.addEventListener('click',()=>{
                z8++;
                z24();
                window.scrollTo({top:0,behavior:'smooth'});
            });
            z18.appendChild(z52);
        }
    }
    
    function z47(z53,type){
        z10.innerHTML='';
        z53.forEach((item,index)=>{
            const z39=z3.find(z40=>z40.id===item.creator_id)||{};
            const z54=document.createElement('div');
            z54.className='card';
            z54.style.transitionDelay=index*0.03+'s';
            z54.addEventListener('click',()=>{
                z55(item,type);
            });
            z54.innerHTML=`
                <div class="card-header">
                    <div class="user-badge" onclick="event.stopPropagation(); z56('${z39.url||''}')">
                        <img class="user-icon" src="${z39.img_url||'https://storage.craftx.site/f1/nouser.png'}" alt="${z39.name||'Unknown'}">
                        <span class="user-name">${z39.name||'Unknown'}</span>
                    </div>
                    <button class="share-btn" onclick="event.stopPropagation(); z57('${type}', ${item.id})">
                        <img class="share-icon" src="https://storage.craftx.site/f1/Share.png" alt="Share">
                    </button>
                </div>
                <div class="preview">
                    <img class="preview-img" src="${item.img_url}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div style="display: ${item.img_url?'none':'flex'}; align-items: center; justify-content: center;">IMAGE NOT AVAILABLE</div>
                </div>
                <div class="title">${item.name}</div>
            `;
            z10.appendChild(z54);
        });
        setTimeout(z23,50);
    }
    
    window.z56=function(z58){
        if(z58&&z58.trim()!==''){
            let z59=z58;
            if(!z58.startsWith('http://')&&!z58.startsWith('https://')){
                z59='https://'+z58;
            }
            window.open(z59,'_self');
        }
    };
    
    function z55(item,type){
        const z39=z3.find(z40=>z40.id===item.creator_id)||{};
        let z60='';
        let z61='';
        let z62='';
        if(type==='map'||type==='asset'){
            if(item.map_code_ind&&item.map_code_ind.length>0){
                z61='<div class="code-section-title">'+(type==='map'?'Map Code For India Server':'Asset Code For India Server')+'</div>';
                item.map_code_ind.forEach(z63=>{
                    z61+=`
                        <button class="action-btn code-btn" onclick="z64('${z63.code}')">
                            <img src="https://storage.craftx.site/f1/Copy.png" alt="Copy"> ${z63.name}
                        </button>
                    `;
                });
            }
            if(item.map_code_other&&item.map_code_other.length>0){
                z62='<div class="code-section-title">'+(type==='map'?'Map Code For Other Server':'Asset Code For Other Server')+'</div>';
                item.map_code_other.forEach(z63=>{
                    z62+=`
                        <button class="action-btn code-btn" onclick="z64('${z63.code}')">
                            <img src="https://storage.craftx.site/f1/Copy.png" alt="Copy"> ${z63.name}
                        </button>
                    `;
                });
            }
            z60=z61+z62;
        }else if(item.button_links&&item.button_links.length>0){
            const z65=type==='tool'?'tool-btn':'other-btn';
            item.button_links.forEach(z66=>{
                if(z66.type==='download file'){
                    z60+=`
                        <button class="action-btn link-btn ${z65}" onclick="window.open('${z66.url}', '_self')">
                            <img src="https://storage.craftx.site/f1/Download.png" alt="Download"> ${z66.label}
                        </button>
                    `;
                }else{
                    z60+=`
                        <button class="action-btn link-btn ${z65}" onclick="window.open('${z66.url}', '_blank')">
                            <img src="https://storage.craftx.site/f1/Link.png" alt="Link"> ${z66.label}
                        </button>
                    `;
                }
            });
        }
        if(item.youtube_url){
            z60=`
                <button class="action-btn youtube-btn" onclick="window.open('${item.youtube_url}', '_blank')">
                    <img src="https://storage.craftx.site/f1/YouTube.png" alt="YouTube"> Watch on YouTube
                </button>
            `+z60;
        }
        z12.innerHTML=`
            <div class="detail-header">
                <div class="user-badge" onclick="z56('${z39.url||''}')">
                    <img class="user-icon" src="${z39.img_url||'https://storage.craftx.site/f1/nouser.png'}" alt="${z39.name||'Unknown'}">
                    <span class="user-name">${z39.name||'Unknown'}</span>
                </div>
                <div class="detail-header-buttons">
                    <button class="detail-share-btn" onclick="z57('${type}', ${item.id})">
                        <img class="detail-share-icon" src="https://storage.craftx.site/f1/Share.png" alt="Share">
                    </button>
                    <button class="close-detail-btn" onclick="z26()">
                        <img class="close-btn-icon" src="https://storage.craftx.site/f1/Close.png" alt="Close">
                    </button>
                </div>
            </div>
            <img class="detail-image" src="${item.img_url}" alt="${item.name}" onerror="this.style.display='none'">
            <div class="detail-title">${item.name}</div>
            <div class="detail-description">${item.description||'No description available'}</div>
            <div class="action-buttons">
                ${z60||'<p>No actions available</p>'}
            </div>
        `;
        z11.style.display='block';
        document.body.style.overflow='hidden';
        setTimeout(()=>{
            z12.classList.add('open');
        },10);
    }
    
    function z26(){
        z12.classList.remove('open');
        setTimeout(()=>{
            z11.style.display='none';
            document.body.style.overflow='auto';
        },200);
    }
    
    window.z64=function(z67){
        navigator.clipboard.writeText(z67).then(()=>{
            alert('Copied to clipboard: '+z67);
        }).catch(z35=>{
            console.error('Failed to copy: ',z35);
        });
    };
    
    window.z57=function(type,id){
        const z68=`${window.location.origin}${window.location.pathname}#${type}/${id}`;
        if(navigator.share){
            navigator.share({
                title:'Check out this CraftX content',
                url:z68
            }).catch(z35=>{});
        }else{
            navigator.clipboard.writeText(z68).then(()=>{
                alert('Link copied to clipboard!');
            }).catch(z35=>{
                console.error('Failed to copy: ',z35);
                prompt('Copy this link:',z68);
            });
        }
    };
    
    window.addEventListener('hashchange',()=>{
        const z69=window.location.hash.substring(1);
        const z70=z69.split('/');
        if(z70.length===2){
            const type=z70[0];
            const id=parseInt(z70[1]);
            const z71=document.querySelector(`.tab[data-type="${type}"]`);
            if(z71){
                z71.click();
                setTimeout(()=>{
                    const z72=z2.find(item=>item.id===id);
                    if(z72&&z72.visible!==false){
                        z55(z72,type);
                    }
                },500);
            }
        }
    });
    
    window.addEventListener('load',()=>{
        const z69=window.location.hash.substring(1);
        const z70=z69.split('/');
        if(z70.length===2){
            const type=z70[0];
            const id=parseInt(z70[1]);
            z25('team').then(data=>{
                z3=data.team||[];
                const z71=document.querySelector(`.tab[data-type="${type}"]`);
                if(z71){
                    z71.click();
                    setTimeout(()=>{
                        z25(type).then(data=>{
                            z2=data[type]||[];
                            const z72=z2.find(item=>item.id===id);
                            if(z72&&z72.visible!==false){
                                z55(z72,type);
                            }
                        });
                    },500);
                }
            });
        }
    });
})();
