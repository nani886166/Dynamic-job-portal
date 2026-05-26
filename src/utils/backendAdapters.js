export const extractList = (data, keys = []) => {
  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  return Array.isArray(data) ? data : [];
};

export const toArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export const getId = (item) => item?.id || item?._id;

export const getMediaUrl = (path) => {
  const value = typeof path === "object" ? path?.url || path?.secure_url : path;

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const backendOrigin = apiBase.replace(/\/api\/?$/, "");
  return `${backendOrigin}${String(value).startsWith("/") ? value : `/${value}`}`;
};

export const getJobId = (item) =>
  item?.job?.id ||
  (item?.job && typeof item.job !== "object" ? item.job : null) ||
  item?.job_details?.id ||
  (item?.job_details && typeof item.job_details !== "object" ? item.job_details : null) ||
  item?.job_id ||
  item?.jobId ||
  item?.id ||
  item?._id ||
  null;

export const sameId = (left, right) => String(left) === String(right);

export const hasId = (ids, id) => (ids || []).some((item) => sameId(item, id));

export const normalizeUser = (user = {}) => ({
  ...user,
  id: user.id || user._id,
  firstName: user.firstName || user.first_name || "",
  lastName: user.lastName || user.last_name || "",
  role: user.is_superuser || user.is_staff ? "admin" : user.role,
  displayRole: user.role === "seeker" ? "Candidate" : user.role === "hr" ? "HR" : user.role,
  isSuspended:
    user.isSuspended !== undefined ? user.isSuspended : user.is_active === false,
});

export const normalizeProfile = (profile = {}) => {
  const user = normalizeUser(profile.user || profile);
  const skills = toArray(profile.skills);

  return {
    ...profile,
    user,
    id: profile.id || profile._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: profile.email || user.email,
    role: user.role || profile.role,
    fullName: profile.full_name || `${user.firstName} ${user.lastName}`.trim(),
    image: getMediaUrl(profile.profile_picture || profile.profilePicture),
    profileImage: getMediaUrl(profile.profile_picture || profile.profileImage),
    resume: getMediaUrl(profile.resume),
    linkedin: profile.linkedin_url || profile.linkedin,
    github: profile.github_url || profile.github,
    portfolio: profile.portfolio_url || profile.portfolio,
    company: profile.company_name || profile.company,
    companyName: profile.company_name || profile.companyName,
    companyWebsite: profile.company_website || profile.companyWebsite,
    skills,
    candidateProfile: {
      ...(profile.candidateProfile || {}),
      skills,
      appliedJobs: user.appliedJobs || profile.appliedJobs || [],
      savedJobs: user.savedJobs || profile.savedJobs || [],
    },
  };
};

export const normalizeJob = (job = {}) => ({
  ...job,
  id: job.id || job._id,
  jobType: job.job_type || job.jobType,
  type: job.job_type || job.jobType,
  isRemote: job.is_remote ?? job.isRemote,
  salaryMin: job.salary_min ?? job.salaryMin,
  salaryMax: job.salary_max ?? job.salaryMax,
  skillsRequired: toArray(job.skills_required || job.skillsRequired || job.skills),
  requirements: toArray(job.skills_required || job.requirements || job.skillsRequired),
  postedBy: job.posted_by || job.postedBy,
  postedByEmail: job.posted_by_email || job.postedByEmail,
  postedByName: job.posted_by_name || job.postedByName,
  isOwner: job.is_owner ?? job.isOwner,
  createdAt: job.created_at || job.createdAt,
  updatedAt: job.updated_at || job.updatedAt,
  isInternal: true,
});

export const getErrorMessage = (error, fallback = "Something went wrong") => {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.message || data.detail || data.error) {
    return data.message || data.detail || data.error;
  }

  const values = Object.values(data)
    .flat()
    .filter(Boolean)
    .map((value) => (typeof value === "string" ? value : JSON.stringify(value)));

  return values.length ? values.join(" ") : fallback;
};

export const jobToBackendPayload = (data = {}) => ({
  title: data.title,
  company: data.company,
  description: data.description,
  location: data.location,
  is_remote:
    data.isRemote ??
    data.is_remote ??
    (data.jobType === "remote" ||
      String(data.location || "").toLowerCase().includes("remote")),
  job_type: data.jobType || data.job_type || "full_time",
  salary_min: data.salaryMin || data.salary_min || null,
  salary_max: data.salaryMax || data.salary_max || null,
  skills_required: toArray(data.skillsRequired || data.skills_required || data.requirements),
});

export const profileToBackendPayload = (data = {}, role) => {
  const payload = {
    phone: data.phone || "",
    address: data.address || data.location || "",
    bio: data.bio || data.headline || "",
    linkedin_url: data.linkedin || data.linkedin_url || "",
    github_url: data.github || data.github_url || "",
    portfolio_url: data.portfolio || data.website || data.portfolio_url || "",
  };

  if (role === "hr") {
    payload.company_name = data.companyName || data.company || data.company_name || "";
    payload.company_website = data.companyWebsite || data.company_website || "";
    payload.designation = data.designation || data.headline || "";
  } else {
    payload.skills = toArray(data.skills);
    payload.experience = data.experience || "";
    payload.education = data.education || "";
  }

  return payload;
};
