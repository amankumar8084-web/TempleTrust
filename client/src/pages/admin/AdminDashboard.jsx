import React, {
  useState,
  useEffect
} from 'react';

import {
  Link
} from 'react-router-dom';

import AdminPageLayout from '../../components/layout/AdminPageLayout.jsx';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import {
  Heart,
  CalendarClock,
  Users,
  ShieldCheck,
  Award,
  TrendingUp,
  TrendingDown,
  Wallet,
  Bell,
  Mail,
  Receipt
} from 'lucide-react';

import api, {
  API_BASE_URL
} from '../../services/api.js';

import Skeleton from '../../components/common/Skeleton.jsx';
import { useAdminStats, useFinancials } from '../../hooks/queries/useQueries.js';


const PIE_COLORS = [
  '#d97706',
  '#b45309',
  '#92400e',
  '#78350f',
  '#fbbf24',
  '#fcd34d'
];


// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon,
  label,
  value,
  color = 'saffron',
  link
}) => (

  <Link
    to={link || '#'}
    className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-4 rounded-2xl shadow hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-3"
  >

    <div
      className={`p-2.5 rounded-xl shrink-0 ${color === 'saffron'
        ? 'bg-amber-100 dark:bg-amber-950/40'
        : color === 'maroon'
          ? 'bg-red-100 dark:bg-red-950/40'
          : 'bg-green-100 dark:bg-green-950/40'
        }`}
    >

      <Icon
        className={`h-5 w-5 ${color === 'saffron'
          ? 'text-amber-600'
          : color === 'maroon'
            ? 'text-red-700'
            : 'text-green-600'
          }`}
      />

    </div>


    <div className="min-w-0">

      <div className="text-xl font-extrabold text-gray-800 dark:text-white leading-tight">
        {value}
      </div>

      <div className="text-[10px] text-gray-500 dark:text-slate-400 leading-snug truncate">
        {label}
      </div>

    </div>

  </Link>
);


// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {

  const { data: statsData, isLoading: loading } = useAdminStats();
  const stats = statsData || null;

  const { data: finData, isLoading: financialLoading } = useFinancials({ page: 1, limit: 1 });
  const financialSummary = finData?.summary || null;


  const monthlyData =
    financialSummary?.monthlyData ||
    [];


  const categoryData =
    financialSummary?.categoryData ||
    [];


  return (

    <AdminPageLayout>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">

        <div>

          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-white">
            Admin Dashboard
          </h1>

          <p className="text-xs text-gray-500 dark:text-slate-400">
            Temple Trust Management Overview
          </p>

        </div>


        <div className="text-xs text-gray-400">

          {new Date().toLocaleDateString(
            'en-IN',
            {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }
          )}

        </div>

      </div>


      {/* ─────────────────────────────────────────
                FINANCIAL OVERVIEW
            ───────────────────────────────────────── */}
      <div>

        <div className="flex items-center justify-between mb-3">

          <div>

            <h2 className="text-sm font-extrabold text-gray-700 dark:text-white">
              Financial Overview
            </h2>

            <p className="text-[10px] text-gray-400">
              Live financial data from the financial records
            </p>

          </div>


          <Link
            to="/admin/financials"
            className="text-[10px] font-bold text-amber-600 hover:underline"
          >
            Manage Financials →
          </Link>

        </div>


        {financialLoading ? (

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            {[1, 2, 3, 4].map(
              item => (
                <Skeleton
                  key={item}
                  className="h-24 rounded-2xl"
                />
              )
            )}

          </div>

        ) : (

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            <StatCard
              icon={Heart}
              label="Total Donations"
              value={`₹${(
                financialSummary?.totalDonations ||
                0
              ).toLocaleString()}`}
              color="saffron"
              link="/admin/donations"
            />


            <StatCard
              icon={TrendingUp}
              label="Total Revenue"
              value={`₹${(
                financialSummary?.totalRevenue ||
                0
              ).toLocaleString()}`}
              color="green"
              link="/admin/financials"
            />


            <StatCard
              icon={TrendingDown}
              label="Total Expenditure"
              value={`₹${(
                financialSummary?.totalExpenditure ||
                0
              ).toLocaleString()}`}
              color="maroon"
              link="/admin/financials"
            />


            <StatCard
              icon={Wallet}
              label="Net Balance"
              value={`₹${(
                financialSummary?.netBalance ||
                0
              ).toLocaleString()}`}
              color="saffron"
              link="/admin/financials"
            />

          </div>

        )}

      </div>


      {/* ─────────────────────────────────────────
                EXISTING GENERAL STATS
            ───────────────────────────────────────── */}
      {loading ? (

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {[1, 2, 3, 4, 5, 6, 7, 8].map(
            item => (
              <Skeleton
                key={item}
                className="h-20 rounded-2xl"
              />
            )
          )}

        </div>

      ) : (

        <div>

          <h2 className="text-sm font-extrabold text-gray-700 dark:text-white mb-3">
            Trust Overview
          </h2>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            <StatCard
              icon={Users}
              label="Total Devotees"
              value={
                stats?.devoteeCount ||
                0
              }
              color="maroon"
              link="/admin/users"
            />


            <StatCard
              icon={CalendarClock}
              label="Pooja Bookings"
              value={
                stats?.totalBookings ||
                0
              }
              color="maroon"
              link="/admin/bookings"
            />


            <StatCard
              icon={ShieldCheck}
              label="Active Volunteers"
              value={
                stats?.volunteersCount ||
                0
              }
              color="green"
              link="/admin/volunteers"
            />


            <StatCard
              icon={Award}
              label="Memberships"
              value={
                stats?.activeMemberships ||
                0
              }
              color="saffron"
              link="/admin/memberships"
            />


            <StatCard
              icon={Bell}
              label="Pending Volunteers"
              value={
                stats?.pendingVolunteers ||
                0
              }
              color="maroon"
              link="/admin/volunteers"
            />


            <StatCard
              icon={Mail}
              label="Pending Members"
              value={
                stats?.pendingMemberships ||
                0
              }
              color="green"
              link="/admin/memberships"
            />

          </div>

        </div>

      )}


      {/* ─────────────────────────────────────────
                FINANCIAL CHARTS
            ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Income vs expenditure */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-4 md:p-6 rounded-2xl shadow">

          <h3 className="text-sm font-bold text-gray-700 dark:text-white mb-4">
            Monthly Income vs Expenditure (₹)
          </h3>


          {financialLoading ? (

            <Skeleton className="h-40" />

          ) : (

            <ResponsiveContainer
              width="100%"
              height={220}
            >

              <BarChart
                data={
                  monthlyData
                }
                margin={{
                  top: 0,
                  right: 5,
                  left: -20,
                  bottom: 0
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 9,
                    fill: '#94a3b8'
                  }}
                />

                <YAxis
                  tick={{
                    fontSize: 9,
                    fill: '#94a3b8'
                  }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    fontSize: '12px',
                    border: '1px solid #e2e8f0'
                  }}
                  formatter={(value) =>
                    `₹${Number(value).toLocaleString()}`
                  }
                />


                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#059669"
                  radius={[
                    6,
                    6,
                    0,
                    0
                  ]}
                />


                <Bar
                  dataKey="expenditure"
                  name="Expenditure"
                  fill="#e11d48"
                  radius={[
                    6,
                    6,
                    0,
                    0
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          )}

        </div>


        {/* Expenditure category */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-4 md:p-6 rounded-2xl shadow">

          <h3 className="text-sm font-bold text-gray-700 dark:text-white mb-4">
            Expenditure by Category
          </h3>


          {financialLoading ? (

            <Skeleton className="h-40" />

          ) : categoryData.length === 0 ? (

            <div className="h-40 flex items-center justify-center text-xs text-gray-400">
              No expenditure data available.
            </div>

          ) : (

            <div className="flex items-center gap-4">

              <ResponsiveContainer
                width={160}
                height={160}
              >

                <PieChart>

                  <Pie
                    data={
                      categoryData
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >

                    {categoryData.map(
                      (_, index) => (

                        <Cell
                          key={
                            `cell-${index}`
                          }
                          fill={
                            PIE_COLORS[
                            index %
                            PIE_COLORS.length
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>


                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value).toLocaleString()}`
                    }
                  />

                </PieChart>

              </ResponsiveContainer>


              <div className="space-y-1.5 text-xs flex-1 min-w-0">

                {categoryData.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="flex items-center gap-2"
                    >

                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            PIE_COLORS[
                            index %
                            PIE_COLORS.length
                            ]
                        }}
                      />

                      <span className="text-gray-600 dark:text-slate-300 truncate">

                        {item.name}:{' '}

                        <strong>
                          ₹
                          {item.value.toLocaleString()}
                        </strong>

                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

        </div>

      </div>


      {/* ─────────────────────────────────────────
                RECENT EXPENDITURE
            ───────────────────────────────────────── */}
      {financialSummary?.expenditureDetails?.length > 0 && (

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-4 md:p-6 rounded-2xl shadow">

          <div className="flex items-center justify-between mb-4">

            <div>

              <h3 className="text-sm font-bold text-gray-700 dark:text-white">
                Recent Expenditure
              </h3>

              <p className="text-[10px] text-gray-400">
                Where recent temple funds were spent
              </p>

            </div>


            <Link
              to="/admin/financials"
              className="text-[10px] font-bold text-amber-600 hover:underline"
            >
              View All →
            </Link>

          </div>


          <div className="space-y-2">

            {financialSummary.expenditureDetails
              .slice(0, 5)
              .map(expense => (

                <div
                  key={expense._id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/10"
                >

                  <div className="flex items-center gap-3 min-w-0">

                    <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/30">

                      <Receipt className="h-4 w-4 text-rose-600" />

                    </div>


                    <div className="min-w-0">

                      <p className="text-xs font-bold text-gray-700 dark:text-white truncate">
                        {expense.category}
                      </p>

                      <p className="text-[10px] text-gray-400 truncate">
                        {expense.expenseDetails ||
                          expense.description ||
                          'No details provided'}
                      </p>

                      <p className="text-[9px] text-gray-400">
                        {new Date(
                          expense.date
                        ).toLocaleDateString(
                          'en-IN'
                        )}
                      </p>

                    </div>

                  </div>


                  <div className="text-right shrink-0">

                    <p className="text-xs font-extrabold text-rose-600">
                      −₹
                      {expense.amount.toLocaleString()}
                    </p>

                    {expense.receiptUrl && (

                      <a
                        href={
                          expense.receiptUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] text-rose-600 hover:underline"
                      >
                        Receipt
                      </a>

                    )}

                  </div>

                </div>

              ))}

          </div>

        </div>

      )}


      {/* ─────────────────────────────────────────
                QUICK ACTIONS
            ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-4 md:p-6 rounded-2xl shadow">

        <h3 className="text-sm font-bold text-gray-700 dark:text-white mb-4">
          Quick Actions
        </h3>


        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2.5">

          {[
            {
              label: '+ Create Event',
              path: '/admin/events',
              bg: 'bg-amber-600 hover:bg-amber-700'
            },

            {
              label: '+ New Announcement',
              path: '/admin/announcements',
              bg: 'bg-red-700 hover:bg-red-800'
            },

            {
              label: '+ Upload Gallery',
              path: '/admin/gallery',
              bg: 'bg-yellow-600 hover:bg-yellow-700'
            },

            {
              label: '+ Add Financial Record',
              path: '/admin/financials',
              bg: 'bg-emerald-600 hover:bg-emerald-700'
            },

            {
              label: 'Export Donations',
              path: `${API_BASE_URL}/donations/export`,
              bg: 'bg-green-600 hover:bg-green-700',
              ext: true
            },

            {
              label: 'Update Temple Info',
              path: '/admin/content',
              bg: 'bg-slate-600 hover:bg-slate-700'
            }

          ].map(
            ({
              label,
              path,
              bg,
              ext
            }) =>

              ext ? (

                <a
                  key={label}
                  href={path}
                  target="_blank"
                  rel="noreferrer"
                  className={`${bg} text-white text-xs font-bold px-4 py-2.5 rounded-xl transition hover:scale-105 text-center`}
                >
                  {label}
                </a>

              ) : (

                <Link
                  key={label}
                  to={path}
                  className={`${bg} text-white text-xs font-bold px-4 py-2.5 rounded-xl transition hover:scale-105 text-center`}
                >
                  {label}
                </Link>

              )
          )}

        </div>

      </div>

    </AdminPageLayout>
  );
};


export default AdminDashboard;

export {
  AdminDashboard
};