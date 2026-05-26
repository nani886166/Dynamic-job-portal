import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { applyForJobAsync, saveJobAsync, unsaveJobAsync } from "../features/AuthSlice";
import api from "../config/api";
import { deleteJob, getJobs } from "../api/jobs";
import { extractList, getErrorMessage, getJobId, hasId } from "../utils/backendAdapters";
import { fetchAdzunaJobs, isExternalJob, isInternalJob, normalizeInternalJob } from "../utils/jobSources";
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

const BrowseJobs = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- REDUX STATE ---
  const { user, currentRole, profile } = useSelector((state) => state.isAuth);
  const role = currentRole || user?.role || user?.user?.role || profile?.user?.role;
  const isCandidate = role === "seeker";
  const appliedJobs = user?.candidateProfile?.appliedJobs || [];
  const savedJobs = user?.candidateProfile?.savedJobs || [];

  // --- LOCAL STATE ---
  const [activeTab, setActiveTab] = useState("internal");
  const [allJobs, setAllJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [externalMessage, setExternalMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedModes, setSelectedModes] = useState([]);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const jobTypeOptions = ["Full-time", "Part-time", "Contract", "Internship"];
  const workModeOptions = ["Remote", "On-site"];
  const hasJobId = hasId;

  const getApplicationJobId = (application) =>
    application?.job?.id ||
    (application?.job && typeof application.job !== "object" ? application.job : null) ||
    application?.job_details?.id ||
    application?.job_id ||
    application?.jobId ||
    null;

  const getCurrentUserId = () => user?.id || user?.user?.id || profile?.user?.id;

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
      hasJobId(appliedJobs, jobId)
    );
  };

  // --- API FETCH ---
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);

      try {
        const requests = [getJobs()];
        if (isCandidate) {
          requests.push(api.get("/applications/my/"));
        }

        const [jobsRes, applicationsRes] = await Promise.allSettled(requests);

        if (jobsRes.status !== "fulfilled") {
          throw jobsRes.reason;
        }

        const jobsData = extractList(jobsRes.value.data, ["jobs", "results"]);
        const backendJobs = Array.isArray(jobsData)
          ? jobsData.map(normalizeInternalJob)
          : [];

        if (applicationsRes?.status === "fulfilled") {
          const applications = extractList(applicationsRes.value.data, ["applications", "results"]);
          setAppliedJobIds(
            applications
              .map(getApplicationJobId)
              .filter(Boolean)
              .map(String),
          );
        } else if (isCandidate) {
          setAppliedJobIds([]);
        }

        let externalJobs = [];
        try {
          const externalRes = await fetchAdzunaJobs();
          externalJobs = externalRes.jobs;
          setExternalMessage(externalRes.configured ? "" : externalRes.message);
        } catch (externalError) {
          setExternalMessage(externalError.message || "External jobs are not available right now.");
        }

        setAllJobs([...backendJobs, ...externalJobs]);
      } catch (error) {
        console.error("Jobs Fetch Error:", error);
        toast.error(getErrorMessage(error, "Failed to fetch jobs"));
        setAllJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [isCandidate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- DEBOUNCE EFFECT ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // --- FILTER HANDLERS ---
  const handleTypeChange = (type) => {
    setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
    setCurrentPage(1);
  };

  const handleModeChange = (mode) => {
    setSelectedModes((prev) => prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedModes([]);
    setSearchQuery("");
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

  // --- ACTION HANDLERS ---
  const handleAutomate = async (e, job) => {
    e.stopPropagation();
    const jobId = getJobId(job);

    if (!jobId) {
      toast.error("Invalid job selected");
      return;
    }

    if (!isInternalJob(job)) {
      toast.error("Auto apply is only available for internal jobs");
      return;
    }

    const loadToast = toast.loading("AI is tailoring your resume...");
    try {
      const res = await dispatch(applyForJobAsync(job)).unwrap();
      setAppliedJobIds((prev) =>
        prev.some((id) => String(id) === String(jobId)) ? prev : [...prev, String(jobId)],
      );
      window.dispatchEvent(new Event("jobportal:notifications-refresh"));
      toast.success(res?.message || "Application submitted successfully", { id: loadToast });
    } catch (error) {
      console.error("Auto apply failed:", error);
      const message = String(error || "");
      if (message.toLowerCase().includes("already applied")) {
        setAppliedJobIds((prev) =>
          prev.some((id) => String(id) === String(jobId)) ? prev : [...prev, String(jobId)],
        );
        toast.success("Application already tracked", { id: loadToast });
        return;
      }
      toast.error(error || "Automation could not submit this application", { id: loadToast });
    }
  };

  const handleToggleSave = async (e, job) => {
    e.stopPropagation();
    if (!isInternalJob(job)) {
      openExternalJob(job);
      return;
    }
    try {
      if (hasJobId(savedJobs, job.id)) {
        await dispatch(unsaveJobAsync(job.id)).unwrap();
        toast.success("Job removed from saved list");
      } else {
        await dispatch(saveJobAsync(job.id)).unwrap();
        toast.success("Job saved!");
      }
    } catch (error) {
      toast.error(error || "Could not update saved jobs");
    }
  };

  const handleDeleteJob = async (e, job) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (!window.confirm(`Delete ${job.title}? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteJob(job.id);
      setAllJobs((prev) => prev.filter((item) => String(item.id) !== String(job.id)));
      toast.success("Job deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete job"));
    }
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filteredJobs = allJobs.filter((job) => {
    const internal = isInternalJob(job);
    const matchesTab = activeTab === "internal" ? internal : !internal;
    const searchTarget = `${job.title || ""} ${job.company || ""} ${job.location || ""} ${(job.skills || []).join(" ")}`.toLowerCase();
    const matchesSearch = searchTarget.includes(debouncedSearch.toLowerCase());
    const matchesType = selectedTypes.length === 0 || selectedTypes.some((type) => (job.type || "").toLowerCase().includes(type.toLowerCase()));
    const isRemote = (job.location || "").toLowerCase().includes("remote");
    const matchesMode = selectedModes.length === 0 || (selectedModes.includes("Remote") && isRemote) || (selectedModes.includes("On-site") && !isRemote);

    return matchesTab && matchesSearch && matchesType && matchesMode;
  });

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const currentJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header & Controls */}
      <div className="bg-card border-b border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <h1 className="text-4xl font-black tracking-tight">Browse Jobs</h1>

            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search job titles or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex items-center gap-4 flex-col md:flex-row">
              <button onClick={() => setShowFiltersMobile(!showFiltersMobile)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-muted rounded-full font-bold">
                <Filter className="w-4 h-4" /> Filters
              </button>

              <div className="flex bg-muted p-1 rounded-full border border-border shrink-0">
                <button
                  onClick={() => { setActiveTab("internal"); setCurrentPage(1); }}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "internal" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                >
                  Internal
                </button>
                <button
                  onClick={() => { setActiveTab("external"); setCurrentPage(1); }}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "external" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                >
                  External
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* --- LEFT SIDEBAR: FILTERS --- */}
        <aside className={`w-full lg:w-64 flex-shrink-0 ${showFiltersMobile ? "block" : "hidden lg:block"}`}>
          <div className="bg-card border border-border rounded-3xl p-6 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><Filter className="w-5 h-5" /> Filters</h2>
              {(selectedTypes.length > 0 || selectedModes.length > 0) && (
                <button onClick={clearFilters} className="text-sm text-primary font-semibold hover:underline">Clear</button>
              )}
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Work Mode</h3>
              <div className="flex flex-col gap-3">
                {workModeOptions.map((mode) => (
                  <label key={mode} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 border-2 border-muted-foreground group-hover:border-primary rounded">
                      <input type="checkbox" className="peer opacity-0 absolute w-full h-full cursor-pointer" checked={selectedModes.includes(mode)} onChange={() => handleModeChange(mode)} />
                      <CheckCircle2 className="w-4 h-4 text-primary absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="font-medium text-sm">{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Job Type</h3>
              <div className="flex flex-col gap-3">
                {jobTypeOptions.map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 border-2 border-muted-foreground group-hover:border-primary rounded">
                      <input type="checkbox" className="peer opacity-0 absolute w-full h-full cursor-pointer" checked={selectedTypes.includes(type)} onChange={() => handleTypeChange(type)} />
                      <CheckCircle2 className="w-4 h-4 text-primary absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="font-medium text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* --- RIGHT SIDE: JOB GRID --- */}
        <main className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="animate-spin w-10 h-10 text-primary" />
              <p className="text-muted-foreground font-medium">Fetching remote jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-3xl border border-border">
              <h3 className="text-2xl font-bold mb-2">No jobs match your filters</h3>
              <p className="text-muted-foreground mb-6">
                {activeTab === "external" && externalMessage
                  ? externalMessage
                  : "Try removing some checkboxes or adjusting your search query."}
              </p>
              <button onClick={clearFilters} className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold">Clear All Filters</button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-muted-foreground font-medium">Showing {currentJobs.length} of {filteredJobs.length} jobs</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
                {currentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-card border border-border rounded-3xl p-6 hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between"
                    onClick={() =>
                      isExternalJob(job)
                        ? openExternalJob(job)
                        : navigateToJobDetails(job)
                    }
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
                            {job.company.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-1">{job.title}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-1">{job.company}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isInternalJob(job) && isJobApplied(job) && (
                            <span className="bg-green-500/10 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Applied
                            </span>
                          )}
                          {isInternalJob(job) && (
                            <button
                              onClick={(e) => handleToggleSave(e, job)}
                              className="p-2 text-muted-foreground hover:text-primary transition-colors bg-muted/50 hover:bg-muted rounded-full"
                            >
                              <Bookmark className={`w-5 h-5 transition-all ${hasJobId(savedJobs, job.id) ? "fill-primary text-primary" : ""}`} />
                            </button>
                          )}
                          {isInternalJob(job) && (
                            <div className="relative" ref={openMenuId === job.id ? menuRef : null}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === job.id ? null : job.id);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "Escape") {
                                    setOpenMenuId(null);
                                  }
                                }}
                                className="p-2 text-muted-foreground hover:text-foreground transition-colors bg-muted/50 hover:bg-muted rounded-full"
                                aria-haspopup="menu"
                                aria-expanded={openMenuId === job.id}
                                aria-label={`Open actions for ${job.title}`}
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                              {openMenuId === job.id && (
                                <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-xl" role="menu">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigateToJobDetails(job);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm font-bold hover:bg-muted flex items-center gap-2"
                                    role="menuitem"
                                  >
                                    <Eye className="w-4 h-4" /> View Details
                                  </button>
                                  {userOwnsJob(job) && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/hr/jobs/${job.id}/edit`);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm font-bold hover:bg-muted flex items-center gap-2"
                                        role="menuitem"
                                      >
                                        <Pencil className="w-4 h-4" /> Edit Job
                                      </button>
                                      <button
                                        onClick={(e) => handleDeleteJob(e, job)}
                                        className="w-full px-4 py-2.5 text-left text-sm font-bold text-destructive hover:bg-destructive/10 flex items-center gap-2"
                                        role="menuitem"
                                      >
                                        <Trash2 className="w-4 h-4" /> Delete Job
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
                        <span className="bg-secondary px-3 py-1.5 rounded-lg flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                        <span className="bg-secondary px-3 py-1.5 rounded-lg flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.type}</span>
                        {job.salary && <span className="bg-secondary px-3 py-1.5 rounded-lg">{job.salary}</span>}
                      </div>
                      {isExternalJob(job) && job.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {job.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border/50 mt-auto">
                      {isExternalJob(job) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openExternalJob(job);
                          }}
                          className="w-full py-3 bg-foreground text-background rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90"
                        >
                          Apply Externally <ExternalLink className="w-4 h-4" />
                        </button>
                      ) : isInternalJob(job) && isJobApplied(job) ? (
                        <button disabled className="w-full py-3 bg-muted text-muted-foreground rounded-xl font-bold cursor-not-allowed">
                          Application Tracked
                        </button>
                      ) : isInternalJob(job) && isCandidate ? (
                        <button onClick={(e) => handleAutomate(e, job)} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90">
                          <Zap className="w-4 h-4" /> Automate
                        </button>
                      ) : isInternalJob(job) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToJobDetails(job);
                          }}
                          className="w-full py-3 bg-muted text-muted-foreground rounded-xl font-bold"
                        >
                          View Details
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12 pt-6 border-t border-border/50">
                  <button onClick={() => { setCurrentPage((p) => Math.max(p - 1, 1)); window.scrollTo(0,0); }} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl font-semibold hover:bg-muted disabled:opacity-50">
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <span className="text-sm font-semibold bg-muted px-4 py-2 rounded-xl">Page {currentPage} of {totalPages}</span>
                  <button onClick={() => { setCurrentPage((p) => Math.min(p + 1, totalPages)); window.scrollTo(0,0); }} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl font-semibold hover:bg-muted disabled:opacity-50">
                    Next <ChevronRight className="w-4 h-4" />
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
