const body=document.body;
const menuButton=document.getElementById('menuButton');
const nav=document.getElementById('nav');
menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}));

const CONSENT_KEY='portfolio-consent-v1';
const THEME_KEY='portfolio-theme';
const themeToggle=document.getElementById('themeToggle');
const consentBanner=document.getElementById('consentBanner');
const privacyDialog=document.getElementById('privacyDialog');

function getConsent(){
  try{return localStorage.getItem(CONSENT_KEY);}catch{return null;}
}
function setConsent(choice){
  try{localStorage.setItem(CONSENT_KEY,choice);}catch{}
  if(choice!=='preferences'){
    try{localStorage.removeItem(THEME_KEY);}catch{}
  }else{
    try{localStorage.setItem(THEME_KEY,body.classList.contains('dark')?'dark':'light');}catch{}
  }
  consentBanner.hidden=true;
  if(privacyDialog.open)privacyDialog.close();
}
const initialConsent=getConsent();
if(initialConsent==='preferences'){
  try{if(localStorage.getItem(THEME_KEY)==='dark')body.classList.add('dark');}catch{}
}else if(!initialConsent){
  consentBanner.hidden=false;
}

themeToggle.addEventListener('click',()=>{
  body.classList.toggle('dark');
  if(getConsent()==='preferences'){
    try{localStorage.setItem(THEME_KEY,body.classList.contains('dark')?'dark':'light');}catch{}
  }
});

document.getElementById('essentialOnly').addEventListener('click',()=>setConsent('essential'));
document.getElementById('acceptPreferences').addEventListener('click',()=>setConsent('preferences'));
document.getElementById('consentDetails').addEventListener('click',()=>privacyDialog.showModal());
document.getElementById('privacyOpen').addEventListener('click',()=>privacyDialog.showModal());
document.querySelector('.privacy-close').addEventListener('click',()=>privacyDialog.close());
privacyDialog.querySelectorAll('[data-consent-choice]').forEach(button=>button.addEventListener('click',()=>setConsent(button.dataset.consentChoice)));
privacyDialog.addEventListener('click',event=>{if(event.target===privacyDialog)privacyDialog.close();});

function updateClock(){document.getElementById('localTime').textContent=new Intl.DateTimeFormat('en-IE',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Europe/Dublin'}).format(new Date());}
updateClock();setInterval(updateClock,30000);


function formatUptime(totalSeconds){
  const seconds=Math.max(0,Number(totalSeconds)||0);
  const days=Math.floor(seconds/86400);
  const hours=Math.floor((seconds%86400)/3600);
  const minutes=Math.floor((seconds%3600)/60);
  if(days>0)return `${days}d ${hours}h`;
  if(hours>0)return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
function setStatusText(id,text){
  const element=document.getElementById(id);
  if(element)element.textContent=text;
}
async function updatePublicStatus(){
  try{
    const response=await fetch('https://api.james-daly.ie/api/status',{headers:{'Accept':'application/json'},cache:'no-store'});
    if(!response.ok)throw new Error();
    const status=await response.json();
    setStatusText('overallStatus',status.ok?'ONLINE':'DEGRADED');
    setStatusText('portfolioStatus','Online');
    setStatusText('edgeStatus','Reachable');
    setStatusText('apiStatus',status.contact_api?'Healthy':'Unavailable');
    setStatusText('turnstileStatus',status.turnstile?'Enabled':'Disabled');
    setStatusText('backendUptime',formatUptime(status.uptime_seconds));
    setStatusText('statusVersion',`Portfolio ${status.version||'current'}`);
  }catch{
    setStatusText('overallStatus','DEGRADED');
    setStatusText('portfolioStatus','Online');
    setStatusText('edgeStatus','Reachable');
    setStatusText('apiStatus','Unavailable');
    setStatusText('turnstileStatus','Unknown');
    setStatusText('backendUptime','—');
  }
}
updatePublicStatus();
setInterval(updatePublicStatus,60000);


document.querySelectorAll('.node').forEach(node=>node.addEventListener('click',()=>{document.querySelectorAll('.node').forEach(n=>n.classList.remove('active'));node.classList.add('active');document.getElementById('nodeDetail').textContent=node.dataset.node;}));

const filters=document.querySelectorAll('.filter');
const cards=document.querySelectorAll('.project-card');
filters.forEach(filter=>filter.addEventListener('click',()=>{filters.forEach(f=>f.classList.remove('active'));filter.classList.add('active');const value=filter.dataset.filter;cards.forEach(card=>card.classList.toggle('hidden',value!=='all'&&!card.dataset.category.includes(value)));}));

const modal=document.getElementById('projectModal');
function openProject(card){document.getElementById('modalTitle').textContent=card.dataset.title;document.getElementById('modalDescription').textContent=card.dataset.description;const tech=document.getElementById('modalTech');tech.innerHTML='';card.dataset.tech.split('|').forEach(item=>{const span=document.createElement('span');span.textContent=item;tech.appendChild(span);});modal.showModal();}
cards.forEach(card=>{card.addEventListener('click',()=>openProject(card));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openProject(card);}});});
document.querySelector('.modal-close').addEventListener('click',()=>modal.close());
modal.addEventListener('click',e=>{if(e.target===modal)modal.close();});

const skillData={
 networking:{title:'Networking',text:'Working knowledge developed through implementation work and practical troubleshooting across professional and home environments.',tags:['Cisco IOS / IOS-XR','TCP/IP','VLANs','BGP','OSPF','Commissioning','Backhaul planning']},
 linux:{title:'Linux & systems',text:'Building and maintaining the operating-system layer beneath self-hosted services, with an emphasis on repeatability and fault isolation.',tags:['Ubuntu','RHEL','systemd','SSH','Docker','Storage','Service management']},
 security:{title:'Secure access',text:'Reducing unnecessary exposure while keeping services reachable through controlled public and private access paths.',tags:['Cloudflare Tunnel','Tailscale','DNS','TLS','Firewalls','Identity-based access']},
 web:{title:'Web infrastructure',text:'Creating and hosting lightweight interfaces while understanding the routing, HTTP and origin services beneath them.',tags:['Nginx','Reverse proxy','HTML','CSS','JavaScript','HTTP','Responsive design']}
};
const skillDetail=document.getElementById('skillDetail');
document.querySelectorAll('.skill-card').forEach(card=>card.addEventListener('click',()=>{document.querySelectorAll('.skill-card').forEach(c=>c.classList.remove('active'));card.classList.add('active');const data=skillData[card.dataset.skill];skillDetail.innerHTML=`<div><span>Current focus</span><h3>${data.title}</h3><p>${data.text}</p></div><div class="skill-tags">${data.tags.map(t=>`<span>${t}</span>`).join('')}</div>`;}));


const contactForm=document.getElementById('contactForm');
const contactStatus=document.getElementById('contactStatus');
const contactSubmit=document.getElementById('contactSubmit');

if(contactForm){
  contactForm.addEventListener('submit',async(event)=>{
    event.preventDefault();
    contactStatus.className='contact-status';
    if(!contactForm.reportValidity()) return;

    const formData=new FormData(contactForm);
    const payload=Object.fromEntries(formData.entries());
    payload.turnstile_token=contactForm.querySelector('[name="cf-turnstile-response"]')?.value||'';

    if(!payload.turnstile_token){
      contactStatus.textContent='Please complete the security verification before sending.';
      contactStatus.classList.add('error');
      return;
    }

    contactSubmit.disabled=true;
    contactSubmit.textContent='Sending…';
    contactStatus.textContent='Passing your message to the homelab API…';

    try{
      const response=await fetch('https://api.james-daly.ie/api/contact',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      });
      const result=await response.json().catch(()=>({}));
      if(!response.ok){
         let message='The message could not be sent.';
         if(typeof result.detail==='string'){
           message=result.detail;
         }else if(Array.isArray(result.detail)){
           message=result.detail.map(item=>item.msg||'Invalid form value.').join(' ');
         }
         throw new Error(message);
       }
      contactForm.reset();
      window.turnstile?.reset();
      contactStatus.textContent='Message delivered. Thanks — I’ll get back to you shortly.';
      contactStatus.classList.add('success');
    }catch(error){
      window.turnstile?.reset();
      contactStatus.textContent=error.message||'Something went wrong. Please try again later.';
      contactStatus.classList.add('error');
    }finally{
      contactSubmit.disabled=false;
      contactSubmit.innerHTML='Send enquiry <span>↗</span>';
    }
  });
}
