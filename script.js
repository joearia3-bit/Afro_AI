let chatArea = document.getElementById('chatArea');
let input = document.getElementById('messageInput');
let firstMessage = true;

function addMessage(text, sender){
  if(firstMessage){
    chatArea.innerHTML = "";
    firstMessage = false;
  }
  let div = document.createElement('div');
  div.style.padding = "12px";
  div.style.margin = "10px 0";
  div.style.borderRadius = "18px";
  div.style.maxWidth = "85%";
  if(sender=="user"){
    div.style.background = "#7c3aed";
    div.style.color = "#fff";
    div.style.marginLeft = "auto";
  } else {
    div.style.background = "#f1f1f1";
    div.style.color = "#222";
    div.innerHTML = text + `<br><button onclick="navigator.clipboard.writeText('${text.replace(/'/g,"")}')" style="margin-top:6px;font-size:12px">Copy</button>`;
  }
  if(sender=="user") div.innerText = text;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function showTyping(){
  let d = document.createElement('div');
  d.id = "typing";
  d.style.padding="12px";
  d.innerHTML = "●●● Afro AI is typing...";
  d.style.opacity="0.6";
  chatArea.appendChild(d);
}

function removeTyping(){
  let t = document.getElementById("typing");
  if(t) t.remove();
}

function getAIReply(msg){
  msg = msg.toLowerCase();
  if(msg.includes("hello")) return "Hello! I am Afro AI — made for all. How can I help you today?";
  if(msg.includes("who are you")) return "I am Afro AI, your AI assistant for everyone. Light, fast, and built by you!";
  if(msg.includes("papua") || msg.includes("png")) return "PNG to the world! Afro AI can help with school, business ideas, coding, and more for everyone.";
  return "That's a great question! In Phase 2 I'm running on demo mode. In Phase 3 I'll connect to a real AI brain and give smart answers for all.";
}

function sendMessage(){
  let text = input.value.trim();
  if(!text) return;
  addMessage(text, "user");
  input.value = "";
  showTyping();
  setTimeout(()=>{
    removeTyping();
    addMessage(getAIReply(text), "ai");
  }, 1000);
}

function handleKey(e){ if(e.key=="Enter") sendMessage(); }

function newChat(){
  chatArea.innerHTML = `<div class="welcome"><div class="welcome-logo">A</div><h1>Welcome to Afro AI</h1><p>What would you like to ask today? Built for all.</p></div>`;
  firstMessage = true;
}
function toggleSidebar(){ document.getElementById("sidebar").classList.toggle("open"); }
function toggleTheme(){ document.body.classList.toggle("dark-mode"); }
