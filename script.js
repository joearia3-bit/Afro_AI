const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");


function addMessage(text, user) {

  const message = document.createElement("div");

  message.className = user
    ? "message user"
    : "message ai";

  const content = document.createElement("div");

  content.className = "message-content";

  content.textContent = text;

  message.appendChild(content);

  chat.appendChild(message);

  document.getElementById("main").scrollTop =
    document.getElementById("main").scrollHeight;
}


function sendMessage() {

  const text = input.value.trim();

  if (text === "") {
    return;
  }

  addMessage(text, true);

  input.value = "";


  setTimeout(function() {

    const answer =
      "Hello! 👋 I'm Afro AI. I'm working correctly. How can I help you today? 🇵🇬";

    addMessage(answer, false);

  }, 500);
}


sendButton.addEventListener("click", sendMessage);


input.addEventListener("keydown", function(event) {

  if (event.key === "Enter") {
    sendMessage();
  }

});
