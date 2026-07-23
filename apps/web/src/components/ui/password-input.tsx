import { ComponentProps, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

function PasswordInput({
  className,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  ...props
}: ComponentProps<'input'>) {
  const [show, setShow] = useState(false)

  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        type={show ? 'text' : 'password'}
        className={className}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="flex items-center text-muted-foreground hover:text-foreground"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { PasswordInput }
