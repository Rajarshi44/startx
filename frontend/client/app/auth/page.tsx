"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Rocket, Mail, Lock, User, ArrowLeft } from "lucide-react"
import { useUser } from "@civic/auth/react"
import Link from "next/link"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { user, signIn } = useUser()

  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const globeRef = useRef<THREE.Group | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)
  const ringsRef = useRef<THREE.Group | null>(null)

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
    const particlesCount = 200

    const posArray = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount; i++) {
      const radius = 3 + Math.random() * 2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      posArray[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      posArray[i * 3 + 1] = radius * Math.cos(phi)
      posArray[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3))

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
        ringsRef.current.children.forEach((ring, index) => {
          ring.rotation.z += 0.01 * (index + 1)
          ring.rotation.y += 0.005 * (index + 1)
        })
      }

      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array

        for (let i = 0; i < positions.length; i += 3) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = "/onboarding"
    }, 2000)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black" style={{ color: "#f6f6f6" }}>
      {/* Three.js Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="p-6 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" style={{ color: "#ffcb74" }} />
            <span style={{ color: "#ffcb74" }}>Back to Home</span>
          </Link>
          <div className="text-2xl font-bold">
            <span style={{ color: "#f6f6f6" }}>Startup</span>
            <span style={{ color: "#ffcb74" }}>Hub</span>
          </div>
        </nav>

        {/* Main Content - Left Aligned */}
        <main className="flex-1 flex items-center px-6 lg:px-12">
          <div className="max-w-md w-full">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Rocket className="h-8 w-8" style={{ color: "#ffcb74" }} />
                <h1 className="text-4xl font-bold" style={{ color: "#f6f6f6" }}>
                  Welcome to <span style={{ color: "#ffcb74" }}>StartupHub</span>
                </h1>
              </div>
              <p className="text-xl text-gray-300">
                {user
                  ? "You're signed in! Continue to select your role."
                  : "Join the startup ecosystem and connect with founders, investors, and opportunities."}
              </p>
            </div>

            {/* Auth Card */}
            <Card
              className="border backdrop-blur-sm shadow-2xl"
              style={{
                borderColor: "rgba(255, 203, 116, 0.2)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              }}
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl" style={{ color: "#f6f6f6" }}>
                  {user ? "Continue Your Journey" : "Get Started"}
                </CardTitle>
                <CardDescription style={{ color: "#d1d1d1" }}>
                  {user
                    ? "Go to onboarding to select your role and preferences."
                    : "Sign in to your account or create a new one"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <Tabs defaultValue="signin" className="space-y-4">
                    <TabsList
                      className="grid w-full grid-cols-2"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    >
                      <TabsTrigger
                        value="signin"
                        className="data-[state=active]:bg-[#ffcb74] data-[state=active]:text-black"
                      >
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger
                        value="signup"
                        className="data-[state=active]:bg-[#ffcb74] data-[state=active]:text-black"
                      >
                        Sign Up
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium" style={{ color: "#f6f6f6" }}>
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4" style={{ color: "#ffcb74" }} />
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10 bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-[#ffcb74]"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium" style={{ color: "#f6f6f6" }}>
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4" style={{ color: "#ffcb74" }} />
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              className="pl-10 bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-[#ffcb74]"
                              required
                            />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full text-white hover:opacity-90 transition-all duration-300"
                          style={{ backgroundColor: "#111111" }}
                          disabled={isLoading}
                        >
                          {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium" style={{ color: "#f6f6f6" }}>
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4" style={{ color: "#ffcb74" }} />
                            <Input
                              type="text"
                              placeholder="Enter your full name"
                              className="pl-10 bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-[#ffcb74]"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium" style={{ color: "#f6f6f6" }}>
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4" style={{ color: "#ffcb74" }} />
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10 bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-[#ffcb74]"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium" style={{ color: "#f6f6f6" }}>
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4" style={{ color: "#ffcb74" }} />
                            <Input
                              type="password"
                              placeholder="Create a password"
                              className="pl-10 bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-[#ffcb74]"
                              required
                            />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full text-white hover:opacity-90 transition-all duration-300"
                          style={{ backgroundColor: "#111111" }}
                          disabled={isLoading}
                        >
                          {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                ) : null}

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 text-gray-400" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                        {user ? "Ready to continue?" : "Or continue with"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {!user ? (
                      <Button
                        onClick={signIn}
                        className="w-full bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] font-semibold transition-all duration-300"
                      >
                        Continue with Civic Auth
                      </Button>
                    ) : (
                      <Button
                        onClick={() => (window.location.href = "/onboarding")}
                        className="w-full bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] font-semibold transition-all duration-300"
                      >
                        Continue to Onboarding
                      </Button>
                    )}

                    {!user && (
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-[#ffcb74]"
                        >
                          Google
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-[#ffcb74]"
                        >
                          LinkedIn
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-gray-400 mt-6">
              By signing up, you agree to our{" "}
              <Link href="#" className="hover:underline transition-colors" style={{ color: "#ffcb74" }}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="hover:underline transition-colors" style={{ color: "#ffcb74" }}>
                Privacy Policy
              </Link>
            </p>
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
