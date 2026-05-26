import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Briefcase } from "lucide-react";
import { useNavigate } from "react-router";
import { isInternalJob } from "../utils/jobSources";

const HomeSearchInput = ({ jobsData }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState(""); // 1. New state for location
  const [searchedJobs, setSearchedJobs] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // 1. THE REACT WAY TO DEBOUNCE (Updated for both inputs)
  useEffect(() => {
    // If BOTH searches are empty, clear everything and stop
    if (!query.trim() && !locationQuery.trim()) {
      setSearchedJobs([]);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      const filteredJobs = jobsData.filter((job) => {
        const searchTarget = `${job.title || ""} ${job.company || ""} ${job.location || ""} ${(job.skills || []).join(" ")}`.toLowerCase();
        // Check if it matches keyword (if a keyword is typed)
        const matchesKeyword =
          query.trim() === "" ||
          searchTarget.includes(query.toLowerCase());

        // Check if it matches location (if a location is typed)
        const matchesLocation =
          locationQuery.trim() === "" ||
          (job.location || "").toLowerCase().includes(locationQuery.toLowerCase());

        // Only return true if BOTH conditions pass
        return matchesKeyword && matchesLocation;
      });

      setSearchedJobs(filteredJobs);
      setIsDropdownOpen(true);
    }, 300);

    // Cleanup function: clears the old timer if the user keeps typing
    return () => clearTimeout(timer);
  }, [query, locationQuery, jobsData]); // 2. Add locationQuery to dependencies

  // 2. CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative mt-8 flex flex-col md:flex-row items-center bg-transparent md:bg-card p-0 md:p-2 rounded-3xl md:rounded-full shadow-none md:shadow-md border-none md:border md:border-border gap-3 md:gap-0 z-50"
    >
      {/* --- THE SEARCH INPUT --- */}
      <div className="flex-1 flex items-center px-4 w-full md:w-auto bg-card md:bg-transparent rounded-full md:rounded-none h-14 md:h-auto border border-border md:border-none shadow-sm md:shadow-none shrink-0">
        <Search className="text-muted-foreground w-5 h-5 mr-3 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query || locationQuery) setIsDropdownOpen(true);
          }}
          placeholder="Job Title, Company, or Keywords..."
          className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground h-12"
        />
      </div>

      <div className="hidden md:block w-[1px] h-8 bg-border"></div>

      {/* --- THE LOCATION INPUT --- */}
      <div className="flex-1 flex items-center px-4 w-full md:w-auto bg-card md:bg-transparent rounded-full md:rounded-none h-14 md:h-auto border border-border md:border-none shadow-sm md:shadow-none shrink-0">
        <MapPin className="text-muted-foreground w-5 h-5 mr-3 shrink-0" />
        <input
          type="text"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          onFocus={() => {
            if (query || locationQuery) setIsDropdownOpen(true);
          }}
          placeholder="City or Remote"
          className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground h-12"
        />
      </div>

      {/* --- THE PREMIUM AUTOCOMPLETE DROPDOWN --- */}
      {isDropdownOpen && (
        <div className="absolute top-[calc(100%+12px)] left-0 w-full md:w-[calc(100%-16px)] bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[350px]">
          <div className="px-4 py-2 bg-muted/30 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Search Results
            </p>
          </div>

          <div className="overflow-y-auto overflow-x-hidden p-2 flex flex-col gap-1 custom-scrollbar">
            {searchedJobs.length > 0 ? (
              searchedJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setQuery(job.title);
                    setLocationQuery(job.location); // Auto-fill location on select
                    setIsDropdownOpen(false);
                    if (isInternalJob(job)) {
                      navigate(`/jobs/${job.id}`);
                    } else if (job.redirect_url) {
                      window.open(job.redirect_url, "_blank");
                    }
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      {job.title}
                    </h4>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {job.company} &bull; {job.location}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No jobs found matching your search.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeSearchInput;
