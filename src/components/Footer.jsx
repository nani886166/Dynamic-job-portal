import React from "react";
import { NavLink } from "react-router";
import Breadcrumbs from "../components/Breadcrumbs";
import {
  RiInstagramLine,
  RiTwitterLine,
  RiLinkedinBoxLine,
} from "@remixicon/react";

const jobSeekerLinks = [
  { label: "Jobs", path: "/jobs" },
  { label: "Browse Companies", path: "/browse-jobs" },
  {label: "Network", path: "/network" },
];

const employerLinks = [
  { label: "Feed", path: "/posts" },
  { label: "Contact Sales", path: "/contact" },
];

const accountLinks = [
  { label: "Manage Your Profile", path: "/profile" },
  { label: "Account Settings", path: "/dashboard" },
];

const socialLinks = [
  { icon: RiLinkedinBoxLine, href: "https://x.com/DhoniN070707", ariaLabel: "LinkedIn" },
  { icon: RiTwitterLine, href: "https://www.linkedin.com/in/vishnu-r-developer/", ariaLabel: "Twitter" },
  { icon: RiInstagramLine, href: "https://www.instagram.com/_the_developer_vishnu.8848_?igsh=N3EwZXp2Z2p0ajJo", ariaLabel: "Instagram" },
];

const legalLinks = [
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms of Service", path: "/terms" },
];

const Footer = () => {
  return (
    <footer className="w-full bg-background pt-8 pb-10 mt-auto text-xs border-t border-border">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* Top Breadcrumbs */}
        <div className="pb-4 border-b border-border">
          <Breadcrumbs />
        </div>

        {/* Brand / Disclaimer Section (Apple style) */}
        <div className="border-b border-border pb-4 my-6">
          <p className="text-muted-foreground leading-relaxed">
            CareerPath is dedicated to connecting global talent with
            industry-leading opportunities through precision matching and career
            advocacy. Opportunities and salary insights are based on aggregate
            data and may vary by region.
          </p>
        </div>

        {/* Main Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 tracking-tight">
              Job Seekers
            </h3>
            <ul className="flex flex-col gap-2.5">
              {jobSeekerLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                    to={link.path}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 tracking-tight">
              Employers
            </h3>
            <ul className="flex flex-col gap-2.5">
              {employerLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                    to={link.path}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Account / Platform */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 tracking-tight">
              Account
            </h3>
            <ul className="flex flex-col gap-2.5">
              {accountLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                    to={link.path}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Socials */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 tracking-tight">
              Stay Connected
            </h3>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.ariaLabel}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Get the latest updates on hiring trends and career advice directly
              in your feed.
            </p>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="border-t border-border pt-4 flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between text-muted-foreground">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
            <p>
              Copyright &copy; {new Date().getFullYear()} CareerPath Inc. All
              rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-2 md:gap-0">
              {legalLinks.map((link, index) => (
                <div key={link.path}>
                  <NavLink
                    to={link.path}
                    className="hover:text-foreground hover:underline transition-colors"
                  >
                    {link.label}
                  </NavLink>
                  {index < legalLinks.length - 1 && (
                    <span className="hidden md:inline mx-3 border-l border-border h-3"></span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 hover:text-foreground cursor-pointer transition-colors">
            <span>India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
