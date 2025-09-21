import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

export interface WellnessPlan {
  diet: string[];
  exercise: string[];
  sleep: string[];
  localFoods: string[];
}

export interface ReportUploadResult {
  success: boolean;
  extractedData?: Record<string, string>;
  wellnessPlan?: WellnessPlan;
  fileName?: string;
  error?: string;
  step?: string;
  details?: string;
  processingTime?: number;
}

export const uploadReport = async (
  fileData: string,
  fileName: string,
  mimeType: string
): Promise<ReportUploadResult> => {
  const uploadReportFunction = httpsCallable(functions, 'uploadReport');
  
  const result = await uploadReportFunction({
    fileData,
    fileName,
    mimeType
  });
  
  return result.data as ReportUploadResult;
};