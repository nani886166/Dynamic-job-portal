import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  DollarSign,
  FileText,
  Loader2,
  MapPin,
  Save,
} from "lucide-react";
import { createJob, getJob, updateJob } from "../api/jobs";
import { getErrorMessage, jobToBackendPayload, normalizeJob, toArray } from "../utils/backendAdapters";

const emptyJob = {
  title: "",
  company: "",
  location: "",
  jobType: "full_time",
  salary: "",
  description: "",
  requirements: "",
  status: "open",
};

const getJobId = (job) => job?._id || job?.id;

const parseList = (value) =>
  String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const parseSalaryRange = (value) => {
  const numbers = String(value || "")
    .match(/\d+(?:\.\d+)?/g)
    ?.map(Number) || [];

  return {
    salaryMin: numbers[0] || 0,
    salaryMax: numbers[1] || numbers[0] || 0,
  };
};

const JobPostFormPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.isAuth);
  const [isLoadingJob, setIsLoadingJob] = useState(Boolean(jobId));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      ...emptyJob,
      company: user?.company || user?.companyName || user?.hrProfile?.company || "",
    },
  });

  useEffect(() => {
    if (!jobId) {
      return;
    }

    const fetchJob = async () => {
      try {
        const res = await getJob(jobId);
        const job = normalizeJob(res.data?.job || res.data);

        reset({
          title: job.title || "",
          company: job.company || job.companyName || user?.company || user?.companyName || user?.hrProfile?.company || "",
          location: job.location || "",
          jobType: job.jobType || "full_time",
          salary: job.salary || [job.salaryMin, job.salaryMax].filter(Boolean).join(" - "),
          description: job.description || "",
          requirements: toArray(job.requirements || job.skillsRequired || job.skills).join("\n"),
          status: job.status || "open",
        });
      } catch (error) {
        toast.error(getErrorMessage(error, "Could not load this job"));
        navigate("/profile");
      } finally {
        setIsLoadingJob(false);
      }
    };

    fetchJob();
  }, [jobId, navigate, reset, user]);

  const onSubmit = async (data) => {
    const skillsRequired = parseList(data.skillsRequired || data.requirements);
    const { salaryMin, salaryMax } = parseSalaryRange(data.salary);

    const payload = jobToBackendPayload({
      title: data.title,
      company: data.company,
      location: data.location,
      jobType: data.jobType,
      description: data.description,
      skillsRequired,
      salaryMin,
      salaryMax,
    });

    try {
      if (jobId) {
        await updateJob(jobId, payload);
        toast.success("Job updated successfully");
      } else {
        const res = await createJob(payload);
        const createdJob = res.data?.job || res.data;
        toast.success("Job published successfully");

        if (getJobId(createdJob)) {
          navigate(`/jobs/${getJobId(createdJob)}`);
          return;
        }
      }

      navigate("/profile");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save job"));
    }
  };

  if (user?.role !== "hr" && user?.role !== "admin") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-black text-foreground">HR access only</h1>
          <p className="text-muted-foreground mt-2">
            Job posting tools are available for HR accounts.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold"
          >
            Back to profile
          </button>
        </div>
      </div>
    );
  }

  if (isLoadingJob) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
        Loading job...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
          {jobId ? "Edit Job Post" : "Post a Job"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Keep the listing clear, specific, and ready for candidates to act on.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">
              Job Title
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                {...register("title", { required: "Job title is required" })}
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
                placeholder="Senior Full-Stack Developer"
              />
            </div>
            {errors.title && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.title.message}
              </span>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">
              Company
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                {...register("company", { required: "Company is required" })}
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
                placeholder="Acme Careers"
              />
            </div>
            {errors.company && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.company.message}
              </span>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                {...register("location", { required: "Location is required" })}
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
                placeholder="Remote, Bangalore, or New York"
              />
            </div>
            {errors.location && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.location.message}
              </span>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">
              Employment Type
            </label>
            <select
              {...register("jobType")}
              className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">
              Salary Range
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                {...register("salary")}
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
                placeholder="8 LPA - 12 LPA"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">
              Status
            </label>
            <select
              {...register("status")}
              className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">
            Description
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-4 w-4 h-4 text-muted-foreground" />
            <textarea
              {...register("description", {
                required: "Description is required",
              })}
              rows="6"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Describe responsibilities, team context, and expectations."
            />
          </div>
          {errors.description && (
            <span className="text-xs text-red-500 mt-1 block">
              {errors.description.message}
            </span>
          )}
        </div>

        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">
            Requirements
          </label>
          <textarea
            {...register("requirements", {
              required: "Add at least one requirement",
            })}
            rows="5"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder={"React.js\nNode.js\nMongoDB\n2+ years experience"}
          />
          {errors.requirements && (
            <span className="text-xs text-red-500 mt-1 block">
              {errors.requirements.message}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="px-6 py-3 rounded-xl border border-border font-bold text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {jobId ? "Save Changes" : "Publish Job"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobPostFormPage;
