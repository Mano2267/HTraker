export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

export const isValidPassword = (password) => {
  // At least 8 chars, one letter, one number - mirrors original password policy
  if (!password || password.length < 8) return false;
  return /[A-Za-z]/.test(password) && /[0-9]/.test(password);
};

export const isLikelyMedicalReport = (text) => {
  if (!text || text.trim().length < 50) return false;
  const keywords = [
    "hemoglobin",
    "wbc",
    "rbc",
    "platelet",
    "glucose",
    "cholesterol",
    "creatinine",
    "report",
    "test",
    "reference range",
    "patient",
    "lab",
  ];
  const lower = text.toLowerCase();
  const hits = keywords.filter((k) => lower.includes(k)).length;
  return hits >= 2;
};
