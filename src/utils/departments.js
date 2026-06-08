export const DEPARTMENTS = [
  { code: "COM", name: "Commercial" },
  { code: "FIN", name: "Finance" },
  { code: "TEC", name: "Technology" },
  { code: "HR", name: "HR" },
  { code: "MDO", name: "MD's Office" },
  { code: "LCR", name: "Legal, Compliance, & Risk" },
  { code: "IT", name: "Information Technology" },
  { code: "COR", name: "Corporate Affairs" },
];

export const formatDepartment = ({ code, name }) => `${code} - ${name}`;

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((dept) => ({
  value: formatDepartment(dept),
  label: formatDepartment(dept),
}));

const LEGACY_DEPARTMENT_MAP = {
  Commercial: "COM - Commercial",
  Finance: "FIN - Finance",
  Technology: "TEC - Technology",
  IT: "TEC - Technology",
  Risk: "LCR - Legal, Compliance, & Risk",
  "Risk, Compilance & Legal": "LCR - Legal, Compliance, & Risk",
  "Human Capital": "HR - HR",
  HR: "HR - HR",
};

export const normalizeDepartment = (value) => {
  if (!value) return "";

  const exactMatch = DEPARTMENT_OPTIONS.find((opt) => opt.value === value);
  if (exactMatch) return exactMatch.value;

  const byCode = DEPARTMENTS.find((dept) => dept.code === value);
  if (byCode) return formatDepartment(byCode);

  const byName = DEPARTMENTS.find((dept) => dept.name === value);
  if (byName) return formatDepartment(byName);

  return LEGACY_DEPARTMENT_MAP[value] || value;
};
