import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Groq client
# Ensure GROQ_API_KEY is set in your .env file
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def generate_disease_report(disease_name: str, confidence: float, top_probs: list[str] = None) -> str:
    """
    Generates a short (<120 words) report for the detected disease using Groq API.
    """
    try:
        # Construct the prompt
        top_probs_text = ""
        if top_probs:
            top_probs_text = f"Additional context from the model (Top 3 matches): {', '.join(top_probs)}."

        prompt = (
            f"You are an expert plant pathologist. "
            f"The user has uploaded a crop image detected as '{disease_name}' with {confidence:.1%} confidence. "
            f"{top_probs_text} "
            f"Provide a very short report (under 120 words). "
            f"1. Briefly explain what this condition is (or if it's healthy). "
            f"2. Give concrete, actionable advice on what the farmer should do next. "
            f"3. Be professional but encouraging. "
            f"Do not use markdown formatting like bolding, just plain text or simple bullets if needed. "
            f"Keep it extremely concise."
        )

        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.6,
            max_completion_tokens=1024, # sufficient for short text
            top_p=1,
            stream=False, # We want the full response for the API
            stop=None
        )

        return completion.choices[0].message.content or "No report generated."

    except Exception as e:
        print(f"Error generating LLM report: {e}")
        return "Could not generate AI insight at this time. Please rely on the classification result."
