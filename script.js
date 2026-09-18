let chatArea = document.getElementById('chatArea');
let input = document.getElementById('messageInput');
let first=true;
function addMsg(t,who){
 if(first){chatArea.innerHTML="";first=false}
 let d=document.createElement('div');d.className=who==='user'?'user-msg':'ai-msg';d.innerText=t;chatArea.appendChild(d);chatArea.scrollTop=chatArea.scrollHeight
}
function typing(s){let d=document.createElement('div');d.id='typing';d.className='ai-msg';d.style.opacity='.6';d.innerText=s;chatArea.appendChild(d)}
function rmTyping(){let x=document.getElementById('typing');if(x)x.remove()}
function reply(m){
 m=m.toLowerCase();
 if(m.includes('hello')||m.includes('hi'))return 'Hello! I am Afro AI — made for all. How can I help you today?';
 if(m.includes('who'))return 'I am Afro AI, your assistant built for everyone — light, fast, made for all!';
 return 'Great question! Afro AI is made for all. Tell me more about "'+m+'" and I will help — homework, business, coding, writing, anything.';
}
function sendMessage(){
 let t=input.value.trim();if(!t)return;addMsg(t,'user');input.value='';typing('●●● Afro AI is typing...');
 setTimeout(()=>{rmTyping();addMsg(reply(t),'ai')},700)
}
function handleKey(e){if(e.key==='Enter')sendMessage()}
function quickAsk(t){input.value=t;sendMessage()}
function newChat(){chatArea.innerHTML=`<div class="welcome"><div class="logo">A</div><h1>Welcome to Afro AI</h1><p>Your assistant — fast, light, and made for all. Ask anything!</p></div>`;first=true}
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open')}
function toggleTheme(){document.body.classList.toggle('dark-mode')}
