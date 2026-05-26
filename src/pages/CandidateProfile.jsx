import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { unsaveJobAsync, updateUser } from "../features/AuthSlice";
import api from "../config/api";
import { extractList, getJobId as getBackendJobId, normalizeJob, normalizeProfile } from "../utils/backendAdapters";
import {
  Briefcase,
  Bookmark,
  CheckCircle2,
  FileText,
  ChevronRight,
  Trash2,
  Building2,
  MapPin,
  TrendingUp,
  Loader2,
} from "lucide-react";

const CandidateProfile = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(user);
  const userId = user?.id || user?._id;
  const appliedJobsKey = (user?.candidateProfile?.appliedJobs || []).join("|");
  const savedJobsKey = (user?.candidateProfile?.savedJobs || []).join("|");

  useEffect(() => {
    const fetchCandidateJobs = async () => {
      setIsLoading(true);
      try {
        const [applicationsRes, savedRes] = await Promise.allSettled([
          api.get("/applications/my/"),
          api.get("/jobs/saved/"),
        ]);
        const applicationsData =
          applicationsRes.status === "fulfilled"
            ? extractList(applicationsRes.value.data, ["applications", "results"]).map((item) => ({
                ...item,
                job: normalizeJob(item.job_details || item.job || item),
              }))
            : [];
        const savedData =
          savedRes.status === "fulfilled"
            ? extractList(savedRes.value.data, ["saved_jobs", "results"]).map((item) => ({
                ...item,
                job: normalizeJob(item.job_details || item.job || item),
              }))
            : [];
        const savedJobIds = savedJobsKey ? savedJobsKey.split("|") : [];

        setApplications(
          applicationsData.length
            ? applicationsData
            : []
        );
        setSavedJobs(
          savedData.length
            ? savedData
            : savedJobIds.map((id) => ({ job: { id, title: `Saved job #${id}` } }))
        );
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load candidate activity");
        setApplications([]);
        setSavedJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidateJobs();
  }, [userId, appliedJobsKey, savedJobsKey]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profiles/me/");
        const currentProfile = normalizeProfile(res.data.profile || res.data);
        setProfile(currentProfile);
        dispatch(updateUser(currentProfile));
      } catch {
        // Profile may not exist yet; keep the existing Redux user data.
      }
    };

    fetchProfile();
  }, [dispatch, userId]);

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

  const handleUnsave = async (id, title) => {
    try {
      await dispatch(unsaveJobAsync(id)).unwrap();
      setSavedJobs((prev) => prev.filter((item) => String(getJobId(item)) !== String(id)));
      toast.success(`${title} removed from saved jobs.`);
    } catch (error) {
      toast.error(error || "Could not remove saved job");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Interviewing":
      case "Interview":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "In Review":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
  };

  const profileUser = profile?.user || user || {};
  const profileFields = [
    profileUser?.firstName,
    profileUser?.lastName,
    profileUser?.email,
    profile?.bio,
    profile?.phone,
    profile?.skills?.length,
    profile?.linkedin,
    profile?.github,
  ];
  const profileStrength = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100,
  );

  return (
    <div className="mt-8 space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black">{applications.length}</p>
            <p className="text-sm font-bold text-muted-foreground">Total Applications</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-secondary-foreground">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black">{savedJobs.length}</p>
            <p className="text-sm font-bold text-muted-foreground">Saved Jobs</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="w-full pr-4">
            <p className="text-lg font-black mb-1">Profile Strength</p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${profileStrength}%` }}></div>
            </div>
            <p className="text-xs font-bold text-muted-foreground mt-1 text-right">{profileStrength}% Complete</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4">Candidate Profile</h2>
            <p className="text-muted-foreground leading-7 mb-5">
              {profile?.bio || "No bio added yet."}
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {profile?.skills?.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-bold">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No skills added.</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              {profile?.github && (
                <a href={profile.github} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline truncate">
                  GitHub
                </a>
              )}
              {profile?.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline truncate">
                  LinkedIn
                </a>
              )}
              {profile?.portfolio && (
                <a href={profile.portfolio} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline truncate">
                  Portfolio
                </a>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="text-primary w-5 h-5" /> Application History
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Track the status of your recent job applications</p>
              </div>
              <button
                onClick={() => navigate("/browse-jobs")}
                className="text-sm font-bold text-primary hover:underline hidden sm:block"
              >
                Find more jobs
              </button>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                  <p className="font-bold">Loading applications...</p>
                </div>
              ) : applications.length > 0 ? (
                applications.map((application) => {
                  const job = getItemJob(application);
                  const jobId = getJobId(application);

                  return (
                    <div
                      key={application.id || jobId}
                      onClick={() => navigateToJobDetails(application)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-border rounded-xl bg-background hover:border-primary/50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center shrink-0 font-black text-xl text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {getCompany(job).charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              <Building2 className="w-3.5 h-3.5" /> {getCompany(job)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {job.location || "Location unavailable"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-border/50">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(application.status)}`}>
                          {application.status || "Applied"}
                        </span>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/10">
                  <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
                    <Briefcase className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-bold text-foreground">No applications yet</p>
                  <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                    Your application history will appear here once you start applying for roles.
                  </p>
                  <button
                    onClick={() => navigate("/browse-jobs")}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Browse Jobs
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Bookmark className="text-secondary-foreground w-5 h-5" /> Saved Jobs
            </h2>

            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                  <span className="text-sm font-bold">Loading saved jobs...</span>
                </div>
              ) : savedJobs.length > 0 ? (
                savedJobs.map((savedItem) => {
                  const job = getItemJob(savedItem);
                  const jobId = getJobId(savedItem);

                  return (
                    <div
                      key={jobId}
                      onClick={() => navigateToJobDetails(savedItem)}
                      className="flex items-center justify-between gap-3 p-3 border border-border rounded-xl hover:bg-muted/30 transition-colors group cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-foreground truncate">{job.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{getCompany(job)}</p>
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToJobDetails(savedItem);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-primary bg-background rounded-md border border-border shadow-sm"
                          title="View Job"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsave(jobId, job.title);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 bg-background rounded-md border border-border shadow-sm transition-colors"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm italic text-center py-6 bg-muted/20 rounded-xl border border-border border-dashed">
                  You haven't saved any jobs yet.
                </p>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="text-primary w-5 h-5" /> My Resume
            </h2>
            <div className="border border-border rounded-xl p-4 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm">Resume</p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.resume ? "Resume uploaded" : "No resume uploaded yet"}
                  </p>
                </div>
              </div>
            </div>
            {profile?.resume && (
              <a
                href={profile.resume}
                target="_blank"
                rel="noreferrer"
                className="block text-center w-full mt-4 py-2 border border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors text-sm"
              >
                View Resume
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
