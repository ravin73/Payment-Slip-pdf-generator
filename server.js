const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const app = express();


// Serve static files
app.use(express.static(__dirname));

// Route to generate the PDF
app.get('/generate-pdf', async (req, res) => {
    const {
        salaryMonth, empName,empCode,accountNumber,ifscCode, fatherHusName, designation,department, branch,doj,
        bankName,modeOfPayment, aadharNumber, panNumber, pfNumber, basicSalary, hra, specialAllowance, ltc, tds,
        monthDays, lopDays, payDays, leaveOpb, leaveTaken, leaveCls
    } = req.query;

    // Calculate totals
    const totalEarnings = parseFloat(basicSalary) + parseFloat(hra) + parseFloat(specialAllowance) + parseFloat(ltc);
    const totalDeductions = parseFloat(tds);
    const grossSalary = totalEarnings;
    const netSalary = totalEarnings - totalDeductions;

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

   // const logopath=path.join(__dirname,'public/images/logo.png');
    // Generate the HTML content dynamically
const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Salary Slip</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      .salary-slip {
        width: 800px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #000;
      }
      .logo {
        width: 100px;
        margin-bottom: 20px;
      }
      h1 {
        text-align: center;
        font-size: 20px;
        text-transform: uppercase;
        margin-bottom: 5px;
      }
      h2 {
        text-align: center;
        font-size: 16px;
        margin-bottom: 20px;
      }
      table {
        width: 100%;
        margin-bottom: 20px;
        border-collapse: collapse;
      }
      table th, table td {
        border: 1px solid #000;
        padding: 5px;
        text-align: left;
        font-size: 12px;
      }
      table th {
        background-color: #f2f2f2;
      }
      .centered-th {
        text-align: center;
        font-weight: bold;
      }
      .earnings-deductions td.left-align {
        text-align: left;
        padding-left: 10px;
      }
      .earnings-deductions th, .earnings-deductions td {
        width: 50%;
      }
      .earnings-deductions td.right-align {
        text-align: right;
        padding-right: 10px;
      }
      .salary-summary p {
        font-size: 14px;
        font-weight: bold;
      }
      .footer-note {
        font-size: 10px;
        text-align: center;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="salary-slip">
      <img src="http://localhost:5000/public/images/logo.png" alt="Company Logo" class="logo" />
      <h1>RAJ CORPORATION LTD.</h1>
      <h2>SALARY SLIP FOR THE MONTH: ${salaryMonth}</h2>

      <table>
        <!-- Employee Info -->
        <tr>
          <td><strong>EMP NAME:</strong> ${empName}</td>
          <td><strong>FAR./HUS. NAME:</strong> ${fatherHusName}</td>
        </tr>
        <tr>
          <td><strong>EMP CODE:</strong> ${empCode}</td>
          <td><strong>DESIGNATION:</strong> ${designation}</td>
        </tr>
        <tr>
          <td><strong>DEPARTMENT:</strong> ${department}</td>
          <td><strong>BRANCH/SITE:</strong> ${branch}</td>
        </tr>
        <tr>
          <td><strong>Date of Joining:</strong> ${doj}</td>
          <td><strong>Pay Mode:</strong> ${modeOfPayment}</td>
        </tr>
        <tr>
          <td><strong>BANK NAME:</strong> ${bankName}</td>
          <td><strong>ACCOUNT NO:</strong> ${accountNumber}</td>
        </tr>
        <tr>
          <td><strong>IFSC CODE:</strong> ${ifscCode}</td>
          <td><strong>PF NO:</strong> ${pfNumber}</td>
        </tr>
        <tr>
          <td><strong>ADHAAR No:</strong> ${aadharNumber}</td>
          <td><strong>PAN NO:</strong> ${panNumber}</td>
        </tr>
      </table>

      <!-- New fields added -->
      <table>
        <tr>
          <td><strong>MONTH DAYS:</strong> ${monthDays}</td>
          <td><strong>LOP DAYS:</strong> ${lopDays}</td>
        </tr>
        <tr>
          <td><strong>PAY DAYS:</strong> ${payDays}</td>
        </tr>
      </table>

      <!-- Earnings and Deductions Section -->
      <table class="earnings-deductions">
        <tr>
          <th class="centered-th">EARNINGS</th>
          <th class="centered-th">DEDUCTIONS</th>
        </tr>
        <tr>
          <td class="left-align">BASIC: ${basicSalary}</td>
          <td class="right-align">TDS: ${tds}</td>
        </tr>
        <tr>
          <td class="left-align">HRA: ${hra}</td>
          <td></td>
        </tr>
        <tr>
          <td class="left-align">SPECIAL ALLOWANCE: ${specialAllowance}</td>
          <td></td>
        </tr>
        <tr>
          <td class="left-align">LTC: ${ltc}</td>
          <td></td>
        </tr>
        <tr>
          <td class="left-align"><strong>TOTAL EARNINGS:</strong> ${totalEarnings.toFixed(2)}</td>
          <td class="right-align"><strong>TOTAL DEDUCTIONS:</strong> ${totalDeductions.toFixed(2)}</td>
        </tr>
      </table>

      <!-- Leave details -->
      <table>
        <tr>
          <td><strong>LEAVE OPB:</strong> ${leaveOpb}</td>
          <td><strong>LEAVE TAKEN:</strong> ${leaveTaken}</td>
          <td><strong>LEAVE CLS:</strong> ${leaveCls}</td>
        </tr>
      </table>

      <div class="salary-summary">
        <p><strong>GROSS SALARY:</strong> ${grossSalary.toFixed(2)}</p>
        <p><strong>NET SALARY:</strong> ${netSalary.toFixed(2)}</p>
      </div>

      <p class="footer-note">This is a computer-generated pay slip and does not require any signature.</p>
    </div>
  </body>
  </html>
  `
;

   await page.setContent(htmlContent);

    
    // Generate PDF from the HTML content
    await page.pdf({ path: 'salary_slip.pdf', format: 'A4', printBackground: true });
    
    await browser.close();

    // Send PDF as download
    res.download(path.join(__dirname, 'salary_slip.pdf'));
});

// Start the server
app.listen(5000, () => {
    console.log('Server running at http://localhost:5000');
});
