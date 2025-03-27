const nodemailer = require('nodemailer');

// Create a transporter using Gmail's SMTP settings
const createTransporter = async () => {
  // For production, you would store these in environment variables
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'easytax20250325@gmail.com', // Replace with your Gmail
      pass: process.env.EMAIL_PASS || 'giuh lqbb gagp qewg', // Replace with your App Password
    },
  });
  
  return transporter;
};

// Send a tax reminder email
const sendTaxReminder = async (options) => {
  try {
    const { to, toName, salaryTax, businessTax, totalTax, monthYear } = options;
    
    // Create email transporter
    const transporter = await createTransporter();
    
    // Email HTML template
    const htmlContent = `
    <div style="font-family: system-ui, sans-serif, Arial; font-size: 14px; color: #333; padding: 20px 14px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: auto; background-color: #fff">
        <div style="text-align: center; background-color: #1976d2; padding: 14px">
          <span style="color: white; font-size: 24px; font-weight: bold;">Easy-Tax</span>
        </div>
        <div style="padding: 24px">
          <h1 style="font-size: 22px; margin-bottom: 26px">Monthly Tax Reminder - ${monthYear}</h1>
          <p>Hello ${toName},</p>
          <p>
            This is your monthly tax reminder from Easy-Tax. We're sending this to help you stay on top of your tax obligations for the current period.
          </p>
          
          <div style="background-color: #f8f9fa; border-radius: 6px; padding: 16px; margin: 20px 0; border: 1px solid #e0e0e0;">
            <h2 style="font-size: 18px; margin-top: 0; color: #1976d2;">Tax Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 50%;">Salary Taxes:</td>
                <td style="padding: 8px 0;">${salaryTax}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #eee;">Business Taxes:</td>
                <td style="padding: 8px 0; border-top: 1px solid #eee;">${businessTax}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #eee;">Total Tax Amount:</td>
                <td style="padding: 8px 0; border-top: 1px solid #eee; font-weight: bold; color: #d32f2f;">${totalTax}</td>
              </tr>
            </table>
          </div>
          
          <p>
            <strong>Please note:</strong> A detailed tax report is available in your Easy-Tax app. You can log in anytime to view your complete tax information.
          </p>
          
          <p>
            You can view and manage your tax information anytime by logging into your Easy-Tax account.
          </p>
          
          <p>Thank you for using Easy-Tax to manage your taxes.</p>
          
          <p>Best regards,<br />The Easy-Tax Team</p>
        </div>
      </div>
      <div style="max-width: 600px; margin: auto; padding-top: 20px;">
        <p style="color: #999; text-align: center; font-size: 12px;">
          The email was sent to ${to}<br />
          You received this email because you have set up tax reminders in Easy-Tax
        </p>
      </div>
    </div>
    `;
    
    // Email options
    const mailOptions = {
      from: '"Easy-Tax App" <easytax20250325@gmail.com>', // Use the same email as in auth
      to: to,
      subject: `Monthly Tax Reminder - ${monthYear}`,
      html: htmlContent,
      // For attachments, you could add:
      // attachments: [
      //   {
      //     filename: `tax-report-${monthYear}.pdf`,
      //     content: pdfBuffer,
      //     contentType: 'application/pdf'
      //   }
      // ]
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendTaxReminder
}; 