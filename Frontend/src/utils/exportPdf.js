
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { REPORT_EXPORTS_ENABLED } from './exportConfig';

export const exportPDF = (columns, data, title = 'Exported Data') => {
  if (!REPORT_EXPORTS_ENABLED) return;

  const doc = new jsPDF();
  
  // Add a title
  doc.text(title, 20, 10);

  // Create a table with data
  doc.autoTable({
    head: [columns],
    body: data,
  });

  // Save the PDF
  doc.save(`${title}.pdf`);
};
