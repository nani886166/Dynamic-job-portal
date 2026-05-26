import React from "react";
import { Outlet } from "react-router";
import LandingPage from "../pages/LandingPage";
import { NavLink } from "react-router";
import Breadcrumbs from "../components/Breadcrumbs";
import { Mail, Phone, MapPin } from "lucide-react";

const AuthLayout = () => {
  return (
    <div>
      {/* NAVBAR */}
      <nav className="w-full sticky top-0 z-50 backdrop-blur-xl border-b border-border/50 bg-background/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-xl font-black text-lg">
              JP
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              jobPortal
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NavLink to="/auth/login">
              <button className="px-4 sm:px-5 py-2 rounded-full hover:bg-secondary transition-colors font-medium text-sm sm:text-base">
                Sign In
              </button>
            </NavLink>

            <NavLink to="/auth/register">
              <button className="bg-primary text-primary-foreground px-5 sm:px-6 py-2.5 rounded-full font-semibold hover:bg-primary/90 transition-all shadow-lg text-sm sm:text-base">
                Get Started
              </button>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* BREADCRUMBS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <Breadcrumbs />
      </div>

      {/* CONTENT */}
      <Outlet />
      {/* FOOTER */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid md:grid-cols-3 gap-12">
            {/* LEFT */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-xl font-black text-lg">
                  JP
                </div>

                <h1 className="text-2xl font-black">jobPortal</h1>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Modern hiring platform helping professionals connect with top
                companies and dream careers.
              </p>
            </div>

            {/* CONTACT */}
            <div>
              <h3 className="text-xl font-bold mb-6">Contact</h3>

              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />

                  <span>support@jobportal.com</span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />

                  <span>+91 9876543210</span>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />

                  <span>Bangalore, India</span>
                </div>
              </div>
            </div>

            {/* ABOUT */}
            <div>
              <h3 className="text-xl font-bold mb-6">About Platform</h3>

              <p className="text-muted-foreground leading-relaxed">
                Designed for developers, designers, recruiters, and modern
                professionals looking for premium opportunities worldwide.
              </p>
            </div>
          </div>

          <div className="border-t border-border mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © 2026 jobPortal. All rights reserved.
            </p>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer">
                <Mail className="w-5 h-5" />
              </div>

              <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer">
                <Phone className="w-5 h-5" />
              </div>

              <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
