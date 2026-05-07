import { useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState("")
  const [msg, setMsg] = useState("")

  // Upload PDF
  const handleUpload = async () => {
    if (!file) {
      setMsg("Please select a file")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      setMsg(data.message)
    } catch (err) {
      setMsg("Upload failed")
    }
  }

  // Ask Question
  const askQuestion = async () => {
    if (!query) return

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/query?q=${query}`,
        { method: "POST" }
      )

      const data = await res.json()
      setAnswer(data.answer)
    } catch (err) {
      setAnswer("Error getting answer")
    }
  }

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      
      <h1>📘 InsightAI RAG System</h1>

      {/* UPLOAD SECTION */}
      <div style={{ marginBottom: "30px" }}>
        <h2>📄 Upload PDF</h2>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleUpload} style={{ marginLeft: "10px" }}>
          Upload
        </button>

        <p>{msg}</p>
      </div>

      <hr />

      {/* QUERY SECTION */}
      <div style={{ marginTop: "20px" }}>
        <h2>❓ Ask Question</h2>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask something..."
          style={{ width: "300px", padding: "5px" }}
        />

        <button onClick={askQuestion} style={{ marginLeft: "10px" }}>
          Ask
        </button>
      </div>

      {/* ANSWER SECTION */}
      <div style={{ marginTop: "30px" }}>
        <h2>🧠 Answer</h2>
        <p>{answer}</p>
      </div>

    </div>
  )
}

export default App