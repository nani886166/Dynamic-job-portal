import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  applyForJobAsync,
  saveJobAsync,
  unsaveJobAsync,
} from "../features/AuthSlice";

import api from "../config/api";
import { deleteJob, getJobs } from "../api/jobs";

import {
  extractList,
  getErrorMessage,
  getJobId,
} from "../utils/backendAdapters";

import {
  MapPin,
  Briefcase,
  ExternalLink,
  Zap,
  Filter,
  Search,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

const ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID;
const ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY;

const formatJobType = (jobType) => {
  if (!jobType) return "Full-time";

  return String(jobType)
    .replace(/_/g, "-")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const isInternalJob = (job) => job?.source === "internal";
const isExternalJob = (job) => job?.source === "external";

const hasJobInList = (list = [], jobId) => {
  return list.some((item) => {
    const itemId =
      item?.id ||
      item?._id ||
      item?.job?.id ||
      item?.job?._id ||
      item?.job_id ||
      item?.jobId ||
      item;

    return String(itemId) === String(jobId);
  });
};

const normalizeInternalJob = (job = {}) => {
  const skills = toArray(
    job.skills_required || job.skillsRequired || job.requirements || job.skills
  );

  const salary =
    job.salary ||
    job.salary_range ||
    job.salaryRange ||
    (job.salary_min && job.salary_max
      ? `₹${job.salary_min} - ₹${job.salary_max}`
      : "");

  return {
    ...job,
    id: job.id || job._id,
    title: job.title || "Untitled Job",
    company:
      job.company ||
      job.company_name ||
      job.companyName ||
      job.posted_by?.company_name ||
      job.postedBy?.companyName ||
      "Company",
    location:
      job.location ||
      (job.is_remote || job.isRemote ? "Remote" : "Location not specified"),
    type: formatJobType(job.job_type || job.jobType || job.type),
    salary,
    description: job.description || "",
    skills,
    requirements: skills,
    posted_by: job.posted_by || job.postedBy,
    postedBy: job.postedBy || job.posted_by,
    is_owner: job.is_owner ?? job.isOwner,
    isOwner: job.isOwner ?? job.is_owner,
    source: "internal",
  };
};

const normalizeExternalJob = (job = {}) => {
  const salary =
    job.salary_min && job.salary_max
      ? `₹${Math.round(job.salary_min)} - ₹${Math.round(job.salary_max)}`
      : "";

  return {
    id: `external-${job.id}`,
    externalId: job.id,
    title: job.title || "Untitled Job",
    company: job.company?.display_name || "Company",
    location: job.location?.display_name || "Location not specified",
    type: formatJobType(job.contract_time || job.contract_type || "External"),
    salary,
    description: job.description || "",
    redirect_url: job.redirect_url,
    source: "external",
    skills: [],
    requirements: [],
    posted: job.created || "Recently",
  };
};

const fetchAdzunaJobs = async ({
  country = "in",
  page = 1,
  what = "developer",
  where = "",
  resultsPerPage = 20,
} = {}) => {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    return {
      jobs: [],
      configured: false,
      message:
        "External jobs API key missing. Add VITE_ADZUNA_APP_ID and VITE_ADZUNA_APP_KEY in Vercel, then redeploy.",
    };
  }

  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    what,
    results_per_page: String(resultsPerPage),
    "content-type": "application/json",
  });

  if (where) {
    params.set("where", where);
  }

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Adzuna API Error:", {
      status: response.status,
      statusText: response.statusText,
      errorText,
    });

    throw new Error(`External jobs API failed with status ${response.status}`);
  }

  const data = await response.json();

  return {
    jobs: Array.isArray(data.results)
      ? data.results.map(normalizeExternalJob)
      : [],
    configured: true,
    message: "",
  };
};

const BrowseJobs = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, currentRole, profile } = useSelector((state) => state.isAuth);

  const role =
    currentRole || user?.role || user?.user?.role || profile?.user?.role;

  const isCandidate = role === "seeker";

  const appliedJobs = user?.candidateProfile?.appliedJobs || [];
  const savedJobs = user?.candidateProfile?.savedJobs || [];

  const [activeTab, setActiveTab] = useState("internal");

  const [internalJobs, setInternalJobs] = useState([]);
  const [externalJobs, setExternalJobs] = useState([]);

  const [appliedJobIds, setAppliedJobIds] = useState([]);

  const [isLoadingInternal, setIsLoadingInternal] = useState(false);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);

  const [internalMessage, setInternalMessage] = useState("");
  const [externalMessage, setExternalMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedModes, setSelectedModes] = useState([]);

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const menuRef = useRef(null);

  const jobsPerPage = 6;

  const jobTypeOptions = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "External",
  ];

  const workModeOptions = ["Remote", "On-site"];

  const getApplicationJobId = (application) =>
    application?.job?.id ||
    application?.job?._id ||
    (application?.job && typeof application.job !== "object"
      ? application.job
      : null) ||
    application?.job_details?.id ||
    application?.job_id ||
    application?.jobId ||
    null;

  const getCurrentUserId = () =>
    user?.id || user?.user?.id || profile?.user?.id;

  const getPostedById = (job) => {
    if (job?.posted_by && typeof job.posted_by === "object") {
      return job.posted_by.id || job.posted_by._id;
    }

    if (job?.postedBy && typeof job.postedBy === "object") {
      return job.postedBy.id || job.postedBy._id;
    }

    return job?.posted_by || job?.posted_by_id || job?.postedBy;
  };

  const userOwnsJob = (job) =>
    role === "hr" &&
    isInternalJob(job) &&
    (job?.is_owner === true ||
      job?.isOwner === true ||
      String(getPostedById(job)) === String(getCurrentUserId()));

  const isJobApplied = (job) => {
    const jobId = getJobId(job);

    return (
      appliedJobIds.some((id) => String(id) === String(jobId)) ||
      hasJobInList(appliedJobs, jobId)
    );
  };

  const isJobSaved = (job) => {
    const jobId = getJobId(job);
    return hasJobInList(savedJobs, jobId);
  };

  useEffect(() => {
    const fetchInternalJobs = async () => {
      setIsLoadingInternal(true);
      setInternalMessage("");

      try {
        const jobsRes = await getJobs();

        const jobsData = extractList(jobsRes.data, ["jobs", "results"]);

        const normalizedJobs = Array.isArray(jobsData)
          ? jobsData.map(normalizeInternalJob)
          : [];

        setInternalJobs(normalizedJobs);
      } catch (error) {
        console.error("Internal Jobs Fetch Error:", error);

        setInternalJobs([]);
        setInternalMessage(
          getErrorMessage(error, "Internal jobs are not available right now.")
        );
      } finally {
        setIsLoadingInternal(false);
      }
    };

    fetchInternalJobs();
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!isCandidate) {
        setAppliedJobIds([]);
        return;
      }

      try {
        const applicationsRes = await api.get("/applications/my/");

        const applications = extractList(applicationsRes.data, [
          "applications",
          "results",
        ]);

        setAppliedJobIds(
          applications
            .map(getApplicationJobId)
            .filter(Boolean)
            .map(String)
        );
      } catch (error) {
        console.error("Applications Fetch Error:", error);
        setAppliedJobIds([]);
      }
    };

    fetchApplications();
  }, [isCandidate]);

  useEffect(() => {
    const fetchExternalJobs = async () => {
      setIsLoadingExternal(true);
      setExternalMessage("");

      try {
        const externalRes = await fetchAdzunaJobs({
          country: "in",
          what: "developer",
          resultsPerPage: 20,
        });

        setExternalJobs(externalRes.jobs || []);

        setExternalMessage(
          externalRes.configured ? "" : externalRes.message
        );
      } catch (error) {
        console.error("Adzuna Fetch Error:", error);

        setExternalJobs([]);
        setExternalMessage(
          error.message || "External jobs are not available right now."
        );
      } finally {
        setIsLoadingExternal(false);
      }
    };

    fetchExternalJobs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setOpenMenuId(null);
  };

  const handleTypeChange = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );

    setCurrentPage(1);
  };

  const handleModeChange = (mode) => {
    setSelectedModes((prev) =>
      prev.includes(mode)
        ? prev.filter((item) => item !== mode)
        : [...prev, mode]
    );

    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedModes([]);
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  const openExternalJob = (job) => {
    if (!job?.redirect_url) {
      toast.error("External job link is unavailable");
      return;
    }

    window.open(job.redirect_url, "_blank", "noopener,noreferrer");
  };

  const navigateToJobDetails = (job) => {
    const jobId = getJobId(job);

    if (!jobId) {
      toast.error("Unable to open job details");
      return;
    }

    navigate(`/jobs/${jobId}`);
  };

  const handleAutomate = async (event, job) => {
    event.stopPropagation();

    const jobId = getJobId(job);

    if (!jobId) {
      toast.error("Invalid job selected");
      return;
    }

    if (!isInternalJob(job)) {
      toast.error("Auto apply is only available for internal jobs");
      return;
    }

    const loadingToast = toast.loading("AI is tailoring your resume...");

    try {
      const res = await dispatch(applyForJobAsync(job)).unwrap();

      setAppliedJobIds((prev) =>
        prev.some((id) => String(id) === String(jobId))
          ? prev
          : [...prev, String(jobId)]
      );

      window.dispatchEvent(new Event("jobportal:notifications-refresh"));

      toast.success(res?.message || "Application submitted successfully", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Auto apply failed:", error);

      const message = String(error || "");

      if (message.toLowerCase().includes("already applied")) {
        setAppliedJobIds((prev) =>
          prev.some((id) => String(id) === String(jobId))
            ? prev
            : [...prev, String(jobId)]
        );

        toast.success("Application already tracked", {
          id: loadingToast,
        });

        return;
      }

      toast.error(error || "Automation could not submit this application", {
        id: loadingToast,
      });
    }
  };

  const handleToggleSave = async (event, job) => {
    event.stopPropagation();

    if (!isInternalJob(job)) {
      openExternalJob(job);
      return;
    }

    const jobId = getJobId(job);

    if (!jobId) {
      toast.error("Invalid job selected");
      return;
    }

    try {
      if (isJobSaved(job)) {
        await dispatch(unsaveJobAsync(jobId)).unwrap();
        toast.success("Job removed from saved list");
      } else {
        await dispatch(saveJobAsync(jobId)).unwrap();
        toast.success("Job saved!");
      }
    } catch (error) {
      toast.error(error || "Could not update saved jobs");
    }
  };

  const handleDeleteJob = async (event, job) => {
    event.stopPropagation();

    setOpenMenuId(null);

    const jobId = getJobId(job);

    if (!jobId) {
      toast.error("Invalid job selected");
      return;
    }

    const confirmDelete = window.confirm(
      `Delete ${job.title}? This cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await deleteJob(jobId);

      setInternalJobs((prev) =>
        prev.filter((item) => String(getJobId(item)) !== String(jobId))
      );

      toast.success("Job deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete job"));
    }
  };

  const activeJobs = activeTab === "internal" ? internalJobs : externalJobs;
  const isLoading =
    activeTab === "internal" ? isLoadingInternal : isLoadingExternal;

  const activeMessage =
    activeTab === "internal" ? internalMessage : externalMessage;

  const filteredJobs = activeJobs.filter((job) => {
    const searchTarget = `
      ${job.title || ""}
      ${job.company || ""}
      ${job.location || ""}
      ${(job.skills || []).join(" ")}
      ${job.description || ""}
    `.toLowerCase();

    const matchesSearch = searchTarget.includes(
      debouncedSearch.toLowerCase()
    );

    const matchesType =
      selectedTypes.length === 0 ||
      selectedTypes.some((type) =>
        String(job.type || "")
          .toLowerCase()
          .includes(type.toLowerCase())
      );

    const location = String(job.location || "").toLowerCase();
    const type = String(job.type || "").toLowerCase();

    const isRemote =
      location.includes("remote") ||
      type.includes("remote") ||
      job.is_remote === true ||
      job.isRemote === true;

    const matchesMode =
      selectedModes.length === 0 ||
      (selectedModes.includes("Remote") && isRemote) ||
      (selectedModes.includes("On-site") && !isRemote);

    return matchesSearch && matchesType && matchesMode;
  });

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage) || 1;

  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card border-b border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight">
                Browse Jobs
              </h1>

              <p className="text-sm text-muted-foreground mt-2">
                {activeTab === "internal"
                  ? "Showing internal jobs from your platform"
                  : "Showing external jobs from Adzuna"}
              </p>
            </div>

            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search job titles or companies..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full bg-background border border-border rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex items-center gap-4 flex-col md:flex-row">
              <button
                onClick={() => setShowFiltersMobile((prev) => !prev)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-muted rounded-full font-bold"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <div className="flex bg-muted p-1 rounded-full border border-border shrink-0">
                <button
                  type="button"
                  onClick={() => handleTabChange("internal")}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                    activeTab === "internal"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Internal
                  <span className="ml-2 text-xs opacity-70">
                    {internalJobs.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange("external")}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                    activeTab === "external"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  External
                  <span className="ml-2 text-xs opacity-70">
                    {externalJobs.length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <aside
          className={`w-full lg:w-64 flex-shrink-0 ${
            showFiltersMobile ? "block" : "hidden lg:block"
          }`}
        >
          <div className="bg-card border border-border rounded-3xl p-6 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h2>

              {(selectedTypes.length > 0 ||
                selectedModes.length > 0 ||
                searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                Work Mode
              </h3>

              <div className="flex flex-col gap-3">
                {workModeOptions.map((mode) => (
                  <label
                    key={mode}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center w-5 h-5 border-2 border-muted-foreground group-hover:border-primary rounded">
                      <input
                        type="checkbox"
                        className="peer opacity-0 absolute w-full h-full cursor-pointer"
                        checked={selectedModes.includes(mode)}
                        onChange={() => handleModeChange(mode)}
                      />

                      <CheckCircle2 className="w-4 h-4 text-primary absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>

                    <span className="font-medium text-sm">{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                Job Type
              </h3>

              <div className="flex flex-col gap-3">
                {jobTypeOptions.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center w-5 h-5 border-2 border-muted-foreground group-hover:border-primary rounded">
                      <input
                        type="checkbox"
                        className="peer opacity-0 absolute w-full h-full cursor-pointer"
                        checked={selectedTypes.includes(type)}
                        onChange={() => handleTypeChange(type)}
                      />

                      <CheckCircle2 className="w-4 h-4 text-primary absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>

                    <span className="font-medium text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="animate-spin w-10 h-10 text-primary" />

              <p className="text-muted-foreground font-medium">
                {activeTab === "internal"
                  ? "Fetching internal jobs..."
                  : "Fetching external jobs..."}
              </p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-3xl border border-border">
              <h3 className="text-2xl font-bold mb-2">
                No {activeTab} jobs found
              </h3>

              <p className="text-muted-foreground mb-6">
                {activeMessage ||
                  "Try removing filters or changing your search."}
              </p>

              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-muted-foreground font-medium">
                  Showing {currentJobs.length} of {filteredJobs.length}{" "}
                  {activeTab} jobs
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
                {currentJobs.map((job) => {
                  const jobId = getJobId(job);
                  const internal = isInternalJob(job);
                  const external = isExternalJob(job);
                  const applied = internal && isJobApplied(job);
                  const saved = internal && isJobSaved(job);

                  return (
                    <div
                      key={jobId}
                      className="bg-card border border-border rounded-3xl p-6 hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between"
                      onClick={() =>
                        external
                          ? openExternalJob(job)
                          : navigateToJobDetails(job)
                      }
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
                              {job.company?.charAt(0)?.toUpperCase() || "J"}
                            </div>

                            <div>
                              <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-1">
                                {job.title}
                              </h3>

                              <p className="text-muted-foreground text-sm line-clamp-1">
                                {job.company}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {external && (
                              <span className="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full">
                                External
                              </span>
                            )}

                            {internal && applied && (
                              <span className="bg-green-500/10 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Applied
                              </span>
                            )}

                            {internal && (
                              <button
                                onClick={(event) =>
                                  handleToggleSave(event, job)
                                }
                                className="p-2 text-muted-foreground hover:text-primary transition-colors bg-muted/50 hover:bg-muted rounded-full"
                                aria-label={saved ? "Unsave job" : "Save job"}
                              >
                                <Bookmark
                                  className={`w-5 h-5 transition-all ${
                                    saved ? "fill-primary text-primary" : ""
                                  }`}
                                />
                              </button>
                            )}

                            {internal && (
                              <div
                                className="relative"
                                ref={openMenuId === jobId ? menuRef : null}
                              >
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setOpenMenuId(
                                      openMenuId === jobId ? null : jobId
                                    );
                                  }}
                                  onKeyDown={(event) => {
                                    if (event.key === "Escape") {
                                      setOpenMenuId(null);
                                    }
                                  }}
                                  className="p-2 text-muted-foreground hover:text-foreground transition-colors bg-muted/50 hover:bg-muted rounded-full"
                                  aria-haspopup="menu"
                                  aria-expanded={openMenuId === jobId}
                                  aria-label={`Open actions for ${job.title}`}
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </button>

                                {openMenuId === jobId && (
                                  <div
                                    className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
                                    role="menu"
                                  >
                                    <button
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        setOpenMenuId(null);
                                        navigateToJobDetails(job);
                                      }}
                                      className="w-full px-4 py-2.5 text-left text-sm font-bold hover:bg-muted flex items-center gap-2"
                                      role="menuitem"
                                    >
                                      <Eye className="w-4 h-4" />
                                      View Details
                                    </button>

                                    {userOwnsJob(job) && (
                                      <>
                                        <button
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            setOpenMenuId(null);
                                            navigate(`/hr/jobs/${jobId}/edit`);
                                          }}
                                          className="w-full px-4 py-2.5 text-left text-sm font-bold hover:bg-muted flex items-center gap-2"
                                          role="menuitem"
                                        >
                                          <Pencil className="w-4 h-4" />
                                          Edit Job
                                        </button>

                                        <button
                                          onClick={(event) =>
                                            handleDeleteJob(event, job)
                                          }
                                          className="w-full px-4 py-2.5 text-left text-sm font-bold text-destructive hover:bg-destructive/10 flex items-center gap-2"
                                          role="menuitem"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                          Delete Job
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground mb-6">
                          <span className="bg-secondary px-3 py-1.5 rounded-lg flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>

                          <span className="bg-secondary px-3 py-1.5 rounded-lg flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {job.type}
                          </span>

                          {job.salary && (
                            <span className="bg-secondary px-3 py-1.5 rounded-lg">
                              {job.salary}
                            </span>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {job.description}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-border/50 mt-auto">
                        {external ? (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              openExternalJob(job);
                            }}
                            className="w-full py-3 bg-foreground text-background rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90"
                          >
                            Apply Externally
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        ) : internal && applied ? (
                          <button
                            disabled
                            className="w-full py-3 bg-muted text-muted-foreground rounded-xl font-bold cursor-not-allowed"
                          >
                            Application Tracked
                          </button>
                        ) : internal && isCandidate ? (
                          <button
                            onClick={(event) => handleAutomate(event, job)}
                            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90"
                          >
                            <Zap className="w-4 h-4" />
                            Automate
                          </button>
                        ) : internal ? (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              navigateToJobDetails(job);
                            }}
                            className="w-full py-3 bg-muted text-muted-foreground rounded-xl font-bold"
                          >
                            View Details
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12 pt-6 border-t border-border/50">
                  <button
                    onClick={() => {
                      setCurrentPage((page) => Math.max(page - 1, 1));
                      window.scrollTo(0, 0);
                    }}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl font-semibold hover:bg-muted disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <span className="text-sm font-semibold bg-muted px-4 py-2 rounded-xl">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => {
                      setCurrentPage((page) =>
                        Math.min(page + 1, totalPages)
                      );
                      window.scrollTo(0, 0);
                    }}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl font-semibold hover:bg-muted disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default BrowseJobs;
