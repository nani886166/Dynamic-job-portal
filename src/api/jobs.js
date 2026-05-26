import api from "../config/api";

export const createJob = (payload) => api.post("/jobs/", payload);

export const getJobs = (params) => api.get("/jobs/", { params });

export const getMyPostedJobs = () => api.get("/jobs/my-jobs/");

export const getJob = (jobId) => api.get(`/jobs/${jobId}/`);

export const updateJob = (jobId, payload) => api.patch(`/jobs/${jobId}/`, payload);

export const deleteJob = (jobId) => api.delete(`/jobs/${jobId}/`);
