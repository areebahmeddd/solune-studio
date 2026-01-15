"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function TermsOfServicePage() {
  useEffect(() => {
    document.title = "Solune Studio - Terms of Service";
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
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last Updated: January 01, 2026
            </p>
          </div>

          <p className="text-lg">
            Welcome to Solune Studio. These Terms of Service govern your access
            to and use of our salon management dashboard. By using Solune
            Studio, you agree to these Terms. If you do not agree, please
            discontinue use immediately.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By creating an account or using Solune Studio, you acknowledge
              that you have read, understood, and agree to be bound by these
              Terms and our Privacy Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              2. Account Registration and Security
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>
                You must provide accurate and current information during
                registration
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your
                password
              </li>
              <li>
                Notify us immediately of any unauthorized access or security
                breach
              </li>
              <li>
                You are solely responsible for all activities under your account
              </li>
              <li>Each user may maintain only one account</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Use of Services</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium">3.1 Permitted Use</h3>
                <p className="text-muted-foreground">
                  Solune Studio provides tools for managing salon appointments,
                  tracking sales and expenses, managing inventory, sending
                  promotional messages, and analyzing business performance.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium">
                  3.2 Prohibited Activities
                </h3>
                <p className="text-muted-foreground mb-2">You agree NOT to:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Use the service for any unlawful purpose</li>
                  <li>
                    Attempt to gain unauthorized access to our systems or
                    databases
                  </li>
                  <li>
                    Interfere with or disrupt the integrity or performance of
                    the service
                  </li>
                  <li>
                    Use automated tools to access the service without permission
                  </li>
                  <li>Share or distribute your account credentials</li>
                  <li>Upload malicious code, viruses, or harmful content</li>
                  <li>Impersonate another person or entity</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Data and Content</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium">4.1 Your Data</h3>
                <p className="text-muted-foreground">
                  You retain ownership of all business data you enter into
                  Solune Studio (client information, appointments, inventory,
                  etc.). By using our service, you grant us the right to store
                  and process this data solely for providing and improving the
                  service.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium">4.2 Data Accuracy</h3>
                <p className="text-muted-foreground">
                  You are responsible for the accuracy and legality of the data
                  you enter. Ensure you have proper consent before storing
                  client information.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium">4.3 WhatsApp Messaging</h3>
                <p className="text-muted-foreground">
                  When using the promotional messaging feature, you must comply
                  with WhatsApp's Business Policy and ensure you have consent
                  from recipients. We are not responsible for your use of the
                  WhatsApp API.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Third-Party Services</h2>
            <p className="text-muted-foreground">
              Our service integrates with Firebase, Vercel, and WhatsApp
              Business API. Your use of these services is subject to their
              respective terms and policies. We are not responsible for
              third-party services or their content.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              6. Disclaimers and Limitation of Liability
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium">6.1 "AS IS" Basis</h3>
                <p className="text-muted-foreground">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                  WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium">6.2 No Warranty</h3>
                <p className="text-muted-foreground">
                  We do not warrant that the service will be uninterrupted,
                  error-free, or secure. You use the service at your own risk.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium">
                  6.3 Limitation of Liability
                </h3>
                <p className="text-muted-foreground">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE
                  FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                  PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Termination</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium">7.1 By You</h3>
                <p className="text-muted-foreground">
                  You may stop using the service at any time. Contact us to
                  request account deletion.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium">7.2 By Us</h3>
                <p className="text-muted-foreground">
                  We reserve the right to suspend or terminate your access at
                  any time for conduct that violates these Terms or is harmful
                  to other users or us.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium">
                  7.3 Effect of Termination
                </h3>
                <p className="text-muted-foreground">
                  Upon termination, your right to use the service will
                  immediately cease. We will handle your data as described in
                  our Privacy Policy.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              8. Modifications to Service and Terms
            </h2>
            <p className="text-muted-foreground">
              We reserve the right to modify, suspend, or discontinue the
              service at any time. We may also update these Terms periodically.
              Continued use after changes constitutes acceptance of the modified
              Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with
              the laws of India. Any disputes shall be subject to the exclusive
              jurisdiction of the courts located in India.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                Email:{" "}
                <a
                  href="mailto:legal@solunestudio.com"
                  className="underline hover:text-foreground"
                >
                  legal@solunestudio.com
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
              By using Solune Studio, you acknowledge that you have read,
              understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
