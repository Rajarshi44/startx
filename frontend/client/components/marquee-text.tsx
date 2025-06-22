"use client"

/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { GoArrowLeft, GoArrowRight } from "react-icons/go"

const CARD_SIZE_LG = 365
const CARD_SIZE_SM = 290

const BORDER_SIZE = 2
const CORNER_CLIP = 50
const CORNER_LINE_LEN = Math.sqrt(CORNER_CLIP * CORNER_CLIP + CORNER_CLIP * CORNER_CLIP)

const ROTATE_DEG = 2.5

const STAGGER = 15
const CENTER_STAGGER = -65

const SECTION_HEIGHT = 600

export const StaggerTestimonials = () => {
  const [cardSize, setCardSize] = useState(CARD_SIZE_LG)

  const [testimonials, setTestimonials] = useState(TESTIMONIAL_DATA)

  const handleMove = (position: number) => {
    const copy = [...testimonials]

    if (position > 0) {
      for (let i = position; i > 0; i--) {
        const firstEl = copy.shift()

        if (!firstEl) return

        copy.push({ ...firstEl, tempId: Math.random() })
      }
    } else {
      for (let i = position; i < 0; i++) {
        const lastEl = copy.pop()

        if (!lastEl) return

        copy.unshift({ ...lastEl, tempId: Math.random() })
      }
    }

    setTestimonials(copy)
  }

  useEffect(() => {
    const { matches } = window.matchMedia("(min-width: 640px)")

    if (matches) {
      setCardSize(CARD_SIZE_LG)
    } else {
      setCardSize(CARD_SIZE_SM)
    }

    const handleSetCardSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)")

      if (matches) {
        setCardSize(CARD_SIZE_LG)
      } else {
        setCardSize(CARD_SIZE_SM)
      }
    }

    window.addEventListener("resize", handleSetCardSize)

    return () => window.removeEventListener("resize", handleSetCardSize)
  }, [])

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: SECTION_HEIGHT,
        background: "linear-gradient(135deg, #0C0C0C 0%, #1F2A3C 100%)",
      }}
    >
      {testimonials.map((t, idx) => {
        let position = 0

        if (testimonials.length % 2) {
          position = idx - (testimonials.length + 1) / 2
        } else {
          position = idx - testimonials.length / 2
        }

        return (
          <TestimonialCard
            key={t.tempId}
            testimonial={t}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        )
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-8">
        <button
          onClick={() => handleMove(-1)}
          className="grid h-14 w-14 place-content-center text-3xl transition-colors rounded-xl border border-[#B0B8C1]/20 bg-[#374151] text-[#D1D5DB] hover:bg-[#637089] hover:text-white hover:border-[#637089]"
        >
          <GoArrowLeft />
        </button>
        <button
          onClick={() => handleMove(1)}
          className="grid h-14 w-14 place-content-center text-3xl transition-colors rounded-xl border border-[#B0B8C1]/20 bg-[#374151] text-[#D1D5DB] hover:bg-[#637089] hover:text-white hover:border-[#637089]"
        >
          <GoArrowRight />
        </button>
      </div>
    </div>
  )
}

interface TestimonialProps {
  position: number
  testimonial: TestimonialType
  handleMove: Function
  cardSize: number
}

const TestimonialCard = ({ position, testimonial, handleMove, cardSize }: TestimonialProps) => {
  const isActive = position === 0

  return (
    <motion.div
      initial={false}
      onClick={() => handleMove(position)}
      className={`
      absolute left-1/2 top-1/2 cursor-pointer p-8 transition-colors duration-500 backdrop-blur-sm ${
        isActive ? "z-10 bg-[#637089] border-[#4ADE80]" : "z-0 bg-[#1F2A3C]/60 border-[#B0B8C1]/40"
      }
      `}
      style={{
        borderWidth: BORDER_SIZE,
        clipPath: `polygon(${CORNER_CLIP}px 0%, calc(100% - ${CORNER_CLIP}px) 0%, 100% ${CORNER_CLIP}px, 100% 100%, calc(100% - ${CORNER_CLIP}px) 100%, ${CORNER_CLIP}px 100%, 0 100%, 0 0)`,
      }}
      animate={{
        width: cardSize,
        height: cardSize,
        x: `calc(-50% + ${position * (cardSize / 1.5)}px)`,
        y: `calc(-50% + ${isActive ? CENTER_STAGGER : position % 2 ? STAGGER : -STAGGER}px)`,
        rotate: isActive ? 0 : position % 2 ? ROTATE_DEG : -ROTATE_DEG,
        boxShadow: isActive ? "0px 8px 0px 4px rgba(74, 222, 128, 0.3)" : "0px 0px 0px 0px rgba(0, 0, 0, 0)",
      }}
      transition={{
        type: "spring",
        mass: 3,
        stiffness: 400,
        damping: 50,
      }}
    >
      <span
        className={`absolute block origin-top-right rotate-45 object-cover ${
          isActive ? "bg-[#4ADE80]" : "bg-[#B0B8C1]/40"
        }`}
        style={{
          right: -BORDER_SIZE,
          top: CORNER_CLIP - BORDER_SIZE,
          width: CORNER_LINE_LEN,
          height: BORDER_SIZE,
        }}
      />
      <img
        src={testimonial.imgSrc || "/placeholder.svg"}
        alt={`Testimonial image for ${testimonial.by}`}
        className="mb-4 h-14 w-12 object-cover object-top rounded-lg border-2"
        style={{
          boxShadow: isActive ? "3px 3px 0px rgba(74, 222, 128, 0.5)" : "3px 3px 0px rgba(176, 184, 193, 0.3)",
          borderColor: isActive ? "#4ADE80" : "#B0B8C1",
        }}
      />
      <h3 className={`text-base sm:text-xl font-medium leading-relaxed ${isActive ? "text-white" : "text-[#D1D5DB]"}`}>
        &quot;{testimonial.testimonial}&quot;
      </h3>
      <p
        className={`absolute bottom-8 left-8 right-8 mt-2 text-sm italic font-medium ${
          isActive ? "text-[#4ADE80]" : "text-[#B0B8C1]"
        }`}
      >
        - {testimonial.by}
      </p>
      <div
        className={`absolute top-6 right-6 px-2 py-1 rounded-full text-xs font-medium ${
          testimonial.category === "Entrepreneur"
            ? "bg-[#4ADE80] text-black"
            : testimonial.category === "Investor"
              ? "bg-[#B0B8C1] text-black"
              : "bg-[#637089] text-white"
        }`}
      >
        {testimonial.category}
      </div>
    </motion.div>
  )
}

type TestimonialType = {
  tempId: number
  testimonial: string
  by: string
  imgSrc: string
  category: string
}

const TESTIMONIAL_DATA: TestimonialType[] = [
  {
    tempId: 0,
    testimonial:
      "STARTX helped me validate my EdTech idea and connect with my co-founder. We raised ₹2 crores in seed funding within 6 months!",
    by: "Priya Sharma, Founder at EduTech Solutions",
    imgSrc: "https://randomuser.me/api/portraits/women/68.jpg",
    category: "Entrepreneur",
  },
  {
    tempId: 1,
    testimonial:
      "The AI-powered investor matching on STARTX is incredible. I've discovered and invested in 5 promising startups this year alone.",
    by: "Vikram Singh, Angel Investor",
    imgSrc: "https://randomuser.me/api/portraits/men/65.jpg",
    category: "Investor",
  },
  {
    tempId: 2,
    testimonial:
      "Found my dream job as a Product Manager at a unicorn startup through STARTX's smart matching. The platform understood my skills perfectly!",
    by: "Arjun Patel, Product Manager",
    imgSrc: "https://randomuser.me/api/portraits/men/23.jpg",
    category: "Job Seeker",
  },
  {
    tempId: 3,
    testimonial:
      "From idea to ₹50L revenue in 18 months! STARTX's mentor network and validation tools were absolute game-changers for our FinTech startup.",
    by: "Rohit Gupta, CEO at PayFlow",
    imgSrc: "https://randomuser.me/api/portraits/men/31.jpg",
    category: "Entrepreneur",
  },
  {
    tempId: 4,
    testimonial:
      "STARTX's curated deal flow is unmatched. I've invested ₹1.5 crores across 3 startups with incredible due diligence support.",
    by: "Kavya Reddy, Venture Partner",
    imgSrc: "https://randomuser.me/api/portraits/women/44.jpg",
    category: "Investor",
  },
  {
    tempId: 5,
    testimonial:
      "The co-founder matching algorithm is pure magic! Built my HealthTech team of 12 amazing people through STARTX connections.",
    by: "Ananya Iyer, Founder at MedConnect",
    imgSrc: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=256&h=256&facepad=2",
    category: "Entrepreneur",
  },
  {
    tempId: 6,
    testimonial:
      "Transitioned from consulting to startup life seamlessly. STARTX's AI interview prep and job matching are incredibly sophisticated.",
    by: "Karan Mehta, Growth Lead",
    imgSrc: "https://randomuser.me/api/portraits/men/77.jpg",
    category: "Job Seeker",
  },
  {
    tempId: 7,
    testimonial:
      "STARTX's startup events and networking sessions accelerated our growth 10x. The community is absolutely world-class.",
    by: "Sneha Joshi, Founder at GreenTech",
    imgSrc: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=256&h=256&facepad=2",
    category: "Entrepreneur",
  },
  {
    tempId: 8,
    testimonial:
      "The platform's analytics and market insights helped me make informed investment decisions. ROI has been phenomenal across my portfolio.",
    by: "Rajesh Kumar, Investment Manager",
    imgSrc: "https://randomuser.me/api/portraits/men/12.jpg",
    category: "Investor",
  },
  {
    tempId: 9,
    testimonial:
      "STARTX connected me with my current role at a Series B startup. The personalized job recommendations were spot-on!",
    by: "Meera Nair, Engineering Manager",
    imgSrc: "https://randomuser.me/api/portraits/women/12.jpg",
    category: "Job Seeker",
  },
  {
    tempId: 10,
    testimonial:
      "The idea validation tools saved us months of development time. We pivoted early and built exactly what the market needed.",
    by: "Amit Sharma, CTO at DataFlow",
    imgSrc: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=256&h=256&facepad=2",
    category: "Entrepreneur",
  },
  {
    tempId: 11,
    testimonial:
      "STARTX's investor network is incredibly well-curated. Connected with the perfect VC for our Series A within 2 weeks of joining.",
    by: "Deepika Patel, Founder at AI Labs",
    imgSrc: "https://randomuser.me/api/portraits/women/50.jpg",
    category: "Entrepreneur",
  },
]
