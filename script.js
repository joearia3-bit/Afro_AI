async function sendMessage() {
  const input = document.getElementById('userInput') || document.querySelector('input');
  const chat = document.getElementById('chatBox') || document.getElementById('chat');
  const text = input.value.trim();
  if(!text) return;
  chat.innerHTML += `<div style="text-align:right;margin:8px"><span style="background:#000;color:#fff;padding:8px 12px;border-radius:15px">${text}</span></div>`;
  input.value = '';
  
  // Try AI first
  try {
    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      body: JSON.stringify({message: text})
    });
    const data = await res.json();
    chat.innerHTML += `<div style="text-align:left;margin:8px"><span style="background:#fff;border:1px solid #ddd;padding:8px 12px;border-radius:15px">${data.reply}</span></div>`;
  } catch(e) {
    // FALLBACK - if on GitHub, reply locally
    let reply = "Hello! I'm Afro AI 🇵🇬 ";
    if(text.toLowerCase().includes('hello')||text.toLowerCase().includes('hi')) reply = "Hello Joe! Afro AI here! On GitHub I work offline. For full AI, use Netlify link: d2779.netlify.app";
    else reply = `You said: "${text}" - On GitHub version I reply offline. Deploy to Netlify for real AI!`;
    chat.innerHTML += `<div style="text-align:left;margin:8px"><span style="background:#fff;border:1px solid #ddd;padding:8px 12px;border-radius:15px">${reply}</span></div>`;
  }
  chat.scrollTop = chat.scrollHeight;
}function instantAnswer(text) {

  const q = text.toLowerCase().trim();

  /* TIME */

  if (
    q.includes("what time") ||
    q.includes("current time")
  ) {
    return "Current time: " +
      new Date().toLocaleTimeString();
  }


  /* DATE */

  if (
    q.includes("what date") ||
    q.includes("today's date") ||
    q === "what day is it"
  ) {
    return "Today's date: " +
      new Date().toLocaleDateString();
  }


  /* CALCULATOR */

  if (q.startsWith("calculate ")) {

    try {

      const expression = text
        .substring(10)
        .replace(/[^0-9+\-*/().% ]/g, "");

      return "Answer: " +
        Function("return " + expression)();

    } catch {
      return "I couldn't calculate that.";
    }
  }


  /* WORD COUNT */

  if (q.startsWith("word count ")) {

    const words = text
      .substring(11)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return "Word count: " + words.length;
  }


  return null;
}


/* ---------- LOAD AI ONCE ---------- */

async function loadAI() {

  if (ai) return ai;

  /* IMPORTANT:
     Don't start the same download twice.
  */

  if (loadingAI) return loadingAI;

  loadingAI = (async () => {

    status.textContent = "Starting AI...";

    /* WEBGPU */

    try {

      const m =
        await import(
          "https://esm.run/@mlc-ai/web-llm"
        );

      const engine = new m.MLCEngine();

      await engine.reload(
        "Llama-3.2-1B-Instruct-q4f16_1-MLC",
        {
          initProgressCallback: p => {

            status.textContent =
              "AI " +
              Math.round(p.progress * 100) +
              "%";
          }
        }
      );

      ai = {
        type: "webgpu",
        engine
      };

      status.textContent = "AI Ready";

      return ai;

    } catch (error) {

      console.log("WebGPU unavailable");
    }


    /* CPU FALLBACK */

    try {

      status.textContent =
        "Using fast fallback...";

      const m =
        await import(
          "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
        );

      const pipe =
        await m.pipeline(
          "text-generation",
          "HuggingFaceTB/SmolLM2-360M-Instruct",
          {
            device: "wasm"
          }
        );

      ai = {
        type: "cpu",
        pipe
      };

      status.textContent = "AI Ready";

      return ai;

    } catch (error) {

      console.log("CPU AI unavailable");
    }

    ai = null;
    return null;

  })();

  return loadingAI;
}


/* ---------- AI RESPONSE ---------- */

async function getAIResponse() {

  const engine = await loadAI();

  if (!engine) {
    return "The AI could not start on this device.";
  }


  /* Keep history SHORT = faster */

  const history =
    chats[currentChat].messages
      .slice(-6)
      .map(m => ({
        role:
          m.role === "user"
            ? "user"
            : "assistant",
        content: m.text
      }));


  /* WEBGPU */

  if (engine.type === "webgpu") {

    const result =
      await engine.engine.chat.completions.create({

        messages: [
          {
            role: "system",
            content:
              "You are Afro AI. Answer clearly, helpfully and briefly."
          },
          ...history
        ],

        temperature: 0.3,

        /* Short response = faster */

        max_tokens: 180
      });

    return result.choices[0]
      .message.content;
  }


  /* CPU */

  if (engine.type === "cpu") {

    const prompt =
      history
        .map(m =>
          (m.role === "user"
            ? "User: "
            : "Assistant: ") +
          m.content
        )
        .join("\n") +
      "\nAssistant:";

    const result =
      await engine.pipe(
        prompt,
        {
          max_new_tokens: 120
        }
      );

    return result[0]
      .generated_text
      .split("Assistant:")
      .pop()
      .trim();
  }
}


/* ---------- SEND ---------- */

async function sendMessage() {

  const text = input.value.trim();

  if (!text) return;

  input.value = "";

  addMessage("user", text);


  /* INSTANT RESPONSE */

  const instant =
    instantAnswer(text);

  if (instant) {

    addMessage("ai", instant);

    return;
  }


  /* AI */

  loading.textContent = "Thinking...";
  status.textContent = "Working...";

  try {

    const answer =
      await getAIResponse();

    addMessage("ai", answer);

  } catch (error) {

    console.log(error);

    /* TRY AGAIN USING FALLBACK */

    ai = null;
    loadingAI = null;

    try {

      const answer =
        await getAIResponse();

      addMessage("ai", answer);

    } catch {

      addMessage(
        "ai",
        "I couldn't complete that. Please try again."
      );
    }
  }

  loading.textContent = "";
  status.textContent = "Ready";
}


/* ---------- ENTER ---------- */

function handleKey(event) {

  if (
    event.key === "Enter" &&
    !event.shiftKey
  ) {

    event.preventDefault();

    sendMessage();
  }
}


/* ---------- START ---------- */

render();
