import React from "react";
import toast from "react-hot-toast";
import { NavLink } from "react-router";

import {
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Bell,
  Shield,
  Search,
  Users,
  Star,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import Breadcrumbs from "../components/Breadcrumbs";

const features = [
  {
    title: "Smart Job Discovery",
    description:
      "AI-powered recommendations tailored to your skills and goals.",
    icon: Search,
  },
  {
    title: "Realtime Notifications",
    description:
      "Stay updated instantly with applications and interview requests.",
    icon: Bell,
  },
  {
    title: "Premium Companies",
    description:
      "Connect directly with verified startups and enterprise companies.",
    icon: Briefcase,
  },
  {
    title: "Privacy First",
    description:
      "Your data stays protected and visible only to selected recruiters.",
    icon: Shield,
  },
];

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Frontend Engineer",
    review:
      "This platform completely changed my career journey. Clean UI and amazing opportunities.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format",
  },
  {
    name: "Maria Garcia",
    role: "Product Designer",
    review:
      "The experience feels premium. Everything from jobs to recruiter communication is seamless.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format",
  },
];

const members = [
  {
    name: "Vishnu",
    role: "Frontend Developer",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format",
  },
  {
    name: "Dhoni",
    role: "Backend Developer",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format",
  },
  {
    name: "Vinutha",
    role: "UI/UX Designer",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format",
  },
  {
    name: "Saritha",
    role: "DevOps Engineer",
    image:
      "https://images.unsplash.com/photo-1586250890303-622708245b2e?q=80&w=1064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Jahnavi",
    role: "HR Manager",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&auto=format",
  },
  {
    name: "Gorvardhan",
    role: "Product Manager",
    image:
      "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600&auto=format",
  },
];

const LandingPage = () => {
  return (
    <div className="w-full min-h-screen bg-background text-foreground overflow-hidden">


      <main className="relative">
        {/* HERO */}
        <section className="relative min-h-screen flex items-center py-12 lg:py-0">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

            <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10">
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
              {/* LEFT */}
              <div className="flex flex-col gap-8 text-center lg:text-left items-center lg:items-start">
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full w-fit border border-primary/20">
                  <CheckCircle2 className="w-4 h-4" />

                  <span className="text-sm font-semibold">
                    Trusted by professionals
                  </span>
                </div>

                <div className="space-y-6">
                  <h1 className="text-4xl sm:text-5xl xl:text-7xl font-black tracking-tight leading-none">
                    Find your
                    <span className="text-primary block mt-2">
                      dream career
                    </span>
                    with confidence
                  </h1>

                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                    Connect with top companies, discover premium opportunities,
                    and build the future you deserve with a modern hiring
                    platform designed for the next generation.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <NavLink to="/auth/register" className="w-full sm:w-auto">
                    <button className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-2">
                      Start Your Journey
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </NavLink>

                  <button
                    onClick={() => {
                      toast.error("Login required");
                    }}
                    className="w-full sm:w-auto border border-border bg-card px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-secondary transition-all"
                  >
                    Explore Jobs
                  </button>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-4">
                  <div>
                    <h2 className="text-3xl font-black">100+</h2>

                    <p className="text-muted-foreground">Active Jobs</p>
                  </div>

                  <div>
                    <h2 className="text-3xl font-black">10+</h2>

                    <p className="text-muted-foreground">Companies</p>
                  </div>

                  <div>
                    <h2 className="text-3xl font-black">95%</h2>

                    <p className="text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </div>

              {/* RIGHT IMAGE */}
              <div className="relative flex items-center justify-center w-full">
                <div className="relative w-full max-w-[520px]">
                  <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-110" />

                  <img
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&auto=format&fit=crop&q=80"
                    alt="Software Developer"
                    className="
                      relative z-10
                      w-full
                      h-auto
                      object-cover
                      rounded-[28px] sm:rounded-[40px]
                      shadow-2xl
                      border border-border
                    "
                  />

                  <div
                    className="
                      absolute
                      -bottom-4 sm:-bottom-6
                      -left-2 sm:-left-6
                      bg-card/90
                      backdrop-blur-xl
                      border border-border
                      rounded-2xl sm:rounded-3xl
                      p-4 sm:p-5
                      shadow-xl
                      z-20
                    "
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                      </div>

                      <div>
                        <h3 className="font-bold text-base sm:text-lg">
                          100+ New Jobs
                        </h3>

                        <p className="text-muted-foreground text-xs sm:text-sm">
                          Posted this week
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-28 border-y border-border bg-card/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black">
                Why professionals choose us
              </h2>

              <p className="text-muted-foreground mt-5 text-lg max-w-2xl mx-auto">
                Built for speed, simplicity, and modern recruitment.
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={index}
                    className="bg-background border border-border rounded-[30px] p-8 hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-xl"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>

                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>

                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TEAM MEMBERS */}
        <section className="py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-20">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-black">Meet our team</h2>

              <p className="text-muted-foreground mt-5 text-lg">
                Passionate professionals building the future of hiring.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-[320px] object-cover"
                  />

                  <div className="p-6">
                    <h3 className="text-2xl font-bold">{member.name}</h3>

                    <p className="text-primary font-medium mt-1">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-28 bg-card/40 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black">
                What users say
              </h2>

              <p className="text-muted-foreground mt-5 text-lg">
                Real stories from professionals.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {testimonials.map((user, index) => (
                <div
                  key={index}
                  className="bg-background border border-border rounded-[32px] p-8 flex flex-col gap-8 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-primary text-primary"
                      />
                    ))}
                  </div>

                  <p className="text-xl leading-relaxed">"{user.review}"</p>

                  <div className="flex items-center gap-4">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />

                    <div>
                      <h4 className="font-bold text-lg">{user.name}</h4>

                      <p className="text-primary font-medium">{user.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-28 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-primary-foreground leading-tight">
              Ready to level up your career?
            </h2>

            <p className="text-primary-foreground/80 text-lg mt-6 leading-relaxed">
              Join the next generation hiring platform and unlock opportunities
              from leading companies.
            </p>

            <NavLink to="/auth/register">
              <button className="mt-10 bg-background text-primary px-10 py-4 rounded-2xl text-lg font-bold hover:scale-[1.02] transition-all shadow-2xl">
                Create Free Account
              </button>
            </NavLink>
          </div>
        </section>

     
      </main>
    </div>
  );
};

export default LandingPage;
