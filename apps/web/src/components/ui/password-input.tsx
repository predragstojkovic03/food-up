import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

function PasswordInput({ className, ...props }: React.ComponentProps<'input'>) {
  const [show, setShow] = useState(false)

  return (
    <InputGroup>
      <InputGroupInput
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
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { PasswordInput }
