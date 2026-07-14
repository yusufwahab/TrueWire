import { Link } from "react-router-dom";
import { FOOTER_LINKS, SITE_NAME } from "../../lib/constants";

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-paper/50">{heading}</p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-paper/80 hover:text-paper">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-paper/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm text-paper/60">
            {SITE_NAME} tracks how fast claims spread across Nigeria, so a correction can move as fast as a rumour.
          </p>
          <div className="flex gap-4 text-xs text-paper/50">
            <a href="#" className="hover:text-paper/80">
              X
            </a>
            <a href="#" className="hover:text-paper/80">
              Instagram
            </a>
            <a href="#" className="hover:text-paper/80">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
