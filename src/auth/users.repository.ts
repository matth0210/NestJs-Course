import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UniqueConstraintViolationError } from '../common/errors';
import * as bcrypt from 'bcrypt';

const PG_UNIQUE_VIOLATION = '23505';

interface PostgresDriverError {
  code: string;
  constraint?: string;
}

function isPostgresError(error: unknown): error is QueryFailedError & {
  driverError: PostgresDriverError;
} {
  return (
    error instanceof QueryFailedError &&
    typeof (error as QueryFailedError & { driverError: PostgresDriverError })
      .driverError?.code === 'string'
  );
}

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(createUserDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = createUserDto;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const salt = await bcrypt.genSalt(10);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedPassword = await bcrypt.hash(password, salt);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = this.create({ username, password: hashedPassword });

    try {
      await this.save(user);
    } catch (error) {
      if (
        isPostgresError(error) &&
        error.driverError.code === PG_UNIQUE_VIOLATION
      ) {
        throw new UniqueConstraintViolationError(
          'User',
          error.driverError.constraint,
        );
      }
      throw new InternalServerErrorException();
    }
  }
}
