import { Link } from "react-router-dom";
import {
  FaLinkedin,
  FaGithub,
  FaSearch,
  FaExclamationTriangle,
  FaBrain,
  FaHandshake,
} from "react-icons/fa";

const Footers = () => {
  const year = new Date().getFullYear();

  const quickLinks = [
    { label: "Found Items", to: "/foundItems", icon: <FaSearch /> },
    { label: "Lost Items", to: "/lostItems", icon: <FaExclamationTriangle /> },
    { label: "AI Search", to: "/ai-search", icon: <FaBrain /> },
    { label: "How It Works", to: "/#howItWorks", icon: <FaHandshake /> },
  ];

  const actions = [
    { label: "Report a Lost Item", to: "/reportlostItem" },
    { label: "Report a Found Item", to: "/reportFoundItem" },
    { label: "Login", to: "/login" },
    { label: "Create an Account", to: "/register" },
  ];

  return (
    <footer className="relative bottom-0 pt-16 pb-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black border-t border-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:justify-between">
          <div className="mb-8 md:mb-0">
            <Link to="/" className="flex items-center">
              <div className="w-9 h-9 mr-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FaSearch className="text-white text-sm" />
              </div>
              <span className="self-center text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Lost & Found
              </span>
            </Link>
            <p className="mt-4 text-gray-300 max-w-md">
              Connecting people with their lost belongings, one item at a time.
              <br />
              We are here to help you find what you have lost.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-12 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">
                Quick Links
              </h2>
              <ul className="text-gray-400 space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="hover:text-white transition-colors duration-200 inline-flex items-center gap-2"
                    >
                      <span className="text-cyan-500 text-xs">{link.icon}</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">
                Get Involved
              </h2>
              <ul className="text-gray-400 space-y-3">
                {actions.map((action) => (
                  <li key={action.label}>
                    <Link
                      to={action.to}
                      className="hover:text-white transition-colors duration-200"
                    >
                      {action.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">
                About The Project
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                A full-stack demo built with React, Node.js, Prisma &amp;
                PostgreSQL. Report items, file claims, and let AI-powered search
                find what matters.
              </p>
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-700" />

        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-400 sm:text-center">
            © {year} Lost & Found Management. All Rights Reserved.
          </span>
          <div className="flex mt-4 space-x-6 sm:justify-center sm:mt-0">
            <a
              href="https://github.com/alamin147"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
              aria-label="GitHub profile"
            >
              <FaGithub size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/alamin-developer/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
              aria-label="LinkedIn profile"
            >
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footers;