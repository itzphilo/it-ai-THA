'use client';
import { useState } from 'react';
import { SessionData } from '../types/session';

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-black text-white rounded-lg shadow-lg p-6 min-w-[320px] relative border border-gray-700">
        <button className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
}

type ErrorResponse = {
  error: string;
  missingFields?: { path: (string | number)[]; message: string }[];
  candidate?: any;
};

type DetailsType = SessionData | ErrorResponse;

function isErrorResponse(details: DetailsType): details is ErrorResponse {
  return typeof details === 'object' && details !== null && 'error' in details;
}

function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function CandidatePage() {
  const [sessionId, setSessionId] = useState('');
  const [details, setDetails] = useState<DetailsType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formState, setFormState] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [verifyData, setVerifyData] = useState<any | null>(null);
  const [mergeSubmitting, setMergeSubmitting] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [mergeSuccess, setMergeSuccess] = useState(false);

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
          {isErrorResponse(details) ? (
            <>
              <div>
                <h2 className="font-bold text-red-400">{details.error}</h2>
                {Array.isArray(details.missingFields) && details.missingFields.length > 0 && (
                  <ul className="list-disc pl-4 mt-2">
                    {details.missingFields.map((field, idx) => (
                      <li key={idx} className="text-red-300">
                        {Array.isArray(field.path) ? field.path.join('.') : field.path}: {field.message}
                      </li>
                    ))}
                  </ul>
                )}
                {Array.isArray(details.missingFields) && details.missingFields.length > 0 && details.candidate && (
                  <button
                    className="mt-4 bg-black border border-gray-700 hover:border-gray-700 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    onClick={() => {
                      const newState: { [key: string]: string } = {};
                      (details.missingFields ?? []).forEach(f => {
                        const key = Array.isArray(f.path) ? f.path.join('.') : String(f.path);
                        let value = '';
                        if (details.candidate.fields && typeof f.path[1] === 'string') {
                          value = details.candidate.fields[f.path[1]] ?? '';
                        }
                        newState[key] = value;
                      });
                      setFormState(newState);
                      setModalOpen(true);
                    }}
                  >
                    Update Details
                  </button>
                )}
              </div>
              {details.candidate && (
                <div className="mt-4 p-4 border-t border-gray-700">
                  <h2 className="font-bold">{details.candidate.fields?.name}</h2>
                  {details.candidate.fields?.email && <p><strong>Email:</strong> {details.candidate.fields.email}</p>}
                  {details.candidate.fields?.phone && <p><strong>Phone:</strong> {details.candidate.fields.phone}</p>}
                  <p><strong>Available:</strong> {details.candidate.fields?.available ?? <em>Missing</em>}</p>
                  <p><strong>Skills:</strong> {Array.isArray(details.candidate.fields?.skills) ? details.candidate.fields.skills.join(', ') : <em>Missing</em>}</p>
                  <div className="mt-2">
                    <h3 className="font-semibold">Additional Questions:</h3>
                    <ul className="list-disc pl-5">
                      {Array.isArray(details.candidate.additionalQuestions) && details.candidate.additionalQuestions.length > 0 ? (
                        details.candidate.additionalQuestions.map((question: any) => (
                          <li key={question.id}>
                            <strong>{question.questionText}</strong>: {question.content ?? <em>No answer</em>}
                          </li>
                        ))
                      ) : <li><em>No questions</em></li>}
                    </ul>
                  </div>
                </div>
              )}
              <Modal open={modalOpen} onClose={() => {
                setModalOpen(false);
                setVerifyData(null);
                setSubmitting(false);
                setSubmitError(null);
                setMergeError(null);
                setMergeSuccess(false);
                }}>
                {verifyData ? (
                    <div>
                    <h2 className="text-lg font-bold mb-4">Verify Candidate Data</h2>
                    <div className="mb-4 p-2 border rounded bg-gray-100 text-black">
                        <pre className="overflow-x-auto text-xs whitespace-pre-wrap bg-gray-900 text-white p-2 rounded border border-gray-700">{JSON.stringify(verifyData, null, 2)}</pre>
                    </div>
                    {mergeError && <div className="text-red-600 mb-2">{mergeError}</div>}
                    {mergeSuccess && <div className="text-green-600 mb-2">Candidate merged successfully!</div>}
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2"
                        disabled={mergeSubmitting}
                        onClick={async () => {
                        setMergeSubmitting(true);
                        setMergeError(null);
                        setMergeSuccess(false);
                        try {
                            const res = await fetch('/api/candidates/list', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(verifyData),
                            });
                            if (!res.ok) throw new Error('Failed to merge candidate');
                            setMergeSuccess(true);
                            if (verifyData && verifyData.fields) {
                              const correctedData: Record<string, any> = {};
                              Object.entries(verifyData.fields).forEach(([k, v]) => {
                                if (Array.isArray(v)) {
                                  correctedData[k] = v.join(', ');
                                } else {
                                  correctedData[k] = v;
                                }
                              });
                              // Add additionalQuestions fields if present
                              if (Array.isArray(verifyData.additionalQuestions)) {
                                for (const q of verifyData.additionalQuestions) {
                                  if (q.id === 'noticePeriod') correctedData.noticePeriod = q.content;
                                  if (q.id === 'experience') correctedData.experience = q.content;
                                  if (q.id === 'preferredLocation') correctedData.preferredLocation = q.content;
                                }
                              }
                              const downloadObj = {
                                sessionId: verifyData.sessionId || sessionId,
                                verified: true,
                                correctedData,
                                timestamp: new Date().toISOString()
                              };
                              downloadJSON(downloadObj, `${verifyData.sessionId || sessionId}_verified.json`);
                            }
                            setTimeout(() => {
                              setModalOpen(false);
                              setVerifyData(null);
                              handleFetch();
                            }, 1200);
                        } catch (err: any) {
                            setMergeError(err.message || 'Unknown error');
                        } finally {
                            setMergeSubmitting(false);
                        }
                        }}
                    >
                        {mergeSubmitting ? 'Merging...' : 'Merge'}
                    </button>
                    <button
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                        onClick={() => setVerifyData(null)}
                        disabled={mergeSubmitting}
                    >
                        Edit Again
                    </button>
                    </div>
                ) : (
                    <>
                    <h2 className="text-lg font-bold mb-4">Update Missing Details</h2>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
                        e.preventDefault();
                        setSubmitting(true);
                        setSubmitError(null);
                        try {
                            let candidateData = details && 'candidate' in details && details.candidate ? { ...details.candidate } : {};
                            if (!candidateData.fields) candidateData.fields = {};
                            Object.keys(formState).forEach(k => {
                            if (k.startsWith('fields.')) {
                                const fieldKey = k.replace('fields.', '');
                                candidateData.fields[fieldKey] = formState[k];
                            }
                            });
                            setVerifyData(candidateData);
                        } catch (err: any) {
                            setSubmitError('Could not prepare data for verification.');
                        } finally {
                            setSubmitting(false);
                        }
                        }}
                    >
                        {details.missingFields && details.missingFields.map((f, idx) => {
                        const key = Array.isArray(f.path) ? f.path.join('.') : String(f.path);
                        return (
                            <div key={key} className="mb-4">
              <label className="block text-sm font-semibold mb-1 text-white">{key.replace('fields.', '')}</label>
              <input
                className="w-full border border-gray-700 rounded px-2 py-1 bg-black text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                value={formState[key] || ''}
                onChange={e => setFormState({ ...formState, [key]: e.target.value })}
                required
              />
            </div>
                        );
                        })}
                        {submitError && <div className="text-red-600 mb-2">{submitError}</div>}
                        <button type="submit" className="bg-black hover:bg-grey-700 border border-gray-700 text-white px-4 py-2 rounded" disabled={submitting}>
                        {submitting ? 'Preparing...' : 'Review & Merge'}
                        </button>
                    </form>
                    </>
                )}
                </Modal>
            </>
          ) : (
            <>
              <h2 className="font-bold">{details.fields.name}</h2>
              <p><strong>Email:</strong> {details.fields.email}</p>
              <p><strong>Phone:</strong> {details.fields.phone}</p>
              <p><strong>Available:</strong> {details.fields.available}</p>
              <p><strong>Skills:</strong> {details.fields.skills.join(', ')}</p>
              <div className="mt-2">
                <h3 className="font-semibold">Additional Questions:</h3>
                <ul className="list-disc pl-5">
                  {details.additionalQuestions.map((question: any) => (
                    <li key={question.id}>
                      <strong>{question.questionText}</strong>: {question.content ?? <em>No answer</em>}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
