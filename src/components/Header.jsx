// components/Header.jsx
import React from "react";

export default function Header({ title }) {
  const headerStyle = {
    backgroundColor: "#0064a4",
    padding: "10px 0",
    width: "100%",
    position: "relative",
  };

  const logoStyle = {
    height: "75px",
    width: "auto",
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
  };

  const leftLogoStyle = { ...logoStyle, left: "10px" };
  const rightLogoStyle = { ...logoStyle, right: "10px" };

  const titleStyle = {
    color: "#fff",
    textAlign: "center",
    margin: 0,
    lineHeight: "75px",
    fontSize: "1.5em",
  };

  return (
    <header style={headerStyle}>
      <img src={import.meta.env.BASE_URL + 'images/BCeater-right.png'} alt="Left Logo" style={leftLogoStyle} />
      <h2 style={titleStyle}>{title}</h2>
      <img src={import.meta.env.BASE_URL + 'images/BCeater-left.png'} alt="Right Logo" style={rightLogoStyle} />
    </header>
  );
}
