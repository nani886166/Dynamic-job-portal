import React from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const ContactPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add submission logic here
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 pb-24">
      <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4">Get in Touch</h1>
        <p className="text-muted-foreground text-lg">Have a question or need support? We're here to help. Reach out to our team using the options below.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Side: Contact Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Email</h3>
              <p className="text-sm text-muted-foreground mt-1">support@jobportal.com</p>
              <p className="text-sm text-muted-foreground">sales@jobportal.com</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Phone</h3>
              <p className="text-sm text-muted-foreground mt-1">+91 9876543210</p>
              <p className="text-sm text-muted-foreground">Mon - Fri, 9am - 6pm</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">HQ Office</h3>
              <p className="text-sm text-muted-foreground mt-1">123 Tech Park, Innovation Hub<br />Bangalore, India 560001</p>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="md:col-span-2 bg-card border border-border rounded-[24px] p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
                <input type="text" required className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                <input type="email" required className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Subject</label>
              <input type="text" required className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" placeholder="How can we help?" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Message</label>
              <textarea required rows="4" className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow resize-none" placeholder="Write your message here..."></textarea>
            </div>
            <button type="submit" className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-md">
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;