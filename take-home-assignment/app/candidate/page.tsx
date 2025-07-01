'use client';
import { useState } from 'react';
import { SessionData } from '../types/session';

export default function CandidatePage() {
  const [sessionId, setSessionId] = useState('');
  const [details, setDetails] = useState<SessionData | null>(null);

  const handleFetch = async () => {
    const response = await fetch(`/api/candidate/${sessionId}/get-details`);
    const data = await response.json();
    setDetails(data);
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col gap-4 text-black">
      <input
        type="text"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        placeholder="Enter session ID"
        className="border p-2 rounded"
      />
      <button onClick={handleFetch} className="bg-black border border-gray-700 hover:border-gray-700 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
        Fetch
      </button>
      {details && (
        <div className="border p-4 rounded text-white">
          <h2 className="font-bold">{details.fields.name}</h2>
          <p><strong>Email:</strong> {details.fields.email}</p>
          <p><strong>Phone:</strong> {details.fields.phone}</p>
          <p><strong>Available:</strong> {details.fields.available}</p>
          <p><strong>Skills:</strong> {details.fields.skills.join(', ')}</p>
          <div className="mt-2">
            <h3 className="font-semibold">Additional Questions:</h3>
            <ul className="list-disc pl-5">
              {details.additionalQuestions.map((question) => (
                <li key={question.id}>
                  <strong>{question.questionText}</strong>: {question.content ?? <em>No answer</em>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
