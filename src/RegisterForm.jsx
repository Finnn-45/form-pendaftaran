"use client"; // kalau dipakai di Next.js, untuk React client component

import { useState, useTransition, useOptimistic, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";

// ----------- API Submit----------- //
async function submitForm(prevState, formData) {
  const name = formData.get("name");
  const email = formData.get("email");

  if (!name || !email.includes("@")) {
    return { error: "Nama dan email valid harus diisi!" };
  }

  await new Promise((res) => setTimeout(res, 1500));

  return { success: true, user: { name, email } };
}

// ----------- Tombol Submit ----------- //
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Mengirim..." : "Daftar"}
    </button>
  );
}

// ----------- Formulir Utama ----------- //
export default function RegisterForm() {
  const [participants, setParticipants] = useState([]);

  // state validasi dengan useFormState
  const [state, formAction] = useFormState(submitForm, {});

  // transition untuk loading manual
  const [isPending, startTransition] = useTransition();

  // optimistic update daftar peserta
  const [optimisticParticipants, addOptimisticParticipant] = useOptimistic(
    participants,
    (state, newUser) => [...state, newUser]
  );

  // efek: kalau submit berhasil, update daftar peserta
  useEffect(() => {
    if (state?.success && state.user) {
      startTransition(() => {
        addOptimisticParticipant(state.user);
        setParticipants((prev) => [...prev, state.user]);
      });
    }
  }, [state, addOptimisticParticipant]);

  return (
    <section>
      <form action={formAction}>
        <input name="name" placeholder="Nama" />
        <input name="email" placeholder="Email" />
        <SubmitButton />
      </form>

      {state?.error && <p className="error">{state.error}</p>}
      {isPending && <p className="loading">⏳ Menyimpan data...</p>}

      <h3>Daftar Peserta</h3>
      <ul>
        {optimisticParticipants.map((p, idx) => (
          <li key={idx}>
            {p.name} ({p.email})
          </li>
        ))}
      </ul>
    </section>
  );
}
