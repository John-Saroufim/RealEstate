import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Target, Eye, Award, Users, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import heroImg from "@/assets/crestline-hero.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const values = [
  { icon: Award, title: "Excellence", desc: "We pursue the highest standard in every transaction, presentation, and client interaction." },
  { icon: Target, title: "Integrity", desc: "Transparency and honesty form the foundation of every relationship we build." },
  { icon: Eye, title: "Discretion", desc: "We understand the importance of privacy and handle every engagement with complete confidentiality." },
  { icon: Users, title: "Client-First", desc: "Your goals are our priority. We tailor every strategy to serve your unique vision." },
];

const milestones = [
  { year: "2009", title: "Founded in New York", desc: "RealEstate was established with a vision to redefine luxury real estate advisory." },
  { year: "2013", title: "Expanded to Florida", desc: "Opened our Palm Beach office, serving the growing demand for waterfront luxury properties." },
  { year: "2017", title: "$1 Billion in Sales", desc: "Reached a landmark milestone, solidifying our position as a premier luxury brokerage." },
  { year: "2021", title: "International Reach", desc: "Extended our advisory services to select international markets including London and Dubai." },
  { year: "2024", title: "$2.4 Billion & Growing", desc: "Continued growth driven by trusted relationships and an unwavering commitment to quality." },
];

export default function CrestlineAbout() {
  return (
    <div className="min-h-screen bg-crestline-bg text-slate-900 font-sans">
      <CrestlineNavbar />

      {/* Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Luxury property" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-crestline-bg via-crestline-bg/90 to-crestline-bg" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-crestline-gold text-sm font-semibold tracking-[0.15em] uppercase mb-4">Our Story</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              Built on Trust. Driven by <span className="text-crestline-gold">Excellence.</span>
            </h1>
            <p className="text-crestline-muted max-w-2xl mx-auto leading-relaxed text-lg">
              For over 15 years, RealEstate has been the trusted partner for discerning buyers and sellers navigating the luxury real estate market. Our commitment to exceptional service, deep market expertise, and personal integrity has earned us a reputation as one of the most respected names in premium property.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-crestline-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="border border-slate-200 p-8 sm:p-10">
              <div className="h-12 w-12 border border-crestline-gold/20 flex items-center justify-center mb-5">
                <Target className="h-5 w-5 text-crestline-gold" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
              <p className="text-crestline-muted leading-relaxed">
                To deliver a real estate experience defined by expertise, integrity, and personalized attention — connecting exceptional people with extraordinary properties.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="border border-slate-200 p-8 sm:p-10">
              <div className="h-12 w-12 border border-crestline-gold/20 flex items-center justify-center mb-5">
                <Eye className="h-5 w-5 text-crestline-gold" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
              <p className="text-crestline-muted leading-relaxed">
                To be the most trusted name in luxury real estate — known for elevating every transaction into a seamless, rewarding experience that exceeds expectations.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-crestline-gold text-sm font-semibold tracking-[0.15em] uppercase mb-4">What Guides Us</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">Our Core Values</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="border border-slate-200 p-8 hover:border-crestline-gold/20 transition-colors">
                <v.icon className="h-8 w-8 text-crestline-gold mb-5" />
                <h3 className="font-serif text-lg font-semibold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-sm text-crestline-muted leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-crestline-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-crestline-gold text-sm font-semibold tracking-[0.15em] uppercase mb-4">Our Journey</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">Key Milestones</h2>
          </motion.div>
          <div className="space-y-8">
            {milestones.map((m, i) => (
              <motion.div key={m.year} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex gap-6 items-start">
                <div className="text-crestline-gold font-serif text-lg font-bold w-16 shrink-0 pt-1">{m.year}</div>
                <div className="border-l border-crestline-gold/20 pl-6 pb-2">
                  <h3 className="font-serif text-lg font-semibold text-slate-900 mb-1">{m.title}</h3>
                  <p className="text-sm text-crestline-muted leading-relaxed">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why RealEstate */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Why RealEstate?</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Access to exclusive off-market properties",
              "Personalized advisory from seasoned professionals",
              "Deep market intelligence across premium segments",
              "End-to-end transaction management",
              "Global network of luxury real estate partners",
              "Proven track record of $2.4B+ in successful transactions",
            ].map((item, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex items-start gap-3 p-4">
                <CheckCircle2 className="h-5 w-5 text-crestline-gold shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">{item}</span>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/crestline/contact">
              <Button className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 font-semibold text-base px-10 py-3 rounded-xl h-auto">
                Get in Touch <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <CrestlineFooter />
    </div>
  );
}
