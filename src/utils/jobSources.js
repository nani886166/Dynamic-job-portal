import { extractList, normalizeJob, toArray } from "./backendAdapters";

export const isInternalJob = (job) => job?.source === "internal";

export const isExternalJob = (job) =>
  job?.source === "external";

export const isInternalBackendJob = (job) =>
  !isExternalJob(job) && Number.isInteger(Number(job?.id));

export const formatJobType = (jobType) => {
  if (!jobType) {
    return "Full-time";
  }

  return String(jobType)
    .replace(/_/g, "-")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
};

export const normalizeInternalJob = (rawJob) => {
  const job = normalizeJob(rawJob);

  return {
    ...job,
    id: job.id,
    company: job.company || job.companyName || "Company",
    type: formatJobType(job.jobType || job.type),
    posted: job.posted || job.createdAt || "Recently",
    created: job.createdAt,
    requirements: job.skillsRequired || job.requirements || [],
    skills: toArray(job.skillsRequired || job.requirements || job.skills),
    source: "internal",
    isInternal: true,
  };
};

export const normalizeExternalJob = (rawJob) => {
  const company = rawJob.company?.display_name || rawJob.company || "Company";
  const location =
    rawJob.location?.display_name ||
    rawJob.location ||
    "Location unavailable";
  const salaryParts = [rawJob.salary_min, rawJob.salary_max].filter(Boolean);

  return {
    id: `external-${rawJob.id}`,
    externalId: rawJob.id,
    title: rawJob.title || "Untitled role",
    company,
    location,
    description: rawJob.description || "",
    salary: salaryParts.length ? salaryParts.join(" - ") : "",
    type: rawJob.contract_time ? formatJobType(rawJob.contract_time) : "External",
    redirect_url: rawJob.redirect_url,
    source: "external",
    isInternal: false,
    posted: rawJob.created || "Recently",
    created: rawJob.created,
    skills: [],
    requirements: [],
  };
};

export const readAdzunaConfig = () => ({
  appId: import.meta.env.VITE_ADZUNA_APP_ID,
  appKey: import.meta.env.VITE_ADZUNA_APP_KEY,
});

export const fetchAdzunaJobs = async ({
  what = "developer",
  where = "Bangalore",
  page = 1,
} = {}) => {
  const { appId, appKey } = readAdzunaConfig();

  if (!appId || !appKey) {
    return {
      jobs: [],
      configured: false,
      message: "External jobs API key not configured.",
    };
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what,
    where,
  });

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/in/search/${page}?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("External jobs are not available right now.");
  }

  const data = await response.json();
  return {
    jobs: extractList(data, ["results"]).map(normalizeExternalJob),
    configured: true,
  };
};
