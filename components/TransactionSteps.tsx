"use client"
import React from 'react';
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

export type StepStatus = 'inactive' | 'loading' | 'success' | 'error';

export interface Step {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  errorMessage?: string;
}

interface TransactionStepsProps {
  steps: Step[];
  currentStepIndex?: number;
}

export const TransactionSteps = ({ steps, currentStepIndex }: TransactionStepsProps) => {
  const activeIndex = currentStepIndex ?? steps.findIndex(step =>
    step.status === 'loading' || step.status === 'error'
  );
 
  return (
    <div className="py-4 space-y-4">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`
            relative flex items-start gap-2 p-2 rounded-2xl transition-all duration-300 ease-in-out
            ${index === activeIndex 
              ? 'bg-yellow-50 0/20 border-2 border-yellow-200 -700 shadow-lg scale-[1.02]' 
              : 'bg-white border border-gray-200 700 shadow-sm hover:shadow-md'
            }
            ${step.status === 'success' ? 'bg-green-50 /20 border-green-200 -700' : ''}
            ${step.status === 'error' ? 'bg-red-50 0 border-red-200 00' : ''}
          `}
        >
          {/* Status Icon with Enhanced Styling */}
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
            ${step.status === 'loading' ? 'bg-yellow-100 ' : ''}
            ${step.status === 'success' ? 'bg-green-100 ' : ''}
            ${step.status === 'error' ? 'bg-red-100 ' : ''}
            ${step.status === 'inactive' ? 'bg-gray-100 ' : ''}
          `}>
            {step.status === 'loading' && (
              <Loader2 className="h-5 w-5 text-yellow-600 400 animate-spin" />
            )}
            {step.status === 'success' && (
              <CheckCircle2 className="h-5 w-5 text-green-600 00" />
            )}
            {step.status === 'error' && (
              <XCircle className="h-5 w-5 text-red-600 " />
            )}
            {step.status === 'inactive' && (
              <Circle className="h-5 w-5 text-gray-400 0" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`
              text-base font-semibold leading-none mb-1 transition-colors
              ${index === activeIndex ? 'text-black ' : 'text-gray-800 '}
            `}>
              {step.title}
            </h4>
            
            <p className={`
              text-xs leading-relaxed transition-colors
              ${index === activeIndex
                ? 'text-gray-700 '
                : 'text-gray-600 '
              }
            `}>
              {step.description}
            </p>
            
            {step.status === 'error' && step.errorMessage && (
              <div className="mt-3 p-3 bg-red-100 0 rounded-xl border border-red-200 00">
                <p className="text-xs text-red-700  font-medium">
                  {step.errorMessage}
                </p>
              </div>
            )}
          </div>

          {/* Progress Indicator Line */}
          {index < steps.length - 1 && (
            <div className="absolute left-8 top-16 w-0.5 h-8 bg-gradient-to-b from-gray-200 to-transparent 0" />
          )}

          {/* Active Step Glow Effect */}
          {index === activeIndex && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-100/50 to-yellow-200/50 900/20 0/20 -z-10" />
          )}
        </div>
      ))}
    </div>
  );
};