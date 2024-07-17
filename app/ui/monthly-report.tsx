"use client";

import { Fragment, useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { PiArrowCircleDownFill, PiArrowCircleUpFill } from "react-icons/pi";

import { getLocalTimeZone } from "@internationalized/date";
import { DateValue, Divider, RangeValue } from "@nextui-org/react";
import {
  endOfMonth,
  endOfToday,
  format,
  startOfMonth,
  startOfToday,
} from "date-fns";

import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_CURRENCY_SIGN,
} from "@/config/constants/main";

import {
  calculateMonthlyReportData,
  filterTransactions,
  filterTransactionsByDateRange,
} from "../lib/data";
import { TTransaction } from "../lib/types";
import { getFormattedCurrency, toCalendarDate } from "../lib/utils";
import MonthPicker from "./month-picker";

type TProps = {
  transactions: TTransaction[];
  currency: TTransaction["currency"];
};

function MonthlyReport({ transactions, currency }: TProps) {
  // This state looks complex. Maybe due to initial value.
  // Create a helper hook "useSelectedDate" instead.
  // It should return an object with 2 properties:
  // selectedDate: RangeValue<DateValue>;
  // onDateSelection: (date: RangeValue<DateValue>) => void;
  // This will hide an unnecessary implementation but leaves all functionality. Plus you can test this hook separately.
  const [selectedDate, setSelectedDate] = useState<RangeValue<DateValue>>({
    start: toCalendarDate(startOfMonth(startOfToday())),
    end: toCalendarDate(endOfMonth(endOfToday())),
  });

  // "startDate" and "endDate" variables looks complex and it is a code duplication.
  // Create a helper function "getRange" instead.
  // It will return an object with 2 properties:
  // startDate: Date;
  // endDate: Date;
  const startDate = selectedDate?.start.toDate(getLocalTimeZone());
  const endDate = selectedDate?.end.toDate(getLocalTimeZone());
  // Not sure if it is a good variable name.
  // How about "dateRangeTitle"?
  // I think, there is no need to use "useMemo" here.
  // Create simple helper function "getDateRangeTitle" instead.
  // It will accept "range": { startDate: Date; endDate: Date; }
  // It will return string.
  const formattedDateRange = useMemo(
    () => `${format(startDate, "MMMM d")} — ${format(endDate, "MMMM d")}`,
    [startDate, endDate]
  );

  // Move it to a custom hook "useSelectedDate".
  const onDateSelection = useCallback((dateRange: RangeValue<DateValue>) => {
    setSelectedDate(dateRange);
    toast.success("Date range updated.");
  }, []);

  // A chain of operations. Every next operation is dependent from previous.
  // Create a separate custom hook "useTransactionsInfo" instead.
  // It will do all this operations in a one single "useMemo" hook.
  // It will accept an object with 2 properties:
  // transactions: TTransactions[];
  // range: { startDate: Date; endDate: Date; }
  // It will return an object with 3 properties:
  // income: number;
  // expense: number;
  // expenseReports: { category: string; spent: number; percentage: string; }[]
  // All this complex logics will look like this:
  // const { income, expense, expenseReports } = useTransactionsInfo({ transactions, range: { startDate, endDate } })
  const filteredTransactions = useMemo(
    () => filterTransactionsByDateRange(transactions, startDate, endDate),
    [transactions, startDate, endDate]
  );
  const { income, expense } = useMemo(
    () => filterTransactions(filteredTransactions),
    [filteredTransactions]
  );
  const { totalIncome, totalExpense, monthlyReportData } = useMemo(
    () => calculateMonthlyReportData(income, expense),
    [income, expense]
  );

  // This code is just an array of sorted jsx elements.
  // No need in "useMemo" here.
  // Copy an array before using "sort" to avoid mutating.
  // Create new custom component "ExpenseReports".
  // It's props are:
  // reports: { percentage: string; spent: number; category: string }[];
  // currency?: { sign: string; }
  // Optimize and render this jsx inside "ExpenseReports" looping through sorted "reports"
  const memorizedMonthlyReportData = useMemo(() => {
    return monthlyReportData
      .sort((c1, c2) => c2.spent - c1.spent)
      .map((category) => (
        <Fragment key={category.category}>
          <div className="text-md overflow-hidden text-ellipsis whitespace-nowrap md:text-lg">
            {category.category}
          </div>
          <div className="text-md md:text-lg">{category.percentage} %</div>
          <div className="text-md md:text-lg">
            {getFormattedCurrency(category.spent)}{" "}
            {currency?.sign || DEFAULT_CURRENCY_SIGN}
          </div>
        </Fragment>
      ));
  }, [currency?.sign, monthlyReportData]);

  // Bad variables names and code duplication are the main problems here.
  // Remove this "if" code block.
  if (filteredTransactions.length === 0) {
    return (
      <div className="mx-auto max-w-3xl rounded-medium bg-content1 p-4 md:p-8">
        <MonthPicker
          selectedDate={selectedDate}
          onDateSelection={onDateSelection}
        />
        <p className="text-default-500">
          No transactions found from {formattedDateRange}
        </p>
      </div>
    );
  }

  return (
    // This wrapper div and MonthPicker are always rendered.
    // Previously you duplicated this code in "if" code block.
    <div className="mx-auto max-w-3xl rounded-medium bg-content1 p-4 md:p-8">
      <MonthPicker
        selectedDate={selectedDate}
        onDateSelection={onDateSelection}
      />
      // Render other content using condition (income || expense).
      // Get "income" and "expense" from "useTransactionsInfo".
      // If both "income" and "expense" equal zero - render paragraph with text.
      // If any of them higher thant zero render
      <div className="mb-3 flex items-end justify-between md:mb-6">
        <p className="hidden text-2xl text-default-500 md:block">
          {formattedDateRange}
        </p>

        // Create new custom component "Totals".
        // It's props:
        // currency?: { code: string }
        // income: number;
        // expense: number;
        // It will render optimized jsx from below (remove code duplication).
        <div className="flex gap-4 md:gap-8">
          <div>
            <p className="text-xs text-default-500 md:text-sm">Total Income</p>
            <p className="flex items-center gap-1 text-lg font-semibold md:text-2xl">
              <PiArrowCircleUpFill className="fill-success" />
              {getFormattedCurrency(totalIncome)}{" "}
              {currency?.code || DEFAULT_CURRENCY_CODE}
            </p>
          </div>

          <div>
            <p className="text-xs text-default-500 md:text-sm">Total Expense</p>
            <p className="flex items-center gap-1 text-lg font-semibold md:text-2xl">
              <PiArrowCircleDownFill className="fill-danger" />
              {getFormattedCurrency(totalExpense)}{" "}
              {currency?.code || DEFAULT_CURRENCY_CODE}
            </p>
          </div>
        </div>
      </div>

      // Change condition to "expense > 0" or just "expense".
      // Render "ExpenseReports" when "expense" from "useTransactionsInfo" is bigger than zero.
      // Otherwise - render paragraph with text.
      {expense.length !== 0 ? (
        <>
          <Divider className="mx-auto mb-3 bg-divider md:mb-6" />
          <div className="grid grid-cols-3 gap-4">
            <div className="text-xs text-default-500 md:text-sm">Category</div>
            <div className="text-xs text-default-500 md:text-sm">
              Percentage
            </div>
            <div className="text-xs text-default-500 md:text-sm">Spent</div>
            {memorizedMonthlyReportData}
          </div>
        </>
      ) : (
        <p className="text-default-500">No expense transactions found.</p>
      )}
    </div>
  );
}

export default MonthlyReport;

// After all changes this file length will decrease from +-140 lines to +-70 lines.
// Newly created helper functions, hooks, and components will make this code look more fancy and easy to read.
// This will also allow to test (or replace) this component and its parts easier.
// Final code of your "MonthlyReport" will look like this (I skip imports ofc):

// export default function MonthlyReport({ transactions, currency }: Props) {
//   const { selectedDate, onDateSelection } = useSelectedDate();

//   const range = getRange(selectedDate);
//   const rangeTitle = getRangeTitle(range);

//   const { income, expense, expenseReports } = useTransactionsInfo({
//     transactions,
//     range,
//   });

//   return (
//     <div className="mx-auto max-w-3xl rounded-medium bg-content1 p-4 md:p-8">
//       <MonthPicker
//         selectedDate={selectedDate}
//         onDateSelection={onDateSelection}
//       />

//       {income || expense ? (
//         <>
//           <div className="mb-3 flex items-end justify-between md:mb-6">
//             <p className="hidden text-2xl text-default-500 md:block">
//               {rangeTitle}
//             </p>

//             <Totals currency={currency} income={income} expense={expense} />
//           </div>

//           {expense ? (
//             <ExpenseReports reports={expenseReports} currency={currency} />
//           ) : (
//             <p className="text-default-500">No expense transactions found.</p>
//           )}
//         </>
//       ) : (
//         <p className="text-default-500">
//           No transactions found from {rangeTitle}
//         </p>
//       )}
//     </div>
//   );
// }
