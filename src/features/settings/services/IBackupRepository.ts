export interface IBackupRepository {
  /** Serialize the full database to JSON and write to a file. Returns the file URI. */
  exportToFile(): Promise<string>;
  /** Read a backup file from the given URI and restore all data. */
  importFromFile(fileUri: string): Promise<void>;
}
