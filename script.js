/* =================================
   AFRO AI — PHASE 1 FAST VERSION
   ================================= */

const CHAT_KEY = "afro_ai_chat";
const TRIAL_KEY = "afro_ai_trial_start";
const TRIAL_DAYS = 90;

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
   MEMORY
   ================================= */

function getChatHistory() {
  try {
    const saved = localStorage.getItem(CHAT_KEY);

    if (!saved) return [];

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
    console.log("Memory could not be saved.");
  }
}


/* =================================
   TRIAL
   ================================= */

function getTrialStart() {

  let start =
    localStorage.getItem(TRIAL_KEY);

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

  const elapsed =
    Date.now() - getTrialStart();

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
   SUBSCRIPTION
   ================================= */

function isLifetime() {

  try {

    const saved =
      localStorage.getItem(
        "afro_ai_subscription"
      );

    if (!saved) return false;

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

  return (
    isLifetime() ||
    trialActive()
  );
}


/* =================================
   STATUS
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

  paywall.classList.remove(
    "hidden"
  );
}


function hidePaywall() {

  paywall.classList.add(
    "hidden"
  );
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
   MESSAGE DISPLAY
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
   SAVE MESSAGE
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


function addAndSaveMessage(
  text,
  sender
) {

  addMessage(text, sender);

  saveMessage(text, sender);
}


/* =================================
   LOAD MEMORY
   ================================= */

function loadChat() {

  const history =
    getChatHistory();

  if (history.length === 0) {

    showWelcome();

    return;
  }

  chat.innerHTML = "";

  history.forEach(item => {

    addMessage(
      item.text,
      item.sender
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

  if (
    !confirm(
      "Start a new chat? Your current chat history will be cleared."
    )
  ) {
    return;
  }

  localStorage.removeItem(
    CHAT_KEY
  );

  showWelcome();
}


/* =================================
   CLEAR MEMORY
   ================================= */

function clearMemory() {

  if (
    !confirm(
      "Clear all saved chat memory?"
    )
  ) {
    return;
  }

  localStorage.removeItem(
    CHAT_KEY
  );

  showWelcome();
}


/* =================================
   FAST AI REQUEST
   ================================= */

async function getAIResponse(
  userMessage
) {

  const history =
    getChatHistory();

  const context =
    history
      .slice(-6)
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

Answer clearly and helpfully.`;


  /*
     STOP WAITING AFTER 15 SECONDS
  */

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      15000
    );


  try {

    const response =
      await fetch(
        "https://text.pollinations.ai/" +
        encodeURIComponent(prompt),
        {
          signal: controller.signal
        }
      );


    if (!response.ok) {

      throw new Error(
        "AI service error"
      );
    }


    const answer =
      await response.text();


    if (!answer.trim()) {

      throw new Error(
        "Empty response"
      );
    }


    return {
      success: true,
      text: answer.trim()
    };


  } catch (error) {

    if (
      error.name === "AbortError"
    ) {

      return {
        success: false,
        text:
          "Afro AI is taking too long to respond. Please try again."
      };
    }


    return {
      success: false,
      text:
        "Afro AI could not connect right now. Please try again."
    };


  } finally {

    clearTimeout(timeout);
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


  const userMessage =
    input.value.trim();


  if (!userMessage) {
    return;
  }


  input.value = "";

  input.style.height =
    "auto";


  addAndSaveMessage(
    userMessage,
    "user"
  );


  /* THINKING MESSAGE */

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


  sendBtn.disabled = true;

  sendBtn.style.opacity =
    "0.5";


  const result =
    await getAIResponse(
      userMessage
    );


  const currentLoading =
    document.getElementById(
      "loading"
    );


  if (currentLoading) {

    currentLoading.remove();
  }


  addAndSaveMessage(
    result.text,
    "ai"
  );


  sendBtn.disabled = false;

  sendBtn.style.opacity =
    "1";
}


/* =================================
   FREE TRIAL
   ================================= */

function startFreeTrial() {

  if (trialActive()) {

    hidePaywall();

    updateStatus();

    addAndSaveMessage(
      "🎉 Your Afro AI free trial is active. Enjoy!",
      "ai"
    );

    return;
  }


  alert(
    "Your free trial has ended. Please contact Afro AI for K50 Lifetime access."
  );
}


/* =================================
   WHATSAPP
   ================================= */

function openWhatsApp() {

  /*
     REPLACE THIS WITH YOUR
     REAL WHATSAPP NUMBER LATER.
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
   BUTTONS
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
   TEXTAREA SIZE
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
   START AFRO AI
   ================================= */

updateStatus();

loadChat();
