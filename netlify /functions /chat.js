async function getAIResponse(userMessage) {
  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userMessage
      })
    });

    if (!response.ok) {
      throw new Error("AI server error");
    }

    const data = await response.json();

    return data.reply || "Sorry, I could not get a response.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, Afro_AI is temporarily unavailable.";
  }
}
