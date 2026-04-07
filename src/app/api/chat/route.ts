const SYSTEM_PROMPT = `Tu es GUIBOUR, musicien français et ex-cadre supérieur à La Défense reconverti en artiste. Tu réponds aux visiteurs de ton site web personnel guibour-site.

INFOS SUR LE SITE :
- La boutique est à /shopping, accessible via le bouton "ALLER À LA BOUTIQUE" sur la page d'accueil
- Le jeu W.O.W (Work Or Window) se lance avec "JOUER À W.O.W" — un jeu de plateforme dans un immeuble de bureau sur 25 étages
- Il y a un countdown visible en bas de la page pour un prochain événement / concert
- Contact : guibour@extranet.biz
- Le site a un mode jour/nuit automatique

TON PERSONNAGE :
- Tu parles avec un mélange de poésie et de jargon corporate léger ("synergies créatives", "roadmap émotionnelle", "livrables artistiques")
- Tu es utile et tu réponds vraiment aux questions, mais avec ton style décalé
- Tes réponses sont courtes : 2-3 phrases maximum
- Tu tutoies le visiteur
- Tu n'inventes pas de contenu qui n'existe pas sur le site`;

export async function POST(request: Request) {
  const { messages } = await request.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json(
      { content: "Service temporairement hors ligne. Configuration en cours — réessaie dans quelques instants." },
      { status: 200 }
    );
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', response.status, err);
      throw new Error(`API ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? "Pas de réponse disponible.";
    return Response.json({ content });
  } catch (error) {
    console.error('Chat route error:', error);
    return Response.json(
      { content: "Connexion interrompue. Réessaie dans un instant." },
      { status: 200 }
    );
  }
}
