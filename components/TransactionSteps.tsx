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
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 shadow-lg scale-[1.02]' 
              : 'bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
            }
            ${step.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : ''}
            ${step.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' : ''}
          `}
        >
          {/* Status Icon with Enhanced Styling */}
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
            ${step.status === 'loading' ? 'bg-yellow-100 dark:bg-yellow-900/50' : ''}
            ${step.status === 'success' ? 'bg-green-100 dark:bg-green-900/50' : ''}
            ${step.status === 'error' ? 'bg-red-100 dark:bg-red-900/50' : ''}
            ${step.status === 'inactive' ? 'bg-gray-100 dark:bg-gray-800' : ''}
          `}>
            {step.status === 'loading' && (
              <Loader2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400 animate-spin" />
            )}
            {step.status === 'success' && (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            )}
            {step.status === 'error' && (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            {step.status === 'inactive' && (
              <Circle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`
              text-base font-semibold leading-none mb-1 transition-colors
              ${index === activeIndex ? 'text-black dark:text-white' : 'text-gray-800 dark:text-gray-200'}
            `}>
              {step.title}
            </h4>
            
            <p className={`
              text-xs leading-relaxed transition-colors
              ${index === activeIndex 
                ? 'text-gray-700 dark:text-gray-300' 
                : 'text-gray-600 dark:text-gray-400'
              }
            `}>
              {step.description}
            </p>
            
            {step.status === 'error' && step.errorMessage && (
              <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-700">
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                  {step.errorMessage}
                </p>
              </div>
            )}
          </div>

          {/* Progress Indicator Line */}
          {index < steps.length - 1 && (
            <div className="absolute left-8 top-16 w-0.5 h-8 bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-700" />
          )}

          {/* Active Step Glow Effect */}
          {index === activeIndex && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-100/50 to-yellow-200/50 dark:from-yellow-900/20 dark:to-yellow-800/20 -z-10" />
          )}
        </div>
      ))}
    </div>
  );
};