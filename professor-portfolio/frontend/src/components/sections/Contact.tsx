import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Mail, MessageCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';
import { submitContact } from '../../lib/api';
import { profileConfig } from '../../config/profile';

export const Contact: React.FC = () => {
  const { contact, professor } = profileConfig;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    // Client-side validation checks
    if (!name.trim()) {
      setFeedback({ type: 'error', text: 'Please enter your name.' });
      setSubmitting(false);
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFeedback({ type: 'error', text: 'Please enter a valid email address.' });
      setSubmitting(false);
      return;
    }
    if (message.trim().length < 10) {
      setFeedback({ type: 'error', text: 'Message must be at least 10 characters long.' });
      setSubmitting(false);
      return;
    }

    try {
      const res = await submitContact({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        type: 'contact'
      });
      setFeedback({ type: 'success', text: res.message || contact.feedbackMessages.success });
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      if (err.message === 'RATE_LIMITED') {
        setFeedback({ type: 'error', text: contact.feedbackMessages.rateLimited });
      } else {
        setFeedback({ type: 'error', text: err.message || contact.feedbackMessages.error });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <Reveal>
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-mono text-brand-cyan px-3.5 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20">
            Direct Communication
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            {contact.title}
          </h2>
          <p className="mt-4 text-neutral-400 max-w-xl text-base">
            {contact.subtitle}
          </p>
          <div className="mt-4 w-12 h-1 bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-violet rounded-full" />
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side Quick Info */}
        <Reveal delayMs={100} className="md:col-span-5 space-y-6">
          <Card className="p-6 space-y-6 border-brand-cyan/20">
            <div className="space-y-2">
              <h3 className="text-xl font-light text-white">Faculty Correspondence</h3>
              <p className="text-sm text-neutral-400">
                Messages submitted here are routed directly to {professor.name}'s academic desk.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <div className="p-2.5 rounded-xl bg-brand-cyan/10 text-brand-cyan">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-mono text-neutral-500">Email Placeholder</span>
                  <span className="font-mono text-xs text-white">{"{{PROFESSOR_EMAIL}}"}@university.edu</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <div className="p-2.5 rounded-xl bg-brand-violet/10 text-brand-violet">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-mono text-neutral-500">Response Window</span>
                  <span className="text-xs text-neutral-300">Typically within 24-48 business hours</span>
                </div>
              </div>
            </div>
          </Card>
        </Reveal>

        {/* Right Side Form */}
        <Reveal delayMs={200} className="md:col-span-7">
          <Card className="p-8 border-brand-cyan/30">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-mono text-neutral-300 mb-2">
                  {contact.formLabels.name} *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan text-sm transition-all"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-mono text-neutral-300 mb-2">
                  {contact.formLabels.email} *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan text-sm transition-all"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-mono text-neutral-300 mb-2">
                  {contact.formLabels.message} * (10 – 1000 characters)
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  minLength={10}
                  maxLength={1000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Inquire about research papers, course office hours, or collaboration..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan text-sm transition-all resize-none"
                />
              </div>

              {feedback && (
                <div
                  className={`flex items-center gap-2 p-3.5 rounded-xl text-xs font-medium ${
                    feedback.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                variant="solid"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? contact.formLabels.submittingBtn : contact.formLabels.submitBtn}</span>
              </Button>
            </form>
          </Card>
        </Reveal>
      </div>
    </section>
  );
};
