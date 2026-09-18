function sendMessage(){ alert("Phase 1 complete. Phase 2 will add real chat."); }
function handleKey(e){ if(e.key==="Enter") sendMessage(); }
function newChat(){ location.reload(); }
function toggleSidebar(){ document.getElementById("sidebar").classList.toggle("open"); }
function toggleTheme(){ document.body.classList.toggle("dark-mode"); }
