'use client'

import { useState } from 'react'

interface Step {
  title: string
  content: React.ReactNode
}

interface MultiStepFormProps {
  steps: Step[]
  onSubmit: () => void
}

export default function MultiStepForm({ steps, onSubmit }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div className="w-full">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`flex-1 text-center py-2 px-4 ${
                index === currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className="inline-block w-6 h-6 rounded-full bg-white text-blue-500 mb-1">
                {index + 1}
              </span>
              <span className="block">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mt-6">
        {steps[currentStep].content}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className={`px-4 py-2 rounded ${
            currentStep === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => {
            if (currentStep === steps.length - 1) {
              onSubmit()
            } else {
              setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))
            }
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  )
} 