type ScriptStep = {
  user: string;
  ai: string;
};

export const fakeScript: ScriptStep[] = [
  {
    user: "hi",
    ai: "Hi there! I’m your skincare assistant. Can you tell me a bit about your skin today?",
  },
  {
    user: "i have dry skin",
    ai: "Got it. Hydration is key here. Have you used any moisturizers or cleansers recently?",
  },
  {
    user: "yes i use cetaphil",
    ai: "That’s a gentle cleanser — good choice. Do you also experience flakiness or tightness during the day?",
  },
  {
    user: "yeah especially around my nose",
    ai: "We might need to build a richer barrier for that zone. I recommend ingredients like ceramides and hyaluronic acid.",
  },
  {
    user: "cool",
    ai: "Want me to help you build a simple morning routine for dry skin?",
  },
];
