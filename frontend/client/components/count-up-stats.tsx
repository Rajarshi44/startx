"use client"

import { useEffect, useRef } from "react"
import { animate, useInView } from "framer-motion"

export const CountUpStats = () => {
  return (
    <div
      className="w-full relative py-20 md:py-24"
      style={{
        background: "linear-gradient(135deg, #0C0C0C 0%, #1F2A3C 100%)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#637089] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#4ADE80] rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 mx-auto max-w-5xl px-4">
        <h2 className="mb-8 text-center text-base sm:text-lg md:mb-16" style={{ color: "#D1D5DB" }}>
          EMPOWERING INDIA&apos;S STARTUP ECOSYSTEM WITH
          <span style={{ color: "#4ADE80" }}> REAL RESULTS</span>
        </h2>

        <div className="flex flex-col items-center justify-center sm:flex-row gap-8 sm:gap-0">
          <Stat
            num={2500}
            suffix="+"
            subheading="Startups launched and scaled through our platform"
            label="Startups Launched"
          />
          <div className="h-[1px] w-12 sm:h-12 sm:w-[1px]" style={{ backgroundColor: "#B0B8C1" }} />

          <Stat
            num={850}
            suffix=" Cr+"
            subheading="Total funding raised by startups in our network"
            label="Funding Raised"
          />
          <div className="h-[1px] w-12 sm:h-12 sm:w-[1px]" style={{ backgroundColor: "#B0B8C1" }} />

          <Stat
            num={12.5}
            decimals={1}
            suffix="K+"
            subheading="Successful job placements and co-founder matches"
            label="Connections Made"
          />
        </div>

        {/* Additional stats row */}
        <div className="flex flex-col items-center justify-center sm:flex-row gap-8 sm:gap-0 mt-16">
          <Stat
            num={89}
            suffix="%"
            subheading="Success rate for startups that complete our validation program"
            label="Success Rate"
          />
          <div className="h-[1px] w-12 sm:h-12 sm:w-[1px]" style={{ backgroundColor: "#B0B8C1" }} />

          <Stat
            num={45}
            suffix="+"
            subheading="Cities across India where our community is active"
            label="Cities Covered"
          />
          <div className="h-[1px] w-12 sm:h-12 sm:w-[1px]" style={{ backgroundColor: "#B0B8C1" }} />

          <Stat
            num={180}
            suffix="+"
            subheading="Verified investors actively seeking opportunities"
            label="Active Investors"
          />
        </div>
      </div>
    </div>
  )
}

interface StatProps {
  num: number
  suffix: string
  decimals?: number
  subheading: string
  label: string
}

const Stat = ({ num, suffix, decimals = 0, subheading, label }: StatProps) => {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref)

  useEffect(() => {
    if (!isInView) return

    animate(0, num, {
      duration: 2.5,
      onUpdate(value) {
        if (!ref.current) return

        ref.current.textContent = value.toFixed(decimals)
      },
    })
  }, [num, decimals, isInView])

  return (
    <div className="flex w-80 flex-col items-center py-8 sm:py-0">
      <div className="mb-3">
        <p className="text-sm font-medium text-center" style={{ color: "#637089" }}>
          {label}
        </p>
      </div>
      <p className="mb-4 text-center text-6xl sm:text-7xl font-bold" style={{ color: "#FFFFFF" }}>
        <span ref={ref}></span>
        <span style={{ color: "#4ADE80" }}>{suffix}</span>
      </p>
      <p className="max-w-64 text-center text-sm leading-relaxed" style={{ color: "#D1D5DB" }}>
        {subheading}
      </p>
    </div>
  )
}
