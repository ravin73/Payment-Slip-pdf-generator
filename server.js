const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(__dirname));

// Strings for ones, teens, and tens places
var one = [ "", "one ", "two ", "three ", "four ", "five ", "six ", "seven ", "eight ", "nine ", "ten ", "eleven ", "twelve ", "thirteen ", "fourteen ", "fifteen ", "sixteen ", "seventeen ", "eighteen ", "nineteen "];
var ten = [ "", "", "twenty ", "thirty ", "forty ", "fifty ", "sixty ", "seventy ", "eighty ", "ninety "];

// Function to convert a 1- or 2-digit number into words
function numToWords(n, s) {
    var str = "";
    if (n > 19) {
        str += ten[parseInt(n / 10)] + one[n % 10];
    } else {
        str += one[n];
    }
    if (n != 0) {
        str += s;
    }
    return str;
}

// Function to convert any number to words in Indian numbering system
function convertToWords(n) {
    var out = "";
    out += numToWords(parseInt(n / 10000000), "crore ");
    out += numToWords(parseInt((n / 100000) % 100), "lakh ");
    out += numToWords(parseInt((n / 1000) % 100), "thousand ");
    out += numToWords(parseInt((n / 100) % 10), "hundred ");
    if (n > 100 && n % 100 > 0) {
        out += "and ";
    }
    out += numToWords(n % 100, "");
    return out.trim() + " rupees only";
}

// Route to generate the PDF
app.get('/generate-pdf', async (req, res) => {
    const {
        salaryMonth, empName, empCode, accountNumber, ifscCode, fatherHusName, designation, department, branch, doj,
        bankName, modeOfPayment, aadharNumber, panNumber, pfNumber, uanNumber, basicSalary, hra, specialAllowance, ltc, tds, advance,
        monthDays, lopDays, payDays, leaveOpb, leaveTaken, leaveCls
    } = req.query;

    // Calculate totals
    const totalEarnings = parseFloat(basicSalary) + parseFloat(hra) + parseFloat(specialAllowance) + parseFloat(ltc);
    const totalDeductions = parseFloat(tds) + parseFloat(advance);
    const grossSalary = totalEarnings;
    const netSalary = totalEarnings - totalDeductions;

    // Convert net salary to words
    const netSalaryInWords = convertToWords(netSalary);

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
    <title>Salary Slip</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }

        .salary-slip {
            width: 800px;
            margin: 20px auto;
            padding: 20px;
            border: 2px solid #ddd;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }

        .logo {
            width: 100px;
            margin-bottom: 20px;
            display: block;
            margin: 0 auto;
        }

        h1, h2 {
            text-align: center;
            margin: 5px;
        }

        h1 {
            font-size: 24px;
            color: #333;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        h2 {
            font-size: 18px;
            color: #555;
        }

        table {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }

        table th, table td {
            padding: 10px;
            text-align: left;
            font-size: 12px;
            border: 1px solid #ddd;
        }

        table th {
            background-color: #f2f2f2;
            font-weight: bold;
        }

        table tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .centered-th {
            text-align: center;
        }

        .salary-summary {
            text-align: center;
            margin-top: 20px;
        }

        .net-salary {
            background-color: #4CAF50;
            color: white;
            padding: 10px;
            border-radius: 4px;
            display: inline-block;
            font-weight: bold;
            font-size: 16px;
        }

        .gross-salary {
            background-color: #ddd;
            padding: 10px;
            border-radius: 4px;
            display: inline-block;
            font-weight: bold;
            font-size: 14px;
        }

        .salary-in-words {
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            color: #333;
        }

        .footer-note {
            font-size: 10px;
            text-align: center;
            margin-top: 30px;
            color: #888;
        }

        .footer-bar {
            background-color: #4CAF50;
            color: white;
            padding: 5px;
            text-align: center;
            border-radius: 4px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="salary-slip">
        <!-- Company Logo -->
        <img src="http://localhost:5000/public/images/logo.png" alt="Company Logo" class="logo" />
        <!-- Company Name -->
        <h1>RAJ CORPORATION LTD.</h1>
        <!-- Salary Month -->
        <h2>SALARY SLIP FOR THE MONTH: ${salaryMonth}</h2>

        <!-- Employee Details -->
        <table>
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
            <tr>
                <td><strong>UAN No:</strong> ${uanNumber}</td>
            </tr>
        </table>

        <!-- Attendance & Pay Days -->
        <table>
            <tr>
                <td><strong>MONTH DAYS:</strong> ${monthDays}</td>
                <td><strong>LOP DAYS:</strong> ${lopDays}</td>
                <td><strong>PAY DAYS:</strong> ${payDays}</td>
            </tr>
        </table>

        <!-- Earnings and Deductions -->
        <table class="earnings-deductions">
            <tr>
                <th class="centered-th">EARNINGS</th>
                <th class="centered-th">DEDUCTIONS</th>
            </tr>
            <tr>
                <td>BASIC: ${basicSalary}</td>
                <td>TDS: ${tds}</td>
            </tr>
            <tr>
                <td>HRA: ${hra}</td>
                <td>ADVANCE: ${advance}</td>
            </tr>
            <tr>
                <td>SPECIAL ALLOWANCE: ${specialAllowance}</td>
            </tr>
            <tr>
                <td>LTC: ${ltc}</td>
            </tr>
            <tr>
                <td><strong>TOTAL EARNINGS:</strong> ${totalEarnings.toFixed(2)}</td>
                <td><strong>TOTAL DEDUCTIONS:</strong> ${totalDeductions.toFixed(2)}</td>
            </tr>
        </table>

        <!-- Leave Summary -->
        <table>
            <tr>
                <td><strong>LEAVE OPB:</strong> ${leaveOpb}</td>
                <td><strong>LEAVE TAKEN:</strong> ${leaveTaken}</td>
                <td><strong>LEAVE CLS:</strong> ${leaveCls}</td>
            </tr>
        </table>

        <!-- Gross Salary and Net Salary -->
        <div class="salary-summary">
            <div class="gross-salary">GROSS SALARY: ${grossSalary.toFixed(2)}</div>
            <br />
            <div class="net-salary">NET SALARY: ${netSalary.toFixed(2)}</div>
        </div>

        <!-- Net Salary in Words -->
        <div class="salary-in-words">
            <p><strong>Net Salary (in words):</strong> ${netSalaryInWords}</p>
        </div>

        <!-- Footer Note -->
        <p class="footer-note">This is a computer-generated pay slip and does not require any signature.</p>
        <div class="footer-bar">
            Salary Slip generated by Raj Corporation Ltd.
        </div>
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
