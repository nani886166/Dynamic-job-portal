import React from "react";

const termsSections = [
  {
    title: "Using the Platform",
    text: "By using our Job Portal, you agree to use it only for genuine career, hiring, job search, recruitment, and professional networking purposes.",
  },
  {
    title: "User Accounts",
    text: "Users must provide accurate account information and keep login details secure. Any activity from your account is your responsibility.",
  },
  {
    title: "Candidate Responsibilities",
    text: "Candidates must provide correct profile, resume, education, skills, experience, and application details. Fake resumes, false experience, or spam applications are not allowed.",
  },
  {
    title: "Employer Responsibilities",
    text: "Employers and HR users must post only genuine jobs with accurate titles, descriptions, requirements, company details, and application instructions.",
  },
  {
    title: "Job Applications",
    text: "Applying through the platform does not guarantee interview calls, selection, employment, salary approval, or response from employers.",
  },
  {
    title: "External Jobs",
    text: "External job listings may redirect users to third-party websites. We are not responsible for their content, accuracy, hiring process, or privacy practices.",
  },
  {
    title: "Prohibited Activity",
    text: "Users must not hack, scrape, spam, impersonate others, post fake jobs, upload harmful files, misuse APIs, or use the platform for fraud.",
  },
  {
    title: "Account Action",
    text: "We may restrict, suspend, or remove accounts that violate these terms, misuse features, or harm other users or the platform.",
  },
];

const TermsAndConditionsPage = () => {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <section className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
        <p className="text-sm font-medium text-neutral-500">Legal</p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
          Terms and Conditions
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-600 md:text-lg">
          These Terms and Conditions explain the rules for using our Job Portal,
          including accounts, profiles, job posts, applications, messaging, and
          recruitment-related features.
        </p>

        <p className="mt-5 text-sm text-neutral-500">
          Last updated: May 20, 2026
        </p>

        <div className="mt-14 space-y-12">
          {termsSections.map((section, index) => (
            <section key={index} className="border-t border-neutral-200 pt-8">
              <h2 className="text-2xl font-semibold tracking-tight">
                {section.title}
              </h2>

              <p className="mt-4 max-w-3xl text-base leading-8 text-neutral-600">
                {section.text}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-neutral-50 p-6 text-sm leading-7 text-neutral-600">
          These terms are prepared for a job portal project. Before real
          commercial use, add your official company details and review them with
          a legal professional.
        </div>
      </section>
    </main>
  );
};

export default TermsAndConditionsPage;