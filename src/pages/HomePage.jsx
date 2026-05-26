import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Code2,
  LineChart,
  Landmark,
  TrendingUp,
  PenTool,
} from "lucide-react";
import HomeSearchInput from "../components/HomeSearchInput";
import api from "../config/api";
import { applyForJobAsync } from "../features/AuthSlice";
import { extractList, getErrorMessage, getJobId } from "../utils/backendAdapters";
import { fetchAdzunaJobs, isExternalJob, isInternalJob, normalizeInternalJob } from "../utils/jobSources";

const formatDate = (dateString) => {
  const options = { month: "short", day: "numeric", year: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const HomePage = () => {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.isAuth);

  const [trendingJobs, setTrendingJobs] = useState([]);
  const [externalMessage, setExternalMessage] = useState("");
  const [hasExternalJobs, setHasExternalJobs] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsRes = await api.get("/jobs/");
        const internalJobs = extractList(jobsRes.data, ["jobs", "results"]).map(normalizeInternalJob);
        let externalJobs = [];

        try {
          const externalRes = await fetchAdzunaJobs();
          externalJobs = externalRes.jobs;
          setExternalMessage(externalRes.configured ? "" : externalRes.message);
          setHasExternalJobs(externalRes.jobs.length > 0);
        } catch (error) {
          setExternalMessage(error.message || "External jobs are not available right now.");
          setHasExternalJobs(false);
        }

        setTrendingJobs([...internalJobs, ...externalJobs].slice(0, 8));
      } catch (error) {
        toast.error(getErrorMessage(error, "Could not load jobs"));
        setTrendingJobs([]);
      }
    };

    fetchJobs();
  }, []);

  const handleJobClick = (job) => {
    const jobId = getJobId(job);

    if (!isExternalJob(job) && jobId) {
      navigate(`/jobs/${jobId}`);
    } else if (job.redirect_url) {
      window.open(job.redirect_url, "_blank");
    } else {
      toast.error("Unable to open job details");
    }
  };

  const companyCount = new Set(trendingJobs.map((job) => job.company).filter(Boolean)).size;

  const handleAutomate = async (job) => {
    const jobId = getJobId(job);

    if (!jobId) {
      toast.error("Invalid job selected");
      return;
    }

    if (isExternalJob(job)) {
      toast.error("Auto apply is only available for internal jobs");
      return;
    }

    const loadToast = toast.loading("AI is tailoring your resume...");
    try {
      const res = await dispatch(applyForJobAsync(job)).unwrap();
      window.dispatchEvent(new Event("jobportal:notifications-refresh"));
      toast.success(res?.message || "Application submitted successfully", { id: loadToast });
    } catch (error) {
      console.error("Auto apply failed:", error);
      toast.error(error || "Automation could not submit this application", { id: loadToast });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-16 md:space-y-20">
      <section className="text-center max-w-4xl mx-auto space-y-6 ">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
          Elevate your career journey with precision.
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with top-tier companies and find roles that align with your
          professional goals and expertise.
        </p>
        <HomeSearchInput jobsData={trendingJobs} />
      </section>

      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 sm:gap-0">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-foreground">
              Featured Categories
            </h2>
            <p className="text-muted-foreground mt-1">
              Explore high-growth sectors curated for your skill set.
            </p>
          </div>
          {/* <div
            onClick={() => {
              navigate("/categories");
            }}
            className="text-primary font-medium flex items-center hover:underline cursor-pointer"
          >
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </div> */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="sm:col-span-2 lg:col-span-1 lg:row-span-2 bg-accent/20 border border-accent/30 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Code2 className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Software Engineering
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Over 1,200 new positions for Full-Stack, Backend, and Frontend
                developers at leading tech hubs.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                High Demand
              </span>
              <span className="text-xs text-muted-foreground">
                840 Companies Hiring
              </span>
            </div>
          </div>
          {[
            {
              title: "Product Design",
              desc: "UI/UX & Visual Design",
              icon: PenTool,
            },
            {
              title: "Data Science",
              desc: "AI, Analytics & Big Data",
              icon: LineChart,
            },
            { title: "Fintech", desc: "Finance & Blockchain", icon: Landmark },
            {
              title: "Growth",
              desc: "Marketing & Operations",
              icon: TrendingUp,
            },
          ].map((cat, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-2xl p-6 hover:border-2 hover:border-tertiary/30 transition-shadow cursor-pointer"
            >
              <div className="bg-secondary w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <cat.icon className="text-primary w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground">{cat.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-8 text-left">
          <h2 className="text-2xl font-bold text-foreground">
            Trending Opportunities
          </h2>
          <p className="text-muted-foreground mt-1">
            Personalized recommendations based on your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trendingJobs.slice(0, 4).map((job) => (
            <div
              key={job.id}
              className="bg-card border border-border rounded-2xl p-4 md:p-6 flex flex-col justify-between gap-2 hover:border-2 hover:border-tertiary/30 transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center shrink-0 hidden sm:flex">
                  <span className="text-primary font-bold text-xl uppercase">
                    {job.company.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-foreground text-lg">
                      {job.title}
                    </h3>
                    {isInternalJob(job) && (
                      <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        Internal
                      </span>
                    )}
                  </div>
                  <p className="text-primary text-sm font-medium">
                    {job.company}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full">
                      {job.location}
                    </span>
                    <span className="bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full">
                      {job.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 sm:mt-6 pt-4 border-t border-border gap-4 sm:gap-0">
                <span className="text-xs text-muted-foreground">
                  Posted {formatDate(job.created)}
                </span>

                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                  <button
                    onClick={() => handleJobClick(job)}
                    className="w-full sm:w-auto bg-primary text-primary-foreground text-sm font-medium px-6 py-2 rounded-full hover:bg-primary/90 transition-colors"
                  >
                    {!isExternalJob(job) ? "View Details" : "Apply Externally"}
                  </button>
                  {!isExternalJob(job) && user?.role === "seeker" && (
                    <button
                      onClick={() => handleAutomate(job)}
                      className="w-full sm:w-auto bg-secondary text-secondary-foreground text-sm font-medium px-6 py-2 rounded-full hover:bg-secondary/70 transition-colors"
                    >
                      Automate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {trendingJobs.length === 0 && (
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
              {externalMessage || "No jobs available yet."}
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 mt-12 flex flex-col md:flex-row flex-wrap justify-around items-center gap-8 md:gap-4 shadow-xl">
        <div className="text-center">
          <p className="text-4xl font-bold mb-2">
            {trendingJobs.length}
          </p>
          <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">
            Active Jobs
          </p>
        </div>
        <div className="hidden md:block w-[1px] h-12 bg-slate-700"></div>
        <div className="text-center">
          <p className="text-4xl font-bold mb-2">
            {companyCount}
          </p>
          <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">
            Top Companies
          </p>
        </div>
        <div className="hidden md:block w-[1px] h-12 bg-slate-700"></div>
        <div className="text-center">
          <p className="text-4xl font-bold mb-2">
            {hasExternalJobs ? 2 : 1}
          </p>
          <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">
            Live Sources
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
