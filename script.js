const messagesBox = document.getElementById("messages");
const input = document.getElementById("input");
const status = document.getElementById("status");
const loading = document.getElementById("loading");

const STORAGE = "afro_ai_chats";

let chats = JSON.parse(localStorage.getItem(STORAGE) || "[]");
let currentChat = 0;

let webAI = null;
let cpuAI = null;


/* ---------------- CHAT MEMORY ---------------- */

function saveChats() {
  localStorage.setItem(STORAGE, JSON.stringify(chats));
}

function newChat() {
  chats.unshift({
    title: "New Chat",
    messages: []
  });

  currentChat = 0;
  saveChats();
  render();
}

function addMessage(role, text) {
  chats[currentChat].messages.push({
    role,
    text
  });

  if (
    role === "user" &&
    chats[currentChat].messages.length === 1
  ) {
    chats[currentChat].title = text.slice(0, 30);
  }

  saveChats();
  render();
}


/* ---------------- DISPLAY ---------------- */

function render() {
  messagesBox.innerHTML = "";

  chats[currentChat].messages.forEach(message => {
    const div = document.createElement("div");

    div.className = "message " + message.role;
    div.textContent = message.text;

    if (message.role === "ai") {
      const copy = document.createElement("button");

      copy.textContent = "Copy";
      copy.className = "copy";

      copy.onclick = () =>
        navigator.clipboard?.writeText(message.text);

      div.appendChild(document.createElement("br"));
      div.appendChild(copy);
    }

    messagesBox.appendChild(div);
  });

  messagesBox.scrollTop = messagesBox.scrollHeight;

  const list = document.getElementById("chatList");
  list.innerHTML = "";

  chats.forEach((chat, index) => {
    const button = document.createElement("button");

    button.className = "chat-button";
    button.textContent = "💬 " + chat.title;

    button.onclick = () => {
      currentChat = index;
      render();
    };

    list.appendChild(button);
  });
}


/* ---------------- FAST LOCAL TOOLS ---------------- */

function localTool(text) {

  const q = text.toLowerCase();

  if (
    q.includes("what time") ||
    q.includes("current time")
  ) {
    return "Current time: " +
      new Date().toLocaleTimeString();
  }

  if (
    q.includes("what date") ||
    q.includes("today's date")
  ) {
    return "Today's date: " +
      new Date().toLocaleDateString();
  }

  if (q.startsWith("calculate ")) {
    try {
      const expression = text
        .slice(10)
        .replace(/[^0-9+\-*/().% ]/g, "");

      return "Answer: " +
        Function("return " + expression)();
    } catch {
      return "I couldn't calculate that.";
    }
  }

  if (q.startsWith("word count ")) {
    const words = text
      .slice(11)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return "Word count: " + words.length;
  }

  return null;
}


/* ---------------- WEBGPU AI ---------------- */

async function loadWebAI() {

  if (webAI) return webAI;

  status.textContent = "Starting AI...";

  try {

    const module =
      await import("https://esm.run/@mlc-ai/web-llm");

    const engine = new module.MLCEngine();

    await engine.reload(
      "Llama-3.2-1B-Instruct-q4f16_1-MLC",
      {
        initProgressCallback: progress => {
          status.textContent =
            "AI " +
            Math.round(progress.progress * 100) +
            "%";
        }
      }
    );

    webAI = engine;

    status.textContent = "AI Ready";

    return engine;

  } catch (error) {

    console.log("WebGPU AI failed:", error);
    return null;
  }
}


/* ---------------- CPU FALLBACK ---------------- */

async function loadCPUAI() {

  if (cpuAI) return cpuAI;

  try {

    const module =
      await import(
        "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
      );

    cpuAI = await module.pipeline(
      "text-generation",
      "HuggingFaceTB/SmolLM2-360M-Instruct",
      {
        device: "wasm"
      }
    );

    return cpuAI;

  } catch (error) {

    console.log("CPU AI failed:", error);
    return null;
  }
}


/* ---------------- ASK AI ---------------- */

async function askAI(text) {

  /* FIRST OPTION: WEBGPU */

  try {

    const ai = await loadWebAI();

    if (ai) {

      const history =
        chats[currentChat].messages
          .slice(-8)
          .map(message => ({
            role:
              message.role === "user"
                ? "user"
                : "assistant",
            content: message.text
          }));

      const response =
        await ai.chat.completions.create({

          messages: [
            {
              role: "system",
              content:
                "You are Afro AI. Be helpful, accurate, clear and concise. If one method fails, try another available method."
            },
            ...history
          ],

          temperature: 0.5,
          max_tokens: 300
        });

      return response.choices[0].message.content;
    }

  } catch (error) {

    console.log("WebGPU failed.");
  }


  /* SECOND OPTION: CPU */

  try {

    const ai = await loadCPUAI();

    if (ai) {

      const prompt =
        chats[currentChat].messages
          .slice(-8)
          .map(m =>
            (m.role === "user"
              ? "User: "
              : "Assistant: ") + m.text
          )
          .join("\n");

      const result =
        await ai(
          prompt + "\nAssistant:",
          {
            max_new_tokens: 200
          }
        );

      return result[0].generated_text
        .split("Assistant:")
        .pop()
        .trim();
    }

  } catch (error) {

    console.log("CPU fallback failed.");
  }

  return "I couldn't start the AI on this device. Please try again.";
}


/* ---------------- SEND ---------------- */

async function sendMessage() {

  const text = input.value.trim();

  if (!text) return;

  input.value = "";

  addMessage("user", text);

  /* FAST LOCAL ANSWER */

  const local = localTool(text);

  if (local) {

    addMessage("ai", local);
    return;
  }

  loading.textContent = "Thinking...";
  status.textContent = "Working...";

  try {

    const answer = await askAI(text);

    addMessage("ai", answer);

  } catch {

    addMessage(
      "ai",
      "I couldn't complete that task. Please try again."
    );
  }

  loading.textContent = "";
  status.textContent = "Ready";
}


/* ---------------- ENTER KEY ---------------- */

function handleKey(event) {

  if (
    event.key === "Enter" &&
    !event.shiftKey
  ) {
    event.preventDefault();
    sendMessage();
  }
}


/* ---------------- START ---------------- */

if (!chats.length) {
  chats.push({
    title: "New Chat",
    messages: []
  });

  saveChats();
}

render();
