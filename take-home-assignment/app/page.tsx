'use client';
import { useEffect, useState } from "react";
import { SessionData } from "./types/session";

export default function Home() {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/candidates/list")
      .then((response) => response.json())
      .then((data) => setCandidates(data.data))
      .catch((error) => console.error("Error fetching candidates:", error));
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <div className="flex flex-col">
            {candidates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {candidates.map((candidate: SessionData) => (
                    <div key={candidate.sessionId} className="border p-4 rounded shadow">
                      <h2 className="font-bold mb-2">{candidate.fields.name}</h2>
                      <p><strong>Email:</strong> {candidate.fields.email}</p>
                      <p><strong>Phone:</strong> {candidate.fields.phone}</p>
                      <p><strong>Available:</strong> {candidate.fields.available}</p>
                      <p><strong>Skills:</strong> {candidate.fields.skills.join(', ')}</p>
                      <div className="mt-2">
                        <h3 className="font-semibold">Additional Questions:</h3>
                        <ul className="list-disc pl-5">
                          {candidate.additionalQuestions.map((question) => (
                            <li key={question.id}>
                              <strong>{question.questionText}</strong>: {question.content ?? <em>No answer</em>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
            ) : (
              <p>No candidates available.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}