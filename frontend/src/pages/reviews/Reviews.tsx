import { FaUser, FaQuoteLeft } from "react-icons/fa";
import StarRatings from "react-star-ratings";
import { useGetTestimonialsQuery } from "../../redux/api/api";
import { Spinner } from "flowbite-react";

interface Testimonial {
  id?: string;
  rating: number;
  feedback: string;
  name: string;
  position: string;
}

// Fallback static data if no data from server
const fallbackTestimonials: Testimonial[] = [
  {
    rating: 5,
    feedback:
      "The Lost and Found system has streamlined our process of returning lost items to their owners. It's incredibly user-friendly and efficient.",
    name: "Michael T.",
    position: "Operations Manager",
  },
  {
    rating: 4,
    feedback:
      "I was able to quickly report my lost item, and the system helped me track its status until it was returned. Excellent service!",
    name: "Sarah L.",
    position: "Frequent Traveler",
  },
  {
    rating: 3,
    feedback:
      "This system has drastically reduced the time and effort needed to manage lost items. It's a game-changer for our department.",
    name: "David R.",
    position: "Customer Service Lead",
  },
];

const Reviews = () => {
  const { data: testimonialsData, isLoading } = useGetTestimonialsQuery({});

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24">
        <div className="flex items-center justify-center">
          <Spinner size="xl" className="text-accent" />
        </div>
      </section>
    );
  }

  // Use server data if available, otherwise fallback to static data
  const testimonials: Testimonial[] =
    testimonialsData?.data || fallbackTestimonials;
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-head">
          <span className="eyebrow">
            <FaQuoteLeft />
            Testimonials
          </span>
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-sub">
            Hear from the people who trust us with their lost and found items
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials?.map((testimonial: Testimonial, i: number) => {
            return (
              <figure
                key={`${testimonial.id || testimonial.name}-${i}`}
                className="card card-hover flex flex-col items-center gap-5 p-6 text-center"
              >
                <div className="grid h-14 w-14 place-items-center rounded-full bg-surface-3 text-ink-mute">
                  <FaUser size="20" />
                </div>

                <figcaption>
                  <p className="text-base font-semibold text-ink">
                    {testimonial.name}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-mute">
                    {testimonial.position}
                  </p>
                </figcaption>

                <div className="flex justify-center">
                  <StarRatings
                    rating={testimonial.rating}
                    starDimension="20px"
                    starSpacing="2px"
                    starRatedColor="#38bdf8"
                  />
                </div>

                <blockquote className="text-sm leading-relaxed text-ink-dim">
                  "{testimonial.feedback}"
                </blockquote>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default Reviews;
