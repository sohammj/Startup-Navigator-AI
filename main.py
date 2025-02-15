from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware  
import google.generativeai as genai  

# Set up Gemini API key
genai.configure(api_key="")  

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequestModel(BaseModel):
    prompt: str

@app.post("/generate")
async def generate_text(req: RequestModel):
    try:
        model = genai.GenerativeModel("gemini-pro")  # Use Google's Gemini Pro model
        response = model.generate_content(req.prompt)
        return {"response": response.text.strip()}
    except Exception as e:
        return {"response": f"Error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
