import { spikeProtectedAction } from './actions';

// The form exists so the page carries the action ID that check-auth.ts calls (W1-3d).
export default function SpikeActionPage() {
  return (
    <main className="p-6">
      <form action={spikeProtectedAction as unknown as () => Promise<void>}>
        <button type="submit" className="rounded border px-3 py-1">
          Call protected action
        </button>
      </form>
    </main>
  );
}
