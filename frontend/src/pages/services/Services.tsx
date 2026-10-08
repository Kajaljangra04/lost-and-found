import { BiSupport } from "react-icons/bi";
import { TbReport } from "react-icons/tb";
import { FaSearch, FaLayerGroup } from "react-icons/fa";
import { IoLocationSharp, IoShieldCheckmark } from "react-icons/io5";
import { FaGift } from "react-icons/fa6";
import { useGetServicesQuery } from "../../redux/api/api";
import { Spinner } from "flowbite-react";
import React from "react";

interface Service {
  id?: string;
  title: string;
  description: string;
  icon?: string;
}

// Icon mapping for fallback services
const getServiceIcon = (title: string): React.ReactElement => {
  const iconMapping: { [key: string]: React.ReactElement } = {
    "Lost Item Reporting": <TbReport size="26" />,
    "Search for Lost Items": <FaSearch size="24" />,
    "Location-Based Services": <IoLocationSharp size="26" />,
    "Help Desk Support": <BiSupport size="26" />,
    "Data Encryption and Privacy": <IoShieldCheckmark size="26" />,
    "Item Claiming": <FaGift size="23" />,
  };

  return iconMapping[title] || <FaSearch size="24" />;
};

const defaultServices: Service[] = [
  {
    title: "Lost Item Reporting",
    description:
      "Easily report lost items by providing detailed descriptions, locations, and images, helping to track down your missing belongings.",
  },
  {
    title: "Search for Lost Items",
    description:
      "Quickly search the database for your lost items using keywords, categories, or locations to find matches.",
  },
  {
    title: "Location-Based Services",
    description:
      "View and track lost and found items within specific geographic areas, focusing your search on the most relevant locations.",
  },
  {
    title: "Help Desk Support",
    description:
      "Get assistance with your lost or found reports, claims, or other queries through our dedicated help desk service.",
  },
  {
    title: "Data Encryption and Privacy",
    description:
      "Protect your information with industry-standard encryption, ensuring your personal data remains secure and confidential.",
  },
  {
    title: "Item Claiming",
    description:
      "Verify and claim found items securely through a streamlined process, ensuring that only the rightful owner can retrieve the item.",
  },
];

const Services = () => {
  const { data: servicesData, isLoading } = useGetServicesQuery({});

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
  const services: Service[] = servicesData?.data || defaultServices;
  return (
    <section id="features" className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-head">
          <span className="eyebrow">
            <FaLayerGroup />
            What we do
          </span>
          <h2 className="section-title">Our Services</h2>
          <p className="section-sub">
            Comprehensive lost and found management solutions designed to help
            you recover what matters most
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service: Service, index: number) => (
            <div
              key={service.id || index}
              className="card card-hover p-6"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">
                {getServiceIcon(service.title)}
              </div>
              <h3 className="mb-2 text-lg font-bold text-ink">
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-dim">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
