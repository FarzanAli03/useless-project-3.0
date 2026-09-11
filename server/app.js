const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: "http://localhost:3000"
}));
app.use(express.json());



//Routes

app.post("/validate", async (req, res) => {
    const { level, subject, hatedTopic } = req.body;

    const prompt = `
Determine whether the following input is relevant for generating a boring
study topic.

Level: ${level}
Subject: ${subject}
Hated topic: ${hatedTopic}

Return ONLY JSON in this format:
{
    "relevant": true
}

Return false if the fields are missing, nonsensical, or unrelated to studying.
`;

    try {
        const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
            {
            role: "user",
            content: prompt
            }
        ],
        response_format: {
            type: "json_object"
        }
        });

        const data = JSON.parse(response.choices[0].message.content);

        res.json(data);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
});

app.post("/generate" , async (req , res) => {
    const { level, subject, hatedTopic } = req.body;

    const contents = `
Generate one ordinary, boring, academically appropriate topic for a student.

Student level: ${level}
Subject: ${subject}
Topic the student dislikes: ${hatedTopic || "None specified"}

Instructions:

1. Choose ONE topic that is directly related to the student's subject and
   appropriate for their academic level.

2. The topic should be ordinary, technical, and mildly tedious rather than
   exciting or entertaining.

3. If a disliked topic is provided, DO NOT use that exact topic.
   Instead, choose another topic from the same subject that the student
   is likely to find equally boring.

4. Explain the chosen topic in a detailed, textbook-like manner.

5. Write a LONG explanation consisting of approximately 5-8 substantial
   paragraphs.

6. Each paragraph should introduce or explain different information.
   Do NOT repeat the same sentences, ideas, or definitions unnecessarily.

7. Include relevant:
   - definitions
   - classifications
   - characteristics
   - processes or steps
   - technical terminology
   - basic relationships between concepts
   - practical or academic significance where appropriate

8. Keep the explanation factually accurate and appropriate for the
   student's level. Do not invent facts.

9. Use a formal, dry, monotonous academic tone.
   Avoid jokes, storytelling, emotional language, dramatic wording,
   rhetorical questions, and unnecessary enthusiasm.

10. Do not add a conclusion that merely repeats the introduction.

Return ONLY valid JSON with exactly these fields:

{
  "topic": "The selected topic",
  "level": "${level}",
  "description": "The complete multi-paragraph explanation"
}

Do not include Markdown, code fences, commentary, or any fields other
than topic, level, and description.
`;

    try {
        const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
            {
            role: "user",
            content: contents
            }
        ],
        response_format: {
            type: "json_object"
        }
        });

        const data = JSON.parse(response.choices[0].message.content);

        res.json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: error.message
        });
    }
    
})

app.post("/make-it-drier", async (req, res) => {
    const { description } = req.body;

    const prompt = `
Rewrite the following academic description to make it significantly
longer, drier, more monotonous, and more tedious to read.

IMPORTANT REQUIREMENTS:

1. Preserve the EXACT same subject and factual meaning.
2. Do NOT change the topic.
3. Do NOT introduce unrelated concepts.
4. Do NOT remove important information from the original.
5. Expand the explanation by adding mundane but relevant academic detail.
6. Elaborate on definitions, characteristics, classifications, processes,
   terminology, relationships, and basic implications where appropriate.
7. Add ordinary textbook-style explanations that are factually relevant
   but not particularly interesting.
8. Make the explanation substantially longer than the original.
9. Use a formal, neutral, academic, textbook-like tone.
10. Make the writing monotonous and unnecessarily detailed.
11. Avoid jokes, storytelling, enthusiasm, emotional language,
    dramatic wording, rhetorical questions, and interesting anecdotes.
12. Do NOT literally repeat the same sentence multiple times.
13. Do NOT repeat the same idea merely to increase the word count.
14. Every added paragraph should contain relevant information or
    clarification about the existing subject.
15. Do NOT invent facts, statistics, examples, or claims.
16. Do NOT add a conclusion that simply repeats everything already stated.

The goal is to make the reader think:
"This contains far more academic explanation than I needed."

Current description:

${description}

Return ONLY valid JSON with exactly this structure:

{
  "description": "The rewritten, significantly longer, drier explanation"
}

Do not include Markdown, code fences, commentary, or any additional fields.
`;

    try {
        const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
            {
            role: "user",
            content: prompt
            }
        ],
        response_format: {
            type: "json_object"
        }
        });

        const result = JSON.parse(
        response.choices[0].message.content
        );

        res.json(result);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
});


app.post("/sleeping-pill", async (req, res) => {
    const prompt =  `
Pick one completely random, extremely ordinary educational topic.

Every request should generate a new and different topic.
Do not use any information from the user.
Do not ask for a topic.
Do not continue or transform a previous topic.

Choose a mundane academic topic from any educational field, such as:
history, geography, biology, chemistry, physics, mathematics,
economics, law, engineering, agriculture, geology, astronomy,
or social science.

Avoid exciting, famous, controversial, or entertaining topics.

Then write a very long, boring, dry explanation of that topic.

The explanation should be:
- factual
- textbook-like
- monotonous
- unnecessarily detailed
- dull and sleep-inducing
- repetitive in style, but do not literally repeat sentences

Avoid jokes, excitement, storytelling, dramatic language,
interesting examples, and engaging explanations.

Return ONLY valid JSON in exactly this format:

{
  "topic": "...",
  "description": "..."
}
`;

    try {
        const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
            {
            role: "user",
            content: prompt
            }
        ],
        response_format: {
            type: "json_object"
        }
        });

        const result = JSON.parse(
        response.choices[0].message.content
        );

        res.json(result);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});