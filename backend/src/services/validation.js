const allowedLanguages = ["de", "fr", "it"];
const MAX_NAME_LENGTH = 200;
const MAX_ROLE_LENGTH = 200;
const MAX_Q3_ITEMS = 20;
const MAX_Q3_ITEM_LENGTH = 500;

export function validateSurveyPayload(body, kesbAuthorities) {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid payload" };
  }

  const { language, kesb, name, role, q1, q2, q3 } = body;

  if (!allowedLanguages.includes(language)) {
    return { valid: false, error: "Unsupported language" };
  }

  if (!kesbAuthorities.find((item) => item.name === kesb)) {
    return { valid: false, error: "KESB selection not recognised" };
  }

  if (!name || typeof name !== "string" || name.trim().length < 1) {
    return { valid: false, error: "Name is required" };
  }

  if (name.trim().length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Name must be at most ${MAX_NAME_LENGTH} characters` };
  }

  if (!role || typeof role !== "string" || role.trim().length < 1) {
    return { valid: false, error: "Role is required" };
  }

  if (role.trim().length > MAX_ROLE_LENGTH) {
    return { valid: false, error: `Role must be at most ${MAX_ROLE_LENGTH} characters` };
  }

  if (q1 !== "yes" && q1 !== "no") {
    return { valid: false, error: "Question q1 must be yes or no" };
  }

  if (q1 === "yes" && q2 !== "yes" && q2 !== "no") {
    return { valid: false, error: "Follow-up q2 must be answered" };
  }

  if (q1 === "no" && (!q3 || !Array.isArray(q3) || q3.length === 0)) {
    return { valid: false, error: "Please provide at least one reason for q3" };
  }

  if (q1 === "no") {
    if (q3.length > MAX_Q3_ITEMS) {
      return { valid: false, error: `At most ${MAX_Q3_ITEMS} reasons are allowed` };
    }
    if (q3.some((item) => typeof item !== "string" || item.length > MAX_Q3_ITEM_LENGTH)) {
      return { valid: false, error: `Each reason must be at most ${MAX_Q3_ITEM_LENGTH} characters` };
    }
  }

  return {
    valid: true,
    value: {
      language,
      kesb,
      name: name.trim(),
      role: role.trim(),
      q1,
      q2,
      q3: Array.isArray(q3) ? q3.join("; ") : q3,
    },
  };
}

