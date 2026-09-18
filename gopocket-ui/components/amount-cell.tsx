import { TransactionType } from "@/types/transaction-type";
import { cls } from "@/utils/cls";
import { formatCurrencyString } from "@/utils/currency";

interface AmountCellProps {
  amount: number;
  type: TransactionType;
  className?: string;
}

export function AmountCell({ amount, type, className = "" }: AmountCellProps) {
  const isExpense = type === TransactionType.EXPENSE;

  return (
    <span
      className={cls(
        "font-medium whitespace-nowrap",
        isExpense ? "" : "text-primary",
        className,
      )}
    >
      {isExpense ? "" : "+"}
      {formatCurrencyString(amount)}
    </span>
  );
}
