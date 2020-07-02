/**
 * The error code returned by default if premature end is detected.
 */
export const DefaultPrematureEndErrorCode = 99;

/**
 * The error code returned by default if an unhandled rejection occurs.
 */
export const DefaultUnhandledRejectionErrorCode = 100;

/**
 * Represents a `main` entry point function.
 */
export interface Main {
  /**
   * @param args The arguments passed to the process (process.argv.slice(2))
   * @returns The exit code to return, or zero.
   */
  (args: string[]): PromiseLike<number | void>;
}

/**
 * Options to control behaviour of the `run` function.
 */
export interface RunOptions {
  /**
   * Don't bring the process down if an unhandled rejection occurs.
   */
  continueOnUnhandledRejection?: boolean;

  /**
   * Don't use a non-zero return code if we run out async continuations.
   */
  ignorePrematureEnd?: boolean;

  /**
   * Run a custom handler on premature end.
   */
  onPrematureEnd?: () => void;

  /**
   * Error code to return if premature end is detected (default 99).
   */
  prematureEndErrorCode?: number;

  /**
   * Error code to return if there is an unhandled promise rejection.
   */
  unhandledRejectionErrorCode?: number;
}

/**
 * Run an async entry point function.
 * @param main The async entry point function to run.
 * @param opts Options to control the behaviour.
 */
export function run(main: Main, opts?: RunOptions): void {
  if (!opts?.ignorePrematureEnd) {
    process.on('beforeExit', () => {
      // if we get here, we didn't manage to get all the way back to the final
      // continuation below, so it's probably an error.
      if (opts?.onPrematureEnd) {
        opts.onPrematureEnd();
      }
      console.error('ERROR: ran out of async continuations!');
      process.exit(opts?.prematureEndErrorCode || DefaultPrematureEndErrorCode);
    });
  }
  if (!opts?.continueOnUnhandledRejection) {
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION:', err);
      process.exit(
        opts?.unhandledRejectionErrorCode || DefaultUnhandledRejectionErrorCode,
      );
    });
  }

  main(process.argv.slice(2))
    .then((result) => {
      // assuming everything behaved nicely, we will always get here after main
      // completes
      process.exit(result || 0);
    })
    .then(undefined, (err) => {
      console.error(err);
      process.exit(1);
    });
}
