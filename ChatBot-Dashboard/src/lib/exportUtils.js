/**
 * Data export utilities for Campus Mitra Admin Panel
 */

export function downloadCSV(filename, headers, rows) {
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(filename, data) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".json") ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printExecutiveReport({
  title = "Executive Admissions & Counseling Telemetry Report",
  kpis = {},
  branchDemand = [],
  generatedBy = "Admin",
}) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to view and print the executive summary report.");
    return;
  }

  const currentDate = new Date().toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const branchRowsHtml = branchDemand.length
    ? branchDemand
        .map(
          (b) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${b.name || b.branch_name}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${b.count || b.student_count || b.Queries || 0}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${b.type || "Sandwich Pattern"}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${b.cutoff || "85% - 95%"}</td>
        </tr>
      `
        )
        .join("")
    : `<tr><td colspan="4" style="padding: 12px; text-align: center; color: #64748b;">No branch records logged yet.</td></tr>`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - SVKM's SBMP</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            padding: 40px;
            margin: 0;
            background: #fff;
          }
          .header {
            border-bottom: 2px solid #ea580c;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .brand {
            font-size: 20px;
            font-weight: 800;
            color: #ea580c;
            letter-spacing: -0.02em;
          }
          .inst {
            font-size: 14px;
            color: #475569;
            margin-top: 4px;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #64748b;
            margin-top: 12px;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 30px;
          }
          .kpi-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px;
            background: #f8fafc;
          }
          .kpi-label {
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            color: #64748b;
          }
          .kpi-value {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-top: 12px;
          }
          th {
            background: #f1f5f9;
            color: #334155;
            padding: 10px 12px;
            text-align: left;
            font-weight: 700;
            border-bottom: 2px solid #cbd5e1;
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            margin-top: 24px;
            color: #1e293b;
          }
          .footer-note {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
          }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">Campus Mitra • AI Admissions Advisory System</div>
          <div class="inst">SVKM's Shri Bhagubhai Mafatlal Polytechnic (Autonomous MSBTE) • DTE Code: 3010</div>
          <div class="meta-row">
            <span><strong>Report:</strong> ${title}</span>
            <span><strong>Generated:</strong> ${currentDate}</span>
            <span><strong>Officer:</strong> ${generatedBy}</span>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Registered Candidates</div>
            <div class="kpi-value">${kpis.totalStudents ?? 0}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Admissions Processed</div>
            <div class="kpi-value">${kpis.totalApplications ?? 0}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Queries Handled</div>
            <div class="kpi-value">${kpis.totalQueries ?? 0}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Satisfaction Rating</div>
            <div class="kpi-value">${kpis.averageRating ? `${kpis.averageRating} ★` : "5.0 ★"}</div>
          </div>
        </div>

        <div class="section-title">Autonomous Diploma Branch Demand & Cutoff Distribution</div>
        <table>
          <thead>
            <tr>
              <th>Branch Discipline</th>
              <th style="text-align: center;">Inquiries / Candidates</th>
              <th style="text-align: center;">Pattern</th>
              <th style="text-align: center;">Cutoff Range</th>
            </tr>
          </thead>
          <tbody>
            ${branchRowsHtml}
          </tbody>
        </table>

        <div class="footer-note">
          <span>Final Year Project 2026 • SVKM's SBMP Computer Engineering</span>
          <span>Official Institutional Record • Confidential</span>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
