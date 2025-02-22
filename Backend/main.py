from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware  
import google.generativeai as genai  

genai.configure(api_key="AIzaSyB_bUMp_rvkgOGK0k0b8e1ggs7m4zo_S-I")  

app = FastAPI()
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
        model = genai.GenerativeModel("gemini-pro")  
        response = model.generate_content(req.prompt)
        return {"response": response.text.strip()}
    except Exception as e:
        return {"response": f"Error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
