"use strict";

const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");


// Maximum message length
const MAX_MESSAGE_LENGTH = 1000;


// Safely add a message to the chat
function addMessage(text, user) {

  const message = document.createElement("div");

  message.className = user
    ? "message user"
    : "message ai";

  const content = document.createElement("div");

  content.className = "message-content";

  // textContent prevents HTML/JavaScript injection
  content.textContent = text;

  message.appendChild(content);

  chat.appendChild(message);

  const main = document.getElementById("main");

  main.scrollTop = main.scrollHeight;
}


// Send message
function sendMessage() {

  let text = input.value.trim();

  // Ignore empty messages
  if (!text) {
    return;
  }


  // Limit message size
  if (text.length > MAX_MESSAGE_LENGTH) {

    addMessage(
      "Your message is too long. Please keep it under 1000 characters.",
      false
    );

    return;
  }


  // Show user's message
  addMessage(text, true);

  // Clear input
  input.value = "";


  // Temporary demo response
  setTimeout(function() {

    const answer =
      "Hello! 👋 I'm Afro AI. I'm working securely. How can I help you today? 🇵🇬";

    addMessage(answer, false);

  }, 500);
}


// Button
sendButton.addEventListener("click", sendMessage);


// Enter key
input.addEventListener("keydown", function(event) {

  if (event.key === "Enter") {
    sendMessage();
  }

});
