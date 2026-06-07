import React from "react";

const Footer = () => {
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "32px 24px",
        marginTop: "auto",
        fontSize: "13px",
        color: "var(--muted)",
        borderTop: "1px solid var(--border)",
        background: "white",
        lineHeight: "1.8",
      }}
    >
      <div style={{ marginBottom: "8px" }}>
        Designed and Developed by{" "}
        <span style={{ color: "var(--accent)" }}>S. M. Saikat Hossain</span>
      </div>
      <div>
        WhatsApp:{" "}
        <a
          href="https://wa.me/8801744510689"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "none" }}
          onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
          onMouseOut={(e) => (e.target.style.textDecoration = "none")}
        >
          +8801744510689
        </a>
      </div>
    </footer>
  );
};

export default Footer;
