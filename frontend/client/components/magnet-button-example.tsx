"use client"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useRef } from "react";
import { MdOutlineArrowUpward } from "react-icons/md";

const MagnetButtonExample = () => {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <MagnetButton />
    </div>
  );
};

const MagnetButton = () => {
  const ref = useRef<HTMLButtonElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, {
    mass: 3,
    stiffness: 400,
    damping: 50,
  });
  const ySpring = useSpring(y, {
    mass: 3,
    stiffness: 400,
    damping: 50,
  });

  const transform = useMotionTemplate`translateX(${xSpring}px) translateY(${ySpring}px)`;

  const handleMouseMove = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (!ref.current) return;

    const { height, width, left, top } = ref.current.getBoundingClientRect();

    x.set(e.clientX - (left + width / 2));
    y.set(e.clientY - (top + height / 2));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="group relative grid h-[120px] w-[120px] place-content-center rounded-full border-2 border-black bg-white transition-colors duration-700 ease-out"
    >
      <MdOutlineArrowUpward className="pointer-events-none relative z-10 rotate-45 text-7xl text-black transition-all duration-700 ease-out group-hover:rotate-90" />

      <div className="pointer-events-none absolute inset-0 z-0 scale-0 rounded-full bg-green-700 transition-transform duration-700 ease-out group-hover:scale-100" />

      <motion.svg
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
        }}
        style={{
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
        }}
        width="200"
        height="200"
        className="pointer-events-none absolute z-10"
      >
        <path
          id="circlePath"
          d="M100,100 m-100,0 a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0"
          fill="none"
        />
        <text>
          <textPath
            href="#circlePath"
            fill="white"
            className="fill-white text-xl font-light uppercase opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
          >
            Click Me to Make Magic Today! Click Me to Make Magic Today! 
          </textPath>
        </text>
      </motion.svg>
    </motion.button>
  );
};

export default MagnetButtonExample;
