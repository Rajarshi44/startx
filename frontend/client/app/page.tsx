"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export default function LandingPage() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>(null)
  const rendererRef = useRef<THREE.WebGLRenderer>(null)
  const globeRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const ringsRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // Create main globe group
    const globeGroup = new THREE.Group()
    globeRef.current = globeGroup

    // Gold materials
    const goldMaterial = new THREE.MeshBasicMaterial({
      color: 0xffcb74,
      transparent: true,
      opacity: 0.3,
    })

    const goldWireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.8,
      wireframe: true,
    })

    const goldLineMaterial = new THREE.LineBasicMaterial({
      color: 0xffcb74,
      transparent: true,
      opacity: 0.6,
    })

    // Create main globe sphere
    const globeGeometry = new THREE.SphereGeometry(1.5, 32, 16)
    const globe = new THREE.Mesh(globeGeometry, goldMaterial)
    const globeWireframe = new THREE.Mesh(globeGeometry, goldWireframeMaterial)

    globeGroup.add(globe)
    globeGroup.add(globeWireframe)

    // Create latitude lines
    for (let i = 0; i < 8; i++) {
      const lat = (i / 7 - 0.5) * Math.PI
      const radius = Math.cos(lat) * 1.5
      const y = Math.sin(lat) * 1.5

      if (radius > 0.1) {
        const latGeometry = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 32)
        const latLine = new THREE.Mesh(latGeometry, goldLineMaterial)
        latLine.position.y = y
        latLine.rotation.x = Math.PI / 2
        globeGroup.add(latLine)
      }
    }

    // Create longitude lines
    for (let i = 0; i < 12; i++) {
      const points = []
      for (let j = 0; j <= 32; j++) {
        const phi = (j / 32) * Math.PI
        const theta = (i / 12) * Math.PI * 2
        const x = 1.5 * Math.sin(phi) * Math.cos(theta)
        const y = 1.5 * Math.cos(phi)
        const z = 1.5 * Math.sin(phi) * Math.sin(theta)
        points.push(new THREE.Vector3(x, y, z))
      }
      const longGeometry = new THREE.BufferGeometry().setFromPoints(points)
      const longLine = new THREE.Line(longGeometry, goldLineMaterial)
      globeGroup.add(longLine)
    }

    // Create floating golden rings around the globe
    const ringsGroup = new THREE.Group()
    ringsRef.current = ringsGroup

    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(2 + i * 0.5, 2.1 + i * 0.5, 64)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffcb74,
        transparent: true,
        opacity: 0.4 - i * 0.1,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)

      // Position rings at different angles
      if (i === 0) {
        ring.rotation.x = Math.PI / 2
      } else if (i === 1) {
        ring.rotation.y = Math.PI / 3
        ring.rotation.x = Math.PI / 4
      } else {
        ring.rotation.z = Math.PI / 3
        ring.rotation.x = Math.PI / 6
      }

      ringsGroup.add(ring)
    }

    // Create golden particles orbiting the globe
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 300

    const posArray = new Float32Array(particlesCount * 3)
    const velocityArray = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount; i++) {
      const radius = 3 + Math.random() * 2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      posArray[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      posArray[i * 3 + 1] = radius * Math.cos(phi)
      posArray[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

      velocityArray[i * 3] = (Math.random() - 0.5) * 0.02
      velocityArray[i * 3 + 1] = (Math.random() - 0.5) * 0.02
      velocityArray[i * 3 + 2] = (Math.random() - 0.5) * 0.02
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3))
    particlesGeometry.setAttribute("velocity", new THREE.BufferAttribute(velocityArray, 3))

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0xffcb74,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    })

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    particlesRef.current = particlesMesh

    // Position everything on the right side
    globeGroup.position.set(3, 0, -2)
    ringsGroup.position.set(3, 0, -2)
    particlesMesh.position.set(3, 0, -2)

    scene.add(globeGroup)
    scene.add(ringsGroup)
    scene.add(particlesMesh)

    camera.position.z = 5

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)

      const time = Date.now() * 0.001

      if (globeRef.current) {
        globeRef.current.rotation.y += 0.005
        globeRef.current.rotation.x = Math.sin(time * 0.3) * 0.1
        globeRef.current.position.y = Math.sin(time * 0.5) * 0.1
      }

      if (ringsRef.current) {
        ringsRef.current.children.forEach((ring: { rotation: { z: number; y: number } }, index: number) => {
          ring.rotation.z += 0.01 * (index + 1)
          ring.rotation.y += 0.005 * (index + 1)
        })
      }

      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
        const velocities = particlesRef.current.geometry.attributes.velocity.array as Float32Array

        for (let i = 0; i < positions.length; i += 3) {
          // Orbital motion around the globe
          const x = positions[i]
          const y = positions[i + 1]
          const z = positions[i + 2]

          const radius = Math.sqrt(x * x + y * y + z * z)
          const theta = Math.atan2(z, x) + 0.01
          const phi = Math.acos(y / radius)

          positions[i] = radius * Math.sin(phi) * Math.cos(theta)
          positions[i + 1] = radius * Math.cos(phi) + Math.sin(time + i * 0.01) * 0.1
          positions[i + 2] = radius * Math.sin(phi) * Math.sin(theta)
        }

        particlesRef.current.geometry.attributes.position.needsUpdate = true
      }

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Three.js Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="p-6 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="text-white">Startup</span>
            <span style={{ color: "#ffcb74" }}>Hub</span>
          </div>
          <Button
            variant="outline"
            className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
          >
            Sign In
          </Button>
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
                    backgroundImage: "linear-gradient(to right, #ffcb74, #ffd700)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Build.
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
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#ffcb74" }}></div>
                <span className="text-lg text-gray-300">AI-powered idea validation and market analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#ffcb74" }}></div>
                <span className="text-lg text-gray-300">Smart co-founder and investor matching</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#ffcb74" }}></div>
                <span className="text-lg text-gray-300">Interactive pitch deck generation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#ffcb74" }}></div>
                <span className="text-lg text-gray-300">Personalized interview simulations</span>
              </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Join Waitlist
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

              <p className="text-gray-400 text-sm">
                Join <span style={{ color: "#ffcb74" }}>10,000+</span> founders, job seekers, and investors already on
                the platform
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-left text-gray-500 text-sm">
          <p>&copy; 2024 StartupHub. Powered by AI. Built for the future.</p>
        </footer>
      </div>
    </div>
  )
}
