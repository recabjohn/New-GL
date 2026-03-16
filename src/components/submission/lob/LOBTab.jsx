import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../ui/Button'
import ConfirmDialog from '../../ui/ConfirmDialog'
import { glPolicy } from '../../../data/mockData'
import { useToast } from '../../ui/Toast'
import Step1_SubmissionInfo from './Step1_SubmissionInfo'
import Step2_RiskCoverage   from './Step2_RiskCoverage'
import Step3_Locations      from './Step3_Locations'
import { ArrowLeft, ArrowRight, BarChart2, Check } from 'lucide-react'
import { useBeforeUnload, getDraftData, clearDraftData } from '../../../hooks/useFormGuard'

const STEPS = [
  { label: 'Submission Info',  sublabel: 'Underwriter & loss info' },
  { label: 'Risk & Coverage',  sublabel: 'Limits & deductibles' },
  { label: 'Locations',        sublabel: 'Addresses & classifications' },
]

export default function LOBTab({ onComplete }) {
  const { id }   = useParams()
  const navigate = useNavigate()
  const toast    = useToast()
  const [step, setStep]     = useState(1)
  
  const [data, setData] = useState(() => {
    return getDraftData(`draft_lob_${id}`) || glPolicy
  })
  
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  // Scroll to top when changing steps
  useEffect(() => {
    document.getElementById('main-scroll-area')?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const isDirty = !saved && JSON.stringify(data) !== JSON.stringify(glPolicy)
  useBeforeUnload(isDirty, `draft_lob_${id}`, data)

  const handleNext = async () => {
    if (step < 3) { setStep(s => s + 1); return }

    // Validate: every location must have at least 1 classification
    const schedule = data.stateSchedule || []
    const missing = []
    for (const entry of schedule) {
      for (const loc of (entry.locations || [])) {
        if ((loc.classifications || []).length === 0) {
          missing.push(`${loc.name || `Location ${loc.locationNumber}`} (${entry.stateCode})`)
        }
      }
    }
    if (missing.length > 0) {
      toast.error('Classifications required', `Add at least 1 classification to: ${missing.join(', ')}`)
      return
    }

    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    clearDraftData(`draft_lob_${id}`)
    toast.success('GL Policy saved', 'All 3 steps saved. Proceeding to rating.')
    onComplete?.()
    navigate(`/submissions/${id}/browse`)
  }

  const [pendingStep, setPendingStep] = useState(null)

  const guardedSetStep = (target) => {
    if (isDirty) { setPendingStep(target); return }
    setStep(target)
  }

  const handlePrev = () => guardedSetStep(step - 1)

  return (
    <div className="space-y-5">
      {/* Sticky stepper bar */}
      <div className="sticky top-0 z-10 bg-white rounded-xl border border-stone-200 shadow-sm px-6 py-4 -mx-0">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const num      = i + 1
            const isActive = step === num
            const isDone   = step > num
            return (
              <div key={s.label} className="flex items-center">
                <button
                  type="button"
                  onClick={() => isDone && guardedSetStep(num)}
                  className={`flex items-center gap-3 ${isDone ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all shrink-0',
                    isActive ? 'bg-ink-700 text-white ring-4 ring-ink-100' : isDone ? 'bg-sage-500 text-white' : 'bg-stone-100 text-stone-400',
                  ].join(' ')}>
                    {isDone ? <Check className="h-4 w-4" /> : num}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-stone-900' : isDone ? 'text-sage-700' : 'text-stone-400'}`}>
                      {s.label}
                    </p>
                    <p className={`text-xs leading-tight ${isActive ? 'text-stone-500' : isDone ? 'text-sage-500' : 'text-stone-300'}`}>
                      {s.sublabel}
                    </p>
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-10 mx-4 shrink-0 transition-colors ${isDone ? 'bg-sage-300' : 'bg-stone-200'}`} />
                )}
              </div>
            )
          })}
          <span className="ml-auto text-xs text-stone-400 font-medium shrink-0 pl-4">
            Step {step} / {STEPS.length}
          </span>
        </div>
      </div>

      {/* Step content */}
      <div>
        {step === 1 && <Step1_SubmissionInfo data={data} onChange={setData} />}
        {step === 2 && <Step2_RiskCoverage   data={data} onChange={setData} />}
        {step === 3 && <Step3_Locations      data={data} onChange={setData} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
        <Button variant="secondary" icon={ArrowLeft} onClick={handlePrev} disabled={step === 1}>
          Previous
        </Button>
        <Button variant="cta" loading={saving} onClick={handleNext}>
          {step === 3
            ? <><BarChart2 className="h-4 w-4 mr-1.5" />Save &amp; Rate</>
            : <>Next <ArrowRight className="h-4 w-4 ml-1.5" /></>
          }
        </Button>
      </div>

      <ConfirmDialog
        open={pendingStep !== null}
        title="Unsaved Changes"
        message="You have unsaved changes on this step. Leave anyway?"
        confirmLabel="Leave"
        cancelLabel="Stay"
        variant="warning"
        onConfirm={() => { setStep(pendingStep); setPendingStep(null) }}
        onCancel={() => setPendingStep(null)}
      />
    </div>
  )
}
