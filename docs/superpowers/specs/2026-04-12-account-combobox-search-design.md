# Account Combobox Search — Design Spec
**Date:** 2026-04-12
**Status:** Approved

---

## Overview

Replace the plain text search input on the Accounts page and the native `<select>` dropdowns in the Transfer form with a unified, reusable `AccountCombobox` component. The component provides a searchable dropdown with live filtering, highlighted match text, keyboard navigation, and account detail display — matching the pattern shown in the client reference video (Arabic accounting software combobox UX).

---

## Architecture

### New Component
**`src/components/accounts/AccountCombobox.tsx`**

```
Props:
  accounts: Account[]                    — full list of accounts to search
  onSelect: (account: Account) => void   — called on selection
  placeholder?: string                   — input placeholder (defaults to "بحث بالاسم أو رقم الحساب...")
  selectedAccount?: Account | null       — controlled: shows selected account in input
  disabled?: boolean                     — disables input and dropdown
```

### Files Modified
| File | Change |
|------|--------|
| `src/components/accounts/AccountCombobox.tsx` | **New** — shared combobox component |
| `src/components/accounts/AccountsListSection.tsx` | Replace `<input>` with `AccountCombobox`; `onSelect` → `router.push('/accounts/${id}')` |
| `src/components/transfer/AccountSelect.tsx` | Replace native `<select>` with `AccountCombobox`; `onSelect` → sets account in form state |

No other files require structural changes.

---

## Component Behavior

### Trigger
- Click or focus the input → dropdown opens immediately
- Shows up to 8 results; scrollable if more
- If input is empty, shows all accounts (up to 8, with scroll)

### Filtering
- Live filter as user types, matching against `holderName` and `accountNumber` (case-insensitive)
- Matched characters highlighted in gold (`text-primary font-bold`) inline within each row

### Dropdown Row Layout (RTL)
```
[ Initials Avatar ] [ holderName (highlighted) ]   [ balance + currency badge ]
                    [ accountNumber (mono, muted) ]
```
- Avatar: gold circle with first letter of `holderName`
- Balance: right-aligned, tabular-nums, gold color
- Currency: small badge

### Keyboard Navigation
| Key | Action |
|-----|--------|
| `↑` / `↓` | Move highlighted item up/down |
| `Enter` | Select highlighted item |
| `Escape` | Close dropdown, keep text |
| `Tab` | Close dropdown |

### Clear Button
- `✕` icon appears inside input when `search !== ''`
- Click resets search and closes dropdown

### Click Outside
- `useEffect` + `ref` on the container — closes dropdown when clicking outside

### Empty State
- Shows "لا توجد نتائج مطابقة" inside dropdown when no accounts match

---

## Integration: Accounts Page

**File:** `AccountsListSection.tsx`

- Combobox replaces the plain `<input>` in the search bar
- `onSelect` → `router.push('/accounts/${account.id}')` (navigate to account detail)
- Typing text without selecting still filters the table below (dual behavior: quick-jump via dropdown OR browse filtered table)
- Currency filter `<select>` remains unchanged
- Result count label remains

---

## Integration: Transfer Form

**File:** `AccountSelect.tsx`

- Combobox replaces the native `<select>` for both "من حساب" (from) and "إلى حساب" (to) fields
- `onSelect` sets the account in `TransferForm` state
- After selection, the input shows `holderName`; balance chip already rendered by parent — wiring only changes
- Currency auto-detection and same-currency validation remain unchanged

---

## Visual Design

- **Dropdown:** floating card, `rounded-xl border border-border bg-card shadow-lg`
- **Highlighted text:** `text-primary font-bold` (gold, consistent with app's `btn-gold` palette)
- **Avatar:** `w-8 h-8 rounded-full bg-primary/15 text-primary font-bold` with first letter
- **Scrollable list:** `max-h-64 overflow-y-auto`
- **Active row:** `bg-secondary` highlight on keyboard focus or hover
- **Input:** same border/ring styling as existing inputs in the app (`focus:ring-2 focus:ring-ring`)
- **RTL:** all text right-aligned, avatar on right side of row, consistent with `dir="rtl"` layout

---

## Out of Scope
- Server-side search / API call (dataset is ≤500 accounts, client-side is sufficient)
- Pagination inside the dropdown
- Multi-select
- Creating accounts from within the combobox

---

## Success Criteria
1. `AccountCombobox` renders correctly in both Accounts page and Transfer form
2. Typing filters results live; matched text is highlighted
3. Clicking a result on the Accounts page navigates to `/accounts/[id]`
4. Selecting a result in the Transfer form sets the from/to account correctly, currency auto-detects
5. Keyboard navigation (↑↓ Enter Esc) works in both contexts
6. UI is RTL-consistent and visually matches the app's light theme
