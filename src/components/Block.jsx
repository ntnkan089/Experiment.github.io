export default function DuplicateParticipationModal({ open }) {
  if (!open) return null;

  /* const redirectToProlific = () => {
    const PROLIFIC_REDIRECT =
      "https://app.prolific.co/submissions/complete?cc=UNIQUECODE";
    
      window.location.replace(PROLIFIC_REDIRECT);
  }; */

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={titleStyle}>Duplicate Participation Detected</h2>

        <p style={textStyle}>
          <strong>You have already participated in this study.</strong>
        </p>

        <p style={textStyle}>
          Participation is limited to one time only.
        </p>

        <p style={textStyle}>
          Please <strong>return</strong> your submission by closing this study
          and clicking <strong>“Stop Without Completing”</strong> on Prolific.
        </p>
        {/* <button 
          onClick={redirectToProlific}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
          style={{
            marginTop: "20px",
            padding: "14px 26px",
            backgroundColor: "#007bff",
            color: "white",
            borderRadius: 8,
            width: "100%",
            maxWidth: 350,
            cursor:"pointer",  
          }} >
           Redirect to Prolific
        </button> */}
      </div>
    </div>
  );
}
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle = {
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "8px",
  maxWidth: "500px",
  width: "90%",
  textAlign: "center",
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
};

const titleStyle = {
  marginBottom: "15px",
};

const textStyle = {
  marginBottom: "10px",
  lineHeight: "1.5",
};
