"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, LogOut } from "lucide-react";

// Types
interface User {
  username: string;
}

interface TypingAnimationProps {
  children: string;
  speed?: number;
  delay?: number;
  pauseTime?: number;
}

interface ParticlesProps {
  particleColors?: string[];
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleBaseSize?: number;
  moveParticlesOnHover?: boolean;
  alphaParticles?: boolean;
  disableRotation?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
}

// Custom Typing Animation Component
const TypingAnimation: React.FC<TypingAnimationProps> = ({
  children,
  speed = 150,
  delay = 0,
  pauseTime = 2000,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const text = children || "";

  useEffect(() => {
    let currentIndex = 0;
    let typingTimer: NodeJS.Timeout;
    const cursorTimer: NodeJS.Timeout = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    let isTyping = true;

    const typeText = (): void => {
      if (isTyping) {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
          typingTimer = setTimeout(typeText, speed);
        } else {
          // Pause at full text, then start erasing
          typingTimer = setTimeout(() => {
            isTyping = false;
            eraseText();
          }, pauseTime);
        }
      }
    };

    const eraseText = (): void => {
      if (!isTyping) {
        if (currentIndex > 0) {
          currentIndex--;
          setDisplayText(text.slice(0, currentIndex));
          typingTimer = setTimeout(eraseText, speed / 2); // Erase faster
        } else {
          // Start typing again
          isTyping = true;
          typingTimer = setTimeout(typeText, speed);
        }
      }
    };

    const delayTimer = setTimeout(typeText, delay);

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(typingTimer);
      clearInterval(cursorTimer);
    };
  }, [text, speed, delay, pauseTime]);

  return (
    <span>
      {displayText}
      {showCursor && <span className="animate-pulse">|</span>}
    </span>
  );
};

// Particles Component
const Particles: React.FC<ParticlesProps> = ({
  particleColors = ["#EDC63A", "#EDC63A"],
  particleCount = 200,
  particleSpread = 8,
  speed = 0.8,
  moveParticlesOnHover = true,
  alphaParticles = false,
  disableRotation = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles
    const initParticles = (): void => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: Math.random() * 3 + 1,
          color:
            particleColors[Math.floor(Math.random() * particleColors.length)],
          alpha: alphaParticles ? Math.random() * 0.5 + 0.5 : 1,
          rotation: disableRotation ? 0 : Math.random() * Math.PI * 2,
          rotationSpeed: disableRotation ? 0 : (Math.random() - 0.5) * 0.02,
        });
      }
    };

    initParticles();

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent): void => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    if (moveParticlesOnHover) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // Animation loop
    const animate = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Mouse interaction
        if (moveParticlesOnHover) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.vx += dx * force * 0.001;
            particle.vy += dy * force * 0.001;
          }
        }

        // Boundary checking
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Update rotation
        if (!disableRotation) {
          particle.rotation += particle.rotationSpeed;
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw connections between nearby particles
        for (let j = index + 1; j < particlesRef.current.length; j++) {
          const other = particlesRef.current[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < particleSpread * 10) {
            ctx.save();
            ctx.globalAlpha = (1 - distance / (particleSpread * 10)) * 0.1;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (moveParticlesOnHover) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    particleColors,
    particleCount,
    particleSpread,
    speed,
    moveParticlesOnHover,
    alphaParticles,
    disableRotation,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
      }}
    />
  );
};

const LandingPage: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const ringsRef = useRef<THREE.Group | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Mock auth functions for demo
  const signIn = (): void => setUser({ username: "DemoUser" });
  const signOut = (): void => setUser(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mountElement = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    mountElement.appendChild(renderer.domElement);

    // Create main globe group - SIMPLIFIED VERSION
    const globeGroup = new THREE.Group();
    globeRef.current = globeGroup;

    // Simplified gold materials
    const goldWireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.6,
      wireframe: true,
    });

    // Create ONLY the wireframe globe sphere - much more performant
    const globeGeometry = new THREE.SphereGeometry(1.5, 20, 16); // Reduced segments for better performance
    const globeWireframe = new THREE.Mesh(globeGeometry, goldWireframeMaterial);
    globeGroup.add(globeWireframe);

    // Create floating golden rings around the globe
    const ringsGroup = new THREE.Group();
    ringsRef.current = ringsGroup;

    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(
        2 + i * 0.5,
        2.1 + i * 0.5,
        64
      );
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffcb74,
        transparent: true,
        opacity: 0.4 - i * 0.1,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);

      // Position rings at different angles
      if (i === 0) {
        ring.rotation.x = Math.PI / 2;
      } else if (i === 1) {
        ring.rotation.y = Math.PI / 3;
        ring.rotation.x = Math.PI / 4;
      } else {
        ring.rotation.z = Math.PI / 3;
        ring.rotation.x = Math.PI / 6;
      }

      ringsGroup.add(ring);
    }

    // Create golden particles orbiting the globe
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 300;

    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const radius = 3 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      posArray[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      posArray[i * 3 + 1] = radius * Math.cos(phi);
      posArray[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0xffcb74,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    particlesRef.current = particlesMesh;

    // Position everything further to the right to avoid overlap with text
    globeGroup.position.set(5, 0, -2);
    ringsGroup.position.set(5, 0, -2);
    particlesMesh.position.set(5, 0, -2);

    scene.add(globeGroup);
    scene.add(ringsGroup);
    scene.add(particlesMesh);

    camera.position.z = 5;

    // Animation
    const animate = (): void => {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      if (globeRef.current) {
        globeRef.current.rotation.y += 0.005;
        globeRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
        globeRef.current.position.y = Math.sin(time * 0.5) * 0.1;
      }

      if (ringsRef.current) {
        ringsRef.current.children.forEach((ring, index) => {
          ring.rotation.z += 0.01 * (index + 1);
          ring.rotation.y += 0.005 * (index + 1);
        });
      }

      if (particlesRef.current) {
        const positions =
          particlesRef.current.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
          // Orbital motion around the globe
          const x = positions[i];
          const y = positions[i + 1];
          const z = positions[i + 2];

          const radius = Math.sqrt(x * x + y * y + z * z);
          const theta = Math.atan2(z, x) + 0.01;
          const phi = Math.acos(y / radius);

          positions[i] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i + 1] =
            radius * Math.cos(phi) + Math.sin(time + i * 0.01) * 0.1;
          positions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
        }

        // Update geometry
        const geometry = particlesRef.current.geometry;
        if (geometry && geometry.attributes && geometry.attributes.position) {
          (geometry.attributes.position as THREE.BufferAttribute).needsUpdate =
            true;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = (): void => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountElement && renderer.domElement) {
        mountElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background Particles Layer */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={["#EDC63A", "#EDC63A"]}
          particleCount={400}
          particleSpread={10}
          speed={0.6}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Three.js Globe Layer */}
      <div ref={mountRef} className="absolute inset-0 z-10" />

      {/* Content Overlay */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="p-6 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="text-white">StartX</span>
          </div>

          {/* Auth Integration */}
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ffcb74] to-[#ffd700] flex items-center justify-center">
                  <span className="text-black font-bold text-sm">
                    {user.username.charAt(0)}
                  </span>
                </div>
                <span className="text-[#ffcb74] text-sm">
                  Welcome, {user.username}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={signIn}
                className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
              >
                Alternative Auth
              </Button>
            </div>
          )}
        </nav>

        {/* Hero Section - Left Aligned */}
        <main className="flex-1 flex items-center px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="mb-8">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm mb-8"
                style={{
                  borderColor: "rgba(255, 203, 116, 0.3)",
                  backgroundColor: "rgba(255, 203, 116, 0.1)",
                  color: "#ffcb74",
                }}
              >
                <Sparkles className="w-4 h-4" />
                AI-Powered Startup Ecosystem
              </div>

              <h1 className="text-6xl lg:text-8xl font-bold mb-8 leading-tight">
                Connect.{" "}
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #ffcb74, #ffd700)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  <TypingAnimation delay={1000} speed={200}>
                    Build.
                  </TypingAnimation>
                </span>{" "}
                <br />
                Scale.
              </h1>

              <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-2xl leading-relaxed">
                The ultimate platform where{" "}
                <span className="font-semibold" style={{ color: "#ffcb74" }}>
                  founders
                </span>{" "}
                validate ideas,{" "}
                <span className="font-semibold" style={{ color: "#ffcb74" }}>
                  job seekers
                </span>{" "}
                find perfect roles, and{" "}
                <span className="font-semibold" style={{ color: "#ffcb74" }}>
                  investors
                </span>{" "}
                discover the next unicorn—all powered by cutting-edge AI.
              </p>
            </div>

            {/* Key Features List */}
            <div className="mb-12 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#ffcb74" }}
                ></div>
                <span className="text-lg text-gray-300">
                  AI-powered idea validation and market analysis
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#ffcb74" }}
                ></div>
                <span className="text-lg text-gray-300">
                  Smart co-founder and investor matching
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#ffcb74" }}
                ></div>
                <span className="text-lg text-gray-300">
                  Interactive pitch deck generation
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#ffcb74" }}
                ></div>
                <span className="text-lg text-gray-300">
                  Personalized interview simulations
                </span>
              </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-6">
              {user ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-10 py-4 text-lg bg-transparent border-2 border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
                  >
                    Complete Profile
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={signIn}
                    className="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-10 py-4 text-lg bg-transparent border-2 border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
                  >
                    Try Prototype
                  </Button>
                </div>
              )}

              <p className="text-gray-400 text-sm">
                {user ? (
                  <>Welcome back! Continue building your startup journey.</>
                ) : (
                  <>
                    Join <span style={{ color: "#ffcb74" }}>10,000+</span>{" "}
                    founders, job seekers, and investors already on the platform
                  </>
                )}
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-left text-gray-500 text-sm">
          <p>&copy; 2025 StartX. Powered by AI. Built for the future.</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
