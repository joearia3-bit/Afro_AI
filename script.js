/* =================================
   AFRO AI — PHASE 1
   ================================= */

const CHAT_KEY = "afro_ai_chat";
const TRIAL_KEY = "afro_ai_trial_start";
const TRIAL_DAYS = 90;


/* =================================
   ELEMENTS
   ================================= */

const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const newChatBtn = document.getElementById("newChatBtn");
const clearBtn = document.getElementById("clearBtn");

const paywall = document.getElementById("paywall");
const closePaywall = document.getElementById("closePaywall");

const freeTrialBtn = document.getElementById("freeTrialBtn");
const whatsappBtn = document.getElementById("whatsappBtn");

const subscriptionBadge =
  document.getElementById("subscriptionBadge");


/* =================================
   BASIC STORAGE
   ================================= */

function getChatHistory() {
  try {
    const saved = localStorage.getItem(CHAT_KEY);

    if (!saved) {
      return [];
    }

    const history = JSON.parse(saved);

    return Array.isArray(history) ? history : [];

  } catch (error) {
    return [];
  }
}


function saveChatHistory(history) {
  try {
    localStorage.setItem(
      CHAT_KEY,
      JSON.stringify(history.slice(-50))
    );
  } catch (error) {
    console.log("Could not save chat.");
  }
}


/* =================================
   TRIAL SYSTEM
   ================================= */

function getTrialStart() {

  let start = localStorage.getItem(TRIAL_KEY);

  if (!start) {

    start = Date.now().toString();

    localStorage.setItem(
      TRIAL_KEY,
      start
    );
  }

  return parseInt(start, 10);
}


function getTrialDaysLeft() {

  const start = getTrialStart();

  const elapsed =
    Date.now() - start;

  const daysPassed =
    Math.floor(
      elapsed / 86400000
    );

  return Math.max(
    0,
    TRIAL_DAYS - daysPassed
  );
}


function trialActive() {
  return getTrialDaysLeft() > 0;
}


/* =================================
   SUBSCRIPTION STATUS
   ================================= */

function isLifetime() {

  try {

    const saved =
      localStorage.getItem("afro_ai_subscription");

    if (!saved) {
      return false;
    }

    const data =
      JSON.parse(saved);

    return (
      data &&
      data.type === "lifetime" &&
      data.verified === true
    );

  } catch (error) {

    return false;
  }
}


function canUseAfroAI() {

  if (isLifetime()) {
    return true;
  }

  if (trialActive()) {
    return true;
  }

  return false;
}


/* =================================
   UPDATE STATUS
   ================================= */

function updateStatus() {

  if (isLifetime()) {

    subscriptionBadge.textContent =
      "K50 LIFETIME ✓";

    return;
  }


  const days =
    getTrialDaysLeft();


  if (days > 0) {

    subscriptionBadge.textContent =
      `FREE • ${days} DAYS`;

  } else {

    subscriptionBadge.textContent =
      "TRIAL ENDED";
  }
}


/* =================================
   PAYWALL
   ================================= */

function showPaywall() {

  paywall.classList.remove("hidden");
}


function hidePaywall() {

  paywall.classList.add("hidden");
}


/* =================================
   SAFE TEXT
   ================================= */

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


/* =================================
   DISPLAY MESSAGE
   ================================= */

function addMessage(text, sender) {

  const message =
    document.createElement("div");

  message.className =
    "message";


  const avatar =
    document.createElement("div");

  avatar.className =
    "avatar " +
    (
      sender === "user"
        ? "user-avatar"
        : "ai-avatar"
    );


  avatar.textContent =
    sender === "user"
      ? "J"
      : "A";


  const content =
    document.createElement("div");

  content.className =
    "message-content";


  content.innerHTML =
    escapeHTML(text)
      .replace(/\n/g, "<br>");


  message.appendChild(avatar);
  message.appendChild(content);

  chat.appendChild(message);

  chat.scrollTop =
    chat.scrollHeight;
}


/* =================================
   SAVE + DISPLAY
   ================================= */

function saveMessage(text, sender) {

  const history =
    getChatHistory();

  history.push({
    text: text,
    sender: sender,
    time: Date.now()
  });

  saveChatHistory(history);
}


function addAndSaveMessage(text, sender) {

  addMessage(text, sender);

  saveMessage(text, sender);
}


/* =================================
   LOAD CHAT
   ================================= */

function loadChat() {

  const history =
    getChatHistory();


  if (history.length === 0) {

    showWelcome();

    return;
  }


  chat.innerHTML = "";


  history.forEach(message => {

    addMessage(
      message.text,
      message.sender
    );

  });
}


/* =================================
   WELCOME
   ================================= */

function showWelcome() {

  chat.innerHTML = `
    <div class="welcome">

      <div class="big-logo">
        A
      </div>

      <h1>
        Welcome to Afro AI
      </h1>

      <p>
        Your simple AI assistant.
      </p>

      <div class="trial-card">
        🎉 <strong>Free Trial</strong>
        <br>
        Enjoy Afro AI free for 3 months.
      </div>

    </div>
  `;
}


/* =================================
   NEW CHAT
   ================================= */

function startNewChat() {

  const confirmed =
    confirm(
      "Start a new chat? Your current chat history will be cleared."
    );

  if (!confirmed) {
    return;
  }


  localStorage.removeItem(CHAT_KEY);

  showWelcome();
}


/* =================================
   CLEAR MEMORY
   ================================= */

function clearMemory() {

  const confirmed =
    confirm(
      "Clear all saved chat memory?"
    );

  if (!confirmed) {
    return;
  }


  localStorage.removeItem(CHAT_KEY);

  showWelcome();
}


/* =================================
   AI REQUEST
   ================================= */

async function getAIResponse(userMessage) {

  const history =
    getChatHistory();


  const context =
    history
      .slice(-8)
      .map(item =>
        `${item.sender}: ${item.text}`
      )
      .join("\n");


  const prompt =
`You are Afro AI, a helpful AI assistant.

Conversation:
${context}

User:
${userMessage}

Give a clear and helpful answer.`;


  try {

    const response =
      await fetch(
        "https://text.pollinations.ai/" +
        encodeURIComponent(prompt)
      );


    if (!response.ok) {
      throw new Error("AI request failed");
    }


    const answer =
      await response.text();


    if (!answer.trim()) {
      throw new Error("Empty AI response");
    }


    return answer.trim();

  } catch (error) {

    return (
      "I'm having trouble connecting to the AI service right now. " +
      "Please try again in a moment."
    );
  }
}


/* =================================
   SEND MESSAGE
   ================================= */

async function sendMessage() {

  if (!canUseAfroAI()) {

    showPaywall();

    return;
  }


  const message =
    input.value.trim();


  if (!message) {
    return;
  }


  input.value = "";

  input.style.height =
    "auto";


  addAndSaveMessage(
    message,
    "user"
  );


  const loading =
    document.createElement("div");

  loading.className =
    "message";

  loading.id =
    "loading";


  loading.innerHTML = `
    <div class="avatar ai-avatar">
      A
    </div>

    <div
      class="message-content"
      style="color:#888;"
    >
      Afro AI is thinking...
    </div>
  `;


  chat.appendChild(loading);

  chat.scrollTop =
    chat.scrollHeight;


  const answer =
    await getAIResponse(message);


  const currentLoading =
    document.getElementById(
      "loading"
    );


  if (currentLoading) {
    currentLoading.remove();
  }


  addAndSaveMessage(
    answer,
    "ai"
  );
}


/* =================================
   FREE TRIAL BUTTON
   ================================= */

function startFreeTrial() {

  if (trialActive()) {

    hidePaywall();

    updateStatus();

    addAndSaveMessage(
      "🎉 Your free 3-month Afro AI trial is active. Enjoy!",
      "ai"
    );

    return;
  }


  alert(
    "Your free trial has ended. Please contact Afro AI for K50 lifetime access."
  );
}


/* =================================
   WHATSAPP
   ================================= */

function openWhatsApp() {

  /*
     REPLACE THIS NUMBER
     WITH YOUR REAL WHATSAPP NUMBER.

     Example:
     675XXXXXXXX
  */

  const phone =
    "67500000000";


  const message =
    encodeURIComponent(
      "Hi, I would like information about Afro AI K50 Lifetime access."
    );


  window.open(
    `https://wa.me/${phone}?text=${message}`,
    "_blank"
  );
}


/* =================================
   BUTTON EVENTS
   ================================= */

sendBtn.addEventListener(
  "click",
  sendMessage
);


newChatBtn.addEventListener(
  "click",
  startNewChat
);


clearBtn.addEventListener(
  "click",
  clearMemory
);


closePaywall.addEventListener(
  "click",
  hidePaywall
);


freeTrialBtn.addEventListener(
  "click",
  startFreeTrial
);


whatsappBtn.addEventListener(
  "click",
  openWhatsApp
);


/* =================================
   ENTER TO SEND
   ================================= */

input.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();
    }
  }
);


/* =================================
   AUTO-GROW TEXT BOX
   ================================= */

input.addEventListener(
  "input",
  function () {

    this.style.height =
      "auto";

    this.style.height =
      Math.min(
        this.scrollHeight,
        120
      ) + "px";
  }
);


/* =================================
   START APPLICATION
   ================================= */

updateStatus();

loadChat();
