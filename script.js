"use strict";

const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const MAX_MESSAGE_LENGTH = 1000;

let isSending = false;


// Safely display a message
function addMessage(text, user) {

  const message = document.createElement("div");

  message.className = user
    ? "message user"
    : "message ai";

  const content = document.createElement("div");

  content.className = "message-content";

  // Safely insert text
  content.textContent = text;

  message.appendChild(content);

  chat.appendChild(message);

  scrollChat();
}


// Keep chat at the bottom
function scrollChat() {

  const main = document.getElementById("main");

  main.scrollTop = main.scrollHeight;
}


// Show thinking message
function showThinking() {

  const thinking = document.createElement("div");

  thinking.id = "thinking";

  thinking.className = "message ai";

  const content = document.createElement("div");

  content.className = "message-content";

  content.textContent = "Afro AI is thinking... 🤔";

  thinking.appendChild(content);

  chat.appendChild(thinking);

  scrollChat();
}


// Remove thinking message
function removeThinking() {

  const thinking = document.getElementById("thinking");

  if (thinking) {
    thinking.remove();
  }
}


// Send message
async function sendMessage() {

  // Prevent double sending
  if (isSending) {
    return;
  }


  let text = input.value.trim();


  // Ignore empty messages
  if (!text) {
    return;
  }


  // Limit message length
  if (text.length > MAX_MESSAGE_LENGTH) {

    addMessage(
      "Your message is too long. Please keep it under 1000 characters.",
      false
    );

    return;
  }


  isSending = true;

  sendButton.disabled = true;

  sendButton.style.opacity = "0.5";


  // Show user message
  addMessage(text, true);

  input.value = "";


  // Show thinking
  showThinking();


  try {

    // Temporary demo response
    await new Promise(function(resolve) {
      setTimeout(resolve, 700);
    });


    removeThinking();


    const answer =
      "Hello! 👋 I'm Afro AI. I'm working securely. How can I help you today? 🇵🇬";


    addMessage(answer, false);


  } catch (error) {

    console.error("Afro AI error:", error);

    removeThinking();

    addMessage(
      "Sorry, something went wrong. Please try again.",
      false
    );

  } finally {

    isSending = false;

    sendButton.disabled = false;

    sendButton.style.opacity = "1";

    input.focus();
  }
}


// Send button
sendButton.addEventListener("click", sendMessage);


// Enter key
input.addEventListener("keydown", function(event) {

  if (event.key === "Enter") {

    event.preventDefault();

    sendMessage();

  }

});
