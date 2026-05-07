import { useState } from "react";
import API from "../api";

function Upload() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMsg(res.data.message);
    } catch (err) {
      setMsg("Upload failed");
    }
  };

  return (
    <div>
      <h2>📄 Upload PDF</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload}>
        Upload
      </button>

      <p>{msg}</p>
    </div>
  );
}

export default Upload;