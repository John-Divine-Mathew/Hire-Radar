import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config'; 

// Initialize the client. 
// NOTE: For client-side environments, use the /web entrypoint if available.
const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });

export default function ResumeParser() {
    const ResumeSchema = {
        type: "OBJECT",
        properties: {
            name: { type: "STRING", description: "The candidate's full name, cleaned up from any repetitions." },
            phone: { type: "STRING", description: "The primary contact phone number." },
            email: { type: "STRING", description: "The primary email address." },
            target_role: { type: "STRING", description: "The current professional title or target role implied by the summary." },
            skills: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "Key technical and soft skills extracted from the resume."
            },
            experience: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                company: { type: "STRING" },
                role: { type: "STRING" },
                duration: { type: "STRING", description: "Dates or time period, e.g., 'May-July 2026'" },
                highlights: { type: "ARRAY", items: { type: "STRING" } }
                },
                required: ["company", "role", "duration", "highlights"]
            }
            }
        },
        required: ["name", "phone", "email", "target_role", "skills", "experience"]
    };



  const [rawText, setRawText] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following unstructured raw text extracted from a resume. Extract all relevant fields accurately. Clean up any obvious OCR repetitions:\n\n${rawText}`,
        config: {
          // Tell the model to output strict JSON matching our schema
          responseMimeType: "application/json",
          responseSchema: ResumeSchema,
          temperature: 0.1,
        }
      });

      // The response.text is guaranteed to be a valid JSON string matching your schema
      const jsonOutput = JSON.parse(response.text);
      setParsedData(jsonOutput);
      console.log("Parsed Resume Data:", jsonOutput);
    } catch (error) {
      console.error("Failed to parse resume:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>AI Resume Parser</h2>
      <textarea
        rows="10"
        style={{ width: '100%', marginBottom: '10px' }}
        placeholder="Paste messy resume text here..."
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
      />
      
      <button onClick={handleParse} disabled={loading}>
        {loading ? 'Parsing...' : 'Extract Data'}
      </button>

      {parsedData && (
        <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
          <h3>Extracted Profile:</h3>
          <p><strong>Name:</strong> {parsedData.name}</p>
          <p><strong>Email:</strong> {parsedData.email}</p>
          <p><strong>Phone:</strong> {parsedData.phone}</p>
          <p><strong>Implied Role:</strong> {parsedData.target_role}</p>
          
          <h4>Experience Matrix:</h4>
          {parsedData.experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <strong>{exp.role}</strong> at {exp.company} ({exp.duration})
              <ul>
                {exp.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}