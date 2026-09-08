import { TransactionType } from "@/types/transaction-type";
import { cls } from "@/utils/cls";
import { ArrowDownCircleIcon, ArrowUpCircleIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

interface ITransactionIcon {
    className?: string;
    type: TransactionType;
}
export default function TransactionIcon({ type, className = '' }: ITransactionIcon) {
    
    if (type === TransactionType.INCOME) {
        return (
            <ArrowDownCircleIcon className={cls('text-success size-8', className)} />
        )
    }

    if (type === TransactionType.EXPENSE) {
        return (
            <ArrowUpCircleIcon className={cls("text-error size-8", className)} />
        )
    }

    return <QuestionMarkCircleIcon className="text-foreground"/>
}