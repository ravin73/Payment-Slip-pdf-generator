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
        salaryMonth, empName,payDate, empCode, accountNumber, ifscCode, fatherHusName, designation, department, branch, doj,
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
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }

        .salary-slip {
            width: 850px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border: 1px solid #ddd;
        }

        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .header-section .company-info {
            text-align: left;
        }

        .header-section .company-info h1 {
            font-size: 22px;
            color: #333;
            margin: 0;
        }

        .header-section .company-info p {
            font-size: 12px;
            color: #666;
            margin: 2px 0;
        }

        .header-section .payslip-info {
            text-align: right;
        }

        .header-section .payslip-info h3 {
            margin: 0;
            font-size: 16px;
            color: #333;
        }

        .header-section .payslip-info p {
            font-size: 12px;
            color: #666;
        }

        .employee-summary {
            margin-bottom: 20px;
        }

        .employee-summary table {
            width: 100%;
            border-collapse: collapse;
        }

        .employee-summary th, .employee-summary td {
            padding: 8px;
            text-align: left;
            font-size: 12px;
            color: #333;
        }

        .employee-summary th {
            background-color: #f2f2f2;
            font-weight: normal;
        }

        .net-pay-box {
            background-color: #e8f5e9;
            border: 1px solid #c8e6c9;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 20px;
        }

        .net-pay-box .net-pay {
            font-size: 24px;
            font-weight: bold;
            color: #388e3c;
        }

        .net-pay-box .pay-summary {
            display: flex;
            justify-content: space-around;
            margin-top: 10px;
        }

        .pay-summary div {
            font-size: 14px;
            color: #666;
        }

        .earnings-deductions {
            margin-bottom: 20px;
        }

        .earnings-deductions table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .earnings-deductions th, .earnings-deductions td {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: left;
            font-size: 12px;
        }

        .earnings-deductions th {
            background-color: #f2f2f2;
        }

        .earnings-deductions td.amount {
            text-align: right;
        }

        .total-row td {
            font-weight: bold;
        }

        .total-row td.amount {
            color: #388e3c;
        }
        table {
            width: 100%;
            margin-bottom: 16px;
            border-collapse:separate
        }

        .footer-note {
            text-align: center;
            font-size: 10px;
            color: #888;
            margin-top: 30px;
        }

        .footer-bar {
            background-color: #4CAF50;
            color: white;
            padding: 5px;
            text-align: center;
            border-radius: 4px;
            margin-top: 20px;
            font-size: 12px;
        }

          .salary-in-words {
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            color: #333;
            text-transform: capitalize;
        }
    </style>
</head>
<body>
    <div class="salary-slip">
        <!-- Header Section -->
        <div class="header-section">
            <!-- Company Info -->
            <div class="company-info">
                <img src="http://localhost:5000/public/images/logo.png" alt="Company Logo" style="width: 100px; height: auto;">
                <h1>RAJ CORPORATION LTD.</h1>
                <p>CS-04, Block-F, Alpha II, Greater Noida-201310 (UP)</p>
                <p>B/O: RCL Compound, Station Road, Mainpuri-205001 (UP)</p>
            </div>

            <!-- Payslip Info -->
            <div class="payslip-info">
                <h3>Payslip For the Month</h3>
                <p><strong>${salaryMonth}</strong></p>
                <p>Pay Date: <strong>${payDate}</strong></p>
            </div>
        </div>

        <!-- Employee Summary -->
        <div class="employee-summary">
            <table>
                <tr>
                    <th>Employee Name:</th>
                    <td>${empName}</td>
                    <th>Employee ID:</th>
                    <td>${empCode}</td>
                </tr>
                <tr>
                    <th>Father/Husband Name:</th>
                    <td>${fatherHusName}</td>
                    <th>Designation</th>
                    <td>${designation}</td>
                </tr>
                <tr>
                    <th>Branch/Site:</th>
                    <td>${branch}</td>
                    <th>Department:</th>
                    <td>${department}</td>
                </tr>
                <tr>
                    <th>Date of Joining:</th>
                    <td>${doj}</td>
                    <th>Pay Mode:</th>
                    <td>${modeOfPayment}</td>
                </tr>
                <tr>
                    <th>Bank Name:</th>
                    <td>${bankName}</td>
                    <th>Account Number:</th>
                    <td>${accountNumber}</td>
                </tr>
                <tr>
                    <th>IFSC Code:</th>
                    <td>${ifscCode}</td>
                    <th>PF Number</th>
                    <td>${pfNumber}</td>

                </tr>
                <tr>
                    <th>Aadhar Number:</th>
                    <td>${aadharNumber}</td>
                    <th>PAN Number</th>
                    <td>${panNumber}</td>
                </tr>
                <tr>
                    <th>UAN Number</th>
                    <td> ${uanNumber}</td>
                </tr>
            </table>
        </div>

          <!-- Leave Summary -->
          <table>
            <tr>
                <td><strong>LEAVE OPB:</strong> ${leaveOpb}</td>
                <td><strong>LEAVE TAKEN:</strong> ${leaveTaken}</td>
                <td><strong>LEAVE CLS:</strong> ${leaveCls}</td>
            </tr>
        </table>

       

        <!-- Earnings and Deductions Section -->
        <div class="earnings-deductions">
            <table>
                <tr>
                    <th>Earnings</th>
                    <th class="amount">Amount</th>
                    <th>Deductions</th>
                    <th class="amount">Amount</th>
                </tr>
                <tr>
                    <td>Basic</td>
                    <td class="amount">Rs. ${basicSalary}</td>
                    <td>TDS</td>
                    <td class="amount">Rs. ${tds}</td>
                </tr>
                <tr>
                    <td>House Rent Allowance</td>
                    <td class="amount">Rs. ${hra}</td>
                    <td>ADVANCE:</td>
                    <td class="amount">Rs.  ${advance}</td>
                </tr>
                <tr>
                    <td>Special Allowance</td>
                    <td class="amount">Rs.  ${specialAllowance}</td>
                </tr>
                <tr>
                    <td>LTC</td>
                    <td class="amount">Rs.  ${ltc}</td>
                </tr>
                <tr></tr>
                <tr class="total-row">
                    <td>Gross Earnings</td>
                    <td class="amount">Rs. ${totalEarnings.toFixed(2)}</td>
                    <td>Total Deductions</td>
                    <td class="amount">Rs. ${totalDeductions.toFixed(2)}</td>
                </tr>
            </table>
        </div>
         <!-- Net Pay Section -->
         <div class="net-pay-box">
            <div class="net-pay">Rs. ${netSalary.toFixed(2)}</div>
            <div class="salary-in-words">
                <p><strong>Net Salary (in words): Rs. </strong> ${netSalaryInWords}</p>
            </div>
            <div>Employee Net Pay</div>
            <div class="pay-summary">
                <div>Paid Days: <strong>${payDays}</strong></div>
                <div>LOP Days: <strong>${lopDays}</strong></div>
                <div>Month Days:<strong>${payDays}</strong></div>
            </div>
        </div>
      

        <!-- Footer Note -->
        <p class="footer-note">This is a system-generated document and does not require any signature.</p>
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
// browser install chrome