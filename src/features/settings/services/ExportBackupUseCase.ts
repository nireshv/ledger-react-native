import type { IBackupRepository } from './IBackupRepository';
import { createLogger } from '@core/utils/Logger';

const log = createLogger('ExportBackupUseCase');

export class ExportBackupUseCase {
  constructor(private readonly repo: IBackupRepository) {}

  /** Returns the exported file URI */
  async invoke(): Promise<string> {
    const uri = await this.repo.exportToFile();
    log.info('Backup exported to', uri);
    return uri;
  }
}
