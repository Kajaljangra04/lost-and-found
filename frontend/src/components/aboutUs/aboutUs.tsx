import { FaSearch, FaHandshake, FaShieldAlt, FaUsers } from "react-icons/fa";

const AboutUs = () => {
  return (
    <section id="aboutUs" className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-head">
          <span className="eyebrow">
            <FaUsers />
            Who we are
          </span>
          <h2 className="section-title">About Us</h2>
          <p className="section-sub">
            Don't let lost items remain lost. Lost and Found Management bridges
            the gap between lost and found, reuniting you with what matters
            most.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="card p-8 md:p-12">
            <p className="text-center text-lg leading-relaxed text-ink-dim md:text-xl">
              We emphasize your commitment to reuniting lost items with their
              owners and maintaining a seamless process. We operate with
              honesty, transparency, and empathy. Our commitment to doing what's
              right drives our actions. We understand the emotional impact of
              lost items. Our team treats each case with compassion and care. We
              embrace technology and creative solutions to enhance our services
              continually.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-xl text-accent">
                  <FaSearch />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-ink">
                  Search &amp; Find
                </h3>
                <p className="text-sm text-ink-mute">
                  Advanced search capabilities to help locate lost items quickly
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-ok/10 text-xl text-ok">
                  <FaHandshake />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-ink">
                  Community
                </h3>
                <p className="text-sm text-ink-mute">
                  Connecting people through our community-driven platform
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-xl text-accent">
                  <FaShieldAlt />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-ink">Secure</h3>
                <p className="text-sm text-ink-mute">
                  Safe and secure item management with privacy protection
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default AboutUs;
