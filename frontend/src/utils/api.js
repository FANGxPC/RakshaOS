// Ensure we dynamically detect the host so mobile devices can hit the backend
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8000/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
};

const API_BASE_URL = getApiBaseUrl();

export async function analyzeInput(inputType, content) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input_type: inputType,
        content: content,
        language_hint: "auto"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to analyze input");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export async function generateRecoveryDraft(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/recovery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to generate recovery draft");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
