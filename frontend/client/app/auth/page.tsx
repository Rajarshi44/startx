/*eslint-disable*/
"use client"
import { useState, useEffect, useRef } from "react"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket, ArrowLeft, Wallet, Shield, Zap, ExternalLink, AlertCircle } from "lucide-react"
import { useUser } from "@civic/auth-web3/react"
import Link from "next/link"
import { useAccount, useConnect, useBalance, useDisconnect } from "wagmi"
import { UserButton } from "@civic/auth-web3/react"

// Separate component for the auth content that needs access to hooks
const AuthContent = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasMetaMask, setHasMetaMask] = useState(false)
  const userContext = useUser()
  const { connect, connectors, error: connectError } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const balance = useBalance({
    address: address,
  })

  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const globeRef = useRef<THREE.Group | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)
  const ringsRef = useRef<THREE.Group | null>(null)

  // Check if MetaMask is installed
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasMetaMask(typeof window.ethereum !== "undefined")
    }
  }, [])

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

    // Steel blue materials (updated from gold)
    const steelBlueMaterial = new THREE.MeshBasicMaterial({
      color: 0x637089,
      transparent: true,
      opacity: 0.3,
    })

    const steelBlueWireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x637089,
      transparent: true,
      opacity: 0.8,
      wireframe: true,
    })

    const steelBlueLineMaterial = new THREE.LineBasicMaterial({
      color: 0x637089,
      transparent: true,
      opacity: 0.6,
    })

    // Create main globe sphere
    const globeGeometry = new THREE.SphereGeometry(1.5, 32, 16)
    const globe = new THREE.Mesh(globeGeometry, steelBlueMaterial)
    const globeWireframe = new THREE.Mesh(globeGeometry, steelBlueWireframeMaterial)

    globeGroup.add(globe)
    globeGroup.add(globeWireframe)

    // Create latitude lines
    for (let i = 0; i < 8; i++) {
      const lat = (i / 7 - 0.5) * Math.PI
      const radius = Math.cos(lat) * 1.5
      const y = Math.sin(lat) * 1.5

      if (radius > 0.1) {
        const latGeometry = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 32)
        const latLine = new THREE.Mesh(latGeometry, steelBlueLineMaterial)
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
      const longLine = new THREE.Line(longGeometry, steelBlueLineMaterial)
      globeGroup.add(longLine)
    }

    // Create floating steel blue rings around the globe
    const ringsGroup = new THREE.Group()
    ringsRef.current = ringsGroup

    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(2 + i * 0.5, 2.1 + i * 0.5, 64)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x637089,
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

    // Create steel blue particles orbiting the globe
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
      color: 0x637089,
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

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    if (!hasMetaMask) {
      window.open("https://metamask.io/download/", "_blank")
      return
    }

    setIsLoading(true)
    try {
      const metaMaskConnector = connectors.find((connector) => connector.name === "MetaMask")
      if (metaMaskConnector) {
        await connect({ connector: metaMaskConnector })
      } else {
        // Fallback to injected connector
        await connect({ connector: connectors[0] })
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinueToOnboarding = () => {
    window.location.href = "/onboarding"
  }

  const handleDisconnectWallet = () => {
    disconnect()
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0C0C0C 0%, #1F2A3C 100%)",
        color: "#FFFFFF",
      }}
    >
      {/* Three.js Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="p-6 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" style={{ color: "#637089" }} />
            <span style={{ color: "#637089" }}>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">
              <span style={{ color: "#FFFFFF" }}>Start</span>
              <span style={{ color: "#637089" }}>X</span>
            </div>
            {userContext.user && <UserButton />}
          </div>
        </nav>

        {/* Main Content - Left Aligned */}
        <main className="flex-1 flex items-center px-6 lg:px-12">
          <div className="max-w-md w-full">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Rocket className="h-8 w-8" style={{ color: "#637089" }} />
                <h1 className="text-4xl font-bold" style={{ color: "#FFFFFF" }}>
                  Welcome to <span style={{ color: "#637089" }}>STARTX</span>
                </h1>
              </div>
              <p className="text-xl" style={{ color: "#D1D5DB" }}>
                {userContext.user
                  ? "Connect your MetaMask wallet to access the Web3 startup ecosystem."
                  : "Join the Web3 startup ecosystem with secure, decentralized authentication."}
              </p>
            </div>

            {/* Auth Card */}
            <Card
              className="border backdrop-blur-sm shadow-2xl"
              style={{
                borderColor: "#B0B8C1",
                backgroundColor: "rgba(31, 42, 60, 0.4)",
              }}
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl" style={{ color: "#FFFFFF" }}>
                  {userContext.user ? "Connect Your Wallet" : "Get Started with Web3"}
                </CardTitle>
                <CardDescription style={{ color: "#D1D5DB" }}>
                  {userContext.user
                    ? "Connect your existing MetaMask wallet to access all features."
                    : "Secure, decentralized authentication powered by Civic Auth"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!userContext.user ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div
                        className="flex items-center space-x-3 p-3 rounded-lg"
                        style={{ backgroundColor: "rgba(99, 112, 137, 0.2)" }}
                      >
                        <Shield className="h-5 w-5" style={{ color: "#637089" }} />
                        <span className="text-sm" style={{ color: "#D1D5DB" }}>
                          Secure Web3 Authentication
                        </span>
                      </div>
                      <div
                        className="flex items-center space-x-3 p-3 rounded-lg"
                        style={{ backgroundColor: "rgba(99, 112, 137, 0.2)" }}
                      >
                        <Wallet className="h-5 w-5" style={{ color: "#637089" }} />
                        <span className="text-sm" style={{ color: "#D1D5DB" }}>
                          Connect Your Existing Wallet
                        </span>
                      </div>
                      <div
                        className="flex items-center space-x-3 p-3 rounded-lg"
                        style={{ backgroundColor: "rgba(99, 112, 137, 0.2)" }}
                      >
                        <Zap className="h-5 w-5" style={{ color: "#637089" }} />
                        <span className="text-sm" style={{ color: "#D1D5DB" }}>
                          Seamless Onboarding
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!isConnected ? (
                      <div className="space-y-4">
                        {!hasMetaMask ? (
                          <div
                            className="text-center p-4 rounded-lg"
                            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                          >
                            <AlertCircle className="h-12 w-12 mx-auto mb-2" style={{ color: "#ef4444" }} />
                            <p className="text-sm text-red-400 mb-3">MetaMask is required to use this application</p>
                            <Button
                              onClick={connectWallet}
                              className="w-full font-semibold transition-all duration-300"
                              style={{
                                backgroundColor: "#637089",
                                color: "#FFFFFF",
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Install MetaMask
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="text-center p-4 rounded-lg"
                            style={{ backgroundColor: "rgba(99, 112, 137, 0.2)" }}
                          >
                            <Wallet className="h-12 w-12 mx-auto mb-2" style={{ color: "#637089" }} />
                            <p className="text-sm mb-3" style={{ color: "#D1D5DB" }}>
                              Connect your MetaMask wallet to continue
                            </p>
                            <Button
                              onClick={connectWallet}
                              disabled={isLoading}
                              className="w-full font-semibold transition-all duration-300 hover:opacity-90"
                              style={{
                                backgroundColor: "#637089",
                                color: "#FFFFFF",
                              }}
                            >
                              {isLoading ? "Connecting..." : "Connect MetaMask Wallet"}
                            </Button>
                            {connectError && <p className="text-xs text-red-400 mt-2">Error: {connectError.message}</p>}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div
                          className="text-center p-4 rounded-lg"
                          style={{ backgroundColor: "rgba(74, 222, 128, 0.1)" }}
                        >
                          <Shield className="h-12 w-12 mx-auto mb-2" style={{ color: "#4ADE80" }} />
                          <p className="text-sm mb-2" style={{ color: "#4ADE80" }}>
                            ✓ Wallet Connected
                          </p>
                          <p className="text-xs mb-2" style={{ color: "#B0B8C1" }}>
                            Address: {address?.slice(0, 6)}...{address?.slice(-4)}
                          </p>
                          <p className="text-xs" style={{ color: "#B0B8C1" }}>
                            Balance:{" "}
                            {balance?.data
                              ? `${Number(balance.data.formatted).toFixed(4)} ${balance.data.symbol}`
                              : "Loading..."}
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            onClick={handleDisconnectWallet}
                            variant="outline"
                            className="flex-1 bg-transparent text-white hover:opacity-80"
                            style={{
                              borderColor: "#B0B8C1",
                              backgroundColor: "#374151",
                            }}
                          >
                            Disconnect
                          </Button>
                          <Button
                            onClick={handleContinueToOnboarding}
                            className="flex-1 font-semibold transition-all duration-300 hover:opacity-90"
                            style={{
                              backgroundColor: "#637089",
                              color: "#FFFFFF",
                            }}
                          >
                            Continue
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!userContext.user && (
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" style={{ borderColor: "#B0B8C1" }} />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span
                          className="px-2"
                          style={{
                            color: "#B0B8C1",
                            backgroundColor: "rgba(31, 42, 60, 0.4)",
                          }}
                        >
                          Secure Web3 Authentication
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        onClick={() => userContext.signIn()}
                        className="w-full font-semibold transition-all duration-300 hover:opacity-90"
                        style={{
                          backgroundColor: "#637089",
                          color: "#FFFFFF",
                        }}
                      >
                        Sign In with Civic Auth
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <p className="text-center text-sm mt-6" style={{ color: "#B0B8C1" }}>
              By signing up, you agree to our{" "}
              <Link href="#" className="hover:underline transition-colors" style={{ color: "#637089" }}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="hover:underline transition-colors" style={{ color: "#637089" }}>
                Privacy Policy
              </Link>
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-left text-sm" style={{ color: "#B0B8C1" }}>
          <p>&copy; 2025 StartX. Powered by Web3. Built for the future.</p>
        </footer>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return <AuthContent />
}
