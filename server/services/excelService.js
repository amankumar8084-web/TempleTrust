import ExcelJS from 'exceljs';

export const exportDonationsToExcel = async (donations) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Donations');

  // Define Columns
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Donor Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount (INR)', key: 'amount', width: 15 },
    { header: 'PAN Card', key: 'pan', width: 15 },
    { header: 'Anonymous', key: 'anonymous', width: 12 }
  ];

  // Header Styling (Saffron Amber Header)
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { name: 'Arial', family: 4, size: 11, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D97706' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Add Data Rows
  donations.forEach(donation => {
    worksheet.addRow({
      date: new Date(donation.createdAt).toLocaleDateString(),
      name: donation.anonymous ? 'Anonymous' : donation.donorName,
      email: donation.anonymous ? 'N/A' : donation.donorEmail,
      phone: donation.anonymous ? 'N/A' : donation.donorPhone,
      category: donation.category,
      amount: donation.amount,
      pan: donation.panCard || 'N/A',
      anonymous: donation.anonymous ? 'Yes' : 'No'
    });
  });

  // Write to Buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};
