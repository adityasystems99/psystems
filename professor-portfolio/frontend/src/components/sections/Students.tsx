import React, { useEffect, useState } from 'react';
import { Quote, ChevronLeft, ChevronRight, MessageSquarePlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';
import { fetchTestimonials, submitContact, TestimonialItem } from '../../lib/api';

export const Students: React.FC = () => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form submission state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchTestimonials().then((data) => {
      if (mounted) {
        setTestimonials(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handlePrev = () => {
    if (testimonials.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (testimonials.length <= 1) return;
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await submitContact({
        name,
        email,
        message,
        type: 'testimonial'
      });
      setFeedback({ type: 'success', text: res.message });
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setShowModal(false), 2500);
    } catch (err: any) {
      if (err.message === 'RATE_LIMITED') {
        setFeedback({ type: 'error', text: 'Rate limit reached (5 per minute). Please try again shortly.' });
      } else {
        setFeedback({ type: 'error', text: err.message || 'Submission failed. Please check inputs.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="students" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Reveal>
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-mono text-brand-cyan px-3.5 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20">
            Student Community
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Words from Students
          </h2>
          <p className="mt-4 text-neutral-400 max-w-xl text-base">
            Thoughts, memories, and tributes from alumni and researchers guided by his mentorship.
          </p>
          <div className="mt-4 w-12 h-1 bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-orange rounded-full" />
        </div>
      </Reveal>

      {/* Carousel Container */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="h-64 rounded-2xl glass-panel animate-pulse flex items-center justify-center">
            <span className="text-sm font-mono text-neutral-500">Retrieving student tributes...</span>
          </div>
        ) : testimonials.length > 0 ? (
          <div className="relative">
            <Reveal>
              <Card className="p-8 sm:p-12 text-center relative border-brand-cyan/20">
                <Quote className="w-12 h-12 text-brand-cyan/30 mx-auto mb-6" />
                <p className="text-lg sm:text-xl md:text-2xl font-light text-white leading-relaxed italic">
                  "{testimonials[currentIndex].message}"
                </p>
                <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col items-center">
                  <span className="text-base font-medium text-brand-cyan">
                    {testimonials[currentIndex].name}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono mt-0.5">
                    Former Student / Research Mentee
                  </span>
                </div>
              </Card>
            </Reveal>

            {/* Navigation Buttons */}
            {testimonials.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={handlePrev}
                  aria-label="Previous testimonial"
                  className="p-3 rounded-full border border-white/10 bg-white/[0.03] text-neutral-300 hover:text-white hover:border-brand-cyan/40 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-mono text-neutral-400">
                  {currentIndex + 1} / {testimonials.length}
                </span>
                <button
                  onClick={handleNext}
                  aria-label="Next testimonial"
                  className="p-3 rounded-full border border-white/10 bg-white/[0.03] text-neutral-300 hover:text-white hover:border-brand-cyan/40 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty Testimonial State with Invitation */
          <Card className="p-10 text-center space-y-4">
            <Quote className="w-10 h-10 text-brand-cyan/40 mx-auto" />
            <p className="text-lg text-neutral-300 font-light">
              Be the first student to leave a heartfelt thank-you message for your professor!
            </p>
            <p className="text-xs text-neutral-500 font-mono">
              (New testimonials appear here once approved in the database).
            </p>
          </Card>
        )}

        {/* CTA to open Leave a Message Modal */}
        <div className="mt-12 text-center">
          <Button
            onClick={() => setShowModal(true)}
            variant="ghost"
            size="md"
            className="inline-flex items-center gap-2 border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan/10"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Leave a message for Professor</span>
          </Button>
        </div>
      </div>

      {/* Testimonial Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg p-8 rounded-2xl glass-panel border border-brand-cyan/30 shadow-2xl bg-card">
            <h3 className="text-2xl font-light text-white tracking-tight">
              Leave a Message
            </h3>
            <p className="mt-1 text-xs text-neutral-400">
              Submit a personal tribute or thank-you note. It will appear on the site once reviewed.
            </p>

            <form onSubmit={handleSubmitTestimonial} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Sharma"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-brand-cyan text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@university.edu"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-brand-cyan text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1">
                  Your Note / Message (10 – 1000 characters) *
                </label>
                <textarea
                  required
                  rows={4}
                  minLength={10}
                  maxLength={1000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share a memory, guidance, or thank-you note..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-brand-cyan text-sm resize-none"
                />
              </div>

              {feedback && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium ${
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

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={submitting}
                  variant="solid"
                  size="sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Note'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

