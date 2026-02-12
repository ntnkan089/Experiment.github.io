export default function CompNo({ open }) {
  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={titleStyle}>Study Ended</h2>

        <p style={textStyle}>
          <strong>
            You did not pass this comprehension check after two attempts.
          </strong>
        </p>

        <p style={textStyle}>
          The study has now ended.
        </p>

        <p style={textStyle}>
          Please <strong>return</strong> your submission by closing this study
          and clicking <strong>“Stop Without Completing”</strong> on Prolific.
        </p>
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
