
import { GROUNDED_CHAT_SYSTEM_PROMPT } from "../lib/ai/prompts";
import { GroundedResponse } from "../lib/ai/reasoning";

// Mock implementation of parseAIOutput for testing
function testParseAIOutput(text: string): GroundedResponse {
    const lines = text.split("\n");
    let answer = "";
    let citations = "";
    let confidence: GroundedResponse["confidence"] = "Not Found";

    let currentSection: "answer" | "citations" | "confidence" | null = null;

    for (const line of lines) {
        const trimmed = line.trim();
        // Handle variations like "Answer:", "- Answer:", "• Answer:"
        const cleanLine = trimmed.replace(/^[-•]\s*/, "");

        if (cleanLine.toLowerCase().startsWith("answer:")) {
            currentSection = "answer";
            answer = cleanLine.substring(7).trim();
            continue;
        } else if (cleanLine.toLowerCase().startsWith("citations:")) {
            currentSection = "citations";
            citations = cleanLine.substring(10).trim();
            continue;
        } else if (cleanLine.toLowerCase().startsWith("confidence level:")) {
            currentSection = "confidence";
            const level = cleanLine.substring(17).trim();
            if (level.includes("High")) confidence = "High";
            else if (level.includes("Partial")) confidence = "Partial";
            else confidence = "Not Found";
            continue;
        }

        if (currentSection === "answer") {
            answer += (answer ? "\n" : "") + trimmed;
        } else if (currentSection === "citations") {
            citations += (citations ? "\n" : "") + trimmed;
        }
    }

    return {
        answer: answer || "This document does not contain that information.",
        citations: citations || "None",
        confidence: confidence
    };
}

console.log("--- TEST 1: Standard Format ---");
const output1 = `
Answer:
This is a test response.
It has multiple lines.

Citations:
Page 1, Section 2

Confidence Level:
High
`;
console.log(testParseAIOutput(output1));

console.log("\n--- TEST 2: Bulleted Format ---");
const output2 = `
- Answer:
  This is a bulleted response.

- Citations:
  Source ID: 456

- Confidence Level:
  Partial
`;
console.log(testParseAIOutput(output2));

console.log("\n--- TEST 3: Dot Bullet Format ---");
const output3 = `
• Answer:
  This uses a dot bullet.

• Citations:
  None

• Confidence Level:
  Not Found
`;
console.log(testParseAIOutput(output3));

console.log("\n--- System Prompt Verification ---");
if (GROUNDED_CHAT_SYSTEM_PROMPT.includes("VOICE-FIRST CHATBOT STYLE")) {
    console.log("✅ System prompt updated correctly.");
} else {
    console.log("❌ System prompt update FAILED.");
}
