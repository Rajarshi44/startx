"use client"

import { useFounderContext, JourneyStep, STEP_METADATA } from '@/utils/founder-context'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Lock, Clock, ArrowRight, Star } from 'lucide-react'
import { cn } from "@/lib/utils"

interface ProgressiveStepProps {
  step: JourneyStep
  index: number
  totalSteps: number
  onStepClick: (step: JourneyStep) => void
}

function ProgressiveStep({ step, index, totalSteps, onStepClick }: ProgressiveStepProps) {
  const { state, isStepUnlocked, getStepProgress } = useFounderContext()
  const metadata = STEP_METADATA[step]
  const progress = getStepProgress(step)
  const isUnlocked = isStepUnlocked(step)
  const isActive = state.activeTab === step
  const isCurrent = state.currentStep === step

  const getStepStatus = () => {
    if (progress.completed) return 'completed'
    if (isCurrent) return 'current'
    if (isUnlocked) return 'unlocked'
    return 'locked'
  }

  const status = getStepStatus()

  const statusConfig = {
    completed: {
      icon: CheckCircle,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-400/20',
      borderColor: 'border-green-400/40',
      textColor: 'text-green-300'
    },
    current: {
      icon: Star,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-400/20',
      borderColor: 'border-amber-400/60',
      textColor: 'text-amber-300'
    },
    unlocked: {
      icon: ArrowRight,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/30',
      textColor: 'text-blue-300'
    },
    locked: {
      icon: Lock,
      iconColor: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20',
      textColor: 'text-gray-500'
    }
  }

  const config = statusConfig[status]

  return (
    <div className="relative">
      {/* Connection Line */}
      {index < totalSteps - 1 && (
        <div className="absolute top-6 left-6 w-0.5 h-16 bg-gradient-to-b from-amber-500/40 to-transparent" />
      )}
      
      <Card 
        className={cn(
          "relative cursor-pointer transition-all duration-300 hover:scale-105",
          config.borderColor,
          config.bgColor,
          isActive ? 'ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20' : '',
          !isUnlocked ? 'cursor-not-allowed opacity-60' : ''
        )}
        onClick={() => isUnlocked && onStepClick(step)}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            {/* Step Icon */}
            <div className={cn(
              "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
              config.borderColor.replace('border-', 'border-'),
              config.bgColor
            )}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg">{metadata.icon}</span>
              </div>
              <div className="absolute -top-1 -right-1">
                <config.icon className={cn("w-4 h-4", config.iconColor)} />
              </div>
              {progress.completed && progress.score && (
                <div className="absolute -bottom-2 -right-2">
                  <Badge className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                    {progress.score}/10
                  </Badge>
                </div>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className={cn("font-medium text-sm", config.textColor)}>
                  {metadata.title}
                </h3>
                <Badge 
                  className={cn(
                    "text-xs",
                    status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                    status === 'current' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    status === 'unlocked' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                    'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  )}
                >
                  {metadata.estimatedTime}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                {metadata.description}
              </p>
              
              {/* Progress Indicators */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {status === 'completed' && progress.completedAt && (
                    <span className="text-xs text-green-400">
                      ✓ {new Date(progress.completedAt).toLocaleDateString()}
                    </span>
                  )}
                  {status === 'current' && (
                    <span className="text-xs text-amber-400 animate-pulse">
                      ◯ In Progress
                    </span>
                  )}
                  {status === 'unlocked' && (
                    <span className="text-xs text-blue-400">
                      → Ready to Start
                    </span>
                  )}
                  {status === 'locked' && (
                    <span className="text-xs text-gray-500">
                      🔒 Complete previous steps
                    </span>
                  )}
                </div>
                
                {isUnlocked && !progress.completed && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className={cn(
                      "h-6 px-2 text-xs",
                      status === 'current' ? 'text-amber-400 hover:bg-amber-500/10' :
                      'text-blue-400 hover:bg-blue-500/10'
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      onStepClick(step)
                    }}
                  >
                    {status === 'current' ? 'Continue' : 'Start'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ProgressiveStepsNavigationProps {
  onStepChange: (step: JourneyStep) => void
}

export function ProgressiveStepsNavigation({ onStepChange }: ProgressiveStepsNavigationProps) {
  const { state } = useFounderContext()

  const stepOrder = [
    JourneyStep.PROFILE_SETUP,
    JourneyStep.IDEA_VALIDATION,
    JourneyStep.POLICY_RESEARCH,
    JourneyStep.TEAM_BUILDING,
    JourneyStep.INVESTOR_MATCHING,
    JourneyStep.JOB_POSTING,
    JourneyStep.PITCH_CREATION
  ]

  const completedSteps = stepOrder.filter(step => state.stepProgress[step].completed).length
  const progressPercentage = (completedSteps / stepOrder.length) * 100

  return (
    <div className="space-y-6">
      {/* Overall Progress Header */}
      <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-light text-white mb-1">Your Startup Journey</h2>
            <p className="text-gray-400 text-sm">
              Complete each step to unlock the next phase
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-amber-400">{completedSteps}</div>
            <div className="text-sm text-gray-400">of {stepOrder.length} steps</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 text-right">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {stepOrder.map((step, index) => (
          <ProgressiveStep
            key={step}
            step={step}
            index={index}
            totalSteps={stepOrder.length}
            onStepClick={onStepChange}
          />
        ))}
      </div>

      {/* Completion Celebration */}
      {completedSteps === stepOrder.length && (
        <Card className="border border-green-500/40 rounded-2xl bg-green-500/10 backdrop-blur-sm animate-pulse">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-medium text-green-300 mb-2">
              Congratulations!
            </h3>
            <p className="text-green-400 text-sm">
              You've completed your startup journey! Your startup is ready to launch.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 