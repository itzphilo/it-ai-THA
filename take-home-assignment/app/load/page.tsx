'use client';
import { useState } from "react";
import { SessionData } from "../types/session";

export default function LoadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [candidates, setCandidates] = useState<SessionData[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<SessionData | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
  
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          try {
            const fileContents = JSON.parse(e.target.result as string) as SessionData[];
            setCandidates(fileContents);
            console.log("Parsed candidates:", fileContents);
          } catch (err) {
            alert("Invalid JSON file");
          }
        }
      };
  
      reader.readAsText(file);
    }
  };
  
  const handleLoadClick = async () => {
    if (selectedFile) {
      const response = await fetch("/api/candidates/list", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidates),
      });

      if (response.ok) {
        alert("Candidates loaded successfully");
      } else {
        alert("Error loading candidates");
      }
    }
  };

  const showList = candidates.length > 0;

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold">Load Candidates</h1>
      <input
        style={{
          backgroundColor: "#000",
          color: "#fff",
          padding: "0.5rem",
          borderRadius: "0.25rem",
          border: "1px solid #333",
        }}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="mt-4"
      />
      <button
        type="button"
        onClick={handleLoadClick}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Load
      </button>
      {showList && (
        <div className="mt-8">
          <h2 className="text-xl font-bold">Candidates List</h2>
          <ul className="list-disc pl-5">
            {candidates.map((candidate) => (
              <li
                key={candidate.sessionId}
                className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                onClick={() => setSelectedCandidate(candidate)}
              >
                <strong>{candidate.fields.name}</strong>
              </li>
            ))}
          </ul>
          {selectedCandidate && (
            <div className="mt-6 p-4 bg-black border rounded bg-gray-50">
              <h3 className="font-semibold mb-2">Selected Candidate JSON:</h3>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(selectedCandidate, null, 2)}
              </pre>
            </div>
          )}
      </div>
    )}
    </div>
  );
}
