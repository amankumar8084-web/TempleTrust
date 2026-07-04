import PDFDocument from 'pdfkit';

export const generateDonationReceiptPDF = (donation, transaction, receiptNumber) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', (err) => {
      reject(err);
    });

    // Color Palette (Saffron & Gold)
    const primaryColor = '#D97706'; // Saffron HSL-ish amber
    const secondaryColor = '#B45309'; // Dark saffron/gold
    const textColor = '#1F2937'; // Slate 800

    // Header Branding
    doc.fillColor(primaryColor)
       .fontSize(24)
       .text('BrahamBaba Devotee Trust', { align: 'center', underline: true })
       .fontSize(10)
       .fillColor('#4B5563')
       .text('Spiritual Valley, Highway 2, Jaipur, Rajasthan - 302001', { align: 'center' })
       .text('Email: donations@brahambaba.org | Phone: +91-9876543210', { align: 'center' });

    doc.moveDown(1.5);

    // Title
    doc.fillColor(secondaryColor)
       .fontSize(16)
       .text('DONATION RECEIPT', { align: 'center', wordSpacing: 2 });
       
    doc.moveDown(1);

    // Line separator
    doc.strokeColor('#E5E7EB')
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .stroke();

    doc.moveDown(1);

    // Receipt details table layout
    const startY = doc.y;
    doc.fillColor(textColor).fontSize(10);

    // Left Column
    doc.text(`Receipt Number: ${receiptNumber}`, 50, startY)
       .text(`Date: ${new Date(donation.createdAt).toLocaleDateString()}`, 50, startY + 20)
       .text(`Transaction ID: ${transaction?.razorpayPaymentId || 'N/A (Mock/UPI)'}`, 50, startY + 40)
       .text(`Payment Method: ${transaction?.gateway || 'Razorpay'}`, 50, startY + 60);

    // Right Column
    doc.text(`Donor Name: ${donation.donorName}`, 320, startY)
       .text(`Donor Email: ${donation.donorEmail}`, 320, startY + 20)
       .text(`Donor Phone: ${donation.donorPhone}`, 320, startY + 40)
       .text(`PAN Card: ${donation.panCard || 'Not Provided'}`, 320, startY + 60);

    doc.moveDown(4.5);

    // Line separator
    doc.strokeColor('#E5E7EB')
       .moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .stroke();

    doc.moveDown(1.5);

    // Table Header
    const tableY = doc.y;
    doc.rect(50, tableY, 495, 20).fill('#FEF3C7'); // light amber bg
    doc.fillColor(secondaryColor).fontSize(10).font('Helvetica-Bold');
    doc.text('Donation Category', 60, tableY + 5);
    doc.text('Amount (INR)', 430, tableY + 5);

    // Table Row
    const rowY = tableY + 25;
    doc.fillColor(textColor).font('Helvetica');
    doc.text(`${donation.category} Donation`, 60, rowY);
    doc.text(`Rs. ${donation.amount.toFixed(2)}`, 430, rowY);

    doc.moveDown(3);

    // Line separator
    doc.strokeColor('#D97706')
       .lineWidth(1.5)
       .moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .stroke();

    doc.moveDown(1.5);

    // Footer Tax Rebate & Signature
    doc.fontSize(8)
       .fillColor('#6B7280')
       .text('* Donations to BrahamBaba Devotee Trust are exempt under Section 80G of the Income Tax Act.', 50, doc.y, { width: 350 });

    doc.fontSize(10)
       .fillColor(textColor)
       .font('Helvetica-Bold')
       .text('Authorized Signatory', 400, doc.y - 10, { align: 'right' })
       .fontSize(8)
       .font('Helvetica')
       .text('BrahamBaba Devotee Trust', 400, doc.y, { align: 'right' });

    // End Document
    doc.end();
  });
};
