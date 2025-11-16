// components/Complete.jsx
import { useState } from "react";

export default function Complete() {
  const [feedback, setFeedback] = useState("");

  const handleFeedbackChange = (e) => setFeedback(e.target.value);

  const submitFeedback = () => {
    console.log("User Feedback:", feedback);
    // TODO: send feedback to database here
    alert("Thank you for your feedback!");
  };

  const redirectToProlific = () => {
    const PROLIFIC_REDIRECT = "https://app.prolific.co/submissions/complete?cc=UNIQUECODE";
    window.location.replace(PROLIFIC_REDIRECT);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h3><b>Thank You!</b></h3>
      <h3>We greatly appreciate your interest and participation in our study.</h3>

      <hr style={{ border: "1px solid #0064a0", width: "90%" }} />

      <h4><b>User Feedback</b></h4>
      <textarea
        rows={4}
        value={feedback}
        onChange={handleFeedbackChange}
        placeholder="Thank you for participating in this study! Any feedback about your experience is appreciated."
        style={{ width: "100%", padding: 10 }}
      />
      <br />
      <button onClick={submitFeedback} style={{ marginTop: 10 }} className="btn btn-secondary">
        Submit Feedback
      </button>

      <hr style={{ border: "1px solid #0064a0", width: "90%" }} />

      <h4><b>Redirect URL</b></h4>
      <h5>
        To be compensated, you must click the button below to be redirected back to Prolific.
      </h5>
      <h5>
        Once you are redirected, you will not be able to return to this page.
      </h5>

      <button
        onClick={redirectToProlific}
        style={{ marginTop: 10 }}
        className="btn btn-primary"
      >
        Redirect to Prolific
      </button>
    </div>
  );
}
