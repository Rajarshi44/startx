"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FiCheckCircle, FiXSquare } from "react-icons/fi"

export const NeuPricing = () => {
  const [selected, setSelected] = useState("annual")
  return (
    <div
      className="relative"
      style={{
        background: "linear-gradient(135deg, #0C0C0C 0%, #1F2A3C 100%)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 bg-[#637089] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-[#4ADE80] rounded-full blur-3xl"></div>
      </div>

      <section className="relative z-10 mx-auto max-w-7xl px-2 py-24 md:px-4">
        <div className="text-center mb-12">
          <h2 className="mx-auto mb-4 max-w-2xl text-center text-4xl font-bold leading-[1.15] md:text-6xl md:leading-[1.15] text-white">
            Choose Your Growth Plan
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#D1D5DB" }}>
            From validating your first idea to scaling your unicorn startup - we have the perfect plan for every stage
            of your entrepreneurial journey.
          </p>
        </div>

        <Toggle selected={selected} setSelected={setSelected} />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-12 lg:grid-cols-3 lg:gap-8">
          <PriceColumn
            title="Explorer"
            price="0"
            statement="Perfect for aspiring entrepreneurs ready to validate their first startup idea."
            items={[
              {
                children: "Idea Validation Tools",
                checked: true,
              },
              {
                children: "Basic Market Research",
                checked: true,
              },
              {
                children: "Community Access",
                checked: true,
              },
              {
                children: "AI-Powered Matching",
                checked: false,
              },
              {
                children: "Investor Network Access",
                checked: false,
              },
              {
                children: "Priority Support",
                checked: false,
              },
            ]}
          />
          <PriceColumn
            title="Founder"
            price={selected === "monthly" ? "499" : "399"}
            statement="For serious entrepreneurs building and scaling their startups with advanced tools."
            highlight
            items={[
              {
                children: "Everything in Explorer",
                checked: true,
              },
              {
                children: "AI-Powered Co-founder Matching",
                checked: true,
              },
              {
                children: "Advanced Analytics Dashboard",
                checked: true,
              },
              {
                children: "Investor Network Access",
                checked: true,
              },
              {
                children: "Mentor Network",
                checked: true,
              },
              {
                children: "Priority Support",
                checked: false,
              },
            ]}
          />
          <PriceColumn
            title="Scale"
            price={selected === "monthly" ? "999" : "799"}
            statement="For established startups and enterprises ready to accelerate growth and expansion."
            items={[
              {
                children: "Everything in Founder",
                checked: true,
              },
              {
                children: "Dedicated Account Manager",
                checked: true,
              },
              {
                children: "Custom Integration Support",
                checked: true,
              },
              {
                children: "White-label Solutions",
                checked: true,
              },
              {
                children: "Advanced Team Management",
                checked: true,
              },
              {
                children: "24/7 Priority Support",
                checked: true,
              },
            ]}
          />
        </div>

        {/* Additional info section */}
        <div className="mt-16 text-center">
          <p className="text-sm" style={{ color: "#B0B8C1" }}>
            All plans include access to our startup events, workshops, and networking sessions.{" "}
            <span style={{ color: "#4ADE80" }}>30-day money-back guarantee</span> on all paid plans.
          </p>
        </div>
      </section>
    </div>
  )
}

interface PriceColumnProps {
  highlight?: boolean
  title: string
  price: string
  statement: string
  items: Array<{ children: string; checked: boolean }>
}

const PriceColumn = ({ highlight, title, price, statement, items }: PriceColumnProps) => {
  return (
    <div
      style={{
        boxShadow: highlight ? "0px 6px 0px rgba(74, 222, 128, 0.3)" : "0px 2px 0px rgba(176, 184, 193, 0.1)",
        background: highlight
          ? "linear-gradient(135deg, rgba(99, 112, 137, 0.2) 0%, rgba(31, 42, 60, 0.4) 100%)"
          : "rgba(31, 42, 60, 0.3)",
        backdropFilter: "blur(10px)",
      }}
      className={`relative w-full rounded-2xl p-6 md:p-8 border ${
        highlight ? "border-[#637089]" : "border-[#B0B8C1]/20"
      }`}
    >
      {highlight && (
        <span
          className="absolute right-4 top-0 -translate-y-1/2 rounded-full px-3 py-1 text-sm font-medium text-black"
          style={{ backgroundColor: "#4ADE80" }}
        >
          Most Popular
        </span>
      )}

      <p className="mb-6 text-xl font-semibold text-white">{title}</p>
      <div className="mb-6 flex items-center gap-3">
        <AnimatePresence mode="popLayout">
          <motion.span
            initial={{
              y: 24,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -24,
              opacity: 0,
            }}
            key={price}
            transition={{
              duration: 0.25,
              ease: "easeInOut",
            }}
            className="block text-6xl font-bold text-white"
          >
            {price === "0" ? "Free" : `₹${price}`}
          </motion.span>
        </AnimatePresence>
        {price !== "0" && (
          <motion.div layout className="font-medium" style={{ color: "#D1D5DB" }}>
            <span className="block">/month</span>
            <span className="block text-sm" style={{ color: "#B0B8C1" }}>
              per user
            </span>
          </motion.div>
        )}
      </div>

      <p className="mb-8 text-base leading-relaxed" style={{ color: "#D1D5DB" }}>
        {statement}
      </p>

      <div className="mb-8 space-y-3">
        {items.map((i) => (
          <CheckListItem key={i.children} checked={i.checked}>
            {i.children}
          </CheckListItem>
        ))}
      </div>

      <button
        className={`w-full rounded-xl p-4 text-base font-semibold transition-all duration-300 ${
          highlight
            ? "bg-[#637089] hover:bg-[#5a6478] text-white hover:shadow-lg"
            : "bg-[#374151] hover:bg-[#4b5563] text-white"
        }`}
      >
        {price === "0" ? "Get Started Free" : "Start Your Journey"}
      </button>
    </div>
  )
}

interface ToggleProps {
  selected: string
  setSelected: (value: string) => void
}

const Toggle = ({ selected, setSelected }: ToggleProps) => {
  return (
    <div className="relative mx-auto mt-3 flex w-fit items-center rounded-full bg-[#374151] p-1">
      <button
        className="relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white"
        onClick={() => {
          setSelected("monthly")
        }}
      >
        <span className="relative z-10">Monthly</span>
      </button>
      <button
        className="relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white"
        onClick={() => {
          setSelected("annual")
        }}
      >
        <span className="relative z-10">
          Annually <span className="text-xs px-1 py-0.5 rounded-full bg-[#4ADE80] text-black ml-1">Save 20%</span>
        </span>
      </button>
      <div className={`absolute inset-1 z-0 flex ${selected === "annual" ? "justify-end" : "justify-start"}`}>
        <motion.span layout transition={{ ease: "easeInOut" }} className="h-full w-1/2 rounded-full bg-[#637089]" />
      </div>
    </div>
  )
}

interface CheckListItemProps {
  children: string
  checked: boolean
}

const CheckListItem = ({ children, checked }: CheckListItemProps) => {
  return (
    <div className="flex items-center gap-3 text-base">
      {checked ? (
        <FiCheckCircle className="text-xl flex-shrink-0" style={{ color: "#4ADE80" }} />
      ) : (
        <FiXSquare className="text-xl flex-shrink-0" style={{ color: "#B0B8C1" }} />
      )}
      <span style={{ color: checked ? "#FFFFFF" : "#B0B8C1" }}>{children}</span>
    </div>
  )
}
