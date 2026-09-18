export default async (req) => {
  if (req.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { message } = JSON.parse(req.body || "{}");

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message is required" })
      };
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);

      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: "AI request failed"
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: data.output_text || "Sorry, I could not generate a response."
      })
    };

  } catch (error) {
    console.error("Function error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server error"
      })
    };
  }
};
