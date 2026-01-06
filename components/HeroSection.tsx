"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, Users } from "lucide-react"
import { useUser, SignIn, SignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function HeroSection() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [showAuth, setShowAuth] = useState(false)
  const [isSignIn, setIsSignIn] = useState(false)

  const handleRegisterComplaint = () => {
    if (isSignedIn) {
      router.push('/online_complaint')
    } else {
      setShowAuth(true)
      setIsSignIn(false)
    }
  }

  const handleComplaintStatus = () => {
    if (isSignedIn) {
      router.push('/complaint_status')
    } else {
      setShowAuth(true)
      setIsSignIn(true)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuth(false)
    if (isSignedIn) {
      router.push('/online_complaint')
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Enhanced Background with Visible Grid */}
      <div className="absolute inset-0 bg-background">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `
                  linear-gradient(to right, #111827 1px, transparent 1px),
                  linear-gradient(to bottom, #111827 1px, transparent 1px)
            `,
            backgroundSize: '4rem 4rem',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black 70%, transparent 110%)'
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-primary/5" />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-primary/15 to-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Modern Complaint Management System
            </motion.h1>
            
            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Streamline your complaint resolution process with AI-powered efficiency
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: Shield, 
                title: "Secure & Reliable", 
                desc: "Enterprise-grade security" 
              },
              { 
                icon: Zap, 
                title: "Fast Resolution", 
                desc: "AI-powered processing" 
              },
              { 
                icon: Users, 
                title: "User Friendly", 
                desc: "Intuitive interface" 
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className="text-center space-y-4"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group">
                    <feature.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 group"
                onClick={handleRegisterComplaint}
              >
                Register Complaint
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={handleComplaintStatus}
              >
                Complaint Status
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Welcome message for signed-in users */}
          {isSignedIn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="pt-4"
            >
              <p className="text-green-600 font-medium">
                Welcome back, {user.firstName || user.username}! Ready to submit a complaint?
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isSignIn ? 'Sign In to Your Account' : 'Create Your Account'}
              </h3>
              <button 
                onClick={() => setShowAuth(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {isSignIn ? (
              <SignIn 
                routing="virtual"
                afterSignInUrl="/online_complaint"
                redirectUrl="/online_complaint"
              />
            ) : (
              <SignUp 
                routing="virtual"
                afterSignUpUrl="/online_complaint"
                redirectUrl="/online_complaint"
              />
            )}
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
              >
                {isSignIn 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}