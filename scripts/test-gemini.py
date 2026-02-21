import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(".env.local")

# Use the correct environment variable name from .env.local
api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")

if not api_key:
    print("Error: GOOGLE_GENERATIVE_AI_API_KEY not found in .env.local")
    exit(1)

genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-flash-latest")
response = model.generate_content("Hello")
print(response.text)
