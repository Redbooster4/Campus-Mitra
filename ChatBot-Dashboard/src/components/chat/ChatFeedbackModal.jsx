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
            <h2>Thanks for your feedback.</h2>
            <p className={styles.subtitle}>
              Your follow-up details have been saved for the admissions team.
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
            <h2 id="session-feedback-title">How was your chat?</h2>
            <p className={styles.subtitle}>
              {sessionEndedManually
                ? "Your chat has ended. Leave a rating and add a phone number or email so our admissions team can follow up."
                : sessionNeedsFollowup
                ? "This conversation ended after 10 minutes of inactivity. Leave a rating and contact details so our admissions team can follow up."
                : "This conversation ended after 10 minutes of inactivity. How helpful was Mitra?"}
            </p>
          </div>

          <div className={styles.feedbackContainer}>
            <span className={styles.feedbackLabel}>Your rating</span>
            <PeekRating
              value={sessionRating}
              onChange={setSessionRating}
              labels={["Poor", "Fair", "Good", "Helpful", "Exceptional"]}
              size={20}
              lift={4}
              activeColor="var(--primary)"
              idleColor="var(--muted)"
              tipColor="var(--card)"
              tipTextColor="var(--text)"
              ariaLabel="Rate your chat session"
            />
          </div>

          {requiresContact && (
            <div className={profileStyles.formGrid}>
              <div className={profileStyles.formGroup}>
                <label>
                  Phone number
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    pattern="[0-9+() .-]{7,20}"
                    title="Enter a valid phone number"
                    required={!contactEmail.trim()}
                    disabled={sessionFeedbackBusy}
                  />
                </label>
              </div>
              <div className={profileStyles.formGroup}>
                <label>
                  Email address
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    required={!contactPhone.trim()}
                    disabled={sessionFeedbackBusy}
                  />
                </label>
              </div>
            </div>
          )}

          {sessionFeedbackError && (
            <p
              className={styles.feedbackThankYou}
              style={{ color: "var(--warning)" }}
              role="alert"
            >
              {sessionFeedbackError}
            </p>
          )}

          <div className={styles.headerActions}>
            <span className={styles.feedbackLabel}>
              {requiresContact
                ? "Add at least one contact method."
                : "Your rating is saved with this chat."}
            </span>
            <button
              type="submit"
              className={`${modalStyles.primaryButton} ${styles.sessionSubmitButton}`}
              disabled={
                sessionFeedbackBusy ||
                sessionRating < 1 ||
                (requiresContact && !contactPhone.trim() && !contactEmail.trim())
              }
            >
              {sessionFeedbackBusy ? "Saving…" : "Submit feedback"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

