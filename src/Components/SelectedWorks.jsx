import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "../data/projects";
import "./SelectedWorks.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const editions = [
  {
    short: "AKAR",
    type: "DATA / EDUCATION",
    note: "Making complex data feel clear.",
    color: "#172634",
  },
  {
    short: "SAMIRA",
    type: "TRAVEL / COMPANY PROFILE",
    note: "A considered start to a meaningful journey.",
    color: "#173035",
  },
  {
    short: "SMILEWORK",
    type: "SPACES / SERVICES",
    note: "A digital home for spaces with character.",
    color: "#331526",
  },
];

const number = (index) => String(index + 1).padStart(2, "0");

export default function SelectedWorks({ setActiveSection }) {
  const sectionRef = useRef(null);
  const tabRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [compact, setCompact] = useState(
    () => window.matchMedia("(max-width: 700px)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => setCompact(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const project = projects[activeIndex];
  const edition = editions[activeIndex];

  useGSAP(
    () => {
      const activate = () =>
        setActiveSection((current) =>
          current.number === "02"
            ? current
            : { number: "02", label: "SELECTED WORKS" },
        );
      const syncSection = () => {
        const bounds = sectionRef.current.getBoundingClientRect();
        if (
          bounds.top <= window.innerHeight * 0.6 &&
          bounds.bottom >= window.innerHeight * 0.4
        )
          activate();
      };
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 60%",
        end: "bottom 40%",
        onEnter: activate,
        onEnterBack: activate,
        onLeaveBack: () =>
          setActiveSection({ number: "01", label: "MANIFESTO" }),
      });
      gsap.from(".works-heading-line", {
        yPercent: 110,
        rotate: 3,
        duration: 1.1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
      });
      
      let refreshFrame = 0;
      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      });
      resizeObserver.observe(sectionRef.current);
      ScrollTrigger.addEventListener("refresh", syncSection);
      syncSection();
      return () => {
        resizeObserver.disconnect();
        cancelAnimationFrame(refreshFrame);
        ScrollTrigger.removeEventListener("refresh", syncSection);
      };
    },
    {
      scope: sectionRef,
      dependencies: [setActiveSection],
      revertOnUpdate: true,
    },
  );

  function selectProject(index, focus = false) {
    const next = (index + projects.length) % projects.length;
    setActiveIndex(next);
    if (focus) tabRefs.current[next]?.focus();
  }

  function handleTabKey(event, index) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const directions = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    };
    if (event.key in directions) {
      event.preventDefault();
      selectProject(index + directions[event.key], true);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      selectProject(event.key === "Home" ? 0 : projects.length - 1, true);
    }
  }

  return (
    <section
      ref={sectionRef}
      id="selected-works"
      className="mono-works"
      aria-labelledby="selected-works-title"
    >
      <div className="works-topline">
        <span>
          <span className="works-status-dot" /> SELECTED WORKS /{" "}
          {number(projects.length - 1)}
        </span>
        <span>INDEPENDENT MIND. SHARED ENDEAVOURS.</span>
      </div>

      <header className="works-heading">
        <h2 id="selected-works-title">
          <span className="works-heading-mask">
            <span className="works-heading-line">Selected</span>
          </span>
          <span className="works-heading-mask works-heading-serif">
            <span className="works-heading-line">
              works<span className="works-heading-period">.</span>
            </span>
          </span>
        </h2>
        <div className="works-heading-note">
          <p>
            Ideas made tangible.
            <br />
            Interfaces made to be used.
          </p>
          <span>
            EXPLORE THE INDEX <ArrowDown size={15} aria-hidden="true" />
          </span>
        </div>
      </header>

      <div
        className="works-exhibit"
        style={{ "--project-tone": edition.color }}
      >
        <div className="works-index">
          <div className="works-index-label">
            <span>THE INDEX</span>
            <span>01 — {number(projects.length - 1)}</span>
          </div>
          <div
            role="tablist"
            aria-label="Select a project"
            aria-orientation={compact ? "horizontal" : "vertical"}
            className="works-tabs"
          >
            {projects.map((item, index) => (
              <button
                type="button"
                role="tab"
                id={`work-tab-${item.id}`}
                aria-controls={`work-panel-${item.id}`}
                aria-selected={activeIndex === index}
                tabIndex={activeIndex === index ? 0 : -1}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                key={item.id}
                className={`works-tab ${activeIndex === index ? "is-active" : ""}`}
                onClick={() => selectProject(index)}
                onKeyDown={(event) => handleTabKey(event, index)}
              >
                <span className="works-tab-top">
                  <span>{number(index)}</span>
                  <span>{editions[index].type}</span>
                </span>
                <span className="works-tab-main">
                  <span>{editions[index].short}</span>
                  <ArrowUpRight aria-hidden="true" />
                </span>
                <span className="works-tab-line" />
              </button>
            ))}
          </div>
          <div className="works-index-foot">
            <Plus size={16} strokeWidth={1} aria-hidden="true" />
            <p>
              Different challenges.
              <br />
              <em>The same attention to detail.</em>
            </p>
          </div>
        </div>

        <div className="works-display">
          <div className="works-stage">
            <div className="works-stage-meta">
              <span>MONO — PROJECT STUDY</span>
              <span>FIG. {number(activeIndex)}</span>
            </div>
            <span className="works-stage-number" aria-hidden="true">
              {number(activeIndex)}
            </span>
            <span
              className="works-stage-cross works-stage-cross--left"
              aria-hidden="true"
            >
              +
            </span>
            <span
              className="works-stage-cross works-stage-cross--right"
              aria-hidden="true"
            >
              +
            </span>
            <a
              className="works-preview"
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${project.title} website (opens in a new tab)`}
            >
              {projects.map((item, index) => (
                <div
                  key={item.id}
                  className={`works-shot ${activeIndex === index ? "is-active" : ""}`}
                  aria-hidden="true"
                >
                  <div className="works-shot-bar">
                    <span />
                    <span />
                    <span />
                    <span className="works-shot-address">
                      {new URL(item.url).hostname}
                    </span>
                  </div>
                  <div className="works-shot-image">
                    <img
                      src={item.image}
                      alt=""
                      width="2880"
                      height="1800"
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                    />
                  </div>
                </div>
              ))}
              <span className="works-open">
                <ArrowUpRight size={23} aria-hidden="true" />
                <span>
                  OPEN
                  <br />
                  PROJECT
                </span>
              </span>
            </a>
            <div className="works-stage-caption">
              <span>DESIGNED TO BE EXPLORED.</span>
              <span>FRONTEND / WEB</span>
            </div>
          </div>

          {projects.map((item, index) => (
            <div
              key={item.id}
              id={`work-panel-${item.id}`}
              role="tabpanel"
              aria-labelledby={`work-tab-${item.id}`}
              hidden={activeIndex !== index}
              tabIndex={0}
              className="works-detail"
            >
              <div className="works-detail-heading">
                <p>{item.category}</p>
                <h3>{editions[index].note}</h3>
              </div>
              <div className="works-detail-body">
                <span className="works-role">{item.role}</span>
                <p>{item.description}</p>
                <div className="works-links">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    Visit website <ArrowUpRight size={16} aria-hidden="true" />
                    <span className="works-sr-only"> (opens in a new tab)</span>
                  </a>
                  {item.repository && (
                    <a
                      href={item.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Source code <ArrowUpRight size={16} aria-hidden="true" />
                      <span className="works-sr-only">
                        {" "}
                        (opens in a new tab)
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="works-bottom">
        <span className="works-bottom-label">
          A SMALL SELECTION.
          <br />
          <em>A little of what I can do.</em>
        </span>
        <div className="works-pagination">
          <span aria-live="polite" aria-atomic="true">
            {number(activeIndex)} <span>/ {number(projects.length - 1)}</span>
            <span className="works-sr-only"> {project.title}</span>
          </span>
          <button
            type="button"
            onClick={() => selectProject(activeIndex - 1)}
            aria-label="Previous project"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => selectProject(activeIndex + 1)}
            aria-label="Next project"
          >
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
      </footer>
    </section>
  );
}
