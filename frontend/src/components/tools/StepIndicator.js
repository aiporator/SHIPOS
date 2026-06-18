import { Check, Star } from 'lucide-react';

export const StepIndicator = ({ currentStep, totalSteps, toolGradient }) => (
  <div className="flex items-center gap-1" data-testid="step-indicator">
    {Array.from({ length: totalSteps + 1 }).map((_, i) => {
      let stepCls = 'bg-gray-100 dark:bg-muted text-muted-foreground';
      if (i < currentStep) stepCls = `bg-gradient-to-br ${toolGradient} text-white shadow-sm`;
      else if (i === currentStep) stepCls = `bg-gradient-to-br ${toolGradient} text-white shadow-sm animate-pulse-glow`;

      let stepContent = i + 1;
      if (i < currentStep) stepContent = <Check size={14} />;
      else if (i === totalSteps) stepContent = <Star size={14} />;

      return (
        <div key={`step-${i}`} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${stepCls}`}>
            {stepContent}
          </div>
          {i < totalSteps && (
            <div className={`w-6 h-0.5 mx-0.5 rounded-full transition-all ${
              i < currentStep ? `bg-gradient-to-r ${toolGradient}` : 'bg-gray-200 dark:bg-muted'
            }`} />
          )}
        </div>
      );
    })}
  </div>
);
