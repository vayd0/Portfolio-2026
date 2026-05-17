"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import Card from "./Card";
import FallIn from "./FallIn";

type Project = {
  _id: string;
  title: string;
  image?: string;
  gallery?: string[];
  description?: string;
  projectUrl?: string;
  github?: string;
  color?: string;
};

interface ProjetsClientProps {
  projects: Project[];
}

const galleryRotations = [-3, 2, -1.5];

export default function ProjetsClient({ projects }: ProjetsClientProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current) {
      gsap.set(panelRef.current, { x: "100%" });
    }
  }, []);

  const openPanel = useCallback((project: Project) => {
    setSelectedProject(project);
    setPanelOpen(true);
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { x: "100%" },
        { x: 0, duration: 0.7, ease: "expo.out" }
      );
    }
  }, []);

  const closePanel = useCallback(() => {
    if (panelRef.current) {
      gsap.to(panelRef.current, {
        x: "100%",
        duration: 0.5,
        ease: "power3.in",
        onComplete: () => {
          setPanelOpen(false);
          setSelectedProject(null);
        },
      });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && panelOpen) {
        closePanel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [panelOpen, closePanel]);

  const imgSrc = (url: string) => `/api/img?url=${encodeURIComponent(url)}`;

  return (
    <>
      <div className="flex flex-wrap justify-start gap-12 px-16 py-20">
        {projects.map((project, i) => (
          <FallIn key={project._id} delay={i * 0.05}>
            <div
              className="w-[380px] shrink-0"
              onClick={() => openPanel(project)}
              style={{ cursor: "pointer" }}
            >
              <Card
                title={project.title}
                image={project.image}
                color={project.color}
                index={i}
              />
            </div>
          </FallIn>
        ))}
      </div>

      <div
        ref={panelRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "#0d0d0d",
          overflowY: "auto",
          pointerEvents: panelOpen ? "auto" : "none",
        }}
      >
        <div
          style={{
            padding: `clamp(32px, 6vh, 96px) clamp(24px, 5vw, 80px) clamp(24px, 5vw, 80px)`,
          }}
        >
          <button
            onClick={closePanel}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 100,
              padding: "10px 20px",
              color: "#ffffff",
              fontFamily: "Satoshi, sans-serif",
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
              marginBottom: "clamp(32px, 5vh, 56px)",
              letterSpacing: "0.01em",
            }}
          >
            ← Fermer
          </button>

          {selectedProject && (
            <>
              <h1
                style={{
                  fontFamily: "Dudu, sans-serif",
                  fontSize: "clamp(3.5rem, 8vw, 9rem)",
                  lineHeight: 0.9,
                  fontWeight: 700,
                  marginBottom: "clamp(32px, 5vh, 56px)",
                  background: "linear-gradient(90deg, #92FF33, #C5FF33)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  wordBreak: "break-word",
                }}
              >
                {selectedProject.title}
              </h1>

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "clamp(32px, 5vw, 80px)",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    flex: "0 1 55%",
                    minWidth: "280px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {selectedProject.image && (
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "16/9",
                        borderRadius: 12,
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={imgSrc(selectedProject.image)}
                        alt={selectedProject.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  )}

                  {selectedProject.description && (
                    <p
                      style={{
                        fontFamily: "Dudu, sans-serif",
                        fontSize: "clamp(1.1rem, 1.5vw, 1.5rem)",
                        color: "rgba(255,255,255,0.85)",
                        lineHeight: 1.6,
                        marginTop: 24,
                        marginBottom: 32,
                      }}
                    >
                      {selectedProject.description}
                    </p>
                  )}

                  <div style={{ display: "flex", flexDirection: "row", gap: 24, flexWrap: "wrap" }}>
                    {selectedProject.projectUrl && (
                      <a
                        href={selectedProject.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          padding: "10px 24px",
                          borderRadius: 100,
                          background: "linear-gradient(135deg, #92FF33, #C5FF33)",
                          color: "#000000",
                          fontFamily: "Satoshi, sans-serif",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          textDecoration: "none",
                          letterSpacing: "0.01em",
                        }}
                      >
                        Voir le projet ↗
                      </a>
                    )}
                    {selectedProject.github && (
                      <a
                        href={selectedProject.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          padding: "10px 24px",
                          color: "#ffffff",
                          fontFamily: "Satoshi, sans-serif",
                          fontWeight: 500,
                          fontSize: "0.95rem",
                          textDecoration: "underline",
                          textUnderlineOffset: 3,
                          letterSpacing: "0.01em",
                        }}
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>
                </div>

                {selectedProject.gallery && selectedProject.gallery.length > 0 && (
                  <div
                    style={{
                      flex: "0 1 45%",
                      minWidth: "220px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    {selectedProject.gallery.map((src, gi) => (
                      <div
                        key={gi}
                        style={{
                          width: "100%",
                          aspectRatio: "16/9",
                          borderRadius: 8,
                          overflow: "hidden",
                          transform: `rotate(${galleryRotations[gi % galleryRotations.length]}deg)`,
                        }}
                      >
                        <img
                          src={imgSrc(src)}
                          alt={`${selectedProject.title} ${gi + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
