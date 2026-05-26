import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { 
  Briefcase, 
  PlusCircle, 
  Users, 
  Calendar, 
  MoreVertical, 
  Clock, 
  X,
  FileText,
  MapPin,
  DollarSign,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";
import api from "../config/api";
import { extractList, getJobId as getBackendJobId, normalizeJob, normalizeProfile } from "../utils/backendAdapters";
import { deleteJob, getMyPostedJobs, updateJob } from "../api/jobs";

const HRProfile = () => {
  const navigate = useNavigate();
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [jobsList, setJobsList] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const getJobId = (job) => getBackendJobId(job);

  const navigateToJobDetails = (job) => {
    const jobId = getJobId(job);

    if (!jobId) {
      toast.error("Unable to open job details");
      return;
    }

    navigate(`/jobs/${jobId}`);
  };

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchHRData = async () => {
      try {
        const [jobsRes, profileRes] = await Promise.allSettled([
          getMyPostedJobs(),
          api.get("/profiles/me/"),
        ]);

        if (jobsRes.status === "fulfilled") {
          setJobsList(extractList(jobsRes.value.data, ["jobs", "results"]).map(normalizeJob));
        } else {
          setJobsList([]);
          setJobsError("Could not load your posted jobs.");
        }

        if (profileRes.status === "fulfilled") {
          setProfile(normalizeProfile(profileRes.value.data?.profile || profileRes.value.data));
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchHRData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 2. HANDLERS ---
  const handleJobSubmit = (e) => {
    e.preventDefault();
    toast.error("Inline job creation is not available yet. Use the job posting page.");
    setIsPostingJob(false);
  };

  const handleCloseJob = async (id, title) => {
    if(window.confirm(`Are you sure you want to close the listing for ${title}?`)) {
      try {
        await updateJob(id, { is_active: false });
        setJobsList(prev => prev.filter(job => getJobId(job) !== id));
        toast(`${title} is now closed.`);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not close job");
      }
    }
  };

  const handleDeleteJob = async (id, title) => {
    if (window.confirm(`Delete ${title}? This cannot be undone.`)) {
      try {
        await deleteJob(id);
        setJobsList((prev) => prev.filter((job) => getJobId(job) !== id));
        toast.success("Job deleted");
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not delete job");
      }
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-2">HR Profile</h2>
        <p className="text-muted-foreground leading-7 mb-4">
          {profile?.bio || "No HR bio added yet."}
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {(profile?.companyName || profile?.company) && (
            <span className="bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
              {profile.companyName || profile.company}
            </span>
          )}
          {profile?.phone && (
            <span className="bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
              {profile.phone}
            </span>
          )}
          {profile?.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">
              LinkedIn
            </a>
          )}
        </div>
      </div>

      
      {/* --- QUICK STATS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black">{jobsList.filter(j => j.status === "open" || j.status === "Active").length}</p>
            <p className="text-sm font-bold text-muted-foreground">Active Listings</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black">0</p>
            <p className="text-sm font-bold text-muted-foreground">Total Applicants</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black">0</p>
            <p className="text-sm font-bold text-muted-foreground">Interviews Scheduled</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- MAIN COLUMN: JOB POSTINGS --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header & Post Button */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Recruitment Pipeline</h2>
              <p className="text-sm text-muted-foreground">Manage your open roles and listings</p>
            </div>
            {!isPostingJob && (
              <button onClick={() => navigate("/hr/jobs/new")} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
                <PlusCircle className="w-5 h-5" /> Post New Job
              </button>
            )}
          </div>

          {/* Posting Form */}
          {isPostingJob ? (
            <div className="bg-card border-2 border-primary/50 rounded-2xl p-6 shadow-md relative animate-in fade-in slide-in-from-top-4 duration-300">
              <button onClick={() => setIsPostingJob(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground bg-muted/50 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Create Job Listing
              </h2>
              
              <form onSubmit={handleJobSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Job Title</label>
                    <input name="title" type="text" required placeholder="e.g. Senior Frontend Engineer" className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input name="location" type="text" required placeholder="City, State or Remote" className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Employment Type</label>
                    <select name="type" className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Salary Range (Optional)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input name="salary" type="text" placeholder="e.g. $80k - $100k" className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-all" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 pt-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Job Description</label>
                  <textarea required rows="4" placeholder="Describe the responsibilities and requirements..." className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-all resize-none"></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
                  <button type="button" onClick={() => setIsPostingJob(false)} className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">Publish to Job Board</button>
                </div>
              </form>
            </div>
          ) : (
            
            /* Active Jobs List */
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground font-medium">Loading jobs...</div>
                ) : jobsError ? (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                    <p className="text-lg font-bold text-foreground">Could not load listings</p>
                    <p className="text-muted-foreground mt-1">{jobsError}</p>
                  </div>
                ) : jobsList.length > 0 ? (
                  jobsList.map((job) => (
                    <div
                      key={getJobId(job)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-border rounded-xl bg-muted/10 hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => navigateToJobDetails(job)}
                    >
                      
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${job.status === "open" || job.status === "Active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.posted || "Recently"}</span>
                            <span className="font-medium text-foreground">{job.type || job.jobType}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t sm:border-t-0 border-border/50 pt-4 sm:pt-0">
                        <div className="text-center">
                          <p className="text-2xl font-black text-foreground">{job.applicants || 0}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Applicants</p>
                        </div>
                        
                        <div className="relative flex items-center gap-2" ref={openMenuId === getJobId(job) ? menuRef : null}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToJobDetails(job);
                            }}
                            className="text-sm font-bold bg-background border border-border px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === getJobId(job) ? null : getJobId(job));
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Escape") {
                                setOpenMenuId(null);
                              }
                            }}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                            aria-haspopup="menu"
                            aria-expanded={openMenuId === getJobId(job)}
                            aria-label={`Open actions for ${job.title}`}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {openMenuId === getJobId(job) && (
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
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/hr/jobs/${getJobId(job)}/edit`);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm font-bold hover:bg-muted flex items-center gap-2"
                                role="menuitem"
                              >
                                <Pencil className="w-4 h-4" /> Edit Job
                              </button>
                              {(job.isActive !== false && job.is_active !== false) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCloseJob(getJobId(job), job.title);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm font-bold hover:bg-muted flex items-center gap-2"
                                  role="menuitem"
                                >
                                  <X className="w-4 h-4" /> Close Job
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteJob(getJobId(job), job.title);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm font-bold text-destructive hover:bg-destructive/10 flex items-center gap-2"
                                role="menuitem"
                              >
                                <Trash2 className="w-4 h-4" /> Delete Job
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-bold text-foreground">No active listings</p>
                    <p className="text-muted-foreground mb-4">You haven't posted any jobs yet.</p>
                    <button onClick={() => navigate("/hr/jobs/new")} className="text-primary font-bold hover:underline">Create your first job post</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: RECENT APPLICANTS --- */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Recent Applicants
            </h3>
            
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground font-medium">
                Applicant data is not available yet.
              </div>
            </div>

            <button className="w-full mt-6 py-2.5 bg-muted/50 text-sm font-bold text-foreground rounded-xl hover:bg-muted transition-colors border border-border">
              View All Candidates
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HRProfile;
