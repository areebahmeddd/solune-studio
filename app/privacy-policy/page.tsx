"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = "Solune Studio - Privacy Policy";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last Updated: January 01, 2026
            </p>
          </div>

          <p className="text-lg">
            Solune Studio is committed to protecting your privacy. This Privacy
            Policy explains how we collect, use, and safeguard your information
            when you use our salon management dashboard.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              1. Information We Collect
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium">1.1 Account Information</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Email address and encrypted password</li>
                  <li>Account creation and last login timestamps</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium">1.2 Business Data</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>
                    Client information (names, phone numbers, visit history)
                  </li>
                  <li>
                    Appointment records (dates, services, amounts, discounts)
                  </li>
                  <li>Inventory items and stock levels</li>
                  <li>Service offerings and pricing</li>
                  <li>Expense records and categories</li>
                  <li>Stylist information</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium">1.3 Usage Information</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Dashboard interactions and feature usage</li>
                  <li>Session data and preferences</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>
                Provide and maintain salon management features (appointments,
                inventory, sales tracking)
              </li>
              <li>Generate analytics and business insights</li>
              <li>Manage user authentication and account security</li>
              <li>
                Send promotional messages via WhatsApp (with your explicit
                action)
              </li>
              <li>Improve and optimize our services</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              3. Data Storage and Security
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>
                Data is stored using Firebase Firestore, a secure cloud database
                by Google
              </li>
              <li>
                Passwords are encrypted using industry-standard authentication
              </li>
              <li>All data transmissions are encrypted via HTTPS</li>
              <li>Access is protected by Firebase Authentication</li>
              <li>
                Session data is stored locally in your browser for convenience
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Third-Party Services</h2>
            <p className="text-muted-foreground">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>
                <strong>Firebase (Google):</strong> Authentication and database
                services
              </li>
              <li>
                <strong>Vercel:</strong> Hosting and analytics
              </li>
              <li>
                <strong>WhatsApp Business API:</strong> For sending promotional
                messages
              </li>
            </ul>
            <p className="text-muted-foreground mt-2">
              These services may collect information as described in their
              respective privacy policies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal or business data. We may share data
              only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>
                With WhatsApp Business API when you send promotional messages to
                clients
              </li>
              <li>
                With service providers (Firebase, Vercel) who assist in
                operating our services
              </li>
              <li>When required by law or to protect our rights and safety</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              6. Your Rights and Choices
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>
                Access and update your account information through the settings
                page
              </li>
              <li>Delete individual records (appointments, expenses, etc.)</li>
              <li>Export your data to CSV format</li>
              <li>Sign out at any time to end your session</li>
              <li>Contact us to request account deletion and data removal</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your data for as long as your account is active. If you
              request account deletion, we will permanently remove all your
              business data and personal information from our database.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and local storage for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Authentication and session management</li>
              <li>Remembering your preferences (sidebar state, etc.)</li>
              <li>Basic analytics through Vercel Analytics</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              9. Changes to This Policy
            </h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy periodically. Changes will be
              reflected by updating the "Last Updated" date. Continued use of
              Solune Studio after changes constitutes acceptance of the updated
              policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact
              us:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                Email:{" "}
                <a
                  href="mailto:privacy@solunestudio.com"
                  className="underline hover:text-foreground"
                >
                  privacy@solunestudio.com
                </a>
              </p>
              <p>
                GitHub:{" "}
                <a
                  href="https://github.com/areebahmeddd"
                  className="underline hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/areebahmeddd
                </a>
              </p>
            </div>
          </section>

          <div className="pt-8 border-t">
            <p className="text-sm text-muted-foreground text-center">
              By using Solune Studio, you acknowledge that you have read and
              understood this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
