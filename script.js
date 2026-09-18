let chatArea = document.getElementById('chatArea');
let input = document.getElementById('messageInput');
let first=true;

function addMsg(t,who){
 if(first){chatArea.innerHTML="";first=false}
 let d=document.createElement('div');d.className=who==='user'?'user-msg':'ai-msg';d.innerText=t;chatArea.appendChild(d);chatArea.scrollTop=chatArea.scrollHeight
}
function typing(){let d=document.createElement('div');d.id='typing';d.className='ai-msg';d.style.opacity='.6';d.innerText='●●● Afro AI is thinking...';chatArea.appendChild(d);chatArea.scrollTop=chatArea.scrollHeight}
function rmTyping(){let x=document.getElementById('typing');if(x)x.remove()}

async function smartReply(prompt){
 // Afro AI identity lock
 const system = "You are Afro AI, made for all. Built in PNG. Friendly, helpful, concise. Always say you are Afro AI - made for all, never say you are another AI.";
 try{
  const res = await fetch('https://text.pollinations.ai/' + encodeURIComponent(system + "\nUser: " + prompt + "\nAfro AI:"), {method:'GET'});
  let text = await res.text();
  // clean up
  if(!text || text.length<2) throw "empty";
  return text;
 }catch(e){
  // Fallback if API down
  if(prompt.toLowerCase().includes('hello')||prompt.toLowerCase().includes('hi')) return 'Hello! I am Afro AI — made for all. How can I help you today?';
  return "I am Afro AI — made for all. I can help with homework, business, coding, writing, PNG ideas. You asked: " + prompt + ". Tell me more and I will break it down for you.";
 }
}

async function sendMessage(){
 let t=input.value.trim();if(!t)return;
 addMsg(t,'user');input.value='';typing();
 let ans = await smartReply(t);
 rmTyping();
 addMsg(ans,'ai');
}
function handleKey(e){if(e.key==='Enter')sendMessage()}
function quickAsk(t){input.value=t;sendMessage()}
function newChat(){chatArea.innerHTML=`<div class="welcome"><div class="logo">A</div><h1>Welcome to Afro AI</h1><p>Your assistant — fast, light, and made for all. Ask anything!</p></div>`;first=true}
function toggleSidebar(){document.getElementById('sidebar')?.classList.toggle('open')}
function toggleTheme(){document.body.classList.toggle('dark-mode')}
