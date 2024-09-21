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
        bankName,modeOfPayment, aadharNumber, panNumber, pfNumber, basicSalary, hra, specialAllowance, ltc, tds
    } = req.query;

    // Calculate totals
    const totalEarnings = parseFloat(basicSalary) + parseFloat(hra) + parseFloat(specialAllowance) + parseFloat(ltc);
    const totalDeductions = parseFloat(tds);
    const grossSalary = totalEarnings;
    const netSalary = totalEarnings - totalDeductions;

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();


    // Generate the HTML content dynamically
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Salary Slip PDF</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f9f9f9;
        }

        .salary-slip {
            max-width: 800px;
            margin: 20px auto;
            background-color: white;
            padding: 20px;
            border: 1px solid #000;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        h1, h2 {
            text-align: center;
            color: #333;
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        table th, table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            font-size: 14px;
        }

        .salary-summary {
            text-align: center;
            margin-bottom: 20px;
            font-size: 16px;
        }

        .footer-note {
            text-align: center;
            font-size: 12px;
            color: #555;
        }

        .logo {
            width: 100px; /* Adjust the width as needed */
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="salary-slip">
        <img src="./public/images/logo.png" alt="Company Logo" class="logo" />
        <h1>RAJ CORPORATION LTD.</h1>
        <h2>SALARY SLIP FOR THE MONTH: ${salaryMonth}</h2>
        <table>
            <tr><td><strong>EMP NAME :</strong> ${empName}</td><td><strong>FAR./HUS. NAME :</strong> ${fatherHusName}</td></tr>
            <tr><td><strong>EMP CODE:</strong>${empCode}</td><td><strong>Date of Joining:</strong> ${doj}</td></tr>
            <tr><td><strong>DESIGNATION :</strong> ${designation}</td><td><strong>BRANCH/SITE :</strong> ${branch}</td></tr>
            <tr><td><strong>DEPARTMENT :</strong> ${department}</td><td><strong>Pay Mode :</strong>${modeOfPayment} </td></tr>
            <tr><td><strong>BANK NAME :</strong> ${bankName}</td><td><strong>PF NO :</strong>${pfNumber} </td></tr>
            <tr><td><strong>ACCOUNT NUMBER :</strong> ${accountNumber}</td><td><strong>IFSC Code :</strong>${ifscCode} </td></tr>
            <tr><td><strong>ADHAAR No :</strong> ${aadharNumber}</td><td><strong>PAN NO :</strong> ${panNumber}</td></tr>
        </table>

        <table class="earnings-deductions">
            <tr><th>EARNINGS</th><th>DEDUCTIONS</th></tr>
            <tr><td>BASIC: ${basicSalary}</td><td>TDS: ${tds}</td></tr>
            <tr><td>HRA: ${hra}</td><td>ADVANCE: 0</td></tr>
            <tr><td>SPECIAL ALLOWANCE: ${specialAllowance}</td><td></td></tr>
            <tr><td>LTC: ${ltc}</td><td></td></tr>
            <tr><td><strong>TOTAL EARNINGS: ${totalEarnings.toFixed(2)}</strong></td><td><strong>TOTAL DEDUCTIONS: ${totalDeductions.toFixed(2)}</strong></td></tr>
        </table>

        <div class="salary-summary">
            <p><strong>GROSS SALARY :</strong> ${grossSalary.toFixed(2)}</p>
            <p><strong>NET SALARY :</strong> ${netSalary.toFixed(2)}</p>
        </div>

        <p class="footer-note">This is a computer-generated pay slip and does not require any signature.</p>
    </div>
</body>
</html>
`;

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
