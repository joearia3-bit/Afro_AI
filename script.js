const chat=document.getElementById('chat');
const inp=document.getElementById('inp');

function addMsg(text, isUser){
  if(document.querySelector('.welcome')) document.querySelector('.welcome').style.display='none';
  const d=document.createElement('div');
  d.className=isUser?'msg user':'msg';
  d.innerHTML=`<div class="avatar">${isUser?'J':'A'}</div><div class="text">${text}</div>`;
  chat.appendChild(d);
  chat.scrollTop=chat.scrollHeight;
}

async function send(){
  const q=inp.value.trim();
  if(!q) return;
  addMsg(q,true);
  inp.value='';
  
  // typing indicator
  const typing=document.createElement('div');
  typing.className='msg';
  typing.id='typing';
  typing.innerHTML=`<div class="avatar">A</div><div class="text">...</div>`;
  chat.appendChild(typing);
  
  try{
    const res=await fetch('/.netlify/functions/chat',{method:'POST',body:JSON.stringify({message:q})});
    const data=await res.json();
    document.getElementById('typing')?.remove();
    addMsg(data.reply||data.message||'Hello! I am Afro AI',false);
  }catch(e){
    document.getElementById('typing')?.remove();
    let r='';
    const l=q.toLowerCase();
    if(l.includes('hello')||l.includes('hi')) r='Hello! 👋 I am Afro AI - your ChatGPT for PNG. How can I help you today?';
    else if(l.includes('who')) r='I am Afro AI, built by Joe from Blessed PNG. I am a ChatGPT clone for Papua New Guinea 🇵🇬';
    else r=`You said: "${q}"\n\nI am Afro AI. I can help you write business plans, build websites, create APKs, and answer questions. For full AI power, deploy this site to Netlify (d2779.netlify.app).`;
    addMsg(r,false);
  }
}        );

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
