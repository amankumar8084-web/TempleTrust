import FinancialRecord from '../models/FinancialRecord.js';
import { exportFinancialRecordsToExcel } from '../services/financialExcelService.js';
import { BadRequestError, NotFoundError } from '../utils/customErrors.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Build filter query from request query params
// ─────────────────────────────────────────────────────────────────────────────
const buildFilterQuery = (query) => {
    const filter = {};

    if (query.type) {
        filter.type = query.type;
    }

    if (query.category) {
        filter.category = {
            $regex: query.category,
            $options: 'i'
        };
    }

    if (query.paymentMethod) {
        filter.paymentMethod = query.paymentMethod;
    }

    // Date filters
    if (query.month && query.year) {
        const month = parseInt(query.month) - 1;
        const year = parseInt(query.year);

        filter.date = {
            $gte: new Date(year, month, 1),
            $lt: new Date(year, month + 1, 1)
        };
    } else if (query.year) {
        const year = parseInt(query.year);

        filter.date = {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1)
        };
    }

    if (query.startDate || query.endDate) {
        filter.date = filter.date || {};

        if (query.startDate) {
            filter.date.$gte = new Date(query.startDate);
        }

        if (query.endDate) {
            filter.date.$lte = new Date(
                query.endDate + 'T23:59:59.999Z'
            );
        }
    }

    // Search
    if (query.search) {
        const searchRegex = {
            $regex: query.search,
            $options: 'i'
        };

        filter.$or = [
            { personOrOrg: searchRegex },
            { category: searchRegex },
            { description: searchRegex },
            { expenseDetails: searchRegex },
            { referenceNo: searchRegex }
        ];
    }

    return filter;
};


// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Create financial record
// ─────────────────────────────────────────────────────────────────────────────
export const createFinancialRecord = async (req, res, next) => {
    try {
        const {
            type,
            amount,
            date,
            category,
            paymentMethod,
            personOrOrg,
            referenceNo,
            description,
            expenseDetails,
            receiptUrl
        } = req.body;

        if (!type || amount == null || !date || !category) {
            return next(
                new BadRequestError(
                    'Type, amount, date, and category are required.'
                )
            );
        }

        // Receipt/details are primarily meaningful for expenditure.
        const finalExpenseDetails =
            type === 'Expenditure' ? expenseDetails : '';

        const finalReceiptUrl =
            type === 'Expenditure' ? receiptUrl : '';

        const record = await FinancialRecord.create({
            type,
            amount,
            date,
            category,
            paymentMethod,
            personOrOrg,
            referenceNo,
            description,
            expenseDetails: finalExpenseDetails,
            receiptUrl: finalReceiptUrl,
            createdBy: req.user._id,
            updatedBy: req.user._id
        });

        res.status(201).json({
            status: 'success',
            data: record
        });
    } catch (error) {
        next(error);
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Get financial records
// ─────────────────────────────────────────────────────────────────────────────
export const getFinancialRecords = async (req, res, next) => {
    try {
        const filter = buildFilterQuery(req.query);

        const page = Math.max(
            1,
            parseInt(req.query.page) || 1
        );

        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit) || 20)
        );

        const allowedSortFields = [
            'date',
            'type',
            'category',
            'personOrOrg',
            'paymentMethod',
            'amount',
            'referenceNo'
        ];

        const sortBy = allowedSortFields.includes(req.query.sortBy)
            ? req.query.sortBy
            : 'date';

        const sortOrder =
            req.query.sortOrder === 'asc' ? 1 : -1;

        const [records, total] = await Promise.all([
            FinancialRecord.find(filter)
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('createdBy', 'name')
                .populate('updatedBy', 'name')
                .lean(),

            FinancialRecord.countDocuments(filter)
        ]);

        res.status(200).json({
            status: 'success',
            data: records,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Financial summary
// ─────────────────────────────────────────────────────────────────────────────
export const getFinancialSummary = async (req, res, next) => {
    try {
        const filter = buildFilterQuery(req.query);

        // ─────────────────────────────────────────────
        // Total financial values
        // ─────────────────────────────────────────────
        const typeTotals = await FinancialRecord.aggregate([
            {
                $match: filter
            },
            {
                $group: {
                    _id: '$type',
                    total: {
                        $sum: '$amount'
                    },
                    count: {
                        $sum: 1
                    }
                }
            }
        ]);

        let totalDonations = 0;
        let totalRevenue = 0;
        let totalExpenditure = 0;

        typeTotals.forEach((item) => {
            if (item._id === 'Donation') {
                totalDonations = item.total;
            }

            if (item._id === 'Revenue') {
                totalRevenue = item.total;
            }

            if (item._id === 'Expenditure') {
                totalExpenditure = item.total;
            }
        });

        // ─────────────────────────────────────────────
        // Net balance
        // ─────────────────────────────────────────────
        const netBalance =
            totalDonations +
            totalRevenue -
            totalExpenditure;


        // ─────────────────────────────────────────────
        // Monthly data
        // ─────────────────────────────────────────────
        const monthlyData = await FinancialRecord.aggregate([
            {
                $match: filter
            },
            {
                $group: {
                    _id: {
                        year: {
                            $year: '$date'
                        },
                        month: {
                            $month: '$date'
                        },
                        type: '$type'
                    },
                    total: {
                        $sum: '$amount'
                    }
                }
            },
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1
                }
            }
        ]);

        const monthlyMap = {};

        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ];

        monthlyData.forEach((item) => {
            const key =
                `${monthNames[item._id.month - 1]} ${item._id.year}`;

            if (!monthlyMap[key]) {
                monthlyMap[key] = {
                    name: key,
                    income: 0,
                    expenditure: 0,
                    donations: 0,
                    revenue: 0
                };
            }

            if (item._id.type === 'Donation') {
                monthlyMap[key].income += item.total;
                monthlyMap[key].donations += item.total;
            }

            if (item._id.type === 'Revenue') {
                monthlyMap[key].income += item.total;
                monthlyMap[key].revenue += item.total;
            }

            if (item._id.type === 'Expenditure') {
                monthlyMap[key].expenditure += item.total;
            }
        });


        // ─────────────────────────────────────────────
        // Expenditure by category
        // ─────────────────────────────────────────────
        const categoryData = await FinancialRecord.aggregate([
            {
                $match: {
                    ...filter,
                    type: 'Expenditure'
                }
            },
            {
                $group: {
                    _id: '$category',
                    value: {
                        $sum: '$amount'
                    }
                },
            },
            {
                $sort: {
                    value: -1
                }
            }
        ]);


        // ─────────────────────────────────────────────
        // Expenditure detailed breakdown
        // ─────────────────────────────────────────────
        const expenditureDetails = await FinancialRecord.find({
            ...filter,
            type: 'Expenditure'
        })
            .select(
                'amount date category paymentMethod personOrOrg referenceNo description expenseDetails receiptUrl'
            )
            .sort({
                date: -1
            })
            .limit(20)
            .lean();


        res.status(200).json({
            status: 'success',

            data: {
                totalDonations,
                totalRevenue,
                totalExpenditure,

                // Important:
                // Donations + Revenue - Expenditure
                netBalance,

                monthlyData: Object.values(monthlyMap),

                categoryData: categoryData.map((item) => ({
                    name: item._id,
                    value: item.value
                })),

                expenditureDetails
            }
        });

    } catch (error) {
        next(error);
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Update financial record
// ─────────────────────────────────────────────────────────────────────────────
export const updateFinancialRecord = async (req, res, next) => {
    try {
        const record = await FinancialRecord.findById(
            req.params.id
        );

        if (!record) {
            return next(
                new NotFoundError(
                    'Financial record not found.'
                )
            );
        }

        const allowedFields = [
            'type',
            'amount',
            'date',
            'category',
            'paymentMethod',
            'personOrOrg',
            'referenceNo',
            'description',
            'expenseDetails',
            'receiptUrl'
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                record[field] = req.body[field];
            }
        });

        // Remove expenditure-specific fields when
        // record is changed to Donation/Revenue.
        if (record.type !== 'Expenditure') {
            record.expenseDetails = '';
            record.receiptUrl = '';
        }

        record.updatedBy = req.user._id;

        await record.save();

        res.status(200).json({
            status: 'success',
            data: record
        });

    } catch (error) {
        next(error);
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Delete financial record
// ─────────────────────────────────────────────────────────────────────────────
export const deleteFinancialRecord = async (req, res, next) => {
    try {
        const record =
            await FinancialRecord.findByIdAndDelete(
                req.params.id
            );

        if (!record) {
            return next(
                new NotFoundError(
                    'Financial record not found.'
                )
            );
        }

        res.status(200).json({
            status: 'success',
            message: 'Record deleted successfully.'
        });

    } catch (error) {
        next(error);
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Export Excel
// ─────────────────────────────────────────────────────────────────────────────
export const exportFinancialRecords = async (req, res, next) => {
    try {
        const filter = buildFilterQuery(req.query);

        const records = await FinancialRecord.find(filter)
            .sort({
                date: -1
            })
            .lean();

        const buffer =
            await exportFinancialRecordsToExcel(records);

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=FinancialReport.xlsx'
        );

        res.send(buffer);

    } catch (error) {
        next(error);
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Financial summary
// ─────────────────────────────────────────────────────────────────────────────
export const getPublicFinancialSummary = async (
    req,
    res,
    next
) => {
    try {
        const typeTotals =
            await FinancialRecord.aggregate([
                {
                    $group: {
                        _id: '$type',
                        total: {
                            $sum: '$amount'
                        }
                    }
                }
            ]);

        let totalDonations = 0;
        let totalRevenue = 0;
        let totalExpenditure = 0;

        typeTotals.forEach((item) => {
            if (item._id === 'Donation') {
                totalDonations = item.total;
            }

            if (item._id === 'Revenue') {
                totalRevenue = item.total;
            }

            if (item._id === 'Expenditure') {
                totalExpenditure = item.total;
            }
        });

        res.status(200).json({
            status: 'success',

            data: {
                totalDonations,
                totalRevenue,
                totalExpenditure,

                netBalance:
                    totalDonations +
                    totalRevenue -
                    totalExpenditure
            }
        });

    } catch (error) {
        next(error);
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Financial records
// ─────────────────────────────────────────────────────────────────────────────
export const getPublicFinancialRecords = async (
    req,
    res,
    next
) => {
    try {
        const filter = buildFilterQuery(req.query);

        const page = Math.max(
            1,
            parseInt(req.query.page) || 1
        );

        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit) || 20)
        );

        const allowedSortFields = [
            'date',
            'type',
            'category',
            'personOrOrg',
            'paymentMethod',
            'amount',
            'referenceNo'
        ];

        const sortBy = allowedSortFields.includes(req.query.sortBy)
            ? req.query.sortBy
            : 'date';

        const sortOrder =
            req.query.sortOrder === 'asc'
                ? 1
                : -1;

        const [records, total] =
            await Promise.all([
                FinancialRecord.find(filter)
                    .sort({
                        [sortBy]: sortOrder
                    })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .select(
                        '-createdBy -updatedBy'
                    )
                    .lean(),

                FinancialRecord.countDocuments(
                    filter
                )
            ]);

        res.status(200).json({
            status: 'success',

            data: records,

            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(
                    total / limit
                )
            }
        });

    } catch (error) {
        next(error);
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Export Excel
// ─────────────────────────────────────────────────────────────────────────────
export const exportPublicFinancialRecords = async (
    req,
    res,
    next
) => {
    try {
        const filter =
            buildFilterQuery(req.query);

        const records =
            await FinancialRecord.find(filter)
                .sort({
                    date: -1
                })
                .lean();

        const buffer =
            await exportFinancialRecordsToExcel(
                records
            );

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=TempleFinancialStatement.xlsx'
        );

        res.send(buffer);

    } catch (error) {
        next(error);
    }
};