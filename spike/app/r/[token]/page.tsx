import { Suspense } from 'react';
import { connection } from 'next/server';
import { requireAdminForSpike } from '@/lib/auth';

// W1-6b: does a link opened from the phone's camera app carry the SameSite=Strict session cookie?
async function Status() {
  await connection();
  const signedIn = await requireAdminForSpike().then(
    () => true,
    () => false,
  );
  return <p>{signedIn ? 'Signed in: you would see the reservation' : 'Present this at our office'}</p>;
}

export default function QrLinkPage() {
  return (
    <main className="p-6">
      <Suspense fallback={null}>
        <Status />
      </Suspense>
    </main>
  );
}
