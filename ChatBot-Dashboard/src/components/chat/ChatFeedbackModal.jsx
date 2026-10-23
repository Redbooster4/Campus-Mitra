import styles from "@/pages/styles/Chat.module.css";
import profileStyles from "@/pages/styles/Profile.module.css";
import modalStyles from "@/pages/styles/Modal.module.css";
import PeekRating from "@/components/PeekRating";

export default function ChatFeedbackModal({
  isOpen,
  sessionFeedbackSaved,
  sessionEndedManually,
  sessionNeedsFollowup,
  sessionRating,
  setSessionRating,
  contactPhone,
  setContactPhone,
  contactEmail,
  setContactEmail,
  sessionFeedbackBusy,
  sessionFeedbackError,
  requiresContact,
  onSubmit,
  onStartNewSession,
}) {
  if (!isOpen) return null;

  return (
    <section
      className={`${styles.counselorHeader} ${styles.sessionFeedbackToast}`}
      role="dialog"
      aria-labelledby="session-feedback-title"
    >
      {sessionFeedbackSaved ? (
        <div className={`${styles.headerActions} ${styles.sessionFeedbackSuccess}`}>
          <div>
            <h2>Thanks for your feedback!</h2>
            <p className={styles.subtitle}>
              Your rating and counseling session details have been recorded.
            </p>
          </div>
          <button
            type="button"
            className={`${modalStyles.primaryButton} ${styles.sessionSubmitButton}`}
            onClick={onStartNewSession}
          >
            Start a new conversation
          </button>
        </div>
      ) : (
        <form className={styles.sessionFeedbackForm} onSubmit={onSubmit}>
          <div>
            <h2 id="session-feedback-title">How was your counseling session?</h2>
            <p className={styles.subtitle}>
              {sessionEndedManually
                ? "Your chat has ended. Leave a rating and add an optional phone number or email if you would like our admissions team to follow up."
                : sessionNeedsFollowup
                ? "This conversation ended after 10 minutes of inactivity. Leave a rating and contact details so our admissions team can follow up."
                : "This conversation ended after 10 minutes of inactivity. How helpful was Mitra?"}
            </p>
          </div>

          <div className={styles.feedbackContainer}>
            <span className={styles.feedbackLabel}>Your rating</span>
            <PeekRating
              value={sessionRating || 5}
              onChange={setSessionRating}
              labels={["Poor", "Fair", "Good", "Helpful", "Exceptional"]}
              size={22}
              ariaLabel="Rate your chat session"
            />
          </div>

          <div className={profileStyles.formGrid}>
            <div className={profileStyles.formGroup}>
              <label>
                Phone number (optional)
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  disabled={sessionFeedbackBusy}
                />
              </label>
            </div>
            <div className={profileStyles.formGroup}>
              <label>
                Email address (optional)
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={sessionFeedbackBusy}
                />
              </label>
            </div>
          </div>

          {sessionFeedbackError && (
            <p
              className={styles.feedbackThankYou}
              style={{ color: "var(--warning, #f59e0b)" }}
              role="alert"
            >
              ⚠️ {sessionFeedbackError}
            </p>
          )}

          <div className={styles.headerActions}>
            <span className={styles.feedbackLabel}>
              {contactPhone.trim() || contactEmail.trim()
                ? "Admissions counselor will follow up with you."
                : "Your rating will be saved with this counseling session."}
            </span>
            <button
              type="submit"
              className={`${modalStyles.primaryButton} ${styles.sessionSubmitButton}`}
              disabled={sessionFeedbackBusy}
            >
              {sessionFeedbackBusy ? "Saving…" : "Submit feedback"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
