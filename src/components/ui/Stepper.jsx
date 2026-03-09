import { Check } from 'lucide-react'

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="flex items-center w-full px-6 py-4">
      {steps.map((step, i) => {
        const idx = i + 1
        const done = idx < currentStep
        const active = idx === currentStep
        const upcoming = idx > currentStep

        return (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            {/* Step node */}
            <div className="flex flex-col items-center">
              <div
                className={[
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shrink-0',
                  done    ? 'bg-sage-500 text-white'       : '',
                  active  ? 'bg-ink-800 text-white ring-4 ring-ink-100' : '',
                  upcoming? 'bg-stone-100 text-stone-400'  : '',
                ].join(' ')}
              >
                {done ? <Check className="h-4 w-4" /> : idx}
              </div>
              <div className="mt-1.5 text-center">
                <p className={`text-xs font-semibold whitespace-nowrap ${active ? 'text-ink-800' : done ? 'text-sage-600' : 'text-stone-400'}`}>
                  {step.label}
                </p>
                {step.sublabel && (
                  <p className={`text-xs whitespace-nowrap ${active ? 'text-stone-500' : 'text-stone-400'}`}>
                    {step.sublabel}
                  </p>
                )}
              </div>
            </div>
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 mb-5 rounded transition-colors duration-300 ${done ? 'bg-sage-400' : 'bg-stone-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
