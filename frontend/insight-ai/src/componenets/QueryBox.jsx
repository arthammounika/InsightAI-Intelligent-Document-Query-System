import { useState } from "react";
import API from "../api";

function QueryBox({ setAnswer }) {
  const [query, setQuery] = useState("");

  const askQuestion = async () => {
    try {
      const res = await API.post(`/query?q=${query}`);
      setAnswer(res.data.answer);
    } catch (err) {
      setAnswer("Error fetching answer");
    }
  };

  return (
    <div>
      <h2>❓ Ask Question</h2>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask something..."
      />

      <button onClick={askQuestion}>
        Ask
      </button>
    </div>
  );
}

export default QueryBox;