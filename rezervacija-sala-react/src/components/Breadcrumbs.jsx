import React from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { FiHome, FiChevronRight } from "react-icons/fi";
import "./breadcrumbs.css";

/**
 * <Breadcrumbs />
 * - automatski parsira current URL i crta mrvice
 * - labelMap: mapiranje segmenta -> labela
 * - hideOnPaths: na kojim putanjama da sakrijemo breadcrumb
 * - resolveLabel: opciono, callback za dinamičke labele (npr. /sale/123 -> "Sala #123")
 */
export default function Breadcrumbs({
  labelMap = {},
  hideOnPaths = ["/"],
  resolveLabel,
}) {
  const { pathname } = useLocation();

  if (hideOnPaths.includes(pathname)) return null;

  const segments = pathname.split("/").filter(Boolean); // npr. ["sale","nova"]
  const paths = segments.map((_, i) => "/" + segments.slice(0, i + 1).join("/"));

  const pretty = (seg) =>
    labelMap[seg] ||
    seg
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <nav className="bc-wrap" aria-label="Breadcrumb">
      <ol className="bc">
        <li className="bc__item">
          <Link to="/" className="bc__link">
            <FiHome aria-hidden="true" />
            <span className="sr-only">Početna</span>
          </Link>
        </li>

        {segments.map((seg, idx) => {
          const href = paths[idx];
          const isLast = idx === segments.length - 1;
          const label = resolveLabel
            ? resolveLabel({ segment: seg, index: idx, href, segments, pathname }) || pretty(seg)
            : pretty(seg);

          return (
            <li key={href} className="bc__item">
              <FiChevronRight className="bc__sep" aria-hidden="true" />
              {isLast ? (
                <span className="bc__current" aria-current="page">{label}</span>
              ) : (
                <NavLink to={href} className="bc__link">
                  {label}
                </NavLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
