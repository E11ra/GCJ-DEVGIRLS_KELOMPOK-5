import React, { useMemo, useState } from 'react';
import {
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  Crown,
  Info,
  LogOut,
  Menu,
  MinusCircle,
  Moon,
  PlusCircle,
  Search,
  UserCircle2,
  X,
} from 'lucide-react';

interface DashboardProps {
  userName?: string;
  onLogout: () => void;
}

type SidebarTab = 'dashboard' | 'transactions' | 'budgeting' | 'saving-pocket';
type ModalKind =
  | null
  | 'income'
  | 'expense'
  | 'budget'
  | 'edit-budget'
  | 'pocket'
  | 'deposit'
  | 'withdraw'
  | 'success'
  | 'error'
  | 'upgrade-premium';

interface BudgetCategory {
  id: string;
  name: string;
  budgetLabel?: string;
  color: string;
  spent: number;
  limit: number;
}

interface TransactionItem {
  id: string;
  title: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  month: string;
  note: string;
}

interface PocketActivityItem {
  id: string;
  type: 'deposit' | 'withdraw';
  title: string;
  note: string;
  amount: number;
  date: string;
}

interface SavingPocketItem {
  id: string;
  name: string;
  description: string;
  target: number;
  saved: number;
  targetDate: string;
  activities: PocketActivityItem[];
}

const MONTH_OPTIONS = [
  'November 2026',
  'Oktober 2026',
  'September 2026',
  'Agustus 2026',
];

const INCOME_CATEGORIES = [
  'Uang Bulanan',
  'Beasiswa',
  'Gaji Part-time',
  'Freelance',
  'Lainnya',
];

const EXPENSE_CATEGORIES = [
  'Makan',
  'Transport',
  'Nongkrong',
  'Hiburan',
  'Belanja',
];

const BUDGET_CATEGORY_OPTIONS = [
  'Makan & Minum',
  'Transportasi',
  'Hiburan',
  'Belanja',
  'Lainnya',
];

const INITIAL_BUDGETS: BudgetCategory[] = [
  { id: 'makan', name: 'Makan', budgetLabel: 'Makan & Minum', color: '#2563EB', spent: 450000, limit: 700000 },
  { id: 'transport', name: 'Transport', budgetLabel: 'Transportasi', color: '#0F766E', spent: 200000, limit: 300000 },
  { id: 'nongkrong', name: 'Nongkrong', budgetLabel: 'Hiburan', color: '#7E22CE', spent: 200000, limit: 200000 },
  { id: 'belanja', name: 'Belanja', budgetLabel: 'Belanja', color: '#C2410C', spent: 350000, limit: 300000 },
];

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: 't1',
    title: 'Uang saku bulanan',
    type: 'income',
    category: 'Pemasukan',
    amount: 3000000,
    date: '01 Nov 2026',
    month: 'November 2026',
    note: 'Uang saku bulanan',
  },
  {
    id: 't2',
    title: 'Katering Makan',
    type: 'expense',
    category: 'Makan',
    amount: 450000,
    date: '03 Nov 2026',
    month: 'November 2026',
    note: 'Katering Makan',
  },
  {
    id: 't3',
    title: 'Top-up Kartu KRL',
    type: 'expense',
    category: 'Transport',
    amount: 200000,
    date: '05 Nov 2026',
    month: 'November 2026',
    note: 'Top-up Kartu KRL',
  },
  {
    id: 't4',
    title: 'Ngopi santai',
    type: 'expense',
    category: 'Hiburan',
    amount: 200000,
    date: '07 Nov 2026',
    month: 'November 2026',
    note: 'Ngopi santai',
  },
  {
    id: 't5',
    title: 'Belanja keperluan kost',
    type: 'expense',
    category: 'Belanja',
    amount: 350000,
    date: '09 Nov 2026',
    month: 'November 2026',
    note: 'Belanja keperluan kost',
  },
];

const INITIAL_POCKETS: SavingPocketItem[] = [
  {
    id: 'p1',
    name: 'Dana Darurat',
    description: 'Tabungan wajib & Persiapan Masa Depan',
    target: 3000000,
    saved: 1200000,
    targetDate: '31 Desember 2026',
    activities: [
      {
        id: 'pa1',
        type: 'deposit',
        title: 'Setoran',
        note: 'Nemu uang di tas',
        amount: 50000,
        date: '14 November 2026',
      },
      {
        id: 'pa2',
        type: 'withdraw',
        title: 'Penarikan',
        note: 'Butuh uang banget',
        amount: 100000,
        date: '10 November 2026',
      },
      {
        id: 'pa3',
        type: 'deposit',
        title: 'Setoran',
        note: 'Sisa uang saku bulanan',
        amount: 400000,
        date: '05 November 2026',
      },
      {
        id: 'pa4',
        type: 'deposit',
        title: 'Setoran Awal',
        note: 'Setoran pertama pembukaan pocket',
        amount: 500000,
        date: '30 Oktober 2026',
      },
    ],
  },
  {
    id: 'p2',
    name: 'Laptop Baru',
    description: 'Kebutuhan Kuliah',
    target: 5000000,
    saved: 2000000,
    targetDate: '30 April 2027',
    activities: [
      {
        id: 'pa5',
        type: 'deposit',
        title: 'Setoran Awal',
        note: 'Tabungan awal pembelian laptop',
        amount: 2000000,
        date: '01 November 2026',
      },
    ],
  },
];

function formatRupiah(amount: number): string {
  const rounded = Math.max(0, Math.round(amount));
  return 'Rp' + rounded.toLocaleString('id-ID');
}

function parseNominal(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10);
}

function handleDigitsOnlyKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const allowedKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
  ];
  if (allowedKeys.includes(e.key)) return;
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
}

const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

function formatDateToIndonesian(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function getTodayIndonesian(): string {
  return formatDateToIndonesian(new Date());
}

function indonesianDateToIso(rawDate: string): string {
  const trimmed = rawDate.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return trimmed;

  const slashMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slashMatch) {
    return `${slashMatch[3]}-${slashMatch[2].padStart(2, '0')}-${slashMatch[1].padStart(2, '0')}`;
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthName = parts[1].toLowerCase();
    const year = parseInt(parts[2], 10);
    const monthIdx = INDONESIAN_MONTHS.findIndex(
      (m) =>
        m.toLowerCase() === monthName ||
        m.toLowerCase().startsWith(monthName.slice(0, 3))
    );
    if (!Number.isNaN(day) && monthIdx !== -1 && !Number.isNaN(year)) {
      return `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  return '';
}

function isoDateToIndonesian(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  const year = Number(match[1]);
  const monthIdx = Number(match[2]) - 1;
  const day = String(Number(match[3])).padStart(2, '0');
  const monthName = INDONESIAN_MONTHS[monthIdx];
  if (!monthName) return iso;
  return `${day} ${monthName} ${year}`;
}

const SHORT_MONTH_MAP: Record<string, string> = {
  januari: 'Jan',
  februari: 'Feb',
  maret: 'Mar',
  april: 'Apr',
  mei: 'Mei',
  juni: 'Jun',
  juli: 'Jul',
  agustus: 'Agu',
  september: 'Sep',
  oktober: 'Okt',
  november: 'Nov',
  desember: 'Des',
};

function formatShortDate(rawDate: string): string {
  const iso = indonesianDateToIso(rawDate);
  const normalized = iso ? isoDateToIndonesian(iso) : rawDate;
  const parts = normalized.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parts[0].padStart(2, '0');
    const monthFull = parts[1].toLowerCase();
    const shortMonth = SHORT_MONTH_MAP[monthFull] || parts[1].slice(0, 3);
    const year = parts[2];
    return `${day} ${shortMonth} ${year}`;
  }
  return rawDate;
}

function extractMonthLabel(rawDate: string): string {
  const iso = indonesianDateToIso(rawDate);
  const normalized = iso ? isoDateToIndonesian(iso) : rawDate;
  const parts = normalized.trim().split(/\s+/);
  if (parts.length >= 3) {
    return `${parts[1]} ${parts[2]}`;
  }
  const now = new Date();
  return `${INDONESIAN_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

function DateInputWithPicker({
  id,
  value,
  onChange,
  placeholder,
  className = 'atur-modal-input pr-11 text-[#475569]',
}: {
  id: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const isoValue = indonesianDateToIso(value);

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-[#475569] hover:text-[#1D5BF2] transition-colors">
        <Calendar className="w-[18px] h-[18px] pointer-events-none" />
        <input
          type="date"
          aria-label="Pilih tanggal dari kalender"
          title="Pilih tanggal"
          value={isoValue}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker?.();
            } catch {
              // Browser fallback uses default input click
            }
          }}
          onChange={(e) => {
            if (e.target.value) {
              onChange(isoDateToIndonesian(e.target.value));
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

/* Custom Crisp Icons Matching Reference Screenshots */
function IconDashboardGrid({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconTransactionsArrows({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 8h13m0 0-3-3m3 3-3 3" />
      <path d="M17 16H4m0 0 3 3m-3-3 3-3" />
    </svg>
  );
}

function IconBudgetHand({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="7.5" r="4.5" />
      <path d="M13.5 5.4v4.2" />
      <path d="M14.7 6.4c-.3-.4-.8-.6-1.2-.6-.7 0-1.2.4-1.2.9 0 .6.6.8 1.2.9.7.1 1.3.4 1.3 1 0 .6-.6 1-1.3 1-.5 0-1-.2-1.3-.6" />
      <path d="M3 16.5h4.2l2.4 1.5h4.9c.8 0 1.5-.6 1.5-1.3 0-.6-.5-1.2-1.2-1.2H11" />
      <path d="M3 19.5h12.2l4.1-2.5c.6-.4.8-1.1.4-1.7-.4-.6-1.1-.7-1.7-.4L15 16.5" />
    </svg>
  );
}

function IconWalletPocket({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="M15.5 10.5H20v4h-4.5a2 2 0 1 1 0-4Z" />
      <circle cx="15.8" cy="12.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function IconBanknote({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.7" />
      <path d="M12 10.4v3.2" />
      <path d="M6 9.5v.01M18 14.5v.01" />
    </svg>
  );
}

function IconMoneyIn({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5.5" width="16" height="11" rx="2" />
      <circle cx="10.5" cy="11" r="2.2" />
      <path d="M21.5 16.5h-6.5m0 0 2.2-2.2m-2.2 2.2 2.2 2.2" />
    </svg>
  );
}

function IconMoneyOut({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5.5" width="16" height="11" rx="2" />
      <circle cx="10.5" cy="11" r="2.2" />
      <path d="M15 16.5h6.5m0 0-2.2-2.2m2.2 2.2-2.2 2.2" />
    </svg>
  );
}

function IconCoinsStack({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="9" cy="6.5" rx="4.5" ry="2" />
      <path d="M4.5 6.5v10c0 1.1 2 2 4.5 2s4.5-.9 4.5-2v-10" />
      <path d="M4.5 10c0 1.1 2 2 4.5 2s4.5-.9 4.5-2" />
      <path d="M4.5 13.5c0 1.1 2 2 4.5 2s4.5-.9 4.5-2" />
      <ellipse cx="16" cy="11.5" rx="3.8" ry="1.7" />
      <path d="M12.2 11.5v5.5c0 .9 1.7 1.7 3.8 1.7s3.8-.8 3.8-1.7v-5.5" />
      <path d="M12.2 14.3c0 .9 1.7 1.7 3.8 1.7s3.8-.8 3.8-1.7" />
    </svg>
  );
}

function IconMoneyBag({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 3.5h5l-1 3.2h-3L9.5 3.5Z" />
      <path d="M8.5 6.7C6 9 4.5 12.2 4.5 15.2c0 3.2 2.4 5.3 7.5 5.3s7.5-2.1 7.5-5.3c0-3-1.5-6.2-4-8.5H8.5Z" />
      <path d="M12 10.6v6.2" />
      <path d="M13.8 12c-.4-.5-1.1-.8-1.8-.8-1 0-1.8.5-1.8 1.2 0 .8.8 1.1 1.8 1.3 1 .2 1.9.5 1.9 1.3 0 .8-.8 1.3-1.9 1.3-.8 0-1.5-.3-1.9-.8" />
    </svg>
  );
}

function IconBarChart({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="12" width="3.5" height="7.5" rx="0.8" />
      <rect x="10.25" y="5.5" width="3.5" height="14" rx="0.8" />
      <rect x="16.5" y="9" width="3.5" height="10.5" rx="0.8" />
    </svg>
  );
}

function IconPremiumCrown({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="14" r="3.4" fill="currentColor" />
      <circle cx="13" cy="21" r="3" fill="currentColor" />
      <circle cx="51" cy="21" r="3" fill="currentColor" />
      <path
        d="M14.5 24.5L22.5 34L32 18.5L41.5 34L49.5 24.5L45.5 41.5H18.5L14.5 24.5Z"
        stroke="currentColor"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 49.5H46.5"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Dashboard({ userName = 'Nadia', onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Financial State (Defaults 100% matching Dashboard_cd052ab8.png)
  const [availableBalance, setAvailableBalance] = useState<number>(1400000);
  const [totalIncome, setTotalIncome] = useState<number>(3000000);
  const [budgets, setBudgets] = useState<BudgetCategory[]>(INITIAL_BUDGETS);
  const [transactions, setTransactions] = useState<TransactionItem[]>(INITIAL_TRANSACTIONS);
  const [pockets, setPockets] = useState<SavingPocketItem[]>(INITIAL_POCKETS);

  // Month Dropdown State
  const [selectedMonth, setSelectedMonth] = useState<string>('November 2026');
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);

  // Transactions Filter States
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txMonthFilter, setTxMonthFilter] = useState<string>('November 2026');
  const [txMonthMenuOpen, setTxMonthMenuOpen] = useState(false);
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [txCategoryFilter, setTxCategoryFilter] = useState<string>('all');

  // Budgeting States
  const [budgetMonth, setBudgetMonth] = useState<string>('November 2026');
  const [budgetMonthMenuOpen, setBudgetMonthMenuOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  // Saving Pocket States
  const [selectedPocketId, setSelectedPocketId] = useState<string | null>(null);
  const [pocketDateInput, setPocketDateInput] = useState('');
  const [confirmCommitmentChecked, setConfirmCommitmentChecked] = useState(false);

  // Modal State
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [lastFormModal, setLastFormModal] = useState<
    'income' | 'expense' | 'budget' | 'edit-budget' | 'pocket' | 'deposit' | 'withdraw'
  >('income');

  // Form Fields
  const [nominalInput, setNominalInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [dateInput, setDateInput] = useState(getTodayIndonesian);
  const [noteInput, setNoteInput] = useState('');
  const [pocketNameInput, setPocketNameInput] = useState('');
  const [pocketTargetInput, setPocketTargetInput] = useState('');

  // Subtle notice banner for utility icons (no browser alert)
  const [utilityNotice, setUtilityNotice] = useState<string | null>(null);
  const triggerNotice = (msg: string) => {
    setUtilityNotice(msg);
    setTimeout(() => setUtilityNotice(null), 2600);
  };

  const totalExpense = useMemo(
    () => budgets.reduce((sum, item) => sum + item.spent, 0),
    [budgets]
  );

  const totalBudgetLimit = useMemo(
    () => budgets.reduce((sum, item) => sum + item.limit, 0),
    [budgets]
  );

  const txCategoryOptions = useMemo(() => {
    const base = ['Pemasukan', 'Makan', 'Transport', 'Hiburan', 'Belanja', 'Nongkrong'];
    const dynamic = transactions.map((t) => t.category);
    return Array.from(new Set([...base, ...dynamic]));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = txSearchQuery.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (txMonthFilter !== 'Semua Bulan' && tx.month !== txMonthFilter) {
        return false;
      }
      if (txTypeFilter !== 'all' && tx.type !== txTypeFilter) {
        return false;
      }
      if (txCategoryFilter !== 'all' && tx.category !== txCategoryFilter) {
        return false;
      }
      if (
        query &&
        !tx.title.toLowerCase().includes(query) &&
        !tx.category.toLowerCase().includes(query) &&
        !tx.note.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [transactions, txSearchQuery, txMonthFilter, txTypeFilter, txCategoryFilter]);

  // Order for Analisis Pengeluaran legend & donut segments (matches Dashboard_cd052ab8.png)
  const expenseBreakdown = useMemo(() => {
    const order = ['Makan', 'Belanja', 'Transport', 'Nongkrong'];
    const sorted = [...budgets].sort((a, b) => {
      const idxA = order.indexOf(a.name);
      const idxB = order.indexOf(b.name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return b.spent - a.spent;
    });
    return sorted.map((item) => ({
      ...item,
      percentage: totalExpense > 0 ? (item.spent / totalExpense) * 100 : 0,
    }));
  }, [budgets, totalExpense]);

  // SVG Donut Arcs
  const donutSegments = useMemo(() => {
    const radius = 72;
    const circumference = 2 * Math.PI * radius;
    let cumulativeFraction = 0;

    return expenseBreakdown.map((item) => {
      const fraction = totalExpense > 0 ? item.spent / totalExpense : 0;
      const strokeDasharray = `${fraction * circumference} ${circumference}`;
      const strokeDashoffset = -cumulativeFraction * circumference;
      cumulativeFraction += fraction;
      return {
        ...item,
        radius,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [expenseBreakdown, totalExpense]);

  const totalPocketSaved = useMemo(
    () => pockets.reduce((sum, p) => sum + p.saved, 0),
    [pockets]
  );

  const totalPocketTarget = useMemo(
    () => pockets.reduce((sum, p) => sum + p.target, 0),
    [pockets]
  );

  const totalPocketProgress = useMemo(
    () =>
      totalPocketTarget > 0
        ? Math.min(100, Math.round((totalPocketSaved / totalPocketTarget) * 100))
        : 0,
    [totalPocketSaved, totalPocketTarget]
  );

  const selectedPocket = useMemo(
    () => pockets.find((p) => p.id === selectedPocketId) || null,
    [pockets, selectedPocketId]
  );

  const resetFormFields = () => {
    setNominalInput('');
    setCategoryInput('');
    setDateInput(getTodayIndonesian());
    setNoteInput('');
    setPocketNameInput('');
    setPocketTargetInput('');
    setPocketDateInput('');
    setConfirmCommitmentChecked(false);
  };

  const openModal = (
    kind: 'income' | 'expense' | 'budget' | 'pocket' | 'deposit' | 'withdraw'
  ) => {
    resetFormFields();
    setEditingBudgetId(null);
    setLastFormModal(kind);
    setActiveModal(kind);
  };

  const openEditBudgetModal = (budget: BudgetCategory) => {
    resetFormFields();
    setEditingBudgetId(budget.id);
    setCategoryInput(budget.budgetLabel || budget.name);
    setNominalInput(String(budget.limit));
    setDateInput(`11 ${budgetMonth}`);
    setLastFormModal('edit-budget');
    setActiveModal('edit-budget');
  };

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNominal(nominalInput);
    if (amount <= 0 || !categoryInput || !dateInput.trim()) {
      setActiveModal('error');
      return;
    }

    setTotalIncome((prev) => prev + amount);
    setAvailableBalance((prev) => prev + amount);
    const trimmedNote = noteInput.trim();
    setTransactions((prev) => [
      {
        id: 't-' + Date.now(),
        title: trimmedNote || categoryInput,
        type: 'income',
        category: 'Pemasukan',
        amount,
        date: formatShortDate(dateInput),
        month: extractMonthLabel(dateInput),
        note: trimmedNote || categoryInput,
      },
      ...prev,
    ]);
    setActiveModal('success');
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNominal(nominalInput);
    if (amount <= 0 || !categoryInput || !dateInput.trim()) {
      setActiveModal('error');
      return;
    }

    setAvailableBalance((prev) => Math.max(0, prev - amount));
    setBudgets((prev) => {
      const targetName =
        categoryInput === 'Hiburan' && !prev.some((b) => b.name === 'Hiburan')
          ? 'Nongkrong'
          : categoryInput;
      const exists = prev.some((b) => b.name === targetName);
      if (exists) {
        return prev.map((b) =>
          b.name === targetName ? { ...b, spent: b.spent + amount } : b
        );
      }
      return [
        ...prev,
        {
          id: targetName.toLowerCase().replace(/\s+/g, '-'),
          name: targetName,
          color: '#2563EB',
          spent: amount,
          limit: amount,
        },
      ];
    });
    const trimmedNote = noteInput.trim();
    setTransactions((prev) => [
      {
        id: 't-' + Date.now(),
        title: trimmedNote || categoryInput,
        type: 'expense',
        category: categoryInput,
        amount,
        date: formatShortDate(dateInput),
        month: extractMonthLabel(dateInput),
        note: trimmedNote || categoryInput,
      },
      ...prev,
    ]);
    setActiveModal('success');
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limitAmount = parseNominal(nominalInput);
    if (!categoryInput || limitAmount <= 0 || !dateInput.trim()) {
      setActiveModal('error');
      return;
    }

    setBudgets((prev) => {
      const exists = prev.some(
        (b) => b.name === categoryInput || b.budgetLabel === categoryInput
      );
      if (exists) {
        return prev.map((b) =>
          b.name === categoryInput || b.budgetLabel === categoryInput
            ? { ...b, limit: limitAmount }
            : b
        );
      }
      return [
        ...prev,
        {
          id: categoryInput.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: categoryInput,
          budgetLabel: categoryInput,
          color: '#2563EB',
          spent: 0,
          limit: limitAmount,
        },
      ];
    });
    setActiveModal('success');
  };

  const handleUpdateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limitAmount = parseNominal(nominalInput);
    if (!categoryInput || limitAmount <= 0 || !dateInput.trim()) {
      setActiveModal('error');
      return;
    }

    setBudgets((prev) => {
      const targetExists = prev.some(
        (b) =>
          b.id === editingBudgetId ||
          b.name === categoryInput ||
          b.budgetLabel === categoryInput
      );
      if (targetExists) {
        return prev.map((b) =>
          b.id === editingBudgetId ||
          b.name === categoryInput ||
          b.budgetLabel === categoryInput
            ? {
                ...b,
                budgetLabel: categoryInput,
                limit: limitAmount,
              }
            : b
        );
      }
      return [
        ...prev,
        {
          id: categoryInput.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: categoryInput,
          budgetLabel: categoryInput,
          color: '#2563EB',
          spent: 0,
          limit: limitAmount,
        },
      ];
    });
    setActiveModal('success');
  };

  const handleDeleteBudget = () => {
    setBudgets((prev) =>
      prev.filter(
        (b) =>
          b.id !== editingBudgetId &&
          b.name !== categoryInput &&
          b.budgetLabel !== categoryInput
      )
    );
    setEditingBudgetId(null);
    setActiveModal('success');
  };

  const handleSavePocket = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseNominal(pocketTargetInput);
    if (!pocketNameInput.trim() || targetAmount <= 0 || !pocketDateInput.trim()) {
      setActiveModal('error');
      return;
    }

    // Free plan limits to 2 Saving Pockets
    if (pockets.length >= 2) {
      setActiveModal('upgrade-premium');
      return;
    }

    setPockets((prev) => [
      ...prev,
      {
        id: 'p-' + Date.now(),
        name: pocketNameInput.trim(),
        description: noteInput.trim() || 'Tabungan Terencana',
        target: targetAmount,
        saved: 0,
        targetDate: pocketDateInput.trim(),
        activities: [],
      },
    ]);
    setActiveModal('success');
  };

  const handleDepositPocket = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNominal(nominalInput);
    if (
      !selectedPocket ||
      amount <= 0 ||
      !dateInput.trim() ||
      !confirmCommitmentChecked
    ) {
      setActiveModal('error');
      return;
    }

    setPockets((prev) =>
      prev.map((p) =>
        p.id === selectedPocket.id
          ? {
              ...p,
              saved: p.saved + amount,
              activities: [
                {
                  id: 'pa-' + Date.now(),
                  type: 'deposit',
                  title: 'Setoran',
                  note: noteInput.trim() || 'Setoran tabungan',
                  amount,
                  date: dateInput.trim(),
                },
                ...p.activities,
              ],
            }
          : p
      )
    );
    setAvailableBalance((prev) => Math.max(0, prev - amount));
    setActiveModal('success');
  };

  const handleWithdrawPocket = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNominal(nominalInput);
    if (
      !selectedPocket ||
      amount <= 0 ||
      amount > selectedPocket.saved ||
      !dateInput.trim() ||
      !confirmCommitmentChecked
    ) {
      setActiveModal('error');
      return;
    }

    setPockets((prev) =>
      prev.map((p) =>
        p.id === selectedPocket.id
          ? {
              ...p,
              saved: Math.max(0, p.saved - amount),
              activities: [
                {
                  id: 'pa-' + Date.now(),
                  type: 'withdraw',
                  title: 'Penarikan',
                  note: noteInput.trim() || 'Penarikan tabungan',
                  amount,
                  date: dateInput.trim(),
                },
                ...p.activities,
              ],
            }
          : p
      )
    );
    setAvailableBalance((prev) => prev + amount);
    setActiveModal('success');
  };

  const renderSidebarContent = () => (
    <>
      <div>
        {/* Logo */}
        <div className="pt-10 pb-14 flex justify-center">
          <img
            src="/logo-atur.png"
            alt="ATUR"
            className="h-9 w-auto object-contain select-none"
          />
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2.5" aria-label="Menu Utama Dashboard">
          <button
            type="button"
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`atur-sidebar-link ${
              activeTab === 'dashboard' ? 'atur-sidebar-link-active' : ''
            }`}
          >
            <IconDashboardGrid className="w-5 h-5 flex-shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('transactions');
              setMobileMenuOpen(false);
            }}
            className={`atur-sidebar-link ${
              activeTab === 'transactions' ? 'atur-sidebar-link-active' : ''
            }`}
          >
            <IconTransactionsArrows className="w-5 h-5 flex-shrink-0" />
            <span>Transactions</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('budgeting');
              setMobileMenuOpen(false);
            }}
            className={`atur-sidebar-link ${
              activeTab === 'budgeting' ? 'atur-sidebar-link-active' : ''
            }`}
          >
            <IconBudgetHand className="w-5 h-5 flex-shrink-0" />
            <span>Budgeting</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('saving-pocket');
              setSelectedPocketId(null);
              setMobileMenuOpen(false);
            }}
            className={`atur-sidebar-link ${
              activeTab === 'saving-pocket' ? 'atur-sidebar-link-active' : ''
            }`}
          >
            <IconWalletPocket className="w-5 h-5 flex-shrink-0" />
            <span>Saving Pocket</span>
          </button>
        </nav>
      </div>

      {/* Bottom Free Plan & Logout */}
      <div className="border-t border-slate-300/70 pt-6 pb-8">
        <div className="atur-free-plan-box">
          <div className="flex items-center justify-center gap-1.5 text-[#1D5BF2]">
            <Crown className="w-[17px] h-[17px] stroke-[2]" />
            <span className="text-[15.5px] font-semibold tracking-tight">
              Free Plan
            </span>
          </div>
          <p className="text-[10.5px] font-medium text-[#2563EB] mt-0.5">
            Maximal 2 Saving Pocket
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="atur-sidebar-link mt-5 hover:text-red-600"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="atur-dashboard-shell">
      {/* Desktop Left Sidebar (Exact 300px) */}
      <aside className="atur-sidebar hidden lg:flex">{renderSidebarContent()}</aside>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="atur-sidebar relative z-10 flex h-full">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Tutup menu"
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="atur-dashboard-main">
        <div className="max-w-[1040px] mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between lg:justify-end">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Buka menu"
              className="lg:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-700 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-5 text-[#1E293B] relative">
              {utilityNotice && (
                <div className="absolute right-0 top-9 z-30 whitespace-nowrap bg-slate-900 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-lg">
                  {utilityNotice}
                </div>
              )}
              <button
                type="button"
                onClick={() => triggerNotice('Mode terang aktif secara default.')}
                aria-label="Tema"
                className="p-1 text-[#1E293B] hover:text-[#1D5BF2] transition-colors cursor-pointer"
              >
                <Moon className="w-[21px] h-[21px] stroke-[1.8]" />
              </button>
              <button
                type="button"
                onClick={() => triggerNotice('Belum ada notifikasi baru.')}
                aria-label="Notifikasi"
                className="p-1 text-[#1E293B] hover:text-[#1D5BF2] transition-colors cursor-pointer"
              >
                <Bell className="w-[21px] h-[21px] stroke-[1.8]" />
              </button>
              <button
                type="button"
                onClick={() => triggerNotice(`Masuk sebagai ${userName}`)}
                aria-label="Profil pengguna"
                className="flex items-center gap-1 p-1 text-[#1E293B] hover:text-[#1D5BF2] transition-colors cursor-pointer"
              >
                <UserCircle2 className="w-[24px] h-[24px] stroke-[1.7]" />
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* Page Title & Quick Actions (Tab-Aware) */}
          {activeTab === 'dashboard' && (
            <>
              <div className="mt-2">
                <h1 className="text-[32px] sm:text-[36px] font-bold text-black tracking-[-0.025em] leading-[1.15]">
                  Halo {userName}!
                </h1>
                <p className="text-[14.5px] font-normal text-[#1E293B] mt-2.5">
                  Pantau arus kas dan alokasikan anggaranmu.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3.5 lg:gap-[22px]">
                <button
                  type="button"
                  onClick={() => openModal('income')}
                  className="atur-action-btn atur-action-btn-primary"
                >
                  <PlusCircle className="w-[19px] h-[19px] stroke-[2]" />
                  <span>Tambah Pemasukan</span>
                </button>

                <button
                  type="button"
                  onClick={() => openModal('expense')}
                  className="atur-action-btn"
                >
                  <MinusCircle className="w-[19px] h-[19px] stroke-[1.8]" />
                  <span>Tambah Pengeluaran</span>
                </button>

                <button
                  type="button"
                  onClick={() => openModal('budget')}
                  className="atur-action-btn"
                >
                  <IconBudgetHand className="w-[19px] h-[19px]" />
                  <span>Buat Budget</span>
                </button>

                <button
                  type="button"
                  onClick={() => openModal('pocket')}
                  className="atur-action-btn"
                >
                  <IconWalletPocket className="w-[19px] h-[19px]" />
                  <span>Buat Pocket</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'transactions' && (
            <>
              <div className="mt-2">
                <h1 className="text-[32px] sm:text-[36px] font-bold text-black tracking-[-0.025em] leading-[1.15]">
                  Transactions
                </h1>
                <p className="text-[14.5px] font-normal text-[#1E293B] mt-2.5">
                  Kelola pemasukan dan pengeluaranmu secara sadar dan terencana.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3.5 lg:gap-[22px]">
                <button
                  type="button"
                  onClick={() => openModal('income')}
                  className="atur-action-btn atur-action-btn-primary w-full sm:w-[277px]"
                >
                  <PlusCircle className="w-[19px] h-[19px] stroke-[2]" />
                  <span>Tambah Pemasukan</span>
                </button>

                <button
                  type="button"
                  onClick={() => openModal('expense')}
                  className="atur-action-btn w-full sm:w-[277px]"
                >
                  <MinusCircle className="w-[19px] h-[19px] stroke-[1.8]" />
                  <span>Tambah Pengeluaran</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'budgeting' && (
            <>
              <div className="mt-2">
                <h1 className="text-[32px] sm:text-[36px] font-bold text-black tracking-[-0.025em] leading-[1.15]">
                  Budgeting
                </h1>
                <p className="text-[14.5px] font-normal text-[#1E293B] mt-2.5">
                  Atur dan pantau anggaranmu secara terencana.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4 lg:gap-[24px]">
                <button
                  type="button"
                  onClick={() => openModal('budget')}
                  className="atur-pill-action-btn atur-pill-action-btn-primary w-full sm:w-[277px]"
                >
                  <PlusCircle className="w-[19px] h-[19px] stroke-[2]" />
                  <span>Tambah Pemasukan</span>
                </button>

                <div className="relative w-full sm:w-[273px]">
                  <button
                    type="button"
                    onClick={() => setBudgetMonthMenuOpen((prev) => !prev)}
                    className="atur-pill-month-btn w-full"
                  >
                    <span className="flex items-center gap-3">
                      <Calendar className="w-[18px] h-[18px] text-[#64748B]" />
                      <span>{budgetMonth}</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#64748B]" />
                  </button>

                  {budgetMonthMenuOpen && (
                    <div className="absolute left-0 top-[52px] w-full bg-white border border-slate-200 rounded-[16px] shadow-lg py-1.5 z-20">
                      {MONTH_OPTIONS.map((month) => (
                        <button
                          key={month}
                          type="button"
                          onClick={() => {
                            setBudgetMonth(month);
                            setBudgetMonthMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-[14px] font-medium hover:bg-slate-50 cursor-pointer ${
                            budgetMonth === month
                              ? 'text-[#1D5BF2] bg-blue-50/50'
                              : 'text-[#334155]'
                          }`}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'saving-pocket' && !selectedPocket && (
            <>
              <div className="mt-2">
                <h1 className="text-[32px] sm:text-[36px] font-bold text-black tracking-[-0.025em] leading-[1.15]">
                  Saving Pocket
                </h1>
                <p className="text-[14.5px] font-normal text-[#1E293B] mt-2.5">
                  Wujudkan tujuan tabunganmu secara sadar dan terencana.
                </p>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => openModal('pocket')}
                  className="atur-pill-action-btn atur-pill-action-btn-primary w-full sm:w-[199px]"
                >
                  <PlusCircle className="w-[19px] h-[19px] stroke-[2]" />
                  <span>Buat Pocket</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'saving-pocket' && selectedPocket && (
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setSelectedPocketId(null)}
                className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-[#1D5BF2] hover:text-[#1D4ED8] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
                <span>Back</span>
              </button>

              <h1 className="text-[32px] sm:text-[36px] font-bold text-black tracking-[-0.025em] leading-[1.15] mt-3">
                Detail Pocket
              </h1>
              <p className="text-[14.5px] font-normal text-[#1E293B] mt-2.5">
                Wujudkan tujuan tabunganmu secara sadar dan terencana.
              </p>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <>
              {/* 3 Summary Cards */}
              <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-[25px]">
                {/* Saldo Tersedia */}
                <div className="atur-summary-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[16.5px] font-semibold text-[#0F172A]">
                      Saldo Tersedia
                    </span>
                    <IconBanknote className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <p className="text-[30px] sm:text-[32px] font-bold text-black tracking-[-0.02em] leading-none">
                    {formatRupiah(availableBalance)}
                  </p>
                </div>

                {/* Total Pemasukan */}
                <div className="atur-summary-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[16.5px] font-semibold text-[#0F172A]">
                      Total Pemasukan
                    </span>
                    <IconMoneyIn className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <p className="text-[30px] sm:text-[32px] font-bold text-[#15803D] tracking-[-0.02em] leading-none">
                    {formatRupiah(totalIncome)}
                  </p>
                </div>

                {/* Total Pengeluaran */}
                <div className="atur-summary-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[16.5px] font-semibold text-[#0F172A]">
                      Total Pengeluaran
                    </span>
                    <IconMoneyOut className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <p className="text-[30px] sm:text-[32px] font-bold text-[#B91C1C] tracking-[-0.02em] leading-none">
                    {formatRupiah(totalExpense)}
                  </p>
                </div>
              </div>

              {/* Month Dropdown Row */}
              <div className="mt-7 flex justify-end relative">
                <button
                  type="button"
                  onClick={() => setMonthMenuOpen((prev) => !prev)}
                  className="w-[273px] h-[46px] bg-white border border-[#94A3B8] rounded-[14px] px-4 flex items-center justify-between text-[#475569] text-[15px] font-medium hover:border-[#64748B] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <Calendar className="w-[18px] h-[18px] text-[#64748B]" />
                    <span>{selectedMonth}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#64748B]" />
                </button>

                {monthMenuOpen && (
                  <div className="absolute right-0 top-[52px] w-[273px] bg-white border border-slate-200 rounded-[14px] shadow-lg py-1.5 z-20">
                    {MONTH_OPTIONS.map((month) => (
                      <button
                        key={month}
                        type="button"
                        onClick={() => {
                          setSelectedMonth(month);
                          setMonthMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[14px] font-medium hover:bg-slate-50 cursor-pointer ${
                          selectedMonth === month
                            ? 'text-[#1D5BF2] bg-blue-50/50'
                            : 'text-[#334155]'
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom 2 Cards */}
              <div className="mt-7 grid grid-cols-1 xl:grid-cols-2 gap-[32px]">
                {/* Left Card: Budget Overview */}
                <section className="atur-panel-card flex flex-col justify-between">
                  <div>
                    <h2 className="text-[18.5px] font-bold text-black tracking-tight mb-6">
                      Budget Overview
                    </h2>

                    <div className="space-y-4">
                      {budgets.map((budget) => {
                        const pct =
                          budget.limit > 0
                            ? Math.min(100, (budget.spent / budget.limit) * 100)
                            : 0;
                        return (
                          <div key={budget.id}>
                            <div className="flex items-center justify-between text-[13.5px]">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: budget.color }}
                                />
                                <span className="font-bold text-[#0F172A]">
                                  {budget.name}
                                </span>
                              </div>
                              <span className="text-[12.5px] font-medium text-[#64748B]">
                                {formatRupiah(budget.spent)} / {formatRupiah(budget.limit)}
                              </span>
                            </div>
                            <div className="atur-progress-track mt-2">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: budget.color,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-[12.5px] text-[#0F172A]">
                    <Info className="w-[15px] h-[15px] text-[#0F172A] flex-shrink-0" />
                    <span>
                      Terpakai <strong className="font-bold">{formatRupiah(totalExpense)}</strong> dari{' '}
                      {formatRupiah(totalBudgetLimit)}
                    </span>
                  </div>
                </section>

                {/* Right Card: Analisis Pengeluaran */}
                <section className="atur-panel-card flex flex-col">
                  <h2 className="text-[18.5px] font-bold text-black tracking-tight mb-5">
                    Analisis Pengeluaran
                  </h2>

                  <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Donut Chart */}
                    <div className="relative w-[184px] h-[184px] flex-shrink-0 flex items-center justify-center">
                      <svg
                        viewBox="0 0 184 184"
                        className="w-full h-full -rotate-90"
                        aria-label="Grafik Donat Analisis Pengeluaran"
                      >
                        <circle
                          cx="92"
                          cy="92"
                          r="72"
                          fill="transparent"
                          stroke="#E2E8F0"
                          strokeWidth="26"
                        />
                        {donutSegments.map((seg) => (
                          <circle
                            key={seg.id}
                            cx="92"
                            cy="92"
                            r={seg.radius}
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="26"
                            strokeDasharray={seg.strokeDasharray}
                            strokeDashoffset={seg.strokeDashoffset}
                            strokeLinecap="butt"
                          />
                        ))}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <span className="text-[11.5px] font-medium text-[#64748B]">
                          Total Keluar
                        </span>
                        <span className="text-[16.5px] font-bold text-black mt-0.5 tracking-tight">
                          {formatRupiah(totalExpense)}
                        </span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 w-full space-y-3.5 sm:pl-3">
                      {expenseBreakdown.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 pt-0.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-[14px] font-bold text-[#0F172A]">
                              {item.name}
                            </span>
                          </div>
                          <div className="text-right leading-tight">
                            <p className="text-[13.5px] font-bold text-[#0F172A]">
                              {item.percentage.toFixed(1)}%
                            </p>
                            <p className="text-[12px] font-medium text-[#64748B] mt-0.5">
                              {formatRupiah(item.spent)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {/* Transactions View (100% Matching Transactions_b749c13f.png) */}
          {activeTab === 'transactions' && (
            <>
              {/* 2 Summary Cards (Total Pemasukan & Total Pengeluaran) */}
              <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-[38px]">
                <div className="atur-tx-summary-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[16.5px] font-semibold text-black">
                      Total Pemasukan
                    </span>
                    <IconMoneyIn className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <p className="text-[30px] sm:text-[32px] font-bold text-[#15803D] tracking-[-0.02em] leading-none">
                    {formatRupiah(totalIncome)}
                  </p>
                </div>

                <div className="atur-tx-summary-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[16.5px] font-semibold text-black">
                      Total Pengeluaran
                    </span>
                    <IconMoneyOut className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <p className="text-[30px] sm:text-[32px] font-bold text-[#B91C1C] tracking-[-0.02em] leading-none">
                    {formatRupiah(totalExpense)}
                  </p>
                </div>
              </div>

              {/* 4-Item Search & Filter Row */}
              <div className="mt-8 flex flex-wrap lg:flex-nowrap items-center gap-3.5 lg:gap-[18px]">
                {/* Search Input */}
                <div className="atur-tx-filter-control w-full lg:w-[298px] px-4 flex items-center gap-3">
                  <Search className="w-[18px] h-[18px] text-[#64748B] flex-shrink-0" />
                  <input
                    type="text"
                    value={txSearchQuery}
                    onChange={(e) => setTxSearchQuery(e.target.value)}
                    placeholder="Cari transaksi"
                    aria-label="Cari transaksi"
                    className="w-full h-full bg-transparent border-none outline-none text-[14.5px] font-medium text-[#0F172A] placeholder:text-[#64748B]"
                  />
                </div>

                {/* Month Filter Dropdown */}
                <div className="relative w-full sm:w-[calc(50%-7px)] lg:w-[249px]">
                  <button
                    type="button"
                    onClick={() => setTxMonthMenuOpen((prev) => !prev)}
                    className="atur-tx-filter-control w-full px-4 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Calendar className="w-[18px] h-[18px] text-[#64748B] flex-shrink-0" />
                      <span className="truncate">{txMonthFilter}</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#64748B] flex-shrink-0" />
                  </button>

                  {txMonthMenuOpen && (
                    <div className="absolute left-0 top-[51px] w-full bg-white border border-slate-200 rounded-[14px] shadow-lg py-1.5 z-20">
                      {['Semua Bulan', ...MONTH_OPTIONS].map((month) => (
                        <button
                          key={month}
                          type="button"
                          onClick={() => {
                            setTxMonthFilter(month);
                            setTxMonthMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-[14px] font-medium hover:bg-slate-50 cursor-pointer ${
                            txMonthFilter === month
                              ? 'text-[#1D5BF2] bg-blue-50/50'
                              : 'text-[#334155]'
                          }`}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Transaction Type Select */}
                <div className="relative w-full sm:w-[calc(50%-7px)] lg:w-[223px]">
                  <select
                    value={txTypeFilter}
                    onChange={(e) =>
                      setTxTypeFilter(e.target.value as 'all' | 'income' | 'expense')
                    }
                    aria-label="Filter jenis transaksi"
                    className="atur-tx-filter-control w-full px-4 pr-9 appearance-none cursor-pointer outline-none"
                  >
                    <option value="all">Semua Transaksi</option>
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Category Filter Select */}
                <div className="relative w-full lg:w-[212px]">
                  <select
                    value={txCategoryFilter}
                    onChange={(e) => setTxCategoryFilter(e.target.value)}
                    aria-label="Filter kategori transaksi"
                    className="atur-tx-filter-control w-full px-4 pr-9 appearance-none cursor-pointer outline-none"
                  >
                    <option value="all">Semua Kategori</option>
                    {txCategoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Daftar Transaksi Table */}
              <section className="mt-7">
                <h2 className="text-[18.5px] font-bold text-black tracking-tight mb-4">
                  Daftar Transaksi
                </h2>

                <div className="atur-tx-table-card">
                  <div className="overflow-x-auto">
                    <div className="min-w-[640px]">
                      <div className="atur-tx-table-header">
                        <span>Transaksi</span>
                        <span>Kategori</span>
                        <span>Tanggal</span>
                        <span>Nominal</span>
                      </div>

                      <div className="py-3">
                        {filteredTransactions.length === 0 ? (
                          <div className="py-10 text-center text-[14px] font-medium text-[#64748B]">
                            Belum ada transaksi yang sesuai filter.
                          </div>
                        ) : (
                          filteredTransactions.map((tx) => (
                            <div key={tx.id} className="atur-tx-table-row">
                              <span className="truncate px-2">{tx.title}</span>
                              <span>{tx.category}</span>
                              <span>{tx.date}</span>
                              <span>
                                {tx.type === 'income' ? '+' : '-'}
                                {formatRupiah(tx.amount)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Budgeting View (100% Matching Budgeting_f7a54937.png) */}
          {activeTab === 'budgeting' && (
            <>
              {/* 3 Summary Cards */}
              <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-[25px]">
                {/* Total Anggaran */}
                <div className="atur-summary-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[16.5px] font-semibold text-black">
                      Total Anggaran
                    </span>
                    <IconBudgetHand className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <p className="text-[30px] sm:text-[32px] font-bold text-black tracking-[-0.02em] leading-none">
                    {formatRupiah(totalBudgetLimit)}
                  </p>
                </div>

                {/* Total Terpakai */}
                <div className="atur-summary-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[16.5px] font-semibold text-black">
                      Total Terpakai
                    </span>
                    <IconMoneyOut className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <p className="text-[30px] sm:text-[32px] font-bold text-[#B91C1C] tracking-[-0.02em] leading-none">
                    {formatRupiah(totalExpense)}
                  </p>
                </div>

                {/* Sisa Anggaran */}
                <div className="atur-summary-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[16.5px] font-semibold text-black">
                      Sisa Anggaran
                    </span>
                    <IconCoinsStack className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <p
                    className={`text-[30px] sm:text-[32px] font-bold tracking-[-0.02em] leading-none ${
                      totalBudgetLimit - totalExpense < 0
                        ? 'text-[#B91C1C]'
                        : 'text-[#15803D]'
                    }`}
                  >
                    {totalBudgetLimit - totalExpense < 0
                      ? `-${formatRupiah(Math.abs(totalBudgetLimit - totalExpense))}`
                      : formatRupiah(totalBudgetLimit - totalExpense)}
                  </p>
                </div>
              </div>

              {/* Anggaran Per Kategori Section */}
              <section className="mt-9">
                <h2 className="text-[18.5px] font-bold text-black tracking-tight mb-5">
                  Anggaran Per Kategori
                </h2>

                <div className="atur-budget-panel flex flex-col justify-between">
                  {budgets.length === 0 ? (
                    <div className="py-12 text-center text-[14.5px] font-medium text-[#64748B]">
                      Belum ada anggaran kategori. Klik tombol Tambah untuk membuat budget baru.
                    </div>
                  ) : (
                    <div className="space-y-9">
                      {budgets.map((budget) => {
                        const remaining = budget.limit - budget.spent;
                        const isOver = budget.spent > budget.limit;
                        const isFull = budget.spent === budget.limit;
                        const pct =
                          budget.limit > 0
                            ? Math.min(100, (budget.spent / budget.limit) * 100)
                            : 0;
                        const barColor = isOver
                          ? '#B91C1C'
                          : isFull
                          ? '#C2410C'
                          : '#2563EB';
                        const displayName = budget.budgetLabel || budget.name;

                        return (
                          <div
                            key={budget.id}
                            className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6"
                          >
                            {/* Category Label */}
                            <div className="md:w-[190px] flex-shrink-0">
                              <span className="text-[14.5px] font-medium text-[#0F172A]">
                                {displayName}
                              </span>
                            </div>

                            {/* Progress Bar + Spent / Limit */}
                            <div className="flex-1 max-w-[495px]">
                              <div className="text-[13.5px] leading-snug">
                                <span
                                  className={`font-bold ${
                                    isOver ? 'text-[#B91C1C]' : 'text-[#0F172A]'
                                  }`}
                                >
                                  {formatRupiah(budget.spent)}
                                </span>
                                <span className="text-[#475569] font-normal">
                                  {' '}
                                  / {formatRupiah(budget.limit)}
                                </span>
                              </div>
                              <div className="atur-budget-track mt-2">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: barColor,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Remaining & Edit Action */}
                            <div className="flex items-center justify-between md:justify-end gap-7 md:min-w-[165px] flex-shrink-0">
                              <span
                                className={`text-[13px] font-medium ${
                                  remaining <= 0 ? 'text-[#B91C1C]' : 'text-[#475569]'
                                }`}
                              >
                                {remaining < 0
                                  ? `-${formatRupiah(Math.abs(remaining))}`
                                  : remaining === 0
                                  ? 'Sisa Rp0'
                                  : `Sisa ${formatRupiah(remaining)}`}
                              </span>

                              <button
                                type="button"
                                onClick={() => openEditBudgetModal(budget)}
                                className="text-[13.5px] font-bold text-[#1D5BF2] hover:text-[#1D4ED8] transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Saving Pocket List View (100% Matching Saving_Pocket_33345203.png) */}
          {activeTab === 'saving-pocket' && !selectedPocket && (
            <>
              {/* 3 Summary Cards */}
              <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-[25px]">
                {/* Total Terkumpul */}
                <div className="atur-summary-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[16.5px] font-semibold text-black">
                      Total Terkumpul
                    </span>
                    <IconWalletPocket className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <p className="text-[30px] sm:text-[32px] font-bold text-black tracking-[-0.02em] leading-none">
                    {formatRupiah(totalPocketSaved)}
                  </p>
                </div>

                {/* Total Target */}
                <div className="atur-summary-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[16.5px] font-semibold text-black">
                      Total Target
                    </span>
                    <IconMoneyBag className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <p className="text-[30px] sm:text-[32px] font-bold text-black tracking-[-0.02em] leading-none">
                    {formatRupiah(totalPocketTarget)}
                  </p>
                </div>

                {/* Progress */}
                <div className="atur-summary-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[16.5px] font-semibold text-black">
                      Progress
                    </span>
                    <IconBarChart className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-[30px] sm:text-[32px] font-bold text-[#15803D] tracking-[-0.02em] leading-none">
                      {totalPocketProgress}%
                    </p>
                    <p className="text-[11.5px] font-normal text-[#64748B] mt-1.5">
                      {formatRupiah(Math.max(0, totalPocketTarget - totalPocketSaved))} tersisa untuk dipenuhi
                    </p>
                  </div>
                </div>
              </div>

              {/* Pocket Saya Section */}
              <section className="mt-9">
                <h2 className="text-[18.5px] font-bold text-black tracking-tight mb-5">
                  Pocket Saya
                </h2>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-[40px]">
                  {pockets.map((pocket) => {
                    const pct =
                      pocket.target > 0
                        ? Math.min(100, (pocket.saved / pocket.target) * 100)
                        : 0;
                    const remaining = Math.max(0, pocket.target - pocket.saved);
                    return (
                      <div key={pocket.id} className="atur-pocket-card">
                        <div>
                          <h3 className="text-[18.5px] font-bold text-black tracking-tight">
                            {pocket.name}
                          </h3>
                          <p className="text-[12px] font-normal text-[#64748B] mt-1.5">
                            {pocket.description}
                          </p>

                          <div className="mt-6 flex items-baseline gap-1.5">
                            <span className="text-[22px] font-bold text-black tracking-tight">
                              {formatRupiah(pocket.saved)}
                            </span>
                            <span className="text-[12.5px] font-medium text-[#64748B]">
                              / {formatRupiah(pocket.target)}
                            </span>
                          </div>

                          <div className="atur-budget-track mt-2.5">
                            <div
                              className="h-full rounded-full bg-[#1D5BF2] transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          <p className="text-[12px] font-normal text-[#64748B] mt-2.5">
                            {formatRupiah(remaining)} tersisa untuk dipenuhi
                          </p>

                          <div className="mt-6">
                            <div className="atur-pocket-target-pill">
                              <Calendar className="w-[18px] h-[18px] flex-shrink-0" />
                              <span>Target {pocket.targetDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-7 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedPocketId(pocket.id)}
                            className="text-[12.5px] font-semibold text-[#1D5BF2] hover:text-[#1D4ED8] transition-colors cursor-pointer"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* Detail Saving Pocket View (100% Matching Detail_Saving_Pocket_e6221883.png) */}
          {activeTab === 'saving-pocket' && selectedPocket && (
            <>
              <div className="atur-detail-panel mt-7">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[18.5px] font-bold text-black tracking-tight">
                      {selectedPocket.name}
                    </h2>
                    <p className="text-[12.5px] font-normal text-[#64748B] mt-1">
                      {selectedPocket.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openModal('deposit')}
                      className="atur-pill-action-btn atur-pill-action-btn-primary h-[44px] px-6"
                    >
                      <PlusCircle className="w-[18px] h-[18px] stroke-[2]" />
                      <span>Setor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openModal('withdraw')}
                      className="h-[44px] px-6 rounded-full border border-[#94A3B8] bg-white hover:border-[#64748B] text-[#475569] text-[15px] font-medium inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <MinusCircle className="w-[18px] h-[18px] stroke-[1.8]" />
                      <span>Tarik</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 max-w-[388px]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[22px] font-bold text-black tracking-tight">
                      {formatRupiah(selectedPocket.saved)}
                    </span>
                    <span className="text-[12.5px] font-medium text-[#64748B]">
                      / {formatRupiah(selectedPocket.target)}
                    </span>
                  </div>

                  <div className="atur-budget-track mt-2.5">
                    <div
                      className="h-full rounded-full bg-[#1D5BF2] transition-all duration-300"
                      style={{
                        width: `${
                          selectedPocket.target > 0
                            ? Math.min(
                                100,
                                (selectedPocket.saved / selectedPocket.target) * 100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <p className="text-[12px] font-normal text-[#64748B] mt-2.5">
                    {formatRupiah(Math.max(0, selectedPocket.target - selectedPocket.saved))}{' '}
                    tersisa untuk dipenuhi
                  </p>

                  <div className="mt-6">
                    <div className="atur-pocket-target-pill">
                      <Calendar className="w-[18px] h-[18px] flex-shrink-0" />
                      <span>Target {selectedPocket.targetDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Riwayat Aktivitas */}
              <section className="mt-9">
                <h2 className="text-[18.5px] font-bold text-black tracking-tight mb-5">
                  Riwayat Aktivitas
                </h2>

                <div className="atur-detail-panel">
                  {selectedPocket.activities.length === 0 ? (
                    <p className="py-8 text-center text-[14px] font-medium text-[#64748B]">
                      Belum ada aktivitas setoran atau penarikan pada pocket ini.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {selectedPocket.activities.map((act) => (
                        <div
                          key={act.id}
                          className="flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-[15px] font-medium text-[#0F172A]">
                              {act.title}
                            </p>
                            <p className="text-[12px] font-normal text-[#64748B] mt-0.5 truncate">
                              {act.note}
                            </p>
                          </div>

                          <div className="flex items-center gap-6 sm:gap-10 flex-shrink-0">
                            <span
                              className={`text-[13px] font-medium ${
                                act.type === 'deposit'
                                  ? 'text-[#15803D]'
                                  : 'text-[#B91C1C]'
                              }`}
                            >
                              {act.type === 'deposit' ? '+' : '-'}
                              {formatRupiah(act.amount)}
                            </span>
                            <span className="text-[13px] font-semibold text-[#1D5BF2] min-w-[116px] text-right">
                              {act.date}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODALS (100% Matching Provided Modal Screenshots)                         */}
      {/* ========================================================================= */}

      {/* 1. TAMBAH PEMASUKAN MODAL */}
      {activeModal === 'income' && (
        <div className="atur-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-income-title">
          <div className="atur-modal-card px-8 sm:px-9 pt-7 pb-8">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              aria-label="Tutup modal"
              className="absolute top-6 right-6 text-black hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>

            <h2 id="modal-income-title" className="text-[22px] font-bold text-black mb-6">
              Tambah Pemasukan
            </h2>

            <form onSubmit={handleSaveIncome} noValidate className="space-y-4">
              <div>
                <label htmlFor="income-nominal" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Nominal<span className="text-red-500">*</span>
                </label>
                <input
                  id="income-nominal"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={nominalInput}
                  onKeyDown={handleDigitsOnlyKeyDown}
                  onChange={(e) => setNominalInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Rp (Masukkan jumlah pemasukan)"
                  className="atur-modal-input"
                />
              </div>

              <div>
                <label htmlFor="income-category" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Kategori<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="income-category"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className={`atur-modal-input appearance-none pr-10 cursor-pointer ${
                      categoryInput ? 'text-[#0F172A]' : 'text-[#64748B]'
                    }`}
                  >
                    <option value="">Pilih kategori</option>
                    {INCOME_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="text-[#0F172A]">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#475569] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="income-date" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Tanggal<span className="text-red-500">*</span>
                </label>
                <DateInputWithPicker
                  id="income-date"
                  value={dateInput}
                  onChange={setDateInput}
                />
              </div>

              <div>
                <label htmlFor="income-note" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Keterangan (opsional)
                </label>
                <input
                  id="income-note"
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Contoh: Uang bulanan"
                  className="atur-modal-input"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="atur-modal-btn-cancel"
                >
                  Batal
                </button>
                <button type="submit" className="atur-modal-btn-save">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. TAMBAH PENGELUARAN MODAL */}
      {activeModal === 'expense' && (
        <div className="atur-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-expense-title">
          <div className="atur-modal-card px-8 sm:px-9 pt-7 pb-8">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              aria-label="Tutup modal"
              className="absolute top-6 right-6 text-black hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>

            <h2 id="modal-expense-title" className="text-[22px] font-bold text-black mb-6">
              Tambah Pengeluaran
            </h2>

            <form onSubmit={handleSaveExpense} noValidate className="space-y-4">
              <div>
                <label htmlFor="expense-nominal" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Nominal<span className="text-red-500">*</span>
                </label>
                <input
                  id="expense-nominal"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={nominalInput}
                  onKeyDown={handleDigitsOnlyKeyDown}
                  onChange={(e) => setNominalInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Rp (Masukkan jumlah pengeluaran)"
                  className="atur-modal-input"
                />
              </div>

              <div>
                <label htmlFor="expense-category" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Kategori<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="expense-category"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className={`atur-modal-input appearance-none pr-10 cursor-pointer ${
                      categoryInput ? 'text-[#0F172A]' : 'text-[#64748B]'
                    }`}
                  >
                    <option value="">Pilih kategori</option>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="text-[#0F172A]">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#475569] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="expense-date" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Tanggal<span className="text-red-500">*</span>
                </label>
                <DateInputWithPicker
                  id="expense-date"
                  value={dateInput}
                  onChange={setDateInput}
                />
              </div>

              <div>
                <label htmlFor="expense-note" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Keterangan (opsional)
                </label>
                <input
                  id="expense-note"
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Contoh: Makan siang"
                  className="atur-modal-input"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="atur-modal-btn-cancel"
                >
                  Batal
                </button>
                <button type="submit" className="atur-modal-btn-save">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. BUAT BUDGET MODAL (Matching Buat_Budget_9b99eeca.png) */}
      {activeModal === 'budget' && (
        <div className="atur-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-budget-title">
          <div className="atur-modal-card px-8 sm:px-9 pt-7 pb-8">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              aria-label="Tutup modal"
              className="absolute top-6 right-6 text-black hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>

            <h2 id="modal-budget-title" className="text-[22px] font-bold text-black mb-6">
              Buat Budget
            </h2>

            <form onSubmit={handleSaveBudget} noValidate className="space-y-4">
              <div>
                <label htmlFor="budget-category" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Kategori<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="budget-category"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className={`atur-modal-input appearance-none pr-10 cursor-pointer ${
                      categoryInput ? 'text-[#0F172A]' : 'text-[#64748B]'
                    }`}
                  >
                    <option value="">Pilih kategori</option>
                    {BUDGET_CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat} className="text-[#0F172A]">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#475569] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="budget-limit" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Batas Anggaran
                </label>
                <input
                  id="budget-limit"
                  type="text"
                  inputMode="numeric"
                  value={nominalInput}
                  onChange={(e) => setNominalInput(e.target.value)}
                  placeholder="Rp (Masukkan anggaran)"
                  className="atur-modal-input"
                />
              </div>

              <div>
                <label htmlFor="budget-date" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Periode Budget<span className="text-red-500">*</span>
                </label>
                <DateInputWithPicker
                  id="budget-date"
                  value={dateInput}
                  onChange={setDateInput}
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="atur-modal-btn-cancel"
                >
                  Batal
                </button>
                <button type="submit" className="atur-modal-btn-save">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3B. EDIT BUDGET MODAL (Matching Edit_Budget_0398dd18.png) */}
      {activeModal === 'edit-budget' && (
        <div className="atur-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-edit-budget-title">
          <div className="atur-modal-card px-8 sm:px-9 pt-7 pb-8">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              aria-label="Tutup modal"
              className="absolute top-6 right-6 text-black hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>

            <h2 id="modal-edit-budget-title" className="text-[22px] font-bold text-black mb-6">
              Edit Budget
            </h2>

            <form onSubmit={handleUpdateBudget} noValidate className="space-y-4">
              <div>
                <label htmlFor="edit-budget-category" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Kategori<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="edit-budget-category"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className={`atur-modal-input appearance-none pr-10 cursor-pointer ${
                      categoryInput ? 'text-[#0F172A]' : 'text-[#64748B]'
                    }`}
                  >
                    <option value="">Pilih kategori</option>
                    {BUDGET_CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat} className="text-[#0F172A]">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#475569] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="edit-budget-limit" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Batas Anggaran
                </label>
                <input
                  id="edit-budget-limit"
                  type="text"
                  inputMode="numeric"
                  value={nominalInput}
                  onChange={(e) => setNominalInput(e.target.value)}
                  placeholder="Rp (Masukkan anggaran)"
                  className="atur-modal-input"
                />
              </div>

              <div>
                <label htmlFor="edit-budget-date" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Periode Budget<span className="text-red-500">*</span>
                </label>
                <DateInputWithPicker
                  id="edit-budget-date"
                  value={dateInput}
                  onChange={setDateInput}
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleDeleteBudget}
                  className="atur-modal-btn-cancel"
                >
                  Hapus Budget
                </button>
                <button type="submit" className="atur-modal-btn-save">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. BUAT SAVING POCKET MODAL (Matching Buat_Saving_Pocket_e0c74d03.png) */}
      {activeModal === 'pocket' && (
        <div className="atur-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-pocket-title">
          <div className="atur-modal-card px-8 sm:px-9 pt-7 pb-8">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              aria-label="Tutup modal"
              className="absolute top-6 right-6 text-black hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>

            <h2 id="modal-pocket-title" className="text-[22px] font-bold text-black mb-6">
              Buat Saving Pocket
            </h2>

            <form onSubmit={handleSavePocket} noValidate className="space-y-4">
              <div>
                <label htmlFor="pocket-name" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Nama Pocket<span className="text-red-500">*</span>
                </label>
                <input
                  id="pocket-name"
                  type="text"
                  value={pocketNameInput}
                  onChange={(e) => setPocketNameInput(e.target.value)}
                  placeholder="Masukkan nama pocket"
                  className="atur-modal-input"
                />
              </div>

              <div>
                <label htmlFor="pocket-note" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Keterangan (opsional)
                </label>
                <input
                  id="pocket-note"
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Contoh: persiapan tour"
                  className="atur-modal-input"
                />
              </div>

              <div>
                <label htmlFor="pocket-target" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Target Tabungan
                </label>
                <input
                  id="pocket-target"
                  type="text"
                  inputMode="numeric"
                  value={pocketTargetInput}
                  onChange={(e) => setPocketTargetInput(e.target.value)}
                  placeholder="Rp (Masukkan target tabungan)"
                  className="atur-modal-input"
                />
              </div>

              <div>
                <label htmlFor="pocket-target-date" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Tanggal Target Tabungan
                </label>
                <DateInputWithPicker
                  id="pocket-target-date"
                  value={pocketDateInput}
                  onChange={setPocketDateInput}
                  placeholder="Masukkan target tanggal"
                  className="atur-modal-input pr-11"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="atur-modal-btn-cancel"
                >
                  Batal
                </button>
                <button type="submit" className="atur-modal-btn-save">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4B. SETOR TABUNGAN MODAL (Matching Setor_Tabungan_467c230c.png) */}
      {activeModal === 'deposit' && (
        <div className="atur-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-deposit-title">
          <div className="atur-modal-card px-8 sm:px-9 pt-7 pb-8">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              aria-label="Tutup modal"
              className="absolute top-6 right-6 text-black hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>

            <h2 id="modal-deposit-title" className="text-[22px] font-bold text-black mb-6">
              Setor Tabungan
            </h2>

            <form onSubmit={handleDepositPocket} noValidate className="space-y-4">
              <div>
                <label htmlFor="deposit-nominal" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Nominal<span className="text-red-500">*</span>
                </label>
                <input
                  id="deposit-nominal"
                  type="text"
                  inputMode="numeric"
                  value={nominalInput}
                  onChange={(e) => setNominalInput(e.target.value)}
                  placeholder="Rp (Masukkan jumlah setoran)"
                  className="atur-modal-input"
                />
              </div>

              <div>
                <label htmlFor="deposit-note" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Keterangan (opsional)
                </label>
                <input
                  id="deposit-note"
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Contoh: Sisa uang saku bulanan"
                  className="atur-modal-input"
                />
              </div>

              <div>
                <label htmlFor="deposit-date" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Tanggal<span className="text-red-500">*</span>
                </label>
                <DateInputWithPicker
                  id="deposit-date"
                  value={dateInput}
                  onChange={setDateInput}
                />
              </div>

              <label className="atur-modal-confirm-box select-none">
                <input
                  type="checkbox"
                  checked={confirmCommitmentChecked}
                  onChange={(e) => setConfirmCommitmentChecked(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-400 text-[#1D5BF2] focus:ring-[#1D5BF2] flex-shrink-0 cursor-pointer"
                />
                <div>
                  <p className="text-[13px] font-bold text-black leading-snug">
                    Saya sudah menyisihkan uang ini secara nyata
                  </p>
                  <p className="text-[11.5px] font-normal text-[#64748B] mt-0.5 leading-snug">
                    ATUR hanya mencatat komitmen tabungan secara mandiri.
                  </p>
                </div>
              </label>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="atur-modal-btn-cancel"
                >
                  Batal
                </button>
                <button type="submit" className="atur-modal-btn-save">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4C. TARIK TABUNGAN MODAL (Matching Tarik_Tabungan_ef47112b.png) */}
      {activeModal === 'withdraw' && (
        <div className="atur-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-withdraw-title">
          <div className="atur-modal-card px-8 sm:px-9 pt-7 pb-8">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              aria-label="Tutup modal"
              className="absolute top-6 right-6 text-black hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>

            <h2 id="modal-withdraw-title" className="text-[22px] font-bold text-black mb-6">
              Tarik Tabungan
            </h2>

            <form onSubmit={handleWithdrawPocket} noValidate className="space-y-4">
              <div>
                <label htmlFor="withdraw-nominal" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Nominal<span className="text-red-500">*</span>
                </label>
                <input
                  id="withdraw-nominal"
                  type="text"
                  inputMode="numeric"
                  value={nominalInput}
                  onChange={(e) => setNominalInput(e.target.value)}
                  placeholder="Rp (Masukkan jumlah penarikan)"
                  className="atur-modal-input"
                />
              </div>

              <div>
                <label htmlFor="withdraw-note" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Keterangan (opsional)
                </label>
                <input
                  id="withdraw-note"
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Contoh: Butuh uang banget"
                  className="atur-modal-input"
                />
              </div>

              <div>
                <label htmlFor="withdraw-date" className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
                  Tanggal<span className="text-red-500">*</span>
                </label>
                <DateInputWithPicker
                  id="withdraw-date"
                  value={dateInput}
                  onChange={setDateInput}
                />
              </div>

              <label className="atur-modal-confirm-box select-none">
                <input
                  type="checkbox"
                  checked={confirmCommitmentChecked}
                  onChange={(e) => setConfirmCommitmentChecked(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-400 text-[#1D5BF2] focus:ring-[#1D5BF2] flex-shrink-0 cursor-pointer"
                />
                <div>
                  <p className="text-[13px] font-bold text-black leading-snug">
                    Saya sudah mengambil uang ini secara nyata
                  </p>
                  <p className="text-[11.5px] font-normal text-[#64748B] mt-0.5 leading-snug">
                    ATUR hanya mencatat komitmen tabungan secara mandiri.
                  </p>
                </div>
              </label>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="atur-modal-btn-cancel"
                >
                  Batal
                </button>
                <button type="submit" className="atur-modal-btn-save">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. BERHASIL MODAL (Matching Berhasil__-_Dashboard_383651d0.png) */}
      {activeModal === 'success' && (
        <div className="atur-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-success-title">
          <div className="atur-modal-card py-14 px-9 text-center">
            <div className="w-[72px] h-[72px] rounded-full bg-[#15803D] text-white flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 stroke-[3.5]" />
            </div>

            <h2 id="modal-success-title" className="text-[22px] font-bold text-black mt-6">
              Data Berhasil Diperbarui
            </h2>
            <p className="text-[13.5px] text-[#1E293B] mt-3 max-w-[360px] mx-auto leading-relaxed">
              Perubahan data kamu berhasil disimpan. Informasi terbaru sudah diperbarui.
            </p>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="mt-7 w-full max-w-[310px] h-[48px] bg-[#1D5BF2] hover:bg-[#1D4ED8] text-white font-semibold text-[15px] rounded-[12px] transition-colors cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* 6. GAGAL MODAL (Matching Gagal_-_Dashboard_53e5a10f.png) */}
      {activeModal === 'error' && (
        <div className="atur-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-error-title">
          <div className="atur-modal-card py-14 px-9 text-center">
            <div className="w-[72px] h-[72px] rounded-full bg-[#B91C1C] text-white flex items-center justify-center mx-auto">
              <X className="w-10 h-10 stroke-[3.5]" />
            </div>

            <h2 id="modal-error-title" className="text-[22px] font-bold text-black mt-6">
              Gagal Memperbarui Data
            </h2>
            <p className="text-[13.5px] text-[#1E293B] mt-3 max-w-[370px] mx-auto leading-relaxed">
              Terjadi kendala saat menyimpan perubahan. Data kamu belum berhasil diperbarui. Silakan coba kembali.
            </p>

            <div className="mt-7 flex items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-[164px] h-[46px] bg-white border border-[#94A3B8] hover:bg-slate-50 text-[#0F172A] font-medium text-[14.5px] rounded-[12px] transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(lastFormModal)}
                className="w-[164px] h-[46px] bg-[#1D5BF2] hover:bg-[#1D4ED8] text-white font-semibold text-[14.5px] rounded-[12px] transition-colors cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. UPGRADE KE ATUR PREMIUM MODAL (Matching Validasi_Gagal_f61d9d0e.png) */}
      {activeModal === 'upgrade-premium' && (
        <div className="atur-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-upgrade-title">
          <div className="atur-modal-card py-12 px-9 text-center">
            <IconPremiumCrown className="w-[62px] h-[62px] text-[#1D5BF2] mx-auto" />

            <h2 id="modal-upgrade-title" className="text-[23px] font-bold text-black mt-5 tracking-tight">
              Upgrade ke ATUR Premium
            </h2>
            <p className="text-[13.5px] text-[#1E293B] mt-3 max-w-[360px] mx-auto leading-relaxed">
              Kamu telah mencapai batas maksimal 2 Saving Pocket
              <br />
              pada akun free Plan.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  triggerNotice('Paket ATUR Premium akan segera hadir.');
                }}
                className="w-full max-w-[270px] h-[46px] bg-[#1D5BF2] hover:bg-[#1D4ED8] text-white font-semibold text-[14.5px] rounded-[12px] transition-colors cursor-pointer"
              >
                Berlangganan Sekarang
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full max-w-[270px] h-[46px] bg-white border border-[#94A3B8] hover:bg-slate-50 text-[#64748B] font-medium text-[14.5px] rounded-[12px] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
