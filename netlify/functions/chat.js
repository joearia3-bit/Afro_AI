<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Afro AI</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-[#faf9f6] flex flex-col h-screen">

  <!-- Header -->
  <div class="flex items-center justify-between p-3 border-b bg-white">
    <div class="flex items-center gap-2">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-yellow-400 flex items-center justify-center font-black text-xl">
        A
      </div>
      <b>Afro AI</b>
    </div>

    <span class="bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
      FREE
    </span>
  </div>

  <!-- Chat -->
  <div id="chat" class="flex-1 overflow-auto p-4 space-y-3">

    <div class="flex justify-center">
      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-yellow-400 flex items-center justify-center font-black text-2xl">
        A
      </div>
    </div>

    <h1 class="text-center font-black text-2xl">
      Welcome to Afro AI
    </h1>

    <p class="text-center text-gray-500 text-sm">
      Your simple AI assistant.
    </p>

    <div class="mx-auto mt-4 max-w-xs border border-yellow-300 bg-yellow-50/50 rounded-2xl p-3 text-center">
      <b class="text-sm">🎉 Free Trial</b>
      <p class="text-xs text-yellow-800">
        Enjoy Afro AI free for 3 months.
      </p>
    </div>

  </div>

  <!-- Input -->
  <div class="p-3 bg-white border-t">
    <div class="flex gap-2 max-w-3xl mx-auto bg-gray-100 rounded-full p-2">

      <input
        id="inp"
        class="flex-1 bg-transparent outline-none px-3 text-sm"
        placeholder="Message Afro AI..."
      >

      <button
        id="sendBtn"
        class="bg-black text-white w-9 h-9 rounded-full font-bold"
      >
        ↑
      </button>

    </div>

    <p class="text-center text-[10px] text-gray-400 mt-2">
      Powered by Netlify • Blessed PNG
    </p>
  </div>

<script>

const chat = document.getElementById("chat");
const inp = document.getElementById("inp");
const sendBtn = document.getElementById("sendBtn");


function addMessage(text, userMessage) {

  const div = document.createElement("div");

  div.className = userMessage
    ? "flex justify-end"
    : "flex justify-start";

  div.innerHTML = `
    <div class="${
      userMessage
        ? "bg-black text-white"
        : "bg-white border"
    } max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow">
      ${text}
    </div>
  `;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}


async function send() {

  const message = inp.value.trim();

  if (!message) return;

  // Show user's message
  addMessage(message, true);

  // Clear input
  inp.value = "";

  // Show thinking message
  addMessage("Afro AI is thinking... 🤔", false);

  try {

    const response = await fetch(
      "/.netlify/functions/chat",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          message: message
        })
      }
    );


    const data = await response.json();


    // Remove "thinking" message
    const messages = chat.querySelectorAll(".flex.justify-start");

    if (messages.length > 0) {
      messages[messages.length - 1].remove();
    }


    if (!response.ok) {

      addMessage(
        "Sorry, Afro AI could not connect to the AI server. ⚠️",
        false
      );

      console.error(data);

      return;
    }


    addMessage(
      data.reply || "I received your message, but no answer was returned.",
      false
    );


  } catch (error) {

    console.error("Connection error:", error);

    const messages = chat.querySelectorAll(".flex.justify-start");

    if (messages.length > 0) {
      messages[messages.length - 1].remove();
    }

    addMessage(
      "Afro AI cannot connect to the server right now. ⚠️",
      false
    );
  }
}


// Send when button is clicked
sendBtn.addEventListener("click", send);


// Send when Enter is pressed
inp.addEventListener("keydown", function(event) {

  if (event.key === "Enter") {
    send();
  }

});

</script>

</body>
</html>
