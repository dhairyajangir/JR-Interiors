"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import {
  updateProfile,
  saveAddress,
  deleteAddress,
  makeAddressDefault,
  logout,
} from "@/app/auth-actions";
import { INDIAN_STATES, PIN_PATTERN } from "@/lib/india";

const FIELD =
  "w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition";
const LABEL = "text-label-sm text-primary block mb-2";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button className="flex items-center gap-2 text-label-sm text-on-surface-variant hover:text-error transition">
        <Icon name="logout" className="text-[18px]" /> Sign out
      </button>
    </form>
  );
}

export function ProfileForm({
  fullName,
  email,
  phone,
}: {
  fullName: string;
  email: string;
  phone: string | null;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <form
      action={async (fd) => {
        await updateProfile(fd);
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL} htmlFor="fullName">Full name</label>
          <input id="fullName" name="fullName" defaultValue={fullName} className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" defaultValue={phone ?? ""} placeholder="(555) 000-0000" className={FIELD} />
        </div>
      </div>
      <div>
        <label className={LABEL}>Email</label>
        <input value={email} disabled className={`${FIELD} opacity-60 cursor-not-allowed`} />
      </div>
      <button className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-sm hover:opacity-90 transition inline-flex items-center gap-2">
        {saved ? (<><Icon name="check" className="text-[18px]" /> Saved</>) : "Save Changes"}
      </button>
    </form>
  );
}

export function AddressForm() {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-label-sm text-primary font-semibold border border-dashed border-outline-variant rounded-lg px-4 py-3 hover:bg-surface-container-low transition w-full justify-center">
        <Icon name="add" className="text-[18px]" /> Add a new address
      </button>
    );
  }
  return (
    <form
      action={async (fd) => {
        await saveAddress(fd);
        setOpen(false);
      }}
      className="bg-surface-container-low rounded-xl p-5 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL} htmlFor="label">Label</label>
          <input id="label" name="label" defaultValue="Home" className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="a_fullName">Recipient</label>
          <input id="a_fullName" name="fullName" required placeholder="Full name" className={FIELD} />
        </div>
      </div>
      <input name="line1" required placeholder="Flat / House no., Building, Street" className={FIELD} />
      <input name="line2" placeholder="Area, landmark (optional)" className={FIELD} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input name="city" required placeholder="City" className={FIELD} />
        <select name="region" required defaultValue="" className={FIELD}>
          <option value="" disabled>State</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input name="postalCode" required inputMode="numeric" pattern={PIN_PATTERN} maxLength={6} placeholder="PIN code" className={FIELD} />
      </div>
      <input type="hidden" name="country" value="India" />
      <input name="phone" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} placeholder="Mobile number (optional)" className={FIELD} />
      <label className="flex items-center gap-2 text-label-sm text-on-surface-variant cursor-pointer">
        <input type="checkbox" name="isDefault" className="text-primary focus:ring-primary rounded" />
        Set as default address
      </label>
      <div className="flex gap-3">
        <button className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-sm hover:opacity-90 transition">Save Address</button>
        <button type="button" onClick={() => setOpen(false)} className="px-6 py-3 rounded-lg font-label-sm text-on-surface-variant hover:bg-surface-container transition">Cancel</button>
      </div>
    </form>
  );
}

export function AddressActions({ id, isDefault }: { id: string; isDefault: boolean }) {
  return (
    <div className="flex items-center gap-4">
      {!isDefault && (
        <form action={makeAddressDefault}>
          <input type="hidden" name="id" value={id} />
          <button className="text-label-xs text-primary hover:underline">Set default</button>
        </form>
      )}
      <form action={deleteAddress}>
        <input type="hidden" name="id" value={id} />
        <button aria-label="Delete address" className="text-on-surface-variant hover:text-error transition">
          <Icon name="delete" className="text-[18px]" />
        </button>
      </form>
    </div>
  );
}
