# @fmtk/async-main

Wrapper for async entry points.

## Quick Start

This package provides a function `run` which will execute an async main function:

```typescript
import {
  run,
  DefaultPrematureEndErrorCode,
  DefaultUnhandledRejectionErrorCode,
} from '@fmtk/async-main';

// can return PromiseLike<void> or PromiseLike<number>
async function main(args: string): Promise<number> {
  // args is is equal to process.argv.slice(2)
  console.log(`args: ${args.join('. ')}`);

  // use 1 as the exit code.
  return 1;
}

run(main, {
  // default options:
  continueOnUnhandledRejection: false,
  ignorePrematureEnd: false,
  onPrematureEnd: undefined,
  prematureEndErrorCode: DefaultPrematureEndErrorCode, // = 99
  unhandledRejectionErrorCode: DefaultUnhandledRejectionErrorCode, // = 100
});
```

## Options

```typescript
interface RunOptions {
  // don't bring the process down if an unhandled rejection occurs
  continueOnUnhandledRejection?: boolean;

  // don't use a non-zero return code if we run out async continuations
  ignorePrematureEnd?: boolean;

  // run a custom handler on premature end
  onPrematureEnd?: () => void;

  // error code to return if premature end is detected (default 99)
  prematureEndErrorCode?: number;

  // error code to return if there is an unhandled promise rejection
  unhandledRejectionErrorCode?: number;
}
```

## Unhandled promise rejection

By default the process will be ended with a non-zero exit code if an unhandled promise rejection occurs. This can be disabled by passing `true` for `continueOnUnhandledRejection` in the options parameter.

## Premature end detection

The `run` function expects for execution to return to it after awaiting your main function. If the process ends before this, it is because it has run out of things to do (run out of async continuations). This is usually indicative of an error, and is usually caused by incorrectly interfacing promises and traditional async code like streams.

By default such a case will cause the process to be exited with a non-zero exit code, unless disabled using the `ignorePrematureEnd`
