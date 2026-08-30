"use client";

import { motion } from "motion/react";
import { Database, Eye, Shield, FileText, Globe, Heart } from "lucide-react";

export function Features5() {
  const features = [
    {
      icon: Database,
      title: "Data residency & retention",
      description:
        "Control where data is stored and how long it's retained to align with policies, regulatory requirements, and regional standards.",
    },
    {
      icon: Eye,
      title: "Granular access controls",
      description:
        "Define precise access rules across teams and roles to reduce risk, protect sensitive data and support internal governance.",
    },
    {
      icon: Shield,
      title: "SOC 2 Type II certified",
      description:
        "Our report confirms that our security policies and controls consistently comply with the highest industry standards.",
    },
    {
      icon: FileText,
      title: "PII redaction & audit logs",
      description:
        "Remove sensitive customer data and retain a full record of user actions to meet privacy, compliance, and governance obligations.",
    },
    {
      icon: Globe,
      title: "ISO/IEC 42001:2023",
      description:
        "Dovetail is certified for the first global AI management standard, demonstrating our commitment to secure and ethical practices.",
    },
    {
      icon: Heart,
      title: "HIPAA",
      description:
        "Dovetail's HIPAA certification demonstrates our commitment to protecting the privacy and security of sensitive health information.",
    },
  ];

  return (
    <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950 relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229, 229, 229, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229, 229, 229, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 100% 100% at 100% 0%, #000 20%, transparent 80%)
          `,
          WebkitMaskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 100% 100% at 100% 0%, #000 20%, transparent 80%)
          `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      <div
        className="absolute inset-0 z-0 opacity-0 dark:opacity-100"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(64, 64, 64, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(64, 64, 64, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 100% 100% at 100% 0%, #000 20%, transparent 80%)
          `,
          WebkitMaskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 100% 100% at 100% 0%, #000 20%, transparent 80%)
          `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-3xl tracking-tight sm:text-4xl md:text-5xl lg:text-6xl font-normal text-neutral-900 dark:text-white mb-6 max-w-3xl"
          >
            Security, compliance, and control: by design
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-base tracking-tight sm:text-lg text-neutral-600 dark:text-neutral-400 mb-8"
          >
            Customer trust starts with responsible data practices
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4"
          >
            <button className="tracking-tight px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-sm sm:text-base hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors duration-200 w-full sm:w-auto">
              Contact sales
            </button>
            <button className="tracking-tight px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium text-sm sm:text-base border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200 w-full sm:w-auto">
              Request a demo
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`p-8 md:p-10 bg-white dark:bg-neutral-950
                  ${index !== 5 ? "border-b border-neutral-200 dark:border-neutral-800" : ""}
                  ${index % 2 === 0 && index !== 4 ? "md:border-r" : ""}
                  ${(index + 1) % 3 !== 0 ? "lg:border-r" : ""}
                  ${index < 3 ? "lg:border-b" : ""}
                `}
              >
                <div className="flex justify-center mb-8">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                    <Icon
                      className="w-full h-full text-neutral-900 dark:text-white"
                      strokeWidth={0.5}
                    />
                  </div>
                </div>

                <h3 className="text-lg tracking-tight sm:text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                  {feature.title}
                </h3>

                <p className="text-sm tracking-tight sm:text-base text-neutral-600 dark:text-neutral-400 leading-normal">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features5;
