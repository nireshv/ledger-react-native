import type { IBackupRepository } from './IBackupRepository';
import { createLogger } from '@core/utils/Logger';

const log = createLogger('ImportBackupUseCase');

export class ImportBackupUseCase {
  constructor(private readonly repo: IBackupRepository) {}

  async invoke(fileUri: string): Promise<void> {
    await this.repo.importFromFile(fileUri);
    log.info('Backup restored from', fileUri);
  }
}
