import React from 'react';

function Submit({ title = "Submit", onClick }) {
  return (
    <button
      style={{
        gap: "10px",
        height: "45px",
        backgroundColor: "#0096D6",
        color: "#fff",
        padding: "8px 20px",
        borderRadius: "5px",
        cursor: "pointer",
        borderColor: "#1A69AC",
        width: "300px",
        border: "1px solid",
      }}
      onClick={onClick}
    >
      {title}
    </button>
  );
}

export default Submit;
