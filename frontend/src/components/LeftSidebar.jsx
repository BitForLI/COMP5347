import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function LeftSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const apply = () => setIsNarrow(Boolean(mq.matches));
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const links = useMemo(
    () => [
      { to: "/quiz", label: "Quiz" },
      { to: "/leaderboard", label: "Leaderboard" },
      { to: "/attempts", label: "My Attempts" },
      ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
    ],
    [user?.role]
  );

  function isActive(to) {
    return location.pathname === to;
  }

  const collapsedW = isNarrow ? 0 : 48;

  return (
    <>
      {isNarrow && isOpen ? (
        <button className="ls-backdrop" type="button" aria-label="Close menu" onClick={() => setIsOpen(false)} />
      ) : null}

      <div
        className={`ls ${isOpen ? "open" : "closed"}`}
        style={{
          width: isNarrow ? (isOpen ? "min(220px, 70vw)" : 0) : isOpen ? 280 : collapsedW,
        }}
      >
        <div className="ls-head">
          <button
            className="ls-head-btn"
            type="button"
            aria-label={isOpen ? "Collapse menu" : "Expand menu"}
            onClick={() => setIsOpen((v) => !v)}
          >
            ☰
          </button>
          {isOpen ? <div className="ls-head-title">MENU</div> : null}
        </div>

        {isOpen ? (
          <>
            <div className="ls-profile">
              <div className="ls-name">{user?.name || user?.email || "User"}</div>
              {user?.email ? <div className="muted small">{user.email}</div> : null}
            </div>

            <div className="ls-list">
              {links.map((l) => (
                <Link
                  key={l.to}
                  className={`ls-item ${isActive(l.to) ? "selected" : ""}`}
                  to={l.to}
                  onClick={() => {
                    if (isNarrow) setIsOpen(false);
                  }}
                >
                  <span className="ls-item-label">{l.label}</span>
                  <span className="ls-item-chev" aria-hidden="true">
                    ›
                  </span>
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </div>

      {/* Placeholder to push content on desktop, like iga */}
      <div
        className="ls-spacer"
        style={{
          width: isNarrow ? 0 : isOpen ? 280 : collapsedW,
        }}
      />
    </>
  );
}

