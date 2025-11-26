/**
 * Utility functions for exporting analytics data
 * Following UI-first approach with mock data
 * Validates: Requirements AC20 (Export Functionality)
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

interface AnalyticsData {
  timePeriod: string;
  keyMetrics: {
    totalComplaints: number;
    totalChange: string;
    avgResponseTime: string;
    responseTimeChange: string;
    resolutionRate: number;
    resolutionRateChange: string;
    activeCases: number;
    satisfactionRating: number;
    satisfactionChange: string;
  };
  complaintsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  complaintsByCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  complaintsByPriority: Array<{
    priority: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  complaintsOverTime: Array<{
    date: string;
    count: number;
    label: string;
  }>;
  lecturerPerformance: Array<{
    id: string;
    name: string;
    complaintsHandled: number;
    avgResponseTime: string;
    resolutionRate: number;
    satisfactionRating: number;
  }>;
  topComplaintTypes: Array<{
    type: string;
    count: number;
  }>;
}

/**
 * Export analytics data as CSV
 */
export function exportAnalyticsAsCSV(data: AnalyticsData): void {
  const csvContent = generateCSVContent(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate CSV content from analytics data
 */
function generateCSVContent(data: AnalyticsData): string {
  const lines: string[] = [];

  // Header
  lines.push('Analytics Report');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push(`Period: ${data.timePeriod}`);
  lines.push('');

  // Key Metrics
  lines.push('KEY METRICS');
  lines.push('Metric,Value,Change');
  lines.push(`Total Complaints,${data.keyMetrics.totalComplaints},${data.keyMetrics.totalChange}`);
  lines.push(
    `Average Response Time,${data.keyMetrics.avgResponseTime},${data.keyMetrics.responseTimeChange}`
  );
  lines.push(
    `Resolution Rate,${data.keyMetrics.resolutionRate}%,${data.keyMetrics.resolutionRateChange}`
  );
  lines.push(`Active Cases,${data.keyMetrics.activeCases},-`);
  lines.push(
    `Satisfaction Rating,${data.keyMetrics.satisfactionRating}/5.0,${data.keyMetrics.satisfactionChange}`
  );
  lines.push('');

  // Complaints by Status
  lines.push('COMPLAINTS BY STATUS');
  lines.push('Status,Count,Percentage');
  data.complaintsByStatus.forEach((item) => {
    lines.push(`${item.status},${item.count},${item.percentage}%`);
  });
  lines.push('');

  // Complaints by Category
  lines.push('COMPLAINTS BY CATEGORY');
  lines.push('Category,Count,Percentage');
  data.complaintsByCategory.forEach((item) => {
    lines.push(`${item.category},${item.count},${item.percentage}%`);
  });
  lines.push('');

  // Complaints by Priority
  lines.push('COMPLAINTS BY PRIORITY');
  lines.push('Priority,Count,Percentage');
  data.complaintsByPriority.forEach((item) => {
    lines.push(`${item.priority},${item.count},${item.percentage}%`);
  });
  lines.push('');

  // Complaints Over Time
  lines.push('COMPLAINTS OVER TIME');
  lines.push('Date,Count');
  data.complaintsOverTime.forEach((item) => {
    lines.push(`${item.label},${item.count}`);
  });
  lines.push('');

  // Lecturer Performance
  lines.push('LECTURER PERFORMANCE');
  lines.push('Name,Complaints Handled,Avg Response Time,Resolution Rate,Satisfaction Rating');
  data.lecturerPerformance.forEach((lecturer) => {
    lines.push(
      `${lecturer.name},${lecturer.complaintsHandled},${lecturer.avgResponseTime},${lecturer.resolutionRate}%,${lecturer.satisfactionRating}`
    );
  });
  lines.push('');

  // Top Complaint Types
  lines.push('TOP COMPLAINT TYPES');
  lines.push('Type,Count');
  data.topComplaintTypes.forEach((item) => {
    lines.push(`${item.type},${item.count}`);
  });

  return lines.join('\n');
}

/**
 * Export analytics data as JSON
 */
export function exportAnalyticsAsJSON(data: AnalyticsData): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export analytics data as PDF using jsPDF
 * Validates: Requirements AC20 (Export Functionality)
 */
export function exportAnalyticsAsPDF(data: AnalyticsData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Add header with title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Analytics Report', margin, yPosition);
  yPosition += 10;

  // Add horizontal line
  doc.setDrawColor(59, 130, 246); // Primary blue color
  doc.setLineWidth(1);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Report metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${data.timePeriod}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 15;

  // Key Metrics Section
  checkPageBreak(60);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Key Metrics', margin, yPosition);
  yPosition += 10;

  // Create metrics cards in a grid
  const metricsData = [
    ['Total Complaints', data.keyMetrics.totalComplaints.toString(), data.keyMetrics.totalChange],
    ['Avg Response Time', data.keyMetrics.avgResponseTime, data.keyMetrics.responseTimeChange],
    ['Resolution Rate', `${data.keyMetrics.resolutionRate}%`, data.keyMetrics.resolutionRateChange],
    ['Active Cases', data.keyMetrics.activeCases.toString(), '-'],
    [
      'Satisfaction Rating',
      `${data.keyMetrics.satisfactionRating}/5.0`,
      data.keyMetrics.satisfactionChange,
    ],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value', 'Change']],
    body: metricsData,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 50, halign: 'center' },
      2: { cellWidth: 'auto', halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Complaints by Status Section
  checkPageBreak(60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Complaints by Status', margin, yPosition);
  yPosition += 10;

  const statusData = data.complaintsByStatus.map((item) => [
    item.status,
    item.count.toString(),
    `${item.percentage}%`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Status', 'Count', 'Percentage']],
    body: statusData,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Complaints by Category Section
  checkPageBreak(60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Complaints by Category', margin, yPosition);
  yPosition += 10;

  const categoryData = data.complaintsByCategory.map((item) => [
    item.category,
    item.count.toString(),
    `${item.percentage}%`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Category', 'Count', 'Percentage']],
    body: categoryData,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Complaints by Priority Section
  checkPageBreak(60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Complaints by Priority', margin, yPosition);
  yPosition += 10;

  const priorityData = data.complaintsByPriority.map((item) => [
    item.priority,
    item.count.toString(),
    `${item.percentage}%`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Priority', 'Count', 'Percentage']],
    body: priorityData,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Complaints Over Time Section
  checkPageBreak(80);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Complaints Over Time', margin, yPosition);
  yPosition += 10;

  // Create a simple bar chart visualization
  const chartHeight = 60;
  const chartWidth = pageWidth - 2 * margin - 20;
  const maxCount = Math.max(...data.complaintsOverTime.map((d) => d.count));
  const barWidth = chartWidth / data.complaintsOverTime.length;

  // Draw chart background
  doc.setFillColor(245, 245, 245);
  doc.rect(margin + 10, yPosition, chartWidth, chartHeight, 'F');

  // Draw bars
  data.complaintsOverTime.forEach((dataPoint, index) => {
    const barHeight = (dataPoint.count / maxCount) * (chartHeight - 10);
    const x = margin + 10 + index * barWidth + barWidth * 0.2;
    const y = yPosition + chartHeight - barHeight - 5;

    doc.setFillColor(59, 130, 246);
    doc.rect(x, y, barWidth * 0.6, barHeight, 'F');
  });

  // Draw axis labels
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('0', margin + 5, yPosition + chartHeight);
  doc.text(maxCount.toString(), margin + 5, yPosition + 5);

  yPosition += chartHeight + 5;

  // Add summary statistics
  const avgDaily = Math.round(
    data.complaintsOverTime.reduce((sum, d) => sum + d.count, 0) / data.complaintsOverTime.length
  );
  const peakDay = Math.max(...data.complaintsOverTime.map((d) => d.count));

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`Daily Average: ${avgDaily} | Peak Day: ${peakDay}`, margin + 10, yPosition);
  yPosition += 15;

  // Lecturer Performance Section
  checkPageBreak(80);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Lecturer Performance', margin, yPosition);
  yPosition += 10;

  const lecturerData = data.lecturerPerformance.map((lecturer) => [
    lecturer.name,
    lecturer.complaintsHandled.toString(),
    lecturer.avgResponseTime,
    `${lecturer.resolutionRate}%`,
    `${lecturer.satisfactionRating}/5.0`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Name', 'Handled', 'Avg Response', 'Resolution Rate', 'Rating']],
    body: lecturerData,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 35, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Top Complaint Types Section
  checkPageBreak(60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Complaint Types', margin, yPosition);
  yPosition += 10;

  const topTypesData = data.topComplaintTypes.map((item, index) => [
    `${index + 1}`,
    item.type,
    item.count.toString(),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Rank', 'Type', 'Count']],
    body: topTypesData,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 100 },
      2: { cellWidth: 30, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`Student Complaint Resolution System`, margin, pageHeight - 10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, pageHeight - 10, {
      align: 'right',
    });
  }

  // Save the PDF
  const fileName = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

/**
 * Generate printable HTML content
 */
function generatePrintableHTML(data: AnalyticsData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Analytics Report - ${data.timePeriod}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      color: #1a1a1a;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 10px;
    }
    h2 {
      color: #3b82f6;
      margin-top: 30px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f3f4f6;
      font-weight: bold;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .metric-card {
      border: 1px solid #e5e7eb;
      padding: 15px;
      border-radius: 8px;
    }
    .metric-label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #1a1a1a;
    }
    .metric-change {
      font-size: 12px;
      color: #10b981;
      margin-top: 5px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    @media print {
      body {
        margin: 20px;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <h1>Analytics Report</h1>
  <p><strong>Period:</strong> ${data.timePeriod}</p>
  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  
  <h2>Key Metrics</h2>
  <div class="metric-grid">
    <div class="metric-card">
      <div class="metric-label">Total Complaints</div>
      <div class="metric-value">${data.keyMetrics.totalComplaints}</div>
      <div class="metric-change">${data.keyMetrics.totalChange} from last period</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Avg Response Time</div>
      <div class="metric-value">${data.keyMetrics.avgResponseTime}</div>
      <div class="metric-change">${data.keyMetrics.responseTimeChange} improvement</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Resolution Rate</div>
      <div class="metric-value">${data.keyMetrics.resolutionRate}%</div>
      <div class="metric-change">${data.keyMetrics.resolutionRateChange} from last period</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Satisfaction Rating</div>
      <div class="metric-value">${data.keyMetrics.satisfactionRating}/5.0</div>
      <div class="metric-change">${data.keyMetrics.satisfactionChange} from last period</div>
    </div>
  </div>
  
  <h2>Complaints by Status</h2>
  <table>
    <thead>
      <tr>
        <th>Status</th>
        <th>Count</th>
        <th>Percentage</th>
      </tr>
    </thead>
    <tbody>
      ${data.complaintsByStatus
        .map(
          (item) => `
        <tr>
          <td>${item.status}</td>
          <td>${item.count}</td>
          <td>${item.percentage}%</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
  
  <h2>Complaints by Category</h2>
  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th>Count</th>
        <th>Percentage</th>
      </tr>
    </thead>
    <tbody>
      ${data.complaintsByCategory
        .map(
          (item) => `
        <tr>
          <td>${item.category}</td>
          <td>${item.count}</td>
          <td>${item.percentage}%</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
  
  <h2>Complaints by Priority</h2>
  <table>
    <thead>
      <tr>
        <th>Priority</th>
        <th>Count</th>
        <th>Percentage</th>
      </tr>
    </thead>
    <tbody>
      ${data.complaintsByPriority
        .map(
          (item) => `
        <tr>
          <td>${item.priority}</td>
          <td>${item.count}</td>
          <td>${item.percentage}%</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
  
  <h2>Lecturer Performance</h2>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Complaints Handled</th>
        <th>Avg Response Time</th>
        <th>Resolution Rate</th>
        <th>Satisfaction Rating</th>
      </tr>
    </thead>
    <tbody>
      ${data.lecturerPerformance
        .map(
          (lecturer) => `
        <tr>
          <td>${lecturer.name}</td>
          <td>${lecturer.complaintsHandled}</td>
          <td>${lecturer.avgResponseTime}</td>
          <td>${lecturer.resolutionRate}%</td>
          <td>${lecturer.satisfactionRating}/5.0</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
  
  <h2>Top Complaint Types</h2>
  <table>
    <thead>
      <tr>
        <th>Type</th>
        <th>Count</th>
      </tr>
    </thead>
    <tbody>
      ${data.topComplaintTypes
        .map(
          (item) => `
        <tr>
          <td>${item.type}</td>
          <td>${item.count}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
  
  <div class="footer">
    <p>Student Complaint Resolution System - Analytics Report</p>
    <p>This report was automatically generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;
}
