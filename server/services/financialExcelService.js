import ExcelJS from 'exceljs';

/**
 * Generate a formatted .xlsx workbook buffer from financial records.
 * Sheets: Transactions, Monthly Summary, Category Summary
 */
export const exportFinancialRecordsToExcel = async (records) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BrahamBaba Temple Trust';
    workbook.created = new Date();

    const headerStyle = {
        font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D97706' } },
        alignment: { vertical: 'middle', horizontal: 'center' },
        border: {
            top: { style: 'thin', color: { argb: 'B45309' } },
            bottom: { style: 'thin', color: { argb: 'B45309' } }
        }
    };

    // ── Sheet 1: Transactions ───────────────────────────────────────────────
    const txSheet = workbook.addWorksheet('Transactions');
    txSheet.columns = [
        { header: 'Date', key: 'date', width: 14 },
        { header: 'Type', key: 'type', width: 14 },
        { header: 'Category', key: 'category', width: 18 },
        { header: 'Person / Org', key: 'personOrOrg', width: 24 },
        { header: 'Payment Method', key: 'paymentMethod', width: 16 },
        { header: 'Amount (₹)', key: 'amount', width: 16 },
        { header: 'Reference No.', key: 'referenceNo', width: 18 },
        { header: 'Description', key: 'description', width: 30 }
    ];

    txSheet.getRow(1).eachCell((cell) => {
        Object.assign(cell, headerStyle);
    });

    let totalDonations = 0, totalRevenue = 0, totalExpenditure = 0;

    records.forEach(r => {
        txSheet.addRow({
            date: new Date(r.date).toLocaleDateString('en-IN'),
            type: r.type,
            category: r.category,
            personOrOrg: r.personOrOrg || '—',
            paymentMethod: r.paymentMethod,
            amount: r.amount,
            referenceNo: r.referenceNo || '—',
            description: r.description || '—'
        });
        if (r.type === 'Donation') totalDonations += r.amount;
        else if (r.type === 'Revenue') totalRevenue += r.amount;
        else if (r.type === 'Expenditure') totalExpenditure += r.amount;
    });

    // Totals row
    const totalsRow = txSheet.addRow({
        date: '', type: '', category: '', personOrOrg: '', paymentMethod: 'TOTAL',
        amount: totalDonations + totalRevenue - totalExpenditure,
        referenceNo: '', description: ''
    });
    totalsRow.eachCell((cell) => {
        cell.font = { bold: true };
    });

    // Currency formatting for amount column
    txSheet.getColumn('amount').numFmt = '#,##0.00';

    // ── Sheet 2: Monthly Summary ────────────────────────────────────────────
    const monthlyMap = {};
    records.forEach(r => {
        const d = new Date(r.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap[key]) monthlyMap[key] = { month: key, donations: 0, revenue: 0, expenditure: 0, count: 0 };
        monthlyMap[key].count++;
        if (r.type === 'Donation') monthlyMap[key].donations += r.amount;
        else if (r.type === 'Revenue') monthlyMap[key].revenue += r.amount;
        else if (r.type === 'Expenditure') monthlyMap[key].expenditure += r.amount;
    });

    const monthlySheet = workbook.addWorksheet('Monthly Summary');
    monthlySheet.columns = [
        { header: 'Month', key: 'month', width: 14 },
        { header: 'Transactions', key: 'count', width: 14 },
        { header: 'Donations (₹)', key: 'donations', width: 16 },
        { header: 'Revenue (₹)', key: 'revenue', width: 16 },
        { header: 'Expenditure (₹)', key: 'expenditure', width: 16 },
        { header: 'Net (₹)', key: 'net', width: 16 }
    ];
    monthlySheet.getRow(1).eachCell((cell) => {
        Object.assign(cell, headerStyle);
    });
    Object.values(monthlyMap).sort((a, b) => b.month.localeCompare(a.month)).forEach(m => {
        monthlySheet.addRow({ ...m, net: m.donations + m.revenue - m.expenditure });
    });
    ['donations', 'revenue', 'expenditure', 'net'].forEach(col => {
        monthlySheet.getColumn(col).numFmt = '#,##0.00';
    });

    // ── Sheet 3: Category Summary ───────────────────────────────────────────
    const catMap = {};
    records.forEach(r => {
        const key = `${r.type}|${r.category}`;
        if (!catMap[key]) catMap[key] = { type: r.type, category: r.category, totalAmount: 0, count: 0 };
        catMap[key].totalAmount += r.amount;
        catMap[key].count++;
    });

    const catSheet = workbook.addWorksheet('Category Summary');
    catSheet.columns = [
        { header: 'Type', key: 'type', width: 14 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Total Amount (₹)', key: 'totalAmount', width: 18 },
        { header: 'Transactions', key: 'count', width: 14 }
    ];
    catSheet.getRow(1).eachCell((cell) => {
        Object.assign(cell, headerStyle);
    });
    Object.values(catMap).sort((a, b) => a.type.localeCompare(b.type) || b.totalAmount - a.totalAmount).forEach(c => {
        catSheet.addRow(c);
    });
    catSheet.getColumn('totalAmount').numFmt = '#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};
