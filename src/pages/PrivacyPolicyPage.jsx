import React from "react";

const privacySections = [
  {
    title: "Information We Collect",
    text: "We collect the information needed to run our job portal, including your name, email, role, profile details, skills, education, experience, resume, portfolio links, saved jobs, applications, and messages.",
  },
  {
    title: "How We Use Your Data",
    text: "Your data is used to create your account, manage your profile, show relevant jobs, process applications, connect candidates with recruiters, send notifications, and improve platform security.",
  },
  {
    title: "Job Applications",
    text: "When you apply for a job, your profile, resume, and application details may be shared with the employer or HR user connected to that job.",
  },
  {
    title: "External Jobs",
    text: "Some jobs may come from third-party job APIs. If you open an external job link, the privacy policy of that external website will apply.",
  },
  {
    title: "Data Security",
    text: "We use reasonable security practices to protect user data, but no online platform can guarantee complete security. Users should keep their login details private.",
  },
  {
    title: "Your Choices",
    text: "You may update your profile, manage your information, or request account deletion where supported by the platform.",
  },
];

const PrivacyPolicyPage = () => {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <section className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
        <p className="text-sm font-medium text-neutral-500">Legal</p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
          Privacy Policy
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-600 md:text-lg">
          This Privacy Policy explains how our Job Portal collects, uses, and
          protects user information while providing job search, profile,
          application, networking, and recruiter communication features.
        </p>

        <p className="mt-5 text-sm text-neutral-500">
          Last updated: May 20, 2026
        </p>

        <div className="mt-14 space-y-12">
          {privacySections.map((section, index) => (
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
          This policy is prepared for a job portal project. Before real
          commercial use, add your official company name, support email, legal
          address, and get it reviewed by a legal professional.
        </div>
      </section>
    </main>
  );
};

export default PrivacyPolicyPage;