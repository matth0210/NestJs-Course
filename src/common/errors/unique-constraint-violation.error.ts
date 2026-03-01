export class UniqueConstraintViolationError extends Error {
  constructor(
    public readonly entity: string,
    public readonly constraint?: string,
  ) {
    super(`Unique constraint violated on ${entity}`);
    this.name = 'UniqueConstraintViolationError';
  }
}
