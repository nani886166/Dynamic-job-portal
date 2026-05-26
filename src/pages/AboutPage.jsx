import React from "react";
import {
  Users,
  Briefcase,
  BrainCircuit,
  GraduationCap,
  HeartPulse,
  Code2,
  Globe,
} from "lucide-react";

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-16 md:space-y-24 bg-background text-foreground font-sans">
      <section className="text-center max-w-4xl mx-auto space-y-4 md:space-y-6">
        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Project Synopsis
        </span>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          AI-Powered Career & Faculty Collaboration Platform
        </h1>
        <p className="text-base font-semibold md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
          A Smart Unified Career Ecosystem with Job Automation, Interview
          Intelligence & Lifestyle-Based Recommendation Systems.
        </p>
        <p className="text-sm md:text-base text-muted-foreground">
          This project proposes a unified intelligent ecosystem that integrates
          job automation, faculty collaboration, AI interview preparation, and lifestyle-based
          optimization. It bridges the gap between career platforms and academic
          systems by combining job search, structured learning, mentorship, and
          personalized recommendation systems into one platform.
        </p>
      </section>

      <section className="bg-primary text-primary-foreground rounded-3xl p-10 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-primary-foreground/20">
        <div className="flex flex-col items-center justify-center p-4">
          <Globe className="w-10 h-10 mb-4 opacity-80" />
          <p className="text-5xl font-bold mb-2">120+</p>
          <p className="text-primary-foreground/80 text-sm font-bold tracking-widest uppercase">
            Active Global Jobs
          </p>
          <p className="text-xs mt-3 opacity-75 max-w-xs">
            Powered securely by the Adzuna API utilizing App ID and Key
            authentication for real-time market data.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center p-4">
          <Users className="w-10 h-10 mb-4 opacity-80" />
          <p className="text-5xl font-bold mb-2">50+</p>
          <p className="text-primary-foreground/80 text-sm font-bold tracking-widest uppercase">
            User Support Nodes
          </p>
          <p className="text-xs mt-3 opacity-75 max-w-xs">
            Dedicated multi-role support infrastructure for Candidates, Faculty,
            and HR Professionals.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center p-4">
          <Code2 className="w-10 h-10 mb-4 opacity-80" />
          <p className="text-3xl lg:text-4xl font-bold mb-2">MERN Stack</p>
          <p className="text-primary-foreground/80 text-sm font-bold tracking-widest uppercase">
            Stack Architecture
          </p>
          <p className="text-xs mt-3 opacity-75 max-w-xs">
            Built on a robust React.js frontend powered by a local Express and
            MongoDB backend.
          </p>
        </div>
      </section>

      <section>
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Key Functional Modules
          </h2>
          <p className="text-muted-foreground mt-2">
            The architecture driving our intelligent career ecosystem.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <Briefcase className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Smart Job Automation</h3>
            <p className="text-sm text-muted-foreground">
              Automated job application and tracking system designed to save
              time and streamline the process for students and freshers.
            </p>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <BrainCircuit className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">AI Interview Simulator</h3>
            <p className="text-sm text-muted-foreground">
              Provides AI-based interview preparation addressing the lack of
              personalized interview prep in traditional portals.
            </p>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <GraduationCap className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Faculty Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Enables faculty-student collaboration and structured resource
              sharing, solving disconnected academic systems.
            </p>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <HeartPulse className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">
              Lifestyle Recommendations
            </h3>
            <p className="text-sm text-muted-foreground">
              Unique modes for Gym, Budget, and Cheat Day to optimize a
              student's daily life alongside career growth.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16 px-8 rounded-3xl border border-border text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Meet the Visionaries
        </h2>
        <p className="text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto px-2">
          A dedicated team transforming traditional job portals into an
          intelligent ecosystem combining career development, academic
          collaboration, automation, and lifestyle optimization.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            "Dhoni",
            "Vishnu",
            "Saritha",
            "Vinutha",
            "Jahnavi",
            "Govardhan",
            // "Shiva Krishna",
          ].map((member, index) => (
            <div
              key={index}
              className="bg-card border border-border px-6 py-3 rounded-full shadow-sm font-semibold text-foreground flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              {member}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            ATS-Friendly Resume Profile
          </h2>
          <p className="text-muted-foreground mt-2">
            Example of a strictly formatted, single-color professional profile
            processed within our ecosystem.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white border border-gray-300 shadow-xl p-6 sm:p-12 lg:p-16 font-serif text-gray-900 print:shadow-none print:border-none">
          <div className="border-b-2 border-gray-900 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-gray-900">
                Vishnu R
              </h1>
              <h2 className="text-xl text-gray-700 font-medium mt-2">Frontend Developer</h2>
            </div>
            <div className="sm:text-right text-sm text-gray-700 space-y-1">
              <p>Pavagada, Karnataka</p>
              <p>vishnu6364748848@gmail.com | 636-474-8848</p>
              <p>linkedin.com/in/vishnu-r-developer</p>
              <p>github.com/Vishnu-R-8848</p>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold uppercase tracking-widest text-gray-900 border-b border-gray-300 pb-1 mb-3">
                Professional Summary
              </h3>
              <p className="text-sm text-gray-800 leading-relaxed text-justify">
                Frontend Developer specializing in React.js and high-end interactive
                web design. Experienced in building performant applications with
                complex state management and award-winning motion aesthetics
                using GSAP and ScrollTrigger. Currently expanding expertise into
                Full-Stack development to build end-to-end scalable solutions.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold uppercase tracking-widest text-gray-900 border-b border-gray-300 pb-1 mb-3">
                Technical Skills
              </h3>
              <ul className="text-sm text-gray-800 space-y-2">
                <li>
                  <span className="font-bold">Languages:</span> JavaScript (ES6+),
                  HTML5, CSS3, C, C++, Java, Python, R, SQL
                </li>
                <li>
                  <span className="font-bold">Frontend Frameworks:</span> React.js,
                  GSAP, Tailwind CSS
                </li>
                <li>
                  <span className="font-bold">Tools & Platforms:</span> Git, GitHub,
                  VS Code, Vercel, Figma, Postman
                </li>
                <li>
                  <span className="font-bold">Backend & Databases:</span> Node.js,
                  Express.js, MongoDB
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold uppercase tracking-widest text-gray-900 border-b border-gray-300 pb-1 mb-3">
                Featured Projects
              </h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900 text-base">
                      Ecom - Full-Stack eCommerce Platform
                    </h4>
                    <span className="text-sm font-medium text-gray-700">April 2026</span>
                  </div>
                  <p className="text-sm text-gray-800 font-semibold mb-1">
                    React, Node.js, Express.js, MongoDB
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>
                      Developed a comprehensive eCommerce platform with secure
                      user authentication and product management.
                    </li>
                    <li>
                      Integrated scalable cart functionality and state
                      management using Redux Toolkit.
                    </li>
                    <li>
                      Designed an intuitive, responsive frontend architecture
                      optimized for high conversion rates.
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900 text-base">
                      Inkwell - Content Publishing Network
                    </h4>
                    <span className="text-sm font-medium text-gray-700">March 2026</span>
                  </div>
                  <p className="text-sm text-gray-800 font-semibold mb-1">
                    React, Node.js, Express.js, MongoDB
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>
                      Engineered a dynamic blogging platform allowing users to
                      seamlessly draft, edit, and publish articles.
                    </li>
                    <li>
                      Built a robust RESTful API to handle content delivery,
                      media uploads, and author profile relations.
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900 text-base">Session Task Manager</h4>
                    <span className="text-sm font-medium text-gray-700">March 2026</span>
                  </div>
                  <p className="text-sm text-gray-800 font-semibold mb-1">React, Local Storage</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>
                      Developed a productivity tool featuring integrated study
                      timers and persistent data handling.
                    </li>
                    <li>
                      Implemented browser storage for data persistence, ensuring
                      tasks remain accessible across sessions.
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900 text-base">
                      GSAP Scroll Trigger Showcase
                    </h4>
                    <span className="text-sm font-medium text-gray-700">Feb. 2026</span>
                  </div>
                  <p className="text-sm text-gray-800 font-semibold mb-1">JavaScript, GSAP, CSS</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>
                      Created a visual experience using JavaScript for
                      scroll-based interactions.
                    </li>
                    <li>
                      Focused on creating fluid transitions to maximize user
                      engagement and visual appeal.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold uppercase tracking-widest text-gray-900 border-b border-gray-300 pb-1 mb-3">
                Education & Training
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900 text-base">
                      Sheryians Coding School
                    </h4>
                    <span className="text-sm text-gray-700">
                      Bhopal, MP | March 2026 - Present
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 font-semibold">
                    Full Stack Web Development (KodeX Batch)
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Mastering full-stack development, with a primary focus on
                    advanced frontend architecture and backend API integration. Developing
                    industry-standard projects using modern workflows and
                    responsive design patterns.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900 text-base">
                      YER GFGC
                    </h4>
                    <span className="text-sm text-gray-700">
                      Pavagada, Tumakuru | Sept. 2023 - June 2026
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 font-semibold">
                    Bachelor in Computer Applications (BCA) - 5th Semester
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Core Subjects: Data Structures & Algorithms (DAA), Software
                    Engineering, Cloud Computing, and Database Management.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
