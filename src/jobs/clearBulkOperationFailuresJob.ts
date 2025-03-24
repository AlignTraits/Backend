// jobs/clearBulkOperationFailuresJob.ts
import cron from 'node-cron';
import { clearOldBulkOperationFailuresService } from '../services/bulk-test';

// Schedule the job to run daily at midnight (00:00)
export const scheduleClearBulkOperationFailuresJob = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log(
      'Running scheduled job to clear old BulkOperationFailure records...'
    );
    try {
      const result = await clearOldBulkOperationFailuresService(14);
      console.log(result.message, `Deleted ${result.deletedCount} records`);
    } catch (error: any) {
      console.error('Error running clearBulkOperationFailures job:', error);
    }
  });
};
