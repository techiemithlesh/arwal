import * as XLSX from 'xlsx';
import { REPORT_EXPORTS_ENABLED } from './exportConfig';

/**
 * Exports data to Excel and triggers download.
 * @param {Array} data - The data to export.
 * @param {string} fileName - The name of the exported file.
 */
export const exportToExcel = (data, fileName = 'data.xlsx') => {
  if (!REPORT_EXPORTS_ENABLED) return;

  // Create a new workbook and a worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, fileName);
};
