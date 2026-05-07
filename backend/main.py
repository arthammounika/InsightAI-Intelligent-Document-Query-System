from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import re

# LangChain imports
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# LLM
from transformers import pipeline

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global DB
db = None

# ✅ Lightweight LLM (stable)
qa_pipeline = pipeline(
    "text-generation",
    model="gpt2"
)

# ✅ Clean text
def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


# ✅ Home
@app.get("/")
def home():
    return {"message": "InsightAI backend running"}


# ✅ Upload API
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global db

    filepath = f"temp_{file.filename}"

    with open(filepath, "wb") as f:
        f.write(await file.read())

    print("File saved:", filepath)

    loader = PyPDFLoader(filepath)
    docs = loader.load()

    print("Docs loaded:", len(docs))

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(docs)

    print("Chunks created:", len(chunks))

    embeddings = HuggingFaceEmbeddings()

    db = FAISS.from_documents(chunks, embeddings)

    print("DB created successfully")

    return {"message": "Document processed and stored"}


# ✅ Query API (RAG + LLM)
@app.post("/query")
async def query(q: str = Query(...)):
    global db

    if db is None:
        return {"answer": "Please upload a document first"}

    # 🔹 Step 1: Retrieve relevant chunks
    results = db.similarity_search_with_score(q, k=2)

    if not results:
        return {"question": q, "answer": "No"}

    context = " ".join([clean_text(doc.page_content) for doc, _ in results])

    # 🔹 Step 2: Check similarity score (important)
    best_score = results[0][1]
    print("Score:", best_score)

    # If not relevant → No
    if best_score > 1.2:
        return {"question": q, "answer": "No"}

    # 🔹 Step 3: Controlled prompt
    prompt = f"""
Answer the question using ONLY the context below.
If answer is not present, say "No".

Context:
{context}

Question:
{q}

Answer:
"""

    # 🔹 Step 4: Generate answer
    result = qa_pipeline(
        prompt,
        max_length=120,
        do_sample=False,
        temperature=0.0
    )

    answer = result[0]["generated_text"].replace(prompt, "").strip()

    # 🔹 Safety fallback
    if len(answer) < 3:
        answer = "No"

    return {
        "question": q,
        "answer": answer
    }