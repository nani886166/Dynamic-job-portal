import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  Briefcase,
  Building2,
  MapPin,
  MoreVertical,
  Clock,
  BookmarkMinus,
  ExternalLink,
  Loader2,
  Eye,
} from "lucide-react";
import { unsaveJobAsync } from "../features/AuthSlice";
import toast from "react-hot-toast";
import api from "../config/api";
import { extractList, getJobId as getBackendJobId, normalizeJob } from "../utils/backendAdapters";

const JobsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.isAuth);
  const [activeTab, setActiveTab] = useState("applied");
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const [applicationsRes, savedRes] = await Promise.allSettled([
          api.get("/applications/my/"),
          api.get("/jobs/saved/"),
        ]);
        const savedIds = user?.candidateProfile?.savedJobs || [];

        setAppliedJobs(
          applicationsRes.status === "fulfilled"
            ? extractList(applicationsRes.value.data, ["applications", "results"]).map((item) => ({
                ...item,
                job: normalizeJob(item.job_details || item.job || item),
              }))
            : [],
        );
        const saved = savedRes.status === "fulfilled"
          ? extractList(savedRes.value.data, ["saved_jobs", "results"]).map((item) => ({
              ...item,
              job: normalizeJob(item.job_details || item.job || item),
            }))
          : [];
        setSavedJobs(
          saved.length
            ? saved
            : savedIds.map((id) => ({ job: { id, title: `Saved job #${id}` } })),
        );
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load your jobs");
        setAppliedJobs([]);
        setSavedJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getItemJob = (item) => item.job || item.job_details || item;
  const getJobId = (item) => getBackendJobId(item);
  const getCompany = (job) => job.company || job.companyName || "Company";

  const navigateToJobDetails = (item) => {
    const jobId = getJobId(item);

    if (!jobId) {
      toast.error("Unable to open job details");
      return;
    }

    navigate(`/jobs/${jobId}`);
  };

  const handleRemoveSavedJob = async (e, jobId, jobTitle) => {
    e.stopPropagation();
    try {
      await dispatch(unsaveJobAsync(jobId)).unwrap();
      setSavedJobs((prev) => prev.filter((item) => String(getJobId(item)) !== String(jobId)));
      toast.success(`${jobTitle} removed from saved jobs.`);
    } catch (error) {
      toast.error(error || "Could not remove saved job");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">My Jobs</h1>
        <p className="text-muted-foreground mt-2 text-lg">Track your job applications and saved opportunities.</p>
      </div>

      <div className="flex items-center gap-4 border-b border-border mb-8">
        <button
          onClick={() => setActiveTab("applied")}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === "applied" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Applied Jobs ({appliedJobs.length})
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === "saved" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Saved Jobs ({savedJobs.length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="font-bold">Loading your jobs...</p>
        </div>
      ) : activeTab === "applied" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appliedJobs.length > 0 ? (
            appliedJobs.map((application) => {
              const job = getItemJob(application);

              return (
                <div
                  key={application.id || getJobId(application)}
                  className="group bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => navigateToJobDetails(application)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                        <p className="text-sm font-medium text-muted-foreground">{getCompany(job)}</p>
                      </div>
                    </div>
                    <div className="relative" ref={openMenuId === getJobId(application) ? menuRef : null}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const id = getJobId(application);
                          setOpenMenuId(openMenuId === id ? null : id);
                        }}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors p-1 rounded-lg"
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === getJobId(application)}
                        aria-label={`Open actions for ${job.title}`}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {openMenuId === getJobId(application) && (
                        <div className="absolute right-0 top-9 z-30 w-40 overflow-hidden rounded-xl border border-border bg-card shadow-xl" role="menu">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToJobDetails(application);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm font-bold hover:bg-muted flex items-center gap-2"
                            role="menuitem"
                          >
                            <Eye className="w-4 h-4" /> View Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-border/50 text-xs font-semibold text-muted-foreground">
                    <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> {job.location || "Location unavailable"}
                    </span>
                    <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Applied {application.createdAt || application.appliedAt || "recently"}
                    </span>

                    <span className="ml-auto px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] bg-primary/10 text-primary border border-primary/20">
                      {application.status || "Applied"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="md:col-span-2 bg-card border border-border rounded-[24px] p-12 text-center shadow-sm">
              <Briefcase className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">No applications yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">Applications tracked by the local MERN backend will appear here.</p>
              <button
                onClick={() => navigate("/browse-jobs")}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold hover:bg-primary/90 transition-colors shadow-sm"
              >
                Explore Jobs
              </button>
            </div>
          )}
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedJobs.map((savedItem) => {
            const job = getItemJob(savedItem);
            const jobId = getJobId(savedItem);

            return (
              <div
                key={jobId}
                className="group bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => navigateToJobDetails(savedItem)}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        {getCompany(job).charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{job.title}</h3>
                        <p className="text-sm font-medium text-muted-foreground line-clamp-1">{getCompany(job)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleRemoveSavedJob(e, jobId, job.title)}
                      className="text-muted-foreground hover:text-destructive bg-muted/50 hover:bg-destructive/10 transition-colors p-2 rounded-full"
                      title="Remove from saved"
                    >
                      <BookmarkMinus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold text-muted-foreground">
                    <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> {job.location || "Location unavailable"}
                    </span>
                    <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3" /> {job.jobType || job.type || "Job"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border/50">
                  <span className="flex items-center gap-2 text-primary font-bold text-sm">
                    View & Apply <ExternalLink className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-[24px] p-12 text-center shadow-sm">
          <Briefcase className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No saved jobs</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">You haven't saved any opportunities yet. Keep browsing and bookmarking roles that interest you.</p>
          <button
            onClick={() => navigate("/browse-jobs")}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold hover:bg-primary/90 transition-colors shadow-sm"
          >
            Explore Jobs
          </button>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
