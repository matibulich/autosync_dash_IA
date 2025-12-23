import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function analyzeStock(data, prompt) {
  const finalPrompt = `${prompt}\n\nStock: ${JSON.stringify(data)}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "Eres un asistente experto en stock que responde de forma directa y clara. Si el usuario hace preguntas irrelevantes a los datos, respondé de manera lógica usando la información disponible.",
      },
      { role: "user", content: finalPrompt },
    ],
  });

  return response.choices[0].message.content;
}
